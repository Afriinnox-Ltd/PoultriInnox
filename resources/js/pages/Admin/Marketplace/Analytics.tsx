import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    TrendingUp,
    DollarSign,
    Package,
    ShoppingCart,
    Users,
    Activity,
    BarChart3,
    Calendar,
    Filter
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface SalesData {
    date: string;
    orders: number;
    revenue: number;
}

interface ProductPerformance {
    id: number;
    name: string;
    order_items_count: number;
    category: {
        name: string;
    };
}

interface VendorPerformance {
    id: number;
    business_name: string;
    orders_count: number;
    products_count: number;
    orders_sum_total_amount: number;
}

interface CategoryPerformance {
    id: number;
    name: string;
    products_count: number;
    total_sales: number;
}

interface RevenueStats {
    today: number;
    this_week: number;
    this_month: number;
    this_year: number;
}

interface AnalyticsProps {
    period: string;
    sales_data: SalesData[];
    product_performance: ProductPerformance[];
    vendor_performance: VendorPerformance[];
    category_performance: CategoryPerformance[];
    revenue_stats: RevenueStats;
}

export default function Analytics({
    period,
    sales_data,
    product_performance,
    vendor_performance,
    category_performance,
    revenue_stats
}: AnalyticsProps) {
    const [selectedPeriod, setSelectedPeriod] = useState(period);

    const handlePeriodChange = (newPeriod: string) => {
        setSelectedPeriod(newPeriod);
        router.get('/admin/marketplace/analytics', { period: newPeriod }, {
            preserveState: true,
            replace: true,
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('rw-RW', {
            style: 'currency',
            currency: 'RWF'
        }).format(amount || 0);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US').format(num || 0);
    };

    // Calculate totals from sales data
    const totalRevenue = sales_data.reduce((sum, item) => sum + (item.revenue || 0), 0);
    const totalOrders = sales_data.reduce((sum, item) => sum + (item.orders || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return (
        <AdminLayout>
            <Head title="Marketplace Analytics" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Marketplace Analytics</h2>
                        <p className="text-muted-foreground">
                            Comprehensive insights into marketplace performance
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <select
                                value={selectedPeriod}
                                onChange={(e) => handlePeriodChange(e.target.value)}
                                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <option value="day">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="year">This Year</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Revenue Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(revenue_stats.today)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">This Week</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(revenue_stats.this_week)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">This Month</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(revenue_stats.this_month)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">This Year</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(revenue_stats.this_year)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Period Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue ({selectedPeriod})</CardTitle>
                            <DollarSign className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalRevenue)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Orders ({selectedPeriod})</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{formatNumber(totalOrders)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
                            <TrendingUp className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{formatCurrency(averageOrderValue)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sales Data Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Sales Data</CardTitle>
                        <CardDescription>
                            Sales performance for the selected period
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Orders</TableHead>
                                    <TableHead>Revenue</TableHead>
                                    <TableHead>Avg. Order Value</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sales_data.length > 0 ? (
                                    sales_data.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                                            <TableCell>{formatNumber(item.orders)}</TableCell>
                                            <TableCell>{formatCurrency(item.revenue)}</TableCell>
                                            <TableCell>
                                                {item.orders > 0 ? formatCurrency(item.revenue / item.orders) : formatCurrency(0)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8">
                                            <div className="text-muted-foreground">
                                                No sales data available for this period.
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Performance Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Products */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Products</CardTitle>
                            <CardDescription>
                                Best performing products by sales volume
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Sales</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {product_performance.length > 0 ? (
                                        product_performance.map((product) => (
                                            <TableRow key={product.id}>
                                                <TableCell className="font-medium">{product.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{product.category.name}</Badge>
                                                </TableCell>
                                                <TableCell>{formatNumber(product.order_items_count)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-4">
                                                <div className="text-muted-foreground">No product data available.</div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Top Vendors */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Vendors</CardTitle>
                            <CardDescription>
                                Best performing vendors by revenue
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Vendor</TableHead>
                                        <TableHead>Orders</TableHead>
                                        <TableHead>Revenue</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {vendor_performance.length > 0 ? (
                                        vendor_performance.map((vendor) => (
                                            <TableRow key={vendor.id}>
                                                <TableCell className="font-medium">{vendor.business_name}</TableCell>
                                                <TableCell>{formatNumber(vendor.orders_count)}</TableCell>
                                                <TableCell>{formatCurrency(vendor.orders_sum_total_amount)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-4">
                                                <div className="text-muted-foreground">No vendor data available.</div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Category Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle>Category Performance</CardTitle>
                        <CardDescription>
                            Performance metrics by product category
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Products</TableHead>
                                    <TableHead>Total Sales</TableHead>
                                    <TableHead>Performance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {category_performance.length > 0 ? (
                                    category_performance.map((category) => (
                                        <TableRow key={category.id}>
                                            <TableCell className="font-medium">{category.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{formatNumber(category.products_count)} products</Badge>
                                            </TableCell>
                                            <TableCell>{formatNumber(category.total_sales)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            style={{
                                                                width: `${Math.min((category.total_sales / Math.max(...category_performance.map(c => c.total_sales))) * 100, 100)}%`
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm text-muted-foreground">
                                                        {Math.round((category.total_sales / Math.max(...category_performance.map(c => c.total_sales))) * 100)}%
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-4">
                                            <div className="text-muted-foreground">No category data available.</div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
