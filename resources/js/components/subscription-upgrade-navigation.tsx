import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    Crown, 
    Zap, 
    ArrowUp, 
    CheckCircle, 
    AlertTriangle,
    Star,
    Package,
    ShoppingCart,
    Calendar,
    CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubscriptionPlan {
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
}

interface CurrentSubscription {
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
}

interface SubscriptionUsage {
    products_used: number;
    products_limit: number | null;
    orders_this_month: number;
    order_limit: number | null;
    usage_percentage: {
        products: number;
        orders: number;
    };
}

interface UpgradeNavigationProps {
    currentSubscription?: CurrentSubscription | null;
    subscriptionUsage?: SubscriptionUsage | null;
    availablePlans?: SubscriptionPlan[];
    needsUpgrade?: boolean;
    upgradeReason?: string;
    compact?: boolean;
}

export function SubscriptionUpgradeBanner({
    currentSubscription,
    subscriptionUsage,
    needsUpgrade = false,
    upgradeReason,
}: Pick<UpgradeNavigationProps, 'currentSubscription' | 'subscriptionUsage' | 'needsUpgrade' | 'upgradeReason'>) {
    if (!needsUpgrade && currentSubscription?.is_active) return null;

    const getUpgradeMessage = () => {
        switch (upgradeReason) {
            case 'no_subscription':
                return {
                    title: 'Start Selling Today!',
                    message: 'Choose a subscription plan to start listing products and accepting orders.',
                    icon: Crown,
                    color: 'bg-blue-50 border-blue-200 text-blue-800'
                };
            case 'product_limit':
                return {
                    title: 'Product Limit Almost Reached',
                    message: `You're using ${subscriptionUsage?.products_used || 0} of ${subscriptionUsage?.products_limit || 0} product slots. Upgrade to add more products.`,
                    icon: Package,
                    color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
                };
            case 'order_limit':
                return {
                    title: 'Order Limit Almost Reached',
                    message: `You've processed ${subscriptionUsage?.orders_this_month || 0} of ${subscriptionUsage?.order_limit || 0} orders this month. Upgrade for more capacity.`,
                    icon: ShoppingCart,
                    color: 'bg-orange-50 border-orange-200 text-orange-800'
                };
            case 'expired':
                return {
                    title: 'Subscription Expired',
                    message: 'Your subscription has expired. Renew now to continue selling.',
                    icon: AlertTriangle,
                    color: 'bg-red-50 border-red-200 text-red-800'
                };
            default:
                return {
                    title: 'Upgrade Your Plan',
                    message: 'Unlock premium features and increase your selling capacity.',
                    icon: ArrowUp,
                    color: 'bg-purple-50 border-purple-200 text-purple-800'
                };
        }
    };

    const upgrade = getUpgradeMessage();
    const IconComponent = upgrade.icon;

    return (
        <Alert className={cn('mb-6', upgrade.color)}>
            <IconComponent className="h-4 w-4" />
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-semibold">{upgrade.title}</h4>
                    <AlertDescription className="mt-1">
                        {upgrade.message}
                    </AlertDescription>
                </div>
                <div className="flex gap-2 ml-4">
                    <Button size="sm" asChild>
                        <Link href="/marketplace/subscriptions">
                            <ArrowUp className="h-4 w-4 mr-1" />
                            Upgrade Now
                        </Link>
                    </Button> 
                </div>
            </div>
        </Alert>
    );
}

export function SubscriptionUsageWidget({
    currentSubscription,
    subscriptionUsage,
    compact = false
}: Pick<UpgradeNavigationProps, 'currentSubscription' | 'subscriptionUsage' | 'compact'>) {
    if (!currentSubscription || !subscriptionUsage) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };



    if (compact) {
        return (
            <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-yellow-500" />
                        <span className="font-medium">{currentSubscription.plan_name}</span>
                        {!currentSubscription.is_active && (
                            <Badge variant="destructive">Inactive</Badge>
                        )}
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/marketplace/subscriptions">
                            <ArrowUp className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                <div className="space-y-2 text-sm">
                    <div>
                        <div className="flex justify-between mb-1">
                            <span>Products</span>
                            <span>{subscriptionUsage.products_used}/{subscriptionUsage.products_limit || '∞'}</span>
                        </div>
                        {subscriptionUsage.products_limit && (
                            <Progress 
                                value={subscriptionUsage.usage_percentage.products} 
                                className="h-2"
                            />
                        )}
                    </div>

                    <div>
                        <div className="flex justify-between mb-1">
                            <span>Monthly Orders</span>
                            <span>{subscriptionUsage.orders_this_month || 0}/{subscriptionUsage.order_limit || '∞'}</span>
                        </div>
                        {subscriptionUsage.order_limit && (
                            <Progress 
                                value={subscriptionUsage.usage_percentage.orders} 
                                className="h-2"
                            />
                        )}
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-yellow-500" />
                        {currentSubscription.plan_name} Plan
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {currentSubscription.is_active ? (
                            <Badge variant="default">Active</Badge>
                        ) : (
                            <Badge variant="destructive">Inactive</Badge>
                        )}
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/marketplace/subscriptions/upgrade">
                                <ArrowUp className="h-4 w-4 mr-1" />
                                Upgrade
                            </Link>
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Plan Details */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p className="text-sm text-gray-600">Price</p>
                        <p className="font-semibold">
                            {new Intl.NumberFormat('rw-RW', { 
                                style: 'currency', 
                                currency: 'RWF' 
                            }).format(currentSubscription.price)}
                            <span className="text-sm text-gray-500">/{currentSubscription.billing_cycle}</span>
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Expires</p>
                        <p className="font-semibold">
                            {formatDate(currentSubscription.end_date)}
                            {currentSubscription.days_remaining !== null && (
                                <span className="text-sm text-gray-500 block">
                                    {currentSubscription.days_remaining > 0 
                                        ? `${currentSubscription.days_remaining} days left`
                                        : 'Expired'
                                    }
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Usage Statistics */}
                <div className="space-y-3">
                    <h4 className="font-medium">Usage This Month</h4>
                    
                    {subscriptionUsage.products_limit ? (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm">Products</span>
                                </div>
                                <span className="text-sm font-medium">
                                    {subscriptionUsage.products_used} / {subscriptionUsage.products_limit}
                                </span>
                            </div>
                            <Progress 
                                value={subscriptionUsage.usage_percentage.products} 
                                className="h-2"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {subscriptionUsage.usage_percentage.products.toFixed(1)}% used
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Package className="h-4 w-4" />
                            <span>Unlimited products</span>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                    )}

                    {subscriptionUsage.order_limit ? (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <ShoppingCart className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm">Monthly Orders</span>
                                </div>
                                <span className="text-sm font-medium">
                                    {subscriptionUsage.orders_this_month} / {subscriptionUsage.order_limit}
                                </span>
                            </div>
                            <Progress 
                                value={subscriptionUsage.usage_percentage.orders} 
                                className="h-2"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {subscriptionUsage.usage_percentage.orders.toFixed(1)}% used
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <ShoppingCart className="h-4 w-4" />
                            <span>Unlimited orders</span>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                    )}
                </div>

                {/* Features */}
                <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {currentSubscription.allow_cod && (
                                <div className="flex items-center gap-1">
                                    <CreditCard className="h-4 w-4 text-green-500" />
                                    <span className="text-sm text-gray-600">Cash on Delivery</span>
                                </div>
                            )}
                            {currentSubscription.auto_renew && (
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm text-gray-600">Auto-renewal</span>
                                </div>
                            )}
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/marketplace/subscriptions">
                                Manage Plan
                            </Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function PlanComparisonWidget({ 
    availablePlans = [],
    currentSubscription 
}: Pick<UpgradeNavigationProps, 'availablePlans' | 'currentSubscription'>) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('rw-RW', {
            style: 'currency',
            currency: 'RWF'
        }).format(amount);
    };

    const isCurrentPlan = (planName: string) => {
        return currentSubscription?.plan_name === planName;
    };

    if (!availablePlans.length) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Available Plans</h3>
                <Button variant="outline" size="sm" asChild>
                    <Link href="/marketplace/subscriptions">
                        View All Plans
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {availablePlans.slice(0, 3).map((plan) => (
                    <Card key={plan.id} className={cn(
                        "relative",
                        plan.is_popular && "border-blue-500 shadow-lg",
                        isCurrentPlan(plan.name) && "border-green-500 bg-green-50"
                    )}>
                        {plan.is_popular && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                <Badge className="bg-blue-500 text-white">
                                    <Star className="h-3 w-3 mr-1" />
                                    Popular
                                </Badge>
                            </div>
                        )}

                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>{plan.name}</span>
                                {plan.is_premium && (
                                    <Crown className="h-5 w-5 text-yellow-500" />
                                )}
                            </CardTitle>
                            <div className="text-2xl font-bold">
                                {formatCurrency(plan.price)}
                                <span className="text-sm text-gray-500 font-normal">
                                    /{plan.billing_cycle}
                                </span>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-gray-500" />
                                    <span>
                                        {plan.product_limit ? `${plan.product_limit} products` : 'Unlimited products'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ShoppingCart className="h-4 w-4 text-gray-500" />
                                    <span>
                                        {plan.order_limit ? `${plan.order_limit} orders/month` : 'Unlimited orders'}
                                    </span>
                                </div>
                                {plan.allow_cod && (
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-green-500" />
                                        <span>Cash on Delivery</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-3">
                                {isCurrentPlan(plan.name) ? (
                                    <Button variant="outline" className="w-full" disabled>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Current Plan
                                    </Button>
                                ) : (
                                    <Button className="w-full" asChild>
                                        <Link href={`/marketplace/subscriptions/plans/${plan.id}`}>
                                            <Zap className="h-4 w-4 mr-2" />
                                            Upgrade
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

// Quick upgrade action in navigation
export function QuickUpgradeAction({ 
    needsUpgrade = false, 
    compact = true 
}: { 
    needsUpgrade?: boolean; 
    compact?: boolean; 
}) {
    if (!needsUpgrade) return null;

    return (
        <Button 
            size={compact ? "sm" : "default"} 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            asChild
        >
            <Link href="/marketplace/subscriptions/upgrade">
                <Crown className="h-4 w-4 mr-2" />
                {compact ? "Upgrade" : "Upgrade to Premium"}
            </Link>
        </Button>
    );
}