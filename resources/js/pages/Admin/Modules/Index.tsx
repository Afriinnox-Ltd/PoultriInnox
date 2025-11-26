import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    Package,
    Users,
    Info,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Settings
} from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '@/layouts/AdminLayout';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert';

interface Module {
    id: number;
    name: string;
    slug: string;
    code: string;
    description: string;
    icon: string;
    version: string;
    is_active: boolean;
    is_core: boolean;
    dependencies: string[];
    config: {
        features?: string[];
        benefits?: string[];
        ideal_for?: string;
    };
    sort_order: number;
    users_count: number;
}

interface PageProps {
    modules: Module[];
}

export default function Index({ modules }: PageProps) {
    const [togglingModule, setTogglingModule] = useState<number | null>(null);

    const handleToggleStatus = async (module: Module) => {
        if (module.is_core && module.is_active) {
            toast.error('Core modules cannot be disabled');
            return;
        }

        setTogglingModule(module.id);

        router.patch(
            `/admin/modules/${module.id}/toggle-status`,
            {},
            {
                preserveScroll: true,
                onSuccess: (page: any) => {
                    const response = page.props.flash;
                    toast.success(
                        module.is_active
                            ? `Module "${module.name}" has been disabled`
                            : `Module "${module.name}" has been enabled`
                    );
                },
                onError: (errors: any) => {
                    const errorMessage = errors.message || 'Failed to toggle module status';
                    toast.error(errorMessage);
                },
                onFinish: () => {
                    setTogglingModule(null);
                }
            }
        );
    };

    const activeModules = modules.filter(m => m.is_active);
    const inactiveModules = modules.filter(m => !m.is_active);
    const totalUsers = modules.reduce((sum, m) => sum + m.users_count, 0);

    return (
        <AdminLayout>
            <Head title="Module Management" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Module Management</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage system modules and their availability across the platform.
                    </p>
                </div>

                {/* Quick Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Modules
                            </CardTitle>
                            <div className="p-2 rounded-md bg-blue-500">
                                <Package className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{modules.length}</div>
                            <p className="text-xs text-muted-foreground">
                                System modules available
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Modules
                            </CardTitle>
                            <div className="p-2 rounded-md bg-emerald-500">
                                <CheckCircle2 className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activeModules.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Currently enabled
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Inactive Modules
                            </CardTitle>
                            <div className="p-2 rounded-md bg-gray-500">
                                <XCircle className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{inactiveModules.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Currently disabled
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Activations
                            </CardTitle>
                            <div className="p-2 rounded-md bg-purple-500">
                                <Users className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalUsers}</div>
                            <p className="text-xs text-muted-foreground">
                                User module activations
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Info Alert */}
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Module Management</AlertTitle>
                    <AlertDescription>
                        Enabling or disabling modules affects their availability system-wide.
                        Users will only be able to activate modules that are enabled here.
                        Core modules cannot be disabled.
                    </AlertDescription>
                </Alert>

                {/* Modules Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>System Modules</CardTitle>
                        <CardDescription>
                            Manage the availability and status of all system modules
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Module</TableHead>
                                    <TableHead>Version</TableHead>
                                    <TableHead>Dependencies</TableHead>
                                    <TableHead>Users</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {modules.map((module) => (
                                    <TableRow key={module.id}>
                                        <TableCell>
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-md bg-primary/10 mt-1">
                                                    <Package className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <div className="font-medium flex items-center gap-2">
                                                        {module.name}
                                                        {module.is_core && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                Core
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {module.description}
                                                    </div>
                                                    {module.config?.features && module.config.features.length > 0 && (
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            <strong>Features:</strong> {module.config.features.slice(0, 2).join(', ')}
                                                            {module.config.features.length > 2 && ` +${module.config.features.length - 2} more`}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{module.version}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {module.dependencies && module.dependencies.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {module.dependencies.map((dep, idx) => (
                                                        <Badge key={idx} variant="secondary" className="text-xs">
                                                            {dep}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">None</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">{module.users_count}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {module.is_active ? (
                                                <Badge className="bg-emerald-500">
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    <XCircle className="h-3 w-3 mr-1" />
                                                    Inactive
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Switch
                                                    checked={module.is_active}
                                                    onCheckedChange={() => handleToggleStatus(module)}
                                                    disabled={togglingModule === module.id || (module.is_core && module.is_active)}
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Warning when no modules are enabled */}
                {activeModules.length === 0 && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>No Modules Enabled</AlertTitle>
                        <AlertDescription>
                            Currently, no modules are enabled in the system. Enable at least one module from the table above to make features available to users.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Module Details Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {modules.map((module) => (
                        <Card key={module.id} className={!module.is_active ? 'opacity-60' : ''}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <Package className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-lg">{module.name}</CardTitle>
                                    </div>
                                    {module.is_active ? (
                                        <Badge className="bg-emerald-500">Active</Badge>
                                    ) : (
                                        <Badge variant="secondary">Inactive</Badge>
                                    )}
                                </div>
                                <CardDescription>{module.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {module.config?.ideal_for && (
                                    <div className="text-sm">
                                        <strong className="text-muted-foreground">Ideal for:</strong>
                                        <p className="mt-1">{module.config.ideal_for}</p>
                                    </div>
                                )}

                                {module.config?.benefits && module.config.benefits.length > 0 && (
                                    <div className="text-sm">
                                        <strong className="text-muted-foreground">Benefits:</strong>
                                        <ul className="mt-1 space-y-1 list-disc list-inside">
                                            {module.config.benefits.slice(0, 3).map((benefit, idx) => (
                                                <li key={idx} className="text-xs">{benefit}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-2 border-t">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Users className="h-4 w-4" />
                                        <span>{module.users_count} users</span>
                                    </div>
                                    <Badge variant="outline">{module.version}</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
