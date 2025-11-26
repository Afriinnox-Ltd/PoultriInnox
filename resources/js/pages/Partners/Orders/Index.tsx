import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Plus, Eye, Clock, CheckCircle, Truck, XCircle, AlertTriangle } from 'lucide-react';
import { router } from '@inertiajs/react';
import PartnerLayout from '@/layouts/partner-layout';

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    unit: string;
}

interface PartnerOrder {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    total_amount: string | null;
    currency: string;
    description: string | null;
    requested_delivery_date: string | null;
    payment_due_date: string | null;
    payment_reminder_days: number | null;
    created_at: string;
    items: OrderItem[];
}

interface Props {
    orders: {
        data: PartnerOrder[];
        meta: { total: number; current_page: number; last_page: number };
        links: any[];
    };
    profile: { business_name: string; partner_type: string; is_verified: boolean };
    filters: { status?: string };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    pending: { label: 'Pending', color: 'bg-emerald-100 text-emerald-800',  icon: <Clock className="w-3 h-3" /> },
    reviewing: { label: 'Reviewing', color: 'bg-emerald-100 text-emerald-800',     icon: <Clock className="w-3 h-3" /> },
    confirmed: { label: 'Confirmed', color: 'bg-emerald-100 text-emerald-800', icon: <CheckCircle className="w-3 h-3" /> },
    processing: { label: 'Processing', color: 'bg-emerald-100 text-emerald-800', icon: <Package className="w-3 h-3" /> },
    shipped: { label: 'Shipped', color: 'bg-emerald-100 text-cyan-800',     icon: <Truck className="w-3 h-3" /> },
    delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-800',   icon: <CheckCircle className="w-3 h-3" /> },
    cancelled: { label: 'Cancelled', color: 'bg-emerald-100 text-emerald-800',       icon: <XCircle className="w-3 h-3" /> },
};

const PAYMENT_CONFIG: Record<string, string> = {
    pending: 'bg-emerald-100 text-emerald-800',
    partial: 'bg-emerald-100 text-emerald-800',
    paid:    'bg-emerald-100 text-emerald-800',
    refunded:'bg-emerald-100 text-emerald-800',
};

export default function PartnerOrdersIndex({ orders, profile, filters }: Props) {
    const handleStatusFilter = (value: string) => {
        router.get('/partner/orders', { status: value === 'all' ? '' : value }, { preserveState: true });
    };

    return (
          <PartnerLayout profile={profile}>
            <Head title="My Orders" />
            <div className="max-w-5xl mx-auto py-8 px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {profile.business_name} · <span className="capitalize">{profile.partner_type}</span>
                            {profile.is_verified && (
                                <span className="ml-2 text-green-600 font-medium">✓ Verified</span>
                            )}
                        </p>
                    </div>
                    <Link href="/partner/orders/create">
                        <Button className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Place New Order
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 mb-5">
                    <Select onValueChange={handleStatusFilter} defaultValue={filters.status || 'all'}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-500">{orders.meta?.total ?? 0} order(s)</span>
                </div>

                {/* Orders List */}
                {orders.data.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No orders yet.</p>
                            <Link href="/partner/orders/create">
                                <Button variant="outline" className="mt-4">Place Your First Order</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {orders.data.map(order => {
                            const statusCfg = STATUS_CONFIG[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-700', icon: null };
                            return (
                                <Card key={order.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-5">
                                        <Link href={`/partner/orders/${order.id}`}  className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-semibold text-gray-900">{order.order_number}</span>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.color}`}>
                                                        {statusCfg.icon} {statusCfg.label}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_CONFIG[order.payment_status]}`}>
                                                        {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                                    </span>
                                                    {/* Overdue badge */}
                                                    {order.payment_due_date && order.payment_status !== 'paid' && (() => {
                                                        const due = new Date(order.payment_due_date);
                                                        const today = new Date();
                                                        today.setHours(0,0,0,0);
                                                        return due < today ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                                <AlertTriangle className="w-3 h-3" /> Overdue
                                                            </span>
                                                        ) : null;
                                                    })()}
                                                </div> 
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {order.items.length} item(s)
                                                    {order.requested_delivery_date && ` · Requested: ${new Date(order.requested_delivery_date).toLocaleDateString()}`}
                                                </p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                {order.total_amount ? (
                                                    <p className="font-semibold text-gray-900">
                                                        {order.currency} {Number(order.total_amount).toLocaleString()}
                                                    </p>
                                                ) : (
                                                    <span className="text-gray-400">To Be Determined</span>
                                                )}
                                                <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                                              
                                                    <Button variant="outline" size="sm" className="mt-2 flex items-center gap-1">
                                                        <Eye className="w-3 h-3" /> View
                                                    </Button>
                                                
                                            </div>
                                        </Link>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {orders?.meta?.last_page > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        {Array.from({ length: orders?.meta?.last_page }, (_, i) => i + 1).map(page => (
                            <Button
                                key={page}
                                variant={page === orders?.meta?.current_page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => router.get('/partner/orders', { ...filters, page }, { preserveState: true })}
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </PartnerLayout>
    );
}
