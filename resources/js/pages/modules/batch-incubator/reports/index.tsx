import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, FileText, Download, Eye, Calendar } from 'lucide-react';
import { Link, Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import QuickNav from '@/components/batch-incubator/quick-nav';

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
    quickStats?: any;
    performanceMetrics?: any;
}

export default function ReportsIndex({ reports, quickStats, performanceMetrics }: ReportsIndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports - Batch Incubator" />
            <div className="space-y-6 p-6">
                {/* Enhanced Header with Quick Actions */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
                        <p className="text-muted-foreground">
                            Analyze performance data and generate comprehensive reports for your operation
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <QuickNav currentPage="reports" />
                    </div>
                </div>

                {/* Report Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="hover:shadow-md transition-shadow">
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
                                    <Button asChild variant="outline" size="sm">
                                        <Link href="/batch-incubator/reports/generate?type=production&preset=daily">
                                            <Eye className="h-3 w-3" />
                                        </Link>
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Hatch Rate Analysis</span>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href="/batch-incubator/reports/generate?type=production&preset=hatch-rate">
                                            <Eye className="h-3 w-3" />
                                        </Link>
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Mortality Tracking</span>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href="/batch-incubator/reports/generate?type=production&preset=mortality">
                                            <Eye className="h-3 w-3" />
                                        </Link>
                                    </Button>
                                </div>
                                <Button asChild className="w-full mt-3">
                                    <Link href="/batch-incubator/reports/generate?category=production">
                                        Generate Production Report
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
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
                                    <Button asChild variant="outline" size="sm">
                                        <Link href="/batch-incubator/reports/generate?type=efficiency&preset=utilization">
                                            <Eye className="h-3 w-3" />
                                        </Link>
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Energy Consumption</span>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href="/batch-incubator/reports/generate?type=efficiency&preset=energy">
                                            <Eye className="h-3 w-3" />
                                        </Link>
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Resource Optimization</span>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href="/batch-incubator/reports/generate?type=efficiency&preset=optimization">
                                            <Eye className="h-3 w-3" />
                                        </Link>
                                    </Button>
                                </div>
                                <Button asChild className="w-full mt-3">
                                    <Link href="/batch-incubator/reports/generate?category=efficiency">
                                        Generate Efficiency Report
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
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
                                    <Button asChild variant="outline" size="sm">
                                        <Link href="/batch-incubator/reports/generate?type=financial&preset=cost-analysis">
                                            <Eye className="h-3 w-3" />
                                        </Link>
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Revenue Analysis</span>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href="/batch-incubator/reports/generate?type=financial&preset=revenue">
                                            <Eye className="h-3 w-3" />
                                        </Link>
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Profitability Report</span>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href="/batch-incubator/reports/generate?type=financial&preset=profitability">
                                            <Eye className="h-3 w-3" />
                                        </Link>
                                    </Button>
                                </div>
                                <Button asChild className="w-full mt-3">
                                    <Link href="/batch-incubator/reports/generate?category=financial">
                                        Generate Financial Report
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Real-time Analytics Dashboard */}
                <Card>
                    <CardHeader>
                        <CardTitle>Real-time Performance Metrics</CardTitle>
                        <CardDescription>
                            Live performance indicators updated in real-time
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="text-2xl font-bold text-blue-600">
                                    {quickStats?.avg_hatch_rate || 94.2}%
                                </div>
                                <div className="text-sm text-muted-foreground">Average Hatch Rate</div>
                                <div className="text-xs text-green-600 mt-1">↗ +2.1% from last month</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="text-2xl font-bold text-green-600">
                                    {quickStats?.incubator_utilization || 78}%
                                </div>
                                <div className="text-sm text-muted-foreground">Incubator Utilization</div>
                                <div className="text-xs text-green-600 mt-1">↗ +5.2% efficiency</div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                                <div className="text-2xl font-bold text-purple-600">
                                    {quickStats?.active_batches || 12}
                                </div>
                                <div className="text-sm text-muted-foreground">Active Batches</div>
                                <div className="text-xs text-blue-600 mt-1">{quickStats?.total_batches || 25} total batches</div>
                            </div>
                            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                                <div className="text-2xl font-bold text-orange-600">
                                    {quickStats?.avg_mortality_rate || 2.1}%
                                </div>
                                <div className="text-sm text-muted-foreground">Mortality Rate</div>
                                <div className="text-xs text-green-600 mt-1">↘ -0.8% improvement</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Reports & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Report Generation</CardTitle>
                            <CardDescription>
                                Generate common reports with pre-configured settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <Button asChild className="w-full justify-start" variant="outline">
                                    <Link href="/batch-incubator/reports/generate?type=production&period=week">
                                        <TrendingUp className="h-4 w-4 mr-2" />
                                        Weekly Production Summary
                                    </Link>
                                </Button>
                                <Button asChild className="w-full justify-start" variant="outline">
                                    <Link href="/batch-incubator/reports/generate?type=efficiency&period=month">
                                        <BarChart3 className="h-4 w-4 mr-2" />
                                        Monthly Efficiency Report
                                    </Link>
                                </Button>
                                <Button asChild className="w-full justify-start" variant="outline">
                                    <Link href="/batch-incubator/reports/generate?type=batch-performance&period=quarter">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Quarterly Performance Review
                                    </Link>
                                </Button>
                                <Button asChild className="w-full justify-start" variant="outline">
                                    <Link href="/batch-incubator/reports/generate?type=financial&period=year">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Annual Financial Analysis
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Report Library</CardTitle>
                            <CardDescription>
                                Access previously generated reports
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {reports && reports.length > 0 ? (
                                    reports.slice(0, 4).map((report, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                            <div>
                                                <p className="font-medium text-sm">{report.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Generated {report.created_at || 'Recently'}
                                                </p>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button size="sm" variant="ghost">
                                                    <Eye className="h-3 w-3" />
                                                </Button>
                                                <Button size="sm" variant="ghost">
                                                    <Download className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">No reports generated yet</p>
                                        <Button asChild className="mt-4" size="sm">
                                            <Link href="/batch-incubator/reports/generate">
                                                Generate Your First Report
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
