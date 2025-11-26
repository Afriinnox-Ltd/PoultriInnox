import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Brain,
    Pill,
    Syringe,
    Utensils,
    AlertTriangle,
    TrendingUp,
    CheckCircle,
    XCircle,
    Clock,
    DollarSign,
    Target,
    Activity,
    ChevronLeftCircleIcon
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface Batch {
    id: number;
    batch_code: string;
    name: string;
    breed: string;
    current_count: number;
    age_days: number;
    status: string;
}

interface Recommendation {
    timing: any;
    dose_info: any;
    booster_requirements: any;
    protocol?: any;
    program?: any;
    compatibility_score?: number;
    urgency_level?: string;
    priority_level?: string;
    recommendation_reason: string;
    dosage_info?: any;
    timing_info?: any;
    cost_estimate?: number;
    expected_benefits?: string[];
    implementation_notes?: string;
}

interface SmartRecommendationsProps {
    batch: Batch;
    recommendations: {
        feed_recommendations: Recommendation[];
        medication_recommendations: Recommendation[];
        vaccination_recommendations: Recommendation[];
        health_alerts: any[];
        performance_insights: any[];
    };
}

const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({ batch, recommendations }) => {
    const [loading, setLoading] = useState(false);
    const [dismissedRecommendations, setDismissedRecommendations] = useState<Set<string>>(new Set());

    const acceptRecommendation = async (type: string, protocolId: number, notes?: string) => {
        setLoading(true);
        try {
            const endpoint = type === 'medication'
                ? route('batch-incubator.smart-scheduling.accept-medication', batch.id)
                : route('batch-incubator.smart-scheduling.accept-vaccination', batch.id);

            await router.post(endpoint, {
                protocol_id: protocolId,
                notes: notes || '',
            });

            // Refresh recommendations
            router.reload({ only: ['recommendations'] });
        } catch (error) { 
        } finally {
            setLoading(false);
        }
    };

    const dismissRecommendation = async (type: string, recommendationId: string, reason: string) => {
        setLoading(true);
        try {
            await router.post(route('batch-incubator.smart-scheduling.dismiss-recommendation', batch.id), {
                recommendation_type: type,
                recommendation_id: recommendationId,
                reason: reason,
            });

            setDismissedRecommendations(prev => new Set([...prev, recommendationId]));
        } catch (error) { 
        } finally {
            setLoading(false);
        }
    };

    const getUrgencyColor = (level: string) => {
        switch (level) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-300';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'low': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const renderFeedRecommendations = () => (
        <div className="space-y-4">

            {recommendations.feed_recommendations.map((rec, index) => (
                <Card key={index} className="border-l-4 border-l-emerald-500">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Utensils className="h-5 w-5 text-emerald-600" />
                                <CardTitle className="text-lg">{rec.program?.name || 'Feed Program'}</CardTitle>
                                <Badge className="bg-emerald-100 text-emerald-800">
                                    {rec.compatibility_score}% Match
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 mb-3">{rec.recommendation_reason}</p>

                        {rec.expected_benefits && (
                            <div className="mb-3">
                                <h4 className="font-semibold text-sm mb-2">Expected Benefits:</h4>
                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                    {rec.expected_benefits.map((benefit, i) => (
                                        <li key={i}>{benefit}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {rec.implementation_notes && (
                            <div className="mb-3">
                                <h4 className="font-semibold text-sm mb-1">Implementation Notes:</h4>
                                <p className="text-sm text-gray-600">{rec.implementation_notes}</p>
                            </div>
                        )}

                        <div className="flex space-x-2">
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Implement Program
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => dismissRecommendation('feed', `feed-${index}`, 'Not suitable for current conditions')}
                            >
                                <XCircle className="h-4 w-4 mr-1" />
                                Not Applicable
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    const renderMedicationRecommendations = () => (
        <div className="space-y-4">
            {recommendations.medication_recommendations.map((rec, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Pill className="h-5 w-5 text-blue-600" />
                                <CardTitle className="text-lg">{rec.protocol?.medication_name || 'Medication'}</CardTitle>
                                <Badge className={getUrgencyColor(rec.urgency_level || 'low')}>
                                    {rec.urgency_level || 'Low'} Priority
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 mb-3">{rec.recommendation_reason}</p>

                        {rec.dosage_info && (
                            <div className="grid grid-cols-2 gap-4 mb-3">
                                <div className="bg-gray-50 p-3 rounded">
                                    <h4 className="font-semibold text-sm mb-1">Dosage Per Bird</h4>
                                    <p className="text-sm">{rec.dosage_info.dosage_per_bird} {rec.dosage_info.unit}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded">
                                    <h4 className="font-semibold text-sm mb-1">Total Required</h4>
                                    <p className="text-sm">{rec.dosage_info.total_dosage} {rec.dosage_info.unit}</p>
                                </div>
                            </div>
                        )}

                        {rec.timing && (
                            <div className="mb-3">
                                <h4 className="font-semibold text-sm mb-1 flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    Timing
                                </h4>
                                <p className="text-sm text-gray-600">
                                    Start: {rec.timing.recommended_start} | Duration: {rec.timing.duration}
                                </p>
                            </div>
                        )}

                        {rec.cost_estimate && (
                            <div className="mb-3">
                                <h4 className="font-semibold text-sm mb-1 flex items-center">
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    Estimated Cost
                                </h4>
                                <p className="text-sm text-gray-600">${rec.cost_estimate.toFixed(2)}</p>
                            </div>
                        )}

                        <div className="flex space-x-2">
                            <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => acceptRecommendation('medication', rec.protocol?.id)}
                                disabled={loading}
                            >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Accept & Schedule
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => dismissRecommendation('medication', `med-${index}`, 'Not needed at this time')}
                                disabled={loading}
                            >
                                <XCircle className="h-4 w-4 mr-1" />
                                Dismiss
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    const renderVaccinationRecommendations = () => (
        <div className="space-y-4">
            {recommendations.vaccination_recommendations.map((rec, index) => (
                <Card key={index} className="border-l-4 border-l-purple-500">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Syringe className="h-5 w-5 text-purple-600" />
                                <CardTitle className="text-lg">{rec.protocol?.vaccine_name || 'Vaccination'}</CardTitle>
                                <Badge className={getUrgencyColor(rec.priority_level || 'low')}>
                                    {rec.priority_level || 'Low'} Priority
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 mb-3">{rec.recommendation_reason}</p>

                        {rec.timing_info && (
                            <div className="mb-3">
                                <h4 className="font-semibold text-sm mb-1 flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    Optimal Timing
                                </h4>
                                <p className="text-sm text-gray-600">{rec.timing_info.recommended_age}</p>
                            </div>
                        )}

                        {rec.dose_info && (
                            <div className="bg-gray-50 p-3 rounded mb-3">
                                <h4 className="font-semibold text-sm mb-1">Dose Information</h4>
                                <p className="text-sm">{rec.dose_info.total_doses} doses required</p>
                            </div>
                        )}

                        {rec.booster_requirements && (
                            <div className="mb-3">
                                <h4 className="font-semibold text-sm mb-1">Booster Schedule</h4>
                                <p className="text-sm text-gray-600">
                                    {rec.booster_requirements.required
                                        ? `Booster needed in ${rec.booster_requirements.interval} days`
                                        : 'No booster required'
                                    }
                                </p>
                            </div>
                        )}

                        <div className="flex space-x-2">
                            <Button
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700"
                                onClick={() => acceptRecommendation('vaccination', rec.protocol?.id)}
                                disabled={loading}
                            >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Schedule Vaccination
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => dismissRecommendation('vaccination', `vac-${index}`, 'Already completed or not applicable')}
                                disabled={loading}
                            >
                                <XCircle className="h-4 w-4 mr-1" />
                                Dismiss
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    const renderHealthAlerts = () => (
        <div className="space-y-4">
            {recommendations.health_alerts.map((alert, index) => (
                <Alert key={index} className={`border-l-4 ${
                    alert.level === 'high' ? 'border-l-red-500 bg-red-50' :
                    alert.level === 'medium' ? 'border-l-yellow-500 bg-yellow-50' :
                    'border-l-blue-500 bg-blue-50'
                }`}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        <div>
                            <h4 className="font-semibold mb-2">{alert.message}</h4>
                            {alert.recommendations && (
                                <ul className="list-disc list-inside text-sm space-y-1">
                                    {alert.recommendations.map((rec: string, i: number) => (
                                        <li key={i}>{rec}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </AlertDescription>
                </Alert>
            ))}
        </div>
    );

    const renderPerformanceInsights = () => (
        <div className="space-y-4">
            {recommendations.performance_insights.map((insight, index) => (
                <Card key={index} className="border-l-4 border-l-indigo-500">
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <Activity className="h-5 w-5 text-indigo-600" />
                            <CardTitle className="text-lg">{insight.metric}</CardTitle>
                            <Badge className={
                                insight.assessment === 'Excellent' ? 'bg-emerald-100 text-emerald-800' :
                                insight.assessment === 'Poor' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }>
                                {insight.assessment}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                                <h4 className="font-semibold text-sm">Current Value</h4>
                                <p className="text-lg font-bold text-indigo-600">{insight.current_value}</p>
                            </div>
                            {insight.benchmark && (
                                <div>
                                    <h4 className="font-semibold text-sm">Benchmark</h4>
                                    <p className="text-lg font-bold text-gray-600">{insight.benchmark}</p>
                                </div>
                            )}
                        </div>

                        {insight.improvement_tips && (
                            <div>
                                <h4 className="font-semibold text-sm mb-2">Improvement Tips:</h4>
                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                    {insight.improvement_tips.map((tip: string, i: number) => (
                                        <li key={i}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {insight.achievement_notes && (
                            <div className="bg-emerald-50 p-3 rounded">
                                <p className="text-sm text-emerald-800">{insight.achievement_notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    return (
        <AppLayout        >
            <Head title="Smart Recommendations" />

            <div className="py-6">

                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 ">
                    <Link href={`/batch-incubator/batches/${batch.id}`} className="inline-flex items-center">
                        <ChevronLeftCircleIcon className="h-8 w-8 mb-5 text-gray-500" />
                    </Link>

                    {/* Batch Info Header */}
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-5 gap-4">
                                <div>
                                    <h3 className="font-semibold text-sm text-gray-500">Batch Name</h3>
                                    <p className="text-lg font-bold">{batch.name}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm text-gray-500">Breed</h3>
                                    <p className="text-lg">{batch.breed}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm text-gray-500">Age</h3>
                                    <p className="text-lg">{batch.age_days} days</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm text-gray-500">Current Count</h3>
                                    <p className="text-lg">{batch.current_count} birds</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm text-gray-500">Status</h3>
                                    <Badge className="bg-blue-100 text-blue-800">{batch.status}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recommendations Tabs */}
                    <Tabs defaultValue="health" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="health" className="flex items-center space-x-2">
                                <AlertTriangle className="h-4 w-4" />
                                <span>Health Alerts</span>
                            </TabsTrigger>
                            <TabsTrigger value="medication" className="flex items-center space-x-2">
                                <Pill className="h-4 w-4" />
                                <span>Medications</span>
                            </TabsTrigger>
                            <TabsTrigger value="vaccination" className="flex items-center space-x-2">
                                <Syringe className="h-4 w-4" />
                                <span>Vaccinations</span>
                            </TabsTrigger>
                            <TabsTrigger value="feed" className="flex items-center space-x-2">
                                <Utensils className="h-4 w-4" />
                                <span>Feed Programs</span>
                            </TabsTrigger>
                            <TabsTrigger value="performance" className="flex items-center space-x-2">
                                <TrendingUp className="h-4 w-4" />
                                <span>Performance</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="health">
                            {renderHealthAlerts()}
                        </TabsContent>

                        <TabsContent value="medication">
                            {renderMedicationRecommendations()}
                        </TabsContent>

                        <TabsContent value="vaccination">
                            {renderVaccinationRecommendations()}
                        </TabsContent>

                        <TabsContent value="feed">
                            {renderFeedRecommendations()}
                        </TabsContent>

                        <TabsContent value="performance">
                            {renderPerformanceInsights()}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
};

export default SmartRecommendations;
