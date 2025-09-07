import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Calendar, Star, Award, Clock } from 'lucide-react';

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

interface EnhancedStatisticsProps {
    statistics: Statistics;
}

export default function EnhancedStatistics({ statistics }: EnhancedStatisticsProps) {
    const categoryColors = {
        'Starter': 'bg-emerald-500',
        'Grower': 'bg-emerald-500',
        'Finisher': 'bg-orange-500',
        'Layer': 'bg-purple-500'
    };

    const durationColors = {
        'Short (≤42 days)': 'bg-red-500',
        'Medium (43-84 days)': 'bg-yellow-500',
        'Long (>84 days)': 'bg-emerald-500'
    };

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Feed Types Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <div className="p-2 rounded-md bg-emerald-500">
                            <TrendingUp className="h-4 w-4 text-white" />
                        </div>
                        Feed Types Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total Types</span>
                        <span className="text-2xl font-bold">{statistics.feedTypes.total}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Avg. Cost/kg</span>
                        <span className="text-lg font-semibold text-emerald-600">
                            ${statistics.feedTypes.averageCost?.toFixed(2) || '0.00'}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <span className="text-sm font-medium">By Category</span>
                        {Object.entries(statistics.feedTypes.byCategory || {}).map(([category, count]) => (
                            <div key={category} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${categoryColors[category as keyof typeof categoryColors] || 'bg-gray-500'}`} />
                                    <span className="text-sm">{category}</span>
                                </div>
                                <Badge variant="secondary">{count}</Badge>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                            {statistics.feedTypes.recentlyAdded} added this week
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Feed Programs Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <div className="p-2 rounded-md bg-emerald-500">
                            <Clock className="h-4 w-4 text-white" />
                        </div>
                        Feed Programs Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total Programs</span>
                        <span className="text-2xl font-bold">{statistics.feedPrograms.total}</span>
                    </div>

                    <div className="space-y-2">
                        <span className="text-sm font-medium">By Duration</span>
                        {Object.entries(statistics.feedPrograms.byDuration || {}).map(([duration, count]) => {
                            const percentage = statistics.feedPrograms.total > 0
                                ? Math.round((count / statistics.feedPrograms.total) * 100)
                                : 0;

                            return (
                                <div key={duration} className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">{duration}</span>
                                        <Badge variant="secondary">{count} ({percentage}%)</Badge>
                                    </div>
                                    <Progress
                                        value={percentage}
                                        className="h-2"
                                    />
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                            {statistics.feedPrograms.recentlyAdded} added this week
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Suppliers Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <div className="p-2 rounded-md bg-purple-500">
                            <Star className="h-4 w-4 text-white" />
                        </div>
                        Suppliers Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total Suppliers</span>
                        <span className="text-2xl font-bold">{statistics.suppliers.total}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Average Rating</span>
                        <div className="flex items-center gap-1"> 
                            <span className="text-lg font-semibold">
                                {statistics.suppliers.averageRating?.toFixed(1) || '0.0'}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Certified Suppliers</span>
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                                {statistics.suppliers.withCertifications}
                            </Badge>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <span>Certification Rate</span>
                                <span>{statistics.suppliers.total > 0
                                    ? Math.round((statistics.suppliers.withCertifications / statistics.suppliers.total) * 100)
                                    : 0}%</span>
                            </div>
                            <Progress
                                value={statistics.suppliers.total > 0
                                    ? (statistics.suppliers.withCertifications / statistics.suppliers.total) * 100
                                    : 0}
                                className="h-2"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                            {statistics.suppliers.recentlyAdded} added this week
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Overall Summary Card */}
            <Card className="md:col-span-2 lg:col-span-3">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-yellow-500" />
                        Quick Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="text-center p-4  rounded-lg">
                            <div className="text-2xl font-bold">{statistics.feedTypes.total}</div>
                            <div className="text-sm ">Feed Types</div>
                        </div>
                        <div className="text-center p-4  rounded-lg">
                            <div className="text-2xl font-bold ">{statistics.feedPrograms.total}</div>
                            <div className="text-sm ">Programs</div>
                        </div>
                        <div className="text-center p-4  rounded-lg">
                            <div className="text-2xl font-bold ">{statistics.suppliers.total}</div>
                            <div className="text-sm ">Suppliers</div>
                        </div>
                        <div className="text-center p-4  rounded-lg">
                            <div className="text-2xl font-bold ">
                                {statistics.feedTypes.recentlyAdded +
                                 statistics.feedPrograms.recentlyAdded +
                                 statistics.suppliers.recentlyAdded}
                            </div>
                            <div className="text-sm ">Added This Week</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
