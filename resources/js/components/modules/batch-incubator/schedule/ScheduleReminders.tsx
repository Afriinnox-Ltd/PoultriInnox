import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Plus,
    Trash2,
    Edit,
    Clock,
    Mail,
    Database,
    Bell,
    AlertTriangle,
    CheckCircle,
    X,
    Save
} from 'lucide-react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Reminder {
    id: number;
    reminder_type: 'before_due' | 'custom';
    minutes_before?: number;
    reminder_time: string;
    notification_method: 'email' | 'database' | 'both';
    status: 'pending' | 'sent' | 'failed' | 'cancelled';
    custom_message?: string;
    user: User;
    sent_at?: string;
    error_message?: string;
}

interface InertiaPageProps {
    reminders?: Reminder[];
    message?: string;
    error?: string;
}

interface ScheduleRemindersProps {
    scheduleId: number;
    users: User[];
    initialReminders?: Reminder[];
}

export default function ScheduleReminders({
    scheduleId,
    users,
    initialReminders = []
}: ScheduleRemindersProps) {
    const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingReminder, setEditingReminder] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        user_id: '',
        reminder_type: 'before_due' as 'before_due' | 'custom',
        minutes_before: 30,
        custom_reminder_time: '',
        notification_method: 'both' as 'email' | 'database' | 'both',
        custom_message: '',
    });
    const [emailResults, setEmailResults] = useState<User[]>([]);
    const [showEmailResults, setShowEmailResults] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
        fetchReminders();
    }, []);

    const fetchReminders = () => {
        router.get(
            `/batch-incubator/schedules/${scheduleId}/reminders`,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                only: ['reminders'],
                onSuccess: (page) => {
                    const props = page.props as InertiaPageProps;
                    setReminders(props.reminders || []);
                },
                onError: (errors) => {
                    setError('Failed to fetch reminders'); 
                },
            }
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validate that a user is selected
        if (!selectedUser || !formData.user_id) {
            setError('Please select a valid user from the email search results');
            setLoading(false);
            return;
        }

        router.post(
            `/batch-incubator/schedules/${scheduleId}/reminders`,
            formData,
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: (page) => {
                    const props = page.props as InertiaPageProps;
                    setReminders(props.reminders || []);
                    setShowAddForm(false);
                    resetForm();
                toast.success('Reminder created successfully!');
                },
                onError: (errors) => {
                    toast.error('Failed to create reminder. Please check the form for errors.');
                    const errorMessage = typeof errors === 'object' && 'message' in errors
                        ? (errors as any).message
                        : 'Failed to create reminder';
                    setError(errorMessage);
                },
                onFinish: () => setLoading(false),
            }
        );
    };

    const handleDelete = (reminderId: number) => {
        if (!confirm('Are you sure you want to delete this reminder?')) {
            return;
        }

        router.delete(
            `/batch-incubator/schedules/${scheduleId}/reminders/${reminderId}`,
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: (page) => {
                    const props = page.props as InertiaPageProps;
                    setReminders(props.reminders || []);
                    if (props.message) {
                        
                    }
                },
                onError: (errors) => {
                    const errorMessage = typeof errors === 'object' && 'message' in errors
                        ? (errors as any).message
                        : 'Failed to delete reminder';
                    setError(errorMessage);
                },
            }
        );
    };

    const handleCancel = (reminderId: number) => {
        router.post(
            `/batch-incubator/schedules/${scheduleId}/reminders/${reminderId}/cancel`,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: (page) => {
                    const props = page.props as InertiaPageProps;
                    setReminders(props.reminders || []);
                    if (props.message) {
                        
                    }
                },
                onError: (errors) => {
                    const errorMessage = typeof errors === 'object' && 'message' in errors
                        ? (errors as any).message
                        : 'Failed to cancel reminder';
                    setError(errorMessage);
                },
            }
        );
    };

    const resetForm = () => {
        setFormData({
            email: '',
            user_id: '',
            reminder_type: 'before_due',
            minutes_before: 30,
            custom_reminder_time: '',
            notification_method: 'both',
            custom_message: '',
        });
        setEmailResults([]);
        setShowEmailResults(false);
        setSelectedUser(null);
    };

    const handleEmailChange = (email: string) => {
            setFormData({ ...formData, email, user_id: '' });
            // Only reset selectedUser if the email no longer matches
            if (!selectedUser || selectedUser.email !== email) {
                setSelectedUser(null);
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
    
    const handleUserSelect = (user: User) => {
        setSelectedUser(user);
        setFormData({ ...formData, email: user.email, user_id: user.id.toString() });
        setShowEmailResults(false);
        setEmailResults([]);
    };

    const handleEmailBlur = () => {
        // Delay hiding results to allow for clicks
        setTimeout(() => setShowEmailResults(false), 200);
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            pending: 'bg-emerald-100 text-emerald-800',
            sent: 'bg-emerald-100 text-emerald-800',
            failed: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-800',
        };
        return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
    };

    const getNotificationIcon = (method: string) => {
        switch (method) {
            case 'email': return <Mail className="h-4 w-4" />;
            case 'database': return <Database className="h-4 w-4" />;
            case 'both': return <Bell className="h-4 w-4" />;
            default: return <Bell className="h-4 w-4" />;
        }
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getTimeOptions = () => {
        return [
            { value: 15, label: '15 minutes before' },
            { value: 30, label: '30 minutes before' },
            { value: 60, label: '1 hour before' },
            { value: 120, label: '2 hours before' },
            { value: 240, label: '4 hours before' },
            { value: 480, label: '8 hours before' },
            { value: 720, label: '12 hours before' },
            { value: 1440, label: '1 day before' },
            { value: 2880, label: '2 days before' },
            { value: 4320, label: '3 days before' },
            { value: 10080, label: '1 week before' },
        ];
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Reminders
                        </CardTitle>
                        <CardDescription>
                            Set up email and database notifications for this schedule. Enter an email address to find and select the user to notify.
                        </CardDescription>
                    </div>
                    {!showAddForm && (
                        <Button onClick={() => setShowAddForm(true)} size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Reminder
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Add Reminder Form */}
                {showAddForm && (
                    <Card className="border-dashed">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Add New Reminder</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2 relative">
                                        <Label htmlFor="email">User Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleEmailChange(e.target.value)}
                                            onBlur={handleEmailBlur}
                                            onFocus={() => {
                                                if (emailResults.length > 0) {
                                                    setShowEmailResults(true);
                                                }
                                            }}
                                            placeholder="Enter user email address"
                                            required
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
                                        {formData.email.length >= 3 && emailResults.length === 0 && (
                                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                                    <div className="text-sm text-yellow-800">
                                                        No users found with this email address
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reminder_type">Reminder Type *</Label>
                                        <Select
                                            value={formData.reminder_type}
                                            onValueChange={(value: 'before_due' | 'custom') =>
                                                setFormData({ ...formData, reminder_type: value })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="before_due">Before Due Date</SelectItem>
                                                <SelectItem value="custom">Custom Time</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {formData.reminder_type === 'before_due' ? (
                                    <div className="space-y-2">
                                        <Label htmlFor="minutes_before">Time Before Due Date *</Label>
                                        <Select
                                            value={formData.minutes_before.toString()}
                                            onValueChange={(value) =>
                                                setFormData({ ...formData, minutes_before: parseInt(value) })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getTimeOptions().map((option) => (
                                                    <SelectItem key={option.value} value={option.value.toString()}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label htmlFor="custom_reminder_time">Custom Reminder Time *</Label>
                                        <Input
                                            id="custom_reminder_time"
                                            type="datetime-local"
                                            value={formData.custom_reminder_time}
                                            onChange={(e) =>
                                                setFormData({ ...formData, custom_reminder_time: e.target.value })
                                            }
                                            required={formData.reminder_type === 'custom'}
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="notification_method">Notification Method *</Label>
                                    <Select
                                        value={formData.notification_method}
                                        onValueChange={(value: 'email' | 'database' | 'both') =>
                                            setFormData({ ...formData, notification_method: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="email">Email Only</SelectItem>
                                            <SelectItem value="database">In-App Only</SelectItem>
                                            <SelectItem value="both">Email + In-App</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="custom_message">Custom Message (Optional)</Label>
                                    <Textarea
                                        id="custom_message"
                                        value={formData.custom_message}
                                        onChange={(e) =>
                                            setFormData({ ...formData, custom_message: e.target.value })
                                        }
                                        placeholder="Add a custom message to include with the reminder"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        type="submit"
                                        disabled={loading || !formData.user_id}
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {loading ? 'Creating...' : 'Create Reminder'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowAddForm(false);
                                            resetForm();
                                            setError(null);
                                        }}
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Reminders List */}
                {reminders.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No reminders set for this schedule</p>
                        <p className="text-sm">Add a reminder to get notified about this task</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reminders.map((reminder) => (
                            <div key={reminder.id} className="border rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="flex items-center gap-2">
                                                {getNotificationIcon(reminder.notification_method)}
                                                <span className="font-medium">{reminder.user.name}</span>
                                            </div>
                                            <Badge className={getStatusBadge(reminder.status)}>
                                                {reminder.status}
                                            </Badge>
                                            <Badge variant="outline">
                                                {reminder.reminder_type === 'before_due'
                                                    ? `${reminder.minutes_before}min before`
                                                    : 'Custom time'
                                                }
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>Reminder time: {formatDateTime(reminder.reminder_time)}</span>
                                            </div>
                                            <div>Notification: {reminder.notification_method}</div>
                                            {reminder.custom_message && (
                                                <div className="text-xs bg-muted p-2 rounded mt-2">
                                                    <strong>Custom message:</strong> {reminder.custom_message}
                                                </div>
                                            )}
                                            {reminder.sent_at && (
                                                <div className="text-emerald-600">
                                                    Sent: {formatDateTime(reminder.sent_at)}
                                                </div>
                                            )}
                                            {reminder.error_message && (
                                                <div className="text-red-600">
                                                    Error: {reminder.error_message}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {reminder.status === 'pending' && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleCancel(reminder.id)}
                                                >
                                                    Cancel
                                                </Button>
                                            </>
                                        )}
                                        {reminder.status !== 'sent' && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(reminder.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
