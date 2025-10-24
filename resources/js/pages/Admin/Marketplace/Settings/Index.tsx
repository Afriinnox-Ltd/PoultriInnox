import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Download, RotateCcw, Save, Settings, DollarSign, Receipt, Truck, Package, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface Setting {
    id: number;
    key: string;
    value: any;
    type: string;
    group: string;
    label: string;
    description?: string;
    is_public: boolean;
    is_encrypted: boolean;
    validation_rules?: any[];
    options?: Record<string, string>;
    sort_order: number;
}

interface SettingsGroup {
    [key: string]: Setting[];
}

interface SettingsIndexProps {
    settings: SettingsGroup;
}

const groupIcons = {
    general: Package,
    tax: Receipt,
    commission: DollarSign,
    platform: Settings,
    payment: CreditCard,
    shipping: Truck,
    orders: Package,
};

const groupLabels = {
    general: 'General Settings',
    tax: 'Tax Settings',
    commission: 'Commission Settings',
    platform: 'Platform Fees',
    payment: 'Payment Settings',
    // shipping: 'Shipping Settings',
    orders: 'Order Settings',
};

export default function SettingsIndex({ settings }: SettingsIndexProps) {
    const [isImporting, setIsImporting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    
    const { data, setData, put, processing, errors } = useForm({
        settings: Object.entries(settings).reduce((acc, [group, groupSettings]) => {
            groupSettings.forEach(setting => {
                acc[setting.key] = setting.value;
            });
            return acc;
        }, {} as Record<string, any>)
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/admin/marketplace/settings', {
            onSuccess: () => {
                toast.success('Settings updated successfully');
            },
            onError: () => {
                toast.error('Failed to update settings');
            }
        });
    };

    const handleReset = (group?: string) => {
        if (confirm(`Are you sure you want to reset ${group ? `${group} settings` : 'all settings'} to defaults?`)) {
            const data: { group?: string } = {};
            if (group) data.group = group;
            
            router.post('/admin/marketplace/settings/reset', data, {
                onSuccess: () => {
                    toast.success('Settings reset successfully');
                    window.location.reload();
                },
                onError: () => {
                    toast.error('Failed to reset settings');
                }
            });
        }
    };

    const handleExport = () => {
        window.open('/admin/marketplace/settings/export', '_blank');
    };

    const handleImport = () => {
        if (!selectedFile) {
            toast.error('Please select a file to import');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        setIsImporting(true);
        router.post('/admin/marketplace/settings/import', formData, {
            onSuccess: () => {
                toast.success('Settings imported successfully');
                setSelectedFile(null);
                window.location.reload();
            },
            onError: () => {
                toast.error('Failed to import settings');
            },
            onFinish: () => {
                setIsImporting(false);
            }
        });
    };

    const renderSettingField = (setting: Setting) => {
        const value = data.settings[setting.key];

        switch (setting.type) {
            case 'boolean':
                return (
                    <div className="flex items-center space-x-2">
                        <Switch
                            id={setting.key}
                            checked={value === true || value === 'true'}
                            onCheckedChange={(checked) => 
                                setData('settings', { 
                                    ...data.settings, 
                                    [setting.key]: checked 
                                })
                            }
                        />
                        <Label htmlFor={setting.key}>{setting.label}</Label>
                    </div>
                );

            case 'select':
                return (
                    <div className="space-y-2">
                        <Label htmlFor={setting.key}>{setting.label}</Label>
                        <select
                            id={setting.key}
                            value={value || ''}
                            onChange={(e) => 
                                setData('settings', { 
                                    ...data.settings, 
                                    [setting.key]: e.target.value 
                                })
                            }
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {setting.options && Object.entries(setting.options).map(([optValue, optLabel]) => (
                                <option key={optValue} value={optValue}>
                                    {optLabel}
                                </option>
                            ))}
                        </select>
                    </div>
                );

            case 'textarea':
                return (
                    <div className="space-y-2">
                        <Label htmlFor={setting.key}>{setting.label}</Label>
                        <Textarea
                            id={setting.key}
                            value={value || ''}
                            onChange={(e) => 
                                setData('settings', { 
                                    ...data.settings, 
                                    [setting.key]: e.target.value 
                                })
                            }
                            placeholder={setting.description}
                        />
                    </div>
                );

            default:
                return (
                    <div className="space-y-2">
                        <Label htmlFor={setting.key}>{setting.label}</Label>
                        <Input
                            id={setting.key}
                            type={setting.type === 'number' ? 'number' : 'text'}
                            value={value || ''}
                            onChange={(e) => 
                                setData('settings', { 
                                    ...data.settings, 
                                    [setting.key]: e.target.value 
                                })
                            }
                            placeholder={setting.description}
                            step={setting.type === 'number' ? '0.01' : undefined}
                        />
                    </div>
                );
        }
    };

    return (
        <AdminLayout>
            <Head title="Marketplace Settings" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Marketplace Settings</h2>
                        <p className="text-muted-foreground">
                            Configure taxes, commissions, platform fees, and other marketplace settings
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleExport}>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Tabs defaultValue={Object.keys(settings)[0]} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-7">
                            {Object.keys(settings).map((group) => {
                                const Icon = groupIcons[group as keyof typeof groupIcons] || Settings;
                                return (
                                    <TabsTrigger key={group} value={group} className="flex items-center space-x-2">
                                        <Icon className="h-4 w-4" />
                                        <span className="hidden md:inline">{groupLabels[group as keyof typeof groupLabels] || group}</span>
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>

                        {Object.entries(settings).map(([group, groupSettings]) => (
                            <TabsContent key={group} value={group} className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <CardTitle className="flex items-center space-x-2">
                                                    {React.createElement(groupIcons[group as keyof typeof groupIcons] || Settings, { className: "h-5 w-5" })}
                                                    <span>{groupLabels[group as keyof typeof groupLabels] || group}</span>
                                                </CardTitle>
                                                <CardDescription>
                                                    Configure {group} related settings for your marketplace
                                                </CardDescription>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleReset(group)}
                                            >
                                                <RotateCcw className="h-4 w-4 mr-2" />
                                                Reset Group
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {groupSettings.map((setting) => (
                                                <div key={setting.key} className="space-y-2">
                                                    {renderSettingField(setting)}
                                                    {setting.description && setting.type !== 'boolean' && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {setting.description}
                                                        </p>
                                                    )}
                                                    <div className="flex gap-2">
                                                        {setting.is_public && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                Public
                                                            </Badge>
                                                        )}
                                                        {setting.is_encrypted && (
                                                            <Badge variant="destructive" className="text-xs">
                                                                Encrypted
                                                            </Badge>
                                                        )}
                                                        <Badge variant="outline" className="text-xs">
                                                            {setting.type}
                                                        </Badge>
                                                    </div>
                                                    {errors[`settings.${setting.key}`] && (
                                                        <div className="flex items-center space-x-2 text-destructive text-sm">
                                                            <AlertTriangle className="h-4 w-4" />
                                                            <span>{errors[`settings.${setting.key}`]}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        ))}
                    </Tabs>

                    {/* Save Button */}
                    <div className="flex justify-between items-center pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleReset()}
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset All Settings
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}