import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DollarSign,
    TrendingUp,
    Package,
    ArrowLeft,
    Calendar,
    CreditCard
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface MonthlyEarning {
    month: string;
    total_amount: number;
    total_payments: number;
}

interface PaymentMethod {
    payment_method: string;
    total_amount: number;
    count: number;
}

interface TopProduct {
    product: {
        id: number;
        name: string;
        slug: string;
    };
    total_revenue: number;
    total_quantity: number;
}

interface VendorPaymentAnalyticsProps {
    monthlyEarnings: MonthlyEarning[];
    paymentMethods: PaymentMethod[];
    topProducts: TopProduct[];
}

export default function VendorPaymentAnalytics({
    monthlyEarnings,
    paymentMethods,
    topProducts
}: VendorPaymentAnalyticsProps) {
    const totalRevenue = monthlyEarnings.reduce((sum, earning) => sum + earning.total_amount, 0);
    const totalPayments = monthlyEarnings.reduce((sum, earning) => sum + earning.total_payments, 0);
    const averageMonthly = monthlyEarnings.length > 0 ? totalRevenue / monthlyEarnings.length : 0;

    // Format month names
    const formatMonth = (monthStr: string) => {
        const [year, month] = monthStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    return (
        <AppLayout>
            <Head title="Payment Analytics" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between p-6 items-center">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/marketplace/vendor/payments">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Payments
                            </Link>
                        </Button>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Payment Analytics</h2>
                            <p className="text-muted-foreground">
                                Detailed insights into your earnings and payment trends
                            </p>
                        </div>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue (12 months)</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                            <p className="text-xs text-muted-foreground">
                                From {totalPayments} payments
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Monthly</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(averageMonthly)}</div>
                            <p className="text-xs text-muted-foreground">
                                Monthly average earnings
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{paymentMethods.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Different payment types
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Monthly Earnings Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Earnings Trend</CardTitle>
                        <CardDescription>
                            Your earnings over the last 12 months
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {monthlyEarnings.length > 0 ? (
                            <div className="space-y-4">
                                {monthlyEarnings.map((earning) => {
                                    const percentage = totalRevenue > 0 ? (earning.total_amount / totalRevenue) * 100 : 0;
                                    return (
                                        <div key={earning.month} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <p className="font-medium">{formatMonth(earning.month)}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {earning.total_payments} payments
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold">{formatCurrency(earning.total_amount)}</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {percentage.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="font-semibold mb-2">No earnings data</h3>
                                <p className="text-muted-foreground">
                                    No payment data available for the last 12 months.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Payment Methods Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Methods</CardTitle>
                            <CardDescription>
                                Breakdown by payment method
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {paymentMethods.length > 0 ? (
                                <div className="space-y-4">
                                    {paymentMethods.map((method) => {
                                        const percentage = totalRevenue > 0 ? (method.total_amount / totalRevenue) * 100 : 0;
                                        return (
                                            <div key={method.payment_method} className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium capitalize">{method.payment_method}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {method.count} transactions
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold">{formatCurrency(method.total_amount)}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {percentage.toFixed(1)}%
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="font-semibold mb-2">No payment methods</h3>
                                    <p className="text-muted-foreground">
                                        No payment data available yet.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top Products */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Products by Revenue</CardTitle>
                            <CardDescription>
                                Your best performing products
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {topProducts.length > 0 ? (
                                <div className="space-y-4">
                                    {topProducts.map((item, index) => (
                                        <div key={item.product.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full text-xs font-medium">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{item.product.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {item.total_quantity} units sold
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold">${item.total_revenue.toFixed(2)}</p>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/marketplace/vendor/products/${item.product.id}/edit`}>
                                                        View Product
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="font-semibold mb-2">No product sales</h3>
                                    <p className="text-muted-foreground">
                                        No sales data available for your products yet.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
