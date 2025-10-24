import { useMemo } from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VendorDashboardStats, Order, Product } from '@/types/marketplace';
import {
    Package,
    ShoppingCart,
    DollarSign,
    TrendingUp,
    Plus,
    Edit,
    Eye,
    Users,
    Star,
    BarChart3,
    Calculator,
    Info,
    Percent
} from 'lucide-react';
import VendorLayout from '@/layouts/vendor-layout';
import { useCommissionCalculations } from '@/utils/commission';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Crown, AlertCircle } from 'lucide-react';

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
    marketplaceSettings?: {
        commission: {
            default_commission_rate: number;
            commission_type: 'percentage' | 'fixed';
            min_commission_amount: number;
            max_commission_amount: number;
        };
        fees: {
            platform_fee_rate: number;
            transaction_fee_rate: number;
            withdrawal_fee: number;
        };
        tax: {
            tax_rate: number;
            tax_inclusive: boolean;
        };
        general?: {
            currency: string;
            currency_symbol: string;
        };
        payout: {
            min_payout_amount: number;
            payout_schedule: string;
            auto_payout_enabled: boolean;
        };
    };
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
    monthlySales?: Array<{
        month: string;
        sales: number;
        orders: number;
    }>;
    orderStatusDistribution?: {
        pending: number;
        processing: number;
        completed: number;
        cancelled: number;
    };
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
    marketplaceSettings,
    monthlySales = [],
    orderStatusDistribution,
    currentSubscription,
    subscriptionUsage,
    needsUpgrade = false,
    upgradeReason,
}: VendorDashboardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-emerald-100 text-emerald-800';
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

    // Commission and fee calculations with comprehensive marketplace insights
    const commissionCalculations = useCommissionCalculations(marketplaceSettings);

    // Memoized calculations for better performance
    const marketplaceInsights = useMemo(() => {
        if (!marketplaceSettings) {
            return {
                estimatedEarnings: { vendorEarnings: stats.total_revenue * 0.93 },
                takeRate: 93,
                breakdown: [],
                payoutInfo: { meetsThreshold: true, nextPayoutDate: new Date() },
                feeStructure: {
                    commission: { rate: 5, type: 'percentage' },
                    platformFee: 2,
                    transactionFee: 0
                }
            };
        }

        const earnings = commissionCalculations.calculateEarnings(stats.total_revenue);
        const breakdown = commissionCalculations.getBreakdown(stats.total_revenue);
        const takeRate = commissionCalculations.getTakeRate();
        const meetsThreshold = commissionCalculations.checkPayoutThreshold(earnings.vendorEarnings);
        const nextPayoutDate = commissionCalculations.getPayoutDate(new Date());

        return {
            estimatedEarnings: earnings,
            takeRate,
            breakdown,
            payoutInfo: { meetsThreshold, nextPayoutDate },
            feeStructure: {
                commission: {
                    rate: marketplaceSettings.commission.default_commission_rate,
                    type: marketplaceSettings.commission.commission_type
                },
                platformFee: marketplaceSettings.fees?.platform_fee_rate || 0,
                transactionFee: marketplaceSettings.fees?.transaction_fee_rate || 0
            }
        };
    }, [marketplaceSettings, stats.total_revenue, commissionCalculations]);

    // Enhanced currency formatting with marketplace settings
    const formatCurrencyWithSettings = (amount: number) => {
        const currency = marketplaceSettings?.general?.currency || 'RWF';

        return new Intl.NumberFormat('rw-RW', {
            style: 'currency',
            currency: currency
        }).format(amount);
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
            <div className="flex justify-between lg:flex-row flex-col gap-4 lg:items-center   flex-c mb-6">
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
                {/* Subscription Upgrade Banner */}
                {(!currentSubscription || !currentSubscription.is_active || currentSubscription.plan_name === 'Free Trial' || currentSubscription.plan_name?.toLowerCase().includes('free')) && (
                    <Alert className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-orange-200">
                        <Crown className="h-5 w-5 text-orange-600" />
                        <AlertTitle className="text-orange-900 font-semibold">Upgrade to Premium Plan</AlertTitle>
                        <AlertDescription className="text-orange-800">
                            <p className="mb-2">
                                Unlock unlimited products, Cash on Delivery, priority support, and advanced analytics to grow your business faster.
                            </p>
                            <Link href="/marketplace/subscriptions">
                                <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                                    <Crown className="h-4 w-4 mr-2" />
                                    View Premium Plans
                                </Button>
                            </Link>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total_products}</p>
                                </div>
                                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <Package className="h-6 w-6 text-emerald-600" />
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
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrencyWithSettings(stats.total_revenue)}</p>
                                    <div className="space-y-1 mt-1">
                                        <p className="text-xs text-emerald-600 font-medium">
                                            Est. Earnings: {formatCurrencyWithSettings(marketplaceInsights.estimatedEarnings.vendorEarnings)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Fees: {formatCurrencyWithSettings(('totalFees' in marketplaceInsights.estimatedEarnings ? marketplaceInsights.estimatedEarnings.totalFees : 0) || 0)}
                                            ({(marketplaceInsights.feeStructure.commission.rate + marketplaceInsights.feeStructure.platformFee).toFixed(1)}%)
                                        </p>
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <DollarSign className="h-6 w-6 text-emerald-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Your Take Rate</p>
                                    <p className="text-2xl font-bold text-emerald-900">
                                        {marketplaceInsights.takeRate.toFixed(1)}%
                                    </p>
                                    <div className="space-y-1 mt-1">
                                        <p className="text-xs text-gray-500">
                                            After marketplace fees
                                        </p>
                                        <p className="text-xs text-emerald-600">
                                            Commission: {marketplaceInsights.feeStructure.commission.rate}% |
                                            Platform: {marketplaceInsights.feeStructure.platformFee}%
                                        </p>
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <Percent className="h-6 w-6 text-emerald-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Marketplace Insights Cards */}
                    <div className="grid grid-cols-1  gap-6 mb-8">

                        <div className='flex lg:flex-row flex-col gap-2 lg:items-center w-full'>
                            <p className="text-xs text-gray-600 mb-2 border-r pr-6 pl-6">
                                Min Amount: {formatCurrencyWithSettings(marketplaceSettings?.payout?.min_payout_amount || 50)}
                            </p>
                            <p className="text-xs text-gray-500 border-r pr-6 pl-6">
                                Next Payout: {marketplaceInsights.payoutInfo.nextPayoutDate.toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500 border-r pr-6 pl-6">
                                Schedule: {marketplaceSettings?.payout?.payout_schedule || 'Weekly'}
                            </p>
                            <p className="text-xs text-gray-500 border-r pr-6 pl-6">
                                {marketplaceSettings?.tax?.tax_rate && marketplaceSettings.tax.tax_rate > 0 && (<>
                                    <span className="text-sm text-gray-600 mb-2">Tax Rate:</span> {marketplaceSettings.tax.tax_rate}%
                                </>)}

                            </p>
                            <p className="text-xs text-gray-500 pr-6 pl-6">
                                {marketplaceSettings?.tax?.tax_inclusive
                                    ? 'Tax included in product prices'
                                    : 'Tax added at checkout'
                                }
                            </p>
                        </div>

                    </div>


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
                            <div className="space-y-6">
                                {/* Sales Trend Chart */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center">
                                                <TrendingUp className="h-5 w-5 mr-2" />
                                                Sales Trend (Last 6 Months)
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {monthlySales && monthlySales.length > 0 ? (
                                                <div className="space-y-4">
                                                    <div className="h-48 flex items-end justify-between space-x-2">
                                                        {monthlySales.map((month, index) => {
                                                            const maxSales = Math.max(...monthlySales.map(m => m.sales));
                                                            const height = maxSales > 0 ? (month.sales / maxSales) * 100 : 0;
                                                            return (
                                                                <div key={index} className="flex-1 flex flex-col items-center group cursor-pointer">
                                                                    <div
                                                                        className="w-full bg-emerald-500 rounded-t transition-all duration-300 group-hover:bg-emerald-600 min-h-[4px]"
                                                                        style={{ height: `${Math.max(height, 4)}%` }}
                                                                        title={`${month.month}: ${formatCurrency(month.sales)}`}
                                                                    />
                                                                    <div className="text-xs text-gray-600 mt-2 text-center">
                                                                        {month.month.split(' ')[0]}
                                                                    </div>
                                                                    <div className="text-xs font-semibold text-gray-800">
                                                                        {formatCurrency(month.sales)}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm text-gray-600">Monthly Revenue Trend</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                                    <p className="text-gray-500">No sales data available</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Order Status Distribution */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center">
                                                <BarChart3 className="h-5 w-5 mr-2" />
                                                Order Status Distribution
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {orderStatusDistribution ? (
                                                <div className="space-y-4">
                                                    {Object.entries(orderStatusDistribution).map(([status, count]) => {
                                                        const total = Object.values(orderStatusDistribution).reduce((a, b) => a + b, 0);
                                                        const percentage = total > 0 ? (count / total) * 100 : 0;
                                                        const statusColors = {
                                                            pending: 'bg-yellow-500',
                                                            processing: 'bg-emerald-500',
                                                            completed: 'bg-emerald-500',
                                                            cancelled: 'bg-red-500'
                                                        };
                                                        return (
                                                            <div key={status} className="space-y-2">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-sm font-medium capitalize">{status}</span>
                                                                    <span className="text-sm text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                                                                </div>
                                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                                    <div
                                                                        className={`h-2 rounded-full transition-all duration-300 ${statusColors[status as keyof typeof statusColors]}`}
                                                                        style={{ width: `${percentage}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                                    <p className="text-gray-500">No order data available</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Earnings Breakdown */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center">
                                                <DollarSign className="h-5 w-5 mr-2" />
                                                Earnings Breakdown
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {marketplaceInsights.breakdown.length > 0 ? (
                                                <div className="space-y-3">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Gross Revenue:</span>
                                                        <span className="font-medium">{formatCurrencyWithSettings(stats.total_revenue)}</span>
                                                    </div>
                                                    {marketplaceInsights.breakdown.map((item, index) => {
                                                        if (item.type === 'vendor_earnings') {
                                                            return (
                                                                <div key={index} className="border-t pt-2 flex justify-between text-sm font-semibold">
                                                                    <span className="text-gray-900">{item.label}:</span>
                                                                    <span className="text-emerald-600">{formatCurrencyWithSettings(item.amount)}</span>
                                                                </div>
                                                            );
                                                        }
                                                        return (
                                                            <div key={index} className="flex justify-between text-sm">
                                                                <span className="text-gray-600">{item.label} ({item.percentage.toFixed(1)}%):</span>
                                                                <span className="font-medium text-red-600">-{formatCurrencyWithSettings(item.amount)}</span>
                                                            </div>
                                                        );
                                                    })}

                                                    {/* Tax Information */}
                                                    {'taxAmount' in marketplaceInsights.estimatedEarnings && marketplaceInsights.estimatedEarnings.taxAmount && marketplaceInsights.estimatedEarnings.taxAmount > 0 && (
                                                        <div className="flex justify-between text-xs text-purple-600">
                                                            <span>Tax ({marketplaceSettings?.tax?.tax_rate}%):</span>
                                                            <span>{marketplaceSettings?.tax?.tax_inclusive ? 'Included' : formatCurrencyWithSettings(marketplaceInsights.estimatedEarnings.taxAmount)}</span>
                                                        </div>
                                                    )}

                                                    {/* Payout Eligibility */}
                                                    <div className="pt-2 border-t">
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-gray-500">Payout Status:</span>
                                                            <Badge variant={marketplaceInsights.payoutInfo.meetsThreshold ? 'default' : 'secondary'} className="text-xs px-2 py-0">
                                                                {marketplaceInsights.payoutInfo.meetsThreshold ? 'Eligible' : 'Below Threshold'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-4">
                                                    <DollarSign className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-500">No earnings data available</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Top Performing Products */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center">
                                                <Star className="h-5 w-5 mr-2" />
                                                Top Products
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {products && products.length > 0 ? (
                                                <div className="space-y-3">
                                                    {products.slice(0, 5).map((product, index) => (
                                                        <div key={product.id} className="flex items-center gap-3">
                                                            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-bold text-emerald-600">
                                                                {index + 1}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-sm truncate">{product.name}</p>
                                                                <p className="text-xs text-gray-600">
                                                                    {product.total_sales || 0} sales
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-semibold text-sm">{formatCurrency(product.price)}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-6">
                                                    <Star className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-gray-500 text-sm">No products yet</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Performance Metrics */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center">
                                                <TrendingUp className="h-5 w-5 mr-2" />
                                                Performance
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600">Conversion Rate</span>
                                                        <span className="font-semibold">--</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600">Avg Order Value</span>
                                                        <span className="font-semibold">
                                                            {stats.total_orders > 0
                                                                ? formatCurrency(stats.total_revenue / stats.total_orders)
                                                                : formatCurrency(0)
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600">Total Orders</span>
                                                        <span className="font-semibold">{stats.total_orders}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600">Revenue Growth</span>
                                                        <span className="font-semibold text-emerald-600">
                                                            {monthlySales && monthlySales.length >= 2 ? (
                                                                (() => {
                                                                    const current = monthlySales[monthlySales.length - 1]?.sales || 0;
                                                                    const previous = monthlySales[monthlySales.length - 2]?.sales || 0;
                                                                    const growth = previous > 0 ? ((current - previous) / previous * 100) : 0;
                                                                    return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
                                                                })()
                                                            ) : '--'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Settings Tab */}
                        <TabsContent value="settings">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Commission Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Calculator className="h-5 w-5 mr-2" />
                                            Commission Structure
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 bg-emerald-50 rounded-lg text-center">
                                                <div className="text-lg font-bold text-emerald-900">
                                                    {commissionCalculations.formatRate(
                                                        marketplaceInsights.feeStructure.commission.rate,
                                                        marketplaceInsights.feeStructure.commission.type as 'percentage' | 'fixed'
                                                    )}
                                                </div>
                                                <div className="text-xs text-emerald-600">Commission</div>
                                            </div>
                                            <div className="p-3 bg-emerald-50 rounded-lg text-center">
                                                <div className="text-lg font-bold text-emerald-900">
                                                    {marketplaceInsights.takeRate.toFixed(1)}%
                                                </div>
                                                <div className="text-xs text-emerald-600">You Keep</div>
                                            </div>
                                        </div>

                                        <div className="text-xs text-gray-600 space-y-1">
                                            <div className="flex justify-between">
                                                <span>Commission:</span>
                                                <span>{marketplaceInsights.feeStructure.commission.rate}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Platform Fee:</span>
                                                <span>{marketplaceInsights.feeStructure.platformFee}%</span>
                                            </div>
                                            {marketplaceInsights.feeStructure.transactionFee > 0 && (
                                                <div className="flex justify-between">
                                                    <span>Transaction Fee:</span>
                                                    <span>{marketplaceInsights.feeStructure.transactionFee}%</span>
                                                </div>
                                            )}
                                            {marketplaceSettings?.tax?.tax_rate && marketplaceSettings.tax.tax_rate > 0 && (
                                                <div className="flex justify-between">
                                                    <span>Tax Rate:</span>
                                                    <span>{marketplaceSettings.tax.tax_rate}% ({marketplaceSettings.tax.tax_inclusive ? 'Inc.' : 'Exc.'})</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between pt-1 border-t font-medium text-emerald-600">
                                                <span>Minimum Payout:</span>
                                                <span>{formatCurrencyWithSettings(marketplaceSettings?.payout?.min_payout_amount || 50)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Payout Schedule:</span>
                                                <span className="capitalize">{marketplaceSettings?.payout?.payout_schedule || 'weekly'}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

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

                                        <Button
                                            onClick={() => window.location.href = '/marketplace/vendor/payments'}
                                            variant="outline"
                                            className="w-full justify-start"
                                        >
                                            <DollarSign className="h-4 w-4 mr-2" />
                                            View Payments & Earnings
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
