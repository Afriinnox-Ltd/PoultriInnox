import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ShoppingCart,
    Package,
    Users,
    Store,
    TrendingUp,
    DollarSign,
    AlertTriangle,
    CheckCircle,
    Clock,
    Eye
} from 'lucide-react';

interface MarketplaceAdminDashboardProps {
    stats: {
        total_products: number;
        active_products: number;
        pending_products: number;
        total_vendors: number;
        approved_vendors: number;
        pending_vendors: number;
        total_orders: number;
        pending_orders: number;
        completed_orders: number;
        total_categories: number;
        active_categories: number;
    };
    recent_products: any[];
    recent_vendors: any[];
    recent_orders: any[];
    monthly_sales: any[];
    top_categories: any[];
}

export default function MarketplaceAdminDashboard({
    stats,
    recent_products,
    recent_vendors,
    recent_orders,
    monthly_sales,
    top_categories
}: MarketplaceAdminDashboardProps) {
    return (
        <AdminLayout>
            <Head title="Marketplace Administration" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Marketplace Administration</h2>
                        <p className="text-muted-foreground">
                            Manage vendors, products, orders, and marketplace settings
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <a href="/admin/marketplace/analytics">
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Analytics
                            </a>
                        </Button>
                        <Button asChild>
                            <a href="/marketplace">
                                <Eye className="h-4 w-4 mr-2" />
                                View Marketplace
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Products Stats */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Products</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_products}</div>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <Badge variant="default" className="text-xs bg-emerald-100 text-emerald-700 border-emerald-300">
                                    {stats.active_products} Active
                                </Badge>
                                {stats.pending_products > 0 && (
                                    <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 border-orange-300">
                                        {stats.pending_products} Pending
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Vendors Stats */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Vendors</CardTitle>
                            <Store className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_vendors}</div>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <Badge variant="default" className="text-xs bg-emerald-100 text-emerald-700 border-emerald-300">
                                    {stats.approved_vendors} Approved
                                </Badge>
                                {stats.pending_vendors > 0 && (
                                    <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 border-orange-300">
                                        {stats.pending_vendors} Pending
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Orders Stats */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Orders</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_orders}</div>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <Badge variant="default" className="text-xs bg-emerald-100 text-emerald-700 border-emerald-300">
                                    {stats.completed_orders} Completed
                                </Badge>
                                {stats.pending_orders > 0 && (
                                    <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 border-orange-300">
                                        {stats.pending_orders} Pending
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Categories Stats */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Categories</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_categories}</div>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <Badge variant="default" className="text-xs bg-emerald-100 text-emerald-700 border-emerald-300">
                                    {stats.active_categories} Active
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="text-sm">Manage Categories</CardTitle>
                            <CardDescription>
                                Create and organize product categories
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" size="sm" asChild className="w-full">
                                <a href="/admin/marketplace/categories">
                                    Manage Categories
                                </a>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="text-sm">Vendor Approvals</CardTitle>
                            <CardDescription>
                                Review and approve vendor applications
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" size="sm" asChild className="w-full">
                                <a href="/admin/marketplace/vendors?status=pending">
                                    Review Vendors
                                </a>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="text-sm">Product Reviews</CardTitle>
                            <CardDescription>
                                Review pending product submissions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" size="sm" asChild className="w-full">
                                <a href="/admin/marketplace/products?status=pending">
                                    Review Products
                                </a>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="text-sm">Order Management</CardTitle>
                            <CardDescription>
                                Monitor and manage marketplace orders
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" size="sm" asChild className="w-full">
                                <a href="/admin/marketplace/orders">
                                    View Orders
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Recent Products */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Recent Products</CardTitle>
                            <CardDescription>
                                Latest product submissions
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {recent_products.length > 0 ? (
                                recent_products.map((product: any) => (
                                    <div key={product.id} className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {product.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                by {product.vendor?.business_name}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={
                                                product.status === 'active' ? 'default' :
                                                product.status === 'pending' ? 'secondary' : 'outline'
                                            }
                                            className={`text-xs ${
                                                product.status === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
                                                product.status === 'pending' ? 'bg-orange-100 text-orange-700 border-orange-300' : ''
                                            }`}
                                        >
                                            {product.status}
                                        </Badge>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No recent products</p>
                            )}
                            {recent_products.length > 0 && (
                                <Button variant="ghost" size="sm" asChild className="w-full">
                                    <a href="/admin/marketplace/products">View All</a>
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Vendors */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Recent Vendors</CardTitle>
                            <CardDescription>
                                Latest vendor applications
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {recent_vendors.length > 0 ? (
                                recent_vendors.map((vendor: any) => (
                                    <div key={vendor.id} className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {vendor.business_name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {vendor.contact_person}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={
                                                vendor.status === 'approved' ? 'default' :
                                                vendor.status === 'pending' ? 'secondary' :
                                                vendor.status === 'rejected' ? 'destructive' : 'outline'
                                            }
                                            className={`text-xs ${
                                                vendor.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
                                                vendor.status === 'pending' ? 'bg-orange-100 text-orange-700 border-orange-300' : ''
                                            }`}
                                        >
                                            {vendor.status}
                                        </Badge>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No recent vendors</p>
                            )}
                            {recent_vendors.length > 0 && (
                                <Button variant="ghost" size="sm" asChild className="w-full">
                                    <a href="/admin/marketplace/vendors">View All</a>
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Orders */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Recent Orders</CardTitle>
                            <CardDescription>
                                Latest marketplace orders
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {recent_orders.length > 0 ? (
                                recent_orders.map((order: any) => (
                                    <div key={order.id} className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                #{order.order_number}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                ${order.total_amount} • {order.user?.name}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={
                                                order.status === 'delivered' ? 'default' :
                                                order.status === 'pending' ? 'secondary' :
                                                order.status === 'cancelled' ? 'destructive' : 'outline'
                                            }
                                            className={`text-xs ${
                                                order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
                                                order.status === 'pending' ? 'bg-orange-100 text-orange-700 border-orange-300' : ''
                                            }`}
                                        >
                                            {order.status}
                                        </Badge>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No recent orders</p>
                            )}
                            {recent_orders.length > 0 && (
                                <Button variant="ghost" size="sm" asChild className="w-full">
                                    <a href="/admin/marketplace/orders">View All</a>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
