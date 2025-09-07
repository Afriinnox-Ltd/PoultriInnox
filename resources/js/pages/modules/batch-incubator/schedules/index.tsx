import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import QuickNav from '@/components/batch-incubator/quick-nav';
import {
    Calendar,
    Clock,
    Plus,
    User,
    Package,
    Search,
    Filter,
    AlertTriangle,
    CheckCircle,
    Play,
    Pause,
    X
} from 'lucide-react';
import { Link, Head, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { NavigationHelper, navigateToBatch, navigateToFeedConsumption } from '@/utils/navigation';
import { NavigationLink, QuickNavigation, EntityLink } from '@/components/navigation/NavigationComponents';

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
];

interface Schedule {
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
    };
    incubator?: {
        id: number;
        name: string;
    };
    assigned_to?: {
        id: number;
        name: string;
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
}

interface SchedulesIndexProps {
    schedules: {
        data: Schedule[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    batches: Array<{ id: number; name: string; }>;
    statuses: Array<{ value: string; label: string; }>;
    eventTypes: Array<{ value: string; label: string; }>;
    stats: {
        total: number;
        pending: number;
        overdue: number;
        today: number;
        critical: number;
    };
    filters: {
        status?: string;
        batch_id?: string;
        date_from?: string;
        date_to?: string;
        event_type?: string;
    };
}

export default function SchedulesIndex({
    schedules,
    batches,
    statuses,
    eventTypes,
    stats,
    filters
}: SchedulesIndexProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleFilterChange = (key: string, value: string) => {
        router.get('/batch-incubator/schedules', {
            ...filters,
            [key]: value,
            page: 1 // Reset to first page when filtering
        }, {
            preserveState: true,
            replace: true
        });
    };

    const getStatusColor = (status: string) => {
        const colors = {
            pending: 'bg-emerald-100 text-emerald-800',
            in_progress: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-emerald-100 text-emerald-800',
            overdue: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-800',
            postponed: 'bg-orange-100 text-orange-800',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityColor = (priority: number) => {
        if (priority <= 2) return 'text-red-600';
        if (priority <= 3) return 'text-yellow-600';
        return 'text-emerald-600';
    };

    const formatDateTime = (date: string, time?: string) => {
        const dateObj = new Date(date);
        const dateStr = dateObj.toLocaleDateString();
        return time ? `${dateStr} at ${time}` : dateStr;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Schedules - Batch Incubator" />
            <div className="space-y-6 p-6">
                {/* Enhanced Header with Quick Actions */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Schedule Management</h1>
                        <p className="text-muted-foreground">
                            Plan, manage and track scheduled tasks for your batches and incubators
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <QuickNav
                            currentPage="schedules" 
                        /> 
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Schedules</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{stats.pending}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today</CardTitle>
                            <Calendar className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{stats.today}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Critical</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats.critical}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div>
                                <label className="text-sm font-medium">Status</label>
                                <Select
                                    value={filters.status || 'all'}
                                    onValueChange={(value) => handleFilterChange('status', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        {statuses.map((status) => (
                                            <SelectItem key={status.value} value={status.value}>
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Batch</label>
                                <Select
                                    value={filters.batch_id || 'all'}
                                    onValueChange={(value) => handleFilterChange('batch_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Batches</SelectItem>
                                        {batches.map((batch) => (
                                            <SelectItem key={batch.id} value={batch.id.toString()}>
                                                {batch.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Event Type</label>
                                <Select
                                    value={filters.event_type || 'all'}
                                    onValueChange={(value) => handleFilterChange('event_type', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        {eventTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">From Date</label>
                                <Input
                                    type="date"
                                    value={filters.date_from || ''}
                                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">To Date</label>
                                <Input
                                    type="date"
                                    value={filters.date_to || ''}
                                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Schedules List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Schedules ({schedules.total})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {schedules.data.length === 0 ? (
                            <div className="text-center py-8">
                                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium">No schedules found</h3>
                                <p className="text-muted-foreground mb-4">
                                    Get started by creating your first schedule.
                                </p>
                                <Button asChild>
                                    <Link href="/batch-incubator/schedules/create">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Schedule
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {schedules.data.map((schedule) => (
                                    <div key={schedule.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Link
                                                        href={`/batch-incubator/schedules/${schedule.id}`}
                                                        className="font-medium hover:text-emerald-600"
                                                    >
                                                        {schedule.title}
                                                    </Link>
                                                    <Badge className={getStatusColor(schedule.status.value)}>
                                                        {schedule.status.label}
                                                    </Badge>
                                                    {schedule.is_critical && (
                                                        <Badge variant="destructive">Critical</Badge>
                                                    )}
                                                    <span className={`text-sm font-medium ${getPriorityColor(schedule.priority)}`}>
                                                        P{schedule.priority}
                                                    </span>
                                                </div>

                                                <div className="text-sm text-muted-foreground mb-2">
                                                    {schedule.description}
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Package className="h-4 w-4" />
                                                        <EntityLink
                                                            id={schedule.batch.id}
                                                            label={schedule.batch.name}
                                                            onClick={(id) => navigateToBatch(id)}
                                                            className="text-emerald-600 hover:text-emerald-800"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {formatDateTime(schedule.scheduled_date, schedule.scheduled_time)}
                                                    </div>
                                                    {schedule.assigned_to && (
                                                        <div className="flex items-center gap-1">
                                                            <User className="h-4 w-4" />
                                                            {schedule.assigned_to.name}
                                                        </div>
                                                    )}
                                                    <Badge variant="outline">
                                                        {schedule.event_type.label}
                                                    </Badge>
                                                    {schedule.required_quantity && (
                                                        <span>{schedule.required_quantity} {schedule.required_unit}</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/batch-incubator/schedules/${schedule.id}`}>
                                                        View
                                                    </Link>
                                                </Button>

                                                {/* Quick Navigation */}
                                                <div className="flex gap-1">
                                                    <NavigationLink
                                                        onClick={() => navigateToFeedConsumption(schedule.batch.id)}
                                                        size="sm"
                                                        variant="button"
                                                        className="text-xs"
                                                    >
                                                        Feed Records
                                                    </NavigationLink>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
