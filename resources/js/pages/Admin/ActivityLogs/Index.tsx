import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Activity,
    Search,
    Filter,
    Eye,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Users,
    Clock,
    Calendar,
    Shield,
    X,
} from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    role?: string;
}

interface LogEntry {
    id: number;
    user_id: number | null;
    action: string;
    entity_type: string | null;
    entity_id: number | null;
    entity_name: string | null;
    old_values: Record<string, any> | null;
    new_values: Record<string, any> | null;
    ip_address: string | null;
    user_agent: string | null;
    description: string | null;
    created_at: string;
    user: User | null;
}

interface PaginatedLogs {
    data: LogEntry[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    logs: PaginatedLogs;
    filters: {
        user_id?: string;
        action?: string;
        entity_type?: string;
        search?: string;
        date_from?: string;
        date_to?: string;
    };
    actions: string[];
    entityTypes: string[];
    users: User[];
    stats: {
        total: number;
        today: number;
        this_week: number;
        unique_users: number;
    };
}

const actionColors: Record<string, string> = {
    created: 'bg-green-100 text-green-800',
    updated: 'bg-blue-100 text-blue-800',
    deleted: 'bg-red-100 text-red-800',
    login: 'bg-purple-100 text-purple-800',
    logout: 'bg-gray-100 text-gray-800',
    approved: 'bg-emerald-100 text-emerald-800',
    suspended: 'bg-orange-100 text-orange-800',
    exported: 'bg-cyan-100 text-cyan-800',
};

function formatEntityType(type: string | null): string {
    if (!type) return '-';
    // Extract class name from full namespace
    const parts = type.split('\\');
    return parts[parts.length - 1];
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return formatDate(dateStr);
}

export default function Index({ logs, filters, actions, entityTypes, users, stats }: Props) {
    const { auth } = usePage<{ auth: { user: any; permissions: string[] } }>().props;
    const perms = auth.permissions || [];
    const isAdmin = auth.user?.role === 'admin';
    const canManage = isAdmin || perms.includes('manage-activity-logs');

    const [search, setSearch] = useState(filters.search || '');
    const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
    const [showCleanup, setShowCleanup] = useState(false);
    const [cleanupDays, setCleanupDays] = useState('90');
    const [showFilters, setShowFilters] = useState(
        !!(filters.user_id || filters.action || filters.entity_type || filters.date_from || filters.date_to)
    );

    function applyFilters(newFilters: Record<string, string | undefined>) {
        const merged: Record<string, string | undefined> = { ...filters, ...newFilters };
        // Remove empty values
        Object.keys(merged).forEach(key => {
            if (!merged[key] || merged[key] === 'all') delete merged[key];
        });
        router.get('/admin/activity-logs', merged, { preserveState: true, preserveScroll: true });
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        applyFilters({ search: search || undefined });
    }

    function clearFilters() {
        setSearch('');
        router.get('/admin/activity-logs', {}, { preserveState: true });
    }

    function handleCleanup() {
        router.delete('/admin/activity-logs/cleanup', {
            data: { older_than_days: parseInt(cleanupDays) },
            onSuccess: () => setShowCleanup(false),
        });
    }

    const hasActiveFilters = !!(filters.user_id || filters.action || filters.entity_type || filters.search || filters.date_from || filters.date_to);

    return (
        <AdminLayout>
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
                        <p className="text-sm text-gray-500 mt-1">Track user actions across the system</p>
                    </div>
                    {canManage && (
                        <Dialog open={showCleanup} onOpenChange={setShowCleanup}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Cleanup Old Logs
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Cleanup Activity Logs</DialogTitle>
                                    <DialogDescription>
                                        Delete activity logs older than the specified number of days. This action cannot be undone.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                    <label className="text-sm font-medium text-gray-700">
                                        Delete logs older than (days)
                                    </label>
                                    <Input
                                        type="number"
                                        min="30"
                                        value={cleanupDays}
                                        onChange={(e) => setCleanupDays(e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setShowCleanup(false)}>Cancel</Button>
                                    <Button variant="destructive" onClick={handleCleanup}>
                                        Delete Old Logs
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-50 p-2">
                                    <Activity className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Activities</p>
                                    <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-green-50 p-2">
                                    <Clock className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Today</p>
                                    <p className="text-2xl font-bold">{stats.today.toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-purple-50 p-2">
                                    <Calendar className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">This Week</p>
                                    <p className="text-2xl font-bold">{stats.this_week.toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-orange-50 p-2">
                                    <Users className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Active Users</p>
                                    <p className="text-2xl font-bold">{stats.unique_users.toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search & Filters */}
                <Card>
                    <CardContent className="p-4 space-y-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search by description, entity name, user..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Button type="submit" variant="secondary">Search</Button>
                            </form>
                            <div className="flex gap-2">
                                <Button
                                    variant={showFilters ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filters
                                    {hasActiveFilters && (
                                        <span className="ml-1 rounded-full bg-white text-gray-900 w-5 h-5 text-xs flex items-center justify-center">
                                            !
                                        </span>
                                    )}
                                </Button>
                                {hasActiveFilters && (
                                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                                        <X className="h-4 w-4 mr-1" />
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>

                        {showFilters && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t">
                                <Select
                                    value={filters.user_id || 'all'}
                                    onValueChange={(v) => applyFilters({ user_id: v === 'all' ? undefined : v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Users" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Users</SelectItem>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={String(user.id)}>
                                                {user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={filters.action || 'all'}
                                    onValueChange={(v) => applyFilters({ action: v === 'all' ? undefined : v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Actions" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Actions</SelectItem>
                                        {actions.map((action) => (
                                            <SelectItem key={action} value={action}>
                                                {action.charAt(0).toUpperCase() + action.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={filters.entity_type || 'all'}
                                    onValueChange={(v) => applyFilters({ entity_type: v === 'all' ? undefined : v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Entity Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Entity Types</SelectItem>
                                        {entityTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Input
                                    type="date"
                                    value={filters.date_from || ''}
                                    onChange={(e) => applyFilters({ date_from: e.target.value || undefined })}
                                    placeholder="From date"
                                />

                                <Input
                                    type="date"
                                    value={filters.date_to || ''}
                                    onChange={(e) => applyFilters({ date_to: e.target.value || undefined })}
                                    placeholder="To date"
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Logs Table */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                                Activity History
                                {logs.total > 0 && (
                                    <span className="text-sm font-normal text-gray-500 ml-2">
                                        Showing {logs.from}-{logs.to} of {logs.total.toLocaleString()}
                                    </span>
                                )}
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[180px]">Time</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead className="w-[100px]">Action</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Entity</TableHead>
                                    <TableHead className="w-[120px]">IP Address</TableHead>
                                    <TableHead className="w-[60px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                                            <Activity className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                            No activity logs found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.data.map((log) => (
                                        <TableRow key={log.id} className="hover:bg-gray-50">
                                            <TableCell className="text-sm">
                                                <div className="font-medium">{timeAgo(log.created_at)}</div>
                                                <div className="text-xs text-gray-400">{formatDate(log.created_at)}</div>
                                            </TableCell>
                                            <TableCell>
                                                {log.user ? (
                                                    <div>
                                                        <div className="font-medium text-sm">{log.user.name}</div>
                                                        <div className="text-xs text-gray-500">{log.user.email}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">System</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    className={actionColors[log.action] || 'bg-gray-100 text-gray-800'}
                                                >
                                                    {log.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-700 max-w-[300px] truncate">
                                                {log.description || '-'}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {log.entity_type ? (
                                                    <div>
                                                        <div className="font-medium">{formatEntityType(log.entity_type)}</div>
                                                        {log.entity_name && (
                                                            <div className="text-xs text-gray-500 truncate max-w-[150px]">
                                                                {log.entity_name}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell className="text-xs text-gray-500 font-mono">
                                                {log.ip_address || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setSelectedLog(log)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {logs.last_page > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t">
                                <div className="text-sm text-gray-500">
                                    Page {logs.current_page} of {logs.last_page}
                                </div>
                                <div className="flex gap-1">
                                    {logs.links.map((link, i) => {
                                        if (i === 0) {
                                            return (
                                                <Button
                                                    key="prev"
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                            );
                                        }
                                        if (i === logs.links.length - 1) {
                                            return (
                                                <Button
                                                    key="next"
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            );
                                        }
                                        // Show limited page numbers
                                        const pageNum = parseInt(link.label);
                                        if (
                                            isNaN(pageNum) ||
                                            Math.abs(pageNum - logs.current_page) > 2 &&
                                            pageNum !== 1 && pageNum !== logs.last_page
                                        ) {
                                            if (link.label === '...') {
                                                return <span key={i} className="px-2 py-1 text-gray-400">...</span>;
                                            }
                                            return null;
                                        }
                                        return (
                                            <Button
                                                key={i}
                                                variant={link.active ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                            >
                                                {link.label}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Detail Modal */}
            <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    {selectedLog && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Activity Detail
                                </DialogTitle>
                                <DialogDescription>
                                    {formatDate(selectedLog.created_at)}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase">User</label>
                                        <p className="text-sm font-medium">
                                            {selectedLog.user?.name || 'System'}
                                        </p>
                                        {selectedLog.user && (
                                            <p className="text-xs text-gray-500">{selectedLog.user.email}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase">Action</label>
                                        <div className="mt-1">
                                            <Badge className={actionColors[selectedLog.action] || 'bg-gray-100 text-gray-800'}>
                                                {selectedLog.action}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase">Entity Type</label>
                                        <p className="text-sm">{formatEntityType(selectedLog.entity_type)}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase">Entity</label>
                                        <p className="text-sm">
                                            {selectedLog.entity_name || '-'}
                                            {selectedLog.entity_id && (
                                                <span className="text-gray-400 ml-1">#{selectedLog.entity_id}</span>
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase">IP Address</label>
                                        <p className="text-sm font-mono">{selectedLog.ip_address || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase">Description</label>
                                        <p className="text-sm">{selectedLog.description || '-'}</p>
                                    </div>
                                </div>

                                {selectedLog.user_agent && (
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase">User Agent</label>
                                        <p className="text-xs text-gray-600 break-all mt-1">{selectedLog.user_agent}</p>
                                    </div>
                                )}

                                {/* Changes diff */}
                                {(selectedLog.old_values || selectedLog.new_values) && (
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Changes</label>
                                        <div className="rounded-lg border overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-gray-50">
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Field</th>
                                                        {selectedLog.old_values && (
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-red-500">Old Value</th>
                                                        )}
                                                        {selectedLog.new_values && (
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-green-500">New Value</th>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {Object.keys({ ...selectedLog.old_values, ...selectedLog.new_values }).map((key) => (
                                                        <tr key={key}>
                                                            <td className="px-3 py-2 font-medium text-gray-700">{key}</td>
                                                            {selectedLog.old_values && (
                                                                <td className="px-3 py-2 text-red-600 bg-red-50/50 font-mono text-xs break-all">
                                                                    {selectedLog.old_values[key] !== undefined
                                                                        ? JSON.stringify(selectedLog.old_values[key])
                                                                        : '-'}
                                                                </td>
                                                            )}
                                                            {selectedLog.new_values && (
                                                                <td className="px-3 py-2 text-green-600 bg-green-50/50 font-mono text-xs break-all">
                                                                    {selectedLog.new_values[key] !== undefined
                                                                        ? JSON.stringify(selectedLog.new_values[key])
                                                                        : '-'}
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
