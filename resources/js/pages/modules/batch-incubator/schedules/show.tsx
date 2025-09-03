import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ScheduleReminders from '@/components/modules/batch-incubator/schedule/ScheduleReminders';
import {
    Calendar,
    Clock,
    User,
    Package,
    Edit,
    Play,
    CheckCircle,
    X,
    Pause,
    AlertTriangle,
    ArrowLeft,
    Repeat,
    MapPin
} from 'lucide-react';
import { Link, Head, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

interface ScheduleShowProps {
    schedule: {
        id: number;
        title: string;
        description?: string;
        event_type: {
            value: string;
            label: string;
        };
        batch: {
            id: number;
            name: string;
            batch_code: string;
            status: string;
        };
        incubator?: {
            id: number;
            name: string;
            status: string;
        };
        assigned_to?: {
            id: number;
            name: string;
            email: string;
        };
        scheduled_date: string;
        scheduled_time?: string;
        status: {
            value: string;
            label: string;
        };
        priority: number;
        is_critical: boolean;
        required_quantity?: number;
        required_unit?: string;
        notes?: string;
        is_recurring: boolean;
        recurrence_type?: string;
        recurrence_interval?: number;
        recurrence_end_date?: string;
        max_occurrences?: number;
        current_occurrence?: number;
        started_at?: string;
        completed_at?: string;
        created_at: string;
        updated_at: string;
        next_occurrence?: {
            id: number;
            scheduled_date: string;
            scheduled_time?: string;
        };
        previous_occurrence?: {
            id: number;
            scheduled_date: string;
            status: string;
        };
    };
    users: Array<{
        id: number;
        name: string;
        email: string;
    }>;
}

export default function ScheduleShow({ schedule, users }: ScheduleShowProps) {
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
    ];

    const getStatusColor = (status: string) => {
        const colors = {
            pending: 'bg-blue-100 text-blue-800',
            in_progress: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-green-100 text-green-800',
            overdue: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-800',
            postponed: 'bg-orange-100 text-orange-800',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityColor = (priority: number) => {
        if (priority <= 2) return 'text-red-600';
        if (priority === 3) return 'text-yellow-600';
        return 'text-green-600';
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

    const formatDateTime = (date: string, time?: string) => {
        const dateObj = new Date(date);
        const dateStr = dateObj.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        return time ? `${dateStr} at ${time}` : dateStr;
    };

    const canStart = schedule.status.value === 'pending';
    const canComplete = schedule.status.value === 'in_progress';
    const canCancel = ['pending', 'in_progress'].includes(schedule.status.value);
    const canPostpone = ['pending', 'in_progress'].includes(schedule.status.value);

    const handleStatusAction = (action: string) => {
        router.post(`/batch-incubator/schedules/${schedule.id}/${action}`, {}, {
            preserveScroll: true,
        });
    };

    const isOverdue = () => {
        const now = new Date();
        const scheduledDateTime = new Date(`${schedule.scheduled_date}T${schedule.scheduled_time || '00:00'}`);
        return scheduledDateTime < now && schedule.status.value === 'pending';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${schedule.title} - Schedules`} />
            <div className="space-y-6 p-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/batch-incubator/schedules">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Schedules
                                </Link>
                            </Button>
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold tracking-tight">{schedule.title}</h1>
                            <Badge className={getStatusColor(schedule.status.value)}>
                                {schedule.status.label}
                            </Badge>
                            {schedule.is_critical && (
                                <Badge variant="destructive">Critical</Badge>
                            )}
                            {schedule.is_recurring && (
                                <Badge variant="outline" className="bg-purple-100 text-purple-800">
                                    <Repeat className="h-3 w-3 mr-1" />
                                    Recurring
                                </Badge>
                            )}
                            <span className={`text-sm font-medium ${getPriorityColor(schedule.priority)}`}>
                                P{schedule.priority} - {getPriorityLabel(schedule.priority)}
                            </span>
                        </div>
                        {schedule.description && (
                            <p className="text-muted-foreground text-lg">{schedule.description}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {canStart && (
                            <Button onClick={() => handleStatusAction('start')}>
                                <Play className="h-4 w-4 mr-2" />
                                Start Task
                            </Button>
                        )}
                        {canComplete && (
                            <Button onClick={() => handleStatusAction('complete')}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete
                            </Button>
                        )}
                        {canPostpone && (
                            <Button variant="outline" onClick={() => handleStatusAction('postpone')}>
                                <Pause className="h-4 w-4 mr-2" />
                                Postpone
                            </Button>
                        )}
                        {canCancel && (
                            <Button variant="destructive" onClick={() => handleStatusAction('cancel')}>
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                        )}
                        <Button variant="outline" asChild>
                            <Link href={`/batch-incubator/schedules/${schedule.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Overdue Alert */}
                {isOverdue() && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Schedule Overdue</AlertTitle>
                        <AlertDescription>
                            This task was scheduled for {formatDateTime(schedule.scheduled_date, schedule.scheduled_time)}
                            and is now overdue. Please start or reschedule this task.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Schedule Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Schedule Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Event Type</label>
                                        <p className="font-medium">{schedule.event_type.label}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Scheduled Date & Time</label>
                                        <p className="font-medium">
                                            {formatDateTime(schedule.scheduled_date, schedule.scheduled_time)}
                                        </p>
                                    </div>
                                </div>

                                {schedule.is_recurring && (
                                    <div className="border rounded-lg p-4 bg-muted/50">
                                        <h4 className="font-medium mb-2 flex items-center gap-2">
                                            <Repeat className="h-4 w-4" />
                                            Recurring Schedule
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Repeats:</span>
                                                <p className="font-medium capitalize">
                                                    Every {schedule.recurrence_interval} {schedule.recurrence_type}
                                                    {(schedule.recurrence_interval && schedule.recurrence_interval > 1) ? 's' : ''}
                                                </p>
                                            </div>
                                            {schedule.current_occurrence && schedule.max_occurrences && (
                                                <div>
                                                    <span className="text-muted-foreground">Occurrence:</span>
                                                    <p className="font-medium">
                                                        {schedule.current_occurrence} of {schedule.max_occurrences}
                                                    </p>
                                                </div>
                                            )}
                                            {schedule.recurrence_end_date && (
                                                <div>
                                                    <span className="text-muted-foreground">Ends:</span>
                                                    <p className="font-medium">
                                                        {new Date(schedule.recurrence_end_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {(schedule.required_quantity || schedule.required_unit) && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Required Quantity</label>
                                        <p className="font-medium">
                                            {schedule.required_quantity} {schedule.required_unit}
                                        </p>
                                    </div>
                                )}

                                {schedule.notes && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Notes</label>
                                        <p className="font-medium whitespace-pre-wrap">{schedule.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                                        <div>
                                            <p className="font-medium">Schedule Created</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(schedule.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {schedule.started_at && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
                                            <div>
                                                <p className="font-medium">Task Started</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(schedule.started_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {schedule.completed_at && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full bg-green-600"></div>
                                            <div>
                                                <p className="font-medium">Task Completed</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(schedule.completed_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Related Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Related Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Batch</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Package className="h-4 w-4" />
                                        <Link
                                            href={`/batch-incubator/batches/${schedule.batch.id}`}
                                            className="font-medium hover:text-blue-600"
                                        >
                                            {schedule.batch.name}
                                        </Link>
                                        <Badge variant="outline" className="text-xs">
                                            {schedule.batch.batch_code}
                                        </Badge>
                                    </div>
                                </div>

                                {schedule.incubator && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Incubator</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <MapPin className="h-4 w-4" />
                                            <Link
                                                href={`/batch-incubator/incubators/${schedule.incubator.id}`}
                                                className="font-medium hover:text-blue-600"
                                            >
                                                {schedule.incubator.name}
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {schedule.assigned_to && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <User className="h-4 w-4" />
                                            <div>
                                                <p className="font-medium">{schedule.assigned_to.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {schedule.assigned_to.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recurring Schedule Navigation */}
                        {schedule.is_recurring && (schedule.next_occurrence || schedule.previous_occurrence) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Repeat className="h-5 w-5" />
                                        Recurring Occurrences
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {schedule.previous_occurrence && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Previous</label>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">
                                                        {new Date(schedule.previous_occurrence.scheduled_date).toLocaleDateString()}
                                                    </p>
                                                    <Badge className={getStatusColor(schedule.previous_occurrence.status)}>
                                                        {schedule.previous_occurrence.status}
                                                    </Badge>
                                                </div>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/batch-incubator/schedules/${schedule.previous_occurrence.id}`}>
                                                        View
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {schedule.next_occurrence && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Next</label>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">
                                                        {formatDateTime(schedule.next_occurrence.scheduled_date, schedule.next_occurrence.scheduled_time)}
                                                    </p>
                                                </div>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/batch-incubator/schedules/${schedule.next_occurrence.id}`}>
                                                        View
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href={`/batch-incubator/batches/${schedule.batch.id}`}>
                                        <Package className="h-4 w-4 mr-2" />
                                        View Batch Details
                                    </Link>
                                </Button>

                                {schedule.incubator && (
                                    <Button variant="outline" className="w-full justify-start" asChild>
                                        <Link href={`/batch-incubator/incubators/${schedule.incubator.id}`}>
                                            <MapPin className="h-4 w-4 mr-2" />
                                            View Incubator
                                        </Link>
                                    </Button>
                                )}

                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href="/batch-incubator/schedules/create">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Create New Schedule
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Reminders Section */}
                <ScheduleReminders
                    scheduleId={schedule.id}
                    users={users}
                />
            </div>
        </AppLayout>
    );
}
