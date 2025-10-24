import React, { useState, useEffect, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import WelcomeNav from '@/components/navigation/WelcomeNav';
import { SharedData } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import {
    CreditCard,
    Smartphone,
    Shield,
    CheckCircle,
    AlertCircle,
    Clock,
    ArrowLeft,
    Loader2
} from 'lucide-react';
import { usePage } from '@inertiajs/react';

interface PaymentSimulationProps {
    order: {
        id: number;
        order_number: string;
        total_amount: number;
        shipping_address: any;
        billing_address: any;
        vendor: {
            id: number;
            business_name: string;
        };
        items: Array<{
            id: number;
            quantity: number;
            unit_price: number;
            total_price: number;
            product: {
                id: number;
                name: string;
                slug: string;
            };
        }>;
    };
}

export default function PaymentSimulation({ order }: PaymentSimulationProps) {
    const { auth } = usePage<SharedData>().props;
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile_money'>('card');
    const [processing, setProcessing] = useState(false);
    const [paymentStep, setPaymentStep] = useState<'select' | 'details' | 'processing' | 'success' | 'failed'>('select');
    const [countdown, setCountdown] = useState(30);

    const [cardDetails, setCardDetails] = useState({
        number: '',
        expiry: '',
        cvv: '',
        name: ''
    });

    const [mobileDetails, setMobileDetails] = useState({
        phone: '',
        provider: 'MTN'
    });

    const handlePaymentComplete = useCallback(() => {
        // Simulate random success/failure (90% success rate)
        const isSuccess = Math.random() > 0.1;
        const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

        // Process the payment on the backend
        router.post(`/payment/process/${order.id}`, {
            payment_method: paymentMethod,
            success: isSuccess,
            transaction_id: transactionId
        }, {
            onSuccess: () => {
                setProcessing(false);
                setPaymentStep('success');
                // Let the backend redirect handle the navigation automatically
                // The redirect from CheckoutController will be processed by Inertia
            },
            onError: (errors) => {
                console.error('Payment processing error:', errors);
                setPaymentStep('failed');
                setProcessing(false);
            }
        });
    }, [order.id, paymentMethod]);

    // Countdown timer for processing simulation
    useEffect(() => {
        if (paymentStep === 'processing' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (paymentStep === 'processing' && countdown === 0) {
            // Simulate payment completion
            handlePaymentComplete();
        }
    }, [paymentStep, countdown, handlePaymentComplete]);

    const handlePaymentSubmit = () => {
        setPaymentStep('details');
    };

    const handlePaymentProcess = () => {
        setPaymentStep('processing');
        setProcessing(true);
        setCountdown(5); // 5 second simulation
    };

    const handleRetry = () => {
        setPaymentStep('details');
        setCountdown(30);
    };

    const handleGoBack = () => {
        router.visit('/checkout');
    };

    const renderPaymentMethodSelection = () => (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Payment Method</h3>

            {/* Card Payment */}
            <div
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'card'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setPaymentMethod('card')}
            >
                <div className="flex items-center">
                    <CreditCard className="h-6 w-6 mr-3 text-blue-600" />
                    <div>
                        <div className="font-medium">Credit/Debit Card</div>
                        <div className="text-sm text-gray-600">Visa, Mastercard, American Express</div>
                    </div>
                </div>
            </div>

            {/* Mobile Money */}
            <div
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'mobile_money'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setPaymentMethod('mobile_money')}
            >
                <div className="flex items-center">
                    <Smartphone className="h-6 w-6 mr-3 text-emerald-600" />
                    <div>
                        <div className="font-medium">Mobile Money</div>
                        <div className="text-sm text-gray-600">MTN MoMo, Airtel Money</div>
                    </div>
                </div>
            </div>

            <Button onClick={handlePaymentSubmit} className="w-full">
                Continue with {paymentMethod === 'card' ? 'Card' : 'Mobile Money'}
            </Button>
        </div>
    );

    const renderPaymentDetails = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                    {paymentMethod === 'card' ? 'Card Details' : 'Mobile Money Details'}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setPaymentStep('select')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
            </div>

            {paymentMethod === 'card' ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Card Number</label>
                        <input
                            type="text"
                            className="w-full p-3 border rounded-lg"
                            placeholder="1234 5678 9012 3456"
                            value={cardDetails.number}
                            onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Expiry Date</label>
                            <input
                                type="text"
                                className="w-full p-3 border rounded-lg"
                                placeholder="MM/YY"
                                value={cardDetails.expiry}
                                onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">CVV</label>
                            <input
                                type="text"
                                className="w-full p-3 border rounded-lg"
                                placeholder="123"
                                value={cardDetails.cvv}
                                onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Cardholder Name</label>
                        <input
                            type="text"
                            className="w-full p-3 border rounded-lg"
                            placeholder="John Doe"
                            value={cardDetails.name}
                            onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                        />
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Mobile Provider</label>
                        <select
                            className="w-full p-3 border rounded-lg"
                            value={mobileDetails.provider}
                            onChange={(e) => setMobileDetails({ ...mobileDetails, provider: e.target.value })}
                        >
                            <option value="MTN">MTN MoMo</option>
                            <option value="Airtel">Airtel Money</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Phone Number</label>
                        <input
                            type="tel"
                            className="w-full p-3 border rounded-lg"
                            placeholder="+250 78X XXX XXX"
                            value={mobileDetails.phone}
                            onChange={(e) => setMobileDetails({ ...mobileDetails, phone: e.target.value })}
                        />
                    </div>
                </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center text-blue-700 mb-2">
                    <Shield className="h-5 w-5 mr-2" />
                    <span className="font-medium">Secure Payment</span>
                </div>
                <p className="text-sm text-blue-600">
                    This is a payment simulation. No actual charges will be made to your account.
                </p>
            </div>

            <Button onClick={handlePaymentProcess} className="w-full" size="lg">
                Pay {formatCurrency(order.total_amount)}
            </Button>
        </div>
    );

    const renderProcessing = () => (
        <div className="text-center space-y-4">
            <div className="flex justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold">Processing Payment...</h3>
            <p className="text-gray-600">
                Please wait while we process your payment. This may take a few moments.
            </p>
            <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center justify-center text-yellow-700">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>Processing will complete in {countdown} seconds</span>
                </div>
            </div>
        </div>
    );

    const renderSuccess = () => (
        <div className="text-center space-y-4">
            <div className="flex justify-center">
                <div className="bg-emerald-100 rounded-full p-4">
                    <CheckCircle className="h-16 w-16 text-emerald-600" />
                </div>
            </div>
            <h3 className="text-xl font-bold text-emerald-700">Payment Successful!</h3>
            <p className="text-gray-600">
                Your payment has been processed successfully. Order #{order.order_number} is confirmed.
            </p>
            <div className="bg-emerald-50 p-4 rounded-lg">
                <p className="text-sm text-emerald-700">
                    • Stock has been updated<br />
                    • Notifications sent to vendors<br />
                    • Order confirmation email sent
                </p>
            </div>
            <Button onClick={() => router.visit('/orders')} className="w-full">
                View My Orders
            </Button>
        </div>
    );

    const renderFailed = () => (
        <div className="text-center space-y-4">
            <div className="flex justify-center">
                <div className="bg-red-100 rounded-full p-4">
                    <AlertCircle className="h-16 w-16 text-red-600" />
                </div>
            </div>
            <h3 className="text-xl font-bold text-red-700">Payment Failed</h3>
            <p className="text-gray-600">
                We couldn't process your payment. Please try again or use a different payment method.
            </p>
            <div className="flex gap-3">
                <Button onClick={handleRetry} variant="outline" className="flex-1">
                    Try Again
                </Button>
                <Button onClick={handleGoBack} className="flex-1">
                    Back to Checkout
                </Button>
            </div>
        </div>
    );

    return (
        <>
            <Head title="Payment - Online Payment" />
            <WelcomeNav auth={auth} />

            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Complete Your Payment</h1>
                        <p className="text-gray-600">Order #{order.order_number}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Payment Form */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardContent className="p-6">
                                    {paymentStep === 'select' && renderPaymentMethodSelection()}
                                    {paymentStep === 'details' && renderPaymentDetails()}
                                    {paymentStep === 'processing' && renderProcessing()}
                                    {paymentStep === 'success' && renderSuccess()}
                                    {paymentStep === 'failed' && renderFailed()}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex justify-between text-sm">
                                            <div className="flex-1">
                                                <div className="font-medium">{item.product.name}</div>
                                                <div className="text-sm text-gray-600">
                                                    {order.vendor.business_name} × {item.quantity}
                                                </div>
                                            </div>
                                            <div className="font-medium">
                                                {formatCurrency(item.total_price)}
                                            </div>
                                        </div>
                                    ))}

                                    <hr />

                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>{formatCurrency(order.total_amount)}</span>
                                    </div>

                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <p className="text-xs text-blue-600 text-center">
                                            Secure payment powered by Agriinnox
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
