import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Order } from '@/types/marketplace';

interface ShippingAddress {
    city?: string;
    state?: string;
    country?: string;
    address_line_1?: string;
    address_line_2?: string;
    name?: string;
    phone?: string;
    postal_code?: string;
}

import {
    Package,
    Truck,
    MapPin,
    Calendar,
    DollarSign,
    Phone,
    Mail,
    Clock,
    CheckCircle,
    XCircle,
    Search,
    Filter,
    Download,
    Eye,
    MessageSquare,
    Users
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';

interface OrdersPageProps {
    orders: {
        data: Array<Order & {
            user: {
                id: number;
                name: string;
                email: string;
                phone?: string;
            };
            items: Array<{
                id: number;
                product_name: string;
                product_sku?: string;
                quantity: number;
                unit_price: number;
                total_price: number;
                product?: {
                    id: number;
                    name: string;
                    slug: string;
                    images?: Array<{ image_path: string; alt_text?: string }>;
                };
                vendor_order?: {
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
            delivery_confirmation?: {
                id: number;
                confirmed: boolean;
                confirmed_at?: string;
                delivery_requested_at: string;
            };
            payment_status: string;
            subtotal?: number;
            tax_amount?: number;
            shipping_amount?: number;
            discount_amount?: number;
            total_weight?: number;
            transaction_id?: string;
            delivery_instructions?: string;
            notes?: string;
            billing_address?: ShippingAddress | string;
            shipping_address?: ShippingAddress | string;
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
    const [selectedOrder, setSelectedOrder] = useState<OrdersPageProps['orders']['data'][0] | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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


    const formatPaymentMethod = (method: string) => {
        switch (method) {
            case 'credit_card': return 'Credit Card';
            case 'paypal': return 'PayPal';
            case 'bank_transfer': return 'Bank Transfer';
            case 'cash_on_delivery': return 'Cash on Delivery';
            default: return method || 'Online Payment';
        }
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
            router.patch(`/marketplace/vendor/orders/${orderId}/status`, { status: newStatus },
                {
                    onSuccess: () => {
                        toast.success('Order status updated successfully!');
                    },
                    onError: (errors) => {
                        const errorMessage = typeof errors === 'object' && errors !== null && 'error' in errors 
                            ? String((errors as Record<string, unknown>).error)
                            : 'Failed to update order status. Please try again.';
                        toast.error(errorMessage);
                        console.error('Error updating order status:', errors);
                    }
                }
            );

        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Failed to update order status. Please try again.');
        }
    };

    const printOrder = (order: OrdersPageProps['orders']['data'][0]) => {
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
                    <div class="company-name">PoultriInnox Marketplace</div>
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

                    ${order.user ? `
                    <div class="info-section">
                        <h3>Customer Information</h3>
                        <p><strong>Name:</strong> ${order.user.name}</p>
                        <p><strong>Email:</strong> ${order.user.email}</p>
                    </div>
                    ` : ''}
                </div>

                <div class="addresses">
                    <div class="address-section">
                        <h3>Shipping Address</h3>
                        ${order.shipping_address && typeof order.shipping_address === 'object' ? `
                            <p>${(order.shipping_address as ShippingAddress).name || ''}</p>
                            <p>${(order.shipping_address as ShippingAddress).phone || ''}</p>
                            <p>${(order.shipping_address as ShippingAddress).address_line_1 || ''}</p>
                            ${(order.shipping_address as ShippingAddress).address_line_2 ? `<p>${(order.shipping_address as ShippingAddress).address_line_2}</p>` : ''}
                            <p>${(order.shipping_address as ShippingAddress).city || ''}, ${(order.shipping_address as ShippingAddress).state || ''}</p>
                            <p>${(order.shipping_address as ShippingAddress).country || ''}</p>
                        ` : '<p>No shipping address available</p>'}
                    </div>

                    <div class="address-section">
                        <h3>Billing Address</h3>
                        ${order.billing_address && typeof order.billing_address === 'object' ? `
                            <p>${(order.billing_address as ShippingAddress).name || ''}</p>
                            <p>${(order.billing_address as ShippingAddress).phone || ''}</p>
                            <p>${(order.billing_address as ShippingAddress).address_line_1 || ''}</p>
                            ${(order.billing_address as ShippingAddress).address_line_2 ? `<p>${(order.billing_address as ShippingAddress).address_line_2}</p>` : ''}
                            <p>${(order.billing_address as ShippingAddress).city || ''}, ${(order.billing_address as ShippingAddress).state || ''}</p>
                            <p>${(order.billing_address as ShippingAddress).country || ''}</p>
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
                        ${order.items.map((item) => `
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
                    <p>PoultriInnox Marketplace - Your trusted partner in poultry solutions</p>
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
                                            <div className="flex-1">
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
                                                            <DollarSign className="h-4 w-4 mr-1" />
                                                            {order.payment_method === 'cash_on_delivery' ? 'COD' : 
                                                             order.payment_method === 'credit_card' ? 'Credit Card' :
                                                             order.payment_method === 'paypal' ? 'PayPal' :
                                                             order.payment_method === 'bank_transfer' ? 'Bank Transfer' : 'Online'}
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Minimized Customer Details for Vendor/Admin */}
                                                {user_type !== 'customer' && order.user && (
                                                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                                        <div className="flex items-center gap-4 text-sm">
                                                            <div className="flex items-center">
                                                                <Users className="h-4 w-4 mr-1 text-gray-500" />
                                                                <span className="font-medium">{order.user.name}</span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <Mail className="h-4 w-4 mr-1 text-gray-500" />
                                                                <span className="text-gray-600">{order.user.email}</span>
                                                            </div>
                                                            {order.user.phone && (
                                                                <div className="flex items-center">
                                                                    <Phone className="h-4 w-4 mr-1 text-gray-500" />
                                                                    <span className="text-gray-600">{order.user.phone}</span>
                                                                </div>
                                                            )}
                                                            {order.shipping_address && (
                                                                <div className="flex items-center">
                                                                    <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                                                                    <span className="text-gray-600">
                                                                        {typeof order.shipping_address === 'object' && order.shipping_address !== null
                                                                            ? (() => {
                                                                                const addr = order.shipping_address as ShippingAddress;
                                                                                return `${addr.city || ''}${addr.state ? `, ${addr.state}` : ''}`.trim() || 'Address Available';
                                                                            })()
                                                                            : 'Delivery Address Provided'
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="text-right ml-4">
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
                                                        {item.product && item.product.images && item.product.images.length > 0 ? (
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
                                                        {user_type === 'vendor' && item.vendor_order && (
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
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setIsModalOpen(true);
                                                }}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View Details
                                            </Button>
                                            {/* <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => window.location.href = `/marketplace/orders/${order.id}`}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View Details
                                            </Button> */}

                                            {user_type === 'vendor' && order.admin_confirmed && order.status === 'confirmed' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => updateOrderStatus(order.id, 'processing')}
                                                >
                                                    <Clock className="h-4 w-4 mr-1" />
                                                    Mark Processing
                                                </Button>
                                            )}

                                            {user_type === 'vendor' && order.admin_confirmed && order.status === 'processing' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => updateOrderStatus(order.id, 'shipped')}
                                                >
                                                    <Truck className="h-4 w-4 mr-1" />
                                                    Mark Shipped
                                                </Button>
                                            )}

                                            {user_type === 'vendor' && order.admin_confirmed && order.status === 'shipped' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Mark Delivered & Confirm Payment
                                                </Button>
                                            )}

                                            {user_type === 'admin' && !order.admin_confirmed && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        if (confirm('Confirm this order for vendor management?')) {
                                                            fetch(`/admin/marketplace/orders/${order.id}/confirm`, {
                                                                method: 'POST',
                                                                headers: {
                                                                    'Content-Type': 'application/json',
                                                                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                                                                },
                                                            }).then(() => window.location.reload());
                                                        }
                                                    }}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Confirm Order
                                                </Button>
                                            )}

                                            {user_type === 'vendor' && !order.admin_confirmed && (
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            if (confirm('Confirm this order to start processing?')) {
                                                                router.post(`/marketplace/vendor/orders/${order.id}/confirm`, {}, {
                                                                    onSuccess: () => {
                                                                        toast.success('Order confirmed successfully!');
                                                                    },
                                                                    onError: (error) => {
                                                                        toast.error('Failed to confirm order. Please try again.');
                                                                        console.error('Error confirming order:', error);
                                                                    }
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Confirm Order
                                                    </Button>
                                                    <div className="text-sm text-gray-500 italic px-2 py-1 bg-gray-50 rounded">
                                                        Awaiting confirmation to manage order
                                                    </div>
                                                </div>
                                            )}

                                            {order.status === 'delivered' && order.items.length > 0 && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => window.location.href = `/marketplace/products/${order.items[0]?.product?.slug}#reviews`}
                                                >
                                                    <MessageSquare className="h-4 w-4 mr-1" />
                                                    Write Review
                                                </Button>
                                            )}

                                            {/* Show delivery confirmation status */}
                                            {order.delivery_confirmation?.confirmed && (
                                                <div className="flex items-center gap-2 text-sm text-emerald-600">
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span>Delivery Confirmed {order.delivery_confirmation.confirmed_at && `on ${formatDate(order.delivery_confirmation.confirmed_at)}`}</span>
                                                </div>
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

                    {/* Order Details Modal */}
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogContent className="max-w-6xl min-w-5xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>
                                    Order Details #{selectedOrder?.order_number}
                                </DialogTitle>
                                <DialogDescription>
                                    Complete order information and checkout details
                                </DialogDescription>
                            </DialogHeader>
                            
                            {selectedOrder && ( 
                                <div className="space-y-6">
                                    {/* Order Summary */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="font-semibold text-lg mb-3">Order Information</h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Order Number:</span>
                                                    <span className="font-medium">{selectedOrder.order_number}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Date:</span>
                                                    <span>{formatDate(selectedOrder.created_at)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Status:</span>
                                                    <Badge className={getStatusColor(selectedOrder.status)}>
                                                        {selectedOrder.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Payment Status:</span>
                                                    <Badge className={getPaymentStatusColor(selectedOrder.payment_status)}>
                                                        {formatPaymentStatus(selectedOrder.payment_status)}
                                                    </Badge>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Payment Method:</span>
                                                    <span>{formatPaymentMethod(selectedOrder.payment_method)}</span>
                                                </div>
                                                {selectedOrder.transaction_id && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Transaction ID:</span>
                                                        <span className="font-mono text-xs">{selectedOrder.transaction_id}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <h3 className="font-semibold text-lg mb-3">Customer Information</h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Name:</span>
                                                    <span className="font-medium">{selectedOrder.user.name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Email:</span>
                                                    <span>{selectedOrder.user.email}</span>
                                                </div> 
                                            </div>
                                        </div>
                                    </div>

                                    {/* Addresses */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Shipping Address */}
                                        <div>
                                            <h3 className="font-semibold text-lg mb-3 flex items-center">
                                                <MapPin className="h-5 w-5 mr-2" />
                                                Shipping Address
                                            </h3>
                                            {selectedOrder.shipping_address &&  JSON.parse( selectedOrder.shipping_address) ? (
                                                <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                                                    {(() => {
                                                        const addr = JSON.parse(selectedOrder.shipping_address) as ShippingAddress;
                                                        return (
                                                            <>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Name:</span>
                                                                    <span className={`font-medium ${!addr.name ? 'text-red-500 italic' : ''}`}>
                                                                        {addr.name || 'Not provided'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Phone:</span>
                                                                    <span className={`flex items-center ${!addr.phone ? 'text-red-500 italic' : ''}`}>
                                                                        <Phone className="h-3 w-3 mr-1" />
                                                                        {addr.phone || 'Not provided'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Address Line 1:</span>
                                                                    <span className={!addr.address_line_1 ? 'text-red-500 italic' : ''}>
                                                                        {addr.address_line_1 || 'Not provided'}
                                                                    </span>
                                                                </div>
                                                                {addr.address_line_2 && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-600">Address Line 2:</span>
                                                                        <span>{addr.address_line_2}</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">City:</span>
                                                                    <span className={!addr.city ? 'text-red-500 italic' : ''}>
                                                                        {addr.city || 'Not provided'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">State:</span>
                                                                    <span className={!addr.state ? 'text-red-500 italic' : ''}>
                                                                        {addr.state || 'Not provided'}
                                                                    </span>
                                                                </div>
                                                                {addr.postal_code && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-600">Postal Code:</span>
                                                                        <span>{addr.postal_code}</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Country:</span>
                                                                    <span className={`font-medium ${!addr.country ? 'text-red-500 italic' : ''}`}>
                                                                        {addr.country || 'Not provided'}
                                                                    </span>
                                                                </div>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            ) : (
                                                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-500 italic">
                                                    No shipping address provided
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Billing Address */}
                                        <div>
                                            <h3 className="font-semibold text-lg mb-3 flex items-center">
                                                <DollarSign className="h-5 w-5 mr-2" />
                                                Billing Address
                                            </h3>
                                            {selectedOrder.billing_address && typeof  JSON.parse(selectedOrder.billing_address) === 'object' ? (
                                                <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                                                    {(() => {
                                                        const addr =  JSON.parse(selectedOrder.billing_address) as ShippingAddress;
                                                        return (
                                                            <>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Name:</span>
                                                                    <span className={`font-medium ${!addr.name ? 'text-red-500 italic' : ''}`}>
                                                                        {addr.name || 'Not provided'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Phone:</span>
                                                                    <span className={`flex items-center ${!addr.phone ? 'text-red-500 italic' : ''}`}>
                                                                        <Phone className="h-3 w-3 mr-1" />
                                                                        {addr.phone || 'Not provided'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Address Line 1:</span>
                                                                    <span className={!addr.address_line_1 ? 'text-red-500 italic' : ''}>
                                                                        {addr.address_line_1 || 'Not provided'}
                                                                    </span>
                                                                </div>
                                                                {addr.address_line_2 && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-600">Address Line 2:</span>
                                                                        <span>{addr.address_line_2}</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">City:</span>
                                                                    <span className={!addr.city ? 'text-red-500 italic' : ''}>
                                                                        {addr.city || 'Not provided'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">State:</span>
                                                                    <span className={!addr.state ? 'text-red-500 italic' : ''}>
                                                                        {addr.state || 'Not provided'}
                                                                    </span>
                                                                </div>
                                                                {addr.postal_code && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-600">Postal Code:</span>
                                                                        <span>{addr.postal_code}</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-600">Country:</span>
                                                                    <span className={`font-medium ${!addr.country ? 'text-red-500 italic' : ''}`}>
                                                                        {addr.country || 'Not provided'}
                                                                    </span>
                                                                </div>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            ) : (
                                                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-500 italic">
                                                    No billing address provided
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div>
                                        <h3 className="font-semibold text-lg mb-3">Order Items</h3>
                                        <div className="space-y-3">
                                            {selectedOrder.items.map((item) => (
                                                <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                        {item.product && item.product.images && item.product.images.length > 0 ? (
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
                                                            SKU: {item.product_sku || 'N/A'} • Quantity: {item.quantity}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold">{formatCurrency(item.total_price)}</p>
                                                        <p className="text-sm text-gray-600">{formatCurrency(item.unit_price)} each</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Order Totals */}
                                    <div>
                                        <h3 className="font-semibold text-lg mb-3">Order Summary</h3>
                                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Subtotal:</span>
                                                <span>{formatCurrency(selectedOrder.subtotal || 0)}</span>
                                            </div>
                                            {selectedOrder.tax_amount && selectedOrder.tax_amount > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span>Tax:</span>
                                                    <span>{formatCurrency(selectedOrder.tax_amount)}</span>
                                                </div>
                                            )}
                                            {selectedOrder.shipping_amount && selectedOrder.shipping_amount > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span>Shipping:</span>
                                                    <span>{formatCurrency(selectedOrder.shipping_amount)}</span>
                                                </div>
                                            )}
                                            {selectedOrder.discount_amount && selectedOrder.discount_amount > 0 && (
                                                <div className="flex justify-between text-sm text-green-600">
                                                    <span>Discount:</span>
                                                    <span>-{formatCurrency(selectedOrder.discount_amount)}</span>
                                                </div>
                                            )}
                                            <Separator />
                                            <div className="flex justify-between font-semibold text-lg">
                                                <span>Total:</span>
                                                <span>{formatCurrency(selectedOrder.total_amount)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Information */}
                                    {(selectedOrder.delivery_instructions || selectedOrder.notes) && (
                                        <div>
                                            <h3 className="font-semibold text-lg mb-3">Additional Information</h3>
                                            <div className="space-y-3">
                                                {selectedOrder.delivery_instructions && (
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 mb-1">Delivery Instructions</h4>
                                                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                                            {selectedOrder.delivery_instructions}
                                                        </p>
                                                    </div>
                                                )}
                                                {selectedOrder.notes && (
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 mb-1">Order Notes</h4>
                                                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                                            {selectedOrder.notes}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>

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
