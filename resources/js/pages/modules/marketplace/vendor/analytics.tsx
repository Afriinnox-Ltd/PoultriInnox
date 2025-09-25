import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Package,
    TrendingUp,
    ShoppingCart,
    DollarSign,
    AlertTriangle,
    ArrowLeft,
    BarChart3,
    Activity
} from 'lucide-react';

interface Product {
    id: number;
    name: string;
    slug: string;
    stock_quantity?: number;
    category?: {
        name: string;
    };
}

interface TopSellingProduct {
    id: number;
    name: string;
    slug: string;
    total_sold: number;
    total_revenue: number;
}

interface MonthlySale {
    month: string;
    total_orders: number;
    total_revenue: number;
}

interface CategoryPerformance {
    category_name: string;
    product_count: number;
    total_sold: number;
    total_revenue: number;
}

interface VendorAnalyticsProps {
    stats: {
        totalProducts: number;
        activeProducts: number;
        lowStockProducts: number;
        outOfStockProducts: number;
        totalOrders: number;
        completedOrders: number;
        pendingOrders: number;
        totalRevenue: number;
    };
    topSellingProducts: TopSellingProduct[];
    lowStockItems: Product[];
    recentProducts: Product[];
    monthlySales: MonthlySale[];
    categoryPerformance: CategoryPerformance[];
}

export default function VendorAnalytics({
    stats,
    topSellingProducts,
    lowStockItems,
    monthlySales,
    categoryPerformance
}: VendorAnalyticsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('rw-RW', { 
            style: 'currency', 
            currency: 'RWF',
            minimumFractionDigits: 0 
        }).format(amount);
    };

    const formatMonth = (monthStr: string) => {
        const [year, month] = monthStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const completionRate = stats.totalOrders > 0 
        ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1) 
        : '0';

    return (
        <AppLayout>
            <Head title="Vendor Analytics" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/marketplace/vendor/dashboard">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                               <span className='lg:block hidden'>Back to Dashboard</span> 
                            </Link>
                        </Button>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
                            <p className="text-muted-foreground text-sm sm:text-base">
                                Track your store performance and product insights
                            </p>
                        </div>
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalProducts}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.activeProducts} active
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalOrders}</div>
                            <p className="text-xs text-muted-foreground">
                                {completionRate}% completion rate
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                            <p className="text-xs text-muted-foreground">
                                From {stats.completedOrders} completed orders
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Stock Alerts</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-500">
                                {stats.lowStockProducts + stats.outOfStockProducts}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.outOfStockProducts} out of stock
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                    {/* Top Selling Products */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Top Selling Products
                            </CardTitle>
                            <CardDescription>
                                Your best performing products by sales volume
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {topSellingProducts.length > 0 ? (
                                <div className="space-y-4">
                                    {topSellingProducts.map((product, index) => (
                                        <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-sm font-bold text-blue-600">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{product.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {product.total_sold} units sold
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold">{formatCurrency(product.total_revenue)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">No sales data available yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Low Stock Alert */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-orange-500" />
                                Low Stock Alerts
                            </CardTitle>
                            <CardDescription>
                                Products that need restocking
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {lowStockItems.length > 0 ? (
                                <div className="space-y-4">
                                    {lowStockItems.map((product) => (
                                        <div key={product.id} className="flex items-center justify-between p-3 border border-orange-200 bg-orange-50 rounded-lg">
                                            <div>
                                                <p className="font-medium">{product.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {product.category?.name}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="destructive" className="bg-orange-500">
                                                    {product.stock_quantity} left
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Activity className="h-12 w-12 mx-auto text-green-500 mb-4" />
                                    <p className="text-muted-foreground">All products well stocked!</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Monthly Sales Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Sales Trend (Last 6 Months)
                        </CardTitle>
                        <CardDescription>
                            Monthly revenue and order volume
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {monthlySales.length > 0 ? (
                            <div className="space-y-4">
                                {monthlySales.map((sale) => {
                                    const maxRevenue = Math.max(...monthlySales.map(s => s.total_revenue));
                                    const percentage = maxRevenue > 0 ? (sale.total_revenue / maxRevenue) * 100 : 0;
                                    return (
                                        <div key={sale.month} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">{formatMonth(sale.month)}</span>
                                                <div className="text-right">
                                                    <p className="font-bold">{formatCurrency(sale.total_revenue)}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {sale.total_orders} orders
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">No sales data for the last 6 months</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Category Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle>Category Performance</CardTitle>
                        <CardDescription>
                            Sales breakdown by product category
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {categoryPerformance.length > 0 ? (
                            <div className="space-y-4">
                                {categoryPerformance.map((category) => (
                                    <div key={category.category_name} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <p className="font-medium">{category.category_name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {category.product_count} products • {category.total_sold} units sold
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">{formatCurrency(category.total_revenue)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">No category data available</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
