import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    ArrowLeft,
    Package,
    DollarSign,
    ShoppingCart,
    Users,
    Star,
    TrendingUp,
    BarChart3,
    Eye,
    Check,
    X,
    Pause,
    Play,
    Image as ImageIcon,
    Save,
    AlertTriangle,
    CheckCircle,
    Clock,
    XCircle,
    Truck,
    Box,
    Pencil,
    Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

interface ProductImage {
    id: number;
    image_path: string;
    alt_text: string;
    is_primary: boolean;
}

interface Review {
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    user: { id: number; name: string; email: string };
}

interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    short_description: string;
    sku: string;
    price: number;
    compare_price: number | null;
    cost_price: number | null;
    stock_quantity: number;
    minimum_stock: number;
    unit_of_measure: string;
    status: string;
    is_featured: boolean;
    rating: number;
    total_reviews: number;
    total_sales: number;
    view_count: number;
    created_at: string;
    updated_at: string;
    admin_notes: string | null;
    priority: number;
    delivery_time: string | null;
    return_policy: string | null;
    requires_shipping: boolean;
    free_shipping: boolean;
    shipping_cost: number | null;
    vendor: {
        id: number;
        business_name: string;
        contact_person: string;
        user: { id: number; name: string; email: string };
    };
    category: { id: number; name: string };
    images: ProductImage[];
    reviews: Review[];
}

interface OrderItem {
    id: number;
    order_id: number;
    order_number: string;
    buyer_name: string;
    buyer_email: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    order_status: string;
    payment_status: string;
    ordered_at: string;
}

interface TopBuyer {
    user_id: number;
    name: string;
    email: string;
    total_qty: number;
    total_spent: number;
    order_count: number;
}

interface RevenueMonth {
    month: string;
    units_sold: number;
    revenue: number;
}

interface StatusBreakdown {
    status: string;
    count: number;
    total_qty: number;
}

interface Props {
    product: Product;
    stats: {
        total_orders: number;
        total_sold: number;
        total_revenue: number;
        average_rating: number;
        total_reviews: number;
        stock_status: string;
        stock_remaining: number;
    };
    orders: {
        data: OrderItem[];
        links?: any[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
    };
    topBuyers: TopBuyer[];
    revenueByMonth: RevenueMonth[];
    orderStatusBreakdown: StatusBreakdown[];
}

export default function Show({ product, stats, orders, topBuyers, revenueByMonth, orderStatusBreakdown }: Props) {
    const { auth } = usePage<{ auth: { user: any; permissions: string[] } }>().props;
    const can = (perm: string | string[]) => {
        if (auth.user?.role === 'admin') return true;
        const perms = auth.permissions || [];
        return Array.isArray(perm) ? perm.some(p => perms.includes(p)) : perms.includes(perm);
    };

    const [adminNotes, setAdminNotes] = useState(product.admin_notes || '');
    const [priority, setPriority] = useState(product.priority || 0);
    const [activeImage, setActiveImage] = useState(0);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF' }).format(amount);

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    const formatDateTime = (date: string) =>
        new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const getStatusBadge = (status: string) => {
        const map: Record<string, { variant: 'default' | 'destructive' | 'outline' | 'secondary'; className: string }> = {
            active: { variant: 'default', className: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
            pending: { variant: 'outline', className: 'bg-orange-100 text-orange-700 border-orange-300' },
            rejected: { variant: 'destructive', className: '' },
            inactive: { variant: 'secondary', className: '' },
            confirmed: { variant: 'default', className: 'bg-blue-100 text-blue-700 border-blue-300' },
            processing: { variant: 'outline', className: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
            shipped: { variant: 'outline', className: 'bg-purple-100 text-purple-700 border-purple-300' },
            delivered: { variant: 'default', className: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
            completed: { variant: 'default', className: 'bg-green-100 text-green-700 border-green-300' },
            cancelled: { variant: 'destructive', className: '' },
            refunded: { variant: 'secondary', className: 'bg-gray-100 text-gray-700' },
        };
        const cfg = map[status] || { variant: 'outline' as const, className: '' };
        return <Badge variant={cfg.variant} className={cfg.className}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
    };

    const getStockBadge = () => {
        if (stats.stock_remaining === 0) return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Out of Stock</Badge>;
        if (stats.stock_remaining <= (product.minimum_stock || 10)) return <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300"><AlertTriangle className="h-3 w-3 mr-1" /> Low Stock</Badge>;
        return <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300"><CheckCircle className="h-3 w-3 mr-1" /> In Stock</Badge>;
    };

    const handleApprove = () => {
        if (confirm(`Approve "${product.name}"?`)) {
            router.post(`/admin/marketplace/products/${product.id}/approve`, {}, {
                onSuccess: () => toast.success('Product approved'),
            });
        }
    };

    const handleReject = () => {
        const reason = prompt(`Reason for rejecting "${product.name}":`);
        if (reason) {
            router.post(`/admin/marketplace/products/${product.id}/reject`, { reason }, {
                onSuccess: () => toast.success('Product rejected'),
            });
        }
    };

    const handleToggleStatus = () => {
        router.patch(`/admin/marketplace/products/${product.id}/toggle-status`, {}, {
            onSuccess: () => toast.success('Status updated'),
        });
    };

    const handleToggleFeatured = () => {
        router.patch(`/admin/marketplace/products/${product.id}/toggle-featured`, {}, {
            onSuccess: () => toast.success('Featured status updated'),
        });
    };

    const handleSaveNotes = () => {
        router.patch(`/admin/marketplace/products/${product.id}/notes`, { admin_notes: adminNotes }, {
            onSuccess: () => toast.success('Notes saved'),
        });
    };

    const handleSavePriority = () => {
        router.patch(`/admin/marketplace/products/${product.id}/priority`, { priority }, {
            onSuccess: () => toast.success('Priority updated'),
        });
    };

    // Calculate profit margin
    const profitMargin = product.cost_price
        ? (((product.price - product.cost_price) / product.price) * 100).toFixed(1)
        : null;

    // Max revenue for bar chart scaling
    const maxRevenue = Math.max(...revenueByMonth.map(r => r.revenue), 1);

    return (
        <AdminLayout>
            <Head title={`${product.name} - Product Management`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/marketplace/products">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
                                {getStatusBadge(product.status)}
                                {product.is_featured && (
                                    <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                                        <Star className="h-3 w-3 mr-1" /> Featured
                                    </Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground text-sm mt-1">
                                SKU: {product.sku} &middot; {product.vendor?.business_name} &middot; {product.category?.name}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {product.status === 'pending' && can('approve-products') && (
                            <>
                                <Button size="sm" onClick={handleApprove}><Check className="h-4 w-4 mr-1" /> Approve</Button>
                                <Button size="sm" variant="destructive" onClick={handleReject}><X className="h-4 w-4 mr-1" /> Reject</Button>
                            </>
                        )}
                        {(product.status === 'active' || product.status === 'inactive') && can('edit-products') && (
                            <Button size="sm" variant="outline" onClick={handleToggleStatus}>
                                {product.status === 'active' ? <><Pause className="h-4 w-4 mr-1" /> Deactivate</> : <><Play className="h-4 w-4 mr-1" /> Activate</>}
                            </Button>
                        )}
                        {can('edit-products') && (
                        <Button size="sm" variant="outline" onClick={handleToggleFeatured}>
                            <Star className="h-4 w-4 mr-1" /> {product.is_featured ? 'Unfeature' : 'Feature'}
                        </Button>
                        )}
                        {can('edit-products') && (
                            <Link href={`/admin/marketplace/products/${product.id}/edit`}>
                                <Button size="sm" variant="outline"><Pencil className="h-4 w-4 mr-1" /> Edit</Button>
                            </Link>
                        )}
                        {can('delete-products') && (
                            <Button size="sm" variant="destructive" onClick={() => {
                                if (confirm(`Delete "${product.name}"? This cannot be undone.`)) {
                                    router.delete(`/admin/marketplace/products/${product.id}`, {
                                        onSuccess: () => toast.success('Product deleted'),
                                        onError: () => toast.error('Failed to delete product'),
                                    });
                                }
                            }}>
                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Orders</span>
                            </div>
                            <p className="text-2xl font-bold mt-1">{stats.total_orders}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Units Sold</span>
                            </div>
                            <p className="text-2xl font-bold mt-1">{stats.total_sold}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Revenue</span>
                            </div>
                            <p className="text-xl font-bold mt-1">{formatCurrency(stats.total_revenue)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-center gap-2">
                                <Box className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Stock</span>
                            </div>
                            <p className="text-2xl font-bold mt-1">{stats.stock_remaining}</p>
                            <div className="mt-1">{getStockBadge()}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="text-xs text-muted-foreground">Rating</span>
                            </div>
                            <p className="text-2xl font-bold mt-1">{Number(stats.average_rating).toFixed(1)}</p>
                            <p className="text-xs text-muted-foreground">{stats.total_reviews} reviews</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Views</span>
                            </div>
                            <p className="text-2xl font-bold mt-1">{product.view_count || 0}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="orders">
                    <TabsList>
                        <TabsTrigger value="orders">Orders ({orders.total})</TabsTrigger>
                        <TabsTrigger value="buyers">Top Buyers ({topBuyers.length})</TabsTrigger>
                        <TabsTrigger value="analytics">Sales Analytics</TabsTrigger>
                        <TabsTrigger value="details">Product Details</TabsTrigger>
                        <TabsTrigger value="reviews">Reviews ({stats.total_reviews})</TabsTrigger>
                    </TabsList>

                    {/* Orders Tab */}
                    <TabsContent value="orders">
                        <Card>
                            <CardHeader>
                                <CardTitle>Orders containing this product</CardTitle>
                                <CardDescription>All orders that include "{product.name}"</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Order Status Breakdown */}
                                {orderStatusBreakdown.length > 0 && (
                                    <div className="flex flex-wrap gap-3 mb-4">
                                        {orderStatusBreakdown.map((s) => (
                                            <div key={s.status} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 text-sm">
                                                {getStatusBadge(s.status)}
                                                <span className="font-medium">{s.count}</span>
                                                <span className="text-muted-foreground">({s.total_qty} units)</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order #</TableHead>
                                            <TableHead>Buyer</TableHead>
                                            <TableHead>Qty</TableHead>
                                            <TableHead>Unit Price</TableHead>
                                            <TableHead>Total</TableHead>
                                            <TableHead>Order Status</TableHead>
                                            <TableHead>Payment</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.data.length > 0 ? orders.data.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-mono text-sm">{item.order_number}</TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium text-sm">{item.buyer_name}</div>
                                                        <div className="text-xs text-muted-foreground">{item.buyer_email}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium">{item.quantity}</TableCell>
                                                <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                                                <TableCell className="font-medium">{formatCurrency(item.total_price)}</TableCell>
                                                <TableCell>{getStatusBadge(item.order_status)}</TableCell>
                                                <TableCell>{getStatusBadge(item.payment_status)}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{formatDateTime(item.ordered_at)}</TableCell>
                                                <TableCell>
                                                    <Link href={`/admin/marketplace/orders/${item.order_id}`}>
                                                        <Button variant="ghost" size="sm"><Eye className="h-3.5 w-3.5" /></Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                                    No orders yet for this product.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                {orders.last_page > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <p className="text-sm text-muted-foreground">
                                            Showing {orders.from} to {orders.to} of {orders.total} orders
                                        </p>
                                        <div className="flex gap-2">
                                            {orders.links?.map((link: any, i: number) => (
                                                <Button
                                                    key={i}
                                                    variant={link.active ? 'default' : 'outline'}
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.visit(link.url)}
                                                >
                                                    {link.label.replace(/&laquo;|&raquo;/g, (m: string) => m === '&laquo;' ? '«' : '»')}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Top Buyers Tab */}
                    <TabsContent value="buyers">
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Buyers</CardTitle>
                                <CardDescription>Customers who purchased this product the most</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>#</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Orders</TableHead>
                                            <TableHead>Total Units</TableHead>
                                            <TableHead>Total Spent</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {topBuyers.length > 0 ? topBuyers.map((buyer, index) => (
                                            <TableRow key={buyer.user_id}>
                                                <TableCell className="font-medium">{index + 1}</TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{buyer.name}</div>
                                                        <div className="text-xs text-muted-foreground">{buyer.email}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{buyer.order_count}</TableCell>
                                                <TableCell>{buyer.total_qty}</TableCell>
                                                <TableCell className="font-medium">{formatCurrency(buyer.total_spent)}</TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                    No buyers yet.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Sales Analytics Tab */}
                    <TabsContent value="analytics">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Revenue by Month */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" /> Monthly Revenue (Last 6 months)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {revenueByMonth.length > 0 ? (
                                        <div className="space-y-3">
                                            {revenueByMonth.map((m) => (
                                                <div key={m.month}>
                                                    <div className="flex items-center justify-between text-sm mb-1">
                                                        <span className="font-medium">{m.month}</span>
                                                        <span className="text-muted-foreground">{m.units_sold} units &middot; {formatCurrency(m.revenue)}</span>
                                                    </div>
                                                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary rounded-full transition-all"
                                                            style={{ width: `${(m.revenue / maxRevenue) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center py-8 text-muted-foreground">No sales data available.</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Pricing & Profit */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5" /> Pricing & Profit
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 rounded-lg bg-muted/50">
                                                <p className="text-xs text-muted-foreground">Selling Price</p>
                                                <p className="text-lg font-bold">{formatCurrency(product.price)}</p>
                                            </div>
                                            {product.compare_price && (
                                                <div className="p-3 rounded-lg bg-muted/50">
                                                    <p className="text-xs text-muted-foreground">Compare Price</p>
                                                    <p className="text-lg font-bold line-through text-muted-foreground">{formatCurrency(product.compare_price)}</p>
                                                </div>
                                            )}
                                            {product.cost_price && (
                                                <div className="p-3 rounded-lg bg-muted/50">
                                                    <p className="text-xs text-muted-foreground">Cost Price</p>
                                                    <p className="text-lg font-bold">{formatCurrency(product.cost_price)}</p>
                                                </div>
                                            )}
                                            {profitMargin && (
                                                <div className="p-3 rounded-lg bg-emerald-50">
                                                    <p className="text-xs text-muted-foreground">Profit Margin</p>
                                                    <p className="text-lg font-bold text-emerald-600">{profitMargin}%</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="border-t pt-4 space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Total Revenue</span>
                                                <span className="font-medium">{formatCurrency(stats.total_revenue)}</span>
                                            </div>
                                            {product.cost_price && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Estimated Profit</span>
                                                    <span className="font-medium text-emerald-600">
                                                        {formatCurrency((product.price - product.cost_price) * stats.total_sold)}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Avg Revenue per Order</span>
                                                <span className="font-medium">
                                                    {stats.total_orders > 0 ? formatCurrency(stats.total_revenue / stats.total_orders) : formatCurrency(0)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Stock Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Box className="h-5 w-5" /> Inventory
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 rounded-lg bg-muted/50">
                                                <p className="text-xs text-muted-foreground">Current Stock</p>
                                                <p className="text-lg font-bold">{stats.stock_remaining} {product.unit_of_measure || 'units'}</p>
                                                <div className="mt-1">{getStockBadge()}</div>
                                            </div>
                                            <div className="p-3 rounded-lg bg-muted/50">
                                                <p className="text-xs text-muted-foreground">Minimum Stock</p>
                                                <p className="text-lg font-bold">{product.minimum_stock || 0} {product.unit_of_measure || 'units'}</p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-muted/50">
                                                <p className="text-xs text-muted-foreground">Total Sold</p>
                                                <p className="text-lg font-bold">{stats.total_sold} {product.unit_of_measure || 'units'}</p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-muted/50">
                                                <p className="text-xs text-muted-foreground">Sell-through Rate</p>
                                                <p className="text-lg font-bold">
                                                    {stats.total_sold + stats.stock_remaining > 0
                                                        ? ((stats.total_sold / (stats.total_sold + stats.stock_remaining)) * 100).toFixed(1)
                                                        : 0}%
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Shipping Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Truck className="h-5 w-5" /> Shipping & Delivery
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Requires Shipping</span>
                                            <span>{product.requires_shipping ? 'Yes' : 'No'}</span>
                                        </div>
                                        {product.free_shipping ? (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Shipping</span>
                                                <Badge variant="outline" className="bg-emerald-100 text-emerald-700">Free Shipping</Badge>
                                            </div>
                                        ) : product.shipping_cost ? (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Shipping Cost</span>
                                                <span>{formatCurrency(product.shipping_cost)}</span>
                                            </div>
                                        ) : null}
                                        {product.delivery_time && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Delivery Time</span>
                                                <span>{product.delivery_time}</span>
                                            </div>
                                        )}
                                        {product.return_policy && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Return Policy</span> 
                                                {product.return_policy ? (
                                                    <div
                                                        className="prose prose-emerald max-w-none dark:prose-invert text-gray-700 ql-editor"
                                                        dangerouslySetInnerHTML={{ __html: product.return_policy }}
                                                    />
                                                ) : (
                                                        <p className="text-gray-500">No return_policy available.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Product Details Tab */}
                    <TabsContent value="details">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Images */}
                            <Card className="lg:col-span-1">
                                <CardHeader>
                                    <CardTitle>Images</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {product.images?.length > 0 ? (
                                        <div className="space-y-3">
                                            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                                                <img
                                                    src={product.images[activeImage]?.image_path}
                                                    alt={product.images[activeImage]?.alt_text || product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            {product.images.length > 1 && (
                                                <div className="grid grid-cols-4 gap-2">
                                                    {product.images.map((img, i) => (
                                                        <button
                                                            key={img.id}
                                                            onClick={() => setActiveImage(i)}
                                                            className={`aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                                                                i === activeImage ? 'border-primary' : 'border-transparent'
                                                            }`}
                                                        >
                                                            <img src={img.image_path} alt={img.alt_text} className="w-full h-full object-cover" />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                                            <ImageIcon className="h-12 w-12 text-muted-foreground" />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Details */}
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Product Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className=' break-words'>
                                        <Label className="text-muted-foreground text-xs">Description</Label>
                                        {product.description ? (
                                            <div
                                                className="prose prose-emerald max-w-none dark:prose-invert text-gray-700 ql-editor"
                                                dangerouslySetInnerHTML={{ __html: product.description }}
                                            />
                                        ) : (
                                            <p className="text-gray-500">No description available.</p>
                                        )}

                                    </div>
                                    {product.short_description && (
                                        <div>
                                            <Label className="text-muted-foreground text-xs">Short Description</Label>
                                            <p className="text-sm mt-1">{product.short_description}</p>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-muted-foreground text-xs">Vendor</Label>
                                            <p className="text-sm font-medium mt-1">{product.vendor?.business_name}</p>
                                            <p className="text-xs text-muted-foreground">{product.vendor?.user?.email}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground text-xs">Category</Label>
                                            <p className="text-sm font-medium mt-1">{product.category?.name}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground text-xs">Created</Label>
                                            <p className="text-sm mt-1">{formatDate(product.created_at)}</p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground text-xs">Last Updated</Label>
                                            <p className="text-sm mt-1">{formatDate(product.updated_at)}</p>
                                        </div>
                                    </div>

                                    {/* Admin Controls */}
                                    <div className="border-t pt-4 space-y-4">
                                        {/* <h4 className="font-semibold">Admin Controls</h4>
                                        <div>
                                            <Label htmlFor="priority">Priority (0-100)</Label>
                                            <div className="flex gap-2 mt-1">
                                                <Input
                                                    id="priority"
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    value={priority}
                                                    onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                                                    className="w-24"
                                                />
                                                <Button size="sm" onClick={handleSavePriority}>
                                                    <Save className="h-4 w-4 mr-1" /> Save
                                                </Button>
                                            </div>
                                        </div> */}
                                        <div>
                                            <Label htmlFor="notes">Admin Notes</Label>
                                            <Textarea
                                                id="notes"
                                                value={adminNotes}
                                                onChange={(e) => setAdminNotes(e.target.value)}
                                                rows={3}
                                                className="mt-1"
                                                placeholder="Internal notes about this product..."
                                            />
                                            <Button size="sm" onClick={handleSaveNotes} className="mt-2">
                                                <Save className="h-4 w-4 mr-1" /> Save Notes
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Reviews Tab */}
                    <TabsContent value="reviews">
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer Reviews</CardTitle>
                                <CardDescription>
                                    Average: {Number(stats.average_rating).toFixed(1)} / 5 from {stats.total_reviews} reviews
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {product.reviews?.length > 0 ? (
                                    <div className="space-y-4">
                                        {product.reviews.map((review) => (
                                            <div key={review.id} className="border rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-sm">{review.user?.name}</span>
                                                        <span className="text-xs text-muted-foreground">{review.user?.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star
                                                                key={star}
                                                                className={`h-3.5 w-3.5 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{review.comment}</p>
                                                <p className="text-xs text-muted-foreground mt-2">{formatDate(review.created_at)}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center py-8 text-muted-foreground">No reviews yet.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
