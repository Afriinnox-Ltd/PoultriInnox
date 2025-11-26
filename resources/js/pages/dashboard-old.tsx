import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Users,
    Activity,
    Egg,
    TrendingUp,
    ArrowRight,
    AlertTriangle,
    Calendar,
    Settings,
    Eye,
    Plus,
    Thermometer,
    BarChart3
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="space-y-6 p-6">
                {/* Welcome Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Welcome to Agriinnox</h1>
                        <p className="text-muted-foreground">
                            Your comprehensive livestock management system
                        </p>
                    </div>
                </div>

                {/* Quick Stats Overview */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">4</div>
                            <p className="text-xs text-muted-foreground">
                                2 growing, 1 laying, 1 incubating
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Birds</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1,960</div>
                            <p className="text-xs text-muted-foreground">
                                Across all active operations
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Daily Production</CardTitle>
                            <Egg className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">506</div>
                            <p className="text-xs text-muted-foreground">
                                Eggs per day
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Performance</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">94.3%</div>
                            <p className="text-xs text-muted-foreground">
                                Average survival rate
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Module Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Batch Management Module */}
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Users className="mr-2 h-5 w-5" />
                                Batch Management
                            </CardTitle>
                            <CardDescription>
                                Monitor and manage livestock batches throughout their lifecycle
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Active Batches</p>
                                    <p className="font-semibold">4</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Total Birds</p>
                                    <p className="font-semibold">1,960</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Mortality Rate</p>
                                    <p className="font-semibold">2.8%</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Avg Age</p>
                                    <p className="font-semibold">42 days</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Recent Batches</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Broiler Batch Alpha</span>
                                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Growing</Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Layer Batch Beta</span>
                                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Laying</Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Incubation Gamma</span>
                                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Incubating</Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <Link href="/batches" className="flex-1">
                                    <Button variant="outline" className="w-full">
                                        <Eye className="mr-2 h-4 w-4" />
                                        View All
                                    </Button>
                                </Link>
                                <Link href="/batches/create">
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        New Batch
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Incubator Management Module */}
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Thermometer className="mr-2 h-5 w-5" />
                                Incubator Management
                            </CardTitle>
                            <CardDescription>
                                Monitor incubator conditions and manage settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Active Incubators</p>
                                    <p className="font-semibold">3 / 4</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Capacity Used</p>
                                    <p className="font-semibold">78%</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Avg Temperature</p>
                                    <p className="font-semibold">37.6°C</p>
                                </div>

                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Status Overview</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Incubator A1</span>
                                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Running</Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Incubator B2</span>
                                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Running</Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Incubator C3</span>
                                        <Badge variant="secondary" className="bg-gray-100 text-gray-800">Idle</Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <Link href="/incubators" className="flex-1">
                                    <Button variant="outline" className="w-full">
                                        <Eye className="mr-2 h-4 w-4" />
                                        View All
                                    </Button>
                                </Link>
                                <Link href="/incubators/create">
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Incubator
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Coming Soon Modules */}
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <BarChart3 className="mr-2 h-5 w-5" />
                                Analytics & Reports
                            </CardTitle>
                            <CardDescription>
                                Performance analytics and detailed reporting
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center py-6">
                                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-semibold">Coming Soon</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Advanced analytics and reporting features
                                </p>
                            </div>
                            <Button variant="outline" disabled className="w-full">
                                Coming Soon
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Alerts and Quick Actions */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Alerts */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                                System Alerts
                            </CardTitle>
                            <CardDescription>
                                Important notifications and maintenance reminders
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Maintenance Due</p>
                                    <p className="text-xs text-muted-foreground">
                                        Incubator C3 requires maintenance within 5 days
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                <Calendar className="h-4 w-4 text-emerald-500 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Hatch Date Approaching</p>
                                    <p className="text-xs text-muted-foreground">
                                        Incubation Batch Gamma expected to hatch in 8 days
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                <TrendingUp className="h-4 w-4 text-emerald-500 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Production Milestone</p>
                                    <p className="text-xs text-muted-foreground">
                                        Layer Batch Beta reached 92% production rate
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>
                                Common tasks and shortcuts
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link href="/batches/create">
                                <Button className="w-full justify-start">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create New Batch
                                </Button>
                            </Link>

                            <Link href="/incubators">
                                <Button variant="outline" className="w-full justify-start">
                                    <Settings className="mr-2 h-4 w-4" />
                                    Manage Incubators
                                </Button>
                            </Link>

                            <Link href="/batches">
                                <Button variant="outline" className="w-full justify-start">
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    View Reports
                                </Button>
                            </Link>

                            <Button variant="outline" disabled className="w-full justify-start">
                                <Calendar className="mr-2 h-4 w-4" />
                                Schedule Maintenance
                                <span className="ml-auto text-xs text-muted-foreground">Soon</span>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Getting Started Guide */}
                <Card>
                    <CardHeader>
                        <CardTitle>Getting Started with Agriinnox</CardTitle>
                        <CardDescription>
                            New to the system? Follow these steps to get up and running
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="flex items-start space-x-3">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-sm font-medium">
                                    1
                                </div>
                                <div>
                                    <h4 className="font-medium">Set Up Incubators</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Configure your incubator machines and settings
                                    </p>
                                    <Link href="/incubators/create">
                                        <Button variant="link" className="h-auto p-0 text-xs">
                                            Add Incubator <ArrowRight className="ml-1 h-3 w-3" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-sm font-medium">
                                    2
                                </div>
                                <div>
                                    <h4 className="font-medium">Create Your First Batch</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Start tracking a new batch of eggs or chicks
                                    </p>
                                    <Link href="/batches/create">
                                        <Button variant="link" className="h-auto p-0 text-xs">
                                            Create Batch <ArrowRight className="ml-1 h-3 w-3" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-600 text-sm font-medium">
                                    3
                                </div>
                                <div>
                                    <h4 className="font-medium">Monitor Progress</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Track events, schedules, and performance
                                    </p>
                                    <Link href="/batches">
                                        <Button variant="link" className="h-auto p-0 text-xs">
                                            View Dashboard <ArrowRight className="ml-1 h-3 w-3" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
