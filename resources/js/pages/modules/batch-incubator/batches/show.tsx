import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import {
    ArrowLeft,
    Edit,
    Calendar,
    Users,
    TrendingUp,
    AlertTriangle,
    Activity,
    Egg,
    Thermometer,
    Droplets,
    DollarSign,
    Clock,
    MapPin,
    User,
    Save,
    Plus,
    RotateCcw,
    CheckCircle,
    XCircle,
    PlayCircle,
    Trash2
} from 'lucide-react';

interface Batch {
    id: number;
    batch_code: string;
    name: string;
    description?: string;
    breed: string;
    status: {
        value: string;
        label: string;
        color: string;
    };
    initial_count: number;
    current_count: number;
    initial_weight?: number;
    current_weight?: number;
    mortality_count: number;
    mortality_rate: number;
    cull_count: number;
    total_eggs_produced: number;
    avg_daily_production: number;
    avg_temperature?: number;
    avg_humidity?: number;
    start_date?: string;
    hatch_date?: string;
    expected_completion_date?: string;
    incubator_assigned_at?: string;
    initial_cost: number;
    feed_cost: number;
    medication_cost: number;
    other_costs: number;
    revenue: number;
    total_cost: number;
    profit_loss: number;
    age_days?: number;
    survival_rate: number;
    batch_data?: any;
    performance_metrics?: any;
    incubator?: {
        id: number;
        name: string;
        model: string;
        status: {
            value: string;
            label: string;
        };
        current_temperature?: number;
        current_humidity?: number;
    };
    manager: {
        id: number;
        name: string;
        email: string;
    };
    events: any[];
    schedules: any[];
}

interface Props {
    batch: Batch;
}

const statusColors = {
    planned: 'bg-gray-100 text-gray-800',
    incubating: 'bg-yellow-100 text-yellow-800',
    hatching: 'bg-orange-100 text-orange-800',
    brooding: 'bg-purple-100 text-purple-800',
    growing: 'bg-green-100 text-green-800',
    laying: 'bg-emerald-100 text-emerald-800',
    completed: 'bg-gray-100 text-gray-800',
    terminated: 'bg-red-100 text-red-800',
};

export default function BatchShow({ batch }: Props) {
    const [isEditingCounts, setIsEditingCounts] = useState(false);
    const [isEditingFinancials, setIsEditingFinancials] = useState(false);
    const [showEventDialog, setShowEventDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Form for updating counts and basic info
    const countForm = useForm({
        current_count: batch.current_count.toString(),
        current_weight: batch.current_weight?.toString() || '',
        mortality_count: batch.mortality_count.toString(),
        cull_count: batch.cull_count.toString(),
        avg_daily_production: batch.avg_daily_production.toString(),
    });

    // Form for updating financial data
    const financialForm = useForm({
        feed_cost: batch.feed_cost.toString(),
        medication_cost: batch.medication_cost.toString(),
        other_costs: batch.other_costs.toString(),
        revenue: batch.revenue.toString(),
    });

    // Form for status transitions
    const statusForm = useForm({
        status: batch.status.value,
    });

    // Form for deleting batch
    const deleteForm = useForm({});

    // Form for adding events
    const eventForm = useForm({
        event_type: '',
        title: '',
        description: '',
        event_date: new Date().toISOString().split('T')[0],
        affected_count: 0,
        mortality_count: 0,
        feed_amount: 0,
        feed_cost: 0,
        medication_cost: 0,
        vaccination_cost: 0,
        other_cost: 0,
        vaccine_name: '',
        medication_name: '',
        notes: '',
    });

    const handleUpdateCounts = (e: React.FormEvent) => {
        e.preventDefault();
        countForm.put(`/batch-incubator/batches/${batch.id}`, {
            onSuccess: () => {
                setIsEditingCounts(false);
            }
        });
    };

    const handleUpdateFinancials = (e: React.FormEvent) => {
        e.preventDefault();
        financialForm.put(`/batch-incubator/batches/${batch.id}`, {
            onSuccess: () => {
                setIsEditingFinancials(false);
            }
        });
    };

    const handleStatusChange = (newStatus: string) => {
        statusForm.setData('status', newStatus);
        statusForm.put(`/batch-incubator/batches/${batch.id}/status`, {
            preserveState: true,
        });
    };

    const handleAddEvent = (e: React.FormEvent) => {
        e.preventDefault();
        eventForm.post(`/batch-incubator/batches/${batch.id}/events`, {
            onSuccess: () => {
                setShowEventDialog(false);
                eventForm.reset();
            }
        });
    };

    const handleDelete = () => {
        deleteForm.delete(`/batch-incubator/batches/${batch.id}`, {
            onSuccess: () => {
                // The controller will redirect to index page
            },
            onError: () => {
                setShowDeleteDialog(false);
            }
        });
    };

    // Helper function to check if batch can be deleted
    const canDelete = () => {
        const hasEvents = batch.events && batch.events.length > 0;
        const hasCurrentCount = batch.current_count > 0;
        const hasFinancialData = batch.feed_cost > 0 || batch.medication_cost > 0 || batch.other_costs > 0 || batch.revenue > 0;
        const isNotPlanned = batch.status.value !== 'planned';

        return !hasEvents && !hasCurrentCount && !hasFinancialData && !isNotPlanned;
    };

    const getStatusColor = (status: string) => {
        const colors = {
            planned: 'bg-gray-100 text-gray-800',
            incubating: 'bg-yellow-100 text-yellow-800',
            hatching: 'bg-orange-100 text-orange-800',
            brooding: 'bg-purple-100 text-purple-800',
            growing: 'bg-green-100 text-green-800',
            laying: 'bg-emerald-100 text-emerald-800',
            completed: 'bg-gray-100 text-gray-800',
            terminated: 'bg-red-100 text-red-800',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getNextStatus = (currentStatus: string) => {
        const transitions = {
            planned: 'incubating',
            incubating: 'hatching',
            hatching: 'brooding',
            brooding: 'growing',
            growing: 'laying',
            laying: 'completed',
        };
        return transitions[currentStatus as keyof typeof transitions];
    };

    const getStatusTransitionLabel = (fromStatus: string, toStatus: string) => {
        const labels = {
            'planned-incubating': 'Start Incubation',
            'incubating-hatching': 'Begin Hatching',
            'hatching-brooding': 'Move to Brooding',
            'brooding-growing': 'Start Growing Phase',
            'growing-laying': 'Start Laying Period',
            'laying-completed': 'Complete Batch',
        };
        return labels[`${fromStatus}-${toStatus}` as keyof typeof labels] || 'Update Status';
    };
    return (
        <AppLayout>
            <Head title={`${batch.name} - Batch Details`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between px-6">
                    <div className="flex items-center space-x-4 ">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{batch.name}</h1>
                            <p className="text-muted-foreground">
                                {batch.batch_code} • {batch.breed}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge
                                className={getStatusColor(batch.status.value)}
                            >
                                {batch.status.label}
                            </Badge>
                            {batch.age_days !== undefined && (
                                <Badge variant="outline">
                                    {batch.age_days} days old
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Status Transition Button */}
                        {getNextStatus(batch.status.value) && (
                            <Button
                                onClick={() => handleStatusChange(getNextStatus(batch.status.value)!)}
                                disabled={statusForm.processing}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <PlayCircle className="mr-2 h-4 w-4" />
                                {getStatusTransitionLabel(batch.status.value, getNextStatus(batch.status.value)!)}
                            </Button>
                        )}



                        {/* Add Event Dialog */}
                        <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Event
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Batch Event</DialogTitle>
                                    <DialogDescription>
                                        Record an event or activity for this batch
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleAddEvent} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="event_type">Event Type</Label>
                                            <Select
                                                value={eventForm.data.event_type}
                                                onValueChange={(value) => eventForm.setData('event_type', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select event type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="feeding">Feeding</SelectItem>
                                                    <SelectItem value="medication">Medication</SelectItem>
                                                    <SelectItem value="vaccination">Vaccination</SelectItem>
                                                    <SelectItem value="mortality">Mortality</SelectItem>
                                                    <SelectItem value="weighing">Weighing</SelectItem>
                                                    <SelectItem value="collection">Egg Collection</SelectItem>
                                                    <SelectItem value="inspection">Health Inspection</SelectItem>
                                                    <SelectItem value="cleaning">Cleaning</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="event_date">Date</Label>
                                            <Input
                                                type="date"
                                                value={eventForm.data.event_date}
                                                onChange={(e) => eventForm.setData('event_date', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            value={eventForm.data.title}
                                            onChange={(e) => eventForm.setData('title', e.target.value)}
                                            placeholder="Brief description of the event"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <textarea
                                            value={eventForm.data.description}
                                            onChange={(e) => eventForm.setData('description', e.target.value)}
                                            placeholder="Detailed notes about this event..."
                                            rows={3}
                                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        />
                                    </div>

                                    {eventForm.data.event_type === 'mortality' && (
                                        <div>
                                            <Label htmlFor="mortality_count">Mortality Count</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={eventForm.data.mortality_count}
                                                onChange={(e) => eventForm.setData('mortality_count', parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                    )}

                                    {eventForm.data.event_type === 'feeding' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="feed_amount">Feed Amount (kg)</Label>
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    value={eventForm.data.feed_amount}
                                                    onChange={(e) => eventForm.setData('feed_amount', parseFloat(e.target.value) || 0)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="feed_cost">Feed Cost ($)</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={eventForm.data.feed_cost}
                                                    onChange={(e) => eventForm.setData('feed_cost', parseFloat(e.target.value) || 0)}
                                                    placeholder="Cost of feed used"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {eventForm.data.event_type === 'medication' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="medication_name">Medication Name</Label>
                                                <Input
                                                    value={eventForm.data.medication_name}
                                                    onChange={(e) => eventForm.setData('medication_name', e.target.value)}
                                                    placeholder="Name of medication"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="medication_cost">Medication Cost ($)</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={eventForm.data.medication_cost}
                                                    onChange={(e) => eventForm.setData('medication_cost', parseFloat(e.target.value) || 0)}
                                                    placeholder="Cost of medication"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {eventForm.data.event_type === 'vaccination' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="vaccine_name">Vaccine Name</Label>
                                                <Input
                                                    value={eventForm.data.vaccine_name}
                                                    onChange={(e) => eventForm.setData('vaccine_name', e.target.value)}
                                                    placeholder="Name of vaccine"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="vaccination_cost">Vaccination Cost ($)</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={eventForm.data.vaccination_cost}
                                                    onChange={(e) => eventForm.setData('vaccination_cost', parseFloat(e.target.value) || 0)}
                                                    placeholder="Cost of vaccination"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {(eventForm.data.event_type === 'cleaning' ||
                                        eventForm.data.event_type === 'inspection' ||
                                        eventForm.data.event_type === 'other') && (
                                            <div>
                                                <Label htmlFor="other_cost">Cost ($)</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={eventForm.data.other_cost}
                                                    onChange={(e) => eventForm.setData('other_cost', parseFloat(e.target.value) || 0)}
                                                    placeholder="Associated cost (optional)"
                                                />
                                            </div>
                                        )}

                                    {eventForm.data.event_type === 'weighing' && (
                                        <div>
                                            <Label htmlFor="affected_count">Number of Birds Weighed</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={eventForm.data.affected_count}
                                                onChange={(e) => eventForm.setData('affected_count', parseInt(e.target.value) || 0)}
                                                placeholder="How many birds were weighed"
                                            />
                                        </div>
                                    )}

                                    {eventForm.data.event_type === 'collection' && (
                                        <div>
                                            <Label htmlFor="affected_count">Eggs Collected</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={eventForm.data.affected_count}
                                                onChange={(e) => eventForm.setData('affected_count', parseInt(e.target.value) || 0)}
                                                placeholder="Number of eggs collected"
                                            />
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setShowEventDialog(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={eventForm.processing}>
                                            {eventForm.processing ? 'Adding...' : 'Add Event'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>

                    

                        {/* Delete Button - Only show if batch can be deleted */}
                        {canDelete() && (
                            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Delete Batch</DialogTitle>
                                        <DialogDescription>
                                            Are you sure you want to delete batch "{batch.name}"? This action cannot be undone.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex justify-end space-x-2 pt-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowDeleteDialog(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={handleDelete}
                                            disabled={deleteForm.processing}
                                        >
                                            {deleteForm.processing ? 'Deleting...' : 'Delete Batch'}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>

                {/* Overview Cards with Inline Editing */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Current Count</CardTitle>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                {!isEditingCounts && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsEditingCounts(true)}
                                    >
                                        <Edit className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isEditingCounts ? (
                                <form onSubmit={handleUpdateCounts} className="space-y-2">
                                    <Input
                                        type="number"
                                        min="0"
                                        value={countForm.data.current_count}
                                        onChange={(e) => countForm.setData('current_count', e.target.value)}
                                        className="h-8"
                                    />
                                    <div className="flex gap-1">
                                        <Button type="submit" size="sm" disabled={countForm.processing}>
                                            <Save className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setIsEditingCounts(false);
                                                countForm.reset();
                                            }}
                                        >
                                            <XCircle className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div className="text-2xl font-bold">{batch?.current_count?.toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Started with {batch?.initial_count?.toLocaleString()}
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Survival Rate</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{batch.survival_rate}%</div>
                            <p className="text-xs text-muted-foreground">
                                {batch.mortality_count} mortalities
                            </p>
                        </CardContent>
                    </Card>

                    {batch.avg_daily_production > 0 && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Daily Production</CardTitle>
                                <Egg className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{batch.avg_daily_production}</div>
                                <p className="text-xs text-muted-foreground">
                                    {batch?.total_eggs_produced?.toLocaleString()} total eggs
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Profit/Loss</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${batch?.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ${batch?.profit_loss?.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                ${batch?.total_cost?.toLocaleString()} total cost
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Alerts */}
                {batch.mortality_rate > 5 && (
                    <Card className="border-amber-200 bg-amber-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                <div>
                                    <h3 className="font-semibold text-amber-800">High Mortality Rate</h3>
                                    <p className="text-sm text-amber-700">
                                        Current mortality rate of {batch.mortality_rate}% is above normal. Consider reviewing environmental conditions and health protocols.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>Core batch details and status</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {batch.description && (
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                                        <p className="text-sm">{batch.description}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Breed</h4>
                                        <p className="text-sm font-medium">{batch.breed}</p>
                                    </div>

                                    {batch.age_days !== undefined && (
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground">Age</h4>
                                            <p className="text-sm font-medium">{batch.age_days} days</p>
                                        </div>
                                    )}

                                    {batch.start_date && (
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground">Start Date</h4>
                                            <p className="text-sm font-medium">{new Date(batch.start_date).toLocaleDateString()}</p>
                                        </div>
                                    )}

                                    {batch.hatch_date && (
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground">Hatch Date</h4>
                                            <p className="text-sm font-medium">{new Date(batch.hatch_date).toLocaleDateString()}</p>
                                        </div>
                                    )}

                                    {batch.expected_completion_date && (
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground">Expected Completion</h4>
                                            <p className="text-sm font-medium">{new Date(batch.expected_completion_date).toLocaleDateString()}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Environmental Conditions */}
                        {(batch.avg_temperature || batch.avg_humidity) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Environmental Conditions</CardTitle>
                                    <CardDescription>Average temperature and humidity readings</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        {batch.avg_temperature && (
                                            <div className="flex items-center space-x-2">
                                                <Thermometer className="h-4 w-4 text-red-500" />
                                                <div>
                                                    <p className="text-sm font-medium">{batch.avg_temperature}°C</p>
                                                    <p className="text-xs text-muted-foreground">Average Temperature</p>
                                                </div>
                                            </div>
                                        )}

                                        {batch.avg_humidity && (
                                            <div className="flex items-center space-x-2">
                                                <Droplets className="h-4 w-4 text-green-500" />
                                                <div>
                                                    <p className="text-sm font-medium">{batch.avg_humidity}%</p>
                                                    <p className="text-xs text-muted-foreground">Average Humidity</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Financial Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Financial Summary</CardTitle>
                                <CardDescription>Cost breakdown and revenue tracking</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground">Initial Cost</h4>
                                            <p className="text-lg font-medium">${batch?.initial_cost?.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground">Feed Cost</h4>
                                            <p className="text-lg font-medium">${batch?.feed_cost?.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground">Medication Cost</h4>
                                            <p className="text-lg font-medium">${batch?.medication_cost?.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground">Other Costs</h4>
                                            <p className="text-lg font-medium">${batch?.other_costs?.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground">Total Cost</h4>
                                            <p className="text-xl font-bold">${batch?.total_cost?.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground">Revenue</h4>
                                            <p className="text-xl font-bold text-green-600">${batch?.revenue?.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground">Profit/Loss</h4>
                                            <p className={`text-xl font-bold ${batch?.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                ${batch?.profit_loss?.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className='flex flex-col gap-4'>
                        {/* Events Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4" />
                                    <span>Recent Events</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {batch.events.length > 0 ? (
                                    <div className="space-y-3">
                                        {batch.events.slice(0, 10).map((event: any) => (
                                            <div key={event.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                                                <div className={`w-2 h-2 rounded-full mt-2 bg-${event.event_type.color}-500`}></div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-sm font-medium truncate">{event.title}</h4>
                                                        <span className="text-xs text-muted-foreground">{event.event_date}</span>
                                                    </div>
                                                    {event.description && (
                                                        <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                                                    )}
                                                    <div className="flex items-center space-x-4 mt-2">
                                                        {event.affected_count > 0 && (
                                                            <span className="text-xs">Affected: {event.affected_count}</span>
                                                        )}
                                                        {event.mortality_count > 0 && (
                                                            <span className="text-xs text-red-600">Mortality: {event.mortality_count}</span>
                                                        )}
                                                        {(event.feed_cost > 0 || event.medication_cost > 0 || event.vaccination_cost > 0 || event.other_cost > 0) && (
                                                            <span className="text-xs text-green-600">
                                                                Cost: ${((event.feed_cost || 0) + (event.medication_cost || 0) + (event.vaccination_cost || 0) + (event.other_cost || 0)).toLocaleString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        By {event.user.name}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {batch.events.length > 10 && (
                                            <div className="text-center">
                                                <Button variant="outline" size="sm">
                                                    View All Events ({batch.events.length})
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                        <p className="text-sm text-muted-foreground">No events recorded yet</p>
                                        <Button
                                            onClick={() => setShowEventDialog(true)}
                                            variant="outline"
                                            size="sm"
                                            className="mt-2"
                                        >
                                            Add First Event
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        {/* Manager */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <User className="h-4 w-4" />
                                    <span>Manager</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div>
                                    <h4 className="font-medium">{batch.manager.name}</h4>
                                    <p className="text-sm text-muted-foreground">{batch.manager.email}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Incubator */}
                        {batch.incubator && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>Incubator</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <h4 className="font-medium">{batch.incubator.name}</h4>
                                        <p className="text-sm text-muted-foreground">{batch.incubator.model}</p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Status</span>
                                        <Badge variant="outline">{batch.incubator.status.label}</Badge>
                                    </div>

                                    {batch.incubator.current_temperature && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Temperature</span>
                                            <span className="text-sm font-medium">{batch.incubator.current_temperature}°C</span>
                                        </div>
                                    )}

                                    {batch.incubator.current_humidity && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Humidity</span>
                                            <span className="text-sm font-medium">{batch.incubator.current_humidity}%</span>
                                        </div>
                                    )}

                                    <Link href={`/batch-incubator/incubators/${batch.incubator.id}`}>
                                        <Button variant="outline" size="sm" className="w-full">
                                            View Incubator
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm">Events Recorded</span>
                                    <span className="text-sm font-medium">{batch.events.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Scheduled Tasks</span>
                                    <span className="text-sm font-medium">{batch.schedules.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Mortality Count</span>
                                    <span className="text-sm font-medium">{batch.mortality_count}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Cull Count</span>
                                    <span className="text-sm font-medium">{batch.cull_count}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
