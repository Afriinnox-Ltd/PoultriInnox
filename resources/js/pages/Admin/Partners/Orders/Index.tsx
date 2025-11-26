import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, ClipboardList, Package, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

interface PartnerOrder {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    total_amount: string | null;
    currency: string;
    created_at: string;
    items: { id: number }[];
    partner: {
        id: number;
        business_name: string;
        partner_type: string;
        user: { email: string };
    };
}

interface Stats {
    total: number;
    pending: number;
    processing: number;
    delivered: number;
    unpaid: number;
}

interface Props {
    orders: {
        data: PartnerOrder[];
        meta: { total: number; current_page: number; last_page: number };
    };
    stats: Stats;
    filters: { search?: string; status?: string; payment_status?: string };
}

const STATUS_COLORS: Record<string, string> = {
    pending:    'bg-emerald-100 text-emerald-800',
    reviewing:  'bg-emerald-100 text-emerald-800',
    confirmed:  'bg-emerald-100 text-emerald-800',
    processing: 'bg-emerald-100 text-emerald-800',
    shipped:    'bg-emerald-100 text-emerald-800',
    delivered:  'bg-emerald-100 text-emerald-800',
    cancelled:  'bg-red-100 text-red-800',
};

const PAYMENT_COLORS: Record<string, string> = {
    pending: 'bg-emerald-100 text-emerald-800',
    partial: 'bg-emerald-100 text-emerald-800',
    paid:    'bg-emerald-100 text-emerald-800',
    refunded:'bg-emerald-100 text-emerald-800',
};

export default function AdminPartnerOrdersIndex({ orders, stats, filters }: Props) {
    const [search, setSearch] = React.useState(filters.search ?? '');

    const applyFilter = (extra: object) => {
        router.get('/admin/partners/orders', { search, ...filters, ...extra }, { preserveState: true });
    };

    return (
        <AdminLayout>
            <Head title="Partner Orders" />
            <div className="py-6 px-6 max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Partner Orders</h1>
                        <p className="text-sm text-gray-500 mt-1">Custom orders from hotels, restaurants & caterers</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/admin/partners">
                            <Button variant="outline" size="sm">View Partners</Button>
                        </Link>
                        {/* <Link href="/admin/partners/vendor-payouts">
                            <Button variant="outline" size="sm">Vendor Payouts</Button>
                        </Link> */}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    {[
                        { label: 'Total', value: stats.total, icon: <ClipboardList className="w-5 h-5 text-emerald-500" />, color: 'border-emerald-200' },
                        { label: 'Pending', value: stats.pending, icon: <AlertCircle className="w-5 h-5 text-emerald-500" />, color: 'border-emerald-200' },
                        { label: 'Processing', value: stats.processing, icon: <Package className="w-5 h-5 text-emerald-500" />, color: 'border-emerald-200' },
                        { label: 'Delivered', value: stats.delivered, icon: <CheckCircle className="w-5 h-5 text-emerald-500" />, color: 'border-emerald-200' },
                        { label: 'Unpaid', value: stats.unpaid, icon: <DollarSign className="w-5 h-5 text-emerald-500" />, color: 'border-emerald-200' },
                    ].map(s => (
                        <Card key={s.label} className={`border ${s.color}`}>
                            <CardContent className="pt-4 pb-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">{s.label}</span>
                                    {s.icon}
                                </div>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <Card className="mb-5">
                    <CardContent className="pt-4">
                        <form onSubmit={e => { e.preventDefault(); applyFilter({ search }); }} className="flex gap-3 flex-wrap">
                            <Input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search by order # or partner name..."
                                className="flex-1 min-w-52"
                            />
                            <Select value={filters.status ?? 'all'} onValueChange={v => applyFilter({ status: v === 'all' ? '' : v })}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    {['pending', 'reviewing', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={filters.payment_status ?? 'all'} onValueChange={v => applyFilter({ payment_status: v === 'all' ? '' : v })}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Payment" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Payments</SelectItem>
                                    {['pending', 'partial', 'paid', 'refunded'].map(s => (
                                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button type="submit">Search</Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Orders table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Order #</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Partner</th>
                                        <th className="text-center px-4 py-3 font-medium text-gray-600">Items</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Payment</th>
                                        <th className="text-right px-4 py-3 font-medium text-gray-600">Amount</th>
                                        <th className="text-right px-4 py-3 font-medium text-gray-600">Date</th>
                                        <th className="text-right px-4 py-3 font-medium text-gray-600"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {orders.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="text-center py-10 text-gray-400">
                                                <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                                No partner orders found.
                                            </td>
                                        </tr>
                                    ) : orders.data.map(order => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium">{order.order_number}</td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-900">{order.partner.business_name}</p>
                                                <p className="text-xs text-gray-500 capitalize">{order.partner.partner_type}</p>
                                            </td>
                                            <td className="px-4 py-3 text-center">{order.items.length}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${PAYMENT_COLORS[order.payment_status] ?? 'bg-gray-100 text-gray-700'}`}>
                                                    {order.payment_status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {order.total_amount
                                                    ? `${order.currency} ${Number(order.total_amount).toLocaleString()}`
                                                    : <span className="text-gray-400">To Be Determined</span>}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-500">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Link href={`/admin/partners/orders/${order.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="w-3 h-3 mr-1" /> Manage
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {orders.meta?.last_page > 1 && (
                    <div className="flex justify-center gap-2 mt-5">
                        {Array.from({ length: orders.meta?.last_page ?? 0 }, (_, i) => i + 1).map(page => (
                            <Button
                                key={page}
                                variant={page === orders.meta?.current_page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => router.get('/admin/partners/orders', { ...filters, page }, { preserveState: true })}
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
