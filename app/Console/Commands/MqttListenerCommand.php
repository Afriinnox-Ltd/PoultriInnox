<?php

namespace App\Console\Commands;

use App\Modules\BatchIncubator\Models\Incubator;
use App\Services\MqttService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class MqttListenerCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mqtt:listen {--device=* : Specific device IDs to listen to}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Listen to MQTT messages from IoT devices';

    protected MqttService $mqttService;

    /**
     * Track last relay state per device to avoid duplicate saves
     * Format: ['device_id' => 'ON|OFF']
     */
    protected array $lastRelayState = [];

    /**
     * Execute the console command.
     */
    public function handle(MqttService $mqttService): int
    {
        $this->mqttService = $mqttService;

        $this->info('Starting MQTT listener...');

        if (!$this->mqttService->connect()) {
            $this->error('Failed to connect to MQTT broker');
            return Command::FAILURE;
        }

        $this->info('Connected to MQTT broker: ' . config('mqtt.broker.host'));

        $deviceIds = $this->option('device');

        if (empty($deviceIds)) {
            // Subscribe to all devices
            $this->subscribeToAllDevices();
        } else {
            // Subscribe to specific devices
            foreach ($deviceIds as $deviceId) {
                $this->subscribeToDevice($deviceId);
            }
        }

        $this->info('Listening for messages... (Press Ctrl+C to stop)');

        // Keep the script running
        while (true) {
            try {
                $this->mqttService->loop(true);
                usleep(100000); // 100ms delay to prevent high CPU usage
            } catch (\Exception $e) {
                $this->error('Error in MQTT loop: ' . $e->getMessage());
                Log::error('MQTT Listener error', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);

                // Try to reconnect
                sleep(5);
                if (!$this->mqttService->connect()) {
                    $this->error('Failed to reconnect to MQTT broker');
                    return Command::FAILURE;
                }
            }
        }

        return Command::SUCCESS;
    }

    /**
     * Subscribe to all devices telemetry
     */
    protected function subscribeToAllDevices(): void
    {
        // Subscribe to Broodinnox data topic with wildcard for device ID
        // Pattern: broodinnox/{device_id}/data
        $dataTopic = str_replace('{device_id}', '+', config('mqtt.topics.data'));
        $this->mqttService->subscribe($dataTopic, function ($topic, $message) {
            $this->handleTelemetryMessage($topic, $message);
        });

        // Subscribe to Broodinnox status topic with wildcard
        // Pattern: broodinnox/{device_id}/status
        $statusTopic = str_replace('{device_id}', '+', config('mqtt.topics.status'));
        $this->mqttService->subscribe($statusTopic, function ($topic, $message) {
            $this->handleStatusMessage($topic, $message);
        });

        // Subscribe to discovery topic with wildcard
        // Pattern: broodinnox/{device_id}/discovery
        $discoveryTopic = str_replace('{device_id}', '+', config('mqtt.topics.discovery'));
        $this->mqttService->subscribe($discoveryTopic, function ($topic, $message) {
            $this->handleDiscoveryMessage($topic, $message);
        });

        $this->info('Subscribed to Broodinnox topics: +/data, +/status, +/discovery');
    }

    /**
     * Subscribe to specific device
     */
    protected function subscribeToDevice(string $deviceId): void
    {
        // Subscribe to device-specific data topic
        // Pattern: broodinnox/{DEVICE_ID}/data
        $dataTopic = str_replace('{device_id}', $deviceId, config('mqtt.topics.data'));
        $this->mqttService->subscribe($dataTopic, function ($topic, $message) {
            $this->handleTelemetryMessage($topic, $message);
        });

        // Subscribe to device-specific status topic
        $statusTopic = str_replace('{device_id}', $deviceId, config('mqtt.topics.status'));
        $this->mqttService->subscribe($statusTopic, function ($topic, $message) {
            $this->handleStatusMessage($topic, $message);
        });

        $this->info("Subscribed to device-specific topics for: {$deviceId}");
    }

    /**
     * Handle telemetry message from device (Broodinnox format)
     */
    protected function handleTelemetryMessage(string $topic, string $message): void
    {
        try {
            $data = json_decode($message, true);

            if (json_last_error() != JSON_ERROR_NONE) {
                $this->warn("Invalid JSON received: {$message}");
                return;
            }

            // Get device ID from data or extract from topic
            $deviceId = $data['device_id'] ?? $this->extractDeviceIdFromTopic($topic);

            $this->line("📊 Data from {$deviceId}:");
            $this->table(
                ['Field', 'Value'],
                collect($data)->map(fn($value, $key) => [$key, is_array($value) ? json_encode($value) : $value])->toArray()
            );

            // Process device data (Broodinnox style)
            $this->processDeviceData($deviceId, $data);

        } catch (\Exception $e) {
            $this->error("Error processing telemetry: {$e->getMessage()}");
            Log::error('MQTT Telemetry processing error', [
                'topic' => $topic,
                'message' => $message,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Process device data (adapted from Flask app)
     */
    protected function processDeviceData(string $deviceId, array $data): void
    {
        try {
            $incubator = Incubator::where('serial_number', $deviceId)
                ->orWhere(function ($query) use ($deviceId) {
                    $query->whereJsonContains('settings->device_id', $deviceId);
                })
                ->first();

            if (!$incubator) {
                Log::info('MQTT: No incubator found for device', ['device_id' => $deviceId]);
                return;
            }

            $sensors = $data['sensors'] ?? [];
            $temperature = $this->parseTemp($data['temperature'] ?? 0);

            // Update incubator current state
            $updateData = [];
            $sensorsData = $incubator->sensors_data ?? [];

            // Only save temperature reading every 60 seconds or when significant change (>0.5°C)
            $shouldSaveTemp = $this->shouldSaveTemperature($incubator, $temperature);

            if ($temperature != 'N/A' && $shouldSaveTemp) {
                $updateData['current_temperature'] = $temperature;

                // Store temperature reading in database
                \App\Models\IotTemperatureReading::create([
                    'device_id' => $deviceId,
                    'incubator_id' => $incubator->id,
                    'temperature' => $temperature,
                    'temp1' => $this->parseTemp($sensors['temp1'] ?? null),
                    'temp2' => $this->parseTemp($sensors['temp2'] ?? null),
                    'temp3' => $this->parseTemp($sensors['temp3'] ?? null),
                    'temp4' => $this->parseTemp($sensors['temp4'] ?? null),
                    'cycle_day' => $data['cycle_day'] ?? 0,
                    'total_days' => $data['total_days'] ?? 21,
                ]);
            } elseif ($temperature != 'N/A') {
                // Still update current temperature in incubator record
                $updateData['current_temperature'] = $temperature;
            }

            // Only store relay history when state CHANGES (not every message)
            if (isset($data['relay_status'])) {
                $currentRelayState = $data['relay_status'];
                $lastState = $this->lastRelayState[$deviceId] ?? null;

                // Save only if state changed
                if ($lastState != $currentRelayState) {
                    \App\Models\IotRelayHistory::create([
                        'device_id' => $deviceId,
                        'incubator_id' => $incubator->id,
                        'state' => $currentRelayState,
                        'mode' => $data['relay_mode'] ?? 'AUTO',
                        'temperature_at_switch' => $temperature != 'N/A' ? $temperature : null,
                    ]);

                    // Update last known state
                    $this->lastRelayState[$deviceId] = $currentRelayState;
                    $this->line("  → Relay state changed: {$lastState} → {$currentRelayState}");
                }
            }

            // Update sensors data
            $sensorsData['online'] = true;
            $sensorsData['last_update'] = now()->toIso8601String();
            $sensorsData['cycle_day'] = $data['cycle_day'] ?? 0;
            $sensorsData['total_days'] = $data['total_days'] ?? 21;
            $sensorsData['max_temp'] = $data['max_temp'] ?? 36;
            $sensorsData['min_temp'] = $data['min_temp'] ?? 32;
            $sensorsData['relay_status'] = $data['relay_status'] ?? 'OFF';
            $sensorsData['relay_mode'] = $data['relay_mode'] ?? 'AUTO';
            $sensorsData['error'] = $data['error'] ?? 'OK';

            $sensorsData['sensors'] = [
                'temp1' => $this->parseTemp($sensors['temp1'] ?? null),
                'temp2' => $this->parseTemp($sensors['temp2'] ?? null),
                'temp3' => $this->parseTemp($sensors['temp3'] ?? null),
                'temp4' => $this->parseTemp($sensors['temp4'] ?? null),
                's1_active' => (bool)($sensors['s1_active'] ?? false),
                's2_active' => (bool)($sensors['s2_active'] ?? false),
                's3_active' => (bool)($sensors['s3_active'] ?? false),
                's4_active' => (bool)($sensors['s4_active'] ?? false),
            ];

            $updateData['sensors_data'] = $sensorsData;

            // Update incubator
            $incubator->update($updateData);

            // Check for batch status and sync
            $this->checkAndSyncBatch($incubator, $data);

            // Check for alerts
            $this->checkAlerts($incubator, $data);

            $this->info("✓ Data processed: Day {$data['cycle_day']}/{$data['total_days']}, Temp: {$temperature}°C");

        } catch (\Exception $e) {
            $this->error("Failed to process device data: {$e->getMessage()}");
            Log::error('MQTT: Failed to process device data', [
                'device_id' => $deviceId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Parse temperature value safely (like Flask app)
     */
    protected function parseTemp($val)
    {
        if ($val== null || $val== 'NaN' || $val== 'null' || $val== 'inf' || $val== '-inf') {
            return 'N/A';
        }

        try {
            $temp = (float) $val;
            if ($temp >= -40 && $temp <= 85) {
                return $temp;
            }
            return 'N/A';
        } catch (\Exception $e) {
            return 'N/A';
        }
    }

    /**
     * Determine if temperature reading should be saved to database
     * Saves only if:
     * - 60+ seconds since last save OR
     * - Temperature changed by >0.5°C
     */
    protected function shouldSaveTemperature(Incubator $incubator, $currentTemp): bool
    {
        if ($currentTemp== 'N/A') {
            return false;
        }

        // Get last temperature reading for this incubator
        $lastReading = \App\Models\IotTemperatureReading::where('incubator_id', $incubator->id)
            ->latest()
            ->first();

        // No previous reading - save this one
        if (!$lastReading) {
            return true;
        }

        // Check time since last save (60 seconds threshold)
        $secondsSinceLastSave = now()->diffInSeconds($lastReading->created_at);
        if ($secondsSinceLastSave >= 60) {
            return true;
        }

        // Check temperature change (0.5°C threshold)
        $tempDiff = abs($currentTemp - $lastReading->temperature);
        if ($tempDiff >= 0.5) {
            return true;
        }

        return false;
    }

    /**
     * Check and sync current batch with device
     */
    protected function checkAndSyncBatch(Incubator $incubator, array $data): void
    {
        try {
            // Get active brooding batch for this incubator
            $activeBatch = Batch::where('incubator_id', $incubator->id)
                ->where('status', 'brooding')
                ->first();

            if (!$activeBatch) {
                $this->line("  ℹ️  No active batch for incubator #{$incubator->id}");
                return;
            }

            $cycleDay = $data['cycle_day'] ?? 0;
            $totalDays = $data['total_days'] ?? 21;
            $batchAgeDays = $activeBatch->age_days;
            $daysRemaining = $activeBatch->expected_completion_date
                ? now()->diffInDays($activeBatch->expected_completion_date, false)
                : null;

            $this->line("  📦 Active Batch: #{$activeBatch->id} ({$activeBatch->species})");
            $this->line("     Start: {$activeBatch->start_date->format('Y-m-d')} | Age: {$batchAgeDays} days");

            if ($activeBatch->expected_completion_date) {
                $this->line("     Expected End: {$activeBatch->expected_completion_date->format('Y-m-d')} | Days Remaining: {$daysRemaining}");

                // Check for batch completion alerts
                if ($daysRemaining != null) {
                    // Alert 3 days before completion
                    if ($daysRemaining <= 3 && $daysRemaining > 0) {
                        $this->addAlert(
                            $incubator->serial_number,
                            $incubator->id,
                            'BATCH_ENDING_SOON',
                            "Batch #{$activeBatch->id} will complete in {$daysRemaining} days (" . $activeBatch->expected_completion_date->format('Y-m-d') . ")",
                            'info'
                        );
                    }

                    // Alert on completion day
                    if ($daysRemaining == 0) {
                        $this->addAlert(
                            $incubator->serial_number,
                            $incubator->id,
                            'BATCH_COMPLETED',
                            "Batch #{$activeBatch->id} has reached its expected completion date! Ready for harvest.",
                            'warning'
                        );
                        $this->warn("  🎯 Batch #{$activeBatch->id} COMPLETED - Ready for harvest!");
                    }

                    // Alert if past completion date
                    if ($daysRemaining < 0) {
                        $this->addAlert(
                            $incubator->serial_number,
                            $incubator->id,
                            'BATCH_OVERDUE',
                            "Batch #{$activeBatch->id} is " . abs($daysRemaining) . " days past expected completion date",
                            'critical'
                        );
                        $this->error("  ⚠️  Batch #{$activeBatch->id} is OVERDUE by " . abs($daysRemaining) . " days!");
                    }
                }
            }

            // Check if device cycle_day is out of sync with batch age
            if ($cycleDay > 0 && abs($cycleDay - $batchAgeDays) > 1) {
                $this->warn("  ⚠️  Device cycle_day ({$cycleDay}) differs from batch age ({$batchAgeDays})");
                $this->addAlert(
                    $incubator->serial_number,
                    $incubator->id,
                    'BATCH_SYNC_MISMATCH',
                    "Device reports day {$cycleDay} but batch is {$batchAgeDays} days old",
                    'warning'
                );
            }

        } catch (\Exception $e) {
            Log::error('MQTT: Error checking batch status', [
                'error' => $e->getMessage(),
                'incubator_id' => $incubator->id,
            ]);
        }
    }

    /**
     * Check for alert conditions (like Flask app)
     */
    protected function checkAlerts(Incubator $incubator, array $data): void
    {
        try {
            $temp = $data['temperature'] ?? 0;

            if (!is_numeric($temp)) {
                return;
            }

            $maxTemp = $data['max_temp'] ?? $incubator->target_temperature ?? 36;
            $minTemp = $data['min_temp'] ?? ($incubator->target_temperature - 4) ?? 32;

            // High temperature alert
            if ($temp > $maxTemp + 2) {
                $this->addAlert(
                    $incubator->serial_number,
                    $incubator->id,
                    'HIGH_TEMP',
                    "Temperature {$temp}°C exceeds max {$maxTemp}°C",
                    'warning'
                );
            }

            // Low temperature alert
            if ($temp < $minTemp - 2) {
                $this->addAlert(
                    $incubator->serial_number,
                    $incubator->id,
                    'LOW_TEMP',
                    "Temperature {$temp}°C below min {$minTemp}°C",
                    'warning'
                );
            }

            // Device offline check (no data in last 2 minutes)
            $lastUpdate = $incubator->updated_at;
            if ($lastUpdate && now()->diffInMinutes($lastUpdate) > 2) {
                $this->addAlert(
                    $incubator->serial_number,
                    $incubator->id,
                    'OFFLINE',
                    "Device has not sent data in over 2 minutes",
                    'critical'
                );
            }

        } catch (\Exception $e) {
            Log::error('MQTT: Error checking alerts', [
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Add alert to database (like Flask app)
     */
    protected function addAlert(string $deviceId, int $incubatorId, string $alertType, string $message, string $severity): void
    {
        try {
            // Check if similar unresolved alert exists (avoid duplicates)
            $existingAlert = \App\Models\IotAlert::where('device_id', $deviceId)
                ->where('alert_type', $alertType)
                ->where('resolved', false)
                ->where('created_at', '>', now()->subMinutes(10))
                ->first();

            if ($existingAlert) {
                return; // Don't create duplicate alert
            }

            \App\Models\IotAlert::create([
                'device_id' => $deviceId,
                'incubator_id' => $incubatorId,
                'alert_type' => $alertType,
                'message' => $message,
                'severity' => $severity,
            ]);

            $this->warn("🚨 Alert: {$alertType} - {$message}");

            Log::info("MQTT Alert created", [
                'device_id' => $deviceId,
                'alert_type' => $alertType,
                'message' => $message,
                'severity' => $severity
            ]);

        } catch (\Exception $e) {
            Log::error('MQTT: Error adding alert', [
                'error' => $e->getMessage()
            ]);
        }
    }    /**
     * Handle status message from device
     */
    protected function handleStatusMessage(string $topic, string $message): void
    {
        try {
            $data = json_decode($message, true);
            $deviceId = $this->extractDeviceIdFromTopic($topic);

            $this->line("📡 Status from {$deviceId}: " . json_encode($data));

            Log::info('MQTT Device status received', [
                'device_id' => $deviceId,
                'status' => $data
            ]);

        } catch (\Exception $e) {
            $this->error("Error processing status: {$e->getMessage()}");
        }
    }

    /**
     * Handle response message from device
     */
    protected function handleResponseMessage(string $topic, string $message): void
    {
        try {
            $data = json_decode($message, true);
            $deviceId = $this->extractDeviceIdFromTopic($topic);

            $this->line("✅ Response from {$deviceId}: " . json_encode($data));

            Log::info('MQTT Device response received', [
                'device_id' => $deviceId,
                'response' => $data
            ]);

        } catch (\Exception $e) {
            $this->error("Error processing response: {$e->getMessage()}");
        }
    }

    /**
     * Extract device ID from MQTT topic
     */
    protected function extractDeviceIdFromTopic(string $topic): string
    {
        $parts = explode('/', $topic);
        // Topic format: broodinnox/{DEVICE_ID}/data or broodinnox/{DEVICE_ID}/status
        return $parts[1] ?? 'unknown';
    }

    /**
     * Handle discovery message from device
     */
    protected function handleDiscoveryMessage(string $topic, string $message): void
    {
        try {
            $data = json_decode($message, true);
            $deviceId = $this->extractDeviceIdFromTopic($topic);

            $this->line("🔍 Discovery from {$deviceId}:");
            $this->table(
                ['Field', 'Value'],
                collect($data)->map(fn($value, $key) => [$key, is_array($value) ? json_encode($value) : $value])->toArray()
            );

            Log::info('MQTT Device discovery received', [
                'device_id' => $deviceId,
                'data' => $data
            ]);

        } catch (\Exception $e) {
            $this->error("Error processing discovery: {$e->getMessage()}");
        }
    }

    /**
     * Update incubator from telemetry data
     */
    protected function updateIncubatorFromTelemetry(string $deviceId, array $data): void
    {
        try {
            $incubator = Incubator::where('serial_number', $deviceId)
                ->orWhere(function ($query) use ($deviceId) {
                    $query->whereJsonContains('settings->device_id', $deviceId);
                })
                ->first();

            if (!$incubator) {
                Log::info('MQTT: No incubator found for device', ['device_id' => $deviceId]);
                return;
            }

            // Extract sensor readings
            $temperature = $data['temp'] ?? $data['temperature'] ?? null;
            $humidity = $data['humidity'] ?? null;

            // Prepare update data
            $updateData = [];
            $sensorsDataUpdate = $incubator->sensors_data ?? [];

            if ($temperature != null) {
                $updateData['current_temperature'] = (float) $temperature;
                $sensorsDataUpdate['temperature'] = [
                    'value' => (float) $temperature,
                    'timestamp' => now()->toIso8601String(),
                ];
            }

            if ($humidity != null) {
                $updateData['current_humidity'] = (float) $humidity;
                $sensorsDataUpdate['humidity'] = [
                    'value' => (float) $humidity,
                    'timestamp' => now()->toIso8601String(),
                ];
            }

            // Store other sensor data
            foreach ($data as $key => $value) {
                if (!in_array($key, ['device', 'device_id', 'temp', 'temperature', 'humidity', 'timestamp'])) {
                    $sensorsDataUpdate[$key] = [
                        'value' => $value,
                        'timestamp' => now()->toIso8601String(),
                    ];
                }
            }

            // Store historical readings (keep last 100)
            $sensorsDataUpdate['history'] = $sensorsDataUpdate['history'] ?? [];
            $sensorsDataUpdate['history'][] = [
                'timestamp' => now()->toIso8601String(),
                'temperature' => $temperature,
                'humidity' => $humidity,
                'raw_data' => $data,
            ];

            if (count($sensorsDataUpdate['history']) > 100) {
                $sensorsDataUpdate['history'] = array_slice($sensorsDataUpdate['history'], -100);
            }

            $updateData['sensors_data'] = $sensorsDataUpdate;

            // Update the incubator
            $incubator->update($updateData);

            $this->info("✓ Updated incubator #{$incubator->id} ({$incubator->name})");

        } catch (\Exception $e) {
            $this->error("Failed to update incubator: {$e->getMessage()}");
            Log::error('MQTT: Failed to update incubator', [
                'device_id' => $deviceId,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Cleanup on shutdown
     */
    public function __destruct()
    {
        if (isset($this->mqttService)) {
            $this->mqttService->disconnect();
        }
    }
}
