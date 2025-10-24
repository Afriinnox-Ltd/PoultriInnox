#!/usr/bin/env php
<?php

/**
 * MQTT Connection Test Script
 *
 * This script tests the MQTT connection and basic functionality
 * Run: php test-mqtt.php
 */

require __DIR__ . '/vendor/autoload.php';

use PhpMqtt\Client\MqttClient;
use PhpMqtt\Client\ConnectionSettings;

echo "\n";
echo "╔════════════════════════════════════════╗\n";
echo "║   MQTT Connection Test for Poultriinnox   ║\n";
echo "╔════════════════════════════════════════╗\n";
echo "\n";

// Load environment
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
try {
    $dotenv->load();
} catch (\Exception $e) {
    echo "⚠️  .env file not found, using defaults\n\n";
}

// Configuration
$broker = getenv('MQTT_HOST') ?: 'broker.hivemq.com';
$port = (int)(getenv('MQTT_PORT') ?: 1883);
$clientId = 'poultriinnox_test_' . uniqid();
$username = getenv('MQTT_USERNAME') ?: null;
$password = getenv('MQTT_PASSWORD') ?: null;
$topicPrefix = getenv('MQTT_TOPIC_PREFIX') ?: 'poultriinnox';

echo "📋 Configuration:\n";
echo "   Broker: {$broker}\n";
echo "   Port: {$port}\n";
echo "   Client ID: {$clientId}\n";
echo "   Username: " . ($username ? $username : '(none)') . "\n";
echo "   Topic Prefix: {$topicPrefix}\n";
echo "\n";

// Test 1: Connection
echo "🔌 Test 1: Connecting to MQTT broker...\n";
try {
    $mqtt = new MqttClient($broker, $port, $clientId);

    $connectionSettings = (new ConnectionSettings)
        ->setKeepAliveInterval(60)
        ->setUseTls(false);

    if ($username && $password) {
        $connectionSettings
            ->setUsername($username)
            ->setPassword($password);
    }

    $mqtt->connect($connectionSettings, true);
    echo "✅ Connection successful!\n\n";
} catch (\Exception $e) {
    echo "❌ Connection failed: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 2: Subscribe
$testTopic = "{$topicPrefix}/test/connection";
echo "📥 Test 2: Subscribing to topic: {$testTopic}\n";
try {
    $messageReceived = false;

    $mqtt->subscribe($testTopic, function ($topic, $message) use (&$messageReceived) {
        echo "   📨 Message received: {$message}\n";
        $messageReceived = true;
    }, 0);

    echo "✅ Subscription successful!\n\n";
} catch (\Exception $e) {
    echo "❌ Subscription failed: " . $e->getMessage() . "\n";
    $mqtt->disconnect();
    exit(1);
}

// Test 3: Publish
echo "📤 Test 3: Publishing test message...\n";
try {
    $testMessage = json_encode([
        'test' => true,
        'timestamp' => date('Y-m-d H:i:s'),
        'client_id' => $clientId
    ]);

    $mqtt->publish($testTopic, $testMessage, 0);
    echo "✅ Message published!\n\n";
} catch (\Exception $e) {
    echo "❌ Publish failed: " . $e->getMessage() . "\n";
    $mqtt->disconnect();
    exit(1);
}

// Test 4: Receive message
echo "⏳ Test 4: Waiting for message (5 seconds)...\n";
$startTime = time();
while (!$messageReceived && (time() - $startTime) < 5) {
    $mqtt->loop(true, true);
    usleep(100000); // 100ms
}

if ($messageReceived) {
    echo "✅ Message received successfully!\n\n";
} else {
    echo "⚠️  No message received within timeout\n\n";
}

// Test 5: Device Topics
echo "📡 Test 5: Testing device topics...\n";
$deviceId = 'TEST_DEVICE_001';
$deviceTopics = [
    'telemetry' => "{$topicPrefix}/devices/{$deviceId}/telemetry",
    'commands' => "{$topicPrefix}/devices/{$deviceId}/commands",
    'status' => "{$topicPrefix}/devices/{$deviceId}/status",
];

foreach ($deviceTopics as $type => $topic) {
    try {
        $mqtt->publish($topic, json_encode(['test' => $type, 'time' => time()]), 0);
        echo "   ✅ {$type}: {$topic}\n";
    } catch (\Exception $e) {
        echo "   ❌ {$type}: " . $e->getMessage() . "\n";
    }
}
echo "\n";

// Cleanup
echo "🧹 Cleaning up...\n";
try {
    $mqtt->disconnect();
    echo "✅ Disconnected successfully\n\n";
} catch (\Exception $e) {
    echo "⚠️  Disconnect warning: " . $e->getMessage() . "\n\n";
}

// Summary
echo "╔════════════════════════════════════════╗\n";
echo "║           TEST COMPLETE                ║\n";
echo "╚════════════════════════════════════════╝\n";
echo "\n";
echo "✅ All tests passed!\n";
echo "\n";
echo "Next steps:\n";
echo "1. Start the listener: php artisan mqtt:listen\n";
echo "2. Configure your ESP32 device\n";
echo "3. Link device in the web application\n";
echo "\n";
echo "For more information, see:\n";
echo "- docs/MQTT-QUICK-START.md\n";
echo "- docs/MQTT-INTEGRATION-GUIDE.md\n";
echo "\n";
