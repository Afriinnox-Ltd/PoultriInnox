import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    CreditCard,
    Smartphone,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    ArrowLeft,
    Loader2,
    Crown,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';

interface Subscription {
    id: number;
    plan_name: string;
    price: number;
    billing_cycle: string;
    payment_status: string;
}

interface Payment {
    id: number;
    amount: number;
    currency: string;
    status: string;
    payment_method: string;
}

interface PaymentPageProps {
    subscription: Subscription;
    payment: Payment;
    payment_initiated?: boolean;
}

export default function PaymentPage({ subscription, payment: initialPayment, payment_initiated = false }: PaymentPageProps) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [payment, setPayment] = useState(initialPayment);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
    const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes
    const [showTimeoutModal, setShowTimeoutModal] = useState(false);
    const [paymentInitiated, setPaymentInitiated] = useState(payment_initiated);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('rw-RW', {
            style: 'currency',
            currency: 'RWF'
        }).format(amount);
    };

    useEffect(() => {
        // Check if already paid
        if (payment.status === 'completed' || subscription.payment_status === 'completed') {
            router.visit(`/marketplace/subscriptions/success/${subscription.id}`);
        }

        // If payment already initiated from checkout, start polling immediately
        if (paymentInitiated) {
            setProcessing(true);
        }

        // Start polling for payment status
        const interval = setInterval(checkPaymentStatus, 5000);
        setPollingInterval(interval);

        // Countdown timer for timeout
        const countdownInterval = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    if (payment.status === 'pending') {
                        setShowTimeoutModal(true);
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(interval);
            clearInterval(countdownInterval);
        };
    }, []);

    const checkPaymentStatus = async () => {
        try {
            const response = await fetch(`/marketplace/subscriptions/payment/${subscription.id}/status`);
            const data = await response.json();

            console.log('Payment status check response:', data);

            setPayment(data.payment);

            if (data.status === 'completed' || data.payment_status === 'completed') {
                console.log('Payment completed! Redirecting to success page...');
                if (pollingInterval) {
                    clearInterval(pollingInterval);
                }
                router.visit(`/marketplace/subscriptions/success/${subscription.id}`);
            } else if (data.status === 'failed' || data.payment?.status === 'failed') {
                console.log('Payment failed!');
                if (pollingInterval) {
                    clearInterval(pollingInterval);
                }
                setProcessing(false);
            }
        } catch (err) {
            console.error('Failed to check payment status:', err);
        }
    };

    const handleInitiatePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setProcessing(true);

        try {
            const response = await fetch(`/marketplace/subscriptions/payment/${subscription.id}/initiate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    phone_number: phoneNumber,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setPayment(data.payment);
                // Reset timeout
                setTimeRemaining(120);
                setShowTimeoutModal(false);
            } else {
                setError(data.error || 'Failed to initiate payment');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred while processing your payment');
        } finally {
            setProcessing(false);
        }
    };

    const handleRetry = () => {
        setShowTimeoutModal(false);
        setTimeRemaining(120);
        setPhoneNumber('');
    };

    const handleCancel = () => {
        router.visit(`/marketplace/subscriptions`);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getStatusIcon = () => {
        switch (payment.status) {
            case 'completed':
                return <CheckCircle className="h-16 w-16 text-emerald-500" />;
            case 'failed':
                return <XCircle className="h-16 w-16 text-red-500" />;
            case 'pending':
                return <Clock className="h-16 w-16 text-yellow-500 animate-pulse" />;
            default:
                return <CreditCard className="h-16 w-16 text-emerald-500" />;
        }
    };

    const getStatusText = () => {
        switch (payment.status) {
            case 'completed':
                return 'Payment Successful!';
            case 'failed':
                return 'Payment Failed';
            case 'pending':
                return 'Waiting for Payment...';
            default:
                return 'Initiate Payment';
        }
    };

    return (
        <AppLayout>
            <Head title={`Payment - ${subscription.plan_name}`} />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href={`/marketplace/subscriptions/plans/${subscription.id}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Complete Your Payment
                        </h1>
                        <p className="text-gray-600">Subscribe to {subscription.plan_name}</p>
                    </div>
                </div>

                {/* Status Card */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            {getStatusIcon()}
                            <h2 className="text-2xl font-semibold">{getStatusText()}</h2>

                            {payment.status === 'pending' && (
                                <div className="space-y-2">
                                    <p className="text-gray-600">
                                        Please check your phone and enter your PIN to complete the payment
                                    </p>
                                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                        <Clock className="h-4 w-4" />
                                        <span>Time remaining: {formatTime(timeRemaining)}</span>
                                    </div>
                                </div>
                            )}

                            {payment.status === 'failed' && (
                                <p className="text-red-600">
                                    Your payment could not be processed. Please try again.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Details */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Crown className="h-5 w-5 text-emerald-600" />
                            Subscription Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b">
                                <span className="text-gray-600">Plan</span>
                                <span className="font-semibold">{subscription.plan_name}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b">
                                <span className="text-gray-600">Billing Cycle</span>
                                <span className="font-semibold capitalize">{subscription.billing_cycle}</span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-gray-600 text-lg">Total Amount</span>
                                <span className="text-2xl font-bold text-emerald-600">
                                    {formatCurrency(payment.amount)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Form */}
                {payment.status !== 'completed' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Smartphone className="h-5 w-5 text-emerald-600" />
                                Mobile Money Payment
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleInitiatePayment} className="space-y-6">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Mobile Money Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="078XXXXXXX"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        required
                                        disabled={processing || payment.status === 'pending'}
                                        className="text-lg"
                                    />
                                    <p className="text-sm text-gray-600">
                                        Enter your MTN Mobile Money number to complete the payment
                                    </p>
                                </div>

                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>Note:</strong> A prompt will be sent to your phone.
                                        Please enter your PIN to complete the payment.
                                    </AlertDescription>
                                </Alert>

                                <div className="flex gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={handleCancel}
                                        disabled={processing}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing || payment.status === 'pending'}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                        size="lg"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Processing...
                                            </>
                                        ) : payment.status === 'pending' ? (
                                            <>
                                                <Clock className="h-4 w-4 mr-2" />
                                                Waiting for Payment...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="h-4 w-4 mr-2" />
                                                Pay {formatCurrency(payment.amount)}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Timeout Modal */}
                <Dialog open={showTimeoutModal} onOpenChange={setShowTimeoutModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-orange-500" />
                                Payment Timeout
                            </DialogTitle>
                            <DialogDescription>
                                The payment request has timed out. Would you like to try again?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex gap-2 sm:gap-2">
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleRetry}
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                Retry Payment
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
