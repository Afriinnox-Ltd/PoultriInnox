import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
    Activity,
    Thermometer,
    Droplets,
    Wifi,
    WifiOff,
    Power,
    Lightbulb,
    RefreshCw,
    CheckCircle,
    Bell,
    Clock,
    Settings,
    Zap,
    Radio,
} from 'lucide-react';
import { toast } from 'sonner';
import { useMqttClient, MqttBrokerConfig } from '@/hooks/useMqttClient';

interface MqttIotDeviceControlProps {
    incubator: {
        id: number;
        serial_number: string;
        model: string;
        status: {
            value: string;
            label: string;
            color: string;
        };
        current_temperature: number;
        current_humidity: number;
        target_temperature: number;
        target_humidity: number;
        sensors_data: any;
    };
    getStatusColor: (status: string) => string;
}

interface SensorData {
    temperature?: number;
    sensors?: {
        temp1?: number | string;
        temp2?: number | string;
        temp3?: number | string;
        temp4?: number | string;
        s1_active?: boolean;
        s2_active?: boolean;
        s3_active?: boolean;
        s4_active?: boolean;
    };
    cycle_day?: number;
    total_days?: number;
    max_temp?: number;
    min_temp?: number;
    relay_status?: string;
    relay_mode?: string;
    error?: string;
    timestamp?: string;
    [key: string]: any;
}

interface Alert {
    id: number;
    device_id: string;
    alert_type: string;
    message: string;
    severity: 'info' | 'warning' | 'critical';
    resolved: boolean;
    created_at: string;
}

interface Analytics {
    last_24h: {
        avg_temp: number;
        max_temp: number;
        min_temp: number;
        readings_count: number;
        relay_runtime_seconds: number;
        relay_runtime_hours: number;
        relay_cycles: number;
    };
}

export default function MqttIotDeviceControl({
    incubator,
    getStatusColor
}: MqttIotDeviceControlProps) {
    const [brokerConfig, setBrokerConfig] = useState<MqttBrokerConfig | null>(null);
    const [sensorData, setSensorData] = useState<SensorData | null>(null);
    const [activeBatch, setActiveBatch] = useState<any | null>(null);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [relayCommand, setRelayCommand] = useState<'ON' | 'OFF' | 'AUTO'>('AUTO');
    const [isDeviceOnline, setIsDeviceOnline] = useState<boolean>(false);
    const [isLoadingBroker, setIsLoadingBroker] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [isControllingRelay, setIsControllingRelay] = useState(false);
    const [isUpdatingMaxTemp, setIsUpdatingMaxTemp] = useState(false);
    const [isUpdatingMinTemp, setIsUpdatingMinTemp] = useState(false);
    const [isUpdatingTotalDays, setIsUpdatingTotalDays] = useState(false);
    const [isClearingAlerts, setIsClearingAlerts] = useState(false);
    const [isRefreshingAnalytics, setIsRefreshingAnalytics] = useState(false);
    const [isUpdatingSensor, setIsUpdatingSensor] = useState<number | null>(null);
    const [targetMaxTemp, setTargetMaxTemp] = useState('36');
    const [targetMinTemp, setTargetMinTemp] = useState('32');
    const [totalDays, setTotalDays] = useState('21');

    const deviceId = incubator.serial_number;
    const topicPrefix = 'broodinnox'; // Updated to Broodinnox pattern

    // LocalStorage keys for persistent state
    const MQTT_CONNECTED_KEY = `mqtt_connected_${deviceId}`;
    const MQTT_CONFIG_KEY = `mqtt_config_${deviceId}`;

    // Topics to subscribe to (device-specific)
    const dataTopic = `${topicPrefix}/${deviceId}/data`;
    const statusTopic = `${topicPrefix}/${deviceId}/status`;
    const discoveryTopic = `${topicPrefix}/${deviceId}/discovery`;

    // MQTT Client Hook
    const {
        isConnected,
        error,
        messages,
        connect,
        disconnect,
        subscribe,
        publish,
    } = useMqttClient({
        autoConnect: false,
        onConnect: () => {
            toast.success('Connected to boordinnox');
            // Save connection state to localStorage
            localStorage.setItem(MQTT_CONNECTED_KEY, 'true');

        },
        onDisconnect: () => {
            toast.info('Disconnected from boordinnox');
            // Clear connection state from localStorage
            localStorage.removeItem(MQTT_CONNECTED_KEY);
        },
        onError: (err) => {
            toast.error(`boordinnox Error: ${err.message}`);
            // Clear connection state on error
            localStorage.removeItem(MQTT_CONNECTED_KEY);
        },
        onMessage: (message) => {

        }
    });

    // Subscribe when connected
    useEffect(() => {
        if (isConnected) {
            subscribe([dataTopic, statusTopic], 1);
        }
    }, [isConnected]);

    // Fetch broker configuration on mount
    useEffect(() => {
        fetchBrokerConfig();
        fetchAlerts();
        fetchAnalytics();
    }, []);

    // Auto-reconnect if was previously connected (after page refresh)
    useEffect(() => {
        if (!brokerConfig || isLoadingBroker) return;

        const wasConnected = localStorage.getItem(MQTT_CONNECTED_KEY) === 'true';

        if (wasConnected && !isConnected) {
            // Small delay to ensure everything is initialized
            setTimeout(() => {
                handleConnect();
            }, 500);
        }
    }, [brokerConfig, isLoadingBroker]);

    // Check device online status based on sensor data timestamp
    useEffect(() => {
        const checkDeviceStatus = () => {
            if (!sensorData?.timestamp && incubator.sensors_data?.last_update) {
                // Use incubator's stored last_update if no recent sensor data
                const lastUpdate = new Date(incubator.sensors_data.last_update);
                const minutesSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60);
                setIsDeviceOnline(minutesSinceUpdate < 5); // Offline if no update in 5 minutes
            } else if (sensorData?.timestamp) {
                const lastUpdate = new Date(sensorData.timestamp);
                const minutesSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60);
                setIsDeviceOnline(minutesSinceUpdate < 5);
            } else {
                setIsDeviceOnline(false);
            }
        };

        // Initial check
        checkDeviceStatus();

        // Check every 30 seconds
        const interval = setInterval(checkDeviceStatus, 30000);
        return () => clearInterval(interval);
    }, [sensorData, incubator.sensors_data]);

    // Process incoming MQTT messages
    useEffect(() => {
        if (messages.length === 0) return;

        const latestMessage = messages[messages.length - 1];

        // Check if this message is from device-specific data topic
        if (latestMessage.topic === dataTopic) {
            // Already filtered by device ID in topic, so we know it's for this device
            const newSensorData = {
                ...latestMessage.payload,
                timestamp: latestMessage.timestamp.toISOString(),
            };
            setSensorData(newSensorData);
            setIsDeviceOnline(true); // Device is sending data, so it's online

                // Auto-refresh control inputs with latest values from device
                if (newSensorData.max_temp !== undefined) {
                    setTargetMaxTemp(String(newSensorData.max_temp));
                }
                if (newSensorData.min_temp !== undefined) {
                    setTargetMinTemp(String(newSensorData.min_temp));
                }
                if (newSensorData.total_days !== undefined) {
                    setTotalDays(String(newSensorData.total_days));
                }
                if (newSensorData.relay_mode !== undefined) {
                    setRelayCommand(newSensorData.relay_mode as 'ON' | 'OFF' | 'AUTO');
                }

                // Sync with database (update incubator record)
                syncWithDatabase(newSensorData);

            // Refresh alerts when new data arrives
            fetchAlerts();
        } else if (latestMessage.topic === statusTopic) {
            // Handle status messages
            console.log('Device status update:', latestMessage.payload);
        } else if (latestMessage.topic === discoveryTopic) {
            // Handle discovery messages
            console.log('Device discovery:', latestMessage.payload);
            toast.info(`Device discovered: ${latestMessage.payload.device_name || deviceId}`);
        }
    }, [messages]);

    const fetchBrokerConfig = async () => {
        try {
            const response = await fetch('/api/mqtt/broker');
            const data = await response.json();

            if (data.status === 'success') {
                const config: MqttBrokerConfig = {
                    host: data.broker.host,
                    port: data.broker.port,
                    protocol: data.broker.protocol as 'ws' | 'wss' | 'mqtt' | 'mqtts',
                    path: data.broker.path,
                    username: data.broker.use_credentials ? data.broker.username : undefined,
                };

                setBrokerConfig(config);

                // Save config to localStorage for faster reconnection
                localStorage.setItem(MQTT_CONFIG_KEY, JSON.stringify(config));
            }
        } catch (error) {

            // Try to load from localStorage as fallback
            const savedConfig = localStorage.getItem(MQTT_CONFIG_KEY);
            if (savedConfig) {
                try {
                    const config = JSON.parse(savedConfig);
                    setBrokerConfig(config);
                } catch (e) {
                    toast.error('Failed to parse saved boordinnox configuration');
                }
            }

            toast.error('Failed to fetch boordinnox configuration');
        } finally {
            setIsLoadingBroker(false);
        }
    };

    const fetchAlerts = async () => {
        try {
            const response = await fetch(`/api/mqtt/alerts/${deviceId}?resolved=false`);
            const data = await response.json();

            if (data.status === 'success') {
                setAlerts(data.alerts);
            }
        } catch (error) {
        }
    };

    const fetchAnalytics = async () => {
        try {
            const response = await fetch(`/api/mqtt/analytics/${deviceId}`);
            const data = await response.json();

            if (data.status === 'success') {
                setAnalytics(data.analytics);
            }
        } catch (error) {
        }
    };

    const syncWithDatabase = async (data: SensorData) => {
        try {
            // Send real-time data to backend to update incubator record and active batch
            const response = await fetch(`/api/mqtt/sync/${deviceId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    temperature: data.temperature,
                    sensors: data.sensors,
                    cycle_day: data.cycle_day,
                    total_days: data.total_days,
                    max_temp: data.max_temp,
                    min_temp: data.min_temp,
                    relay_status: data.relay_status,
                    relay_mode: data.relay_mode,
                }),
            });

            const result = await response.json();

            if (result.status === 'success') {
                // Update active batch state
                if (result.active_batch) {
                    setActiveBatch(result.active_batch);

                    // Alert if batch is completed or ending soon
                    if (result.active_batch.is_completed) {
                        toast.error(
                            `🎯 Batch #${result.active_batch.id} has reached completion date! Ready for harvest.`,
                            { duration: 10000 }
                        );
                    } else if (result.active_batch.days_remaining !== null && result.active_batch.days_remaining <= 3 && result.active_batch.days_remaining > 0) {
                        toast.warning(
                            `⏰ Batch #${result.active_batch.id} will complete in ${result.active_batch.days_remaining} days`,
                            { duration: 5000 }
                        );
                    } else if (result.active_batch.days_remaining !== null && result.active_batch.days_remaining < 0) {
                        toast.error(
                            `⚠️ Batch #${result.active_batch.id} is ${Math.abs(result.active_batch.days_remaining)} days overdue!`,
                            { duration: 10000 }
                        );
                    }
                }
            } else {
                toast.error('Sync failed: ' + result.message);
            }
        } catch (error) {
            // Don't show toast error - sync failures shouldn't interrupt user experience
        }
    };

    const clearAlerts = async () => {
        setIsClearingAlerts(true);
        try {
            const response = await fetch('/api/mqtt/alerts/clear', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ device_id: deviceId, all: true }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                toast.success(`Cleared ${data.cleared_count} alerts`);
                fetchAlerts();
            }
        } catch (error) {

            toast.error('Failed to clear alerts');
        } finally {
            setIsClearingAlerts(false);
        }
    };

    const handleConnect = async () => {
        if (brokerConfig) {
            setIsConnecting(true);
            connect(brokerConfig);

            // Update incubator status to Running
            try {
                const response = await fetch('/api/mqtt/connection/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        device_id: deviceId,
                        connected: true
                    }),
                });

                const data = await response.json();
                if (data.status === 'success') {
                    toast.success('Device connected - Incubator status updated to Running');
                }
            } catch (error) {
                console.error('Failed to update incubator status:', error);
            }

            // Reset after a delay since the hook doesn't provide loading state
            setTimeout(() => setIsConnecting(false), 2000);
        } else {
            toast.error('boordinnox configuration not available');
        }
    };

    const handleDisconnect = async () => {
        setIsDisconnecting(true);
        disconnect();

        // Update incubator status to Offline
        try {
            const response = await fetch('/api/mqtt/connection/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    device_id: deviceId,
                    connected: false
                }),
            });

            const data = await response.json();
            if (data.status === 'success') {
                toast.info('Device disconnected - Incubator status updated to Offline');
            }
        } catch (error) {
            console.error('Failed to update incubator status:', error);
        }

        // Reset after a delay
        setTimeout(() => setIsDisconnecting(false), 1000);
    };

    const controlRelay = async (command: 'ON' | 'OFF' | 'AUTO') => {
        setIsControllingRelay(true);
        try {
            const response = await fetch('/api/mqtt/control/relay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ device_id: deviceId, command }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                toast.success(data.message);
                setRelayCommand(command);
            } else {
                toast.error('Failed to control relay');
            }
        } catch (error) {
            toast.error('Failed to control relay');
        } finally {
            setIsControllingRelay(false);
        }
    };

    const updateSetting = async (setting: 'max_temp' | 'min_temp' | 'total_days' | 'sensor', value: string) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue) && setting !== 'sensor') {
            toast.error(`Invalid ${setting} value`);
            return;
        }

        // Set appropriate loading state
        if (setting === 'max_temp') setIsUpdatingMaxTemp(true);
        else if (setting === 'min_temp') setIsUpdatingMinTemp(true);
        else if (setting === 'total_days') setIsUpdatingTotalDays(true);

        try {
            const response = await fetch('/api/mqtt/control/setting', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    device_id: deviceId,
                    setting,
                    value: setting === 'sensor' ? value : numValue
                }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                toast.success(data.message);
            } else {
                toast.error(`Failed to update ${setting}`);
            }
        } catch (error) {
            toast.error(`Failed to update ${setting}`);
        } finally {
            // Reset appropriate loading state
            if (setting === 'max_temp') setIsUpdatingMaxTemp(false);
            else if (setting === 'min_temp') setIsUpdatingMinTemp(false);
            else if (setting === 'total_days') setIsUpdatingTotalDays(false);
        }
    };

    const refreshAnalytics = async () => {
        setIsRefreshingAnalytics(true);
        await fetchAnalytics();
        setIsRefreshingAnalytics(false);
    };

    const toggleSensor = async (sensorNum: number, isActive: boolean) => {
        setIsUpdatingSensor(sensorNum);

        // Format: "1:ON" or "2:OFF"
        const value = `${sensorNum}:${isActive ? 'ON' : 'OFF'}`;

        try {
            const response = await fetch('/api/mqtt/control/setting', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    device_id: deviceId,
                    setting: 'sensor',
                    value: value
                }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                toast.success(`Sensor ${sensorNum} turned ${isActive ? 'ON' : 'OFF'}`);
            } else {
                toast.error(`Failed to toggle sensor ${sensorNum}`);
            }
        } catch (error) {
            toast.error(`Failed to toggle sensor ${sensorNum}`);
        } finally {
            setIsUpdatingSensor(null);
        }
    };

    // Helpers to safely format numeric analytics values
    const formatNum = (value: any, digits = 1, fallback = 'N/A') => {
        const n = Number(value);
        return Number.isFinite(n) ? n.toFixed(digits) : fallback;
    };

    const formatHours = (value: any) => {
        const n = Number(value);
        return Number.isFinite(n) ? n.toFixed(2) : '0.00';
    };


    return (
        <div className="space-y-6">
            {/* MQTT Connection Status */}
            <Card className="border-2 border-yellow-200 bg-yellow-50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Radio className="h-5 w-5 text-yellow-600" />
                            Broodinnox Connection
                        </CardTitle>
                        <div className="flex items-center gap-2">

                            {/* Device Online Badge */}
                            {isDeviceOnline ? (
                                <Badge className="bg-green-600">
                                    <Activity className="h-3 w-3 mr-1" />
                                    Device Online
                                </Badge>
                            ) : (
                                <Badge variant="destructive">
                                    <WifiOff className="h-3 w-3 mr-1" />
                                    Device Offline
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                            <p>Device ID: <span className="font-mono">{deviceId}</span></p>
                            {sensorData?.timestamp && (
                                <p className="mt-1">Last Update: {new Date(sensorData.timestamp).toLocaleString()}</p>
                            )}
                            {!sensorData?.timestamp && incubator.sensors_data?.last_update && (
                                <p className="mt-1 text-orange-600">Last Update: {new Date(incubator.sensors_data.last_update).toLocaleString()}</p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {!isConnected ? (
                                <Button
                                    onClick={handleConnect}
                                    disabled={isLoadingBroker || !brokerConfig || isConnecting}
                                    size="sm"
                                >
                                    {isConnecting ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            Connecting...
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="h-4 w-4 mr-2" />
                                            Connect
                                        </>
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleDisconnect}
                                    variant="destructive"
                                    size="sm"
                                    disabled={isDisconnecting}
                                >
                                    {isDisconnecting ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            Disconnecting...
                                        </>
                                    ) : (
                                        'Disconnect'
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                            Error: {error.message}
                        </div>
                    )}


                </CardContent>
            </Card>

            {/* Real-time Sensor Data and Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Real-time Sensor Data */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-emerald-600" />
                            Live Sensor Data (MQTT - Broodinnox)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {sensorData ? (
                            <>
                                {/* Average Temperature */}
                                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                                    <div className="flex items-center gap-2">
                                        <Thermometer className="h-5 w-5 text-red-600" />
                                        <span className="font-medium">Avg Temperature</span>
                                    </div>
                                    <span className="text-2xl font-bold text-red-600">
                                        {formatNum(sensorData.temperature)}°C
                                    </span>
                                </div>

                                {/* 4 Individual Sensors */}
                                {sensorData.sensors && (
                                    <div className="grid grid-cols-2 gap-2">
                                        {[1, 2, 3, 4].map((num) => {
                                            const tempKey = `temp${num}` as keyof typeof sensorData.sensors;
                                            const activeKey = `s${num}_active` as keyof typeof sensorData.sensors;
                                            const temp = sensorData.sensors?.[tempKey];
                                            const active = sensorData.sensors?.[activeKey];

                                            return (
                                                <div
                                                    key={num}
                                                    className={`p-2 rounded border ${active
                                                            ? 'bg-emerald-50 border-emerald-300'
                                                            : 'bg-gray-100 border-gray-300'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-medium">Sensor {num}</span>
                                                        <span className={`text-sm font-bold ${active ? 'text-emerald-700' : 'text-gray-500'}`}>
                                                            {formatNum(temp)}°C
                                                        </span>
                                                    </div>
                                                    <div className="mt-1">
                                                        <Badge
                                                            variant={active ? 'default' : 'secondary'}
                                                            className="text-xs"
                                                        >
                                                            {active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Cycle Progress */}
                                {sensorData.cycle_day !== undefined && sensorData.total_days !== undefined && (
                                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                            <span className="font-medium text-sm sm:text-base">Incubation Progress</span>
                                            <span className="text-sm font-bold">
                                                Day {sensorData.cycle_day} / {sensorData.total_days}
                                            </span>
                                        </div>
                                        <div className="w-full bg-emerald-200 rounded-full h-2 mb-2">
                                            <div
                                                className="bg-emerald-600 h-2 rounded-full transition-all"
                                                style={{
                                                    width: `${Math.min((sensorData.cycle_day / sensorData.total_days) * 100, 100)}%`,
                                                }}
                                            />
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-emerald-700">
                                            <CheckCircle className="h-3 w-3" />
                                            <span>Synced with active batch</span>
                                        </div>
                                    </div>
                                )}

                                {/* Active Batch Information */}
                                {activeBatch && (
                                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border-2 border-gray-300">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                            <div className="flex items-center gap-2">
                                                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                                                <span className="font-bold text-sm sm:text-base text-gray-900">Batch #{activeBatch.id}</span>
                                            </div>
                                            {activeBatch.is_completed ? (
                                                <Badge className="bg-red-500 text-xs"> Completed</Badge>
                                            ) : activeBatch.days_remaining !== null && activeBatch.days_remaining <= 3 ? (
                                                <Badge className="bg-yellow-500 text-xs">Ending Soon</Badge>
                                            ) : (
                                                <Badge className="bg-green-500 text-xs">✓ Active</Badge>
                                            )}
                                        </div>

                                        <div className="space-y-2 text-xs sm:text-sm">
                                            <div className="flex justify-between flex-wrap gap-1">
                                                <span className="text-gray-600">Start Date:</span>
                                                <span className="font-semibold">{activeBatch.start_date}</span>
                                            </div>
                                            {activeBatch.expected_completion_date && (
                                                <div className="flex justify-between flex-wrap gap-1">
                                                    <span className="text-gray-600">Expected End:</span>
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-semibold">{activeBatch.expected_completion_date}</span>

                                                    </div>
                                                </div>
                                            )}
                                            {activeBatch.days_remaining !== null && (
                                                <div className="flex justify-between flex-wrap gap-1">
                                                    <span className="text-gray-600">Days Remaining:</span>
                                                    <span className={`font-bold ${
                                                        activeBatch.is_completed || activeBatch.days_remaining < 0
                                                            ? 'text-red-600'
                                                            : activeBatch.days_remaining <= 3
                                                            ? 'text-yellow-600'
                                                            : 'text-green-600'
                                                    }`}>
                                                        {activeBatch.days_remaining < 0
                                                            ? `${Math.abs(Math.round(activeBatch.days_remaining))} days overdue`
                                                            : activeBatch.is_completed
                                                            ? 'Completed'
                                                            : `${Math.round(activeBatch.days_remaining)} days`
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {activeBatch.is_completed && (
                                            <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-center">
                                                <span className="text-red-800 font-bold text-xs sm:text-sm"> Ready for Harvest!</span>
                                            </div>
                                        )}
                                        {!activeBatch.is_completed && activeBatch.days_remaining !== null && activeBatch.days_remaining <= 3 && activeBatch.days_remaining > 0 && (
                                            <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-center">
                                                <span className="text-yellow-800 font-semibold text-xs sm:text-sm"> Batch ending soon - Prepare for harvest</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Relay Status */}
                                {sensorData.relay_status && (
                                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <div className="flex items-center gap-2">
                                            <Power className="h-5 w-5 text-yellow-600" />
                                            <span className="font-medium">Relay</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={sensorData.relay_status === 'ON' ? 'bg-emerald-500' : 'bg-gray-400'}>
                                                {sensorData.relay_status}
                                            </Badge>
                                            <Badge variant="outline">
                                                {sensorData.relay_mode}
                                            </Badge>
                                        </div>
                                    </div>
                                )}

                                {/* Temperature Thresholds */}
                                {sensorData.max_temp && sensorData.min_temp && (
                                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <div>
                                                <span className="text-xs text-muted-foreground">Max (Target):</span>
                                                <span className="ml-1 font-bold text-orange-600">{sensorData.max_temp}°C</span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-muted-foreground">Min:</span>
                                                <span className="ml-1 font-bold text-emerald-600">{sensorData.min_temp}°C</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-orange-700">
                                            <CheckCircle className="h-3 w-3" />
                                            <span>Target temp synced with max temp</span>
                                        </div>
                                    </div>
                                )}

                                {/* Error Status */}
                                {sensorData.error && sensorData.error !== 'OK' && (
                                    <div className="p-3 bg-red-100 border border-red-300 rounded text-sm text-red-700">
                                        ⚠️ Error: {sensorData.error}
                                    </div>
                                )}

                                <Separator />

                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <CheckCircle className="h-3 w-3 text-emerald-600" />
                                        <span>Real-time updates</span>
                                    </div>
                                    <span className="text-muted-foreground">
                                        {sensorData.timestamp
                                            ? new Date(sensorData.timestamp).toLocaleTimeString()
                                            : 'Just now'
                                        }
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground mb-2">Waiting for sensor data...</p>
                                {!isConnected && (
                                        <p className="text-sm text-red-500">Connect to Broodinnox  to receive data</p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Device Controls */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5 text-emerald-600" />
                                Device Controls (Broodinnox)
                            </CardTitle>
                            {sensorData && (
                                <Button
                                    onClick={() => {
                                        // Refresh inputs from sensor data
                                        if (sensorData.max_temp !== undefined) setTargetMaxTemp(String(sensorData.max_temp));
                                        if (sensorData.min_temp !== undefined) setTargetMinTemp(String(sensorData.min_temp));
                                        if (sensorData.total_days !== undefined) setTotalDays(String(sensorData.total_days));
                                        if (sensorData.relay_mode !== undefined) setRelayCommand(sensorData.relay_mode as 'ON' | 'OFF' | 'AUTO');
                                        toast.success('Control values refreshed from device');
                                    }}
                                    variant="outline"
                                    size="sm"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Sync Values
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Relay Control */}
                        <div className="p-4 bg-gray-50 rounded-lg border">
                            <div className="flex items-center justify-between mb-3">
                                <Label className="font-medium">Relay Control</Label>
                                {sensorData?.relay_mode && (
                                    <Badge variant="outline" className="text-xs">
                                        Current: {sensorData.relay_mode}
                                    </Badge>
                                )}
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <Button
                                    onClick={() => controlRelay('ON')}
                                    disabled={!isConnected || isControllingRelay}
                                    size="sm"
                                    variant={relayCommand === 'ON' ? 'default' : 'outline'}
                                >
                                    {isControllingRelay ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'ON'}
                                </Button>
                                <Button
                                    onClick={() => controlRelay('OFF')}
                                    disabled={!isConnected || isControllingRelay}
                                    size="sm"
                                    variant={relayCommand === 'OFF' ? 'default' : 'outline'}
                                >
                                    {isControllingRelay ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'OFF'}
                                </Button>
                                <Button
                                    onClick={() => controlRelay('AUTO')}
                                    disabled={!isConnected || isControllingRelay}
                                    size="sm"
                                    variant={relayCommand === 'AUTO' ? 'default' : 'outline'}
                                >
                                    {isControllingRelay ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'AUTO'}
                                </Button>
                            </div>
                        </div>

                        {/* Max Temperature */}
                        <div className="p-4 bg-gray-50 rounded-lg border">
                            <div className="flex items-center justify-between mb-3">
                                <Label className="font-medium">Max Temperature (°C)</Label>
                                {sensorData?.max_temp && (
                                    <Badge variant="outline" className="text-xs">
                                        Device: {sensorData.max_temp}°C
                                    </Badge>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    value={targetMaxTemp}
                                    onChange={(e) => setTargetMaxTemp(e.target.value)}
                                    placeholder="Max Temp"
                                    step="0.1"
                                    className="flex-1"
                                    disabled={isUpdatingMaxTemp}
                                />
                                <Button
                                    onClick={() => updateSetting('max_temp', targetMaxTemp)}
                                    disabled={!isConnected || isUpdatingMaxTemp}
                                    size="sm"
                                >
                                    {isUpdatingMaxTemp ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        'Set'
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Min Temperature */}
                        <div className="p-4 bg-gray-50 rounded-lg border">
                            <div className="flex items-center justify-between mb-3">
                                <Label className="font-medium">Min Temperature (°C)</Label>
                                {sensorData?.min_temp && (
                                    <Badge variant="outline" className="text-xs">
                                        Device: {sensorData.min_temp}°C
                                    </Badge>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    value={targetMinTemp}
                                    onChange={(e) => setTargetMinTemp(e.target.value)}
                                    placeholder="Min Temp"
                                    step="0.1"
                                    className="flex-1"
                                    disabled={isUpdatingMinTemp}
                                />
                                <Button
                                    onClick={() => updateSetting('min_temp', targetMinTemp)}
                                    disabled={!isConnected || isUpdatingMinTemp}
                                    size="sm"
                                >
                                    {isUpdatingMinTemp ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        'Set'
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Total Days */}
                        <div className="p-4 bg-gray-50 rounded-lg border">
                            <div className="flex items-center justify-between mb-3">
                                <Label className="font-medium">Total Incubation Days</Label>
                                {sensorData?.total_days && (
                                    <Badge variant="outline" className="text-xs">
                                        Device: {sensorData.total_days} days
                                    </Badge>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    value={totalDays}
                                    onChange={(e) => setTotalDays(e.target.value)}
                                    placeholder="Total Days"
                                    step="1"
                                    className="flex-1"
                                    disabled={isUpdatingTotalDays}
                                />
                                <Button
                                    onClick={() => updateSetting('total_days', totalDays)}
                                    disabled={!isConnected || isUpdatingTotalDays}
                                    size="sm"
                                >
                                    {isUpdatingTotalDays ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        'Set'
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Sensor Controls */}
                        <div className="p-4 bg-gray-50 rounded-lg border">
                            <div className="flex items-center justify-between mb-3">
                                <Label className="font-medium">Sensor Controls</Label>
                                <Badge variant="outline" className="text-xs">
                                    Toggle sensors ON/OFF
                                </Badge>
                            </div>
                            <div className="space-y-2">
                                {[1, 2, 3, 4].map((num) => {
                                    const activeKey = `s${num}_active` as keyof typeof sensorData.sensors;
                                    const tempKey = `temp${num}` as keyof typeof sensorData.sensors;
                                    const isActive = sensorData?.sensors?.[activeKey] ?? false;
                                    const temp = sensorData?.sensors?.[tempKey];

                                    return (
                                        <div
                                            key={num}
                                            className={`flex items-center justify-between p-3 rounded border ${
                                                isActive
                                                    ? 'bg-emerald-50 border-emerald-300'
                                                    : 'bg-gray-100 border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Thermometer className={`h-4 w-4 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                                                <div>
                                                    <p className="text-sm font-medium">Sensor {num}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {temp ? `${formatNum(temp)}°C` : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant={isActive ? 'default' : 'secondary'}
                                                    className="text-xs"
                                                >
                                                    {isActive ? 'ON' : 'OFF'}
                                                </Badge>
                                                <Switch
                                                    checked={isActive}
                                                    onCheckedChange={(checked) => toggleSensor(num, checked)}
                                                    disabled={!isConnected || isUpdatingSensor === num}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Enable or disable individual temperature sensors
                            </p>
                        </div>

                        {!isConnected && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                                ⚠️ Connect to Broodinnox  to control the device
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Alerts and Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Alerts */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5 text-orange-600" />
                                Active Alerts
                            </CardTitle>
                            {alerts.length > 0 && (
                                <Button
                                    onClick={clearAlerts}
                                    variant="outline"
                                    size="sm"
                                    disabled={isClearingAlerts}
                                >
                                    {isClearingAlerts ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            Clearing...
                                        </>
                                    ) : (
                                        'Clear All'
                                    )}
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {alerts.length > 0 ? (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {alerts.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className={`p-3 rounded border ${alert.severity === 'critical'
                                                ? 'bg-red-50 border-red-200'
                                                : alert.severity === 'warning'
                                                    ? 'bg-yellow-50 border-yellow-200'
                                                    : 'bg-emerald-50 border-emerald-200'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge
                                                        className={
                                                            alert.severity === 'critical'
                                                                ? 'bg-red-500'
                                                                : alert.severity === 'warning'
                                                                    ? 'bg-yellow-500'
                                                                    : 'bg-emerald-500'
                                                        }
                                                    >
                                                        {alert.alert_type}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(alert.created_at).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm">{alert.message}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                                <p className="text-muted-foreground">No active alerts</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Analytics */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-yellow-600" />
                                24-Hour Analytics
                            </CardTitle>
                            <Button
                                onClick={refreshAnalytics}
                                variant="outline"
                                size="sm"
                                disabled={isRefreshingAnalytics}
                            >
                                <RefreshCw className={`h-4 w-4 ${isRefreshingAnalytics ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {analytics ? (
                            <div className="space-y-3">
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="p-2 bg-emerald-50 rounded border border-emerald-200 text-center">
                                        <p className="text-xs text-muted-foreground">Avg Temp</p>
                                        <p className="text-lg font-bold text-emerald-600">
                                            {formatNum(analytics?.last_24h?.avg_temp)}°C
                                        </p>
                                    </div>
                                    <div className="p-2 bg-red-50 rounded border border-red-200 text-center">
                                        <p className="text-xs text-muted-foreground">Max Temp</p>
                                        <p className="text-lg font-bold text-red-600">
                                            {formatNum(analytics?.last_24h?.max_temp)}°C
                                        </p>
                                    </div>
                                    <div className="p-2 bg-emerald-50 rounded border border-emerald-200 text-center">
                                        <p className="text-xs text-muted-foreground">Min Temp</p>
                                        <p className="text-lg font-bold text-emerald-600">
                                            {formatNum(analytics?.last_24h?.min_temp)}°C
                                        </p>
                                    </div>
                                </div>

                                <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Relay Runtime</span>
                                        <span className="text-lg font-bold text-yellow-600">
                                            {formatHours(analytics?.last_24h?.relay_runtime_hours)}h
                                        </span>
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        <div className="flex justify-between">
                                            <span>Cycles: {analytics.last_24h.relay_cycles ?? 0}</span>
                                            <span>Readings: {analytics.last_24h.readings_count ?? 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
                                <p className="text-muted-foreground">Loading analytics...</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Message Log */}
            {/* {messages.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Radio className="h-5 w-5 text-gray-600" />
                            MQTT Messages ({messages.slice(-10).length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {messages.slice(-10).reverse().map((msg, idx) => (
                                <div key={idx} className="p-2 bg-gray-50 rounded text-xs">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-mono text-emerald-600">{msg.topic}</span>
                                        <span className="text-muted-foreground">
                                            {msg.timestamp.toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <pre className="text-muted-foreground overflow-x-auto">
                                        {JSON.stringify(msg.payload, null, 2)}
                                    </pre>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )} */}
        </div>
    );
}
