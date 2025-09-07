import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    Clock,
    Save,
    X,
    AlertTriangle,
    Info,
    Repeat,
    User,
    Package,
    ArrowLeft,
    CheckCircle
} from 'lucide-react';
import { Link, Head, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

interface ScheduleEditProps {
    schedule: {
        id: number;
        title: string;
        description?: string;
        event_type: string;
        batch_id: number;
        incubator_id?: number;
        assigned_to?: number;
        scheduled_date: string;
        scheduled_time?: string;
        priority: number;
        is_critical: boolean;
        required_quantity?: number;
        required_unit?: string;
        notes?: string;
        is_recurring: boolean;
        recurrence_pattern?: string;
        recurrence_end_date?: string;
        status: string;
    };
    batches: Array<{
        id: number;
        name: string;
        batch_code: string;
        status: string;
        incubator_id: number | null;
        incubator?: {
            id: number;
            name: string;
            status: string;
        } | null;
    }>;
    incubators: Array<{
        id: number;
        name: string;
        status: string;
    }>;
    users: Array<{
        id: number;
        name: string;
        email: string;
    }>;
    eventTypes: Array<{
        value: string;
        label: string;
        description?: string;
    }>;
}

interface ScheduleData {
    recurrence_interval: string | number | readonly string[] | undefined;
    recurrence_type: string | undefined;
    title: string;
    description: string;
    event_type: string;
    batch_id: string;
    incubator_id: string;
    assigned_to: string;
    scheduled_date: string;
    scheduled_time: string;
    priority: number;
    is_critical: boolean;
    required_quantity: string;
    required_unit: string;
    notes: string;
    is_recurring: boolean;
    recurrence_pattern: string;
    recurrence_end_date: string;
}

export default function ScheduleEdit({
    schedule,
    batches,
    incubators,
    users,
    eventTypes
}: ScheduleEditProps) {
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
            title: 'Schedules',
            href: '/batch-incubator/schedules',
        },
        {
            title: schedule.title,
            href: `/batch-incubator/schedules/${schedule.id}`,
        },
        {
            title: 'Edit',
            href: `/batch-incubator/schedules/${schedule.id}/edit`,
        },
    ];

    const { data, setData, put, processing, errors } = useForm<ScheduleData>({
        title: schedule.title,
        description: schedule.description || '',
        event_type: schedule.event_type,
        batch_id: schedule.batch_id.toString(),
        incubator_id: schedule.incubator_id?.toString() || '',
        assigned_to: schedule.assigned_to?.toString() || '',
        scheduled_date: schedule.scheduled_date,
        scheduled_time: schedule.scheduled_time || '',
        priority: schedule.priority,
        is_critical: schedule.is_critical,
        required_quantity: schedule.required_quantity?.toString() || '',
        required_unit: schedule.required_unit || '',
        notes: schedule.notes || '',
        is_recurring: schedule.is_recurring,
        recurrence_pattern: schedule.recurrence_pattern || 'daily',
        recurrence_end_date: schedule.recurrence_end_date || '',
    });

    const [selectedEventType, setSelectedEventType] = useState<any>(
        eventTypes.find(type => type.value === schedule.event_type)
    );

    // Email search state for user selection
    const [userEmail, setUserEmail] = useState('');
    const [emailResults, setEmailResults] = useState<typeof users>([]);
    const [showEmailResults, setShowEmailResults] = useState(false);
    const [selectedUser, setSelectedUser] = useState<typeof users[0] | null>(() => {
        // Initialize with the assigned user if exists
        if (schedule.assigned_to) {
            return users.find(user => user.id === schedule.assigned_to) || null;
        }
        return null;
    });

    // Initialize email field with assigned user's email
    React.useEffect(() => {
        if (selectedUser) {
            setUserEmail(selectedUser.email);
        }
    }, [selectedUser]);

    // Email search handlers
    const handleEmailChange = (email: string) => {
        setUserEmail(email);
        // Only reset selectedUser if the email no longer matches
        if (!selectedUser || selectedUser.email !== email) {
            setSelectedUser(null);
            setData('assigned_to', '');
        }

        if (email.length >= 3) {
            // Filter users by email
            const filteredUsers = users.filter(user =>
                user.email.toLowerCase().includes(email.toLowerCase())
            );
            setEmailResults(filteredUsers);
            setShowEmailResults(filteredUsers.length > 0);
        } else {
            setEmailResults([]);
            setShowEmailResults(false);
        }
    };

    const handleUserSelect = (user: typeof users[0]) => {
        setSelectedUser(user);
        setUserEmail(user.email);
        setData('assigned_to', user.id.toString());
        setShowEmailResults(false);
        setEmailResults([]);
    };

    const handleEmailBlur = () => {
        // Delay hiding results to allow for clicks
        setTimeout(() => setShowEmailResults(false), 200);
    };

    const handleBatchChange = (batchId: string) => {
        setData('batch_id', batchId);

        // Auto-fill incubator based on selected batch
        if (batchId) {
            const selectedBatch = batches.find(batch => batch.id.toString() === batchId);
            if (selectedBatch && selectedBatch.incubator_id) {
                setData('incubator_id', selectedBatch.incubator_id.toString());
            } else {
                // Clear incubator if batch has no incubator or batch is cleared
                setData('incubator_id', '');
            }
        } else {
            // Clear incubator if no batch is selected
            setData('incubator_id', '');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/batch-incubator/schedules/${schedule.id}`);
    };

    const handleEventTypeChange = (value: string) => {
        setData('event_type', value);
        const eventType = eventTypes.find(type => type.value === value);
        setSelectedEventType(eventType);
    };

    const getPriorityLabel = (priority: number) => {
        const labels = {
            1: 'Critical',
            2: 'High',
            3: 'Medium',
            4: 'Low',
            5: 'Lowest'
        };
        return labels[priority as keyof typeof labels] || 'Medium';
    };

    const getPriorityColor = (priority: number) => {
        if (priority <= 2) return 'text-red-600';
        if (priority === 3) return 'text-yellow-600';
        return 'text-emerald-600';
    };

    const canEditRecurrence = schedule.is_recurring && ['pending'].includes(schedule.status);
    const canEditDateTime = ['pending', 'postponed'].includes(schedule.status);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${schedule.title} - Schedules`} />
            <div className="space-y-6 p-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/batch-incubator/schedules/${schedule.id}`}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Schedule
                                </Link>
                            </Button>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Schedule</h1>
                        <p className="text-muted-foreground">
                            Update the schedule details and settings
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={`/batch-incubator/schedules/${schedule.id}`}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Link>
                    </Button>
                </div>

                {/* Status Alert */}
                {!canEditDateTime && (
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Limited Editing</AlertTitle>
                        <AlertDescription>
                            Some fields cannot be edited because this schedule is {schedule.status}.
                            You can still update the description, notes, and assignment.
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Basic Information
                            </CardTitle>
                            <CardDescription>
                                Update the core details for this schedule
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="event_type">Event Type *</Label>
                                    <Select
                                        value={data.event_type}
                                        onValueChange={handleEventTypeChange}
                                        required
                                        disabled={!canEditDateTime}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select event type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {eventTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    <div>
                                                        <div className="font-medium">{type.label}</div>
                                                        {type.description && (
                                                            <div className="text-sm text-muted-foreground">
                                                                {type.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.event_type && (
                                        <p className="text-sm text-red-600">{errors.event_type}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="batch_id">Batch *</Label>
                                    <Select
                                        value={data.batch_id}
                                        onValueChange={handleBatchChange}
                                        required
                                        disabled={!canEditDateTime}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select batch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {batches.filter(batch => batch.status !== 'completed').map((batch) => (
                                                <SelectItem key={batch.id} value={batch.id.toString()}>
                                                    <div className="flex items-center gap-2">
                                                        <Package className="h-4 w-4" />
                                                        <span>{batch.name}</span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {batch.batch_code}
                                                        </Badge>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.batch_id && (
                                        <p className="text-sm text-red-600">{errors.batch_id}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Enter schedule title"
                                    required
                                />
                                {errors.title && (
                                    <p className="text-sm text-red-600">{errors.title}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Describe what needs to be done"
                                    rows={3}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-600">{errors.description}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Schedule Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Schedule Details
                            </CardTitle>
                            <CardDescription>
                                Update when this task should be performed
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="scheduled_date">Date *</Label>
                                    <Input
                                        id="scheduled_date"
                                        type="date"
                                        value={data.scheduled_date}
                                        onChange={(e) => setData('scheduled_date', e.target.value)}
                                        required
                                        disabled={!canEditDateTime}
                                    />
                                    {errors.scheduled_date && (
                                        <p className="text-sm text-red-600">{errors.scheduled_date}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="scheduled_time">Time</Label>
                                    <Input
                                        id="scheduled_time"
                                        type="time"
                                        value={data.scheduled_time}
                                        onChange={(e) => setData('scheduled_time', e.target.value)}
                                        disabled={!canEditDateTime}
                                    />
                                    {errors.scheduled_time && (
                                        <p className="text-sm text-red-600">{errors.scheduled_time}</p>
                                    )}
                                </div>
                            </div>

                            {/* Recurring Schedule */}
                            {schedule.is_recurring && (
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="is_recurring"
                                            checked={data.is_recurring}
                                            onCheckedChange={(checked) => setData('is_recurring', checked)}
                                            disabled={!canEditRecurrence}
                                        />
                                        <Label htmlFor="is_recurring" className="flex items-center gap-2">
                                            <Repeat className="h-4 w-4" />
                                            Recurring schedule
                                        </Label>
                                    </div>

                                    {data.is_recurring && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border rounded-lg p-4 bg-muted/50">
                                            <div className="space-y-2">
                                                <Label htmlFor="recurrence_type">Repeat</Label>
                                                <Select
                                                    value={data.recurrence_type}
                                                    onValueChange={(value) => setData('recurrence_type', value)}
                                                    disabled={!canEditRecurrence}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="daily">Daily</SelectItem>
                                                        <SelectItem value="weekly">Weekly</SelectItem>
                                                        <SelectItem value="monthly">Monthly</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="recurrence_interval">Every</Label>
                                                <Input
                                                    id="recurrence_interval"
                                                    type="number"
                                                    min="1"
                                                    max="365"
                                                    value={data.recurrence_interval}
                                                    onChange={(e) => setData('recurrence_interval', parseInt(e.target.value) || 1)}
                                                    disabled={!canEditRecurrence}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="recurrence_end_date">End Date</Label>
                                                <Input
                                                    id="recurrence_end_date"
                                                    type="date"
                                                    value={data.recurrence_end_date}
                                                    onChange={(e) => setData('recurrence_end_date', e.target.value)}
                                                    disabled={!canEditRecurrence}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {!canEditRecurrence && (
                                        <Alert>
                                            <Info className="h-4 w-4" />
                                            <AlertDescription>
                                                Recurring schedule settings cannot be modified for schedules that have already started or been completed.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Assignment & Priority */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Assignment & Priority
                            </CardTitle>
                            <CardDescription>
                                Update responsibility and priority level
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 relative">
                                    <Label htmlFor="user_email">Assign To (Enter Email) *</Label>
                                    <Input
                                        id="user_email"
                                        type="email"
                                        value={userEmail}
                                        onChange={(e) => handleEmailChange(e.target.value)}
                                        onBlur={handleEmailBlur}
                                        onFocus={() => {
                                            if (emailResults.length > 0) {
                                                setShowEmailResults(true);
                                            }
                                        }}
                                        placeholder="Enter user email address"
                                    />

                                    {/* Email Search Results */}
                                    {showEmailResults && emailResults.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                            {emailResults.map((user) => (
                                                <div
                                                    key={user.id}
                                                    className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                                                    onClick={() => handleUserSelect(user)}
                                                >
                                                    <div className="font-medium text-sm">{user.name}</div>
                                                    <div className="text-xs text-muted-foreground">{user.email}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Selected User Display */}
                                    {selectedUser && (
                                        <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-md">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                <div>
                                                    <div className="text-sm font-medium text-emerald-800">
                                                        {selectedUser.name}
                                                    </div>
                                                    <div className="text-xs text-emerald-600">
                                                        {selectedUser.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* No Results Message */}
                                    {userEmail.length >= 3 && emailResults.length === 0 && (
                                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                                <div className="text-sm text-yellow-800">
                                                    No users found with this email address
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {errors.assigned_to && (
                                        <p className="text-sm text-red-600">{errors.assigned_to}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="incubator_id">Incubator (Optional)</Label>
                                    <Select
                                        value={data.incubator_id}
                                        onValueChange={(value) => setData('incubator_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select incubator" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value=" ">No incubator</SelectItem>
                                            {incubators.filter(inc => inc.status !== 'maintenance').map((incubator) => (
                                                <SelectItem key={incubator.id} value={incubator.id.toString()}>
                                                    {incubator.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select
                                        value={data.priority.toString()}
                                        onValueChange={(value) => setData('priority', parseInt(value))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[1, 2, 3, 4, 5].map((priority) => (
                                                <SelectItem key={priority} value={priority.toString()}>
                                                    <span className={getPriorityColor(priority)}>
                                                        P{priority} - {getPriorityLabel(priority)}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center space-x-2 mt-6">
                                    <Switch
                                        id="is_critical"
                                        checked={data.is_critical}
                                        onCheckedChange={(checked) => setData('is_critical', checked)}
                                    />
                                    <Label htmlFor="is_critical" className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-red-600" />
                                        Mark as Critical
                                    </Label>
                                </div>
                            </div>

                            {data.is_critical && (
                                <Alert>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Critical Schedule</AlertTitle>
                                    <AlertDescription>
                                        This schedule will be marked as critical and will receive priority attention.
                                        Critical schedules cannot be postponed without manager approval.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Requirements & Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Requirements & Notes</CardTitle>
                            <CardDescription>
                                Update additional information and requirements for this task
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="required_quantity">Required Quantity</Label>
                                    <Input
                                        id="required_quantity"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.required_quantity}
                                        onChange={(e) => setData('required_quantity', e.target.value)}
                                        placeholder="0"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="required_unit">Unit</Label>
                                    <Select
                                        value={data.required_unit}
                                        onValueChange={(value) => setData('required_unit', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value=" ">No unit</SelectItem>
                                            <SelectItem value="kg">Kilograms (kg)</SelectItem>
                                            <SelectItem value="g">Grams (g)</SelectItem>
                                            <SelectItem value="l">Liters (l)</SelectItem>
                                            <SelectItem value="ml">Milliliters (ml)</SelectItem>
                                            <SelectItem value="pieces">Pieces</SelectItem>
                                            <SelectItem value="doses">Doses</SelectItem>
                                            <SelectItem value="hours">Hours</SelectItem>
                                            <SelectItem value="minutes">Minutes</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Additional Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Any additional instructions or notes for this task"
                                    rows={4}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href={`/batch-incubator/schedules/${schedule.id}`}>
                                Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
