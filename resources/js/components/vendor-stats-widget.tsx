import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Package, 
    ShoppingCart, 
    DollarSign, 
    TrendingUp, 
    AlertCircle,
    Eye,
    Clock,
    Star
} from 'lucide-react';
import { Link } from '@inertiajs/react';

import { MarketplaceSettings } from '@/types/marketplace';

interface VendorStatsProps {
    stats?: {
        total_products: number;
        total_orders: number;
        total_revenue: number;
        pending_orders: number;
        active_products?: number;
        draft_products?: number;
        low_stock_products?: number;
        monthly_sales?: number;
        conversion_rate?: number;
        avg_rating?: number;
        total_reviews?: number;
    };
    subscription?: {
        plan_name: string;
        products_used: number;
        product_limit: number | null;
        orders_this_month: number;
        order_limit: number | null;
        end_date: string;
        is_active: boolean;
    } | null;
    marketplaceSettings?: MarketplaceSettings;
    compact?: boolean;
    showActions?: boolean;
}

export function VendorStatsWidget({ 
    stats = {
        total_products: 0,
        total_orders: 0,
        total_revenue: 0,
        pending_orders: 0
    }, 
    subscription,
    marketplaceSettings,
    compact = false,
    showActions = true
}: VendorStatsProps) {
    const formatCurrency = (amount: number) => {
        const currency = marketplaceSettings?.general?.default_currency || 'RWF';
        const symbol = marketplaceSettings?.general?.currency_symbol || 'RWF';
        
        return new Intl.NumberFormat('rw-RW', {
            style: 'currency',
            currency: currency,
            currencyDisplay: 'symbol'
        }).format(amount).replace(currency, symbol);
    };

    const getUsagePercentage = (used: number, limit: number | null) => {
        if (!limit) return 0;
        return Math.min(100, (used / limit) * 100);
    };

    const getUsageColor = (percentage: number) => {
        if (percentage >= 90) return 'text-red-600 bg-red-50';
        if (percentage >= 70) return 'text-yellow-600 bg-yellow-50';
        return 'text-emerald-600 bg-emerald-50';
    };

    if (compact) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Products</p>
                            <p className="text-xl font-bold">{stats.total_products}</p>
                        </div>
                        <Package className="h-8 w-8 text-blue-600" />
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Orders</p>
                            <p className="text-xl font-bold">{stats.total_orders}</p>
                        </div>
                        <ShoppingCart className="h-8 w-8 text-emerald-600" />
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Revenue</p>
                            <p className="text-xl font-bold">{formatCurrency(stats.total_revenue)}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-purple-600" />
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Pending</p>
                            <p className="text-xl font-bold">{stats.pending_orders}</p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-orange-600" />
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Products</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_products}</p>
                                {stats.active_products !== undefined && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {stats.active_products} active, {stats.draft_products || 0} drafts
                                    </p>
                                )}
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
                                {stats.pending_orders > 0 && (
                                    <p className="text-xs text-orange-600 mt-1">
                                        {stats.pending_orders} pending
                                    </p>
                                )}
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
                                {stats.monthly_sales !== undefined && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatCurrency(stats.monthly_sales)} this month
                                    </p>
                                )}
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
                                <p className="text-sm font-medium text-gray-600">Performance</p>
                                <div className="flex items-center gap-2 mt-1">
                                    {stats.avg_rating && (
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                            <span className="text-lg font-bold">{stats.avg_rating}</span>
                                        </div>
                                    )}
                                    {stats.conversion_rate !== undefined && (
                                        <Badge variant="secondary">
                                            {stats.conversion_rate}% conversion
                                        </Badge>
                                    )}
                                </div>
                                {stats.total_reviews && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {stats.total_reviews} reviews
                                    </p>
                                )}
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Subscription Usage */}
            {subscription && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Subscription Usage - {subscription.plan_name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Product Usage */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium">Products</span>
                                    <span className="text-sm text-gray-600">
                                        {subscription.products_used} / {subscription.product_limit || '∞'}
                                    </span>
                                </div>
                                {subscription.product_limit && (
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(subscription.products_used, subscription.product_limit)).replace('text-', 'bg-').replace('bg-', 'bg-').split(' ')[0]}`}
                                            style={{ width: `${getUsagePercentage(subscription.products_used, subscription.product_limit)}%` }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Order Usage */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium">Monthly Orders</span>
                                    <span className="text-sm text-gray-600">
                                        {subscription.orders_this_month} / {subscription.order_limit || '∞'}
                                    </span>
                                </div>
                                {subscription.order_limit && (
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(subscription.orders_this_month, subscription.order_limit)).replace('text-', 'bg-').replace('bg-', 'bg-').split(' ')[0]}`}
                                            style={{ width: `${getUsagePercentage(subscription.orders_this_month, subscription.order_limit)}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Badge variant={subscription.is_active ? "default" : "secondary"}>
                                        {subscription.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                    <span className="text-sm text-gray-600">
                                        Expires: {new Date(subscription.end_date).toLocaleDateString()}
                                    </span>
                                </div>
                                {showActions && (
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href="/marketplace/vendor/subscription">
                                            Manage Plan
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Quick Actions */}
            {showActions && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Package className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">Add Product</p>
                                <p className="text-xs text-gray-600">Create a new listing</p>
                            </div>
                            <Button size="sm" asChild>
                                <Link href="/marketplace/vendor/products/create">Add</Link>
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <Eye className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">View Store</p>
                                <p className="text-xs text-gray-600">See public storefront</p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/marketplace/vendor/store">View</Link>
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Clock className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">Pending Orders</p>
                                <p className="text-xs text-gray-600">Review new orders</p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/marketplace/vendor/orders?status=pending">
                                    View ({stats.pending_orders})
                                </Link>
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}