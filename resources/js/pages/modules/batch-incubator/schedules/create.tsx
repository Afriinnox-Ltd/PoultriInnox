import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    Clock,
    Save,
    X,
    AlertTriangle,
    Info,
    Repeat,
    User,
    Package,
    CheckCircle,
    Brain,
    Pill,
    Syringe,
    Utensils,
    Target,
    Lightbulb
} from 'lucide-react';
import { Link, Head, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
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
        title: 'Schedules',
        href: '/batch-incubator/schedules',
    },
    {
        title: 'Create',
        href: '/batch-incubator/schedules/create',
    },
];

interface ScheduleCreateProps {
    batches: Array<{
        id: number;
        name: string;
        batch_code: string;
        status: string;
        incubator_id: number | null;
        incubator?: {
            id: number;
            name: string;
            status: string;
        } | null;
    }>;
    incubators: Array<{
        id: number;
        name: string;
        status: string;
    }>;
    users: Array<{
        id: number;
        name: string;
        email: string;
    }>;
    eventTypes: Array<{
        value: string;
        label: string;
        description?: string;
    }>;
}

interface Recommendation {
    timing?: any;
    dose_info?: any;
    booster_requirements?: any;
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

interface SmartRecommendationsData {
    success: boolean;
    event_type: string;
    recommendations: Recommendation[];
    batch_info: {
        id: number;
        name: string;
        age_days: number;
        breed: string;
        current_count: number;
    };
}

interface ScheduleData {
    title: string;
    description: string;
    event_type: string;
    batch_id: string;
    incubator_id: string;
    assigned_to: string;
    scheduled_date: string;
    scheduled_time: string;
    priority: number;
    is_critical: boolean;
    required_quantity: string;
    required_unit: string;
    notes: string;
    is_recurring: boolean;
    recurrence_pattern: string;
    recurrence_end_date: string;
    send_reminder: boolean;
    reminder_minutes_before: number;
    estimated_duration: number;
    requirements: string[];
    checklist: string[];
}

export default function ScheduleCreate({
    batches,
    incubators,
    users,
    eventTypes
}: ScheduleCreateProps) {
    const { data, setData, post, processing, errors } = useForm<ScheduleData>({
        title: '',
        description: '',
        event_type: '',
        batch_id: '',
        incubator_id: '',
        assigned_to: '',
        scheduled_date: '',
        scheduled_time: '',
        priority: 3,
        is_critical: false,
        required_quantity: '',
        required_unit: '',
        notes: '',
        is_recurring: false,
        recurrence_pattern: 'daily',
        recurrence_end_date: '',
        send_reminder: true,
        reminder_minutes_before: 30,
        estimated_duration: 0,
        requirements: [],
        checklist: [],
    });

    // Email search state for user selection
    const [userEmail, setUserEmail] = useState('');
    const [emailResults, setEmailResults] = useState<typeof users>([]);
    const [showEmailResults, setShowEmailResults] = useState(false);
    const [selectedUser, setSelectedUser] = useState<typeof users[0] | null>(null);

    // Smart recommendations state
    const [smartRecommendations, setSmartRecommendations] = useState<Recommendation[]>([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);
    const [showRecommendations, setShowRecommendations] = useState(false);

    // Email search handlers
    const handleEmailChange = (email: string) => {
        setUserEmail(email);
        // Only reset selectedUser if the email no longer matches
        if (!selectedUser || selectedUser.email !== email) {
            setSelectedUser(null);
            setData('assigned_to', '');
        }

        if (email.length >= 3) {
            // Filter users by email
            const filteredUsers = users.filter(user =>
                user.email.toLowerCase().includes(email.toLowerCase())
            );
            setEmailResults(filteredUsers);
            setShowEmailResults(filteredUsers.length > 0);
        } else {
            setEmailResults([]);
            setShowEmailResults(false);
        }
    };

    const handleUserSelect = (user: typeof users[0]) => {
        setSelectedUser(user);
        setUserEmail(user.email);
        setData('assigned_to', user.id.toString());
        setShowEmailResults(false);
        setEmailResults([]);
    };

    const handleEmailBlur = () => {
        // Delay hiding results to allow for clicks
        setTimeout(() => setShowEmailResults(false), 200);
    };

    const handleBatchChange = (batchId: string) => {
        setData('batch_id', batchId);

        // Auto-fill incubator based on selected batch
        if (batchId) {
            const selectedBatch = batches.find(batch => batch.id.toString() === batchId);
            if (selectedBatch && selectedBatch.incubator_id) {
                setData('incubator_id', selectedBatch.incubator_id.toString());
            } else {
                // Clear incubator if batch has no incubator or batch is cleared
                setData('incubator_id', '');
            }
        } else {
            // Clear incubator if no batch is selected
            setData('incubator_id', '');
        }
    };

    const [selectedEventType, setSelectedEventType] = useState<any>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/batch-incubator/schedules');
    };

    const handleEventTypeChange = (value: string) => {
        setData('event_type', value);
        const eventType = eventTypes.find(type => type.value === value);
        setSelectedEventType(eventType);

        // Auto-set title based on event type
        if (eventType) {
            setData('title', eventType.label);
        }

        // Fetch smart recommendations for relevant event types
        if (['feeding', 'vaccination', 'medication'].includes(value) && data.batch_id) {
            fetchSmartRecommendations(data.batch_id, value);
        } else {
            setSmartRecommendations([]);
            setShowRecommendations(false);
        }
    };

    // Function to fetch smart recommendations
    const fetchSmartRecommendations = async (batchId: string, eventType: string) => {
        if (!batchId || !eventType) return;

        setLoadingRecommendations(true);
        try {
            const response = await fetch(
                `/batch-incubator/smart-scheduling/batches/${batchId}/recommendations-by-type?event_type=${eventType}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                }
            );

            if (response.ok) {
                const data: SmartRecommendationsData = await response.json();
                if (data.success && data.recommendations.length > 0) {
                    setSmartRecommendations(data.recommendations);
                    setShowRecommendations(true);
                    toast.success(`Found ${data.recommendations.length} smart recommendations for ${eventType}`);
                } else {
                    setSmartRecommendations([]);
                    setShowRecommendations(false);
                }
            }
        } catch (error) {
            console.error('Error fetching smart recommendations:', error);
            toast.error('Failed to fetch smart recommendations');
        } finally {
            setLoadingRecommendations(false);
        }
    };

    // Update handleBatchChange to also trigger recommendations
    const handleBatchChangeWithRecommendations = (batchId: string) => {
        handleBatchChange(batchId);

        // Fetch recommendations if event type is already selected
        if (['feeding', 'vaccination', 'medication'].includes(data.event_type) && batchId) {
            fetchSmartRecommendations(batchId, data.event_type);
        }
    };

    // Function to apply recommendation to form
    const applyRecommendation = (recommendation: Recommendation) => {
        // Update form based on recommendation type
        if (recommendation.protocol) {
            // For vaccination/medication
            setData('description', recommendation.recommendation_reason);

            // Fill Requirements & Notes with detailed information
            let notesContent = '';
            if (recommendation.implementation_notes) {
                notesContent += `Implementation Notes: ${recommendation.implementation_notes}\n\n`;
            }

            // Add dosage information for medications
            if (recommendation.dosage_info && data.event_type === 'medication') {
                notesContent += `Dosage Information:\n`;
                notesContent += `- Per Bird: ${recommendation.dosage_info.dosage_per_bird} ${recommendation.dosage_info.unit}\n`;
                notesContent += `- Total Required: ${recommendation.dosage_info.total_dosage} ${recommendation.dosage_info.unit}\n`;
                if (recommendation.dosage_info.administration_method) {
                    notesContent += `- Administration: ${recommendation.dosage_info.administration_method}\n`;
                }
                notesContent += '\n';

                // Set required quantity and unit for medications
                setData('required_quantity', recommendation.dosage_info.total_dosage.toString());
                setData('required_unit', recommendation.dosage_info.unit);
            }

            // Add dose information for vaccinations
            if (recommendation.dose_info && data.event_type === 'vaccination') {
                notesContent += `Vaccination Information:\n`;
                notesContent += `- Total Doses Required: ${recommendation.dose_info.total_doses}\n`;
                if (recommendation.dose_info.administration_method) {
                    notesContent += `- Administration Method: ${recommendation.dose_info.administration_method}\n`;
                }
                if (recommendation.booster_requirements?.required) {
                    notesContent += `- Booster Required: Yes, in ${recommendation.booster_requirements.interval} days\n`;
                } else {
                    notesContent += `- Booster Required: No\n`;
                }
                notesContent += '\n';

                // Set required quantity and unit for vaccinations
                setData('required_quantity', recommendation.dose_info.total_doses.toString());
                setData('required_unit', 'doses');
            }

            // Add timing information
            if (recommendation.timing) {
                notesContent += `Timing:\n`;
                if (recommendation.timing.recommended_start) {
                    notesContent += `- Start: ${recommendation.timing.recommended_start}\n`;
                }
                if (recommendation.timing.duration) {
                    notesContent += `- Duration: ${recommendation.timing.duration}\n`;
                }
                notesContent += '\n';
            }

            // Add timing info for vaccinations
            if (recommendation.timing_info) {
                notesContent += `Optimal Timing: ${recommendation.timing_info.recommended_age}\n\n`;
            }

            // Add cost estimate
            if (recommendation.cost_estimate) {
                notesContent += `Estimated Cost: $${recommendation.cost_estimate.toFixed(2)}\n\n`;
            }

            // Add expected benefits
            if (recommendation.expected_benefits && recommendation.expected_benefits.length > 0) {
                notesContent += `Expected Benefits:\n`;
                recommendation.expected_benefits.forEach(benefit => {
                    notesContent += `- ${benefit}\n`;
                });
                notesContent += '\n';
            }

            setData('notes', notesContent.trim());

            // Set priority based on urgency
            if (recommendation.urgency_level === 'high' || recommendation.priority_level === 'high') {
                setData('priority', 2);
                setData('is_critical', true);
            } else if (recommendation.urgency_level === 'medium' || recommendation.priority_level === 'medium') {
                setData('priority', 3);
            }

        } else if (recommendation.program) {
            // For feed recommendations
            setData('description', recommendation.recommendation_reason);

            let notesContent = '';
            if (recommendation.implementation_notes) {
                notesContent += `Implementation Notes: ${recommendation.implementation_notes}\n\n`;
            }

            // Add expected benefits for feed programs
            if (recommendation.expected_benefits && recommendation.expected_benefits.length > 0) {
                notesContent += `Expected Benefits:\n`;
                recommendation.expected_benefits.forEach(benefit => {
                    notesContent += `- ${benefit}\n`;
                });
                notesContent += '\n';
            }

            // Add compatibility score
            if (recommendation.compatibility_score) {
                notesContent += `Compatibility Score: ${recommendation.compatibility_score}% match\n\n`;
            }

            setData('notes', notesContent.trim());
            setData('required_unit', 'kg'); // Default unit for feed
        }

        toast.success('Recommendation applied to schedule form');
        setShowRecommendations(false);
    };

    const getPriorityLabel = (priority: number) => {
        const labels = {
            1: 'Critical',
            2: 'High',
            3: 'Medium',
            4: 'Low',
            5: 'Lowest'
        };
        return labels[priority as keyof typeof labels] || 'Medium';
    };

    const getPriorityColor = (priority: number) => {
        if (priority <= 2) return 'text-red-600';
        if (priority === 3) return 'text-yellow-600';
        return 'text-emerald-600';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Schedule - Batch Incubator" />
            <div className="space-y-6 p-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create New Schedule</h1>
                        <p className="text-muted-foreground">
                            Schedule a task for your batch or incubator management
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/batch-incubator/schedules">
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Link>
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Basic Information
                            </CardTitle>
                            <CardDescription>
                                Define the core details for this schedule
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="event_type">Event Type *</Label>
                                    <Select
                                        value={data.event_type}
                                        onValueChange={handleEventTypeChange}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select event type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {eventTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    <div>
                                                        <div className="font-medium">{type.label}</div>
                                                        {type.description && (
                                                            <div className="text-sm text-muted-foreground">
                                                                {type.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.event_type && (
                                        <p className="text-sm text-red-600">{errors.event_type}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="batch_id">Batch *</Label>
                                    <Select
                                        value={data.batch_id}
                                        onValueChange={handleBatchChangeWithRecommendations}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select batch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {batches.filter(batch => batch.status !== 'completed').map((batch) => (
                                                <SelectItem key={batch.id} value={batch.id.toString()}>
                                                    <div className="flex items-center gap-2">
                                                        <Package className="h-4 w-4" />
                                                        <span>{batch.name}</span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {batch.batch_code}
                                                        </Badge>
                                                        {batch.incubator && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                {batch.incubator.name}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.batch_id && (
                                        <p className="text-sm text-red-600">{errors.batch_id}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Enter schedule title"
                                    required
                                />
                                {errors.title && (
                                    <p className="text-sm text-red-600">{errors.title}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Describe what needs to be done"
                                    rows={3}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-600">{errors.description}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Smart Recommendations */}
                    {showRecommendations && (
                        <Card className="border-l-4 border-l-blue-500">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Brain className="h-5 w-5 text-blue-600" />
                                    Smart Recommendations
                                    <Badge className="bg-blue-100 text-blue-800">
                                        {smartRecommendations.length} suggestions
                                    </Badge>
                                </CardTitle>
                                <CardDescription>
                                   Suggestions based on your selected batch and event type
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {smartRecommendations.map((recommendation, index) => (
                                    <div key={index} className="border rounded-lg p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                {data.event_type === 'vaccination' && <Syringe className="h-4 w-4 text-purple-600" />}
                                                {data.event_type === 'medication' && <Pill className="h-4 w-4 text-blue-600" />}
                                                {data.event_type === 'feeding' && <Utensils className="h-4 w-4 text-green-600" />}
                                                <h4 className="font-semibold">
                                                    {recommendation.protocol?.vaccine_name ||
                                                     recommendation.protocol?.medication_name ||
                                                     recommendation.program?.name ||
                                                     'Recommendation'}
                                                </h4>
                                                {recommendation.compatibility_score && (
                                                    <Badge className="bg-green-100 text-green-800">
                                                        {recommendation.compatibility_score}% Match
                                                    </Badge>
                                                )}
                                                {(recommendation.urgency_level === 'high' || recommendation.priority_level === 'high') && (
                                                    <Badge className="bg-red-100 text-red-800">
                                                        High Priority
                                                    </Badge>
                                                )}
                                            </div>
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() => applyRecommendation(recommendation)}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                <Target className="h-4 w-4 mr-1" />
                                                Apply
                                            </Button>
                                        </div>

                                        <p className="text-gray-600 text-sm">
                                            {recommendation.recommendation_reason}
                                        </p>

                                        {recommendation.expected_benefits && (
                                            <div>
                                                <h5 className="font-medium text-sm mb-1">Expected Benefits:</h5>
                                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                                    {recommendation.expected_benefits.map((benefit, i) => (
                                                        <li key={i}>{benefit}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {recommendation.timing_info && (
                                            <div className="bg-gray-50 p-2 rounded text-sm">
                                                <strong>Timing:</strong> {recommendation.timing_info.recommended_age}
                                            </div>
                                        )}

                                        {recommendation.cost_estimate && (
                                            <div className="bg-gray-50 p-2 rounded text-sm">
                                                <strong>Estimated Cost:</strong> ${recommendation.cost_estimate.toFixed(2)}
                                            </div>
                                        )}

                                        {/* Show what will be applied */}
                                        <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm">
                                            <h5 className="font-medium text-blue-800 mb-2 flex items-center">
                                                <Info className="h-4 w-4 mr-1" />
                                                Will be applied to form:
                                            </h5>
                                            <ul className="space-y-1 text-blue-700">
                                                <li>✓ Description: {recommendation.recommendation_reason.substring(0, 50)}...</li>
                                                {(recommendation.dosage_info || recommendation.dose_info) && (
                                                    <li>✓ Required Quantity: {
                                                        recommendation.dosage_info?.total_dosage ||
                                                        recommendation.dose_info?.total_doses
                                                    } {
                                                        recommendation.dosage_info?.unit || 'doses'
                                                    }</li>
                                                )}
                                                {(recommendation.urgency_level === 'high' || recommendation.priority_level === 'high') && (
                                                    <li>✓ Priority: High (Critical)</li>
                                                )}
                                                <li>✓ Notes: Detailed implementation notes & benefits</li>
                                            </ul>
                                        </div>
                                    </div>
                                ))}

                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <Lightbulb className="h-4 w-4" />
                                        <span>Click "Apply" to automatically fill form fields with recommendation details</span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowRecommendations(false)}
                                    >
                                        Hide Recommendations
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {loadingRecommendations && (
                        <Card className="border-l-4 border-l-yellow-500">
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    <span className="text-sm text-gray-600">Loading smart recommendations...</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Schedule Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Schedule Details
                            </CardTitle>
                            <CardDescription>
                                Set when this task should be performed
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="scheduled_date">Date *</Label>
                                    <Input
                                        id="scheduled_date"
                                        type="date"
                                        value={data.scheduled_date}
                                        onChange={(e) => setData('scheduled_date', e.target.value)}
                                        required
                                    />
                                    {errors.scheduled_date && (
                                        <p className="text-sm text-red-600">{errors.scheduled_date}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="scheduled_time">Time</Label>
                                    <Input
                                        id="scheduled_time"
                                        type="time"
                                        value={data.scheduled_time}
                                        onChange={(e) => setData('scheduled_time', e.target.value)}
                                    />
                                    {errors.scheduled_time && (
                                        <p className="text-sm text-red-600">{errors.scheduled_time}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="estimated_duration">Duration (minutes)</Label>
                                    <Input
                                        id="estimated_duration"
                                        type="number"
                                        min="1"
                                        placeholder="30"
                                        value={data.estimated_duration || ''}
                                        onChange={(e) => setData('estimated_duration', parseInt(e.target.value) || 0)}
                                    />
                                    {errors.estimated_duration && (
                                        <p className="text-sm text-red-600">{errors.estimated_duration}</p>
                                    )}
                                </div>
                            </div>

                            {/* Recurring Schedule */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_recurring"
                                        checked={data.is_recurring}
                                        onCheckedChange={(checked) => setData('is_recurring', checked)}
                                    />
                                    <Label htmlFor="is_recurring" className="flex items-center gap-2">
                                        <Repeat className="h-4 w-4" />
                                        Make this a recurring schedule
                                    </Label>
                                </div>

                                {data.is_recurring && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-lg p-4 bg-muted/50">
                                        <div className="space-y-2">
                                            <Label htmlFor="recurrence_pattern">Repeat</Label>
                                            <Select
                                                value={data.recurrence_pattern}
                                                onValueChange={(value) => setData('recurrence_pattern', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="daily">Daily</SelectItem>
                                                    <SelectItem value="weekly">Weekly</SelectItem>
                                                    <SelectItem value="monthly">Monthly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="recurrence_end_date">End Date</Label>
                                            <Input
                                                id="recurrence_end_date"
                                                type="date"
                                                value={data.recurrence_end_date}
                                                onChange={(e) => setData('recurrence_end_date', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Assignment & Priority */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Assignment & Priority
                            </CardTitle>
                            <CardDescription>
                                Assign responsibility and set priority level
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 relative">
                                    <Label htmlFor="user_email">Assign To (Enter Email) *</Label>
                                    <Input
                                        id="user_email"
                                        type="email"
                                        value={userEmail}
                                        onChange={(e) => handleEmailChange(e.target.value)}
                                        onBlur={handleEmailBlur}
                                        onFocus={() => {
                                            if (emailResults.length > 0) {
                                                setShowEmailResults(true);
                                            }
                                        }}
                                        placeholder="Enter user email address"
                                    />

                                    {/* Email Search Results */}
                                    {showEmailResults && emailResults.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                            {emailResults.map((user) => (
                                                <div
                                                    key={user.id}
                                                    className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                                                    onClick={() => handleUserSelect(user)}
                                                >
                                                    <div className="font-medium text-sm">{user.name}</div>
                                                    <div className="text-xs text-muted-foreground">{user.email}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Selected User Display */}
                                    {selectedUser && (
                                        <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-md">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                <div>
                                                    <div className="text-sm font-medium text-emerald-800">
                                                        {selectedUser.name}
                                                    </div>
                                                    <div className="text-xs text-emerald-600">
                                                        {selectedUser.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* No Results Message */}
                                    {userEmail.length >= 3 && emailResults.length === 0 && (
                                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                                <div className="text-sm text-yellow-800">
                                                    No users found with this email address
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {errors.assigned_to && (
                                        <p className="text-sm text-red-600">{errors.assigned_to}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="incubator_id">
                                        Incubator (Optional)
                                        {data.batch_id && (() => {
                                            const selectedBatch = batches.find(batch => batch.id.toString() === data.batch_id);
                                            if (selectedBatch && selectedBatch.incubator) {
                                                return (
                                                    <span className="text-xs text-muted-foreground ml-2">
                                                        - Auto-filled from batch
                                                    </span>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </Label>
                                    <Select
                                        value={data.incubator_id}
                                        onValueChange={(value) => setData('incubator_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select incubator" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {incubators.filter(inc => inc.status !== 'maintenance').map((incubator) => (
                                                <SelectItem key={incubator.id} value={incubator.id.toString()}>
                                                    {incubator.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* Auto-filled incubator indicator */}
                                    {data.batch_id && data.incubator_id && (() => {
                                        const selectedBatch = batches.find(batch => batch.id.toString() === data.batch_id);
                                        const autoFilled = selectedBatch && selectedBatch.incubator_id?.toString() === data.incubator_id;

                                        if (autoFilled) {
                                            return (
                                                <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-md">
                                                    <div className="flex items-center gap-2">
                                                        <Info className="h-4 w-4 text-emerald-600" />
                                                        <div className="text-sm text-emerald-800">
                                                            Auto-filled from selected batch
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select
                                        value={data.priority.toString()}
                                        onValueChange={(value) => setData('priority', parseInt(value))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[1, 2, 3, 4, 5].map((priority) => (
                                                <SelectItem key={priority} value={priority.toString()}>
                                                    <span className={getPriorityColor(priority)}>
                                                        P{priority} - {getPriorityLabel(priority)}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center space-x-2 mt-6">
                                    <Switch
                                        id="is_critical"
                                        checked={data.is_critical}
                                        onCheckedChange={(checked) => setData('is_critical', checked)}
                                    />
                                    <Label htmlFor="is_critical" className="flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-red-600" />
                                        Mark as Critical
                                    </Label>
                                </div>
                            </div>

                            {data.is_critical && (
                                <Alert>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Critical Schedule</AlertTitle>
                                    <AlertDescription>
                                        This schedule will be marked as critical and will receive priority attention.
                                        Critical schedules cannot be postponed without manager approval.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Requirements & Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Requirements & Notes</CardTitle>
                            <CardDescription>
                                Additional information and requirements for this task
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="required_quantity">Required Quantity</Label>
                                    <Input
                                        id="required_quantity"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.required_quantity}
                                        onChange={(e) => setData('required_quantity', e.target.value)}
                                        placeholder="0"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="required_unit">Unit</Label>
                                    <Select
                                        value={data.required_unit}
                                        onValueChange={(value) => setData('required_unit', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="kg">Kilograms (kg)</SelectItem>
                                            <SelectItem value="g">Grams (g)</SelectItem>
                                            <SelectItem value="l">Liters (l)</SelectItem>
                                            <SelectItem value="ml">Milliliters (ml)</SelectItem>
                                            <SelectItem value="pieces">Pieces</SelectItem>
                                            <SelectItem value="doses">Doses</SelectItem>
                                            <SelectItem value="hours">Hours</SelectItem>
                                            <SelectItem value="minutes">Minutes</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Additional Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Any additional instructions or notes for this task"
                                    rows={4}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/batch-incubator/schedules">
                                Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Creating...' : 'Create Schedule'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
