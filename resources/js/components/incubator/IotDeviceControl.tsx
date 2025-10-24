import React, { useState } from 'react';
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
    Power,
    Lightbulb,
    RefreshCw,
    CheckCircle,
    Bell,
    Clock,
    RotateCcw,
    Settings,
} from 'lucide-react';
import { toast } from 'sonner';

interface IotDeviceControlProps {
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
        sensors_data: {
            last_reading: string;
        };
        settings: {
            alarm_enabled: boolean;
            temp_alert_threshold?: number;
            humidity_alert_threshold?: number;
            data_logging?: boolean;
            logging_interval?: number;
        };
    };
    data: {
        settings: {
            alarm_enabled: boolean;
            temp_alert_threshold?: number;
            humidity_alert_threshold?: number;
            data_logging?: boolean;
            logging_interval?: number;
        };
    };
    setData: (key: string, value: any) => void;
    getStatusColor: (status: string) => string;
}

export default function IotDeviceControl({
    incubator,
    data,
    setData,
    getStatusColor
}: IotDeviceControlProps) {
    const [deviceData, setDeviceData] = useState<any>(null);
    const [isLoadingDeviceData, setIsLoadingDeviceData] = useState(false);
    const [ledState, setLedState] = useState(0);

    // IoT Device Functions
    const fetchDeviceData = async () => {
        setIsLoadingDeviceData(true);
        try {
            const response = await fetch(`/api/data?device=${incubator.serial_number}`);
            const data = await response.json();
            setDeviceData(data);
            if (data.ledState !== undefined) {
                setLedState(data.ledState);
            }
            toast.success('Device data refreshed');
        } catch (error) {
            toast.error('Failed to fetch device data');
        } finally {
            setIsLoadingDeviceData(false);
        }
    };

    const sendCommand = async (command: string, value: any) => {
        try {
            const response = await fetch('/api/commands', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    device_id: incubator.serial_number,
                    command: command,
                    value: value,
                    incubator_id: incubator.id
                }),
            });

            if (response.ok) {
                toast.success(`Command "${command}" sent successfully`);
                // Refresh data after sending command
                setTimeout(() => fetchDeviceData(), 2000);
            } else {
                toast.error('Failed to send command');
            }
        } catch (error) {
            toast.error('Error sending command');
        }
    };

    const toggleLED = () => {
        const newState = ledState === 1 ? 0 : 1;
        setLedState(newState);
        sendCommand('setLED', newState);
    };

    return (
        <div className="space-y-6">
            {/* Real-time Sensor Data and Device Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Real-time Sensor Data */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-emerald-600" />
                                Real-time Sensor Data
                            </CardTitle>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={fetchDeviceData}
                                disabled={isLoadingDeviceData}
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingDeviceData ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {deviceData ? (
                            <>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                                        <div className="flex items-center gap-2">
                                            <Thermometer className="h-5 w-5 text-red-600" />
                                            <span className="font-medium">Temperature</span>
                                        </div>
                                        <span className="text-2xl font-bold text-red-600">
                                            {deviceData.temp || deviceData.current_temperature || 'N/A'}°C
                                        </span>
                                    </div>

                                   

                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center gap-2">
                                            <Wifi className="h-5 w-5 text-gray-600" />
                                            <span className="font-medium">Device ID</span>
                                        </div>
                                        <span className="text-sm font-mono">
                                            {deviceData.device || incubator.serial_number}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-5 w-5 text-gray-600" />
                                            <span className="font-medium">Last Reading</span>
                                        </div>
                                        <span className="text-sm">
                                            {deviceData.timestamp
                                                ? new Date(deviceData.timestamp).toLocaleString()
                                                : 'Just now'
                                            }
                                        </span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground mb-4">No device data available</p>
                                <Button onClick={fetchDeviceData} disabled={isLoadingDeviceData}>
                                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingDeviceData ? 'animate-spin' : ''}`} />
                                    Fetch Device Data
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Device Controls */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-blue-600" />
                            Device Controls
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            {/* Device Information */}
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <Label className="font-medium mb-3 block">Device Information</Label>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Serial Number:</span>
                                        <span className="font-mono">{incubator.serial_number}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Model:</span>
                                        <span>{incubator.model}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Status:</span>
                                        <Badge className={getStatusColor(incubator.status.value)}>
                                            {incubator.status.label}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
