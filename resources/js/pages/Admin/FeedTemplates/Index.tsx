import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, FileSpreadsheet, Users, Utensils, Building, BarChart3, Database } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '@/layouts/AdminLayout';
import FileUploadCard from './FileUploadCard';
import DataTable from './DataTable';
import EnhancedStatistics from './EnhancedStatistics';

interface FeedType {
    id: number;
    name: string;
    code: string;
    category: string;
    protein_content: number;
    energy_content: number;
    cost_per_kg: number;
    description: string;
    target_age_start: number;
    target_age_end: number;
    usage_instructions: string;
    created_at: string;
    creator?: { name: string };
}

interface FeedProgram {
    id: number;
    name: string;
    code: string;
    breed_type: string;
    total_duration_days: number;
    estimated_cost_per_bird: number;
    description: string;
    created_at: string;
    creator?: { name: string };
}

interface Supplier {
    id: number;
    name: string;
    code: string;
    contact_person: string;
    email: string;
    phone: string;
    address: string;
    supplier_type: string;
    quality_rating: number;
    certifications: string;
    created_at: string;
    creator?: { name: string };
}

interface Statistics {
    feedTypes: {
        total: number;
        byCategory: Record<string, number>;
        recentlyAdded: number;
        averageCost: number;
    };
    feedPrograms: {
        total: number;
        byDuration: Record<string, number>;
        recentlyAdded: number;
    };
    suppliers: {
        total: number;
        averageRating: number;
        withCertifications: number;
        recentlyAdded: number;
    };
}

interface PageProps {
    feedTypesCount: number;
    feedProgramsCount: number;
    suppliersCount: number;
    feedTypes: FeedType[];
    feedPrograms: FeedProgram[];
    suppliers: Supplier[];
    lastUpload: {
        type: string;
        date: string;
    } | null;
    statistics: Statistics;
}

export default function Index({
    feedTypesCount,
    feedProgramsCount,
    suppliersCount,
    feedTypes,
    feedPrograms,
    suppliers,
    lastUpload,
    statistics
}: PageProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [activeView, setActiveView] = useState<'upload' | 'data' | 'statistics'>('upload');

    const handleUpload = async (type: string, file: File, replaceExisting: boolean = false) => {
        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('replace_existing', replaceExisting.toString() ?? false);

        try {
            router.post(`/admin/feed-templates/upload-${type}`, formData, {
                onSuccess: () => {
                    toast.success('Upload successful');
                    router.reload();
                },
                onError: (errors) => {
                    toast.error('Upload failed');
                },
                onFinish: () => setIsUploading(false)
            });
        } catch (error) {
            toast.error('Upload failed. Please try again.');
            setIsUploading(false);
        }
    };

    const downloadTemplate = (type: string) => {
        window.location.href = `/admin/feed-templates/download-${type}`;
    };

    const feedTypeColumns = [
        { key: 'name', label: 'Name' },
        { key: 'code', label: 'Code' },
        { key: 'category', label: 'Category' },
        { key: 'protein_content', label: 'Protein %', type: 'percentage' },
        { key: 'energy_content', label: 'Energy (kcal/kg)' },
        { key: 'cost_per_kg', label: 'Cost/kg', type: 'currency' },
        { key: 'created_at', label: 'Created', type: 'date' }
    ];

    const feedProgramColumns = [
        { key: 'name', label: 'Name' },
        { key: 'code', label: 'Code' },
        { key: 'breed_type', label: 'Breed Type' },
        { key: 'total_duration_days', label: 'Duration (days)' },
        { key: 'estimated_cost_per_bird', label: 'Est. Cost/Bird', type: 'currency' },
        { key: 'created_at', label: 'Created', type: 'date' }
    ];

    const supplierColumns = [
        { key: 'name', label: 'Name' },
        { key: 'code', label: 'Code' },
        { key: 'contact_person', label: 'Contact' },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'phone', label: 'Phone' },
        { key: 'supplier_type', label: 'Type' },
        { key: 'quality_rating', label: 'Rating', type: 'rating' },
        { key: 'created_at', label: 'Created', type: 'date' }
    ];

    const stats = [
        {
            title: 'Feed Types',
            count: feedTypesCount,
            icon: Utensils,
            color: 'bg-emerald-500'
        },
        {
            title: 'Feed Programs',
            count: feedProgramsCount,
            icon: FileSpreadsheet,
            color: 'bg-emerald-500'
        },
        {
            title: 'Suppliers',
            count: suppliersCount,
            icon: Building,
            color: 'bg-purple-500'
        }
    ];

    return (
        <AdminLayout>
            <Head title="Feed Templates Management" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Feed Templates Management</h1>
                    <p className="text-muted-foreground mt-2">
                        Upload starter feed data templates for marketplace integration. These templates help users get suggestions for feeds to give to their chicks.
                    </p>
                </div>

                {/* Quick Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={stat.title}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {stat.title}
                                    </CardTitle>
                                    <div className={`p-2 rounded-md ${stat.color}`}>
                                        <Icon className="h-4 w-4 text-white" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.count}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Template records available
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Last Upload Info */}
                {lastUpload && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Last Upload</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">{lastUpload.type}</Badge>
                                <span className="text-sm text-muted-foreground">
                                    uploaded on {lastUpload.date}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* View Toggle */}
                <div className="flex gap-2">
                    <Button
                        variant={activeView === 'upload' ? 'default' : 'outline'}
                        onClick={() => setActiveView('upload')}
                        className="flex items-center gap-2"
                    >
                        <Upload className="h-4 w-4" />
                        Upload Templates
                    </Button>
                    <Button
                        variant={activeView === 'data' ? 'default' : 'outline'}
                        onClick={() => setActiveView('data')}
                        className="flex items-center gap-2"
                    >
                        <Database className="h-4 w-4" />
                        Manage Data
                    </Button>
                    <Button
                        variant={activeView === 'statistics' ? 'default' : 'outline'}
                        onClick={() => setActiveView('statistics')}
                        className="flex items-center gap-2"
                    >
                        <BarChart3 className="h-4 w-4" />
                        Statistics
                    </Button>
                </div>

                {/* Content based on active view */}
                {activeView === 'upload' && (
                    <Tabs defaultValue="feed-types" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="feed-types">Feed Types</TabsTrigger>
                            <TabsTrigger value="feed-programs">Feed Programs</TabsTrigger>
                            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
                        </TabsList>

                                                <TabsContent value="feed-types">
                            <FileUploadCard
                                title="Feed Types Templates"
                                description="Upload CSV files containing feed type data for marketplace suggestions"
                                templateType="feed-types"
                                onUpload={(file, replace) => handleUpload('feed-types', file, replace)}
                                onDownloadTemplate={() => downloadTemplate('feed-types')}
                                isUploading={isUploading}
                                sampleColumns={['Name', 'Code', 'Category', 'Protein Content %', 'Energy (ME) kcal/kg', 'Cost per kg', 'Target Age Start (days)', 'Target Age End (days)', 'Description', 'Usage Instructions']}
                            />
                        </TabsContent>

                     

                        <TabsContent value="feed-programs">
                            <FileUploadCard
                                title="Feed Programs Templates"
                                description="Upload CSV files containing feeding program schedules and guidelines"
                                templateType="feed-programs"
                                onUpload={(file, replace) => handleUpload('feed-programs', file, replace)}
                                onDownloadTemplate={() => downloadTemplate('feed-programs')}
                                isUploading={isUploading}
                                sampleColumns={['Name', 'Code', 'Description', 'Breed Type', 'Duration (days)', 'Estimated Cost per Bird', 'Feeding Times']}
                            />
                        </TabsContent>

                        <TabsContent value="suppliers">
                            <FileUploadCard
                                title="Suppliers Templates"
                                description="Upload CSV files containing verified feed supplier information for marketplace"
                                templateType="suppliers"
                                onUpload={(file, replace) => handleUpload('suppliers', file, replace)}
                                onDownloadTemplate={() => downloadTemplate('suppliers')}
                                isUploading={isUploading}
                                sampleColumns={['Name', 'Code', 'Contact Person', 'Email', 'Phone', 'Address', 'Type', 'Rating', 'Certifications']}
                            />
                        </TabsContent>
                    </Tabs>
                )}

                {activeView === 'data' && (
                    <Tabs defaultValue="feed-types" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="feed-types">Feed Types ({feedTypes.length})</TabsTrigger>
                            <TabsTrigger value="feed-programs">Feed Programs ({feedPrograms.length})</TabsTrigger>
                            <TabsTrigger value="suppliers">Suppliers ({suppliers.length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="feed-types">
                            <DataTable
                                title="Feed Types"
                                data={feedTypes}
                                columns={feedTypeColumns}
                                type="feed_types"
                            />
                        </TabsContent>

                        <TabsContent value="feed-programs">
                            <DataTable
                                title="Feed Programs"
                                data={feedPrograms}
                                columns={feedProgramColumns}
                                type="feed_programs"
                            />
                        </TabsContent>

                        <TabsContent value="suppliers">
                            <DataTable
                                title="Suppliers"
                                data={suppliers}
                                columns={supplierColumns}
                                type="suppliers"
                            />
                        </TabsContent>
                    </Tabs>
                )}

                {activeView === 'statistics' && (
                    <EnhancedStatistics statistics={statistics} />
                )}
            </div>
        </AdminLayout>
    );
}
