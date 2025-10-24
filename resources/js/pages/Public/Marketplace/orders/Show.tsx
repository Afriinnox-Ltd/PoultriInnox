import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import WelcomeNav from '@/components/navigation/WelcomeNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { formatCurrency } from '@/utils/formatters';
import {
    ArrowLeft,
    Package,
    MapPin,
    CreditCard,
    Truck,
    Calendar,
    FileText,
    CheckCircle,
    Clock,
    XCircle,
    ShoppingBag,
    Download
} from 'lucide-react';

interface Order {
    id: number;
    order_number: string;
    user_id: number;
    vendor_id: number;
    status: string;
    payment_status: string;
    shipping_status?: string;
    subtotal: number;
    tax_amount: number;
    shipping_amount: number;
    discount_amount?: number;
    total_amount: number;
    currency: string;
    payment_method?: string;
    payment_reference?: string;
    shipping_address?: any;
    billing_address?: any;
    notes?: string;
    created_at: string;
    updated_at: string;
    shipped_at?: string;
    delivered_at?: string;
    cancelled_at?: string;
    vendor: {
        id: number;
        business_name: string;
        user: {
            name: string;
            email: string;
        };
    };
    items: Array<{
        id: number;
        product_name: string;
        product_sku?: string;
        quantity: number;
        unit_price: number;
        total_price: number;
        product: {
            id: number;
            name: string;
            slug: string;
            images?: Array<{
                id: number;
                image_path: string;
                alt_text?: string;
            }>;
        };
    }>;
    payments?: Array<{
        id: number;
        amount: number;
        status: string;
        payment_method: string;
        transaction_id?: string;
        created_at: string;
    }>;
}

interface TimelineItem {
    status: string;
    label: string;
    date?: string;
    completed: boolean;
}

interface OrderShowProps {
    order: Order;
    timeline: TimelineItem[];
}

export default function OrderShow({ order, timeline }: OrderShowProps) {
    const { auth } = usePage<SharedData>().props;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'processing': return 'bg-purple-100 text-purple-800';
            case 'shipped': return 'bg-emerald-100 text-emerald-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'refunded': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'completed':
            case 'paid': return 'bg-emerald-100 text-emerald-800';
            case 'failed': return 'bg-red-100 text-red-800';
            case 'refunded': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
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

    const handlePayNow = () => {
        router.visit(`/payment/${order.id}`);
    };

    const handleConfirmDelivery = () => {
        if (confirm('Have you received your order? This will mark the order as delivered.')) {
            router.post(`/orders/${order.id}/confirm-delivery`, {}, {
                preserveScroll: true,
                onSuccess: () => {
                    alert('Order marked as delivered. Thank you!');
                }
            });
        }
    };

    return (
        <>
            <Head title={`Order #${order.order_number}`} />
            <WelcomeNav auth={auth} />

            <div className="min-h-screen bg-gray-50 py-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/orders"
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Order #{order.order_number}
                                </h1>
                                <p className="text-gray-600">
                                    Placed on {formatDate(order.created_at)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Badge className={getStatusColor(order.status)}>
                                {order.status}
                            </Badge>
                            <Badge className={getPaymentStatusColor(order.payment_status)}>
                                {order.payment_status}
                            </Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Order Status Banner */}
                            {order.payment_status === 'pending' && (
                                <Card className="border-orange-200 bg-orange-50">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start space-x-3">
                                            <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-orange-900">Payment Pending</h3>
                                                <p className="text-sm text-orange-800 mt-1">
                                                    Your order is confirmed but payment is still pending. Please complete the payment to process your order.
                                                </p>
                                                <Button
                                                    onClick={handlePayNow}
                                                    className="mt-3 bg-orange-600 hover:bg-orange-700"
                                                >
                                                    <CreditCard className="h-4 w-4 mr-2" />
                                                    Pay Now
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {order.status === 'shipped' && (
                                <Card className="border-blue-200 bg-blue-50">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start space-x-3">
                                            <Truck className="h-5 w-5 text-blue-600 mt-0.5" />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-blue-900">Order Shipped</h3>
                                                <p className="text-sm text-blue-800 mt-1">
                                                    Your order is on its way! Once you receive it, please confirm delivery.
                                                </p>
                                                <Button
                                                    onClick={handleConfirmDelivery}
                                                    variant="outline"
                                                    className="mt-3"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Confirm Delivery
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Order Items */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <ShoppingBag className="h-5 w-5 mr-2" />
                                        Order Items
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex items-center space-x-4 py-3 border-b last:border-b-0">
                                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                    {item.product.images && item.product.images.length > 0 ? (
                                                        <img
                                                            src={item.product.images[0].image_path}
                                                            alt={item.product.images[0].alt_text || item.product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <Package className="h-6 w-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <Link
                                                        href={`/store/products/${item.product.slug}`}
                                                        className="font-medium hover:text-emerald-600"
                                                    >
                                                        {item.product_name}
                                                    </Link>
                                                    {item.product_sku && (
                                                        <p className="text-sm text-gray-500">SKU: {item.product_sku}</p>
                                                    )}
                                                    <p className="text-sm text-gray-600">
                                                        Quantity: {item.quantity} × {formatCurrency(item.unit_price)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">{formatCurrency(item.total_price)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <Separator className="my-4" />

                                    {/* Order Totals */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Subtotal:</span>
                                            <span>{formatCurrency(order.subtotal)}</span>
                                        </div>
                                        {order.tax_amount > 0 && (
                                            <div className="flex justify-between">
                                                <span>Tax:</span>
                                                <span>{formatCurrency(order.tax_amount)}</span>
                                            </div>
                                        )}
                                        {order.shipping_amount > 0 && (
                                            <div className="flex justify-between">
                                                <span>Shipping:</span>
                                                <span>{formatCurrency(order.shipping_amount)}</span>
                                            </div>
                                        )}
                                        {order.discount_amount && order.discount_amount > 0 && (
                                            <div className="flex justify-between text-emerald-600">
                                                <span>Discount:</span>
                                                <span>-{formatCurrency(order.discount_amount)}</span>
                                            </div>
                                        )}
                                        <Separator />
                                        <div className="flex justify-between text-lg font-semibold">
                                            <span>Total:</span>
                                            <span>{formatCurrency(order.total_amount)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Order Timeline */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Calendar className="h-5 w-5 mr-2" />
                                        Order Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {timeline.map((item, index) => (
                                            <div key={index} className="flex items-start space-x-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                    item.completed
                                                        ? 'bg-emerald-100 text-emerald-600'
                                                        : 'bg-gray-100 text-gray-400'
                                                }`}>
                                                    {item.completed ? (
                                                        <CheckCircle className="h-4 w-4" />
                                                    ) : (
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`font-medium ${
                                                        item.completed ? 'text-gray-900' : 'text-gray-500'
                                                    }`}>
                                                        {item.label}
                                                    </p>
                                                    {item.date && (
                                                        <p className="text-sm text-gray-500">
                                                            {formatDate(item.date)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Vendor Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Package className="h-5 w-5 mr-2" />
                                        Sold By
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <p className="font-medium">{order.vendor.business_name}</p>
                                        <p className="text-sm text-gray-600">{order.vendor.user.email}</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full mt-3"
                                            onClick={() => router.visit(`/store/vendors/${order.vendor.id}`)}
                                        >
                                            View Store
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Shipping Address */}
                            {order.shipping_address && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <MapPin className="h-5 w-5 mr-2" />
                                            Delivery Address
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-sm space-y-1">
                                            {order.shipping_address.name && (
                                                <p className="font-medium">{order.shipping_address.name}</p>
                                            )}
                                            {order.shipping_address.phone && (
                                                <p>{order.shipping_address.phone}</p>
                                            )}
                                            {order.shipping_address.address_line_1 && (
                                                <p>{order.shipping_address.address_line_1}</p>
                                            )}
                                            {order.shipping_address.address_line_2 && (
                                                <p>{order.shipping_address.address_line_2}</p>
                                            )}
                                            {(order.shipping_address.city || order.shipping_address.state) && (
                                                <p>
                                                    {order.shipping_address.city}
                                                    {order.shipping_address.city && order.shipping_address.state && ', '}
                                                    {order.shipping_address.state}
                                                </p>
                                            )}
                                            {order.shipping_address.postal_code && (
                                                <p>{order.shipping_address.postal_code}</p>
                                            )}
                                            {order.shipping_address.country && (
                                                <p>{order.shipping_address.country}</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Payment Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <CreditCard className="h-5 w-5 mr-2" />
                                        Payment
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm">Status:</span>
                                            <Badge className={getPaymentStatusColor(order.payment_status)}>
                                                {order.payment_status}
                                            </Badge>
                                        </div>
                                        {order.payment_method && (
                                            <div className="flex justify-between">
                                                <span className="text-sm">Method:</span>
                                                <span className="text-sm capitalize">{order.payment_method.replace('_', ' ')}</span>
                                            </div>
                                        )}
                                        {order.payment_reference && (
                                            <div className="flex justify-between">
                                                <span className="text-sm">Reference:</span>
                                                <span className="text-sm font-mono">{order.payment_reference}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Customer Notes */}
                            {order.notes && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <FileText className="h-5 w-5 mr-2" />
                                            Order Notes
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-600">{order.notes}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Need Help */}
                            <Card className="bg-gray-50">
                                <CardHeader>
                                    <CardTitle className="text-base">Need Help?</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p className="text-sm text-gray-600">
                                        If you have any questions about your order, please contact support.
                                    </p>
                                    <Button variant="outline" size="sm" className="w-full">
                                        Contact Support
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
