import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    Package, 
    ShoppingCart, 
    CreditCard,
    CheckCircle,
    Clock
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface SubscriptionPlan {
    id: number;
    name: string;
    price: number;
    billing_cycle: 'monthly' | 'yearly';
    product_limit: number | null;
    order_limit: number | null;
    allow_cod: boolean;
    features: string[];
    is_popular?: boolean;
    is_premium?: boolean;
}

interface CurrentSubscription {
    plan_name: string;
    price: number;
    billing_cycle: string;
    start_date: string;
    end_date: string;
    days_remaining: number | null;
    is_active: boolean;
    auto_renew: boolean;
    product_limit: number | null;
    order_limit: number | null;
    allow_cod: boolean;
}

interface Pricing {
    plan_price: number;
    current_plan_credit: number;
    upgrade_cost: number;
    billing_cycle: string;
}

interface CheckoutPageProps {
    plan: SubscriptionPlan;
    currentSubscription?: CurrentSubscription | null;
    pricing: Pricing;
}

export default function CheckoutPage({ plan, currentSubscription, pricing }: CheckoutPageProps) {
    const [autoRenew, setAutoRenew] = useState(true);

    const form = useForm({
        plan_id: plan.id,
        payment_method: 'online',
        auto_renew: autoRenew,
    });

    const { processing } = form;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('rw-RW', {
            style: 'currency',
            currency: 'RWF'
        }).format(amount);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.setData({
            plan_id: plan.id,
            payment_method: 'online',
            auto_renew: autoRenew,
        });
        form.post('/marketplace/subscriptions/upgrade');
    };



    return (
        <AppLayout>
            <Head title={`Checkout - ${plan.name} Plan`} />
            
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Subscribe to {plan.name}
                    </h1>
                    <p className="text-gray-600">Complete your payment to activate your subscription</p>
                </div>

                <div className="max-w-2xl mx-auto">
                    {/* Plan Summary */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-center">
                                Subscribe to {plan.name} Plan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center mb-6">
                                <div className="text-4xl font-bold text-blue-600 mb-2">
                                    {formatCurrency(pricing.upgrade_cost)}
                                </div>
                                <p className="text-gray-600">One-time payment</p>
                            </div>

                            {/* Plan Features */}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center justify-center gap-2 text-sm">
                                    <Package className="h-4 w-4 text-blue-600" />
                                    <span>
                                        {plan.product_limit ? `Up to ${plan.product_limit} products` : 'Unlimited products'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-center gap-2 text-sm">
                                    <ShoppingCart className="h-4 w-4 text-green-600" />
                                    <span>
                                        {plan.order_limit ? `Up to ${plan.order_limit} orders per month` : 'Unlimited orders'}
                                    </span>
                                </div>
                            </div>

                            {/* Current Plan Credit */}
                            {currentSubscription && pricing.current_plan_credit > 0 && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                    <div className="text-center">
                                        <p className="text-sm text-green-800 mb-1">Credit from your current plan</p>
                                        <p className="text-lg font-semibold text-green-600">
                                            -{formatCurrency(pricing.current_plan_credit)}
                                        </p>
                                        <p className="text-xs text-green-700 mt-1">
                                            Applied to your new subscription
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Checkout Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Payment Method */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg text-center">Payment Method</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-center p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="h-6 w-6 text-blue-600" />
                                        <div className="text-center">
                                            <p className="font-medium text-blue-900">Online Payment</p>
                                            <p className="text-sm text-blue-700">
                                                Pay securely with mobile money or bank card
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Auto Renewal Option */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-center space-x-3">
                                    <Checkbox
                                        id="auto_renew"
                                        checked={autoRenew}
                                        onCheckedChange={(checked) => setAutoRenew(checked as boolean)}
                                    />
                                    <Label htmlFor="auto_renew" className="cursor-pointer text-sm">
                                        <span>Auto-renew subscription when it expires</span>
                                    </Label>
                                </div>
                                <p className="text-xs text-gray-600 mt-2 text-center">
                                    You can change this setting anytime
                                </p>
                            </CardContent>
                        </Card>

                        {/* Submit Button */}
                        <div className="space-y-4">
                            <Alert>
                                <CheckCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Your subscription will be activated immediately after payment
                                </AlertDescription>
                            </Alert>

                            <div className="flex gap-4">
                                <Link href="/marketplace/subscriptions/upgrade" className="flex-1">
                                    <Button variant="outline" className="w-full" type="button">
                                        Back to Plans
                                    </Button>
                                </Link>
                                <Button 
                                    type="submit" 
                                    disabled={processing}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                    size="lg"
                                >
                                    {processing ? (
                                        <>
                                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="h-4 w-4 mr-2" />
                                            Pay {formatCurrency(pricing.upgrade_cost)}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}