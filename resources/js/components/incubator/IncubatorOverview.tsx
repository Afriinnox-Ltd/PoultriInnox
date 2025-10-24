import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Thermometer,
    Droplets,
    Activity,
    AlertTriangle,
    CheckCircle,
} from 'lucide-react';

interface IncubatorOverviewProps {
    incubator: {
        id: number;
        name: string;
        description: string;
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
        owner: {
            name: string;
        };
        sensors_data: {
            last_reading: string;
        };
    };
    isEditing: boolean;
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
    handleUpdate: (e: React.FormEvent) => void;
}

export default function IncubatorOverview({
    incubator,
    isEditing,
    data,
    setData,
    errors,
    handleUpdate
}: IncubatorOverviewProps) {
    // Temperature status
    const tempStatus = {
        status: Math.abs(incubator.temperature_variance) <= 0.5 ? 'Optimal' :
                Math.abs(incubator.temperature_variance) <= 1 ? 'Good' : 'Warning',
        icon: Math.abs(incubator.temperature_variance) <= 1 ? CheckCircle : AlertTriangle,
        color: Math.abs(incubator.temperature_variance) <= 1 ? 'text-emerald-600' : 'text-yellow-600'
    };

  

    return (
        <div className="space-y-6">
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
                            <span className={`font-medium ${Math.abs(incubator.temperature_variance) > 1 ? 'text-red-600' : 'text-emerald-600'}`}>
                                {incubator.temperature_variance > 0 ? '+' : ''}{incubator.temperature_variance}°C
                            </span>
                        </div>
                        <Badge variant="outline" className={tempStatus.color.replace('text-', 'border-').replace('-600', '-200')}>
                            {tempStatus.status}
                        </Badge>
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
        </div>
    );
}
