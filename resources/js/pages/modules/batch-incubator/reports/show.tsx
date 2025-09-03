import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Download,
  Share,
  BarChart3,
  TrendingUp,
  Users,
  Target,
  DollarSign,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Eye,
  RefreshCw
} from 'lucide-react';
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
    {
        title: 'Report Results',
        href: '/batch-incubator/reports/show',
    },
];

interface ReportShowProps {
    report: any;
    type: string;
    parameters: any;
}

export default function ReportShow({ report, type, parameters }: ReportShowProps) {
    const [activeTab, setActiveTab] = useState('summary');

    const getReportTitle = (type: string) => {
        const titles = {
            'production': 'Production Report',
            'efficiency': 'Efficiency Report',
            'financial': 'Financial Report',
            'batch-performance': 'Batch Performance Report',
            'incubator-analysis': 'Incubator Analysis Report',
            'schedule-compliance': 'Schedule Compliance Report',
        };
        return titles[type as keyof typeof titles] || 'Report';
    };

    const getReportIcon = (type: string) => {
        const icons = {
            'production': TrendingUp,
            'efficiency': BarChart3,
            'financial': DollarSign,
            'batch-performance': Target,
            'incubator-analysis': BarChart3,
            'schedule-compliance': Calendar,
        };
        return icons[type as keyof typeof icons] || FileText;
    };

    const ReportIcon = getReportIcon(type);

    const formatNumber = (value: number, decimals = 0) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        }).format(value);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(value);
    };

    const formatPercentage = (value: number) => {
        return `${formatNumber(value, 1)}%`;
    };

    const renderSummaryCards = () => {
        if (!report.summary) return null;

        const cards = [];
        const summary = report.summary;

        // Production Report Cards
        if (type === 'production') {
            cards.push(
                { label: 'Total Batches', value: summary.total_batches, icon: Target },
                { label: 'Eggs Set', value: formatNumber(summary.total_eggs_set), icon: TrendingUp },
                { label: 'Total Hatched', value: formatNumber(summary.total_hatched), icon: Users },
                { label: 'Avg Hatch Rate', value: formatPercentage(summary.average_hatch_rate), icon: BarChart3 },
            );
        }

        // Efficiency Report Cards
        if (type === 'efficiency') {
            cards.push(
                { label: 'Total Incubators', value: summary.total_incubators, icon: Target },
                { label: 'Avg Utilization', value: formatPercentage(summary.average_utilization), icon: BarChart3 },
                { label: 'Total Capacity', value: formatNumber(summary.total_capacity), icon: TrendingUp },
                { label: 'Current Load', value: formatNumber(summary.current_load), icon: Users },
            );
        }

        // Financial Report Cards
        if (type === 'financial') {
            cards.push(
                { label: 'Total Investment', value: formatCurrency(summary.total_investment), icon: DollarSign },
                { label: 'Total Revenue', value: formatCurrency(summary.total_revenue), icon: TrendingUp },
                { label: 'Total Profit', value: formatCurrency(summary.total_profit), icon: Target },
                { label: 'Average ROI', value: formatPercentage(summary.average_roi), icon: BarChart3 },
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {cards.map((card, index) => {
                    const IconComponent = card.icon;
                    return (
                        <Card key={index}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{card.label}</p>
                                        <p className="text-2xl font-bold">{card.value}</p>
                                    </div>
                                    <IconComponent className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        );
    };

    const renderDataTable = () => {
        let data = null;
        let columns: Array<{ key: string; label: string }> = [];

        // Determine data and columns based on report type
        if (type === 'production' && report.batch_details) {
            data = report.batch_details;
            columns = [
                { key: 'name', label: 'Batch Name' },
                { key: 'batch_code', label: 'Code' },
                { key: 'breed', label: 'Breed' },
                { key: 'status', label: 'Status' },
                { key: 'initial_count', label: 'Initial Count' },
                { key: 'current_count', label: 'Current Count' },
                { key: 'hatch_rate', label: 'Hatch Rate (%)' },
                { key: 'mortality_rate', label: 'Mortality (%)' },
            ];
        } else if (type === 'efficiency' && report.incubator_details) {
            data = report.incubator_details;
            columns = [
                { key: 'name', label: 'Incubator Name' },
                { key: 'model', label: 'Model' },
                { key: 'status', label: 'Status' },
                { key: 'capacity', label: 'Capacity' },
                { key: 'current_load', label: 'Current Load' },
                { key: 'utilization_rate', label: 'Utilization (%)' },
                { key: 'energy_efficiency', label: 'Energy Efficiency' },
            ];
        } else if (type === 'financial' && report.batch_financials) {
            data = report.batch_financials;
            columns = [
                { key: 'name', label: 'Batch Name' },
                { key: 'investment', label: 'Investment' },
                { key: 'revenue', label: 'Revenue' },
                { key: 'profit', label: 'Profit' },
                { key: 'roi_percentage', label: 'ROI (%)' },
                { key: 'cost_per_bird', label: 'Cost per Bird' },
            ];
        }

        if (!data || data.length === 0) {
            return (
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">No detailed data available for this report.</p>
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card>
                <CardHeader>
                    <CardTitle>Detailed Data</CardTitle>
                    <CardDescription>
                        Comprehensive breakdown of the report data
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b">
                                    {columns.map((column) => (
                                        <th key={column.key} className="text-left p-2 font-medium text-sm">
                                            {column.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row: any, index: number) => (
                                    <tr key={index} className="border-b hover:bg-gray-50">
                                        {columns.map((column) => (
                                            <td key={column.key} className="p-2 text-sm">
                                                {column.key.includes('rate') || column.key.includes('percentage')
                                                    ? formatPercentage(row[column.key] || 0)
                                                    : column.key.includes('investment') || column.key.includes('revenue') || column.key.includes('profit') || column.key.includes('cost')
                                                    ? formatCurrency(row[column.key] || 0)
                                                    : row[column.key] || '-'
                                                }
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const renderRecommendations = () => {
        if (!report.recommendations || report.recommendations.length === 0) return null;

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Recommendations
                    </CardTitle>
                    <CardDescription>
                        Actionable insights based on the report analysis
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {report.recommendations.map((recommendation: any, index: number) => (
                            <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                                <h4 className="font-medium">{recommendation.title}</h4>
                                <p className="text-sm text-muted-foreground">{recommendation.description}</p>
                                {recommendation.priority && (
                                    <Badge variant={recommendation.priority === 'high' ? 'destructive' : 'secondary'} className="mt-1">
                                        {recommendation.priority} priority
                                    </Badge>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${getReportTitle(type)} - Batch Incubator`} />
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <ReportIcon className="h-8 w-8" />
                            {report.title}
                        </h1>
                        <p className="text-muted-foreground">
                            Generated for period: {report.period}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild size="sm" variant="outline">
                            <Link href="/batch-incubator/reports">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Reports
                            </Link>
                        </Button>
                        <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export PDF
                        </Button>
                        <Button size="sm" variant="outline">
                            <Share className="h-4 w-4 mr-2" />
                            Share
                        </Button>
                        <Button asChild size="sm">
                            <Link href="/batch-incubator/reports/generate">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                New Report
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Report Parameters */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex flex-wrap gap-4 text-sm">
                            <div>
                                <span className="font-medium text-blue-800">Type:</span>
                                <span className="ml-1 text-blue-700">{getReportTitle(type)}</span>
                            </div>
                            <div>
                                <span className="font-medium text-blue-800">Period:</span>
                                <span className="ml-1 text-blue-700">{report.period}</span>
                            </div>
                            {parameters.batch_ids && parameters.batch_ids.length > 0 && (
                                <div>
                                    <span className="font-medium text-blue-800">Batches:</span>
                                    <span className="ml-1 text-blue-700">{parameters.batch_ids.length} selected</span>
                                </div>
                            )}
                            {parameters.incubator_ids && parameters.incubator_ids.length > 0 && (
                                <div>
                                    <span className="font-medium text-blue-800">Incubators:</span>
                                    <span className="ml-1 text-blue-700">{parameters.incubator_ids.length} selected</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                {renderSummaryCards()}

                {/* Report Content Tabs */}
                <div className="space-y-6">
                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('summary')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'summary'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Summary
                            </button>
                            <button
                                onClick={() => setActiveTab('details')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'details'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Detailed Data
                            </button>
                            {report.recommendations && (
                                <button
                                    onClick={() => setActiveTab('recommendations')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === 'recommendations'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Recommendations
                                </button>
                            )}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div>
                        {activeTab === 'summary' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Report Summary</CardTitle>
                                    <CardDescription>
                                        Key insights and overview of the report data
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="prose max-w-none">
                                        <p>
                                            This {getReportTitle(type).toLowerCase()} covers the period from{' '}
                                            <strong>{report.period}</strong> and provides comprehensive analysis
                                            of your poultry operation's performance.
                                        </p>

                                        {type === 'production' && (
                                            <div className="mt-4">
                                                <h4 className="font-medium">Production Highlights:</h4>
                                                <ul className="list-disc list-inside mt-2 space-y-1">
                                                    <li>Total of {report.summary?.total_batches || 0} batches analyzed</li>
                                                    <li>Average hatch rate of {formatPercentage(report.summary?.average_hatch_rate || 0)}</li>
                                                    <li>Total production: {formatNumber(report.summary?.total_production || 0)} eggs/day</li>
                                                    <li>Overall mortality rate: {formatPercentage(report.summary?.average_mortality || 0)}</li>
                                                </ul>
                                            </div>
                                        )}

                                        {type === 'efficiency' && (
                                            <div className="mt-4">
                                                <h4 className="font-medium">Efficiency Highlights:</h4>
                                                <ul className="list-disc list-inside mt-2 space-y-1">
                                                    <li>{report.summary?.total_incubators || 0} incubators monitored</li>
                                                    <li>Average utilization: {formatPercentage(report.summary?.average_utilization || 0)}</li>
                                                    <li>Total capacity: {formatNumber(report.summary?.total_capacity || 0)} units</li>
                                                    <li>Operational efficiency: {formatPercentage(report.summary?.operational_efficiency || 0)}</li>
                                                </ul>
                                            </div>
                                        )}

                                        {type === 'financial' && (
                                            <div className="mt-4">
                                                <h4 className="font-medium">Financial Highlights:</h4>
                                                <ul className="list-disc list-inside mt-2 space-y-1">
                                                    <li>Total investment: {formatCurrency(report.summary?.total_investment || 0)}</li>
                                                    <li>Total revenue: {formatCurrency(report.summary?.total_revenue || 0)}</li>
                                                    <li>Net profit: {formatCurrency(report.summary?.total_profit || 0)}</li>
                                                    <li>Average ROI: {formatPercentage(report.summary?.average_roi || 0)}</li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {activeTab === 'details' && renderDataTable()}

                        {activeTab === 'recommendations' && renderRecommendations()}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between items-center pt-6 border-t">
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href="/batch-incubator/reports/generate">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Generate New Report
                            </Link>
                        </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Report generated on {new Date().toLocaleDateString()}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
