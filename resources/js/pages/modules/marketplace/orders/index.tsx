import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Order, OrderItem } from '@/types/marketplace';
import {
    Package,
    Truck,
    MapPin,
    Calendar,
    DollarSign,
    User,
    Phone,
    Mail,
    Clock,
    CheckCircle,
    XCircle,
    Search,
    Filter,
    Download,
    Eye,
    MessageSquare
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface OrdersPageProps {
    orders: {
        data: Array<Order & {
            user: {
                id: number;
                name: string;
                email: string;
            };
            items: Array<OrderItem & {
                product: {
                    id: number;
                    name: string;
                    slug: string;
                    images?: Array<{ image_url: string; alt_text?: string }>;
                };
                vendor_order: {
                    id: number;
                    status: string;
                };
            }>;
            shipping?: {
                id: number;
                status: string;
                tracking_number?: string;
                carrier?: string;
                estimated_delivery?: string;
                shipped_at?: string;
                delivered_at?: string;
            };
        }>;
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        status?: string;
        payment_status?: string;
        search?: string;
        date_from?: string;
        date_to?: string;
    };
    user_type: 'customer' | 'vendor' | 'admin';
}

export default function OrdersPage({ orders, filters, user_type }: OrdersPageProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState(filters.payment_status || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

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
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (statusFilter) params.set('status', statusFilter);
        if (paymentStatusFilter) params.set('payment_status', paymentStatusFilter);
        if (dateFrom) params.set('date_from', dateFrom);
        if (dateTo) params.set('date_to', dateTo);

        const baseUrl = user_type === 'vendor'
            ? '/marketplace/vendor/orders'
            : user_type === 'admin'
                ? '/marketplace/admin/orders'
                : '/marketplace/orders';

        window.location.href = `${baseUrl}?${params.toString()}`;
    };

    const clearFilters = () => {
        const baseUrl = user_type === 'vendor'
            ? '/marketplace/vendor/orders'
            : user_type === 'admin'
                ? '/marketplace/admin/orders'
                : '/marketplace/orders';
        window.location.href = baseUrl;
    };

    const updateOrderStatus = async (orderId: number, newStatus: string) => {
        try {
            const response = await fetch(`/marketplace/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                window.location.reload();
            } else {
                alert('Failed to update order status. Please try again.');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Failed to update order status. Please try again.');
        }
    };

    const getPageTitle = () => {
        switch (user_type) {
            case 'vendor': return 'My Orders';
            case 'admin': return 'All Orders';
            default: return 'My Orders';
        }
    };

    return (
        <AppLayout
        >
            <Head title={getPageTitle()} />
            <div className="flex justify-between items-center p-6 pb-0">
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    {getPageTitle()}
                </h2>
                <div className="flex gap-2">
                    <Button
                        onClick={() => window.open('/marketplace/orders/export')}
                        variant="outline"
                        size="sm"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    {user_type === 'vendor' && (
                        <Button
                            onClick={() => window.location.href = '/marketplace/vendor/dashboard'}
                            variant="outline"
                            size="sm"
                        >
                            Dashboard
                        </Button>
                    )}
                </div>
            </div>
            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Filters */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Filter className="h-5 w-5 mr-2" />
                                Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Search</label>
                                    <Input
                                        placeholder="Order number, customer..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">Status</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="refunded">Refunded</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">Payment</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={paymentStatusFilter}
                                        onChange={(e) => setPaymentStatusFilter(e.target.value)}
                                    >
                                        <option value="">All Payments</option>
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="failed">Failed</option>
                                        <option value="refunded">Refunded</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">From Date</label>
                                    <Input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">To Date</label>
                                    <Input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <Button onClick={handleSearch}>
                                    <Search className="h-4 w-4 mr-2" />
                                    Search
                                </Button>
                                <Button onClick={clearFilters} variant="outline">
                                    Clear Filters
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Results Summary */}
                    <Card className="mb-4">
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-600">
                                Showing {orders.data.length} of {orders.total} orders
                            </p>
                        </CardContent>
                    </Card>

                    {/* Orders List */}
                    <div className="space-y-4">
                        {orders.data.length === 0 ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        No orders found
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        {user_type === 'vendor'
                                            ? "You don't have any orders yet. Start promoting your products!"
                                            : "You haven't placed any orders yet. Start shopping!"
                                        }
                                    </p>
                                    <Button onClick={() => window.location.href = '/marketplace'}>
                                        {user_type === 'vendor' ? 'View Marketplace' : 'Start Shopping'}
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            orders.data.map((order) => (
                                <Card key={order.id}>
                                    <CardContent className="p-6">
                                        {/* Order Header */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold">
                                                    Order #{order.order_number}
                                                </h3>
                                                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                                    <div className="flex items-center">
                                                        <Calendar className="h-4 w-4 mr-1" />
                                                        {formatDate(order.created_at)}
                                                    </div>
                                                    {user_type !== 'customer' && (
                                                        <div className="flex items-center">
                                                            <User className="h-4 w-4 mr-1" />
                                                            {order.user.name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex gap-2 mb-2">
                                                    <Badge className={getStatusColor(order.status)}>
                                                        {order.status}
                                                    </Badge>
                                                    <Badge className={getPaymentStatusColor(order.payment_status)}>
                                                        {order.payment_status}
                                                    </Badge>
                                                </div>
                                                <p className="text-xl font-bold">
                                                    {formatCurrency(order.total_amount)}
                                                </p>
                                            </div>
                                        </div>

                                        <Separator className="mb-4" />

                                        {/* Order Items */}
                                        <div className="space-y-3 mb-4">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="flex gap-4">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                        {item.product.images && item.product.images.length > 0 ? (
                                                            <img
                                                                src={item.product.images[0].image_url}
                                                                alt={item.product.images[0].alt_text || item.product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                <Package className="h-6 w-6" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-grow">
                                                        <h4 className="font-medium">{item.product_name}</h4>
                                                        <p className="text-sm text-gray-600">
                                                            Quantity: {item.quantity} × {formatCurrency(item.unit_price)}
                                                        </p>
                                                        {user_type === 'vendor' && (
                                                            <Badge variant="outline" className="mt-1">
                                                                {item.vendor_order.status}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold">
                                                            {formatCurrency(item.total_price)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Shipping Information */}
                                        {order.shipping && (
                                            <>
                                                <Separator className="mb-4" />
                                                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-medium flex items-center">
                                                            <Truck className="h-4 w-4 mr-2" />
                                                            Shipping Information
                                                        </h4>
                                                        <Badge className={getStatusColor(order.shipping.status)}>
                                                            {order.shipping.status}
                                                        </Badge>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                        {order.shipping.tracking_number && (
                                                            <div>
                                                                <span className="font-medium">Tracking:</span> {order.shipping.tracking_number}
                                                            </div>
                                                        )}
                                                        {order.shipping.carrier && (
                                                            <div>
                                                                <span className="font-medium">Carrier:</span> {order.shipping.carrier}
                                                            </div>
                                                        )}
                                                        {order.shipping.estimated_delivery && (
                                                            <div>
                                                                <span className="font-medium">Estimated Delivery:</span> {formatDate(order.shipping.estimated_delivery)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* Order Actions */}
                                        <div className="flex gap-2 flex-wrap">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => window.location.href = `/marketplace/orders/${order.id}`}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View Details
                                            </Button>

                                            {user_type === 'vendor' && order.status === 'confirmed' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => updateOrderStatus(order.id, 'processing')}
                                                >
                                                    <Clock className="h-4 w-4 mr-1" />
                                                    Mark Processing
                                                </Button>
                                            )}

                                            {user_type === 'vendor' && order.status === 'processing' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => updateOrderStatus(order.id, 'shipped')}
                                                >
                                                    <Truck className="h-4 w-4 mr-1" />
                                                    Mark Shipped
                                                </Button>
                                            )}

                                            {order.status === 'delivered' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => window.location.href = `/marketplace/products/${order.items[0]?.product.slug}#reviews`}
                                                >
                                                    <MessageSquare className="h-4 w-4 mr-1" />
                                                    Write Review
                                                </Button>
                                            )}

                                            {(order.status === 'pending' || order.status === 'confirmed') && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to cancel this order?')) {
                                                            updateOrderStatus(order.id, 'cancelled');
                                                        }
                                                    }}
                                                >
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                    Cancel Order
                                                </Button>
                                            )}

                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => window.print()}
                                            >
                                                <Download className="h-4 w-4 mr-1" />
                                                Print
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {orders.last_page > 1 && (
                        <Card className="mt-6">
                            <CardContent className="p-4">
                                <div className="flex justify-center space-x-2">
                                    {Array.from({ length: orders.last_page }, (_, i) => i + 1).map((page) => (
                                        <Button
                                            key={page}
                                            variant={page === orders.current_page ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => {
                                                const params = new URLSearchParams(window.location.search);
                                                params.set('page', page.toString());
                                                const baseUrl = user_type === 'vendor'
                                                    ? '/marketplace/vendor/orders'
                                                    : user_type === 'admin'
                                                        ? '/marketplace/admin/orders'
                                                        : '/marketplace/orders';
                                                window.location.href = `${baseUrl}?${params.toString()}`;
                                            }}
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
