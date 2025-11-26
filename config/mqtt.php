<?php

return [

    /*
    |--------------------------------------------------------------------------
    | MQTT Broker Configuration
    |--------------------------------------------------------------------------
    |
    | Configure your MQTT broker connection settings here.
    | You can use public brokers like test.mosquitto.org or broker.hivemq.com
    | for testing, or your own private MQTT broker for production.
    |
    */

    'broker' => [
        'host' => env('MQTT_HOST', 'broker.hivemq.com'),
        'port' => env('MQTT_PORT', 1883),
        'username' => env('MQTT_USERNAME', null),
        'password' => env('MQTT_PASSWORD', null),
        'client_id' => env('MQTT_CLIENT_ID', 'poultriinnox_' . uniqid()),
        'clean_session' => env('MQTT_CLEAN_SESSION', true),
        'keep_alive' => env('MQTT_KEEP_ALIVE', 60),
    ],

    /*
    |--------------------------------------------------------------------------
    | MQTT Topic Structure
    |--------------------------------------------------------------------------
    |
    | Define the topic structure for your IoT devices.
    | Topics follow the Broodinnox pattern for compatibility
    |
    */

    'topics' => [
        'prefix' => env('MQTT_TOPIC_PREFIX', 'broodinnox'),

        // Device-specific topics with {device_id} placeholder
        // Match ESP32 format: broodinnox/{DEVICE_ID}/...

        // Main data topic (Device → Server)
        'data' => env('MQTT_TOPIC_PREFIX', 'broodinnox') . '/{device_id}/data',

        // Control topics (Server → Device)
        'relay' => env('MQTT_TOPIC_PREFIX', 'broodinnox') . '/{device_id}/control/relay',
        'max_temp' => env('MQTT_TOPIC_PREFIX', 'broodinnox') . '/{device_id}/control/max_temp',
        'min_temp' => env('MQTT_TOPIC_PREFIX', 'broodinnox') . '/{device_id}/control/min_temp',
        'total_days' => env('MQTT_TOPIC_PREFIX', 'broodinnox') . '/{device_id}/control/total_days',
        'sensor' => env('MQTT_TOPIC_PREFIX', 'broodinnox') . '/{device_id}/control/sensor',
        'weekly_reduce' => env('MQTT_TOPIC_PREFIX', 'broodinnox') . '/{device_id}/control/weekly_reduce',
        'reduce_now' => env('MQTT_TOPIC_PREFIX', 'broodinnox') . '/{device_id}/control/reduce_now',
        'mode' => env('MQTT_TOPIC_PREFIX', 'broodinnox') . '/{device_id}/control/mode',

        // Status and discovery topics (Device → Server)
        'status' => env('MQTT_TOPIC_PREFIX', 'broodinnox') . '/{device_id}/status',
        'discovery' => env('MQTT_TOPIC_PREFIX', 'broodinnox') . '/{device_id}/discovery',

        // Legacy device-specific topics (for backward compatibility)
        'device_telemetry' => env('MQTT_TOPIC_PREFIX', 'broodinnox') . '/devices/{device_id}/telemetry',
        'device_commands' => env('MQTT_TOPIC_PREFIX', 'broodinnox') . '/devices/{device_id}/commands',
        'device_status' => env('MQTT_TOPIC_PREFIX', 'broodinnox') . '/devices/{device_id}/status',
    ],    /*
    |--------------------------------------------------------------------------
    | Quality of Service (QoS)
    |--------------------------------------------------------------------------
    |
    | MQTT QoS levels:
    | 0 - At most once (fire and forget)
    | 1 - At least once (acknowledged delivery)
    | 2 - Exactly once (assured delivery)
    |
    */

    'qos' => [
        'telemetry' => 1, // At least once for sensor data
        'commands' => 2,  // Exactly once for commands
        'status' => 1,    // At least once for status updates
    ],

    /*
    |--------------------------------------------------------------------------
    | Connection Settings
    |--------------------------------------------------------------------------
    */

    'connection' => [
        'timeout' => env('MQTT_TIMEOUT', 5),
        'retry_interval' => env('MQTT_RETRY_INTERVAL', 10),
        'max_retries' => env('MQTT_MAX_RETRIES', 3),
    ],

    /*
    |--------------------------------------------------------------------------
    | WebSocket Support
    |--------------------------------------------------------------------------
    |
    | Enable WebSocket support for browser-based MQTT clients
    |
    | Protocol:
    | - 'ws' for local development (HTTP)
    | - 'wss' for production (HTTPS)
    | - Leave empty to auto-detect based on request (recommended)
    |
    | Public Broker WebSocket Ports:
    | - test.mosquitto.org: 8080 (ws), 8081 (wss)
    | - broker.hivemq.com: 8000 (ws), 8884 (wss)
    |
    | Path:
    | - '/mqtt' for both Mosquitto and HiveMQ brokers
    |
    */

    'websocket' => [
        'enabled' => env('MQTT_WEBSOCKET_ENABLED', true),
        'port' => env('MQTT_WEBSOCKET_PORT', 8000), // 8000 for ws, 8884 for wss (HiveMQ)
        'protocol' => env('MQTT_WEBSOCKET_PROTOCOL', ''), // Auto-detect: ws for HTTP, wss for HTTPS
        'path' => env('MQTT_WEBSOCKET_PATH', '/mqtt'), // WebSocket path (required for MQTT over WebSocket)
    ],    /*
    |--------------------------------------------------------------------------
    | Message Retention
    |--------------------------------------------------------------------------
    */

    'retention' => [
        'enabled' => true,
        'ttl' => 3600, // 1 hour in seconds
    ],

];
