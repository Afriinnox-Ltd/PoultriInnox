import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  Settings,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { Link, Head, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import QuickNav from '@/components/batch-incubator/quick-nav';
import { toast } from 'sonner';

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
    {
        title: 'Generate Report',
        href: '/batch-incubator/reports/generate',
    },
];

interface ReportType {
    key: string;
    name: string;
    description: string;
    icon: string;
    category: string;
}

interface Batch {
    id: number;
    name: string;
    batch_code: string;
    status: string;
}

interface Incubator {
    id: number;
    name: string;
    model: string;
    status: string;
}

interface ReportGenerateProps {
    reportTypes: ReportType[];
    batches: Batch[];
    incubators: Incubator[];
}

export default function ReportGenerate({ reportTypes, batches, incubators }: ReportGenerateProps) {
    const [selectedType, setSelectedType] = useState<string>('');
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');
    const [selectedBatches, setSelectedBatches] = useState<number[]>([]);
    const [selectedIncubators, setSelectedIncubators] = useState<number[]>([]);
    const [format, setFormat] = useState<string>('json');
    const [isGenerating, setIsGenerating] = useState(false);

    const getIcon = (iconName: string) => {
        const icons = {
            TrendingUp,
            BarChart3,
            DollarSign,
            Package,
            Settings,
            CheckCircle,
        };
        return icons[iconName as keyof typeof icons] || FileText;
    };

    const getCategoryColor = (category: string) => {
        const colors = {
            production: 'bg-blue-100 text-blue-800 border-blue-200',
            efficiency: 'bg-green-100 text-green-800 border-green-200',
            financial: 'bg-purple-100 text-purple-800 border-purple-200',
            compliance: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        };
        return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const handleBatchToggle = (batchId: number) => {
        setSelectedBatches(prev =>
            prev.includes(batchId)
                ? prev.filter(id => id !== batchId)
                : [...prev, batchId]
        );
    };

    const handleIncubatorToggle = (incubatorId: number) => {
        setSelectedIncubators(prev =>
            prev.includes(incubatorId)
                ? prev.filter(id => id !== incubatorId)
                : [...prev, incubatorId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsGenerating(true);

        try {
            router.post('/batch-incubator/reports/generate', {
                type: selectedType,
                date_from: dateFrom,
                date_to: dateTo,
                batch_ids: selectedBatches,
                incubator_ids: selectedIncubators,
                format: format,
            },{
                onSuccess:()=>{
                    toast.success('Report generation initiated successfully! You will be notified once it is ready.');
                }
                ,
                onError: (errors) => {
                    console.log(errors);
                    toast.error('Failed to initiate report generation. Please check the form for errors.');
                }
            });
        } catch (error) {
            console.error('Error generating report:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const isFormValid = selectedType && dateFrom && dateTo;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Generate Report - Batch Incubator" />
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Generate Report</h1>
                        <p className="text-muted-foreground">
                            Create comprehensive reports for analysis and decision-making
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild size="sm" variant="outline">
                            <Link href="/batch-incubator/reports">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Reports
                            </Link>
                        </Button>
                        <QuickNav currentPage="reports" showCreateAction={false} />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Report Configuration */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Report Type Selection */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Report Type
                                    </CardTitle>
                                    <CardDescription>
                                        Choose the type of report you want to generate
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {reportTypes.map((reportType) => {
                                            const Icon = getIcon(reportType.icon);
                                            return (
                                                <div
                                                    key={reportType.key}
                                                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                                        selectedType === reportType.key
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                    onClick={() => setSelectedType(reportType.key)}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <Icon className="h-5 w-5 text-blue-600 mt-0.5" />
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="font-medium">{reportType.name}</h3>
                                                                <span className={`px-2 py-1 text-xs rounded-full border ${getCategoryColor(reportType.category)}`}>
                                                                    {reportType.category}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">
                                                                {reportType.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Date Range */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Date Range
                                    </CardTitle>
                                    <CardDescription>
                                        Select the time period for your report
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="date_from">From Date</Label>
                                            <Input
                                                id="date_from"
                                                type="date"
                                                value={dateFrom}
                                                onChange={(e) => setDateFrom(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="date_to">To Date</Label>
                                            <Input
                                                id="date_to"
                                                type="date"
                                                value={dateTo}
                                                onChange={(e) => setDateTo(e.target.value)}
                                                min={dateFrom}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Quick Date Presets */}
                                    <div className="mt-4">
                                        <Label className="text-sm text-muted-foreground">Quick Presets:</Label>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {[
                                                { label: 'Last 7 Days', days: 7 },
                                                { label: 'Last 30 Days', days: 30 },
                                                { label: 'Last 90 Days', days: 90 },
                                                { label: 'This Year', days: 365 },
                                            ].map((preset) => (
                                                <Button
                                                    key={preset.label}
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const endDate = new Date();
                                                        const startDate = new Date(endDate);
                                                        startDate.setDate(endDate.getDate() - preset.days);

                                                        setDateFrom(startDate.toISOString().split('T')[0]);
                                                        setDateTo(endDate.toISOString().split('T')[0]);
                                                    }}
                                                >
                                                    {preset.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Filter Options */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Filter className="h-5 w-5" />
                                        Filter Options
                                    </CardTitle>
                                    <CardDescription>
                                        Optional: Filter by specific batches or incubators
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {/* Batch Selection */}
                                        <div>
                                            <Label className="text-sm font-medium">Select Batches (Optional)</Label>
                                            <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                                                <div className="space-y-2">
                                                    {batches.map((batch) => (
                                                        <div key={batch.id} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`batch-${batch.id}`}
                                                                checked={selectedBatches.includes(batch.id)}
                                                                onCheckedChange={() => handleBatchToggle(batch.id)}
                                                            />
                                                            <Label
                                                                htmlFor={`batch-${batch.id}`}
                                                                className="text-sm font-normal cursor-pointer"
                                                            >
                                                                {batch.name} ({batch.batch_code})
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Leave empty to include all batches
                                            </p>
                                        </div>

                                        {/* Incubator Selection */}
                                        <div>
                                            <Label className="text-sm font-medium">Select Incubators (Optional)</Label>
                                            <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                                                <div className="space-y-2">
                                                    {incubators.map((incubator) => (
                                                        <div key={incubator.id} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`incubator-${incubator.id}`}
                                                                checked={selectedIncubators.includes(incubator.id)}
                                                                onCheckedChange={() => handleIncubatorToggle(incubator.id)}
                                                            />
                                                            <Label
                                                                htmlFor={`incubator-${incubator.id}`}
                                                                className="text-sm font-normal cursor-pointer"
                                                            >
                                                                {incubator.name} ({incubator.model})
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Leave empty to include all incubators
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Report Preview & Actions */}
                        <div className="space-y-6">
                            {/* Report Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Report Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div>
                                            <Label className="text-sm text-muted-foreground">Type:</Label>
                                            <p className="text-sm font-medium">
                                                {selectedType ? reportTypes.find(t => t.key === selectedType)?.name : 'Not selected'}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-sm text-muted-foreground">Period:</Label>
                                            <p className="text-sm font-medium">
                                                {dateFrom && dateTo
                                                    ? `${new Date(dateFrom).toLocaleDateString()} - ${new Date(dateTo).toLocaleDateString()}`
                                                    : 'Not selected'
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-sm text-muted-foreground">Batches:</Label>
                                            <p className="text-sm font-medium">
                                                {selectedBatches.length > 0 ? `${selectedBatches.length} selected` : 'All batches'}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-sm text-muted-foreground">Incubators:</Label>
                                            <p className="text-sm font-medium">
                                                {selectedIncubators.length > 0 ? `${selectedIncubators.length} selected` : 'All incubators'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Output Format */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Output Format</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Select value={format} onValueChange={setFormat}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select format" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="json">Web Report (Interactive)</SelectItem>
                                            <SelectItem value="pdf">PDF Document</SelectItem>
                                            <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </CardContent>
                            </Card>

                            {/* Generate Button */}
                            <Card>
                                <CardContent className="pt-6">
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={!isFormValid || isGenerating}
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Download className="h-4 w-4 mr-2 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <FileText className="h-4 w-4 mr-2" />
                                                Generate Report
                                            </>
                                        )}
                                    </Button>

                                    {!isFormValid && (
                                        <p className="text-xs text-muted-foreground text-center mt-2">
                                            Please select report type and date range
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
