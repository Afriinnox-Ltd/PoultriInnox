import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    ArrowLeft,
    Users,
    Mail,
    CheckCircle,
    XCircle,
    Calendar,
    User,
} from 'lucide-react';

interface Sender {
    id: number;
    name: string;
    email: string;
}

interface RecipientUser {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface MessageRecipient {
    id: number;
    user_id: number;
    email_sent: boolean;
    email_sent_at: string | null;
    user: RecipientUser;
}

interface AdminMessage {
    id: number;
    subject: string;
    body: string;
    recipient_type: 'all' | 'role' | 'individual';
    recipient_roles: string[] | null;
    recipient_user_ids: number[] | null;
    total_recipients: number;
    sent_at: string;
    created_at: string;
    sender: Sender;
    message_recipients: MessageRecipient[];
}

interface Props {
    message: AdminMessage;
}

export default function ShowMessage({ message }: Props) {
    const recipientTypeLabel = () => {
        if (message.recipient_type === 'all') return 'All Users';
        if (message.recipient_type === 'role') return `Roles: ${(message.recipient_roles ?? []).join(', ')}`;
        return 'Specific Users';
    };

    const emailSentCount = message.message_recipients.filter(r => r.email_sent).length;

    return (
        <AdminLayout>
            <Head title={`Message: ${message.subject}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.visit('/admin/communication')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{message.subject}</h2>
                        <p className="text-muted-foreground text-sm">
                            Sent by {message.sender?.name} on {new Date(message.sent_at ?? message.created_at).toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Summary cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{message.total_recipients}</div>
                            <p className="text-xs text-muted-foreground mt-1">{recipientTypeLabel()}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
                            <Mail className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{emailSentCount}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                of {message.message_recipients.length} tracked
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Sent At</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-semibold">
                                {new Date(message.sent_at ?? message.created_at).toLocaleDateString()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {new Date(message.sent_at ?? message.created_at).toLocaleTimeString()}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Message body */}
                <Card>
                    <CardHeader>
                        <CardTitle>Message Content</CardTitle>
                    </CardHeader>
                    <CardContent className='break-words'>
                        <div
                            className="prose break-words prose-sm max-w-none p-4 bg-gray-50 rounded-md border"
                            dangerouslySetInnerHTML={{ __html: message.body }}
                        />
                    </CardContent>
                </Card>

                {/* Recipients list */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recipients ({message.message_recipients.length})</CardTitle>
                        <CardDescription>Individual delivery status for each recipient</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Email Delivered</TableHead>
                                    <TableHead>Delivered At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {message.message_recipients.length > 0 ? (
                                    message.message_recipients.map((recipient) => (
                                        <TableRow key={recipient.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    {recipient.user?.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {recipient.user?.email}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-xs capitalize">
                                                    {recipient.user?.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {recipient.email_sent ? (
                                                    <div className="flex items-center gap-1 text-emerald-600">
                                                        <CheckCircle className="h-4 w-4" />
                                                        <span className="text-xs">Sent</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-gray-400">
                                                        <XCircle className="h-4 w-4" />
                                                        <span className="text-xs">Not sent</span>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {recipient.email_sent_at
                                                    ? new Date(recipient.email_sent_at).toLocaleString()
                                                    : '—'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No recipient records found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
