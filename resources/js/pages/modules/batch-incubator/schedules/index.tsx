import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, User, Package } from 'lucide-react';
import { Link, Head } from '@inertiajs/react';
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
];

interface SchedulesIndexProps {
    schedules: any[];
}

export default function SchedulesIndex({ schedules }: SchedulesIndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Schedules - Batch Incubator" />
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Batch Schedules</h1>
                        <p className="text-muted-foreground">
                            Manage and track scheduled tasks for your batches and incubators
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/batch-incubator/schedules/create">
                            <Plus className="h-4 w-4 mr-2" />
                            New Schedule
                        </Link>
                    </Button>
                </div>

                {/* Coming Soon Card */}
                <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            Schedule Management
                        </CardTitle>
                        <CardDescription>
                            Comprehensive scheduling system for batch operations
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                The Schedule Management system will allow you to:
                            </p>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                <li>Schedule regular maintenance for incubators</li>
                                <li>Set up feeding schedules for different batch stages</li>
                                <li>Plan vaccination and health check schedules</li>
                                <li>Automate egg collection reminders</li>
                                <li>Set notifications for critical batch milestones</li>
                            </ul>
                            <div className="flex gap-4">
                                <Badge variant="outline" className="bg-blue-100 text-blue-700">
                                    Coming Soon
                                </Badge>
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/batch-incubator">
                                        Return to Overview
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sample Schedule Types */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Clock className="h-5 w-5 text-green-600" />
                                Daily Tasks
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span>Egg Collection</span>
                                    <Badge variant="outline">6:00 AM</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Temperature Check</span>
                                    <Badge variant="outline">8:00 AM</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Feeding</span>
                                    <Badge variant="outline">12:00 PM</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                Weekly Tasks
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span>Incubator Cleaning</span>
                                    <Badge variant="outline">Monday</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Health Inspection</span>
                                    <Badge variant="outline">Wednesday</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Weight Monitoring</span>
                                    <Badge variant="outline">Friday</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Package className="h-5 w-5 text-purple-600" />
                                Batch Milestones
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span>Hatch Date</span>
                                    <Badge variant="outline">Day 21</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Transfer to Brooder</span>
                                    <Badge variant="outline">Day 22</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>First Vaccination</span>
                                    <Badge variant="outline">Day 7</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
