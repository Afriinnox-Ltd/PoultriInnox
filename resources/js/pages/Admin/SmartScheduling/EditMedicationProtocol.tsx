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
    Pill, 
    ChevronLeft,
    Save,
    AlertCircle
} from 'lucide-react';

interface MedicationProtocol {
    id: number;
    medication_name: string;
    medication_type: string;
    target_disease: string | null;
    target_breeds: string[] | null;
    age_range_start: number;
    age_range_end: number;
    dosage_per_kg: number;
    dosage_unit: string;
    application_method: string;
    treatment_duration_days: number;
    withdrawal_period_days: number;
    cost_per_unit: number | null;
    manufacturer: string | null;
    is_emergency_protocol: boolean;
    auto_recommend: boolean;
    description: string | null;
    instructions: string | null;
}

interface FormData {
    medication_name: string;
    medication_type: string;
    target_disease: string;
    target_breeds: string[];
    age_range_start: number;
    age_range_end: number;
    dosage_per_kg: number;
    dosage_unit: string;
    application_method: string;
    treatment_duration_days: number;
    withdrawal_period_days: number;
    cost_per_unit: number;
    manufacturer: string;
    is_emergency_protocol: boolean;
    auto_recommend: boolean;
    description: string;
    instructions: string;
}

interface EditMedicationProtocolProps {
    protocol: MedicationProtocol;
}

const EditMedicationProtocol: React.FC<EditMedicationProtocolProps> = ({ protocol }) => {
    const { data, setData, put, processing, errors } = useForm<FormData>({
        medication_name: protocol.medication_name || '',
        medication_type: protocol.medication_type || '',
        target_disease: protocol.target_disease || '',
        target_breeds: protocol.target_breeds || [],
        age_range_start: protocol.age_range_start || 0,
        age_range_end: protocol.age_range_end || 100,
        dosage_per_kg: protocol.dosage_per_kg || 0,
        dosage_unit: protocol.dosage_unit || 'mg',
        application_method: protocol.application_method || '',
        treatment_duration_days: protocol.treatment_duration_days || 1,
        withdrawal_period_days: protocol.withdrawal_period_days || 0,
        cost_per_unit: protocol.cost_per_unit || 0,
        manufacturer: protocol.manufacturer || '',
        is_emergency_protocol: protocol.is_emergency_protocol || false,
        auto_recommend: protocol.auto_recommend !== false,
        description: protocol.description || '',
        instructions: protocol.instructions || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/smart-scheduling/protocols/medication/${protocol.id}`);
    };

    const medicationTypes = [
        { value: 'antibiotic', label: 'Antibiotic' },
        { value: 'vitamin', label: 'Vitamin' },
        { value: 'supplement', label: 'Supplement' },
        { value: 'vaccine', label: 'Vaccine' },
        { value: 'dewormer', label: 'Dewormer' },
        { value: 'other', label: 'Other' },
    ];

    const applicationMethods = [
        { value: 'oral', label: 'Oral' },
        { value: 'injection', label: 'Injection' },
        { value: 'water', label: 'In Water' },
        { value: 'feed', label: 'In Feed' },
        { value: 'topical', label: 'Topical' },
    ];

    const dosageUnits = [
        { value: 'mg', label: 'mg' },
        { value: 'ml', label: 'ml' },
        { value: 'g', label: 'g' },
        { value: 'units', label: 'units' },
        { value: 'drops', label: 'drops' },
    ];

    return (
        <AdminLayout>
            <Head title={`Edit ${protocol.medication_name}`} />

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
                        <Pill className="h-8 w-8 text-blue-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Edit Medication Protocol</h1>
                            <p className="text-gray-600">{protocol.medication_name}</p>
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
                                            <Label htmlFor="medication_name">Medication Name *</Label>
                                            <Input
                                                id="medication_name"
                                                value={data.medication_name}
                                                onChange={e => setData('medication_name', e.target.value)}
                                                className={errors.medication_name ? 'border-red-500' : ''}
                                                placeholder="Enter medication name"
                                            />
                                            {errors.medication_name && (
                                                <p className="text-sm text-red-600 mt-1">{errors.medication_name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="medication_type">Medication Type *</Label>
                                            <Select value={data.medication_type} onValueChange={value => setData('medication_type', value)}>
                                                <SelectTrigger className={errors.medication_type ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {medicationTypes.map(type => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.medication_type && (
                                                <p className="text-sm text-red-600 mt-1">{errors.medication_type}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="target_disease">Target Disease</Label>
                                            <Input
                                                id="target_disease"
                                                value={data.target_disease}
                                                onChange={e => setData('target_disease', e.target.value)}
                                                placeholder="Disease this medication treats"
                                            />
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
                                            placeholder="Brief description of the medication"
                                            rows={3}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Dosage Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Dosage & Administration</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="dosage_per_kg">Dosage per kg *</Label>
                                            <Input
                                                id="dosage_per_kg"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.dosage_per_kg}
                                                onChange={e => setData('dosage_per_kg', parseFloat(e.target.value) || 0)}
                                                className={errors.dosage_per_kg ? 'border-red-500' : ''}
                                            />
                                            {errors.dosage_per_kg && (
                                                <p className="text-sm text-red-600 mt-1">{errors.dosage_per_kg}</p>
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
                                            <Label htmlFor="application_method">Application Method *</Label>
                                            <Select value={data.application_method} onValueChange={value => setData('application_method', value)}>
                                                <SelectTrigger className={errors.application_method ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select method" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {applicationMethods.map(method => (
                                                        <SelectItem key={method.value} value={method.value}>
                                                            {method.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.application_method && (
                                                <p className="text-sm text-red-600 mt-1">{errors.application_method}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="treatment_duration_days">Treatment Duration (days) *</Label>
                                            <Input
                                                id="treatment_duration_days"
                                                type="number"
                                                min="1"
                                                value={data.treatment_duration_days}
                                                onChange={e => setData('treatment_duration_days', parseInt(e.target.value) || 1)}
                                                className={errors.treatment_duration_days ? 'border-red-500' : ''}
                                            />
                                            {errors.treatment_duration_days && (
                                                <p className="text-sm text-red-600 mt-1">{errors.treatment_duration_days}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="withdrawal_period_days">Withdrawal Period (days) *</Label>
                                            <Input
                                                id="withdrawal_period_days"
                                                type="number"
                                                min="0"
                                                value={data.withdrawal_period_days}
                                                onChange={e => setData('withdrawal_period_days', parseInt(e.target.value) || 0)}
                                                className={errors.withdrawal_period_days ? 'border-red-500' : ''}
                                            />
                                            {errors.withdrawal_period_days && (
                                                <p className="text-sm text-red-600 mt-1">{errors.withdrawal_period_days}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="cost_per_unit">Cost per Unit</Label>
                                            <Input
                                                id="cost_per_unit"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.cost_per_unit}
                                                onChange={e => setData('cost_per_unit', parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                            />
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
                        </div>

                        {/* Settings Sidebar */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Age Range</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="age_range_start">Start Age (days) *</Label>
                                        <Input
                                            id="age_range_start"
                                            type="number"
                                            min="0"
                                            value={data.age_range_start}
                                            onChange={e => setData('age_range_start', parseInt(e.target.value) || 0)}
                                            className={errors.age_range_start ? 'border-red-500' : ''}
                                        />
                                        {errors.age_range_start && (
                                            <p className="text-sm text-red-600 mt-1">{errors.age_range_start}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="age_range_end">End Age (days) *</Label>
                                        <Input
                                            id="age_range_end"
                                            type="number"
                                            min="0"
                                            value={data.age_range_end}
                                            onChange={e => setData('age_range_end', parseInt(e.target.value) || 0)}
                                            className={errors.age_range_end ? 'border-red-500' : ''}
                                        />
                                        {errors.age_range_end && (
                                            <p className="text-sm text-red-600 mt-1">{errors.age_range_end}</p>
                                        )}
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
                                            <Label>Emergency Protocol</Label>
                                            <p className="text-sm text-gray-500">For urgent situations</p>
                                        </div>
                                        <Switch
                                            checked={data.is_emergency_protocol}
                                            onCheckedChange={checked => setData('is_emergency_protocol', checked)}
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
                                        {processing ? 'Updating...' : 'Update Protocol'}
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Validation Summary */}
                            {Object.keys(errors).length > 0 && (
                                <Alert className="border-red-200 bg-red-50">
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-700">
                                        Please fix the validation errors above before submitting.
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

export default EditMedicationProtocol;
