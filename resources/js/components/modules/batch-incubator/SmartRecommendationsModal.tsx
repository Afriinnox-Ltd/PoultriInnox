import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Brain,
    Pill,
    Syringe,
    Utensils,
    Clock,
    AlertTriangle,
    CheckCircle,
    X,
    Plus,
    TrendingUp,
    Shield
} from 'lucide-react';

interface Batch {
    id: number;
    name: string;
    age_days: number;
    current_count: number;
    breed?: string;
}

interface Recommendation {
    protocol?: any;
    program?: any;
    urgency_level?: string;
    priority_level?: string;
    compatibility_score?: number;
    recommendation_reason: string;
    dosage_info?: any;
    timing_info?: any;
    cost_estimate?: number;
    expected_benefits?: string[];
    implementation_notes?: string;
    risk_assessment?: any;
}

interface SmartRecommendationsModalProps {
    isOpen: boolean;
    onClose: () => void;
    batch: Batch;
    onAddEvent?: (type: 'medication' | 'vaccination' | 'feed', data: any) => void;
}

const SmartRecommendationsModal: React.FC<SmartRecommendationsModalProps> = ({
    isOpen,
    onClose,
    batch,
    onAddEvent
}) => {
    const [recommendations, setRecommendations] = useState<{
        feed_recommendations: Recommendation[];
        medication_recommendations: Recommendation[];
        vaccination_recommendations: Recommendation[];
        health_alerts?: any[];
        performance_insights?: any[];
    }>({
        feed_recommendations: [],
        medication_recommendations: [],
        vaccination_recommendations: []
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('medications');

    useEffect(() => {
        if (isOpen) {
            fetchRecommendations();
        }
    }, [isOpen, batch.id]);

    const fetchRecommendations = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/batch-incubator/smart-scheduling/batches/${batch.id}/recommendations`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setRecommendations(data.recommendations || {
                    feed_recommendations: [],
                    medication_recommendations: [],
                    vaccination_recommendations: []
                });
            }
        } catch (error) {
            
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRecommendation = async (type: 'medication' | 'vaccination', recommendation: Recommendation) => {
        try {
            const url = type === 'medication'
                ? `/batch-incubator/smart-scheduling/batches/${batch.id}/accept-medication`
                : `/batch-incubator/smart-scheduling/batches/${batch.id}/accept-vaccination`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    protocol_id: recommendation.protocol?.id,
                    notes: `Applied via Smart Recommendations`,
                    scheduled_date: new Date().toISOString().split('T')[0]
                })
            });

            if (response.ok) {
                // If onAddEvent callback is provided, use it to add the event to the batch
                if (onAddEvent) {
                    onAddEvent(type, {
                        protocol: recommendation.protocol,
                        notes: `Applied via Smart Recommendations`,
                        scheduled_date: new Date().toISOString().split('T')[0]
                    });
                }

                // Refresh recommendations
                fetchRecommendations();
            }
        } catch (error) { 
        }
    };

    const handleAddAsEvent = (type: 'medication' | 'vaccination' | 'feed', recommendation: Recommendation) => {
        if (onAddEvent) {
            onAddEvent(type, {
                protocol: recommendation.protocol || recommendation.program,
                recommendation_reason: recommendation.recommendation_reason,
                suggested: true
            });
        }
        onClose();
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'critical': return 'destructive';
            case 'high': return 'destructive';
            case 'medium': return 'default';
            case 'low': return 'secondary';
            default: return 'secondary';
        }
    };

    const renderMedicationRecommendations = () => (
        <div className="space-y-4">
            {recommendations.medication_recommendations?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No medication recommendations at this time</p>
                    <p className="text-sm">Your batch appears to be healthy!</p>
                </div>
            ) : (
                recommendations.medication_recommendations?.map((rec, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Pill className="h-5 w-5" />
                                    {rec.protocol?.medication_name || rec.protocol?.name}
                                </CardTitle>
                                <Badge variant={getUrgencyColor(rec.urgency_level || 'low')}>
                                    {rec.urgency_level || 'Low'} Priority
                                </Badge>
                            </div>
                            <CardDescription>
                                {rec.protocol?.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <Alert>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                        {rec.recommendation_reason}
                                    </AlertDescription>
                                </Alert>

                                {rec.dosage_info && (
                                    <div className="text-sm">
                                        <strong>Dosage:</strong> {rec.dosage_info.dosage_per_bird} {rec.dosage_info.unit} per bird
                                        <br />
                                        <strong>Total:</strong> {rec.dosage_info.total_dosage} {rec.dosage_info.unit}
                                    </div>
                                )}

                                {rec.cost_estimate && (
                                    <div className="text-sm">
                                        <strong>Estimated Cost:</strong> ${rec.cost_estimate.toFixed(2)}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleAcceptRecommendation('medication', rec)}
                                        size="sm"
                                        className="flex items-center gap-1"
                                    >
                                        <CheckCircle className="h-3 w-3" />
                                        Apply Now
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleAddAsEvent('medication', rec)}
                                        size="sm"
                                        className="flex items-center gap-1"
                                    >
                                        <Plus className="h-3 w-3" />
                                        Add as Event
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );

    const renderVaccinationRecommendations = () => (
        <div className="space-y-4">
            {recommendations.vaccination_recommendations?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <Syringe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No vaccination recommendations at this time</p>
                    <p className="text-sm">Vaccination schedule is up to date!</p>
                </div>
            ) : (
                recommendations.vaccination_recommendations?.map((rec, index) => (
                    <Card key={index} className="border-l-4 border-l-emerald-500">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Syringe className="h-5 w-5" />
                                    {rec.protocol?.vaccine_name || rec.protocol?.name}
                                </CardTitle>
                                <Badge variant={getUrgencyColor(rec.priority_level || 'low')}>
                                    {rec.priority_level || 'Low'} Priority
                                </Badge>
                            </div>
                            <CardDescription>
                                {rec.protocol?.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <Alert>
                                    <Shield className="h-4 w-4" />
                                    <AlertDescription>
                                        {rec.recommendation_reason}
                                    </AlertDescription>
                                </Alert>

                                {rec.timing_info && (
                                    <div className="text-sm">
                                        <strong>Timing:</strong> {rec.timing_info.recommended_age || 'Current age suitable'}
                                        <br />
                                        <strong>Method:</strong> {rec.protocol?.administration_method}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleAcceptRecommendation('vaccination', rec)}
                                        size="sm"
                                        className="flex items-center gap-1"
                                    >
                                        <CheckCircle className="h-3 w-3" />
                                        Apply Now
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleAddAsEvent('vaccination', rec)}
                                        size="sm"
                                        className="flex items-center gap-1"
                                    >
                                        <Plus className="h-3 w-3" />
                                        Add as Event
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );

    const renderFeedRecommendations = () => (
        <div className="space-y-4">
            {recommendations.feed_recommendations?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <Utensils className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No feed program recommendations at this time</p>
                    <p className="text-sm">Current feeding is optimal!</p>
                </div>
            ) : (
                recommendations.feed_recommendations?.map((rec, index) => (
                    <Card key={index} className="border-l-4 border-l-orange-500">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Utensils className="h-5 w-5" />
                                    {rec.program?.name}
                                </CardTitle>
                                <Badge variant="secondary">
                                    {rec.compatibility_score?.toFixed(0)}% Match
                                </Badge>
                            </div>
                            <CardDescription>
                                {rec.program?.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <Alert>
                                    <TrendingUp className="h-4 w-4" />
                                    <AlertDescription>
                                        {rec.recommendation_reason}
                                    </AlertDescription>
                                </Alert>

                                {rec.expected_benefits && (
                                    <div className="text-sm">
                                        <strong>Benefits:</strong>
                                        <ul className="list-disc list-inside mt-1">
                                            {rec.expected_benefits.map((benefit, i) => (
                                                <li key={i}>{benefit}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleAddAsEvent('feed', rec)}
                                        size="sm"
                                        className="flex items-center gap-1"
                                    >
                                        <Plus className="h-3 w-3" />
                                        Add as Event
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );

    const getTotalRecommendations = () => {
        return (recommendations.medication_recommendations?.length || 0) +
               (recommendations.vaccination_recommendations?.length || 0) +
               (recommendations.feed_recommendations?.length || 0);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Brain className="h-6 w-6 text-blue-600" />
                        Smart Recommendations for {batch.name}
                    </DialogTitle>
                    <DialogDescription>
                        Recommendations for optimal batch management (Age: {batch.age_days} days, Birds: {batch.current_count})
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Analyzing batch data...</span>
                    </div>
                ) : (
                    <div>
                        {getTotalRecommendations() === 0 ? (
                            <Alert>
                                <CheckCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Excellent! Your batch is performing well with no immediate recommendations needed.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="medications" className="flex items-center gap-2">
                                        <Pill className="h-4 w-4" />
                                        Medications ({recommendations.medication_recommendations?.length || 0})
                                    </TabsTrigger>
                                    <TabsTrigger value="vaccinations" className="flex items-center gap-2">
                                        <Syringe className="h-4 w-4" />
                                        Vaccinations ({recommendations.vaccination_recommendations?.length || 0})
                                    </TabsTrigger>
                                    <TabsTrigger value="feed" className="flex items-center gap-2">
                                        <Utensils className="h-4 w-4" />
                                        Feed ({recommendations.feed_recommendations?.length || 0})
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="medications" className="mt-4">
                                    {renderMedicationRecommendations()}
                                </TabsContent>

                                <TabsContent value="vaccinations" className="mt-4">
                                    {renderVaccinationRecommendations()}
                                </TabsContent>

                                <TabsContent value="feed" className="mt-4">
                                    {renderFeedRecommendations()}
                                </TabsContent>
                            </Tabs>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default SmartRecommendationsModal;
