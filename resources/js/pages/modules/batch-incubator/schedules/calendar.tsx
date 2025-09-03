import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Plus,
    Filter,
    Clock,
    AlertTriangle
} from 'lucide-react';
import { Link, Head, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

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
        title: 'Calendar',
        href: '/batch-incubator/schedules/calendar',
    },
];

interface CalendarSchedule {
    id: number;
    title: string;
    scheduled_date: string;
    scheduled_time?: string;
    status: {
        value: string;
        label: string;
    };
    event_type: {
        value: string;
        label: string;
    };
    batch: {
        name: string;
    };
    is_critical: boolean;
    priority: number;
}

interface ScheduleCalendarProps {
    schedules: CalendarSchedule[];
    currentDate: string;
    filters: {
        status?: string;
        event_type?: string;
        batch_id?: string;
    };
}

export default function ScheduleCalendar({
    schedules,
    currentDate,
    filters
}: ScheduleCalendarProps) {
    const [viewDate, setViewDate] = useState(new Date(currentDate));

    const getStatusColor = (status: string) => {
        const colors = {
            pending: 'bg-blue-100 text-blue-800 border-blue-200',
            in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            completed: 'bg-green-100 text-green-800 border-green-200',
            overdue: 'bg-red-100 text-red-800 border-red-200',
            cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
            postponed: 'bg-orange-100 text-orange-800 border-orange-200',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(viewDate);
        if (direction === 'prev') {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        setViewDate(newDate);

        // Update URL with new month
        router.get('/batch-incubator/schedules/calendar', {
            ...filters,
            month: newDate.toISOString().substring(0, 7)
        }, {
            preserveState: true,
            replace: true
        });
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const getSchedulesForDate = (date: Date | null) => {
        if (!date) return [];
        const dateStr = date.toISOString().split('T')[0];
        return schedules.filter(schedule => schedule.scheduled_date === dateStr);
    };

    const isToday = (date: Date | null) => {
        if (!date) return false;
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const days = getDaysInMonth(viewDate);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Schedule Calendar - Batch Incubator" />
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Schedule Calendar</h1>
                        <p className="text-muted-foreground">
                            View and manage your schedules in calendar format
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/batch-incubator/schedules">
                                <Filter className="h-4 w-4 mr-2" />
                                List View
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/batch-incubator/schedules/create">
                                <Plus className="h-4 w-4 mr-2" />
                                New Schedule
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Calendar */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setViewDate(new Date())}>
                                    Today
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-7 gap-1">
                            {/* Day headers */}
                            {dayNames.map((day) => (
                                <div key={day} className="p-2 text-center font-medium text-muted-foreground">
                                    {day}
                                </div>
                            ))}

                            {/* Calendar days */}
                            {days.map((date, index) => {
                                const daySchedules = getSchedulesForDate(date);
                                const hasOverdue = daySchedules.some(s => s.status.value === 'overdue');
                                const hasCritical = daySchedules.some(s => s.is_critical);

                                return (
                                    <div
                                        key={index}
                                        className={`
                                            min-h-[120px] p-1 border rounded-lg
                                            ${date ? 'bg-white hover:bg-muted/50' : 'bg-muted/20'}
                                            ${isToday(date) ? 'ring-2 ring-blue-500' : ''}
                                            ${hasOverdue ? 'border-red-300' : ''}
                                            ${hasCritical && !hasOverdue ? 'border-orange-300' : ''}
                                        `}
                                    >
                                        {date && (
                                            <>
                                                <div className={`
                                                    text-sm font-medium mb-1 p-1 rounded
                                                    ${isToday(date) ? 'bg-blue-100 text-blue-800' : ''}
                                                `}>
                                                    {date.getDate()}
                                                </div>
                                                <div className="space-y-1">
                                                    {daySchedules.slice(0, 3).map((schedule) => (
                                                        <Link
                                                            key={schedule.id}
                                                            href={`/batch-incubator/schedules/${schedule.id}`}
                                                            className={`
                                                                block p-1 rounded text-xs border
                                                                ${getStatusColor(schedule.status.value)}
                                                                hover:opacity-80 transition-opacity
                                                            `}
                                                        >
                                                            <div className="flex items-center gap-1">
                                                                {schedule.is_critical && (
                                                                    <AlertTriangle className="h-3 w-3" />
                                                                )}
                                                                {schedule.scheduled_time && (
                                                                    <Clock className="h-3 w-3" />
                                                                )}
                                                                <span className="truncate">
                                                                    {schedule.title}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs opacity-70 truncate">
                                                                {schedule.batch.name}
                                                            </div>
                                                            {schedule.scheduled_time && (
                                                                <div className="text-xs opacity-70">
                                                                    {schedule.scheduled_time}
                                                                </div>
                                                            )}
                                                        </Link>
                                                    ))}
                                                    {daySchedules.length > 3 && (
                                                        <div className="text-xs text-center text-muted-foreground p-1">
                                                            +{daySchedules.length - 3} more
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Legend */}
                <Card>
                    <CardHeader>
                        <CardTitle>Legend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-blue-100 border border-blue-200"></div>
                                <span className="text-sm">Pending</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-200"></div>
                                <span className="text-sm">In Progress</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-green-100 border border-green-200"></div>
                                <span className="text-sm">Completed</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-red-100 border border-red-200"></div>
                                <span className="text-sm">Overdue</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                                <span className="text-sm">Critical Task</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-blue-600" />
                                <span className="text-sm">Scheduled Time</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
