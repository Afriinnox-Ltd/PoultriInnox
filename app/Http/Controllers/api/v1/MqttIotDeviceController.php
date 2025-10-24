<?php

namespace App\Http\Controllers\api\v1;

use App\Http\Controllers\Controller;
use App\Models\IotDeviceCommand;
use App\Modules\BatchIncubator\Models\Batch;
use App\Modules\BatchIncubator\Models\Incubator;
use App\Models\IotAlert;
use App\Models\IotTemperatureReading;
use App\Models\IotRelayHistory;
use App\Services\MqttService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class MqttIotDeviceController extends Controller
{
    protected MqttService $mqttService;

    public function __construct(MqttService $mqttService)
    {
        $this->mqttService = $mqttService;
    }

    /**
     * Send command to device via MQTT (POST /api/mqtt/commands)
     * Website uses this to control the device via MQTT
     */
    public function sendCommand(Request $request): JsonResponse
    {
        $request->validate([
            'device_id' => 'required|string',
            'command' => 'required|string',
            'value' => 'nullable',
        ]);

        $deviceId = $request->device_id;
        $command = $request->command;
        $value = $request->value;

        // Find incubator for this device
        $incubator = Incubator::where('serial_number', $deviceId)
            ->orWhere(function ($query) use ($deviceId) {
                $query->whereJsonContains('settings->device_id', $deviceId);
            })
            ->first();

        if (!$incubator) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Device not found',
            ], 404);
        }

        // Store command in database for tracking
        $commandRecord = IotDeviceCommand::create([
            'device_id' => $deviceId,
            'command' => $command,
            'value' => $value,
            'incubator_id' => $incubator->id,
        ]);

        // Send command via MQTT
        $success = $this->mqttService->sendDeviceCommand($deviceId, $command, $value);

        if ($success) {
            Log::info('MQTT Command sent successfully', [
                'device_id' => $deviceId,
                'command' => $command,
                'value' => $value,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Command sent via MQTT',
                'command' => [
                    'id' => $commandRecord->id,
                    'device_id' => $deviceId,
                    'command' => $command,
                    'value' => $value,
                    'protocol' => 'MQTT',
                    'created_at' => $commandRecord->created_at->toIso8601String(),
                ],
            ]);
        }

        return response()->json([
            'status' => 'fail',
            'message' => 'Failed to send command via MQTT',
        ], 500);
    }

    /**
     * Send configuration to device via MQTT (POST /api/mqtt/configure)
     */
    public function configureDevice(Request $request): JsonResponse
    {
        $request->validate([
            'device_id' => 'required|string',
            'incubator_id' => 'required|exists:incubators,id',
            'target_temperature' => 'nullable|numeric',
            'target_humidity' => 'nullable|numeric',
            'send_interval' => 'nullable|integer|min:5000|max:300000',
        ]);

        $deviceId = $request->device_id;
        $incubator = Incubator::findOrFail($request->incubator_id);

        // Prepare configuration
        $config = [
            'device_id' => $deviceId,
            'incubator_id' => $incubator->id,
            'incubator_name' => $incubator->name,
            'target_temperature' => $request->target_temperature ?? $incubator->target_temperature,
            'target_humidity' => $request->target_humidity ?? $incubator->target_humidity,
            'intervals' => [
                'send_interval' => $request->send_interval ?? 30000, // Default 30 seconds
            ],
        ];

        // Update incubator settings
        $settings = $incubator->settings ?? [];
        $settings['device_id'] = $deviceId;
        $settings['mqtt_config'] = $config;

        $incubator->update([
            'serial_number' => $deviceId,
            'settings' => $settings,
        ]);

        // Send config via MQTT
        $success = $this->mqttService->sendDeviceConfig($deviceId, $config);

        if ($success) {
            return response()->json([
                'status' => 'success',
                'message' => 'Configuration sent via MQTT',
                'configuration' => $config,
                'protocol' => 'MQTT',
            ]);
        }

        return response()->json([
            'status' => 'fail',
            'message' => 'Failed to send configuration via MQTT',
        ], 500);
    }

    /**
     * Get device status (GET /api/mqtt/device/status)
     * Returns the current state of the device from database
     */
    public function getDeviceStatus(Request $request): JsonResponse
    {
        $deviceId = $request->query('device_id');

        if (!$deviceId) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Device ID required',
            ], 400);
        }

        // Find incubator by device ID
        $incubator = Incubator::where('serial_number', $deviceId)
            ->orWhere(function ($query) use ($deviceId) {
                $query->whereJsonContains('settings->device_id', $deviceId);
            })
            ->first();

        if (!$incubator) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Device not found',
            ], 404);
        }

        $currentBatch = Batch::where('incubator_id', $incubator->id)
            ->where('status', 'brooding')
            ->first();

        return response()->json([
            'status' => 'success',
            'device_id' => $deviceId,
            'incubator' => [
                'id' => $incubator->id,
                'name' => $incubator->name,
                'model' => $incubator->model,
                'status' => $incubator->status,
            ],
            'current_batch' => $currentBatch,
            'sensors' => [
                'temperature' => $incubator->current_temperature,
                'humidity' => $incubator->current_humidity,
                'target_temperature' => $incubator->target_temperature,
                'target_humidity' => $incubator->target_humidity,
            ],
            'sensors_data' => $incubator->sensors_data,
            'last_updated' => $incubator->updated_at->toIso8601String(),
            'protocol' => 'MQTT',
        ]);
    }

    /**
     * Link device to incubator (POST /api/mqtt/device/link)
     */
    public function linkDevice(Request $request): JsonResponse
    {
        $request->validate([
            'device_id' => 'required|string',
            'incubator_id' => 'required|exists:incubators,id',
        ]);

        try {
            $incubator = Incubator::findOrFail($request->incubator_id);

            // Update incubator settings with device ID
            $settings = $incubator->settings ?? [];
            $settings['device_id'] = $request->device_id;
            $settings['communication_protocol'] = 'MQTT';

            $incubator->update([
                'serial_number' => $request->device_id,
                'settings' => $settings,
            ]);

            // Send initial config to device via MQTT
            $config = [
                'device_id' => $request->device_id,
                'incubator_id' => $incubator->id,
                'incubator_name' => $incubator->name,
                'target_temperature' => $incubator->target_temperature,
                'target_humidity' => $incubator->target_humidity,
            ];

            $this->mqttService->sendDeviceConfig($request->device_id, $config);

            return response()->json([
                'status' => 'success',
                'message' => 'Device linked to incubator successfully via MQTT',
                'incubator' => [
                    'id' => $incubator->id,
                    'name' => $incubator->name,
                    'device_id' => $request->device_id,
                ],
                'protocol' => 'MQTT',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Failed to link device to incubator',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get MQTT broker connection info for frontend (GET /api/mqtt/broker)
     */
    public function getBrokerInfo(): JsonResponse
    {
        $config = config('mqtt');

        // Auto-detect protocol based on current request (if HTTPS, use WSS)
        $isSecure = request()->secure();
        $protocol = $isSecure ? 'wss' : 'ws';

        // Allow override from config if explicitly set
        if (!empty($config['websocket']['protocol'])) {
            $protocol = $config['websocket']['protocol'];
        }

        // Use different ports for ws vs wss (Mosquitto: 8080 for ws, 8081 for wss)
        $port = $config['websocket']['port'] ?? 8080;
        if ($protocol === 'wss' && $port === 8080) {
            $port = 8081; // Switch to secure WebSocket port
        }

        // WebSocket path for Mosquitto test broker
        $path = $config['websocket']['path'] ?? '/mqtt';

        return response()->json([
            'status' => 'success',
            'broker' => [
                'host' => $config['broker']['host'],
                'port' => $port,
                'protocol' => $protocol,
                'path' => $path,
                'username' => $config['broker']['username'],
                // Don't send password to frontend
                'use_credentials' => !empty($config['broker']['username']),
            ],
            'topics' => [
                'prefix' => $config['topics']['prefix'],
                'data' => $config['topics']['data'],
                'status' => $config['topics']['status'],
                'relay' => $config['topics']['relay'],
                'max_temp' => $config['topics']['max_temp'],
                'min_temp' => $config['topics']['min_temp'],
                'total_days' => $config['topics']['total_days'],
                'sensor' => $config['topics']['sensor'],
            ],
        ]);
    }

    /**
     * Test MQTT connection (GET /api/mqtt/test)
     */
    public function testConnection(): JsonResponse
    {
        try {
            $connected = $this->mqttService->connect();

            if ($connected) {
                $this->mqttService->disconnect();

                return response()->json([
                    'status' => 'success',
                    'message' => 'MQTT connection successful',
                    'broker' => config('mqtt.broker.host'),
                ]);
            }

            return response()->json([
                'status' => 'fail',
                'message' => 'Failed to connect to MQTT broker',
            ], 500);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'MQTT connection error',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Control relay mode (POST /api/mqtt/control/relay)
     * Flask-style endpoint: /control/relay
     * Body: {"device_id": "ESP32_xxx", "command": "ON"|"OFF"|"AUTO"}
     */
    public function controlRelay(Request $request): JsonResponse
    {
        $request->validate([
            'device_id' => 'required|string',
            'command' => 'required|in:ON,OFF,AUTO',
        ]);

        try {
            $deviceId = $request->input('device_id');
            $command = $request->input('command');

            // Publish to broodinnox/{DEVICE_ID}/control/relay topic
            // ESP32 expects just the command string: "ON", "OFF", or "AUTO"
            $topic = str_replace('{device_id}', $deviceId, config('mqtt.topics.relay'));
            $message = $command; // Send plain string, not JSON

            $this->mqttService->publish($topic, $message);

            Log::info('MQTT relay control sent', [
                'device_id' => $deviceId,
                'command' => $command,
                'topic' => $topic,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => "Relay command '{$command}' sent to device",
                'device_id' => $deviceId,
                'command' => $command,
            ]);
        } catch (\Throwable $e) {
            Log::error('MQTT relay control failed', [
                'error' => $e->getMessage(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to send relay command',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update device settings (POST /api/mqtt/control/setting)
     * Flask-style endpoint: /control/setting
     * Body: {"device_id": "ESP32_xxx", "setting": "max_temp|min_temp|total_days|sensor", "value": 36}
     *
     * For sensor: value format should be "1:ON" or "2:OFF" (sensor number : state)
     */
    public function updateSetting(Request $request): JsonResponse
    {
        $request->validate([
            'device_id' => 'required|string',
            'setting' => 'required|in:max_temp,min_temp,total_days,sensor',
            'value' => 'required',
        ]);

        try {
            $deviceId = $request->input('device_id');
            $setting = $request->input('setting');
            $value = $request->input('value');

            // Get topic based on setting with device ID
            $topicMap = [
                'max_temp' => config('mqtt.topics.max_temp'),
                'min_temp' => config('mqtt.topics.min_temp'),
                'total_days' => config('mqtt.topics.total_days'),
                'sensor' => config('mqtt.topics.sensor'),
            ];

            $topic = str_replace('{device_id}', $deviceId, $topicMap[$setting]);

            // ESP32 expects plain string/number, not JSON
            // For temperature/days: send just the number (e.g., "36", "32", "21")
            // For sensor: send format "1:ON" or "2:OFF"
            $message = (string) $value;

            $this->mqttService->publish($topic, $message);

            // Update incubator settings in database
            $incubator = Incubator::where('serial_number', $deviceId)->first();
            if ($incubator) {
                $sensorsData = $incubator->sensors_data ?? [];
                $sensorsData[$setting] = $value;
                $incubator->update(['sensors_data' => $sensorsData]);
            }

            Log::info('MQTT setting update sent', [
                'device_id' => $deviceId,
                'setting' => $setting,
                'value' => $value,
                'topic' => $topic,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => "Setting '{$setting}' updated to '{$value}'",
                'device_id' => $deviceId,
                'setting' => $setting,
                'value' => $value,
            ]);
        } catch (\Throwable $e) {
            Log::error('MQTT setting update failed', [
                'error' => $e->getMessage(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update setting',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get device status (GET /api/mqtt/status/{device_id})
     * Flask-style endpoint: /status
     */
    public function getStatus(string $deviceId): JsonResponse
    {
        try {
            $incubator = Incubator::where('serial_number', $deviceId)->first();

            if (!$incubator) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Device not found',
                ], 404);
            }

            $sensorsData = $incubator->sensors_data ?? [];
            $sensors = $sensorsData['sensors'] ?? [];

            return response()->json([
                'status' => 'success',
                'device_id' => $deviceId,
                'data' => [
                    'temperature' => $incubator->current_temperature ?? 0,
                    'sensors' => [
                        'temp1' => $sensors['temp1'] ?? 'N/A',
                        'temp2' => $sensors['temp2'] ?? 'N/A',
                        'temp3' => $sensors['temp3'] ?? 'N/A',
                        'temp4' => $sensors['temp4'] ?? 'N/A',
                        's1_active' => $sensors['s1_active'] ?? false,
                        's2_active' => $sensors['s2_active'] ?? false,
                        's3_active' => $sensors['s3_active'] ?? false,
                        's4_active' => $sensors['s4_active'] ?? false,
                    ],
                    'cycle_day' => $sensorsData['cycle_day'] ?? 0,
                    'total_days' => $sensorsData['total_days'] ?? 21,
                    'max_temp' => $sensorsData['max_temp'] ?? 36,
                    'min_temp' => $sensorsData['min_temp'] ?? 32,
                    'relay_status' => $sensorsData['relay_status'] ?? 'OFF',
                    'relay_mode' => $sensorsData['relay_mode'] ?? 'AUTO',
                    'error' => $sensorsData['error'] ?? 'OK',
                    'online' => $sensorsData['online'] ?? false,
                    'last_update' => $sensorsData['last_update'] ?? null,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve device status',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get analytics (GET /api/mqtt/analytics/{device_id})
     * Flask-style endpoint: /analytics
     * Returns 24-hour statistics
     */
    public function getAnalytics(string $deviceId): JsonResponse
    {
        try {
            $incubator = Incubator::where('serial_number', $deviceId)->first();

            if (!$incubator) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Device not found',
                ], 404);
            }

            // Get readings from last 24 hours
            $readings = IotTemperatureReading::where('device_id', $deviceId)
                ->where('created_at', '>', Carbon::now()->subDay())
                ->get();

            $temperatures = $readings->pluck('temperature')->filter(fn($t) => is_numeric($t));

            // Get relay history from last 24 hours
            $relayHistory = IotRelayHistory::where('device_id', $deviceId)
                ->where('created_at', '>', Carbon::now()->subDay())
                ->get();

            $runtime = $relayHistory->where('state', 'ON')
                ->sum(function ($history) {
                    $nextOff = IotRelayHistory::where('device_id', $history->device_id)
                        ->where('state', 'OFF')
                        ->where('created_at', '>', $history->created_at)
                        ->first();

                    if ($nextOff) {
                        return $history->created_at->diffInSeconds($nextOff->created_at);
                    }
                    return 0;
                });

            return response()->json([
                'status' => 'success',
                'device_id' => $deviceId,
                'analytics' => [
                    'last_24h' => [
                        'avg_temp' => $temperatures->avg() ?? 0,
                        'max_temp' => $temperatures->max() ?? 0,
                        'min_temp' => $temperatures->min() ?? 0,
                        'readings_count' => $readings->count(),
                        'relay_runtime_seconds' => $runtime,
                        'relay_runtime_hours' => round($runtime / 3600, 2),
                        'relay_cycles' => $relayHistory->count(),
                    ],
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve analytics',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get alerts (GET /api/mqtt/alerts/{device_id})
     * Flask-style endpoint: /alerts
     */
    public function getAlerts(string $deviceId, Request $request): JsonResponse
    {
        try {
            $query = IotAlert::where('device_id', $deviceId);

            // Filter by resolved status
            if ($request->has('resolved')) {
                $query->where('resolved', $request->boolean('resolved'));
            }

            // Filter by severity
            if ($request->has('severity')) {
                $query->where('severity', $request->input('severity'));
            }

            $alerts = $query->orderBy('created_at', 'desc')
                ->limit(50)
                ->get();

            return response()->json([
                'status' => 'success',
                'device_id' => $deviceId,
                'alerts' => $alerts,
                'unresolved_count' => IotAlert::where('device_id', $deviceId)
                    ->where('resolved', false)
                    ->count(),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve alerts',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Clear/resolve alerts (POST /api/mqtt/alerts/clear)
     * Flask-style endpoint: /alerts/clear
     * Body: {"device_id": "ESP32_xxx", "alert_ids": [1,2,3]} or {"device_id": "ESP32_xxx", "all": true}
     */
    public function clearAlerts(Request $request): JsonResponse
    {
        $request->validate([
            'device_id' => 'required|string',
        ]);

        try {
            $deviceId = $request->input('device_id');

            if ($request->boolean('all')) {
                // Clear all unresolved alerts
                $count = IotAlert::where('device_id', $deviceId)
                    ->where('resolved', false)
                    ->update([
                        'resolved' => true,
                        'resolved_at' => now(),
                    ]);

                return response()->json([
                    'status' => 'success',
                    'message' => "Cleared {$count} alerts",
                    'cleared_count' => $count,
                ]);
            }

            if ($request->has('alert_ids')) {
                // Clear specific alerts
                $alertIds = $request->input('alert_ids');
                $count = IotAlert::where('device_id', $deviceId)
                    ->whereIn('id', $alertIds)
                    ->update([
                        'resolved' => true,
                        'resolved_at' => now(),
                    ]);

                return response()->json([
                    'status' => 'success',
                    'message' => "Cleared {$count} alerts",
                    'cleared_count' => $count,
                ]);
            }

            return response()->json([
                'status' => 'error',
                'message' => 'Either provide alert_ids or set all=true',
            ], 400);
        } catch (\Throwable $e) {
            Log::error('MQTT clear alerts failed', [
                'error' => $e->getMessage(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to clear alerts',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Sync real-time MQTT data with database (POST /api/mqtt/sync/{deviceId})
     * Updates incubator record with latest sensor data from MQTT
     * Also syncs with active batch data
     */
    public function syncWithDatabase(Request $request, string $deviceId): JsonResponse
    {
        try {
            // Find incubator for this device
            $incubator = Incubator::where('serial_number', $deviceId)
                ->orWhere(function ($query) use ($deviceId) {
                    $query->whereJsonContains('settings->device_id', $deviceId);
                })
                ->first();

            if (!$incubator) {
                return response()->json([
                    'status' => 'fail',
                    'message' => 'Incubator not found for device: ' . $deviceId,
                ], 404);
            }

            // Extract data from request
            $temperature = $request->input('temperature');
            $sensors = $request->input('sensors', []);
            $cycleDay = $request->input('cycle_day');
            $totalDays = $request->input('total_days');
            $maxTemp = $request->input('max_temp');
            $minTemp = $request->input('min_temp');
            $relayStatus = $request->input('relay_status');
            $relayMode = $request->input('relay_mode');

            // Prepare sensors_data JSON
            $sensorsData = $incubator->sensors_data ?? [];
            $sensorsData['online'] = true;
            $sensorsData['last_update'] = now()->toIso8601String();
            $sensorsData['cycle_day'] = $cycleDay;
            $sensorsData['total_days'] = $totalDays;
            $sensorsData['max_temp'] = $maxTemp;
            $sensorsData['min_temp'] = $minTemp;
            $sensorsData['relay_status'] = $relayStatus;
            $sensorsData['relay_mode'] = $relayMode;
            $sensorsData['sensors'] = $sensors;

            // Update incubator record
            $updateData = [
                'sensors_data' => $sensorsData,
            ];

            // Update current_temperature if valid
            if (is_numeric($temperature) && $temperature >= -40 && $temperature <= 85) {
                $updateData['current_temperature'] = $temperature;
            }

            // Sync target_temperature with max_temp from device
            if (is_numeric($maxTemp) && $maxTemp >= 0 && $maxTemp <= 60) {
                $updateData['target_temperature'] = $maxTemp;
            }

            $incubator->update($updateData);

            // Sync with active batch if exists
            $activeBatch = Batch::where('incubator_id', $incubator->id)
                ->where('status', 'brooding')
                ->first();

            if ($activeBatch) {
                $batchUpdates = [];

                // Update batch start_date based on device cycle_day
                // If device says we're on day 26, start_date should be 26 days ago
                // BUT: Don't override if recently changed from web interface (2 minute grace period)
                if (is_numeric($cycleDay) && $cycleDay > 0) {
                    $lastStartDateUpdate = Cache::get("batch:{$activeBatch->id}:last_start_date_update");
                    $gracePeriodExpired = !$lastStartDateUpdate || now()->diffInSeconds($lastStartDateUpdate) > 120;

                    if ($gracePeriodExpired) {
                        $calculatedStartDate = now()->subDays($cycleDay)->startOfDay();

                        // Only update if the calculated date is different from current start_date
                        if (!$activeBatch->start_date ||
                            $activeBatch->start_date->toDateString() !== $calculatedStartDate->toDateString()) {

                            $batchUpdates['start_date'] = $calculatedStartDate;

                            Log::info('MQTT: Updated batch start_date from device', [
                                'batch_id' => $activeBatch->id,
                                'device_id' => $deviceId,
                                'device_cycle_day' => $cycleDay,
                                'new_start_date' => $calculatedStartDate->toDateString(),
                                'old_start_date' => $activeBatch->start_date ? $activeBatch->start_date->toDateString() : null,
                            ]);
                        }
                    } else {
                        Log::debug('MQTT: Skipping start_date update (recently changed from web)', [
                            'batch_id' => $activeBatch->id,
                            'seconds_since_update' => now()->diffInSeconds($lastStartDateUpdate),
                        ]);
                    }
                } else {
                    Log::warning('MQTT: Invalid cycle_day from device', [
                        'device_id' => $deviceId,
                        'cycle_day' => $cycleDay,
                        'batch_id' => $activeBatch->id,
                    ]);
                }

                // Update expected_completion_date based on device total_days
                // If device says total is 30 days and we're on day 26, completion is in 4 days
                // BUT: Don't override if recently changed from web interface (wait for device to sync)
                if (is_numeric($totalDays) && $totalDays > 0 && is_numeric($cycleDay) && $cycleDay > 0) {
                    $lastCompletionDateUpdate = Cache::get("batch:{$activeBatch->id}:last_completion_date_update");
                    $expectedTotalDays = Cache::get("batch:{$activeBatch->id}:expected_total_days");

                    // Check if device has synced with the new total_days value
                    $deviceSynced = !$expectedTotalDays || abs($totalDays - $expectedTotalDays) <= 1;
                    $gracePeriodExpired = !$lastCompletionDateUpdate || now()->diffInSeconds($lastCompletionDateUpdate) > 120;

                    // Only allow update if: grace period expired AND device is synced
                    if ($gracePeriodExpired && $deviceSynced) {
                        $remainingDays = $totalDays - $cycleDay;
                        $calculatedCompletionDate = now()->addDays($remainingDays)->startOfDay();

                        // Only update if different from current expected_completion_date
                        if (!$activeBatch->expected_completion_date ||
                            $activeBatch->expected_completion_date->toDateString() !== $calculatedCompletionDate->toDateString()) {

                            $batchUpdates['expected_completion_date'] = $calculatedCompletionDate;

                            Log::info('MQTT: Updated batch expected_completion_date from device', [
                                'batch_id' => $activeBatch->id,
                                'device_id' => $deviceId,
                                'device_cycle_day' => $cycleDay,
                                'device_total_days' => $totalDays,
                                'remaining_days' => $remainingDays,
                                'new_completion_date' => $calculatedCompletionDate->toDateString(),
                                'old_completion_date' => $activeBatch->expected_completion_date ? $activeBatch->expected_completion_date->toDateString() : null,
                            ]);
                        }
                    } else {
                        Log::debug('MQTT: Skipping completion_date update (waiting for device sync)', [
                            'batch_id' => $activeBatch->id,
                            'seconds_since_update' => $lastCompletionDateUpdate ? now()->diffInSeconds($lastCompletionDateUpdate) : 0,
                            'device_total_days' => $totalDays,
                            'expected_total_days' => $expectedTotalDays,
                            'device_synced' => $deviceSynced,
                            'grace_period_expired' => $gracePeriodExpired,
                        ]);
                    }
                } else {
                    Log::warning('MQTT: Invalid total_days or cycle_day from device', [
                        'device_id' => $deviceId,
                        'total_days' => $totalDays,
                        'cycle_day' => $cycleDay,
                        'batch_id' => $activeBatch->id,
                    ]);
                }

                // Apply batch updates if any
                if (!empty($batchUpdates)) {
                    try {
                        $activeBatch->update($batchUpdates);
                        Log::info('MQTT: Batch updates applied successfully', [
                            'batch_id' => $activeBatch->id,
                            'updates' => array_keys($batchUpdates),
                        ]);
                    } catch (\Throwable $e) {
                        Log::error('MQTT: Failed to update batch', [
                            'batch_id' => $activeBatch->id,
                            'error' => $e->getMessage(),
                            'updates' => $batchUpdates,
                        ]);
                    }
                }

                // Refresh to get updated values
                $activeBatch->refresh();
                $batchCurrentDay = $activeBatch->age_days;

                Log::debug('MQTT: Synced with active batch', [
                    'batch_id' => $activeBatch->id,
                    'batch_start_date' => $activeBatch->start_date->toDateString(),
                    'calculated_age_days' => $batchCurrentDay,
                    'expected_completion_date' => $activeBatch->expected_completion_date ? $activeBatch->expected_completion_date->toDateString() : null,
                    'device_cycle_day' => $cycleDay,
                    'device_total_days' => $totalDays,
                ]);
            } else {
                Log::debug('MQTT: No active batch found for incubator', [
                    'device_id' => $deviceId,
                    'incubator_id' => $incubator->id,
                ]);
            }            Log::debug('MQTT: Synced data to database', [
                'device_id' => $deviceId,
                'incubator_id' => $incubator->id,
                'temperature' => $temperature,
                'target_temperature' => $updateData['target_temperature'] ?? null,
                'active_batch' => $activeBatch ? $activeBatch->id : null,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Data synced successfully',
                'incubator' => [
                    'id' => $incubator->id,
                    'current_temperature' => $incubator->current_temperature,
                    'target_temperature' => $incubator->target_temperature,
                    'last_update' => $sensorsData['last_update'],
                ],
                'active_batch' => $activeBatch ? [
                    'id' => $activeBatch->id,
                    'current_day' => $activeBatch->age_days, // Use age_days accessor
                    'total_days' => $activeBatch->expected_days ?? 21,
                    'start_date' => $activeBatch->start_date->toDateString(),
                    'brooding_start_date' => $activeBatch->start_date->toDateString(),
                    'expected_completion_date' => $activeBatch->expected_completion_date ? $activeBatch->expected_completion_date->toDateString() : null,
                    'days_remaining' => $activeBatch->expected_completion_date ? now()->diffInDays($activeBatch->expected_completion_date, false) : null,
                    'is_completed' => $activeBatch->expected_completion_date ? now()->gte($activeBatch->expected_completion_date) : false,
                    'species' => $activeBatch->species ?? 'Unknown',
                    'quantity' => $activeBatch->quantity ?? 0,
                ] : null,
            ]);
        } catch (\Throwable $e) {
            Log::error('MQTT sync failed', [
                'device_id' => $deviceId,
                'error' => $e->getMessage(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to sync data',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update incubator connection status
     */
    public function updateConnectionStatus(Request $request): JsonResponse
    {
        $request->validate([
            'device_id' => 'required|string',
            'connected' => 'required|boolean',
        ]);

        try {
            $deviceId = $request->device_id;
            $connected = $request->connected;

            // Find incubator
            $incubator = Incubator::where('serial_number', $deviceId)->first();

            if (!$incubator) {
                return response()->json([
                    'status' => 'fail',
                    'message' => 'Incubator not found for device: ' . $deviceId,
                ], 404);
            }

            // Update status based on connection
            $newStatus = $connected
                ? \App\Modules\BatchIncubator\Enums\IncubatorStatus::RUNNING
                : \App\Modules\BatchIncubator\Enums\IncubatorStatus::OFFLINE;

            $incubator->update([
                'status' => $newStatus,
            ]);

            Log::info('Incubator connection status updated', [
                'device_id' => $deviceId,
                'incubator_id' => $incubator->id,
                'connected' => $connected,
                'status' => $newStatus->value,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => $connected ? 'Incubator status updated to Running' : 'Incubator status updated to Offline',
                'incubator' => [
                    'id' => $incubator->id,
                    'name' => $incubator->name,
                    'status' => [
                        'value' => $newStatus->value,
                        'label' => $newStatus->label(),
                        'color' => $newStatus->color(),
                    ],
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to update incubator connection status', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update connection status',
            ], 500);
        }
    }
}

