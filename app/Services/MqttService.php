<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use PhpMqtt\Client\ConnectionSettings;
use PhpMqtt\Client\MqttClient;
use PhpMqtt\Client\Exceptions\MqttClientException;

class MqttService
{
    protected ?MqttClient $client = null;
    protected array $config;
    protected bool $isConnected = false;

    public function __construct()
    {
        $this->config = config('mqtt');
    }

    /**
     * Connect to MQTT broker
     */
    public function connect(): bool
    {
        if ($this->isConnected) {
            return true;
        }

        try {
            $broker = $this->config['broker'];

            $this->client = new MqttClient(
                $broker['host'],
                $broker['port'],
                $broker['client_id']
            );

            $connectionSettings = (new ConnectionSettings)
                ->setKeepAliveInterval($broker['keep_alive'])
                ->setUseTls(false)
                ->setTlsSelfSignedAllowed(true);

            if ($broker['username'] && $broker['password']) {
                $connectionSettings
                    ->setUsername($broker['username'])
                    ->setPassword($broker['password']);
            }

            $this->client->connect($connectionSettings, $broker['clean_session']);
            $this->isConnected = true;

            Log::info('MQTT: Connected to broker', [
                'host' => $broker['host'],
                'port' => $broker['port'],
                'client_id' => $broker['client_id']
            ]);

            return true;
        } catch (MqttClientException $e) {
            Log::error('MQTT: Connection failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            $this->isConnected = false;
            return false;
        }
    }

    /**
     * Disconnect from MQTT broker
     */
    public function disconnect(): void
    {
        if ($this->client && $this->isConnected) {
            try {
                $this->client->disconnect();
                $this->isConnected = false;

                Log::info('MQTT: Disconnected from broker');
            } catch (MqttClientException $e) {
                Log::error('MQTT: Disconnect failed', [
                    'error' => $e->getMessage()
                ]);
            }
        }
    }

    /**
     * Publish message to a topic
     */
    public function publish(string $topic, array|string $payload, int $qos = 1, bool $retain = false): bool
    {
        if (!$this->isConnected && !$this->connect()) {
            return false;
        }

        try {
            $message = is_array($payload) ? json_encode($payload) : $payload;

            $this->client->publish($topic, $message, $qos, $retain);

            Log::info('MQTT: Message published', [
                'topic' => $topic,
                'payload' => $message,
                'qos' => $qos
            ]);

            return true;
        } catch (MqttClientException $e) {
            Log::error('MQTT: Publish failed', [
                'topic' => $topic,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Subscribe to a topic
     */
    public function subscribe(string $topic, callable $callback, int $qos = 1): bool
    {
        if (!$this->isConnected && !$this->connect()) {
            return false;
        }

        try {
            $this->client->subscribe($topic, $callback, $qos);

            Log::info('MQTT: Subscribed to topic', [
                'topic' => $topic,
                'qos' => $qos
            ]);

            return true;
        } catch (MqttClientException $e) {
            Log::error('MQTT: Subscribe failed', [
                'topic' => $topic,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Unsubscribe from a topic
     */
    public function unsubscribe(string $topic): bool
    {
        if (!$this->isConnected) {
            return false;
        }

        try {
            $this->client->unsubscribe($topic);

            Log::info('MQTT: Unsubscribed from topic', [
                'topic' => $topic
            ]);

            return true;
        } catch (MqttClientException $e) {
            Log::error('MQTT: Unsubscribe failed', [
                'topic' => $topic,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Listen for messages (blocking operation)
     */
    public function loop(bool $allowSleep = true): void
    {
        if (!$this->isConnected) {
            return;
        }

        try {
            $this->client->loop($allowSleep);
        } catch (MqttClientException $e) {
            Log::error('MQTT: Loop error', [
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get topic for device telemetry
     */
    public function getDeviceTelemetryTopic(string $deviceId): string
    {
        return str_replace(
            '{device_id}',
            $deviceId,
            $this->config['topics']['device_telemetry']
        );
    }

    /**
     * Get topic for device commands
     */
    public function getDeviceCommandTopic(string $deviceId): string
    {
        return str_replace(
            '{device_id}',
            $deviceId,
            $this->config['topics']['device_commands']
        );
    }

    /**
     * Get topic for device status
     */
    public function getDeviceStatusTopic(string $deviceId): string
    {
        return str_replace(
            '{device_id}',
            $deviceId,
            $this->config['topics']['device_status']
        );
    }

    /**
     * Get topic for device config
     */
    public function getDeviceConfigTopic(string $deviceId): string
    {
        return str_replace(
            '{device_id}',
            $deviceId,
            $this->config['topics']['device_config']
        );
    }

    /**
     * Get topic for device response
     */
    public function getDeviceResponseTopic(string $deviceId): string
    {
        return str_replace(
            '{device_id}',
            $deviceId,
            $this->config['topics']['device_response']
        );
    }

    /**
     * Get device-specific control topic
     */
    public function getDeviceControlTopic(string $deviceId, string $control): string
    {
        $topicKey = match($control) {
            'relay' => 'relay',
            'max_temp' => 'max_temp',
            'min_temp' => 'min_temp',
            'total_days' => 'total_days',
            'sensor' => 'sensor',
            'weekly_reduce' => 'weekly_reduce',
            'reduce_now' => 'reduce_now',
            'mode' => 'mode',
            default => throw new \InvalidArgumentException("Unknown control type: {$control}")
        };

        return str_replace(
            '{device_id}',
            $deviceId,
            $this->config['topics'][$topicKey]
        );
    }

    /**
     * Get device data topic
     */
    public function getDeviceDataTopic(string $deviceId): string
    {
        return str_replace(
            '{device_id}',
            $deviceId,
            $this->config['topics']['data']
        );
    }

    /**
     * Get device discovery topic
     */
    public function getDeviceDiscoveryTopic(string $deviceId): string
    {
        return str_replace(
            '{device_id}',
            $deviceId,
            $this->config['topics']['discovery']
        );
    }

    /**
     * Publish control command to device
     */
    public function publishControlCommand(string $deviceId, string $control, $value): bool
    {
        $topic = $this->getDeviceControlTopic($deviceId, $control);
        $message = is_array($value) ? json_encode($value) : (string) $value;

        return $this->publish($topic, $message, $this->config['qos']['commands']);
    }

    /**
     * Subscribe to all devices of a specific control topic
     */
    public function subscribeToDeviceControl(string $control, callable $callback): bool
    {
        $topic = $this->getDeviceControlTopic('+', $control);
        return $this->subscribe($topic, $callback, $this->config['qos']['commands']);
    }

    /**
     * Subscribe to all device data (wildcard)
     */
    public function subscribeToAllDeviceData(callable $callback): bool
    {
        $topic = str_replace('{device_id}', '+', $this->config['topics']['data']);
        return $this->subscribe($topic, $callback, $this->config['qos']['telemetry']);
    }

    /**
     * Subscribe to specific device data
     */
    public function subscribeToDeviceData(string $deviceId, callable $callback): bool
    {
        $topic = $this->getDeviceDataTopic($deviceId);
        return $this->subscribe($topic, $callback, $this->config['qos']['telemetry']);
    }

    /**
     * Subscribe to device discovery messages
     */
    public function subscribeToDeviceDiscovery(callable $callback): bool
    {
        $topic = str_replace('{device_id}', '+', $this->config['topics']['discovery']);
        return $this->subscribe($topic, $callback, $this->config['qos']['status']);
    }

    /**
     * Send command to device via MQTT
     */
    public function sendDeviceCommand(string $deviceId, string $command, $value = null): bool
    {
        $topic = $this->getDeviceCommandTopic($deviceId);

        $payload = [
            'command' => $command,
            'value' => $value,
            'timestamp' => now()->toIso8601String(),
            'message_id' => uniqid('cmd_')
        ];

        return $this->publish($topic, $payload, $this->config['qos']['commands']);
    }

    /**
     * Send configuration to device via MQTT
     */
    public function sendDeviceConfig(string $deviceId, array $config): bool
    {
        $topic = $this->getDeviceConfigTopic($deviceId);

        $payload = [
            'config' => $config,
            'timestamp' => now()->toIso8601String(),
            'message_id' => uniqid('cfg_')
        ];

        return $this->publish($topic, $payload, $this->config['qos']['commands']);
    }

    /**
     * Subscribe to all device telemetry (wildcard)
     */
    public function subscribeToAllDeviceTelemetry(callable $callback): bool
    {
        $topic = str_replace('{device_id}', '+', $this->config['topics']['device_telemetry']);
        return $this->subscribe($topic, $callback, $this->config['qos']['telemetry']);
    }

    /**
     * Subscribe to specific device telemetry
     */
    public function subscribeToDeviceTelemetry(string $deviceId, callable $callback): bool
    {
        $topic = $this->getDeviceTelemetryTopic($deviceId);
        return $this->subscribe($topic, $callback, $this->config['qos']['telemetry']);
    }

    /**
     * Check if connected
     */
    public function isConnected(): bool
    {
        return $this->isConnected;
    }
}
