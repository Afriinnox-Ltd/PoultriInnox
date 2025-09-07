import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Search,
    Eye,
    Package,
    DollarSign,
    Calendar,
    Filter,
    MoreHorizontal
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface Order {
    id: number;
    order_number: string;
    user_id: number;
    vendor_id: number;
    status: string;
    total_amount: number;
    shipping_amount: number;
    tax_amount: number;
    created_at: string;
    updated_at: string;
    user: {
        name: string;
        email: string;
    };
    vendor: {
        business_name: string;
    };
    order_items: Array<{
        id: number;
        product_name: string;
        quantity: number;
        unit_price: number;
        total_price: number;
    }>;
}

interface OrderAdminProps {
    orders: {
        data: Order[];
        links?: any[];
        meta?: {
            total: number;
            from: number;
            to: number;
            last_page: number;
            current_page: number;
        };
    };
    vendors: Array<{
        id: number;
        business_name: string;
    }>;
    filters: {
        search?: string;
        status?: string;
        vendor?: string;
        date_from?: string;
        date_to?: string;
        amount_min?: string;
        amount_max?: string;
        sort_by?: string;
        sort_direction?: string;
    };
    status_options: Record<string, string>;
}

export default function OrderAdmin({ orders, vendors, filters, status_options }: OrderAdminProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [vendorFilter, setVendorFilter] = useState(filters.vendor || 'all');

    const handleSearch = () => {
        router.get('/admin/marketplace/orders', {
            search: searchTerm,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            vendor: vendorFilter !== 'all' ? vendorFilter : undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', label: 'Pending' },
            confirmed: { color: 'bg-blue-100 text-blue-700 border-blue-300', label: 'Confirmed' },
            processing: { color: 'bg-purple-100 text-purple-700 border-purple-300', label: 'Processing' },
            shipped: { color: 'bg-indigo-100 text-indigo-700 border-indigo-300', label: 'Shipped' },
            delivered: { color: 'bg-emerald-100 text-emerald-700 border-emerald-300', label: 'Delivered' },
            cancelled: { color: 'bg-red-100 text-red-700 border-red-300', label: 'Cancelled' },
            refunded: { color: 'bg-gray-100 text-gray-700 border-gray-300', label: 'Refunded' },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        return (
            <Badge variant="outline" className={config.color}>
                {config.label}
            </Badge>
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('rw-RW', {
            style: 'currency',
            currency: 'RWF'
        }).format(amount);
    };

    return (
        <AdminLayout>
            <Head title="Order Management" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Order Management</h2>
                        <p className="text-muted-foreground">
                            Manage marketplace orders and track fulfillment
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div>
                                <Label htmlFor="search">Search Orders</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Search by order number, customer..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="all">All Status</option>
                                    {Object.entries(status_options).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="vendor">Vendor</Label>
                                <select
                                    id="vendor"
                                    value={vendorFilter}
                                    onChange={(e) => setVendorFilter(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="all">All Vendors</option>
                                    {vendors.map((vendor) => (
                                        <option key={vendor.id} value={vendor.id}>{vendor.business_name}</option>
                                    ))}
                                </select>
                            </div>
                            <Button onClick={handleSearch}>
                                <Filter className="h-4 w-4 mr-2" />
                                Apply Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Orders Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Orders ({orders.meta?.total || orders.data.length})</CardTitle>
                        <CardDescription>
                            Manage all marketplace orders
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order #</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.data.length > 0 ? (
                                    orders.data.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>
                                                <div className="font-medium">{order.order_number}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{order.user.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {order.user.email}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{order.vendor.business_name}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {order.order_items.length} items
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{formatCurrency(order.total_amount)}</div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(order.status)}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => router.get(`/admin/marketplace/orders/${order.id}`)}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8">
                                            <div className="text-muted-foreground">
                                                No orders found. Orders will appear here when customers make purchases.
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {orders.meta && orders.meta.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {orders.meta.from} to {orders.meta.to} of {orders.meta.total} results
                                </div>
                                <div className="flex space-x-2">
                                    {orders.links?.map((link: any, index: number) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => link.url && router.visit(link.url)}
                                            disabled={!link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
