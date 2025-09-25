import React, { useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'; 
import {
    DollarSign,
    TrendingUp,
    Clock,
    CheckCircle,
    ShoppingCart, 
    AlertCircle, 
    Calculator, 
    Info,
    CreditCard,
    Package
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface Payment {
    id: number;
    transaction_id: string;
    amount: number;
    platform_commission: number;
    vendor_amount: number;
    payment_method: string;
    vendor_paid: boolean;
    vendor_paid_at: string | null;
    payout_requested: boolean;
    payout_requested_at: string | null;
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
    delivered_at: string;
    vendor_confirmed: boolean;
    vendor_confirmed_at: string | null;
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
    available_earnings: number;
    pending_confirmations: number;
    pending_payout_amount: number;
    total_paid_out: number;
    can_request_payout: boolean;
    orders_awaiting_confirmation: number;
}

interface VendorPaymentsProps {
    stats: Stats;
    ordersAwaitingConfirmation: Order[];
    pendingPayouts: Payment[];
    completedPayouts: Payment[];
    marketplaceSettings: {
        commission: {
            default_commission_rate: number;
            commission_type: 'percentage' | 'fixed';
        };
        fees: {
            platform_fee_rate: number;
            transaction_fee_rate: number;
        };
        general: {
            currency_symbol: string;
        };
        payout: {
            min_payout_amount: number;
            payment_hold_days: number;
            auto_payout_enabled: boolean;
        };
    };
    minPayoutAmount: number;
}

export default function VendorPayouts({ 
    stats, 
    ordersAwaitingConfirmation, 
    pendingPayouts, 
    completedPayouts, 
    marketplaceSettings,
    minPayoutAmount 
}: VendorPaymentsProps) {
    const { post, processing } = useForm();

    const handleRemindBuyerConfirmation = (orderId: number) => {
        post(`/marketplace/vendor/payments/remind-buyer/${orderId}`, {
            preserveScroll: true,
        });
    };

    const handleRequestPayout = () => {
        post('/marketplace/vendor/payments/request-payout', {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Payouts & Earnings" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Payouts & Earnings</h2>
                        <p className="text-muted-foreground">
                            Confirm deliveries and request payouts
                        </p>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Available Earnings</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">
                                {formatCurrency(stats.available_earnings)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Ready for payout
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Awaiting Buyer Confirmation</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">
                                {stats.pending_confirmations}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Orders delivered, awaiting buyer confirmation
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {formatCurrency(stats.pending_payout_amount)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Being processed
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Paid Out</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.total_paid_out)}</div>
                            <p className="text-xs text-muted-foreground">
                                All time payouts
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Payout Request Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <CreditCard className="h-5 w-5 mr-2" />
                            Request Payout
                        </CardTitle>
                        <CardDescription>
                            Request payout for your confirmed earnings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h3 className="font-medium">Available for Payout</h3>
                                    <p className="text-2xl font-bold text-emerald-600">
                                        {formatCurrency(stats.available_earnings)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Minimum payout: {formatCurrency(minPayoutAmount)}
                                    </p>
                                </div>
                                <div>
                                    <Button 
                                        onClick={handleRequestPayout}
                                        disabled={!stats.can_request_payout || processing}
                                        size="lg"
                                    >
                                        {processing ? 'Processing...' : 'Request Payout'}
                                    </Button>
                                    {!stats.can_request_payout && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Need {formatCurrency(minPayoutAmount - stats.available_earnings)} more to request payout
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-blue-50 p-4 rounded-lg">
                                <div>
                                    <span className="text-muted-foreground">Processing Time:</span>
                                    <span className="ml-2 font-medium">{marketplaceSettings.payout.payment_hold_days} business days</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Auto Payout:</span>
                                    <Badge variant={marketplaceSettings.payout.auto_payout_enabled ? 'default' : 'secondary'} className="ml-2">
                                        {marketplaceSettings.payout.auto_payout_enabled ? 'Enabled' : 'Manual'}
                                    </Badge>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Currency:</span>
                                    <span className="ml-2 font-medium">{marketplaceSettings.general.currency_symbol}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Orders Awaiting Buyer Confirmation */}
                {ordersAwaitingConfirmation.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Orders Awaiting Buyer Confirmation</CardTitle>
                            <CardDescription>
                                These orders have been delivered but buyers haven't confirmed delivery yet. Earnings will be available for payout once buyers confirm.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {ordersAwaitingConfirmation.map((order) => (
                                    <div key={order.id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">#{order.order_number}</span>
                                                    <Badge variant="secondary">Delivered</Badge>
                                                    <Badge variant="outline">Awaiting Buyer Confirmation</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Customer: {order.user.name} • Delivered: {new Date(order.delivered_at).toLocaleDateString()}
                                                </p>
                                                <p className="text-sm">
                                                    {order.items.length} item(s) • Total: {formatCurrency(order.total_amount)}
                                                </p>
                                                {order.payment && (
                                                    <p className="text-sm font-medium text-emerald-600">
                                                        Your earnings: {formatCurrency(order.payment.vendor_amount)}
                                                    </p>
                                                )}
                                                <p className="text-xs text-muted-foreground">
                                                    💡 Buyer will receive automatic reminders to confirm delivery
                                                </p>
                                            </div>
                                            <div>
                                                <Button 
                                                    onClick={() => handleRemindBuyerConfirmation(order.id)}
                                                    disabled={processing}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    {processing ? 'Sending...' : 'Send Reminder'}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Pending Payouts */}
                {pendingPayouts.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Payouts</CardTitle>
                            <CardDescription>
                                Payouts currently being processed
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {pendingPayouts.map((payment) => (
                                    <div key={payment.id} className="border rounded-lg p-4 bg-blue-50">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">#{payment.order.order_number}</span>
                                                    <Badge variant="default">Processing</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Requested: {new Date(payment.payout_requested_at!).toLocaleDateString()}
                                                </p>
                                                <p className="text-sm font-medium text-blue-600">
                                                    Amount: {formatCurrency(payment.vendor_amount)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <Clock className="h-5 w-5 text-blue-500 mx-auto" />
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Processing
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Completed Payouts History */}
                {completedPayouts.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Payouts</CardTitle>
                            <CardDescription>
                                Your recent completed payouts
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {completedPayouts.map((payment) => (
                                    <div key={payment.id} className="border rounded-lg p-4 bg-emerald-50">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">#{payment.order.order_number}</span>
                                                    <Badge variant="default" className="bg-emerald-600">Completed</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Paid: {new Date(payment.vendor_paid_at!).toLocaleDateString()}
                                                </p>
                                                <p className="text-sm font-medium text-emerald-600">
                                                    Amount: {formatCurrency(payment.vendor_amount)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" />
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Completed
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Empty State */}
                {ordersAwaitingConfirmation.length === 0 && pendingPayouts.length === 0 && completedPayouts.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-8">
                            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="font-semibold mb-2">No payout activity yet</h3>
                            <p className="text-muted-foreground">
                                Complete some orders and once buyers confirm delivery, they will appear here for payout.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
