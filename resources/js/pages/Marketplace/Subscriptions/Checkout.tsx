import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Package,
    ShoppingCart,
    Smartphone,
    CheckCircle,
    Clock,
    AlertCircle
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
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');

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
        setError('');

        if (!phoneNumber) {
            setError('Please enter your mobile money number');
            return;
        }

        if (!/^[0-9]{9,12}$/.test(phoneNumber)) {
            setError('Please enter a valid phone number (9-12 digits)');
            return;
        }

        console.log('Submitting checkout form with phone:', phoneNumber);

        // Update form data with phone number and submit
        form.transform((data) => ({
            ...data,
            phone_number: phoneNumber,
        }));

        console.log('Form data:', form.data);

        form.post('/marketplace/subscriptions/upgrade', {
            onSuccess: () => {
                console.log('Form submission successful');
            },
            onError: (errors: any) => {
                console.error('Form submission error:', errors);
                setError(errors.message || 'Failed to process payment');
            },
        });
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
                    {/* Single Card Checkout */}
                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-center text-2xl">
                                    {plan.name} Plan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Price */}
                                <div className="text-center py-4 border-b">
                                    <div className="text-5xl font-bold text-emerald-600 mb-2">
                                        {formatCurrency(pricing.upgrade_cost)}
                                    </div>
                                    <p className="text-gray-600 text-sm capitalize">{plan.billing_cycle} billing</p>
                                </div>

                                {/* Current Plan Credit */}
                                {currentSubscription && pricing.current_plan_credit > 0 && (
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 -mt-2">
                                        <div className="text-center">
                                            <p className="text-sm text-emerald-800 mb-1">Credit from your current plan</p>
                                            <p className="text-lg font-semibold text-emerald-600">
                                                -{formatCurrency(pricing.current_plan_credit)}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Plan Features */}
                                <div className="space-y-3 py-4 border-b">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Package className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                                        <span className="text-gray-700">
                                            {plan.product_limit ? `Up to ${plan.product_limit} products` : 'Unlimited products'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <ShoppingCart className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                                        <span className="text-gray-700">
                                            {plan.order_limit ? `Up to ${plan.order_limit} orders per month` : 'Unlimited orders'}
                                        </span>
                                    </div>
                                </div>

                                {/* Phone Number Input */}
                                <div className="space-y-2">
                                    <Label htmlFor="phone_number" className="text-sm font-medium flex items-center gap-2">
                                        <Smartphone className="h-4 w-4 text-emerald-600" />
                                        Mobile Money Number
                                    </Label>
                                    <Input
                                        id="phone_number"
                                        type="tel"
                                        placeholder="078XXXXXXX"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        required
                                        className="text-lg"
                                        disabled={processing}
                                    />
                                    <p className="text-xs text-gray-600">
                                        Enter your MTN Mobile Money number for payment
                                    </p>
                                </div>

                                {/* Error Alert */}
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                {/* Auto Renewal */}
                                <div className="flex items-center justify-between py-2">
                                    <Label htmlFor="auto_renew" className="cursor-pointer text-sm font-medium">
                                        Auto-renew subscription
                                    </Label>
                                    <Checkbox
                                        id="auto_renew"
                                        checked={autoRenew}
                                        onCheckedChange={(checked) => setAutoRenew(checked as boolean)}
                                    />
                                </div>

                                {/* Info Alert */}
                                <Alert className="bg-emerald-50 border-emerald-200">
                                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                                    <AlertDescription className="text-emerald-800 text-sm">
                                        Your subscription activates immediately after payment
                                    </AlertDescription>
                                </Alert>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <Link href="/marketplace/subscriptions" className="flex-1">
                                        <Button variant="outline" className="w-full" type="button">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        disabled={processing || !phoneNumber}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                        size="lg"
                                    >
                                        {processing ? (
                                            <>
                                                <Clock className="h-4 w-4 mr-2 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                Pay {formatCurrency(pricing.upgrade_cost)}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
