import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    Crown, 
    Package, 
    ShoppingCart, 
    CreditCard,
    ArrowLeft,
    CheckCircle,
    AlertTriangle,
    TrendingUp
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface Subscription {
    id: number;
    plan_name: string;
    price: number;
    billing_cycle: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    auto_renew: boolean;
    product_limit: number | null;
    order_limit: number | null;
    allow_cod: boolean;
}

interface Usage {
    products: {
        used: number;
        limit: number | null;
        percentage: number;
    };
    orders: {
        used: number;
        limit: number | null;
        percentage: number;
    };
    days_remaining: number;
    can_use_cod: boolean;
}

interface UsagePageProps {
    subscription: Subscription;
    usage: Usage;
}

export default function UsagePage({ subscription, usage }: UsagePageProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('rw-RW', {
            style: 'currency',
            currency: 'RWF'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getUsageStatus = (percentage: number) => {
        if (percentage >= 90) return { color: 'text-red-600', icon: AlertTriangle };
        if (percentage >= 75) return { color: 'text-yellow-600', icon: AlertTriangle };
        return { color: 'text-emerald-600', icon: CheckCircle };
    };

    const productStatus = getUsageStatus(usage.products.percentage);
    const orderStatus = getUsageStatus(usage.orders.percentage);

    return (
        <AppLayout>
            <Head title="Subscription Usage" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <Link href="/marketplace/subscriptions">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Subscriptions
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Subscription Usage</h1>
                            <p className="text-gray-600">Monitor your subscription usage and limits</p>
                        </div>
                    </div>
                    <Link href="/marketplace/subscriptions/upgrade">
                        <Button>
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Upgrade Plan
                        </Button>
                    </Link>
                </div>

                {/* Current Plan Overview */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Crown className="h-6 w-6 text-yellow-500" />
                            {subscription.plan_name} Plan
                            {subscription.is_active ? (
                                <Badge variant="default">Active</Badge>
                            ) : (
                                <Badge variant="destructive">Inactive</Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <p className="text-sm text-gray-600">Monthly Cost</p>
                                {subscription.price > 0 ? (
                                    <>
                                        <p className="text-2xl font-bold">{formatCurrency(subscription.price)}</p>
                                        <p className="text-sm text-gray-500">per {subscription.billing_cycle}</p>
                                    </>
                                ) : (
                                    <p className="text-2xl font-bold">Free</p>
                                )}
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-600">Plan Expires</p>
                                <p className="text-lg font-semibold">{formatDate(subscription.end_date)}</p>
                                <p className="text-sm text-gray-500">{usage.days_remaining} days remaining</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-600">Auto Renewal</p>
                                <p className="text-lg font-semibold">
                                    {subscription.auto_renew ? 'Enabled' : 'Disabled'}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {subscription.auto_renew ? 'Will renew automatically' : 'Manual renewal required'}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-600">Cash on Delivery</p>
                                <div className="flex items-center justify-center mt-1">
                                    {usage.can_use_cod ? (
                                        <>
                                            <CheckCircle className="h-5 w-5 text-emerald-500 mr-1" />
                                            <span className="text-lg font-semibold text-emerald-600">Available</span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertTriangle className="h-5 w-5 text-gray-400 mr-1" />
                                            <span className="text-lg font-semibold text-gray-600">Not Available</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Usage Statistics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Product Usage */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-blue-600" />
                                Product Usage
                                <productStatus.icon className={`h-5 w-5 ${productStatus.color}`} />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {usage.products.limit ? (
                                <>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Products Listed</span>
                                        <span className="text-sm">
                                            {usage.products.used} of {usage.products.limit}
                                        </span>
                                    </div>
                                    <Progress value={usage.products.percentage} className="h-3" />
                                    <div className="flex justify-between items-center text-sm text-gray-600">
                                        <span>{usage.products.percentage.toFixed(1)}% used</span>
                                        <span>{usage.products.limit - usage.products.used} remaining</span>
                                    </div>
                                    {usage.products.percentage >= 90 && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-sm text-red-800">
                                                <AlertTriangle className="h-4 w-4 inline mr-1" />
                                                You're approaching your product limit. Consider upgrading your plan.
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                                    <h3 className="text-lg font-semibold text-emerald-600">Unlimited Products</h3>
                                    <p className="text-gray-600">You can list as many products as you want</p>
                                    <p className="text-2xl font-bold mt-2">{usage.products.used}</p>
                                    <p className="text-sm text-gray-500">products currently listed</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Order Usage */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 text-emerald-600" />
                                Monthly Order Usage
                                <orderStatus.icon className={`h-5 w-5 ${orderStatus.color}`} />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {usage.orders.limit ? (
                                <>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Orders This Month</span>
                                        <span className="text-sm">
                                            {usage.orders.used} of {usage.orders.limit}
                                        </span>
                                    </div>
                                    <Progress value={usage.orders.percentage} className="h-3" />
                                    <div className="flex justify-between items-center text-sm text-gray-600">
                                        <span>{usage.orders.percentage.toFixed(1)}% used</span>
                                        <span>{usage.orders.limit - usage.orders.used} remaining</span>
                                    </div>
                                    {usage.orders.percentage >= 90 && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-sm text-red-800">
                                                <AlertTriangle className="h-4 w-4 inline mr-1" />
                                                You're approaching your monthly order limit. Consider upgrading.
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                                    <h3 className="text-lg font-semibold text-emerald-600">Unlimited Orders</h3>
                                    <p className="text-gray-600">You can process unlimited orders per month</p>
                                    <p className="text-2xl font-bold mt-2">{usage.orders.used}</p>
                                    <p className="text-sm text-gray-500">orders processed this month</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Plan Features */}
                <Card>
                    <CardHeader>
                        <CardTitle>Plan Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-center space-x-3">
                                <Package className="h-6 w-6 text-blue-600" />
                                <div>
                                    <p className="font-medium">Product Listings</p>
                                    <p className="text-sm text-gray-600">
                                        {subscription.product_limit ? `Up to ${subscription.product_limit} products` : 'Unlimited products'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <ShoppingCart className="h-6 w-6 text-emerald-600" />
                                <div>
                                    <p className="font-medium">Monthly Orders</p>
                                    <p className="text-sm text-gray-600">
                                        {subscription.order_limit ? `Up to ${subscription.order_limit} orders/month` : 'Unlimited orders'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <CreditCard className={`h-6 w-6 ${subscription.allow_cod ? 'text-emerald-600' : 'text-gray-400'}`} />
                                <div>
                                    <p className="font-medium">Cash on Delivery</p>
                                    <p className="text-sm text-gray-600">
                                        {subscription.allow_cod ? 'Available' : 'Not available on this plan'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4 mt-8">
                    <Link href="/marketplace/subscriptions">
                        <Button variant="outline">
                            Manage Subscription
                        </Button>
                    </Link>
                    <Link href="/marketplace/subscriptions/upgrade">
                        <Button>
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Upgrade Plan
                        </Button>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}