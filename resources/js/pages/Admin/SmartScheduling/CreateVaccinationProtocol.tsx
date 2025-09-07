import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    Syringe, 
    ChevronLeft,
    Save,
    AlertCircle
} from 'lucide-react';

interface FormData {
    vaccine_name: string;
    prevents_disease: string;
    target_breeds: string[];
    recommended_age_days: number;
    administration_method: string;
    dosage_amount: number;
    dosage_unit: string;
    booster_required: boolean;
    booster_interval_days: number;
    storage_temperature_min: number;
    storage_temperature_max: number;
    cost_per_dose: number;
    manufacturer: string;
    priority_level: string;
    is_mandatory: boolean;
    auto_recommend: boolean;
    description: string;
    instructions: string;
}

const CreateVaccinationProtocol: React.FC = () => {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        vaccine_name: '',
        prevents_disease: '',
        target_breeds: [],
        recommended_age_days: 7,
        administration_method: '',
        dosage_amount: 0,
        dosage_unit: 'ml',
        booster_required: false,
        booster_interval_days: 0,
        storage_temperature_min: 2,
        storage_temperature_max: 8,
        cost_per_dose: 0,
        manufacturer: '',
        priority_level: 'medium',
        is_mandatory: false,
        auto_recommend: true,
        description: '',
        instructions: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/smart-scheduling/protocols/vaccination');
    };

    const administrationMethods = [
        { value: 'subcutaneous', label: 'Subcutaneous' },
        { value: 'intramuscular', label: 'Intramuscular' },
        { value: 'intranasal', label: 'Intranasal' },
        { value: 'oral', label: 'Oral' },
        { value: 'eye_drop', label: 'Eye Drop' },
        { value: 'drinking_water', label: 'Drinking Water' },
    ];

    const dosageUnits = [
        { value: 'ml', label: 'ml' },
        { value: 'mg', label: 'mg' },
        { value: 'drops', label: 'drops' },
        { value: 'units', label: 'units' },
        { value: 'dose', label: 'dose' },
    ];

    const priorityLevels = [
        { value: 'critical', label: 'Critical' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' },
    ];

    return (
        <AdminLayout>
            <Head title="Create Vaccination Protocol" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Button asChild variant="outline">
                        <Link href="/admin/smart-scheduling">
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Back to Protocols
                        </Link>
                    </Button>
                    <div className="flex items-center space-x-3">
                        <Syringe className="h-8 w-8 text-purple-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Create Vaccination Protocol</h1>
                            <p className="text-gray-600">Add a new vaccination protocol to the system</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Basic Information */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="vaccine_name">Vaccine Name *</Label>
                                            <Input
                                                id="vaccine_name"
                                                value={data.vaccine_name}
                                                onChange={e => setData('vaccine_name', e.target.value)}
                                                className={errors.vaccine_name ? 'border-red-500' : ''}
                                                placeholder="Enter vaccine name"
                                            />
                                            {errors.vaccine_name && (
                                                <p className="text-sm text-red-600 mt-1">{errors.vaccine_name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="prevents_disease">Prevents Disease *</Label>
                                            <Input
                                                id="prevents_disease"
                                                value={data.prevents_disease}
                                                onChange={e => setData('prevents_disease', e.target.value)}
                                                className={errors.prevents_disease ? 'border-red-500' : ''}
                                                placeholder="Disease prevented by this vaccine"
                                            />
                                            {errors.prevents_disease && (
                                                <p className="text-sm text-red-600 mt-1">{errors.prevents_disease}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="recommended_age_days">Recommended Age (days) *</Label>
                                            <Input
                                                id="recommended_age_days"
                                                type="number"
                                                min="0"
                                                value={data.recommended_age_days}
                                                onChange={e => setData('recommended_age_days', parseInt(e.target.value) || 0)}
                                                className={errors.recommended_age_days ? 'border-red-500' : ''}
                                            />
                                            {errors.recommended_age_days && (
                                                <p className="text-sm text-red-600 mt-1">{errors.recommended_age_days}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="manufacturer">Manufacturer</Label>
                                            <Input
                                                id="manufacturer"
                                                value={data.manufacturer}
                                                onChange={e => setData('manufacturer', e.target.value)}
                                                placeholder="Manufacturer name"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value)}
                                            placeholder="Brief description of the vaccine"
                                            rows={3}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Administration Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Administration & Dosage</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="dosage_amount">Dosage Amount *</Label>
                                            <Input
                                                id="dosage_amount"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.dosage_amount}
                                                onChange={e => setData('dosage_amount', parseFloat(e.target.value) || 0)}
                                                className={errors.dosage_amount ? 'border-red-500' : ''}
                                            />
                                            {errors.dosage_amount && (
                                                <p className="text-sm text-red-600 mt-1">{errors.dosage_amount}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="dosage_unit">Dosage Unit *</Label>
                                            <Select value={data.dosage_unit} onValueChange={value => setData('dosage_unit', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select unit" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {dosageUnits.map(unit => (
                                                        <SelectItem key={unit.value} value={unit.value}>
                                                            {unit.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="administration_method">Administration Method *</Label>
                                            <Select value={data.administration_method} onValueChange={value => setData('administration_method', value)}>
                                                <SelectTrigger className={errors.administration_method ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select method" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {administrationMethods.map(method => (
                                                        <SelectItem key={method.value} value={method.value}>
                                                            {method.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.administration_method && (
                                                <p className="text-sm text-red-600 mt-1">{errors.administration_method}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="cost_per_dose">Cost per Dose</Label>
                                            <Input
                                                id="cost_per_dose"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.cost_per_dose}
                                                onChange={e => setData('cost_per_dose', parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="priority_level">Priority Level *</Label>
                                            <Select value={data.priority_level} onValueChange={value => setData('priority_level', value)}>
                                                <SelectTrigger className={errors.priority_level ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {priorityLevels.map(level => (
                                                        <SelectItem key={level.value} value={level.value}>
                                                            {level.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.priority_level && (
                                                <p className="text-sm text-red-600 mt-1">{errors.priority_level}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="instructions">Administration Instructions</Label>
                                        <Textarea
                                            id="instructions"
                                            value={data.instructions}
                                            onChange={e => setData('instructions', e.target.value)}
                                            placeholder="Detailed instructions for administration"
                                            rows={4}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Booster Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Booster Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Booster Required</Label>
                                            <p className="text-sm text-gray-500">Does this vaccine require a booster shot?</p>
                                        </div>
                                        <Switch
                                            checked={data.booster_required}
                                            onCheckedChange={checked => setData('booster_required', checked)}
                                        />
                                    </div>

                                    {data.booster_required && (
                                        <div>
                                            <Label htmlFor="booster_interval_days">Booster Interval (days)</Label>
                                            <Input
                                                id="booster_interval_days"
                                                type="number"
                                                min="1"
                                                value={data.booster_interval_days}
                                                onChange={e => setData('booster_interval_days', parseInt(e.target.value) || 0)}
                                                placeholder="Days between initial vaccination and booster"
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Settings Sidebar */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Storage Requirements</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="storage_temperature_min">Min Temperature (°C)</Label>
                                        <Input
                                            id="storage_temperature_min"
                                            type="number"
                                            value={data.storage_temperature_min}
                                            onChange={e => setData('storage_temperature_min', parseInt(e.target.value) || 0)}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="storage_temperature_max">Max Temperature (°C)</Label>
                                        <Input
                                            id="storage_temperature_max"
                                            type="number"
                                            value={data.storage_temperature_max}
                                            onChange={e => setData('storage_temperature_max', parseInt(e.target.value) || 0)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Protocol Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Mandatory Vaccination</Label>
                                            <p className="text-sm text-gray-500">Required for all birds</p>
                                        </div>
                                        <Switch
                                            checked={data.is_mandatory}
                                            onCheckedChange={checked => setData('is_mandatory', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Auto-recommend</Label>
                                            <p className="text-sm text-gray-500">Enable AI recommendations</p>
                                        </div>
                                        <Switch
                                            checked={data.auto_recommend}
                                            onCheckedChange={checked => setData('auto_recommend', checked)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Submit Button */}
                            <Card>
                                <CardContent className="pt-6">
                                    <Button 
                                        type="submit" 
                                        className="w-full" 
                                        disabled={processing}
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {processing ? 'Creating...' : 'Create Protocol'}
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Validation Summary */}
                            {Object.keys(errors).length > 0 && (
                                <Alert className="border-red-200 bg-red-50">
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-700">
                                        <p className="font-medium mb-2">Please fix the following validation errors:</p>
                                        <ul className="list-disc list-inside space-y-1">
                                            {Object.entries(errors).map(([field, message]) => (
                                                <li key={field} className="text-sm">
                                                    <strong>{field}:</strong> {message}
                                                </li>
                                            ))}
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default CreateVaccinationProtocol;
