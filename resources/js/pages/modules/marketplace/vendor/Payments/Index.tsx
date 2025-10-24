import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DollarSign,
    Clock,
    CheckCircle,
    Calendar,
    Wallet
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
        deliveryConfirmation?: {
            confirmed: boolean;
            confirmed_at: string;
        };
    };
}

interface Stats {
    available_earnings: number;
    pending_payouts: number;
    total_payouts: number;
    can_request_payout: boolean;
}

interface VendorPaymentsProps {
    stats: Stats;
    payoutRequests: {
        data: Payment[];
        links?: any[];
        meta?: any;
    };
    minPayoutAmount: number;
    marketplaceSettings: any;
}

export default function VendorPayments({ stats, payoutRequests, minPayoutAmount, marketplaceSettings }: VendorPaymentsProps) {
    const safeStats = stats || {
        available_earnings: 0,
        pending_payouts: 0,
        total_payouts: 0,
        can_request_payout: false
    };
    const safePayoutRequests = payoutRequests || { data: [], links: [], meta: {} };

    const handleRequestPayout = () => {
        if (confirm(`Request payout for ${formatCurrency(safeStats.available_earnings)}?`)) {
            router.post('/marketplace/vendor/payments/request-payout', {}, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Payments & Earnings" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between p-6 items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Payments & Earnings</h2>
                        <p className="text-muted-foreground">
                            Manage your payout requests and track earnings
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(safeStats.total_payouts)}</div>
                            <p className="text-xs text-muted-foreground">
                                Successfully paid out to you
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(safeStats.pending_payouts)}</div>
                            <p className="text-xs text-muted-foreground">
                                Awaiting payout processing
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Available Earnings</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(safeStats.available_earnings)}</div>
                            <p className="text-xs text-muted-foreground">
                                Ready to request payout
                            </p>
                            <Button
                                onClick={handleRequestPayout}
                                disabled={!safeStats.can_request_payout}
                                className="mt-4 w-full"
                                size="sm"
                            >
                                <DollarSign className="h-4 w-4 mr-2" />
                                Request Payout
                            </Button>
                            {!safeStats.can_request_payout && (
                                <p className="text-xs text-muted-foreground mt-2">
                                    Minimum: {formatCurrency(minPayoutAmount)}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Payout Requests Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payout Request History</CardTitle>
                        <CardDescription>
                            Track all your payout requests and their status
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {safePayoutRequests?.data && safePayoutRequests.data.length > 0 ? (
                                safePayoutRequests.data.map((payment) => (
                                    <div key={payment.id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">#{payment.order.order_number}</span>
                                                    {payment.vendor_paid ? (
                                                        <Badge variant="default" className="bg-emerald-600">
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            Paid Out
                                                        </Badge>
                                                    ) : payment.payout_requested ? (
                                                        <Badge variant="secondary">
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            Pending
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline">
                                                            Available
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Customer: {payment.order.user.name}
                                                </p>
                                                {payment.order.deliveryConfirmation?.confirmed && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Delivery confirmed: {new Date(payment.order.deliveryConfirmation.confirmed_at).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right space-y-1">
                                                <p className="font-medium text-emerald-600">
                                                    {formatCurrency(payment.vendor_amount)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Your earnings
                                                </p>
                                                {payment.vendor_paid && payment.vendor_paid_at && (
                                                    <p className="text-xs text-muted-foreground">
                                                        <Calendar className="h-3 w-3 inline mr-1" />
                                                        {new Date(payment.vendor_paid_at).toLocaleDateString()}
                                                    </p>
                                                )}
                                                {!payment.vendor_paid && payment.payout_requested_at && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Requested: {new Date(payment.payout_requested_at).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-3 pt-3 border-t">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground">Transaction ID</p>
                                                    <p className="font-mono text-xs">{payment.transaction_id}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Payment Method</p>
                                                    <p className="capitalize">{payment.payment_method}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Platform Commission</p>
                                                    <p>{formatCurrency(payment.platform_commission)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Payment Date</p>
                                                    <p>{new Date(payment.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="font-semibold mb-2">No payout requests yet</h3>
                                    <p className="text-muted-foreground">
                                        Your payout requests will appear here once you request them.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {safePayoutRequests?.meta?.last_page && safePayoutRequests.meta.last_page > 1 && (
                            <div className="mt-6 flex justify-center">
                                <div className="flex gap-2">
                                    {safePayoutRequests.links?.map((link, index) => (
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
