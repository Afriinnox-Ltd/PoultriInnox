<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\api\v1\IotDeviceController;
use App\Http\Controllers\api\v1\MqttIotDeviceController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// ============================================
// HTTP IoT device endpoints
// ============================================

// POST sensor state from device
Route::post('/send', [IotDeviceController::class, 'receive']);

// GET latest data (optionally pass ?device=DEVICE_ID)
Route::get('/data', [IotDeviceController::class, 'data']);

Route::get('/commands', [IotDeviceController::class, 'getCommands']);
// POST command to device (from website)
Route::post('/commands', [IotDeviceController::class, 'sendCommand']);
// POST to mark command as executed (from device)
Route::post('/commands/executed', [IotDeviceController::class, 'markCommandExecuted']);

Route::post('/incubator/link', [IotDeviceController::class, 'linkIncubator']);

Route::post('/incubator/configure', [IotDeviceController::class, 'configureDevice']);

Route::get('/device/config', [IotDeviceController::class, 'getDeviceConfig']);

// ============================================
// MQTT IoT device endpoints (Broodinnox style)
// ============================================

Route::prefix('mqtt')->group(function () {
    // Get MQTT broker information
    Route::get('/broker', [MqttIotDeviceController::class, 'getBrokerInfo']);

    // Test MQTT connection
    Route::get('/test', [MqttIotDeviceController::class, 'testConnection']);

    // Send command to device via MQTT
    Route::post('/commands', [MqttIotDeviceController::class, 'sendCommand']);

    // Configure device via MQTT
    Route::post('/configure', [MqttIotDeviceController::class, 'configureDevice']);

    // Link device to incubator
    Route::post('/device/link', [MqttIotDeviceController::class, 'linkDevice']);

    // Get device status
    Route::get('/device/status', [MqttIotDeviceController::class, 'getDeviceStatus']);

    // Flask-style control endpoints
    Route::post('/control/relay', [MqttIotDeviceController::class, 'controlRelay']);
    Route::post('/control/setting', [MqttIotDeviceController::class, 'updateSetting']);

    // Flask-style status, analytics, and alerts endpoints
    Route::get('/status/{device_id}', [MqttIotDeviceController::class, 'getStatus']);
    Route::get('/analytics/{device_id}', [MqttIotDeviceController::class, 'getAnalytics']);
    Route::get('/alerts/{device_id}', [MqttIotDeviceController::class, 'getAlerts']);
    Route::post('/alerts/clear', [MqttIotDeviceController::class, 'clearAlerts']);

    // Sync real-time MQTT data with database
    Route::post('/sync/{device_id}', [MqttIotDeviceController::class, 'syncWithDatabase']);

    // Update incubator connection status
    Route::post('/connection/status', [MqttIotDeviceController::class, 'updateConnectionStatus']);
});
