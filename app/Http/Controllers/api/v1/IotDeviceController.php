<?php

namespace App\Http\Controllers\api\v1;

use App\Http\Controllers\Controller;
use App\Models\IotDeviceCommand;
use App\Modules\BatchIncubator\Models\Batch;
use App\Modules\BatchIncubator\Models\Incubator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class IotDeviceController extends Controller
{
    /**
     * Receive data from IoT device (POST /api/send)
     */
    public function receive(Request $request): JsonResponse
    {
        $deviceId = $request->query('device');

        $content = $request->json()->all();
        Log::debug('Received JSON content', ['content' => $content]);
        if (empty($content)) {
            $raw = $request->getContent();
            $decoded = json_decode($raw, true);
            if (json_last_error()== JSON_ERROR_NONE && is_array($decoded)) {
                $content = $decoded;
            } else {
                $content = $request->all();
            }
        }

        Log::info('Received data from device', [
            'device_id' => $deviceId,
            'content' => $content,
        ]);

        if (empty($content) || ! is_array($content)) {
            return response()->json([
                'status' => 'fail',
                'message' => 'No JSON received',
            ], 400);
        }

        $deviceId = $content['device'] ?? $request->header('X-Device-Id') ?? 'unknown';

        // Update incubator if device is linked to one
        $incubator = $this->updateIncubatorFromSensorData($deviceId, $content);

        return response()->json([
            'status' => 'success',
            'received' => array_merge($content, [
                'device' => $deviceId,
                'received_at' => now()->toIso8601String(),
            ]),
            'incubator_updated' => $incubator != null,
        ]);
    }

    /**
     * Return last data (GET /api/data) or data for a specific device (?device=ID)
     */
    public function data(Request $request): JsonResponse
    {
        $deviceId = $request->query('device');

        // Find incubator by device ID
        $incubator = Incubator::where('serial_number', $deviceId)
            ->orWhere(function ($query) use ($deviceId) {
                $query->whereJsonContains('settings->device_id', $deviceId);
            })
            ->first();

            Log::info('Fetching device data', ['device_id' => $deviceId,
            'current_batch' => $incubator->current_batch]);
        if (! $incubator) {
            return response()->json([
                'status' => 'fail',
                'message' => 'No incubator found for this device',
            ], 404);
        }

        $currentBatch = Batch::where('incubator_id', $incubator->id)->where('status','brooding')->first();


        Log::info('Sending device data', ['incubator_data' => $currentBatch]);

        return response()->json([
            'device' => $deviceId,
            'incubator_id' => $incubator->id,
            'incubator_name' => $incubator->name,
            'current_batch' => $currentBatch,
            'current_temperature' => $incubator->current_temperature,
            'current_humidity' => $incubator->current_humidity,
            'target_temperature' => $incubator->target_temperature,
            'target_humidity' => $incubator->target_humidity,
            'sensors_data' => $incubator->sensors_data,
            'updated_at' => $incubator->updated_at,
        ]);

    }

    /**
     * Link a device to an incubator (POST /api/incubator/link)
     */
    public function linkIncubator(Request $request): JsonResponse
    {
        $request->validate([
            'incubator_id' => 'required|exists:incubators,id',
            'device_id' => 'required|string',
        ]);

        try {
            $incubator = Incubator::findOrFail($request->incubator_id);

            // Update incubator settings with device ID
            $settings = $incubator->settings ?? [];
            $settings['device_id'] = $request->device_id;

            $incubator->update([
                'serial_number' => $request->device_id,
                'settings' => $settings,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Device linked to incubator successfully',
                'incubator' => [
                    'id' => $incubator->id,
                    'name' => $incubator->name,
                    'device_id' => $request->device_id,
                ],
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
     * Configure WiFi and device settings (POST /api/incubator/configure)
     * Store WiFi credentials and other settings for the device
     */
    public function configureDevice(Request $request): JsonResponse
    {
        $request->validate([
            'incubator_id' => 'required|exists:incubators,id',
            'device_id' => 'required|string',
            'wifi_ssid' => 'required|string',
            'wifi_password' => 'required|string',
            'api_url' => 'nullable|url',
            'send_interval' => 'nullable|integer|min:5000|max:300000', // 5 seconds to 5 minutes
            'command_check_interval' => 'nullable|integer|min:5000|max:60000', // 5 seconds to 1 minute
        ]);

        try {
            $incubator = Incubator::findOrFail($request->incubator_id);

            // Update incubator settings with WiFi and device config
            $settings = $incubator->settings ?? [];
            $settings['device_id'] = $request->device_id;
            $settings['wifi'] = [
                'ssid' => $request->wifi_ssid,
                'password' => encrypt($request->wifi_password), // Encrypt the password
            ];
            $settings['api_url'] = $request->api_url ?? url('/api');
            $settings['intervals'] = [
                'send_interval' => $request->send_interval ?? 30000, // Default 30 seconds
                'command_check_interval' => $request->command_check_interval ?? 10000, // Default 10 seconds
            ];

            $incubator->update([
                'serial_number' => $request->device_id,
                'settings' => $settings,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Device configuration saved successfully',
                'configuration' => [
                    'device_id' => $request->device_id,
                    'wifi_ssid' => $request->wifi_ssid,
                    'api_url' => $settings['api_url'],
                    'send_interval' => $settings['intervals']['send_interval'],
                    'command_check_interval' => $settings['intervals']['command_check_interval'],
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Failed to configure device',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get device configuration (GET /api/device/config?device=DEVICE_ID)
     * Device calls this on startup to get WiFi credentials and settings
     */
    public function getDeviceConfig(Request $request): JsonResponse
    {
        $deviceId = $request->query('device');

        if (! $deviceId) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Device ID required',
            ], 400);
        }

        try {
            // Find incubator by device ID
            $incubator = Incubator::where('serial_number', $deviceId)
                ->orWhere(function ($query) use ($deviceId) {
                    $query->whereJsonContains('settings->device_id', $deviceId);
                })
                ->first();

            if (! $incubator || ! isset($incubator->settings['wifi'])) {
                return response()->json([
                    'status' => 'fail',
                    'message' => 'Device configuration not found. Please configure through web application first.',
                ], 404);
            }

            $settings = $incubator->settings;

            return response()->json([
                'status' => 'success',
                'device_id' => $deviceId,
                'wifi' => [
                    'ssid' => $settings['wifi']['ssid'],
                    'password' => decrypt($settings['wifi']['password']), // Decrypt for device
                ],
                'api_url' => $settings['api_url'] ?? url('/api'),
                'intervals' => [
                    'send_interval' => $settings['intervals']['send_interval'] ?? 30000,
                    'command_check_interval' => $settings['intervals']['command_check_interval'] ?? 10000,
                ],
                'incubator' => [
                    'id' => $incubator->id,
                    'name' => $incubator->name,
                    'target_temperature' => $incubator->target_temperature,
                    'target_humidity' => $incubator->target_humidity,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Failed to retrieve device configuration',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get commands for a device (GET /api/commands?device=ID)
     * Device polls this to check for pending commands
     */
    public function getCommands(Request $request): JsonResponse
    {
        $deviceId = $request->query('device');

        if (! $deviceId) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Device ID required',
            ], 400);
        }

        // Get pending commands from database
        $commands = IotDeviceCommand::where('device_id', $deviceId)
            ->pending()
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($cmd, $index) {
                return [
                    'id' => $cmd->id,
                    'index' => $index,
                    'command' => $cmd->command,
                    'value' => $cmd->value,
                    'created_at' => $cmd->created_at->toIso8601String(),
                    'executed' => $cmd->executed,
                ];
            });

        return response()->json([
            'status' => 'success',
            'device' => $deviceId,
            'commands' => $commands,
        ]);
    }

    /**
     * Send command to a device (POST /api/commands)
     * Website uses this to control the device
     */
    public function sendCommand(Request $request): JsonResponse
    {
        $request->validate([
            'device' => 'required|string',
            'command' => 'required|string',
            'value' => 'nullable',
        ]);

        // Find incubator for this device
        $incubator = Incubator::where('serial_number', $request->device)
            ->orWhere(function ($query) use ($request) {
                $query->whereJsonContains('settings->device_id', $request->device);
            })
            ->first();

        // Create command in database
        $command = IotDeviceCommand::create([
            'device_id' => $request->device,
            'command' => $request->command,
            'value' => $request->value,
            'incubator_id' => $incubator?->id,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Command queued for device',
            'command' => [
                'id' => $command->id,
                'device' => $command->device_id,
                'command' => $command->command,
                'value' => $command->value,
                'created_at' => $command->created_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * Mark command as executed (POST /api/commands/executed)
     * Device calls this after executing a command
     */
    public function markCommandExecuted(Request $request): JsonResponse
    {
        $request->validate([
            'device' => 'required|string',
            'command_id' => 'required|integer',
        ]);

        $command = IotDeviceCommand::where('device_id', $request->device)
            ->where('id', $request->command_id)
            ->first();

        if (! $command) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Command not found',
            ], 404);
        }

        $command->markAsExecuted();

        return response()->json([
            'status' => 'success',
            'message' => 'Command marked as executed',
        ]);
    }

    /**
     * Update incubator sensor data based on device readings
     * Returns the updated incubator or null if not found
     */
    protected function updateIncubatorFromSensorData(string $deviceId, array $sensorData): ?Incubator
    {
        try {

            Log::debug('Updating incubator from sensor data', [
                'device_id' => $deviceId,
                'sensor_data' => $sensorData,
            ]);
            // Find incubator by serial_number (device ID) or by checking settings
            $incubator = Incubator::where('serial_number', $deviceId)
                ->orWhere(function ($query) use ($deviceId) {
                    $query->whereJsonContains('settings->device_id', $deviceId);
                })
                ->first();

            if (! $incubator) {
                Log::info('No incubator found for device', ['device_id' => $deviceId]);
                return null;
            }

            // Extract sensor readings
            $temperature = $sensorData['temp'] ?? $sensorData['temperature'] ?? null;
            $humidity = $sensorData['humidity'] ?? null;
            $ledState = $sensorData['ledState'] ?? $sensorData['led_state'] ?? null;

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

            if ($ledState != null) {
                $sensorsDataUpdate['led_state'] = [
                    'value' => (int) $ledState,
                    'timestamp' => now()->toIso8601String(),
                ];
            }

            // Add any additional sensor data
            foreach ($sensorData as $key => $value) {
                if (! in_array($key, ['device', 'temp', 'temperature', 'humidity', 'ledState', 'led_state', 'received_at'])) {
                    $sensorsDataUpdate[$key] = [
                        'value' => $value,
                        'timestamp' => now()->toIso8601String(),
                    ];
                }
            }

            // Store historical readings (keep last 100 readings)
            $sensorsDataUpdate['history'] = $sensorsDataUpdate['history'] ?? [];
            $sensorsDataUpdate['history'][] = [
                'timestamp' => now()->toIso8601String(),
                'temperature' => $temperature,
                'humidity' => $humidity,
                'raw_data' => $sensorData,
            ];

            // Keep only last 100 readings
            if (count($sensorsDataUpdate['history']) > 100) {
                $sensorsDataUpdate['history'] = array_slice($sensorsDataUpdate['history'], -100);
            }

            $updateData['sensors_data'] = $sensorsDataUpdate;

            // Update the incubator
            $incubator->update($updateData);

            Log::info('Incubator updated from sensor data', [
                'incubator_id' => $incubator->id,
                'device_id' => $deviceId,
                'temperature' => $temperature,
                'humidity' => $humidity,
            ]);

            return $incubator;

        } catch (\Throwable $e) {
            Log::error('Failed to update incubator from sensor data', [
                'error' => $e->getMessage(),
                'device_id' => $deviceId,
                'trace' => $e->getTraceAsString(),
            ]);

            return null;
        }
    }
}
