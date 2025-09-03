import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, FileText, Download, Eye, Calendar } from 'lucide-react';
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
        title: 'Reports',
        href: '/batch-incubator/reports',
    },
];

interface ReportsIndexProps {
    reports: any[];
}

export default function ReportsIndex({ reports }: ReportsIndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports - Batch Incubator" />
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Batch Reports & Analytics</h1>
                        <p className="text-muted-foreground">
                            Analyze performance data and generate comprehensive reports
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/batch-incubator/reports/generate">
                            <FileText className="h-4 w-4 mr-2" />
                            Generate Report
                        </Link>
                    </Button>
                </div>

                {/* Coming Soon Card */}
                <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-green-600" />
                            Advanced Analytics & Reporting
                        </CardTitle>
                        <CardDescription>
                            Comprehensive reporting system for data-driven decisions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                The Analytics & Reporting system will provide:
                            </p>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                <li>Batch performance and hatch rate analysis</li>
                                <li>Incubator efficiency and utilization reports</li>
                                <li>Production forecasting and trends</li>
                                <li>Financial performance and profitability analysis</li>
                                <li>Mortality rate tracking and alerts</li>
                                <li>Feed conversion and growth rate reports</li>
                            </ul>
                            <div className="flex gap-4">
                                <Badge variant="outline" className="bg-green-100 text-green-700">
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

                {/* Report Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                                Production Reports
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Daily Production</span>
                                    <Button variant="outline" size="sm" disabled>
                                        <Eye className="h-3 w-3" />
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Hatch Rate Analysis</span>
                                    <Button variant="outline" size="sm" disabled>
                                        <Eye className="h-3 w-3" />
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Mortality Tracking</span>
                                    <Button variant="outline" size="sm" disabled>
                                        <Eye className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <BarChart3 className="h-5 w-5 text-green-600" />
                                Efficiency Reports
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Incubator Utilization</span>
                                    <Button variant="outline" size="sm" disabled>
                                        <Eye className="h-3 w-3" />
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Energy Consumption</span>
                                    <Button variant="outline" size="sm" disabled>
                                        <Eye className="h-3 w-3" />
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Resource Optimization</span>
                                    <Button variant="outline" size="sm" disabled>
                                        <Eye className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Calendar className="h-5 w-5 text-purple-600" />
                                Financial Reports
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Cost per Batch</span>
                                    <Button variant="outline" size="sm" disabled>
                                        <Eye className="h-3 w-3" />
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Revenue Analysis</span>
                                    <Button variant="outline" size="sm" disabled>
                                        <Eye className="h-3 w-3" />
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Profitability Report</span>
                                    <Button variant="outline" size="sm" disabled>
                                        <Eye className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Stats Preview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Analytics Preview</CardTitle>
                        <CardDescription>
                            Sample metrics that will be available in full reports
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">94.2%</div>
                                <div className="text-sm text-muted-foreground">Average Hatch Rate</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">78%</div>
                                <div className="text-sm text-muted-foreground">Incubator Utilization</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">21.3</div>
                                <div className="text-sm text-muted-foreground">Avg. Days to Hatch</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-orange-600">2.1%</div>
                                <div className="text-sm text-muted-foreground">Mortality Rate</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
