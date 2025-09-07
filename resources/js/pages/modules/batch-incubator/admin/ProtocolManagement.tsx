import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
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
    DollarSign
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
}

interface PaginatedProtocols {
    data: Protocol[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface ProtocolManagementProps {
    medications: PaginatedProtocols;
    vaccinations: PaginatedProtocols;
}

const ProtocolManagement: React.FC<ProtocolManagementProps> = ({ medications, vaccinations }) => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<any>(null);

    const loadStats = async () => {
        try {
            const response = await fetch(route('batch-incubator.admin.protocols.statistics'));
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    };

    React.useEffect(() => {
        loadStats();
    }, []);

    const toggleProtocolStatus = async (type: string, id: number, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        setLoading(true);
        
        try {
            await router.patch(route('batch-incubator.admin.protocols.toggle-status', { type, id }), {
                status: newStatus,
            });
            router.reload({ only: ['medications', 'vaccinations'] });
        } catch (error) {
            console.error('Error toggling protocol status:', error);
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
            await router.delete(route(`batch-incubator.admin.protocols.${type}.destroy`, id));
        } catch (error) {
            console.error('Error deleting protocol:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
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
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const renderMedicationTable = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Medication Protocols</h3>
                <Button asChild>
                    <Link href={route('batch-incubator.admin.protocols.medication.create')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Medication
                    </Link>
                </Button>
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
                                        >
                                            {medication.status === 'active' ? (
                                                <ToggleLeft className="h-4 w-4" />
                                            ) : (
                                                <ToggleRight className="h-4 w-4" />
                                            )}
                                        </Button>
                                        <Button asChild size="sm" variant="outline">
                                            <Link href={route('batch-incubator.admin.protocols.medication.edit', medication.id)}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-red-600 hover:bg-red-50"
                                            onClick={() => deleteProtocol('medication', medication.id, medication.medication_name || '')}
                                            disabled={loading}
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
                    <p className="text-gray-500">No medication protocols found</p>
                    <Button asChild className="mt-4">
                        <Link href={route('batch-incubator.admin.protocols.medication.create')}>
                            Create First Medication Protocol
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );

    const renderVaccinationTable = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Vaccination Protocols</h3>
                <Button asChild>
                    <Link href={route('batch-incubator.admin.protocols.vaccination.create')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Vaccination
                    </Link>
                </Button>
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
                                        >
                                            {vaccination.status === 'active' ? (
                                                <ToggleLeft className="h-4 w-4" />
                                            ) : (
                                                <ToggleRight className="h-4 w-4" />
                                            )}
                                        </Button>
                                        <Button asChild size="sm" variant="outline">
                                            <Link href={route('batch-incubator.admin.protocols.vaccination.edit', vaccination.id)}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-red-600 hover:bg-red-50"
                                            onClick={() => deleteProtocol('vaccination', vaccination.id, vaccination.vaccine_name || '')}
                                            disabled={loading}
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
                    <p className="text-gray-500">No vaccination protocols found</p>
                    <Button asChild className="mt-4">
                        <Link href={route('batch-incubator.admin.protocols.vaccination.create')}>
                            Create First Vaccination Protocol
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-2">
                    <Shield className="h-6 w-6 text-indigo-600" />
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Protocol Management
                    </h2>
                </div>
            }
        >
            <Head title="Protocol Management" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Statistics Cards */}
                    {stats && (
                        <div className="grid grid-cols-4 gap-6 mb-6">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center">
                                        <Pill className="h-8 w-8 text-blue-600" />
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Total Medications</p>
                                            <p className="text-2xl font-bold text-gray-900">{stats.medication_stats?.total || 0}</p>
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
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center">
                                        <BarChart3 className="h-8 w-8 text-green-600" />
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">Auto-Recommend</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {(stats.medication_stats?.auto_recommend || 0) + (stats.vaccination_stats?.auto_recommend || 0)}
                                            </p>
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
            </div>
        </AuthenticatedLayout>
    );
};

export default ProtocolManagement;
