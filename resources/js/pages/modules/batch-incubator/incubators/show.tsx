import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Settings,
    Thermometer,
    Droplets,
    Activity,
    Calendar,
    Users,
    Wrench,
    AlertTriangle,
    CheckCircle,
    Clock,
    ArrowLeft,
    Edit,
    Save,
    X,
    Shield,
    RotateCcw,
    Bell,
    Zap,
    Eye,
    EyeOff,
    Search
} from 'lucide-react';
import { Link, Head, useForm, usePage, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { toast } from 'sonner';

interface Batch {
    id: number;
    batch_code: string;
    name: string;
    breed: string;
    status: {
        value: string;
        label: string;
        color: string;
    };
    current_count: number;
    start_date: string;
    hatch_date: string;
    age_days: number;
    manager: {
        name: string;
    };
}

interface Incubator {
    id: number;
    name: string;
    model: string;
    serial_number: string;
    description: string;
    status: {
        value: string;
        label: string;
        color: string;
    };
    capacity: number;
    current_load: number;
    utilization_rate: number;
    target_temperature: number;
    target_humidity: number;
    current_temperature: number;
    current_humidity: number;
    temperature_variance: number;
    humidity_variance: number;
    location: string;
    settings: {
        auto_turn: boolean;
        turn_interval: number;
        alarm_enabled: boolean;
        backup_power: boolean;
        // Core implemented settings only
        temp_alert_threshold?: number;
        humidity_alert_threshold?: number;
        data_logging?: boolean;
        logging_interval?: number;
        // Access control settings
        rfid_enabled?: boolean;
        auto_lock?: boolean;
        lock_timeout?: number;
    };
    sensors_data: {
        last_reading: string;
    };
    access_control: {
        keypad_code: string;
        rfid_enabled: boolean;
    };
    last_maintenance: string;
    next_maintenance: string;
    maintenance_notes: string;
    maintenance_due: boolean;
    current_batches: Batch[];
    authorized_users: number[];
    authorized_users_details: User[];
    owner: {
        id: number;
        name: string;
    };
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface IncubatorShowProps {
    incubator: Incubator;
    availableUsers: User[];
    searchUser?: User;
}

export default function IncubatorShow({ incubator, availableUsers, searchUser }: IncubatorShowProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [showKeypadCode, setShowKeypadCode] = useState(false);

    // Handle search user from props (after search response)
    const searchResults = searchUser ? [searchUser] : [];

    const { auth } = usePage().props as any;
    const isOwner = auth.user?.id === incubator.owner.id;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Batch Incubator',
            href: '/batch-incubator',
        },
        {
            title: 'Incubators',
            href: '/batch-incubator/incubators',
        },
        {
            title: 'Details',
            href: `/batch-incubator/incubators/${incubator.id}`,
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: incubator.name,
        description: incubator.description || '',
        current_load: incubator.current_load,
        target_temperature: incubator.target_temperature,
        target_humidity: incubator.target_humidity,
        current_temperature: incubator.current_temperature,
        current_humidity: incubator.current_humidity,
        location: incubator.location || '',
        maintenance_notes: incubator.maintenance_notes || '',
        settings: incubator.settings,
    });

    const statusForm = useForm({
        status: incubator.status.value,
    });

    const maintenanceForm = useForm({
        maintenance_notes: '',
        next_maintenance_days: 30,
    });

    const accessForm = useForm({
        authorized_users: incubator.authorized_users || [],
        access_control: {
            keypad_code: incubator.access_control?.keypad_code || '',
            rfid_enabled: incubator.access_control?.rfid_enabled || false,
        },
    });

    const searchForm = useForm({
        email: '',
    });

    const handleGrantAccessByEmail = () => {
        if (!searchForm.data.email.trim()) {
            toast.error('Please enter an email address');
            return;
        }

        searchForm.post(`/batch-incubator/incubators/${incubator.id}/grant-access`, {
            onSuccess: () => {
                toast.success('User access granted successfully!');
                searchForm.setData('email', ''); // Clear the email field
            },
            onError: (errors) => {
                if (errors.email) {
                    toast.error(errors.email);
                } else {
                    toast.error('Failed to grant access');
                }
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleRevokeAccess = (userId: number) => {
        console.log('Revoking access for user:', userId);

        // Use DELETE request to the dedicated revoke route
        router.delete(`/batch-incubator/incubators/${incubator.id}/revoke-access/${userId}`, {
            onSuccess: () => {
                console.log('User access revoked successfully');
                toast.success('User access revoked successfully!');
            },
            onError: (errors: any) => {
                console.log('Error revoking access:', errors);
                toast.error('Failed to revoke user access.');
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleGenerateNewKeypadCode = () => {
        const newCode = String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0');

        // Update the form data first
        setData('access_control', {
            keypad_code: newCode,
            rfid_enabled: incubator.access_control?.rfid_enabled || false,
        });

        // Then submit the update
        put(`/batch-incubator/incubators/${incubator.id}`, {
            onSuccess: () => {
                toast.success('New keypad code generated successfully!');
            },
            onError: () => {
                toast.error('Failed to generate new keypad code.');
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/batch-incubator/incubators/${incubator.id}`, {
            onSuccess: () => {
                setIsEditing(false);
                toast.success('Incubator details updated successfully!');
            },
            onError: () => {
                toast.error('Failed to update incubator details.');
            },
        });
    };

    const handleStatusUpdate = (newStatus: string) => {
        statusForm.setData('status', newStatus);
        statusForm.put(`/batch-incubator/incubators/${incubator.id}/status`);
    };

    const handleMaintenanceRecord = (e: React.FormEvent) => {
        e.preventDefault();
        maintenanceForm.post(`/batch-incubator/incubators/${incubator.id}/maintenance`, {
            onSuccess: () => {
                maintenanceForm.reset();
                toast.success('Maintenance record added successfully!');
            },
            onError: () => {
                toast.error('Failed to add maintenance record.');
            },

        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'bg-green-100 text-green-800 border-green-200';
            case 'idle': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'error': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getTemperatureStatus = () => {
        const variance = Math.abs(incubator.temperature_variance);
        if (variance <= 0.5) return { icon: CheckCircle, color: 'text-green-600', status: 'Optimal' };
        if (variance <= 1.0) return { icon: AlertTriangle, color: 'text-yellow-600', status: 'Acceptable' };
        return { icon: AlertTriangle, color: 'text-red-600', status: 'Critical' };
    };

    const getHumidityStatus = () => {
        const variance = Math.abs(incubator.humidity_variance);
        if (variance <= 2) return { icon: CheckCircle, color: 'text-green-600', status: 'Optimal' };
        if (variance <= 5) return { icon: AlertTriangle, color: 'text-yellow-600', status: 'Acceptable' };
        return { icon: AlertTriangle, color: 'text-red-600', status: 'Critical' };
    };

    const tempStatus = getTemperatureStatus();
    const humidityStatus = getHumidityStatus();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Incubator: ${incubator.name}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/batch-incubator/incubators">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Incubators
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{incubator.name}</h1>
                            <p className="text-muted-foreground">{incubator.model} • {incubator.serial_number}</p>
                        </div>
                        <Badge className={getStatusColor(incubator.status.value)}>
                            {incubator.status.label}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                        {!isEditing ? (
                            <Button onClick={() => setIsEditing(true)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Details
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button onClick={() => setIsEditing(false)} variant="outline">
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button onClick={handleUpdate} disabled={processing}>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Quick Actions */}
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant={incubator.status.value === 'running' ? 'default' : 'outline'}
                        onClick={() => handleStatusUpdate('running')}
                        disabled={statusForm.processing}
                    >
                        <Activity className="h-4 w-4 mr-2" />
                        Start
                    </Button>
                    <Button
                        size="sm"
                        variant={incubator.status.value === 'idle' ? 'default' : 'outline'}
                        onClick={() => handleStatusUpdate('idle')}
                        disabled={statusForm.processing}
                    >
                        <Clock className="h-4 w-4 mr-2" />
                        Idle
                    </Button>
                    <Button
                        size="sm"
                        variant={incubator.status.value === 'maintenance' ? 'default' : 'outline'}
                        onClick={() => handleStatusUpdate('maintenance')}
                        disabled={statusForm.processing}
                    >
                        <Wrench className="h-4 w-4 mr-2" />
                        Maintenance
                    </Button>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                        <TabsTrigger value="batches">Current Batches</TabsTrigger>
                        <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        {/* Environmental Monitoring */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Thermometer className="h-5 w-5 text-red-500" />
                                        Temperature Monitoring
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Current</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-bold">{incubator.current_temperature}°C</span>
                                            <tempStatus.icon className={`h-5 w-5 ${tempStatus.color}`} />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Target</span>
                                        <span className="font-medium">{incubator.target_temperature}°C</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Variance</span>
                                        <span className={`font-medium ${Math.abs(incubator.temperature_variance) > 1 ? 'text-red-600' : 'text-green-600'}`}>
                                            {incubator.temperature_variance > 0 ? '+' : ''}{incubator.temperature_variance}°C
                                        </span>
                                    </div>
                                    <Badge variant="outline" className={tempStatus.color.replace('text-', 'border-').replace('-600', '-200')}>
                                        {tempStatus.status}
                                    </Badge>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Droplets className="h-5 w-5 text-blue-500" />
                                        Humidity Monitoring
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Current</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-bold">{incubator.current_humidity}%</span>
                                            <humidityStatus.icon className={`h-5 w-5 ${humidityStatus.color}`} />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Target</span>
                                        <span className="font-medium">{incubator.target_humidity}%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Variance</span>
                                        <span className={`font-medium ${Math.abs(incubator.humidity_variance) > 5 ? 'text-red-600' : 'text-green-600'}`}>
                                            {incubator.humidity_variance > 0 ? '+' : ''}{incubator.humidity_variance}%
                                        </span>
                                    </div>
                                    <Badge variant="outline" className={humidityStatus.color.replace('text-', 'border-').replace('-600', '-200')}>
                                        {humidityStatus.status}
                                    </Badge>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Capacity and Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Capacity Utilization</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Current Load</span>
                                            <span className="font-bold">{incubator.current_load}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Capacity</span>
                                            <span>{incubator.capacity}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full"
                                                style={{ width: `${incubator.utilization_rate}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-center text-sm text-muted-foreground">
                                            {incubator.utilization_rate}% utilized
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Location & Owner</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Location</Label>
                                        <p className="font-medium">{incubator.location || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Owner</Label>
                                        <p className="font-medium">{incubator.owner.name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Description</Label>
                                        <p className="text-sm">{incubator.description || 'No description provided'}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Last Reading</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-green-600" />
                                            <span className="text-sm">Sensors Active</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Last reading: {new Date(incubator.sensors_data.last_reading).toLocaleString()}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Edit Form */}
                        {isEditing && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Edit Incubator Details</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleUpdate} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="name">Name</Label>
                                                <Input
                                                    id="name"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                />
                                                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                                            </div>
                                            <div>
                                                <Label htmlFor="location">Location</Label>
                                                <Input
                                                    id="location"
                                                    value={data.location}
                                                    onChange={(e) => setData('location', e.target.value)}
                                                />
                                                {errors.location && <p className="text-sm text-red-600 mt-1">{errors.location}</p>}
                                            </div>
                                            <div>
                                                <Label htmlFor="current_load">Current Load</Label>
                                                <Input
                                                    id="current_load"
                                                    type="number"
                                                    min="0"
                                                    max={incubator.capacity}
                                                    value={data.current_load}
                                                    onChange={(e) => setData('current_load', parseInt(e.target.value))}
                                                />
                                                {errors.current_load && <p className="text-sm text-red-600 mt-1">{errors.current_load}</p>}
                                            </div>
                                            <div>
                                                <Label htmlFor="target_temperature">Target Temperature (°C)</Label>
                                                <Input
                                                    id="target_temperature"
                                                    type="number"
                                                    step="0.1"
                                                    min="30"
                                                    max="45"
                                                    value={data.target_temperature}
                                                    onChange={(e) => setData('target_temperature', parseFloat(e.target.value))}
                                                />
                                                {errors.target_temperature && <p className="text-sm text-red-600 mt-1">{errors.target_temperature}</p>}
                                            </div>
                                            <div>
                                                <Label htmlFor="target_humidity">Target Humidity (%)</Label>
                                                <Input
                                                    id="target_humidity"
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    max="100"
                                                    value={data.target_humidity}
                                                    onChange={(e) => setData('target_humidity', parseFloat(e.target.value))}
                                                />
                                                {errors.target_humidity && <p className="text-sm text-red-600 mt-1">{errors.target_humidity}</p>}
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                                            />
                                            {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Settings className="h-5 w-5" />
                                        Operational Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Auto Turn</Label>
                                            <p className="text-xs text-muted-foreground">Automatically turn eggs</p>
                                        </div>
                                        <Switch
                                            checked={data.settings.auto_turn}
                                            onCheckedChange={(checked: boolean) => setData('settings', {...data.settings, auto_turn: checked})}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Turn Interval (hours)</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            max="24"
                                            value={data.settings.turn_interval}
                                            onChange={(e) => setData('settings', {...data.settings, turn_interval: parseInt(e.target.value)})}
                                            disabled={!data.settings.auto_turn}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label className="flex items-center gap-2">
                                                <Bell className="h-4 w-4" />
                                                Alarm Enabled
                                            </Label>
                                            <p className="text-xs text-muted-foreground">Alert for temperature/humidity variance</p>
                                        </div>
                                        <Switch
                                            checked={data.settings.alarm_enabled}
                                            onCheckedChange={(checked: boolean) => setData('settings', {...data.settings, alarm_enabled: checked})}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Temperature Alert Threshold (°C)</Label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            min="0.1"
                                            max="5"
                                            value={data.settings.temp_alert_threshold || 1.0}
                                            onChange={(e) => setData('settings', {...data.settings, temp_alert_threshold: parseFloat(e.target.value)})}
                                            disabled={!data.settings.alarm_enabled}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Humidity Alert Threshold (%)</Label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            min="1"
                                            max="10"
                                            value={data.settings.humidity_alert_threshold || 3.0}
                                            onChange={(e) => setData('settings', {...data.settings, humidity_alert_threshold: parseFloat(e.target.value)})}
                                            disabled={!data.settings.alarm_enabled}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label className="flex items-center gap-2">
                                                <Zap className="h-4 w-4" />
                                                Backup Power
                                            </Label>
                                            <p className="text-xs text-muted-foreground">Enable backup power system</p>
                                        </div>
                                        <Switch
                                            checked={data.settings.backup_power}
                                            onCheckedChange={(checked: boolean) => setData('settings', {...data.settings, backup_power: checked})}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Access Control & Security
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Keypad Code</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type={showKeypadCode ? "text" : "password"}
                                                value={incubator.access_control.keypad_code}
                                                readOnly
                                                className="font-mono"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowKeypadCode(!showKeypadCode)}
                                            >
                                                {showKeypadCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                title="Generate new code"
                                            >
                                                <RotateCcw className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>RFID Access</Label>
                                            <p className="text-xs text-muted-foreground">Enable RFID card access</p>
                                        </div>
                                        <Switch
                                            checked={data.settings.rfid_enabled || false}
                                            onCheckedChange={(checked: boolean) => setData('settings', {...data.settings, rfid_enabled: checked})}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Auto Lock</Label>
                                            <p className="text-xs text-muted-foreground">Lock after inactivity</p>
                                        </div>
                                        <Switch
                                            checked={data.settings.auto_lock || false}
                                            onCheckedChange={(checked: boolean) => setData('settings', {...data.settings, auto_lock: checked})}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Lock Timeout (minutes)</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            max="60"
                                            value={data.settings.lock_timeout || 10}
                                            onChange={(e) => setData('settings', {...data.settings, lock_timeout: parseInt(e.target.value)})}
                                            disabled={!data.settings.auto_lock}
                                        />
                                    </div>

                                    <Separator />

                                    <div className="space-y-3">
                                        <Label className="text-sm font-medium">User Access Management</Label>
                                        <div className="space-y-2">
                                            {/* Owner */}
                                            <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-4 w-4 text-green-600" />
                                                    <div>
                                                        <span className="text-sm font-medium">{incubator.owner.name}</span>
                                                        <Badge variant="outline" className="ml-2 text-xs bg-green-100 text-green-700 border-green-300">Owner</Badge>
                                                    </div>
                                                </div>
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            </div>

                                            {/* Currently Authorized Users */}
                                            {incubator.authorized_users_details?.map(user => (
                                                <div key={user.id} className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-4 w-4 text-blue-600" />
                                                        <div>
                                                            <span className="text-sm font-medium">{user.name}</span>
                                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">Authorized</Badge>
                                                        {isOwner && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleRevokeAccess(user.id)}
                                                                disabled={accessForm.processing}
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}

                                            {/* User Email Input - Only for Owner */}
                                            {isOwner && (
                                                <div className="space-y-2 pt-3 border-t">
                                                    <Label className="text-xs text-muted-foreground">Grant Access to User</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            type="email"
                                                            placeholder="Enter user's email address"
                                                            disabled={searchForm.processing}
                                                            value={searchForm.data.email}
                                                            onChange={(e) => searchForm.setData('email', e.target.value)}
                                                            className="flex-1"
                                                            onKeyPress={(e) => e.key === 'Enter' && handleGrantAccessByEmail()}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="default"
                                                            onClick={handleGrantAccessByEmail}
                                                            disabled={searchForm.processing || !searchForm.data.email.trim()}
                                                            className="bg-green-600 hover:bg-green-700"
                                                        >
                                                            {searchForm.processing ? (
                                                                <RotateCcw className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Users className="h-4 w-4" />
                                                            )}
                                                            {searchForm.processing ? 'Adding...' : 'Grant Access'}
                                                        </Button>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Enter the email address and click "Grant Access" to immediately add the user to this incubator.
                                                    </p>
                                                </div>
                                            )}

                                            {/* Non-owner message */}
                                            {!isOwner && (
                                                <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                                                    <p className="text-sm text-yellow-800">
                                                        Only the incubator owner can manage user access settings.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">Serial Number</Label>
                                        <p className="font-mono text-sm">{incubator.serial_number}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5" />
                                        System Monitoring
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Data Logging</Label>
                                            <p className="text-xs text-muted-foreground">Log sensor readings</p>
                                        </div>
                                        <Switch
                                            checked={data.settings.data_logging !== false}
                                            onCheckedChange={(checked: boolean) => setData('settings', {...data.settings, data_logging: checked})}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Logging Interval (minutes)</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            max="60"
                                            value={data.settings.logging_interval || 5}
                                            onChange={(e) => setData('settings', {...data.settings, logging_interval: parseInt(e.target.value)})}
                                            disabled={data.settings.data_logging === false}
                                        />
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">Current Status</Label>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Temperature:</span>
                                                <p className="font-medium">{incubator.current_temperature}°C</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Humidity:</span>
                                                <p className="font-medium">{incubator.current_humidity}%</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">System Information</Label>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Serial Number:</span>
                                                <span className="font-mono">{incubator.serial_number}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Last Reading:</span>
                                                <span>{incubator.sensors_data.last_reading}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Save Settings Button */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium">Save Settings</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Apply all configuration changes to the incubator
                                        </p>
                                    </div>
                                    <Button onClick={handleUpdate} disabled={processing}>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save All Settings
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Current Batches Tab */}
                    <TabsContent value="batches" className="space-y-4">
                        {incubator.current_batches.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {incubator.current_batches.map((batch) => (
                                    <Card key={batch.id}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg">{batch.name}</CardTitle>
                                                <Badge className={getStatusColor(batch.status.value)}>
                                                    {batch.status.label}
                                                </Badge>
                                            </div>
                                            <CardDescription>{batch.batch_code}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Breed</span>
                                                <span className="text-sm font-medium">{batch.breed}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Count</span>
                                                <span className="text-sm font-medium">{batch.current_count}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Age</span>
                                                <span className="text-sm font-medium">{batch.age_days} days</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Manager</span>
                                                <span className="text-sm font-medium">{batch.manager.name}</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">Hatch Date</span>
                                                <span className="text-sm font-medium">
                                                    {new Date(batch.hatch_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No Active Batches</h3>
                                    <p className="text-sm text-muted-foreground text-center mb-4">
                                        This incubator currently has no active batches assigned.
                                    </p>
                                    <Button asChild>
                                        <Link href="/batch-incubator/batches/create">
                                            Add Batch
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Maintenance Tab */}
                    <TabsContent value="maintenance" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Maintenance Schedule
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">Last Maintenance</Label>
                                        <p className="font-medium">
                                            {incubator.last_maintenance
                                                ? new Date(incubator.last_maintenance).toLocaleDateString()
                                                : 'No maintenance recorded'
                                            }
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">Next Maintenance</Label>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">
                                                {incubator.next_maintenance
                                                    ? new Date(incubator.next_maintenance).toLocaleDateString()
                                                    : 'Not scheduled'
                                                }
                                            </p>
                                            {incubator.maintenance_due && (
                                                <Badge variant="destructive">
                                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                                    Due
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {incubator.maintenance_notes && (
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">Last Notes</Label>
                                            <p className="text-sm bg-gray-50 p-2 rounded">
                                                {incubator.maintenance_notes}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Record Maintenance</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleMaintenanceRecord} className="space-y-4">
                                        <div>
                                            <Label htmlFor="maintenance_notes">Maintenance Notes</Label>
                                            <Textarea
                                                id="maintenance_notes"
                                                placeholder="Describe the maintenance performed..."
                                                value={maintenanceForm.data.maintenance_notes}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => maintenanceForm.setData('maintenance_notes', e.target.value)}
                                            />
                                            {maintenanceForm.errors.maintenance_notes && <p className="text-sm text-red-600 mt-1">{maintenanceForm.errors.maintenance_notes}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="next_maintenance_days">Next Maintenance (days)</Label>
                                            <Input
                                                id="next_maintenance_days"
                                                type="number"
                                                min="1"
                                                max="365"
                                                value={maintenanceForm.data.next_maintenance_days}
                                                onChange={(e) => maintenanceForm.setData('next_maintenance_days', parseInt(e.target.value))}
                                            />
                                            {maintenanceForm.errors.next_maintenance_days && <p className="text-sm text-red-600 mt-1">{maintenanceForm.errors.next_maintenance_days}</p>}
                                        </div>

                                        <Button type="submit" disabled={maintenanceForm.processing}>
                                            <Wrench className="h-4 w-4 mr-2" />
                                            Record Maintenance
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
