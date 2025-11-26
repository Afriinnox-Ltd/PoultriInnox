import React, { useState, useEffect, useCallback } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Mail,
    Plus,
    Eye,
    Trash2,
    Users,
    Send,
    X,
    Search,
    MessageSquare,
    UserCheck,
    Filter,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import RichTextEditor from '@/components/ui/rich-text-editor';

interface Role {
    id: number;
    name: string;
    slug: string;
}

interface UserRecord {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface MessageSender {
    id: number;
    name: string;
    email: string;
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
    sender: MessageSender;
    message_recipients_count?: number;
}

interface PaginatedMessages {
    data: AdminMessage[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    meta: {
        total: number;
        from: number;
        to: number;
        last_page: number;
        current_page: number;
    };
}

interface Filters {
    search: string;
    filter_type: string;
}

interface Props {
    messages: PaginatedMessages;
    roles: Role[];
    userCount: number;
    filters: Filters;
}

const SPECIAL_GROUPS = [
    { slug: 'verified-vendors', label: 'Verified Vendors', section: 'Vendors' },
    { slug: 'unverified-vendors', label: 'Unverified Vendors', section: 'Vendors' },
    { slug: 'non-vendor-users', label: 'Normal Users (Excl. Vendors)', section: 'Vendors' },
    { slug: 'all-partners', label: 'All Partners', section: 'Partners' },
    { slug: 'active-partners', label: 'Active Partners', section: 'Partners' },
    { slug: 'verified-partners', label: 'Verified Partners', section: 'Partners' },
];

export default function CommunicationCenter({ messages, roles, userCount, filters }: Props) {
    const { auth } = usePage<{ auth: { user: any; permissions: string[] } }>().props;
    const isAdmin = auth.user?.role === 'admin';

    // History filter state
    const [searchQuery, setSearchQuery] = useState(filters.search ?? '');
    const [filterType, setFilterType] = useState(filters.filter_type ?? '');

    // Apply filters with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            const params: Record<string, string> = {};
            if (searchQuery) params.search = searchQuery;
            if (filterType) params.filter_type = filterType;
            router.get('/admin/communication', params, { preserveState: true, replace: true });
        }, 350);
        return () => clearTimeout(timer);
    }, [searchQuery, filterType]);

    const clearFilters = () => {
        setSearchQuery('');
        setFilterType('');
    };

    const hasActiveFilters = searchQuery !== '' || filterType !== '';

    // Compose state
    const [showCompose, setShowCompose] = useState(false);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [recipientType, setRecipientType] = useState<'all' | 'role' | 'individual'>('all');
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<UserRecord[]>([]);
    const [sendEmail, setSendEmail] = useState(true);
    const [sending, setSending] = useState(false);

    // Recipient preview
    const [previewUsers, setPreviewUsers] = useState<UserRecord[]>([]);
    const [previewTotal, setPreviewTotal] = useState(userCount);
    const [loadingPreview, setLoadingPreview] = useState(false);

    // User search (for individual type)
    const [userSearch, setUserSearch] = useState('');
    const [searchResults, setSearchResults] = useState<UserRecord[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);

    // Delete confirm
    const [deleteTarget, setDeleteTarget] = useState<AdminMessage | null>(null);

    // Fetch recipient preview when selection changes
    useEffect(() => {
        if (!showCompose) return;

        const fetchPreview = async () => {
            setLoadingPreview(true);
            try {
                const payload: Record<string, unknown> = { recipient_type: recipientType };
                if (recipientType === 'role') payload.recipient_roles = selectedRoles;
                if (recipientType === 'individual') payload.recipient_user_ids = selectedUsers.map(u => u.id);

                const response = await fetch('/admin/communication/recipient-preview', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });
                const data = await response.json();
                setPreviewUsers(data.users ?? []);
                setPreviewTotal(data.total ?? 0);
            } catch {
                // silently ignore preview errors
            } finally {
                setLoadingPreview(false);
            }
        };

        fetchPreview();
    }, [recipientType, selectedRoles, selectedUsers, showCompose]);

    // Debounced user search
    useEffect(() => {
        if (userSearch.length < 2) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const response = await fetch(`/admin/communication/search-users?search=${encodeURIComponent(userSearch)}`, {
                    headers: { 'Accept': 'application/json' },
                });
                const data = await response.json();
                setSearchResults(data);
            } catch {
                // ignore
            } finally {
                setSearchLoading(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [userSearch]);

    const toggleRole = (slug: string) => {
        setSelectedRoles(prev =>
            prev.includes(slug) ? prev.filter(r => r !== slug) : [...prev, slug]
        );
    };

    const addUser = (user: UserRecord) => {
        if (!selectedUsers.find(u => u.id === user.id)) {
            setSelectedUsers(prev => [...prev, user]);
        }
        setUserSearch('');
        setSearchResults([]);
    };

    const removeUser = (userId: number) => {
        setSelectedUsers(prev => prev.filter(u => u.id !== userId));
    };

    const resetCompose = () => {
        setSubject('');
        setBody('');
        setRecipientType('all');
        setSelectedRoles([]);
        setSelectedUsers([]);
        setSendEmail(true);
        setPreviewUsers([]);
        setPreviewTotal(userCount);
        setUserSearch('');
        setSearchResults([]);
    };

    const handleSubmit = () => {
        if (!subject.trim()) { toast.error('Subject is required'); return; }
        if (!body.trim() || body === '<p><br></p>') { toast.error('Message body is required'); return; }
        if (recipientType === 'role' && selectedRoles.length === 0) {
            toast.error('Please select at least one role'); return;
        }
        if (recipientType === 'individual' && selectedUsers.length === 0) {
            toast.error('Please select at least one recipient'); return;
        }

        setSending(true);
        router.post('/admin/communication', {
            subject,
            body,
            recipient_type: recipientType,
            recipient_roles: recipientType === 'role' ? selectedRoles : undefined,
            recipient_user_ids: recipientType === 'individual' ? selectedUsers.map(u => u.id) : undefined,
            send_email: sendEmail,
        }, {
            onSuccess: () => {
                toast.success('Message sent successfully');
                setShowCompose(false);
                resetCompose();
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0] as string;
                toast.error(firstError || 'Failed to send message');
            },
            onFinish: () => setSending(false),
        });
    };

    const handleDelete = (message: AdminMessage) => {
        setDeleteTarget(message);
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        router.delete(`/admin/communication/${deleteTarget.id}`, {
            onSuccess: () => { toast.success('Message deleted'); setDeleteTarget(null); },
            onError: () => toast.error('Failed to delete message'),
        });
    };

    const resolveGroupLabel = (slug: string): string => {
        const special = SPECIAL_GROUPS.find(g => g.slug === slug);
        if (special) return special.label;
        return roles.find(r => r.slug === slug)?.name ?? slug;
    };

    const getRecipientLabel = (message: AdminMessage) => {
        if (message.recipient_type === 'all') return 'All Users';
        if (message.recipient_type === 'role') {
            const names = (message.recipient_roles ?? []).map(resolveGroupLabel).join(', ');
            return `Group: ${names}`;
        }
        return `${message.total_recipients} individual(s)`;
    };

    return (
        <AdminLayout>
            <Head title="Communication Center" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Communication Center</h2>
                        <p className="text-muted-foreground">
                            Send messages and announcements to system users
                        </p>
                    </div>
                    <Button onClick={() => { resetCompose(); setShowCompose(true); }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Compose Message
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Messages Sent</CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{messages.meta?.total ?? messages.data.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">System Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{userCount}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Available Groups</CardTitle>
                            <Filter className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{roles.length + SPECIAL_GROUPS.length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Message History */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <CardTitle>Message History</CardTitle>
                                <CardDescription>All messages sent through the communication center</CardDescription>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-9 h-9 w-52"
                                        placeholder="Search subject or sender..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Select value={filterType || 'all_types'} onValueChange={v => setFilterType(v === 'all_types' ? '' : v)}>
                                    <SelectTrigger className="h-9 w-44">
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all_types">All Types</SelectItem>
                                        <SelectItem value="all">All Users</SelectItem>
                                        <SelectItem value="role">By Group</SelectItem>
                                        <SelectItem value="individual">Individual</SelectItem>
                                    </SelectContent>
                                </Select>
                                {hasActiveFilters && (
                                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 px-2 text-muted-foreground">
                                        <X className="h-4 w-4 mr-1" />
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Recipients</TableHead>
                                    <TableHead>Sent To</TableHead>
                                    <TableHead>Sent By</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {messages.data.length > 0 ? (
                                    messages.data.map((message) => (
                                        <TableRow key={message.id}>
                                            <TableCell className="font-medium max-w-[260px] truncate">
                                                {message.subject}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    <UserCheck className="h-3 w-3 mr-1" />
                                                    {message.total_recipients}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="text-xs">
                                                    {getRecipientLabel(message)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div className="font-medium">{message.sender?.name}</div>
                                                    <div className="text-muted-foreground text-xs">{message.sender?.email}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(message.sent_at ?? message.created_at).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => router.visit(`/admin/communication/${message.id}`)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {isAdmin && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-500 hover:text-red-700"
                                                            onClick={() => handleDelete(message)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                            No messages sent yet. Compose your first message.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {messages.meta && messages.meta.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {messages.meta.from} to {messages.meta.to} of {messages.meta.total} results
                                </div>
                                <div className="flex space-x-1">
                                    {messages.links?.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => link.url && router.visit(link.url)}
                                            disabled={!link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Compose Dialog */}
            <Dialog open={showCompose} onOpenChange={(open) => { if (!open) { setShowCompose(false); } }}>
                <DialogContent className="h-[80vh] sm:max-w-[80%] max-h-[90vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Compose Message
                        </DialogTitle>
                        <DialogDescription>
                            Send a message to a group of users or specific individuals.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 py-2">
                        {/* Subject */}
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject <span className="text-red-500">*</span></Label>
                            <Input
                                id="subject"
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                placeholder="Enter message subject..."
                            />
                        </div>

                        {/* Recipient Type */}
                        <div className="space-y-2">
                            <Label>Recipients <span className="text-red-500">*</span></Label>
                            <Select value={recipientType} onValueChange={(v) => {
                                setRecipientType(v as typeof recipientType);
                                setSelectedRoles([]);
                                setSelectedUsers([]);
                            }}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            All Users ({userCount})
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="role">
                                        <div className="flex items-center gap-2">
                                            <Filter className="h-4 w-4" />
                                            Filter by Role / Group
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="individual">
                                        <div className="flex items-center gap-2">
                                            <UserCheck className="h-4 w-4" />
                                            Specific Users
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Role selection */}
                        {recipientType === 'role' && (
                            <div className="space-y-2">
                                <Label>Select Roles / Groups</Label>
                                <div className="space-y-3 p-3 border rounded-md bg-muted/30">
                                    {/* System roles */}
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Roles</p>
                                        <div className="grid grid-cols-2 gap-1">
                                            {roles.map(role => (
                                                <label
                                                    key={role.id}
                                                    className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-muted transition-colors"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRoles.includes(role.slug)}
                                                        onChange={() => toggleRole(role.slug)}
                                                        className="h-4 w-4 rounded border-gray-300"
                                                    />
                                                    <span className="text-sm font-medium">{role.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Special groups — grouped by section */}
                                    {(['Vendors', 'Partners'] as const).map(section => {
                                        const sectionGroups = SPECIAL_GROUPS.filter(g => g.section === section);
                                        return (
                                            <div key={section} className="border-t pt-2">
                                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{section}</p>
                                                <div className="grid grid-cols-2 gap-1">
                                                    {sectionGroups.map(group => (
                                                        <label
                                                            key={group.slug}
                                                            className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-muted transition-colors"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedRoles.includes(group.slug)}
                                                                onChange={() => toggleRole(group.slug)}
                                                                className="h-4 w-4 rounded border-gray-300"
                                                            />
                                                            <span className="text-sm font-medium">{group.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {selectedRoles.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {selectedRoles.map(slug => (
                                                <Badge key={slug} variant="secondary" className="gap-1 inline-flex items-center">
                                                    <span>{resolveGroupLabel(slug)}</span>
                                                    <button
                                                        type="button"
                                                        className="ml-1 hover:opacity-70 focus:outline-none rounded-sm flex items-center"
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleRole(slug); }}
                                                    >
                                                        <X className="h-3 w-3 pointer-events-none" />
                                                    </button>
                                                </Badge>
                                            ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Individual user search */}
                        {recipientType === 'individual' && (
                            <div className="space-y-2">
                                <Label>Search & Add Users</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-9"
                                        value={userSearch}
                                        onChange={e => setUserSearch(e.target.value)}
                                        placeholder="Search by name or email..."
                                    />
                                    {searchLoading && (
                                        <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                                    )}
                                </div>
                                {searchResults.length > 0 && (
                                    <div className="border rounded-md max-h-48 overflow-y-auto divide-y">
                                        {searchResults.map(user => (
                                            <div
                                                key={user.id}
                                                className="flex items-center justify-between px-3 py-2 hover:bg-muted cursor-pointer"
                                                onClick={() => addUser(user)}
                                            >
                                                <div>
                                                    <div className="text-sm font-medium">{user.name}</div>
                                                    <div className="text-xs text-muted-foreground">{user.email}</div>
                                                </div>
                                                <Badge variant="outline" className="text-xs">{user.role}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {selectedUsers.length > 0 && (
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Selected ({selectedUsers.length})</Label>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedUsers.map(user => (
                                                <Badge key={user.id} variant="secondary" className="gap-1 text-xs inline-flex items-center">
                                                    <span>{user.name} ({user.email}) - {user.role}</span>
                                                    <button
                                                        type="button"
                                                        className="ml-1 hover:opacity-70 focus:outline-none rounded-sm flex items-center"
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeUser(user.id); }}
                                                    >
                                                        <X className="h-3 w-3 pointer-events-none" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Recipient preview */}
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                            {loadingPreview ? (
                                <div className="flex items-center gap-2 text-sm text-blue-700">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Calculating recipients...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-sm text-blue-700">
                                    <Users className="h-4 w-4" />
                                    <span><strong>{previewTotal}</strong> recipient(s) will receive this message</span>
                                </div>
                            )}
                            {previewUsers.length > 0 && previewTotal > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {previewUsers.slice(0, 8).map(u => (
                                        <span key={u.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                            {u.name} ({u.email})
                                        </span>
                                    ))}
                                    {previewTotal > 8 && (
                                        <span className="text-xs text-blue-600">+{previewTotal - 8} more</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Body */}
                        <div className="space-y-2">
                            <Label>Message Body <span className="text-red-500">*</span></Label>
                            <RichTextEditor
                                value={body}
                                onChange={setBody}
                                placeholder="Write your message here..."
                            />
                        </div>

                        {/* Send email toggle */}
                        <label className="flex items-center gap-3 cursor-pointer p-3 border rounded-md hover:bg-muted/30 transition-colors">
                            <input
                                type="checkbox"
                                checked={sendEmail}
                                onChange={e => setSendEmail(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <div>
                                <div className="text-sm font-medium">Send email notification</div>
                                <div className="text-xs text-muted-foreground">Deliver this message to recipients' email addresses</div>
                            </div>
                        </label>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCompose(false)} disabled={sending}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={sending || previewTotal === 0}>
                            {sending ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
                            ) : (
                                <><Send className="h-4 w-4 mr-2" /> Send to {previewTotal} Recipient{previewTotal !== 1 ? 's' : ''}</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Message</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "<strong>{deleteTarget?.subject}</strong>"?
                            This will also remove all recipient records for this message.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
