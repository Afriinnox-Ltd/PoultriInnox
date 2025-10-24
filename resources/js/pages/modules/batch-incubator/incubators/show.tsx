import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Edit,
    Save,
    X,
} from 'lucide-react';
import { Link, Head, useForm, usePage, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { toast } from 'sonner';
import IotDeviceControl from '@/components/incubator/IotDeviceControl';
import IncubatorOverview from '@/components/incubator/IncubatorOverview';
import IncubatorSettings from '@/components/incubator/IncubatorSettings';
import IncubatorBatches from '@/components/incubator/IncubatorBatches';
import IncubatorMaintenance from '@/components/incubator/IncubatorMaintenance';
import MqttIotDeviceControl from '@/components/incubator/MqttIotDeviceControl';

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

        // Update the access control keypad code
        accessForm.setData('access_control', {
            ...accessForm.data.access_control,
            keypad_code: newCode
        });

        // Submit the access form
        accessForm.put(`/batch-incubator/incubators/${incubator.id}/access`, {
            onSuccess: () => {
                toast.success('New keypad code generated successfully!');
            },
            onError: () => {
                toast.error('Failed to generate new keypad code.');
            },
            preserveState: true,
            preserveScroll: true,
        });
    }; const handleUpdate = (e: React.FormEvent) => {
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
            case 'running': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'idle': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'error': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Incubator: ${incubator.name}`} />

            <div className="space-y-6 ">
                {/* Header */}
                <div className="flex items-center flex-wrap gap-3 justify-between p-6">
                    <div className="flex items-center gap-4">

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


                {/* Main Content Tabs */}
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="batches">Current Batches</TabsTrigger>
                        <TabsTrigger value="iot-control">IoT Device</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                        <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <IncubatorOverview
                            incubator={incubator}
                            isEditing={isEditing}
                            data={data}
                            setData={setData}
                            errors={errors}
                            handleUpdate={handleUpdate}
                        />
                    </TabsContent>

                    {/* IoT Device Control Tab */}
                    <TabsContent value="iot-control" className="space-y-6">
                        {/* <IotDeviceControl
                            incubator={incubator}
                            data={data}
                            setData={setData}
                            getStatusColor={getStatusColor}
                        /> */}
                        <MqttIotDeviceControl incubator={incubator} />
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="space-y-6">
                        <IncubatorSettings
                            incubator={incubator}
                            isOwner={isOwner}
                            searchForm={searchForm}
                            handleGrantAccessByEmail={handleGrantAccessByEmail}
                            handleRevokeAccess={handleRevokeAccess}
                            accessForm={accessForm}
                            handleUpdate={handleUpdate}
                            processing={processing}
                        />
                    </TabsContent>

                    {/* Current Batches Tab */}
                    <TabsContent value="batches" className="space-y-4">
                        <IncubatorBatches
                            batches={incubator.current_batches}
                            getStatusColor={getStatusColor}
                        />
                    </TabsContent>

                    {/* Maintenance Tab */}
                    <TabsContent value="maintenance" className="space-y-6">
                        <IncubatorMaintenance
                            incubator={incubator}
                            maintenanceForm={maintenanceForm}
                            handleMaintenanceRecord={handleMaintenanceRecord}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
