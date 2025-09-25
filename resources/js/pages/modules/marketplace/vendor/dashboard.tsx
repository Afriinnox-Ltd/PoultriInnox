import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VendorDashboardStats, Order, Product } from '@/types/marketplace';
import {
    Store,
    Package,
    ShoppingCart,
    DollarSign,
    TrendingUp,
    Plus,
    Edit,
    Eye,
    AlertCircle,
    Calendar,
    Users,
    Star,
    BarChart3
} from 'lucide-react';
import VendorLayout from '@/layouts/vendor-layout';

interface VendorDashboardProps {
    vendor: {
        id: number;
        business_name: string;
        status: 'pending' | 'approved' | 'rejected' | 'suspended';
        is_verified: boolean;
        is_active: boolean;
        created_at: string;
    };
    stats: VendorDashboardStats;
    recent_orders: Array<Order & {
        user: { name: string; email: string };
        items: Array<{
            id: number;
            product_name: string;
            quantity: number;
            unit_price: number;
            total_price: number;
        }>;
    }>;
    products: Array<Product & {
        total_sales: number;
        total_revenue: number;
    }>;
    currentSubscription?: {
        plan_name: string;
        price: number;
        billing_cycle: string;
        start_date: string;
        end_date: string;
        days_remaining: number | null;
        is_active: boolean;
        auto_renew: boolean;
        product_limit: number | null;
        order_limit: number | null;
        allow_cod: boolean;
    } | null;
    subscriptionUsage?: {
        products_used: number;
        products_limit: number | null;
        orders_this_month: number;
        order_limit: number | null;
        usage_percentage: {
            products: number;
            orders: number;
        };
    } | null;
    needsUpgrade?: boolean;
    upgradeReason?: string;
    availablePlans?: Array<{
        id: number;
        name: string;
        price: number;
        billing_cycle: 'monthly' | 'yearly';
        product_limit: number | null;
        order_limit: number | null;
        allow_cod: boolean;
        features: string[];
        is_popular?: boolean;
        is_premium?: boolean;
    }>;
}

export default function VendorDashboard({ 
    vendor, 
    stats, 
    recent_orders, 
    products, 
    currentSubscription,
    subscriptionUsage,
    needsUpgrade = false,
    upgradeReason,
    availablePlans = []
}: VendorDashboardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'processing': return 'bg-purple-100 text-purple-800';
            case 'shipped': return 'bg-emerald-100 text-emerald-800';
            case 'delivered': return 'bg-emerald-100 text-emerald-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
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
            day: 'numeric'
        });
    };



    return (
        <VendorLayout
            title="Vendor Dashboard"
            vendor={vendor}
            currentSubscription={currentSubscription}
            subscriptionUsage={subscriptionUsage}
            needsUpgrade={needsUpgrade}
            upgradeReason={upgradeReason}
            breadcrumbItems={[]}
        >
            <div className="flex justify-between lg:flex-row flex-col gap-4 lg:items-center lg:flex-row flex-c mb-6">
                <div>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Welcome back, {vendor.business_name}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Here's what's happening with your store today.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => window.location.href = '/marketplace/vendor/products/create'}
                        size="sm"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                    </Button>
                    <Button
                        onClick={() => window.location.href = '/marketplace/vendor/profile'}
                        variant="outline"
                        size="sm"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                    </Button>
                </div>
            </div>

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Products</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.total_products}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Package className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.total_orders}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                                        <ShoppingCart className="h-6 w-6 text-emerald-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_revenue)}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <DollarSign className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.pending_orders}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <AlertCircle className="h-6 w-6 text-orange-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Revenue Chart */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <BarChart3 className="h-5 w-5 mr-2" />
                                Revenue Overview (Last 30 Days)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                                <div className="text-center">
                                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-500">Revenue chart would be displayed here</p>
                                    <p className="text-sm text-gray-400">Integration with chart library needed</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Main Content Tabs */}
                    <Tabs defaultValue="orders" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="orders">Recent Orders</TabsTrigger>
                            <TabsTrigger value="products">My Products</TabsTrigger>
                            <TabsTrigger value="analytics">Analytics</TabsTrigger>
                            <TabsTrigger value="settings">Settings</TabsTrigger>
                        </TabsList>

                        {/* Recent Orders Tab */}
                        <TabsContent value="orders">
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle>Recent Orders</CardTitle>
                                        <Button
                                            onClick={() => window.location.href = '/marketplace/vendor/orders'}
                                            variant="outline"
                                            size="sm"
                                        >
                                            View All Orders
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {recent_orders.length === 0 ? (
                                        <div className="text-center py-8">
                                            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-500">No orders yet</p>
                                            <p className="text-sm text-gray-400">Orders will appear here once customers start purchasing your products</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {recent_orders.map((order) => (
                                                <div key={order.id} className="border rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h4 className="font-semibold">Order #{order.order_number}</h4>
                                                            <p className="text-sm text-gray-600">
                                                                by {order.user.name} • {formatDate(order.created_at)}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <Badge className={getStatusColor(order.status)}>
                                                                {order.status}
                                                            </Badge>
                                                            <p className="text-lg font-bold mt-1">
                                                                {formatCurrency(order.total_amount)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        {order.items.map((item) => (
                                                            <div key={item.id} className="flex justify-between text-sm">
                                                                <span>{item.product_name} × {item.quantity}</span>
                                                                <span>{formatCurrency(item.total_price)}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="flex gap-2 mt-3">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => window.location.href = `/marketplace/vendor/orders/${order.id}`}
                                                        >
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            View
                                                        </Button>
                                                        {order.status === 'confirmed' && (
                                                            <Button size="sm">
                                                                Mark as Processing
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Products Tab */}
                        <TabsContent value="products">
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle>My Products</CardTitle>
                                        <Button
                                            onClick={() => window.location.href = '/marketplace/vendor/products'}
                                            variant="outline"
                                            size="sm"
                                        >
                                            Manage Products
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {products.length === 0 ? (
                                        <div className="text-center py-8">
                                            <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-500">No products yet</p>
                                            <p className="text-sm text-gray-400 mb-4">
                                                Start by adding your first product to begin selling
                                            </p>
                                            <Button onClick={() => window.location.href = '/marketplace/vendor/products/create'}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add First Product
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {products.slice(0, 6).map((product) => (
                                                <div key={product.id} className="border rounded-lg p-4">
                                                    <div className="aspect-square bg-gray-100 rounded-lg mb-3">
                                                        {product.images && product.images.length > 0 ? (
                                                            <img
                                                                src={product.images[0].image_path}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover rounded-lg"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                <Package className="h-8 w-8" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <h4 className="font-semibold line-clamp-2 mb-2">{product.name}</h4>

                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-lg font-bold text-emerald-600">
                                                            {formatCurrency(product.price)}
                                                        </span>
                                                        <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                                                            {product.status}
                                                        </Badge>
                                                    </div>

                                                    <div className="text-sm text-gray-600 space-y-1">
                                                        <div className="flex justify-between">
                                                            <span>Stock:</span>
                                                            <span>{product.stock_quantity}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Sales:</span>
                                                            <span>{product.total_sales || 0}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Revenue:</span>
                                                            <span>{formatCurrency(product.total_revenue || 0)}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2 mt-3">
                                                        <Link href={`/marketplace/vendor/products/${product.id}/edit`}>
                                                            <Button
                                                                size="sm"
                                                            >
                                                                <Edit className="h-4 w-4 mr-1" />
                                                                Edit
                                                            </Button>
                                                        </Link>

                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Analytics Tab */}
                        <TabsContent value="analytics">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Top Performing Products</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {products && products.length > 0 ? (
                                            <div className="space-y-3">
                                                {products.slice(0, 5).map((product, index) => (
                                                    <div key={product.id} className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium line-clamp-1">{product.name}</p>
                                                            <p className="text-sm text-gray-600">
                                                                {product.total_sales || 0} sales
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold">{formatCurrency(product.price)}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6">
                                                <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                <p className="text-gray-500">No sales data yet</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Performance Metrics</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">Average Rating</span>
                                            <div className="flex items-center">
                                                <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                                                <span>4.8</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">Total Reviews</span>
                                            <span>127</span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">Response Rate</span>
                                            <span>98%</span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">On-time Delivery</span>
                                            <span>95%</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Settings Tab */}
                        <TabsContent value="settings">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Quick Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <Button
                                            onClick={() => window.location.href = '/marketplace/vendor/profile'}
                                            variant="outline"
                                            className="w-full justify-start"
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Business Profile
                                        </Button>

                                        <Button
                                            onClick={() => window.location.href = '/marketplace/vendor/products'}
                                            variant="outline"
                                            className="w-full justify-start"
                                        >
                                            <Package className="h-4 w-4 mr-2" />
                                            Manage Products
                                        </Button>

                                        <Button
                                            onClick={() => window.location.href = '/marketplace/vendor/orders'}
                                            variant="outline"
                                            className="w-full justify-start"
                                        >
                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                            View All Orders
                                        </Button>

                                        <Button
                                            onClick={() => window.location.href = '/marketplace/vendor/analytics'}
                                            variant="outline"
                                            className="w-full justify-start"
                                        >
                                            <BarChart3 className="h-4 w-4 mr-2" />
                                            View Analytics
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Account Status</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">Verification Status</span>
                                            <Badge variant={vendor.is_verified ? 'default' : 'secondary'}>
                                                {vendor.is_verified ? 'Verified' : 'Unverified'}
                                            </Badge>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">Account Status</span>
                                            <Badge variant={vendor.is_active ? 'default' : 'secondary'}>
                                                {vendor.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">Member Since</span>
                                            <span className="text-sm">{formatDate(vendor.created_at)}</span>
                                        </div>

                                        <div className="pt-4 border-t">
                                            <Button variant="outline" className="w-full">
                                                <Users className="h-4 w-4 mr-2" />
                                                Contact Support
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </VendorLayout>
    );
}
