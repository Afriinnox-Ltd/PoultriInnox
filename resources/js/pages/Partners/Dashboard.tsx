import React from 'react';
import { Head, Link } from '@inertiajs/react';
import PartnerLayout from '@/layouts/partner-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ShoppingBag,
    Clock,
    Truck,
    CheckCircle,
    AlertCircle,
    Plus,
    ArrowRight,
    Package,
    CreditCard,
    AlertTriangle,
} from 'lucide-react';

interface OrderItem { id: number; product_name: string; quantity: number; unit: string }

interface RecentOrder {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    total_amount: string | null;
    currency: string;
    created_at: string;
    items: OrderItem[];
}

interface Stats {
    total: number;
    pending: number;
    active: number;
    delivered: number;
    unpaid: number;
    pending_amount: number;
    overdue: number;
}

interface Props {
    profile: {
        business_name: string;
        partner_type: string;
        is_verified: boolean;
        is_active: boolean;
        city: string | null;
        country: string | null;
    };
    recentOrders: RecentOrder[];
    stats: Stats;
}

const STATUS_COLOR: Record<string, string> = {
    pending:    'bg-yellow-100 text-yellow-700',
    reviewing:  'bg-blue-100 text-blue-700',
    confirmed:  'bg-indigo-100 text-indigo-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped:    'bg-cyan-100 text-cyan-700',
    delivered:  'bg-emerald-100 text-emerald-700',
    cancelled:  'bg-red-100 text-red-700',
};

export default function PartnerDashboard({ profile, recentOrders, stats }: Props) {
    const statCards = [
        { label: 'Total Orders', value: stats.total, icon: ShoppingBag, color: 'text-emerald-600',   bg: 'bg-emerald-50' },
        { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'In Progress', value: stats.active, icon: Truck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Delivered',        value: stats.delivered, icon: CheckCircle,   color: 'text-emerald-600',  bg: 'bg-emerald-50' },
        { label: 'Awaiting Payment', value: stats.unpaid, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];

    return (
        <PartnerLayout profile={profile}>
            <Head title="Partner Dashboard" />

            {/* Welcome */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome, {profile.business_name}
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5 capitalize">
                        {profile.partner_type}
                        {profile.city && ` · ${profile.city}`}
                        {!profile.is_verified && (
                            <span className="ml-2 text-yellow-600 font-medium">
                                <AlertCircle className="w-3 h-3 inline mr-0.5" /> Pending verification
                            </span>
                        )}
                    </p>
                </div>
                <Link href="/partner/orders/create">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Place New Order
                    </Button>
                </Link>
            </div>

            {/* Outstanding balance banner */}
            {stats.pending_amount > 0 && (
                <div className={`mb-6 rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    stats.overdue > 0
                        ? 'bg-red-50 border-red-200'
                        : 'bg-amber-50 border-amber-200'
                }`}>
                    <div className="flex items-start gap-3">
                        {stats.overdue > 0
                            ? <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            : <CreditCard className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        }
                        <div>
                            <p className={`font-semibold text-sm ${ stats.overdue > 0 ? 'text-red-700' : 'text-amber-800' }`}>
                                {stats.overdue > 0
                                    ? `You have ${stats.overdue} overdue payment${stats.overdue !== 1 ? 's' : ''}`
                                    : 'Outstanding Balance'}
                            </p>
                            <p className={`text-xs mt-0.5 ${ stats.overdue > 0 ? 'text-red-600' : 'text-amber-700' }`}>
                                Total unpaid across {stats.unpaid} order{stats.unpaid !== 1 ? 's' : ''}.
                                {stats.overdue > 0 && ' Please settle overdue payments promptly.'}
                            </p>
                        </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                        <p className={`text-2xl font-bold ${ stats.overdue > 0 ? 'text-red-700' : 'text-amber-800' }`}>
                            RWF {stats.pending_amount.toLocaleString()}
                        </p>
                        <Link href="/partner/orders?status=" className={`text-xs underline ${ stats.overdue > 0 ? 'text-red-600' : 'text-amber-700' }`}>
                            View orders
                        </Link>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {statCards.map(({ label, value, icon: Icon, color, bg }) => (
                    <Card key={label}>
                        <CardContent className="p-4">
                            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-2`}>
                                <Icon className={`w-5 h-5 ${color}`} />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{value}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">Recent Orders</CardTitle>
                                <Link href="/partner/orders" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                                    View all <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {recentOrders.length === 0 ? (
                                <div className="py-12 text-center text-gray-400">
                                    <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No orders yet.</p>
                                    <Link href="/partner/orders/create">
                                        <Button variant="outline" size="sm" className="mt-3">Place your first order</Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {recentOrders.map(order => (
                                        <Link
                                            key={order.id}
                                            href={`/partner/orders/${order.id}`}
                                            className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">{order.order_number}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {order.items.length} item(s) · {new Date(order.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {order.total_amount ? (
                                                    <span className="text-sm font-semibold text-gray-700">

                                                        {order.currency} {Number(order.total_amount).toLocaleString()}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">To Be Determined</span>
                                                )}
                                                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick links */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Link href="/partner/orders/create" className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors">
                                <Plus className="w-4 h-4 text-emerald-700" />
                                <span className="text-sm font-medium text-emerald-800">Place a New Order</span>
                            </Link>
                            <Link href="/partner/orders" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border">
                                <ShoppingBag className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-700">View All Orders</span>
                            </Link>
                            <Link href="/partner/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border">
                                <CheckCircle className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-700">Update Profile</span>
                            </Link>
                            <Link href="/store" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border">
                                <Package className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-700">Browse Marketplace</span>
                            </Link>
                        </CardContent>
                    </Card>

                    {!profile.is_verified && (
                        <Card className="border-yellow-200 bg-yellow-50">
                            <CardContent className="p-4">
                                <div className="flex gap-2">
                                    <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-yellow-800">Verification Pending</p>
                                        <p className="text-xs text-yellow-700 mt-1">
                                            Your account is under review. You can already place orders; they will be processed once verified.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </PartnerLayout>
    );
}
