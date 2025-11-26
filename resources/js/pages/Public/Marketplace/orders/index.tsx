import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Order, OrderItem, ProductImage } from '@/types/marketplace';
import {
    Package,
    Truck,
    Calendar,
    Search,
    Filter,
    Download,
    Eye,
    MessageSquare,
    XCircle,
    ShoppingBag,
    Clock,
    CheckCircle,
    DollarSign,
    CreditCard
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import WelcomeNav from '@/components/navigation/WelcomeNav';
import { SharedData } from '@/types';

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
                    images?: ProductImage[];
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
            delivery_confirmation?: {
                id: number;
                confirmed: boolean;
                confirmed_at?: string;
                delivery_requested_at: string;
            };
            payment_status: string;
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
    stats: {
        total_orders: number;
        pending_orders: number;
        completed_orders: number;
        total_spent: number;
    };
    user_type: 'customer';
}

export default function CustomerOrdersPage({ orders, filters, stats, user_type }: OrdersPageProps) {
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
            case 'pending_confirmation': return 'bg-orange-100 text-orange-800';
            case 'completed': return 'bg-emerald-100 text-emerald-800';
            case 'paid': return 'bg-emerald-100 text-emerald-800';
            case 'failed': return 'bg-red-100 text-red-800';
            case 'refunded': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatPaymentStatus = (status: string) => {
        switch (status) {
            case 'pending_confirmation': return 'Awaiting Delivery Confirmation';
            case 'completed': return 'Completed';
            default: return status.charAt(0).toUpperCase() + status.slice(1);
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

        window.location.href = `/orders?${params.toString()}`;
    };

    const clearFilters = () => {
        window.location.href = '/orders';
    };

    const cancelOrder = async (orderId: number) => {
        try {
            const response = await fetch(`/orders/${orderId}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                window.location.reload();
            } else {
                alert('Failed to cancel order. Please try again.');
            }
        } catch (error) {

            alert('Failed to cancel order. Please try again.');
        }
    };

    const printOrder = (order: any) => {
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow popups to print the order');
            return;
        }

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Order #${order.order_number}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                        line-height: 1.6;
                        color: #333;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 2px solid #333;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    .company-name {
                        font-size: 24px;
                        font-weight: bold;
                        color: #2563eb;
                        margin-bottom: 5px;
                    }
                    .order-title {
                        font-size: 20px;
                        margin: 10px 0;
                    }
                    .order-info {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 30px;
                        flex-wrap: wrap;
                    }
                    .info-section {
                        flex: 1;
                        min-width: 250px;
                        margin-right: 20px;
                    }
                    .info-section h3 {
                        color: #1f2937;
                        border-bottom: 1px solid #e5e7eb;
                        padding-bottom: 5px;
                        margin-bottom: 10px;
                    }
                    .status-badge {
                        display: inline-block;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 12px;
                        font-weight: bold;
                        text-transform: uppercase;
                    }
                    .status-pending { background-color: #fef3c7; color: #92400e; }
                    .status-confirmed { background-color: #dbeafe; color: #1e40af; }
                    .status-processing { background-color: #e9d5ff; color: #7c3aed; }
                    .status-shipped { background-color: #d1fae5; color: #065f46; }
                    .status-delivered { background-color: #d1fae5; color: #065f46; }
                    .status-cancelled { background-color: #fee2e2; color: #dc2626; }
                    .items-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                    }
                    .items-table th,
                    .items-table td {
                        border: 1px solid #e5e7eb;
                        padding: 12px;
                        text-align: left;
                    }
                    .items-table th {
                        background-color: #f9fafb;
                        font-weight: bold;
                    }
                    .text-right {
                        text-align: right;
                    }
                    .totals {
                        margin-top: 20px;
                        border-top: 2px solid #333;
                        padding-top: 15px;
                    }
                    .total-row {
                        display: flex;
                        justify-content: space-between;
                        margin: 5px 0;
                    }
                    .total-final {
                        font-size: 18px;
                        font-weight: bold;
                        border-top: 1px solid #e5e7eb;
                        padding-top: 10px;
                        margin-top: 10px;
                    }
                    .addresses {
                        display: flex;
                        justify-content: space-between;
                        margin: 30px 0;
                        flex-wrap: wrap;
                    }
                    .address-section {
                        flex: 1;
                        min-width: 250px;
                        margin-right: 20px;
                        border: 1px solid #e5e7eb;
                        padding: 15px;
                        border-radius: 5px;
                    }
                    .footer {
                        margin-top: 40px;
                        text-align: center;
                        color: #6b7280;
                        font-size: 12px;
                        border-top: 1px solid #e5e7eb;
                        padding-top: 20px;
                    }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="company-name">Agriinnox Marketplace</div>
                    <div class="order-title">Order Invoice #${order.order_number}</div>
                    <div>Date: ${formatDate(order.created_at)}</div>
                </div>

                <div class="order-info">
                    <div class="info-section">
                        <h3>Order Details</h3>
                        <p><strong>Order Number:</strong> ${order.order_number}</p>
                        <p><strong>Status:</strong> <span class="status-badge status-${order.status}">${order.status}</span></p>
                        <p><strong>Payment Status:</strong> <span class="status-badge status-${order.payment_status}">${order.payment_status}</span></p>
                        <p><strong>Payment Method:</strong> ${order.payment_method || 'Cash on Delivery'}</p>
                        <p><strong>Order Date:</strong> ${formatDate(order.created_at)}</p>
                    </div>
                </div>

                <div class="addresses">
                    <div class="address-section">
                        <h3>Shipping Address</h3>
                        ${order.shipping_address ? `
                            <p>${order.shipping_address.name || ''}</p>
                            <p>${order.shipping_address.phone || ''}</p>
                            <p>${order.shipping_address.address_line_1 || ''}</p>
                            ${order.shipping_address.address_line_2 ? `<p>${order.shipping_address.address_line_2}</p>` : ''}
                            <p>${order.shipping_address.city || ''}, ${order.shipping_address.state || ''}</p>
                            <p>${order.shipping_address.country || ''}</p>
                        ` : '<p>No shipping address available</p>'}
                    </div>

                    <div class="address-section">
                        <h3>Billing Address</h3>
                        ${order.billing_address ? `
                            <p>${order.billing_address.name || ''}</p>
                            <p>${order.billing_address.phone || ''}</p>
                            <p>${order.billing_address.address_line_1 || ''}</p>
                            ${order.billing_address.address_line_2 ? `<p>${order.billing_address.address_line_2}</p>` : ''}
                            <p>${order.billing_address.city || ''}, ${order.billing_address.state || ''}</p>
                            <p>${order.billing_address.country || ''}</p>
                        ` : '<p>No billing address available</p>'}
                    </div>
                </div>

                <h3>Order Items</h3>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th class="text-right">Unit Price</th>
                            <th class="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map((item: any) => `
                            <tr>
                                <td>
                                    <strong>${item.product_name}</strong>
                                    ${item.product_sku ? `<br><small>SKU: ${item.product_sku}</small>` : ''}
                                </td>
                                <td>${item.quantity}</td>
                                <td class="text-right">${formatCurrency(item.unit_price)}</td>
                                <td class="text-right">${formatCurrency(item.total_price)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="totals">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>${formatCurrency(order.subtotal || 0)}</span>
                    </div>
                    ${order.tax_amount ? `
                    <div class="total-row">
                        <span>Tax:</span>
                        <span>${formatCurrency(order.tax_amount)}</span>
                    </div>
                    ` : ''}
                    ${order.shipping_amount ? `
                    <div class="total-row">
                        <span>Shipping:</span>
                        <span>${formatCurrency(order.shipping_amount)}</span>
                    </div>
                    ` : ''}
                    <div class="total-row total-final">
                        <span>Total:</span>
                        <span>${formatCurrency(order.total_amount)}</span>
                    </div>
                </div>

                ${order.shipping ? `
                <div class="info-section" style="margin-top: 30px;">
                    <h3>Shipping Information</h3>
                    <p><strong>Status:</strong> <span class="status-badge status-${order.shipping.status}">${order.shipping.status}</span></p>
                    ${order.shipping.tracking_number ? `<p><strong>Tracking Number:</strong> ${order.shipping.tracking_number}</p>` : ''}
                    ${order.shipping.carrier ? `<p><strong>Carrier:</strong> ${order.shipping.carrier}</p>` : ''}
                    ${order.shipping.estimated_delivery ? `<p><strong>Estimated Delivery:</strong> ${formatDate(order.shipping.estimated_delivery)}</p>` : ''}
                </div>
                ` : ''}

                ${order.notes ? `
                <div class="info-section" style="margin-top: 30px;">
                    <h3>Order Notes</h3>
                    <p>${order.notes}</p>
                </div>
                ` : ''}

                <div class="footer">
                    <p>Thank you for your business!</p>
                    <p>Agriinnox Marketplace - Your trusted partner in poultry solutions</p>
                    <p>This is a computer-generated invoice. For any questions, please contact our support team.</p>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();

        // Wait for content to load then print
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;
    return (
        <>
            <WelcomeNav auth={auth} />
            <Head title="My Orders" />

            <WelcomeNav auth={auth} />
            <div className="container mx-auto pt-18  max-w-7xl  sm:px-6 lg:px-8 px-4 py-8">

                <div className="py-6">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold"> My Orders</h1>
                                <p className="text-muted-foreground">
                                    View and manage your orders
                                </p>
                            </div>
                        </div>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center">
                                        <Package className="h-8 w-8 text-blue-600" />
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                            <p className="text-2xl font-bold text-gray-900">{stats.total_orders}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center">
                                        <Clock className="h-8 w-8 text-yellow-600" />
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                                            <p className="text-2xl font-bold text-gray-900">{stats.pending_orders}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center">
                                        <CheckCircle className="h-8 w-8 text-emerald-600" />
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">Completed</p>
                                            <p className="text-2xl font-bold text-gray-900">{stats.completed_orders}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center">
                                        <DollarSign className="h-8 w-8 text-emerald-600" />
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">Total Spent</p>
                                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_spent)}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

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
                                            placeholder="Order number..."
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
                                            You haven't placed any orders yet. Start shopping!
                                        </p>
                                        <Button onClick={() => window.location.href = '/marketplace'}>
                                            Start Shopping
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
                                                        {order.payment_method && (
                                                            <div className="flex items-center">
                                                                <CreditCard className="h-4 w-4 mr-1" />
                                                                {order.payment_method === 'cash_on_delivery' ? 'Cash on Delivery' : 'Online Payment'}
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
                                                            {formatPaymentStatus(order.payment_status)}
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
                                                            {item.product?.images && item.product.images.length > 0 ? (
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
                                                        <div className="flex-grow">
                                                            <h4 className="font-medium">{item.product_name}</h4>
                                                            <p className="text-sm text-gray-600">
                                                                Quantity: {item.quantity} × {formatCurrency(item.unit_price)}
                                                            </p>
                                                            {item.shipping_cost && item.shipping_cost > 0 && (
                                                                <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                                                                    <Truck className="h-3 w-3" />
                                                                    Shipping: {formatCurrency(item.shipping_cost)}
                                                                </p>
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
                                                {/* Customer Delivery Confirmation */}
                                                {order.status === 'delivered' && order.payment_status === 'pending_confirmation' && !order.delivery_confirmation?.confirmed && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => window.location.href = `/orders/${order.id}/confirm-delivery`}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Confirm Delivery
                                                    </Button>
                                                )}

                                                {/* Show delivery confirmation status */}
                                                {order.delivery_confirmation?.confirmed && (
                                                    <div className="flex items-center gap-2 text-sm text-emerald-600 px-3 py-1 bg-emerald-50 rounded-md">
                                                        <CheckCircle className="h-4 w-4" />
                                                        <span>Delivery Confirmed {order.delivery_confirmation.confirmed_at && `on ${formatDate(order.delivery_confirmation.confirmed_at)}`}</span>
                                                    </div>
                                                )}

                                                {order.status === 'delivered' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => window.location.href = `/marketplace/products/${order.items[0]?.product?.slug}#reviews`}
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
                                                                cancelOrder(order.id);
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
                                                    onClick={() => printOrder(order)}
                                                >
                                                    <Download className="h-4 w-4 mr-1" />
                                                    Print Invoice
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
                                                    window.location.href = `/orders?${params.toString()}`;
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
            </div>
        </>
    );
}
