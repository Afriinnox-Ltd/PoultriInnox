import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    CheckCircle,
    Calendar,
    Package,
    ShoppingCart,
    CreditCard,
    ArrowRight,
    Home,
    Crown
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface Vendor {
    id: number;
    business_name: string;
}

interface Subscription {
    id: number;
    plan_name: string;
    price: number;
    billing_cycle: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    product_limit: number | null;
    order_limit: number | null;
    allow_cod: boolean;
    auto_renew: boolean;
    payment_status: string;
    vendor: Vendor;
}

interface SuccessPageProps {
    subscription: Subscription;
}

export default function SuccessPage({ subscription }: SuccessPageProps) {
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

    return (
        <AppLayout>
            <Head title="Subscription Activated Successfully" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20  rounded-full mb-4">
                        <CheckCircle className="h-12 w-12 text-emerald-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Subscription Activated!
                    </h1>
                    <p className="text-lg text-gray-600">
                        Your {subscription.plan_name} plan is now active
                    </p>
                </div>

                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Subscription Details Card */}
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Crown className="h-6 w-6 text-emerald-600" />
                                Subscription Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            {/* Plan Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Plan Name</p>
                                    <p className="font-semibold text-gray-900">{subscription.plan_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Price</p>
                                    <p className="font-semibold text-gray-900">
                                        {formatCurrency(subscription.price)}
                                        <span className="text-sm text-gray-600 font-normal ml-1">
                                            / {subscription.billing_cycle}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-emerald-600 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Start Date</p>
                                        <p className="font-medium text-gray-900">
                                            {formatDate(subscription.start_date)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-orange-600 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">End Date</p>
                                        <p className="font-medium text-gray-900">
                                            {formatDate(subscription.end_date)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="pt-4 border-t">
                                <p className="text-sm font-medium text-gray-700 mb-3">Plan Features:</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Package className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                                        <span className="text-gray-700">
                                            {subscription.product_limit
                                                ? `Up to ${subscription.product_limit} products`
                                                : 'Unlimited products'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <ShoppingCart className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                                        <span className="text-gray-700">
                                            {subscription.order_limit
                                                ? `Up to ${subscription.order_limit} orders per month`
                                                : 'Unlimited orders'}
                                        </span>
                                    </div>
                                    {subscription.allow_cod && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <CreditCard className="h-5 w-5 text-purple-600 flex-shrink-0" />
                                            <span className="text-gray-700">
                                                Cash on Delivery enabled
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Auto-Renewal Status */}
                            {subscription.auto_renew && (
                                <Alert className="border-emerald-200 bg-emerald-50">
                                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                                    <AlertDescription className="text-emerald-800">
                                        Auto-renewal is enabled. Your subscription will automatically renew on {formatDate(subscription.end_date)}.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Next Steps Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">What's Next?</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <Link
                                    href="/marketplace/vendor/dashboard"
                                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                            <Home className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Go to Dashboard</p>
                                            <p className="text-sm text-gray-600">Manage your store and products</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                </Link>

                                <Link
                                    href="/marketplace/subscriptions/usage"
                                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                            <Package className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">View Usage</p>
                                            <p className="text-sm text-gray-600">Track your subscription usage</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                </Link>

                                <Link
                                    href="/marketplace/subscriptions"
                                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <Crown className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Manage Subscription</p>
                                            <p className="text-sm text-gray-600">View details and manage settings</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Confirmation */}
                    {subscription.price > 0 && subscription.payment_status === 'completed' && (
                        <Alert className="border-emerald-200 bg-emerald-50">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                            <AlertDescription className="text-emerald-800">
                                Payment of {formatCurrency(subscription.price)} has been confirmed.
                                A receipt will be sent to your email shortly.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
