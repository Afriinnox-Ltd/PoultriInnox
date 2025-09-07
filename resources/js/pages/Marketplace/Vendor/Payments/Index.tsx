import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    DollarSign,
    TrendingUp,
    Clock,
    CheckCircle,
    ShoppingCart,
    Eye,
    AlertCircle,
    Calendar
} from 'lucide-react';

interface Payment {
    id: number;
    transaction_id: string;
    amount: number;
    platform_commission: number;
    vendor_amount: number;
    payment_method: string;
    vendor_paid: boolean;
    vendor_paid_at: string | null;
    created_at: string;
    order: {
        id: number;
        order_number: string;
        user: {
            name: string;
            email: string;
        };
    };
}

interface Order {
    id: number;
    order_number: string;
    total_amount: number;
    status: string;
    shipping_status: string;
    created_at: string;
    user: {
        name: string;
        email: string;
    };
    payment: Payment | null;
    items: Array<{
        id: number;
        quantity: number;
        price: number;
        product: {
            id: number;
            name: string;
            slug: string;
        };
    }>;
}

interface Stats {
    total_earnings: number;
    pending_payouts: number;
    completed_payouts: number;
    total_orders: number;
    paid_orders: number;
}

interface VendorPaymentsProps {
    orders: {
        data: Order[];
        links: any[];
        meta: any;
    };
    stats: Stats;
    recentPayments: Payment[];
    filters: {
        payment_status?: string;
    };
}

export default function VendorPayments({ orders, stats, recentPayments, filters }: VendorPaymentsProps) {
    return (
        <AppLayout>
            <Head title="Payments & Earnings" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Payments & Earnings</h2>
                        <p className="text-muted-foreground">
                            Track your earnings and payment history
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/marketplace/vendor/payments/analytics">
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Analytics
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${stats.total_earnings.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">
                                From {stats.paid_orders} paid orders
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${stats.pending_payouts.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">
                                Awaiting payout processing
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed Payouts</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${stats.completed_payouts.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">
                                Successfully paid out
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_orders}</div>
                            <p className="text-xs text-muted-foreground">
                                All time orders
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Payment Rate</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_orders > 0 ? Math.round((stats.paid_orders / stats.total_orders) * 100) : 0}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Orders with payment
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Actions */}
                <div className="flex gap-2">
                    <Button
                        variant={!filters.payment_status ? 'default' : 'outline'}
                        size="sm"
                        asChild
                    >
                        <Link href="/marketplace/vendor/payments">All Orders</Link>
                    </Button>
                    <Button
                        variant={filters.payment_status === 'paid' ? 'default' : 'outline'}
                        size="sm"
                        asChild
                    >
                        <Link href="/marketplace/vendor/payments?payment_status=paid">Paid Orders</Link>
                    </Button>
                    <Button
                        variant={filters.payment_status === 'unpaid' ? 'default' : 'outline'}
                        size="sm"
                        asChild
                    >
                        <Link href="/marketplace/vendor/payments?payment_status=unpaid">Unpaid Orders</Link>
                    </Button>
                </div>

                {/* Orders and Payments Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Order Payment History</CardTitle>
                        <CardDescription>
                            Track payment status for all your orders
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {orders.data.length > 0 ? (
                                orders.data.map((order) => (
                                    <div key={order.id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">#{order.order_number}</span>
                                                    <Badge variant={order.payment ? 'default' : 'secondary'}>
                                                        {order.payment ? 'Paid' : 'Unpaid'}
                                                    </Badge>
                                                    <Badge
                                                        variant={
                                                            order.status === 'delivered' ? 'default' :
                                                            order.status === 'pending' ? 'secondary' :
                                                            order.status === 'cancelled' ? 'destructive' : 'outline'
                                                        }
                                                    >
                                                        {order.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Customer: {order.user.name} • {new Date(order.created_at).toLocaleDateString()}
                                                </p>
                                                <p className="text-sm">
                                                    {order.items.length} item(s) • Total: ${order.total_amount}
                                                </p>
                                            </div>
                                            <div className="text-right space-y-1">
                                                {order.payment ? (
                                                    <div>
                                                        <p className="font-medium text-green-600">
                                                            ${order.payment.vendor_amount.toFixed(2)}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Your earnings
                                                        </p>
                                                        {order.payment.vendor_paid ? (
                                                            <Badge variant="default" className="text-xs">
                                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                                Paid Out
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary" className="text-xs">
                                                                <Clock className="h-3 w-3 mr-1" />
                                                                Pending Payout
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="text-muted-foreground">
                                                            ${(order.total_amount * 0.9).toFixed(2)}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Expected earnings
                                                        </p>
                                                        <Badge variant="outline" className="text-xs">
                                                            <AlertCircle className="h-3 w-3 mr-1" />
                                                            Payment Pending
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {order.payment && (
                                            <div className="mt-3 pt-3 border-t">
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-muted-foreground">Transaction ID</p>
                                                        <p className="font-mono text-xs">{order.payment.transaction_id}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Payment Method</p>
                                                        <p className="capitalize">{order.payment.payment_method}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Platform Commission</p>
                                                        <p>${order.payment.platform_commission.toFixed(2)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Payment Date</p>
                                                        <p>{new Date(order.payment.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="font-semibold mb-2">No orders found</h3>
                                    <p className="text-muted-foreground">
                                        {filters.payment_status ?
                                            `No ${filters.payment_status} orders to display.` :
                                            'You haven\'t received any orders yet.'
                                        }
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {orders.meta.last_page > 1 && (
                            <div className="mt-6 flex justify-center">
                                <div className="flex gap-2">
                                    {orders.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            asChild={!!link.url}
                                            disabled={!link.url}
                                        >
                                            {link.url ? (
                                                <Link href={link.url}>
                                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                                </Link>
                                            ) : (
                                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                            )}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
