import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Pill,
    Syringe,
    Plus,
    Edit,
    Trash2,
    Eye,
    ToggleLeft,
    ToggleRight,
    AlertTriangle,
    BarChart3,
    Shield,
    Clock,
    DollarSign,
    Upload,
    Download,
    FileText,
    Activity
} from 'lucide-react';

interface Protocol {
    id: number;
    medication_name?: string;
    vaccine_name?: string;
    medication_type?: string;
    prevents_disease?: string;
    status: string;
    auto_recommend: boolean;
    is_emergency_protocol?: boolean;
    is_mandatory?: boolean;
    priority_level?: string;
    created_at: string;
    usage_count?: number;
    effectiveness_rate?: number;
    target_disease?: string;
}

interface PaginatedProtocols {
    data: Protocol[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface ProtocolManagementProps {
    medications?: PaginatedProtocols;
    vaccinations?: PaginatedProtocols;
}

const ProtocolManagement: React.FC<ProtocolManagementProps> = ({
    medications = { data: [], current_page: 1, last_page: 1, per_page: 15, total: 0 },
    vaccinations = { data: [], current_page: 1, last_page: 1, per_page: 15, total: 0 }
}) => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<any>(null);

    const loadStats = async () => {
        try {
            const response = await fetch('/batch-incubator/admin/protocols/statistics');
            const data = await response.json();
            setStats(data);
        } catch (error) { 
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    const toggleProtocolStatus = async (type: string, id: number, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        setLoading(true);

        try {
            await router.patch(`/batch-incubator/admin/protocols/${type}/${id}/status`, {
                status: newStatus,
            });
            router.reload({ only: ['medications', 'vaccinations'] });
        } catch (error) { 
        } finally {
            setLoading(false);
        }
    };

    const deleteProtocol = async (type: string, id: number, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            return;
        }

        setLoading(true);
        try {
            await router.delete(`/batch-incubator/admin/protocols/${type}/${id}`);
        } catch (error) { 
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-100 text-emerald-800';
            case 'inactive': return 'bg-yellow-100 text-yellow-800';
            case 'archived': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-emerald-100 text-emerald-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const renderMedicationTable = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Medication Protocols</h3>
                <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link href="/admin/smart-scheduling/protocols/medication/upload">
                            <Upload className="h-4 w-4 mr-2" />
                            Bulk Upload
                        </Link>
                    </Button>
                    <Button asChild size="sm">
                        <Link href="/admin/smart-scheduling/protocols/medication/create">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Medication
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left p-4 font-medium">Medication</th>
                            <th className="text-left p-4 font-medium">Type</th>
                            <th className="text-left p-4 font-medium">Target Disease</th>
                            <th className="text-left p-4 font-medium">Status</th>
                            <th className="text-left p-4 font-medium">Settings</th>
                            <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {medications.data.map((medication) => (
                            <tr key={medication.id} className="border-t">
                                <td className="p-4">
                                    <div>
                                        <p className="font-medium">{medication.medication_name}</p>
                                        <p className="text-sm text-gray-500">ID: {medication.id}</p>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="capitalize">{medication.medication_type}</span>
                                </td>
                                <td className="p-4">
                                    <span className="text-sm">{medication.target_disease || 'General use'}</span>
                                </td>
                                <td className="p-4">
                                    <Badge className={getStatusColor(medication.status)}>
                                        {medication.status}
                                    </Badge>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col space-y-1">
                                        {medication.auto_recommend && (
                                            <Badge variant="outline" className="text-xs">Auto-recommend</Badge>
                                        )}
                                        {medication.is_emergency_protocol && (
                                            <Badge variant="outline" className="text-xs bg-red-50 text-red-700">Emergency</Badge>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex space-x-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => toggleProtocolStatus('medication', medication.id, medication.status)}
                                            disabled={loading}
                                            title={medication.status === 'active' ? 'Deactivate' : 'Activate'}
                                        >
                                            {medication.status === 'active' ? (
                                                <ToggleRight className="h-4 w-4 text-emerald-600" />
                                            ) : (
                                                <ToggleLeft className="h-4 w-4 text-gray-400" />
                                            )}
                                        </Button>
                                        <Button asChild size="sm" variant="outline" title="Edit Protocol">
                                            <Link href={`/admin/smart-scheduling/protocols/medication/${medication.id}/edit`}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-red-600 hover:bg-red-50"
                                            onClick={() => deleteProtocol('medication', medication.id, medication.medication_name || '')}
                                            disabled={loading}
                                            title="Delete Protocol"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {medications.data.length === 0 && (
                <div className="text-center py-8 border rounded-lg">
                    <Pill className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 mb-2">No medication protocols found</p>
                    <p className="text-sm text-gray-400 mb-4">Start by uploading protocols or creating them manually</p>
                    <div className="flex justify-center gap-2">
                        <Button asChild variant="outline">
                            <Link href="/admin/smart-scheduling/protocols/medication/upload">
                                <Upload className="h-4 w-4 mr-2" />
                                Bulk Upload
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/admin/smart-scheduling/protocols/medication/create">
                                <Plus className="h-4 w-4 mr-2" />
                                Create First Protocol
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );

    const renderVaccinationTable = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Vaccination Protocols</h3>
                <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link href="/admin/smart-scheduling/protocols/vaccination/upload">
                            <Upload className="h-4 w-4 mr-2" />
                            Bulk Upload
                        </Link>
                    </Button>
                    <Button asChild size="sm">
                        <Link href="/admin/smart-scheduling/protocols/vaccination/create">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Vaccination
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left p-4 font-medium">Vaccine</th>
                            <th className="text-left p-4 font-medium">Prevents</th>
                            <th className="text-left p-4 font-medium">Priority</th>
                            <th className="text-left p-4 font-medium">Status</th>
                            <th className="text-left p-4 font-medium">Settings</th>
                            <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vaccinations.data.map((vaccination) => (
                            <tr key={vaccination.id} className="border-t">
                                <td className="p-4">
                                    <div>
                                        <p className="font-medium">{vaccination.vaccine_name}</p>
                                        <p className="text-sm text-gray-500">ID: {vaccination.id}</p>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="text-sm">{vaccination.prevents_disease}</span>
                                </td>
                                <td className="p-4">
                                    <Badge className={getPriorityColor(vaccination.priority_level || 'low')}>
                                        {vaccination.priority_level}
                                    </Badge>
                                </td>
                                <td className="p-4">
                                    <Badge className={getStatusColor(vaccination.status)}>
                                        {vaccination.status}
                                    </Badge>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col space-y-1">
                                        {vaccination.auto_recommend && (
                                            <Badge variant="outline" className="text-xs">Auto-recommend</Badge>
                                        )}
                                        {vaccination.is_mandatory && (
                                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">Mandatory</Badge>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex space-x-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => toggleProtocolStatus('vaccination', vaccination.id, vaccination.status)}
                                            disabled={loading}
                                            title={vaccination.status === 'active' ? 'Deactivate' : 'Activate'}
                                        >
                                            {vaccination.status === 'active' ? (
                                                <ToggleRight className="h-4 w-4 text-emerald-600" />
                                            ) : (
                                                <ToggleLeft className="h-4 w-4 text-gray-400" />
                                            )}
                                        </Button>
                                        <Button asChild size="sm" variant="outline" title="Edit Protocol">
                                            <Link href={`/admin/smart-scheduling/protocols/vaccination/${vaccination.id}/edit`}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-red-600 hover:bg-red-50"
                                            onClick={() => deleteProtocol('vaccination', vaccination.id, vaccination.vaccine_name || '')}
                                            disabled={loading}
                                            title="Delete Protocol"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {vaccinations.data.length === 0 && (
                <div className="text-center py-8 border rounded-lg">
                    <Syringe className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 mb-2">No vaccination protocols found</p>
                    <p className="text-sm text-gray-400 mb-4">Start by uploading protocols or creating them manually</p>
                    <div className="flex justify-center gap-2">
                        <Button asChild variant="outline">
                            <Link href="/admin/smart-scheduling/protocols/vaccination/upload">
                                <Upload className="h-4 w-4 mr-2" />
                                Bulk Upload
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/admin/smart-scheduling/protocols/vaccination/create">
                                <Plus className="h-4 w-4 mr-2" />
                                Create First Protocol
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <AdminLayout>
            <Head title="Smart Scheduling - Protocol Management" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Shield className="h-8 w-8 text-indigo-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Smart Scheduling</h1>
                            <p className="text-gray-600">Manage medication and vaccination protocols</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href="/admin/smart-scheduling/templates">
                                <FileText className="h-4 w-4 mr-2" />
                                Template Library
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/admin/smart-scheduling/analytics">
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Analytics
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                {stats && (
                    <div className="grid grid-cols-4 gap-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <Pill className="h-8 w-8 text-blue-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Total Medications</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.medication_stats?.total || 0}</p>
                                        <p className="text-xs text-emerald-600">
                                            {stats.medication_stats?.active || 0} active
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <Syringe className="h-8 w-8 text-purple-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Total Vaccinations</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.vaccination_stats?.total || 0}</p>
                                        <p className="text-xs text-emerald-600">
                                            {stats.vaccination_stats?.active || 0} active
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <AlertTriangle className="h-8 w-8 text-red-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Emergency Protocols</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.medication_stats?.emergency || 0}</p>
                                        <p className="text-xs text-blue-600">
                                            {stats.vaccination_stats?.mandatory || 0} mandatory vaccines
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <Activity className="h-8 w-8 text-emerald-600" />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Auto-Recommend</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {(stats.medication_stats?.auto_recommend || 0) + (stats.vaccination_stats?.auto_recommend || 0)}
                                        </p>
                                        <p className="text-xs text-gray-500">AI-enabled protocols</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Protocol Management Tabs */}
                <Tabs defaultValue="medications" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="medications" className="flex items-center space-x-2">
                            <Pill className="h-4 w-4" />
                            <span>Medications ({medications.total})</span>
                        </TabsTrigger>
                        <TabsTrigger value="vaccinations" className="flex items-center space-x-2">
                            <Syringe className="h-4 w-4" />
                            <span>Vaccinations ({vaccinations.total})</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="medications">
                        <Card>
                            <CardContent className="p-6">
                                {renderMedicationTable()}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="vaccinations">
                        <Card>
                            <CardContent className="p-6">
                                {renderVaccinationTable()}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
};

export default ProtocolManagement;
