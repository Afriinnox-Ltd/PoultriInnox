import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    Package,
    User,
    MapPin,
    CreditCard,
    Truck,
    Calendar,
    DollarSign,
    FileText,
    Edit,
    CheckCircle,
    XCircle,
    AlertTriangle
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
    admin_notes?: string;
    created_at: string;
    updated_at: string;
    shipped_at?: string;
    delivered_at?: string;
    cancelled_at?: string;
    refunded_at?: string;
    user: {
        id: number;
        name: string;
        email: string;
        phone?: string;
    };
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
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'processing': return 'bg-purple-100 text-purple-800';
            case 'shipped': return 'bg-emerald-100 text-emerald-800';
            case 'delivered': return 'bg-emerald-100 text-emerald-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'refunded': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'paid': return 'bg-emerald-100 text-emerald-800';
            case 'failed': return 'bg-red-100 text-red-800';
            case 'refunded': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

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

    const updateOrderStatus = (newStatus: string) => {
        router.patch(`/admin/marketplace/orders/${order.id}/status`, {
            status: newStatus
        }, {
            preserveScroll: true,
        });
    };

    const cancelOrder = () => {
        if (confirm('Are you sure you want to cancel this order?')) {
            router.post(`/admin/marketplace/orders/${order.id}/cancel`, {
                reason: 'Cancelled by admin'
            }, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AdminLayout>
            <Head title={`Order #${order.order_number}`} />

            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/admin/marketplace/orders"
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Order #{order.order_number}
                            </h1>
                            <p className="text-gray-600">
                                Created on {formatDate(order.created_at)}
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
                        {/* Order Items */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Package className="h-5 w-5 mr-2" />
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
                                                <h3 className="font-medium">{item.product_name}</h3>
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
                                        <div className="flex justify-between text-green-600">
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
                                    Order Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {timeline.map((item, index) => (
                                        <div key={index} className="flex items-start space-x-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                item.completed
                                                    ? 'bg-green-100 text-green-600'
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
                        {/* Order Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {order.status === 'pending' && (
                                    <Button
                                        onClick={() => updateOrderStatus('confirmed')}
                                        className="w-full"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Confirm Order
                                    </Button>
                                )}

                                {order.status === 'confirmed' && (
                                    <Button
                                        onClick={() => updateOrderStatus('processing')}
                                        className="w-full"
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Mark as Processing
                                    </Button>
                                )}

                                {order.status === 'processing' && (
                                    <Button
                                        onClick={() => updateOrderStatus('shipped')}
                                        className="w-full"
                                    >
                                        <Truck className="h-4 w-4 mr-2" />
                                        Mark as Shipped
                                    </Button>
                                )}

                                {order.status === 'shipped' && (
                                    <Button
                                        onClick={() => updateOrderStatus('delivered')}
                                        className="w-full"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Mark as Delivered
                                    </Button>
                                )}

                                {!['cancelled', 'refunded', 'delivered'].includes(order.status) && (
                                    <Button
                                        onClick={cancelOrder}
                                        variant="destructive"
                                        className="w-full"
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Cancel Order
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* Customer Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="h-5 w-5 mr-2" />
                                    Customer
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <p className="font-medium">{order.user.name}</p>
                                    <p className="text-sm text-gray-600">{order.user.email}</p>
                                    {order.user.phone && (
                                        <p className="text-sm text-gray-600">{order.user.phone}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Vendor Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Package className="h-5 w-5 mr-2" />
                                    Vendor
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <p className="font-medium">{order.vendor.business_name}</p>
                                    <p className="text-sm text-gray-600">{order.vendor.user.name}</p>
                                    <p className="text-sm text-gray-600">{order.vendor.user.email}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Shipping Address */}
                        {order.shipping_address && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <MapPin className="h-5 w-5 mr-2" />
                                        Shipping Address
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
                                            <span className="text-sm">{order.payment_method}</span>
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

                        {/* Order Notes */}
                        {(order.notes || order.admin_notes) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <FileText className="h-5 w-5 mr-2" />
                                        Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {order.notes && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Customer Notes:</p>
                                            <p className="text-sm text-gray-600">{order.notes}</p>
                                        </div>
                                    )}
                                    {order.admin_notes && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Admin Notes:</p>
                                            <p className="text-sm text-gray-600">{order.admin_notes}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
