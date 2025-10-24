import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import WelcomeNav from '@/components/navigation/WelcomeNav';
import { SharedData } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import {
    CreditCard,
    Smartphone,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Loader2,
    ArrowLeft
} from 'lucide-react';

interface PaymentPageProps {
    order: any;
    payment: any;
    phoneNumber?: string;
}

export default function PaymentPage({ order, payment: initialPayment, phoneNumber: initialPhone = '' }: PaymentPageProps) {
    const { auth } = usePage<SharedData>().props;
    const [phoneNumber, setPhoneNumber] = useState(initialPhone);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [payment, setPayment] = useState(initialPayment);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [showTimeoutModal, setShowTimeoutModal] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes in seconds
    const PAYMENT_TIMEOUT = 120; // 2 minutes

    // Auto-initiate payment if phone number is provided
    useEffect(() => {
        if (initialPhone && !isProcessing) {
            // Check if payment was already initiated (has metadata with ishema response)
            const hasInitiatedPayment = initialPayment?.metadata &&
                JSON.parse(initialPayment.metadata).ishema_response;

            if (!hasInitiatedPayment) {
                handleInitiatePayment();
            }
        }
    }, [initialPhone]);

    // Auto-check payment status if pending
    useEffect(() => {
        if (payment?.status === 'pending') {
            const interval = setInterval(() => {
                checkPaymentStatus();
            }, 5000); // Check every 5 seconds

            return () => clearInterval(interval);
        }
    }, [payment?.status]);

    // Timeout mechanism for pending payments
    useEffect(() => {
        let timeoutInterval: NodeJS.Timeout;
        let countdownInterval: NodeJS.Timeout;

        if (payment?.status === 'pending') {
            // Reset timer when payment becomes pending
            setTimeRemaining(PAYMENT_TIMEOUT);

            // Countdown timer
            countdownInterval = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            // Show timeout modal after specified time
            timeoutInterval = setTimeout(() => {
                setShowTimeoutModal(true);
            }, PAYMENT_TIMEOUT * 1000);
        }

        return () => {
            if (timeoutInterval) clearTimeout(timeoutInterval);
            if (countdownInterval) clearInterval(countdownInterval);
        };
    }, [payment?.status]);

    const handleInitiatePayment = async () => {
        if (!phoneNumber || phoneNumber.length < 9) {
            setError('Please enter a valid phone number');
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            const response = await fetch(`/payment/${order.id}/initiate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ phone_number: phoneNumber })
            });

            const data = await response.json();

            if (response.ok) {
                setPayment(data.payment);
                // Start checking status
            } else {
                setError(data.error || 'Failed to initiate payment');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const checkPaymentStatus = async () => {
        if (checkingStatus) return;

        setCheckingStatus(true);
        try {
            const response = await fetch(`/payment/${order.id}/status`);
            const data = await response.json();

            if (data.payment) {
                setPayment(data.payment);

                if (data.payment.status === 'completed') {
                    // Redirect to order confirmation
                    setTimeout(() => {
                        router.visit(`/orders/${order.id}`);
                    }, 2000);
                } else if (data.payment.status === 'failed') {
                    // Close timeout modal if payment failed
                    setShowTimeoutModal(false);
                }
            }
        } catch (err) {
            console.error('Status check failed:', err);
        } finally {
            setCheckingStatus(false);
        }
    };

    const handleRetryPayment = () => {
        setShowTimeoutModal(false);
        setPayment(null);
        setError('');
    };

    const handleCancelPayment = () => {
        router.visit(`/orders/${order.id}`);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getStatusIcon = () => {
        switch (payment?.status) {
            case 'completed':
                return <CheckCircle className="h-12 w-12 text-green-500" />;
            case 'failed':
                return <XCircle className="h-12 w-12 text-red-500" />;
            case 'pending':
                return <Clock className="h-12 w-12 text-orange-500 animate-pulse" />;
            default:
                return <Smartphone className="h-12 w-12 text-blue-500" />;
        }
    };

    const getStatusText = () => {
        switch (payment?.status) {
            case 'completed':
                return { title: 'Payment Successful!', description: 'Your payment has been processed successfully.' };
            case 'failed':
                return { title: 'Payment Failed', description: 'Your payment could not be processed. Please try again.' };
            case 'pending':
                return { title: 'Payment Pending', description: 'Please check your phone and complete the payment.' };
            default:
                return { title: 'Complete Your Payment', description: 'Enter your phone number to receive a payment prompt.' };
        }
    };

    const statusInfo = getStatusText();

    return (
        <>
            <Head title="Complete Payment" />
            <WelcomeNav auth={auth} />

            <div className="min-h-screen bg-gray-50 py-20">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.visit(`/orders/${order.id}`)}
                        className="mb-6"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Order
                    </Button> */}

                    {/* Payment Status Card */}
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center">
                                {getStatusIcon()}
                                <h2 className="text-2xl font-bold mt-4 mb-2">{statusInfo.title}</h2>
                                <p className="text-gray-600 mb-4">{statusInfo.description}</p>

                                {payment?.status === 'pending' && (
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Checking payment status...
                                    </div>
                                )}

                                {payment?.status === 'completed' && (
                                    <Badge variant="default" className="bg-green-500">
                                        Payment Confirmed
                                    </Badge>
                                )}

                                {payment?.status === 'failed' && (
                                    <Badge variant="destructive">
                                        Payment Failed
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Details */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Order Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Order Number:</span>
                                    <span className="font-semibold">#{order.order_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Amount to Pay:</span>
                                    <span className="font-bold text-xl text-emerald-600">
                                        {formatCurrency(payment?.amount || order.total_amount)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Payment Method:</span>
                                    <div className="flex items-center">
                                        <Smartphone className="h-4 w-4 mr-1 text-yellow-500" />
                                        <span>MTN Mobile Money</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Form */}
                    {(!payment || payment.status === 'failed') && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <CreditCard className="h-5 w-5 mr-2" />
                                    Enter Payment Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {error && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-800">
                                        <AlertCircle className="h-4 w-4 mr-2" />
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="phone">MTN Mobile Money Number</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="078XXXXXXX"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            disabled={isProcessing}
                                            className="text-lg"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Enter the phone number that will complete the payment
                                        </p>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h4 className="font-semibold text-blue-900 mb-2">Payment Instructions:</h4>
                                        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                                            <li>Enter your MTN Mobile Money number</li>
                                            <li>Click "Pay Now" button</li>
                                            <li>You will receive a prompt on your phone</li>
                                            <li>Enter your Mobile Money PIN to complete payment</li>
                                            <li>Wait for confirmation</li>
                                        </ol>
                                    </div>

                                    <Button
                                        onClick={handleInitiatePayment}
                                        disabled={isProcessing || !phoneNumber}
                                        className="w-full"
                                        size="lg"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Smartphone className="h-5 w-5 mr-2" />
                                                Pay Now - {formatCurrency(order.total_amount)}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Pending Payment Info */}
                    {payment?.status === 'pending' && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <Smartphone className="h-16 w-16 mx-auto mb-4 text-orange-500 animate-bounce" />
                                    <h3 className="text-lg font-semibold mb-2">Check Your Phone</h3>
                                    <p className="text-gray-600 mb-4">
                                        A payment prompt has been sent to your phone. Please enter your PIN to complete the transaction.
                                    </p>
                                    <div className="mb-4">
                                        <div className="text-sm text-gray-500 mb-2">Time remaining</div>
                                        <div className="text-2xl font-bold text-orange-600">
                                            {formatTime(timeRemaining)}
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={checkPaymentStatus}
                                        disabled={checkingStatus}
                                    >
                                        {checkingStatus ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Checking...
                                            </>
                                        ) : (
                                            'Check Status Manually'
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Success Actions */}
                    {payment?.status === 'completed' && (
                        <div className="flex gap-4">
                            <Button
                                onClick={() => router.visit(`/orders/${order.id}`)}
                                className="flex-1"
                            >
                                View Order Details
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => router.visit('/store')}
                                className="flex-1"
                            >
                                Continue Shopping
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Timeout Modal */}
            <Dialog open={showTimeoutModal} onOpenChange={setShowTimeoutModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center text-orange-600">
                            <Clock className="h-5 w-5 mr-2" />
                            Payment Timeout
                        </DialogTitle>
                        <DialogDescription className="pt-4">
                            <div className="space-y-3">
                                <p>
                                    Your payment session has timed out. The payment prompt may have expired or was not completed in time.
                                </p>
                                <p>
                                    Would you like to try again or return to your order?
                                </p>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={handleCancelPayment}
                        >
                            Return to Order
                        </Button>
                        <Button
                            onClick={handleRetryPayment}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            Try Again
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
