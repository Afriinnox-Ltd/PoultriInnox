import { useState, useEffect, useCallback, useRef } from 'react';
import mqtt, { MqttClient } from 'mqtt';

export interface MqttBrokerConfig {
    host: string;
    port: number;
    protocol: 'ws' | 'wss' | 'mqtt' | 'mqtts';
    path?: string;
    username?: string;
    password?: string;
    clientId?: string;
}

export interface MqttMessage {
    topic: string;
    payload: any;
    timestamp: Date;
}

export interface UseMqttClientOptions {
    brokerConfig?: MqttBrokerConfig;
    autoConnect?: boolean;
    reconnectPeriod?: number;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Error) => void;
    onMessage?: (message: MqttMessage) => void;
}

export interface UseMqttClientReturn {
    client: MqttClient | null;
    isConnected: boolean;
    error: Error | null;
    messages: MqttMessage[];
    connect: (config?: MqttBrokerConfig) => void;
    disconnect: () => void;
    subscribe: (topic: string | string[], qos?: 0 | 1 | 2) => void;
    unsubscribe: (topic: string | string[]) => void;
    publish: (topic: string, message: string | object, qos?: 0 | 1 | 2, retain?: boolean) => void;
    clearMessages: () => void;
}

export function useMqttClient(options: UseMqttClientOptions = {}): UseMqttClientReturn {
    const {
        brokerConfig,
        autoConnect = false,
        reconnectPeriod = 10000,
        onConnect,
        onDisconnect,
        onError,
        onMessage
    } = options;

    const [client, setClient] = useState<MqttClient | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [messages, setMessages] = useState<MqttMessage[]>([]);

    const subscriptionsRef = useRef<Set<string>>(new Set());

    // Connect to MQTT broker
    const connect = useCallback((config?: MqttBrokerConfig) => {
        const mqttConfig = config || brokerConfig;

        if (!mqttConfig) {
            const err = new Error('MQTT broker configuration is required');
            setError(err);
            onError?.(err);
            return;
        }

        try {
            // Disconnect existing client if any
            if (client) {
                client.end(true);
            }

            const { host, port, protocol, path, username, password } = mqttConfig;
            const clientId = mqttConfig.clientId || `poultriinnox_web_${Math.random().toString(16).substring(2, 8)}`;

            const brokerUrl = `${protocol}://${host}:${port}${path || ''}`;

            console.log('Connecting to MQTT broker:', brokerUrl);

            const mqttClient = mqtt.connect(brokerUrl, {
                clientId,
                username,
                password,
                clean: true,
                reconnectPeriod,
                connectTimeout: 30000,
            });

            mqttClient.on('connect', () => {
                console.log('MQTT: Connected to broker');
                setIsConnected(true);
                setError(null);
                onConnect?.();

                // Resubscribe to previous topics
                subscriptionsRef.current.forEach(topic => {
                    mqttClient.subscribe(topic, { qos: 1 });
                });
            });

            mqttClient.on('disconnect', () => {
                console.log('MQTT: Disconnected from broker');
                setIsConnected(false);
                onDisconnect?.();
            });

            mqttClient.on('error', (err) => {
                console.error('MQTT: Connection error:', err);
                setError(err);
                onError?.(err);
            });

            mqttClient.on('message', (topic, payload) => {
                try {
                    let parsedPayload: any;

                    try {
                        parsedPayload = JSON.parse(payload.toString());
                    } catch {
                        parsedPayload = payload.toString();
                    }

                    const message: MqttMessage = {
                        topic,
                        payload: parsedPayload,
                        timestamp: new Date(),
                    };

                    setMessages(prev => [...prev.slice(-99), message]); // Keep last 100 messages
                    onMessage?.(message);
                } catch (err) {
                    console.error('MQTT: Error processing message:', err);
                }
            });

            setClient(mqttClient);
        } catch (err) {
            const error = err as Error;
            console.error('MQTT: Failed to connect:', error);
            setError(error);
            onError?.(error);
        }
    }, [brokerConfig, reconnectPeriod, onConnect, onDisconnect, onError, onMessage, client]);

    // Disconnect from MQTT broker
    const disconnect = useCallback(() => {
        if (client) {
            console.log('MQTT: Disconnecting...');
            client.end(true);
            setClient(null);
            setIsConnected(false);
            subscriptionsRef.current.clear();
        }
    }, [client]);

    // Subscribe to topic(s)
    const subscribe = useCallback((topic: string | string[], qos: 0 | 1 | 2 = 1) => {
        if (!client) {
            console.warn('MQTT: Cannot subscribe, client not available');
            return;
        }

        // Check if client is actually connected (not just state)
        if (!client.connected) {
            console.warn('MQTT: Cannot subscribe, client not connected yet');
            // Store for later subscription when connected
            const topics = Array.isArray(topic) ? topic : [topic];
            topics.forEach(t => subscriptionsRef.current.add(t));
            return;
        }

        const topics = Array.isArray(topic) ? topic : [topic];

        topics.forEach(t => subscriptionsRef.current.add(t));

        client.subscribe(topics, { qos }, (err) => {
            if (err) {
                console.error('MQTT: Subscription error:', err);
            } else {
                console.log('MQTT: Subscribed to:', topics);
            }
        });
    }, [client]);

    // Unsubscribe from topic(s)
    const unsubscribe = useCallback((topic: string | string[]) => {
        if (!client || !isConnected) {
            return;
        }

        const topics = Array.isArray(topic) ? topic : [topic];

        topics.forEach(t => subscriptionsRef.current.delete(t));

        client.unsubscribe(topics, (err) => {
            if (err) {
                console.error('MQTT: Unsubscribe error:', err);
            } else {
                console.log('MQTT: Unsubscribed from:', topics);
            }
        });
    }, [client, isConnected]);

    // Publish message to topic
    const publish = useCallback((
        topic: string,
        message: string | object,
        qos: 0 | 1 | 2 = 1,
        retain: boolean = false
    ) => {
        if (!client || !isConnected) {
            console.warn('MQTT: Cannot publish, client not connected');
            return;
        }

        const payload = typeof message === 'string' ? message : JSON.stringify(message);

        client.publish(topic, payload, { qos, retain }, (err) => {
            if (err) {
                console.error('MQTT: Publish error:', err);
            } else {
                console.log('MQTT: Published to', topic, ':', payload);
            }
        });
    }, [client, isConnected]);

    // Clear message history
    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    // Auto-connect on mount if enabled
    useEffect(() => {
        if (autoConnect && brokerConfig && !client) {
            connect();
        }

        return () => {
            if (client) {
                client.end(true);
            }
        };
    }, []); // Only run once on mount

    return {
        client,
        isConnected,
        error,
        messages,
        connect,
        disconnect,
        subscribe,
        unsubscribe,
        publish,
        clearMessages,
    };
}
