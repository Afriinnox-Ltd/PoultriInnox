import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Package,
  ShoppingCart,
  Heart,
  DollarSign,
  TrendingUp,
  Settings,
  CheckCircle,
  Circle,
  Calendar,
  Info,
  ArrowRight,
  Users,
  BarChart3,
  Activity,
  Eye
} from 'lucide-react';
import { Link, Head, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Modules',
        href: '/modules',
    },
];

interface Module {
    id: number;
    name: string;
    slug: string;
    description: string;
    icon: string;
    version: string;
    config: {
        features?: string[];
        benefits?: string[];
        ideal_for?: string;
        [key: string]: any;
    };
    is_enabled: boolean;
    is_activated: boolean;
    activated_at: string | null;
}

interface ModulesIndexProps {
    modules: Module[];
}

const getIcon = (iconName: string) => {
    const icons = {
        'package': Package,
        'shopping-cart': ShoppingCart,
        'heart': Heart,
        'dollar-sign': DollarSign,
        'trending-up': TrendingUp,
    };

    return icons[iconName as keyof typeof icons] || Settings;
};

export default function ModulesIndex({ modules }: ModulesIndexProps) {
    const { post, processing } = useForm();
    const [selectedModule, setSelectedModule] = useState<Module | null>(null);

    const handleToggleModule = (module: Module) => {
        const action = module.is_enabled ? 'deactivate' : 'activate';
        post(`/modules/${module.id}/${action}`, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleViewDetails = (module: Module) => {
        setSelectedModule(module);
    };

    const handleCloseDetails = () => {
        setSelectedModule(null);
    };

    const enabledModules = modules.filter(m => m.is_enabled);
    const availableModules = modules.filter(m => !m.is_activated);
    const inactiveModules = modules.filter(m => m.is_activated && !m.is_enabled);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Module Management" />
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Module Management</h1>
                        <p className="text-muted-foreground">
                            Choose which modules to activate for your poultry management system
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/dashboard">
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Modules</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{enabledModules.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Available Modules</CardTitle>
                            <Circle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{availableModules.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Inactive Modules</CardTitle>
                            <Circle className="h-4 w-4 text-gray-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-600">{inactiveModules.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{modules.length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Active Modules */}
                {enabledModules.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Active Modules</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {enabledModules.map((module) => {
                                const IconComponent = getIcon(module.icon);

                                return (
                                    <Card key={module.id} className="border-green-200 bg-white">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <IconComponent className="h-5 w-5 text-green-600" />
                                                {module.name}
                                                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                                                    Active
                                                </Badge>
                                            </CardTitle>
                                            <CardDescription>{module.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-col  gap-3 justify-between">
                                                <div className="text-sm text-muted-foreground">
                                                    Version {module.version}
                                                    {module.activated_at && (
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <Calendar className="h-3 w-3" />
                                                            Activated {new Date(module.activated_at).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleViewDetails(module)}
                                                        className="border-green-300 text-green-700 hover:bg-green-50"
                                                    >
                                                        <Info className="h-3 w-3 mr-1" />
                                                        Details
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleToggleModule(module)}
                                                        disabled={processing}
                                                        className="border-red-300 text-red-700 hover:bg-red-50"
                                                    >
                                                        Deactivate
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Available Modules */}
                {availableModules.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Available Modules</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {availableModules.map((module) => {
                                const IconComponent = getIcon(module.icon);

                                return (
                                    <Card key={module.id} className="border-green-200 bg-white">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <IconComponent className="h-5 w-5 text-green-600" />
                                                {module.name}
                                                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                                                    Available
                                                </Badge>
                                            </CardTitle>
                                            <CardDescription>{module.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-col  gap-3  justify-between">
                                                <div className="text-sm text-muted-foreground">
                                                    Version {module.version}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleViewDetails(module)}
                                                        className="border-green-300 text-green-700 hover:bg-green-50"
                                                    >
                                                        <Info className="h-3 w-3 mr-1" />
                                                        Details
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleToggleModule(module)}
                                                        disabled={processing}
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        Activate
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Inactive Modules */}
                {inactiveModules.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Inactive Modules</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {inactiveModules.map((module) => {
                                const IconComponent = getIcon(module.icon);

                                return (
                                    <Card key={module.id} className="border-gray-200 bg-gray-50">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <IconComponent className="h-5 w-5 text-gray-500" />
                                                {module.name}
                                                <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
                                                    Inactive
                                                </Badge>
                                            </CardTitle>
                                            <CardDescription>{module.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-col  gap-3 justify-between">
                                                <div className="text-sm text-muted-foreground">
                                                    Version {module.version}
                                                    {module.activated_at && (
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <Calendar className="h-3 w-3" />
                                                            Added {new Date(module.activated_at).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleViewDetails(module)}
                                                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                                    >
                                                        <Info className="h-3 w-3 mr-1" />
                                                        Details
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleToggleModule(module)}
                                                        disabled={processing}
                                                        className="border-green-300 text-green-700 hover:bg-green-50"
                                                    >
                                                        Reactivate
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Module Details Dialog */}
                <Dialog open={!!selectedModule} onOpenChange={(open) => !open && handleCloseDetails()}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        {selectedModule && (
                            <>
                                <DialogHeader>
                                    <div className="flex items-center gap-3">
                                        {(() => {
                                            const IconComponent = getIcon(selectedModule.icon);
                                            return <IconComponent className="h-6 w-6 text-green-600" />;
                                        })()}
                                        <div>
                                            <DialogTitle className="text-2xl font-bold">{selectedModule.name}</DialogTitle>
                                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 mt-2">
                                                {selectedModule.is_enabled ? 'Active' : 'Available'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <DialogDescription>
                                        {selectedModule.description}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-6">
                                    {/* Features */}
                                    {selectedModule.config?.features && selectedModule.config.features.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold mb-3">Key Features</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {selectedModule.config.features.map((feature: string, index: number) => (
                                                    <div key={index} className="flex items-center gap-2 text-sm">
                                                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                        <span>{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Benefits */}
                                    {selectedModule.config?.benefits && selectedModule.config.benefits.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold mb-3">Benefits</h3>
                                            <div className="space-y-2">
                                                {selectedModule.config.benefits.map((benefit: string, index: number) => (
                                                    <div key={index} className="flex items-start gap-2 text-sm">
                                                        <ArrowRight className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                                        <span>{benefit}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Ideal For */}
                                    {selectedModule.config?.ideal_for && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="font-semibold mb-2">Ideal For</h3>
                                            <p className="text-sm text-muted-foreground">{selectedModule.config.ideal_for}</p>
                                        </div>
                                    )}
                                </div>

                                <DialogFooter className="flex gap-3 pt-4 border-t">
                                    {!selectedModule.is_enabled ? (
                                        <Button
                                            onClick={() => {
                                                handleToggleModule(selectedModule);
                                                handleCloseDetails();
                                            }}
                                            disabled={processing}
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                        >
                                            Activate Module
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => {
                                                handleToggleModule(selectedModule);
                                                handleCloseDetails();
                                            }}
                                            disabled={processing}
                                            variant="outline"
                                            className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                                        >
                                            Deactivate Module
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        onClick={handleCloseDetails}
                                        className="flex-1"
                                    >
                                        Close
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
