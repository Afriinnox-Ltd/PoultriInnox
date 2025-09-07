import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Package,
    Settings,
    ShoppingCart,
    Heart,
    DollarSign,
    TrendingUp,
    Plus,
    ArrowRight,
    Eye,
    BarChart3,
    Users,
    Calendar,
    Activity
} from 'lucide-react';
import { Link, Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface Module {
    id: number;
    name: string;
    slug: string;
    description: string;
    icon: string;
    config: any;
}

interface DashboardProps {
    enabledModules: Module[];
}

const getModuleIcon = (iconName: string) => {
    const icons = {
        'package': Package,
        'shopping-cart': ShoppingCart,
        'heart': Heart,
        'dollar-sign': DollarSign,
        'trending-up': TrendingUp,
    };

    return icons[iconName as keyof typeof icons] || Settings;
};

const getModuleQuickActions = (moduleSlug: string): Array<{
    label: string;
    href: string;
    icon: any;
    description: string;
    disabled?: boolean;
}> => {
    switch (moduleSlug) {
        case 'batch-incubator':
            return [
                {
                    label: 'Overview',
                    href: '/batch-incubator',
                    icon: Eye,
                    description: 'View module dashboard'
                },
                {
                    label: 'Batches',
                    href: '/batch-incubator/batches',
                    icon: Package,
                    description: 'Manage chicken batches'
                },
                {
                    label: 'Incubators',
                    href: '/batch-incubator/incubators',
                    icon: Activity,
                    description: 'Monitor incubation equipment'
                },
                {
                    label: 'Schedules',
                    href: '/batch-incubator/schedules',
                    icon: Calendar,
                    description: 'Feeding and maintenance tasks'
                },
                {
                    label: 'Reports',
                    href: '/batch-incubator/reports',
                    icon: BarChart3,
                    description: 'Performance analytics'
                }
            ];
        case 'feed-management':
            return [
                {
                    label: 'Coming Soon',
                    href: '#',
                    icon: Package,
                    description: 'Module in development',
                    disabled: true
                }
            ];
        case 'health-monitoring':
            return [
                {
                    label: 'Coming Soon',
                    href: '#',
                    icon: Heart,
                    description: 'Module in development',
                    disabled: true
                }
            ];
        case 'financial-management':
            return [
                {
                    label: 'Coming Soon',
                    href: '#',
                    icon: DollarSign,
                    description: 'Module in development',
                    disabled: true
                }
            ];
        case 'production-analytics':
            return [
                {
                    label: 'Coming Soon',
                    href: '#',
                    icon: TrendingUp,
                    description: 'Module in development',
                    disabled: true
                }
            ];
        default:
            return [
                {
                    label: 'Coming Soon',
                    href: '#',
                    icon: Settings,
                    description: 'Module in development',
                    disabled: true
                }
            ];
    }
};

export default function Dashboard({
    enabledModules
}: DashboardProps) {

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="space-y-6 p-6">
                {/* Welcome Section */}
                {enabledModules.length !== 0 && (
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">PoultriInnox Dashboard</h1>
                            <p className="text-muted-foreground">
                                Modular poultry management system - Choose your tools, manage your way
                            </p>
                        </div>
                        <Button asChild>
                            <Link href="/modules">
                                <Settings className="h-4 w-4 mr-2" />
                                Manage Modules
                            </Link>
                        </Button>
                    </div>
                )}

                {/* No Modules Active */}
                {enabledModules.length === 0 && (
                    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                        <div className="max-w-md mx-auto">
                            <Package className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2">Welcome to PoultriInnox</h2>
                            <p className="text-muted-foreground mb-6">
                                Get started by activating modules that match your poultry operation needs.
                                Each module provides specialized tools and features.
                            </p>

                            <div className="space-y-3 flex gap-3 mb-6">
                                <Button asChild size="lg" className="w-full">
                                    <Link href="/modules">
                                        <Plus className="h-5 w-5 mr-2" />
                                        Activate Your First Module
                                    </Link>
                                </Button>

                                <Button asChild variant="outline" size="lg" className="w-full">
                                    <Link href="/modules">
                                        View All Available Modules
                                    </Link>
                                </Button>
                            </div>

                            <Card className="border-emerald-200 bg-emerald-50">
                                <CardContent className="">
                                    <p className="text-sm text-emerald-800">
                                        💡 <strong>Tip:</strong> Start with the Batch Incubator module if you're managing egg incubation and chicken raising.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Active Modules */}
                {enabledModules.length > 0 && (
                    <div className="space-y-6">

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {enabledModules.map((module) => {
                                const IconComponent = getModuleIcon(module.icon);
                                const quickActions = getModuleQuickActions(module.slug);

                                return (
                                    <Card key={module.id} className="border-emerald-200 bg-white">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="flex items-center gap-3">
                                                <div className="p-2 bg-emerald-600 rounded-lg">
                                                    <IconComponent className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold">{module.name}</h3>
                                                    <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs">
                                                        Active
                                                    </Badge>
                                                </div>
                                            </CardTitle>
                                            <CardDescription className="text-sm leading-relaxed">
                                                {module.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="">
                                                {/* {quickActions.length > 4 && ( */}
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full"
                                                    >
                                                        <Link href={`/${module.slug}`}>
                                                            Open
                                                            <ArrowRight className="h-3 w-3 ml-2" />
                                                        </Link>
                                                    </Button>
                                                { }
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>


                        {/* Add More Modules Suggestion */}
                        <Card className="border-emerald-200 bg-emerald-50">
                            <CardHeader>
                                <CardTitle className="text-emerald-800">Expand Your System</CardTitle>
                                <CardDescription className="text-emerald-700">
                                    Discover more modules to enhance your poultry management capabilities
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-emerald-800 mb-2">
                                            <strong>Available modules:</strong> Feed Management, Health Monitoring, Financial Tracking, and Production Analytics
                                        </p>
                                        <p className="text-sm text-emerald-700">
                                            Each module integrates seamlessly with your existing setup and adds specialized functionality.
                                        </p>
                                    </div>
                                    <Button asChild variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-100">
                                        <Link href="/modules">
                                            Explore Modules
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
