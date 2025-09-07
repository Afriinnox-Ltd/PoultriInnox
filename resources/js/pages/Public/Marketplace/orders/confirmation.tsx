import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Package, MapPin, CreditCard, ArrowLeft, Download } from 'lucide-react';
import WelcomeNav from '@/components/navigation/WelcomeNav';
import { SharedData } from '@/types';

interface Order {
    id: number;
    order_number: string;
    status: string;
    total_amount: number;
    subtotal: number;
    tax_amount: number;
    shipping_amount: number;
    currency: string;
    payment_method: string;
    created_at: string;
    shipping_address: {
        name: string;
        phone: string;
        address_line_1: string;
        address_line_2?: string;
        city: string;
        state: string;
        country: string;
    };
    items: Array<{
        id: number;
        product: {
            id: number;
            name: string;
            images: Array<{ image_url: string; alt_text?: string }>;
        };
        quantity: number;
        price: number;
        total: number;
    }>;
    vendor: {
        id: number;
        business_name: string;
    };
}

interface OrderConfirmationProps {
    orders: Order[];
    totalAmount: number;
    auth: any;
}

export default function OrderConfirmation({ orders, totalAmount, auth }: OrderConfirmationProps) {
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
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            <Head title="Order Confirmation" />
            <WelcomeNav auth={auth} />

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 py-20">
                    {/* Success Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                            <CheckCircle className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                        <p className="text-gray-600">
                            Thank you for your order. We'll send you a confirmation email with tracking details.
                        </p>
                    </div>

                    {/* Order Summary Cards */}
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <Card key={order.id} className="shadow-sm">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="flex items-center text-lg">
                                                <Package className="w-5 h-5 mr-2" />
                                                Order #{order.order_number}
                                            </CardTitle>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Placed on {formatDate(order.created_at)}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Vendor: {order.vendor.business_name}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="secondary" className="mb-2">
                                                {order.status.replace('_', ' ').toUpperCase()}
                                            </Badge>
                                            <p className="text-lg font-bold text-emerald-600">
                                                {formatCurrency(order.total_amount)}
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Order Items */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">Items Ordered</h4>
                                        <div className="space-y-3">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        {item.product.images?.[0] && (
                                                            <img
                                                                src={item.product.images[0].image_path}
                                                                alt={item.product.images[0].alt_text || item.product.name}
                                                                className="w-12 h-12 object-cover rounded mr-3"
                                                            />
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-gray-900">{item.product.name}</p>
                                                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                    <p className="font-medium">{formatCurrency(item.total)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Order Totals */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Subtotal</span>
                                            <span>{formatCurrency(order.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Tax</span>
                                            <span>{formatCurrency(order.tax_amount)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Shipping</span>
                                            <span>{formatCurrency(order.shipping_amount)}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between font-bold">
                                            <span>Total</span>
                                            <span>{formatCurrency(order.total_amount)}</span>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Shipping & Payment Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                                <MapPin className="w-4 h-4 mr-1" />
                                                Shipping Address
                                            </h4>
                                            <div className="text-sm text-gray-600">
                                                <p>{order.shipping_address.name}</p>
                                                <p>{order.shipping_address.address_line_1}</p>
                                                {order.shipping_address.address_line_2 && (
                                                    <p>{order.shipping_address.address_line_2}</p>
                                                )}
                                                <p>
                                                    {order.shipping_address.city}, {order.shipping_address.state}
                                                </p>
                                                <p>{order.shipping_address.country}</p>
                                                <p>Phone: {order.shipping_address.phone}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                                <CreditCard className="w-4 h-4 mr-1" />
                                                Payment Method
                                            </h4>
                                            <p className="text-sm text-gray-600 capitalize">
                                                {order.payment_method.replace('_', ' ')}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
                        <Link href="/orders">
                            <Button variant="outline" size="lg">
                                <Package className="w-4 h-4 mr-2" />
                                View All Orders
                            </Button>
                        </Link>
                        <Link href="/store">
                            <Button size="lg">
                                Continue Shopping
                            </Button>
                        </Link>
                    </div>

                    {/* Back to Store Link */}
                    <div className="text-center mt-6">
                        <Link
                            href="/store"
                            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Store
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
