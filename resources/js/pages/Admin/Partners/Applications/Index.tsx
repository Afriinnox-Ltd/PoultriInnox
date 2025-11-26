import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardList, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Application {
    id: number;
    business_name: string;
    partner_type: string;
    contact_person: string;
    email: string;
    phone: string | null;
    city: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

interface Props {
    applications: {
        data: Application[];
        meta?: { total: number; current_page: number; last_page: number };
    };
    filters: { search?: string; status?: string };
    counts: { pending: number; approved: number; rejected: number };
}

const STATUS_CFG = {
    pending:  { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-3 h-3" />,       label: 'Pending' },
    approved: { color: 'bg-green-100 text-green-800',  icon: <CheckCircle className="w-3 h-3" />, label: 'Approved' },
    rejected: { color: 'bg-red-100 text-red-800',      icon: <XCircle className="w-3 h-3" />,     label: 'Rejected' },
};

export default function AdminApplicationsIndex({ applications, filters, counts }: Props) {
    const [search, setSearch] = React.useState(filters.search ?? '');

    const applyFilter = (extra: object) =>
        router.get('/admin/partners/applications', { search, ...filters, ...extra }, { preserveState: true });

    return (
        <AdminLayout>
            <Head title="Partner Applications" />
            <div className="py-6 px-6 max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Partner Applications</h1>
                        <p className="text-sm text-gray-500 mt-1">Review and approve business partner applications</p>
                    </div>
                    <Link href="/admin/partners">
                        <Button variant="outline" size="sm">← All Partners</Button>
                    </Link>
                </div>

                {/* Counts */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                        { label: 'Pending', value: counts.pending,  color: 'text-yellow-600', bg: 'bg-yellow-50', status: 'pending' },
                        { label: 'Approved', value: counts.approved, color: 'text-green-600',  bg: 'bg-green-50',  status: 'approved' },
                        { label: 'Rejected', value: counts.rejected, color: 'text-red-600',    bg: 'bg-red-50',    status: 'rejected' },
                    ].map(({ label, value, color, bg, status }) => (
                        <button
                            key={status}
                            onClick={() => applyFilter({ status: filters.status === status ? '' : status })}
                            className={`rounded-xl border p-4 text-left transition-all ${filters.status === status ? 'ring-2 ring-offset-1 ring-gray-400' : 'hover:shadow-sm'} ${bg}`}
                        >
                            <p className={`text-2xl font-bold ${color}`}>{value}</p>
                            <p className="text-sm text-gray-600">{label}</p>
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <Card className="mb-5">
                    <CardContent className="pt-4">
                        <form
                            onSubmit={e => { e.preventDefault(); applyFilter({ search }); }}
                            className="flex gap-3"
                        >
                            <Input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search name, email..."
                                className="flex-1"
                            />
                            <Select
                                value={filters.status ?? 'all'}
                                onValueChange={v => applyFilter({ status: v === 'all' ? '' : v })}
                            >
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button type="submit">Search</Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Business</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Applied</th>
                                        <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                                        <th className="text-right px-4 py-3 font-medium text-gray-600">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {applications.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-12 text-gray-400">
                                                <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                                No applications found.
                                            </td>
                                        </tr>
                                    ) : applications.data.map(app => {
                                        const cfg = STATUS_CFG[app.status];
                                        return (
                                            <tr key={app.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-gray-900">{app.business_name}</p>
                                                    <p className="text-xs text-gray-400">{app.email}</p>
                                                </td>
                                                <td className="px-4 py-3 capitalize text-gray-600">{app.partner_type}</td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    <p>{app.contact_person}</p>
                                                    <p className="text-xs text-gray-400">{app.phone}</p>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 text-xs">
                                                    {new Date(app.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                                                        {cfg.icon} {cfg.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Link href={`/admin/partners/applications/${app.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="w-3 h-3 mr-1" /> Review
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {(applications.meta?.last_page ?? 1) > 1 && (
                    <div className="flex justify-center gap-2 mt-5">
                        {Array.from({ length: applications.meta?.last_page ?? 1 }, (_, i) => i + 1).map(page => (
                            <Button
                                key={page}
                                variant={page === (applications.meta?.current_page ?? 1) ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => router.get('/admin/partners/applications', { ...filters, page }, { preserveState: true })}
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
