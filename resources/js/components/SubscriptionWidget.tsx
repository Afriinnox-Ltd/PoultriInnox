import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, CreditCard, Star, AlertTriangle } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface SubscriptionUsage {
  plan_name: string;
  price: number;
  billing_cycle: string;
  start_date: string;
  end_date: string;
  days_remaining: number;
  is_active: boolean;
  auto_renew: boolean;
  allows_cod: boolean;
  products_used: number;
  products_limit: number | null;
  orders_this_month: number;
  order_limit: number | null;
  can_create_products: boolean;
  usage_percentage: {
    products: number;
    orders: number;
  };
}

interface SubscriptionWidgetProps {
  subscriptionUsage: SubscriptionUsage | null;
  showUpgradeButton?: boolean;
}

export default function SubscriptionWidget({ subscriptionUsage, showUpgradeButton = true }: SubscriptionWidgetProps) {
  if (!subscriptionUsage) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-yellow-800">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <h3 className="font-semibold">No Active Subscription</h3>
              <p className="text-sm text-yellow-600">Subscribe to a plan to access all features</p>
            </div>
          </div>
          {showUpgradeButton && (
            <Link href="/marketplace/subscriptions" className="mt-3 block">
              <Button size="sm" className="w-full">
                View Subscription Plans
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    );
  }

  const isNearExpiry = subscriptionUsage.days_remaining <= 7;
  const isProductLimitReached = subscriptionUsage.products_limit && 
    subscriptionUsage.products_used >= subscriptionUsage.products_limit;
  const isOrderLimitNear = subscriptionUsage.order_limit && 
    subscriptionUsage.usage_percentage.orders >= 80;

  return (
    <Card className="space-y-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span>{subscriptionUsage.plan_name} Plan</span>
          </CardTitle>
          <Badge variant={subscriptionUsage.is_active ? "default" : "secondary"}>
            {subscriptionUsage.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Plan Details */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>
              {new Intl.NumberFormat('rw-RW', { 
                style: 'currency', 
                currency: 'RWF',
                minimumFractionDigits: 0 
              }).format(subscriptionUsage.price)} / {subscriptionUsage.billing_cycle}
            </span>
          </div>
          {subscriptionUsage.allows_cod && (
            <Badge variant="outline" className="text-xs">
              COD Enabled
            </Badge>
          )}
        </div>

        {/* Expiry Warning */}
        {isNearExpiry && (
          <div className="flex items-center space-x-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              {subscriptionUsage.days_remaining > 0 
                ? `Expires in ${subscriptionUsage.days_remaining} days` 
                : 'Subscription expired'}
            </span>
          </div>
        )}

        {/* Usage Statistics */}
        <div className="space-y-3">
          {/* Products Usage */}
          {subscriptionUsage.products_limit && (
            <div>
              <div className="flex justify-between items-center text-sm mb-1">
                <span>Products Used</span>
                <span className={isProductLimitReached ? "text-red-600 font-medium" : ""}>
                  {subscriptionUsage.products_used} / {subscriptionUsage.products_limit}
                </span>
              </div>
              <Progress 
                value={subscriptionUsage.usage_percentage.products} 
                className={`h-2 ${isProductLimitReached ? "bg-red-100" : ""}`}
              />
              {isProductLimitReached && (
                <p className="text-xs text-red-600 mt-1">Product limit reached</p>
              )}
            </div>
          )}

          {/* Orders Usage */}
          {subscriptionUsage.order_limit && (
            <div>
              <div className="flex justify-between items-center text-sm mb-1">
                <span>Monthly Orders</span>
                <span className={isOrderLimitNear ? "text-orange-600 font-medium" : ""}>
                  {subscriptionUsage.orders_this_month} / {subscriptionUsage.order_limit}
                </span>
              </div>
              <Progress 
                value={subscriptionUsage.usage_percentage.orders} 
                className={`h-2 ${isOrderLimitNear ? "bg-orange-100" : ""}`}
              />
              {isOrderLimitNear && (
                <p className="text-xs text-orange-600 mt-1">Approaching order limit</p>
              )}
            </div>
          )}
        </div>

        {/* Renewal Status */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>
              {subscriptionUsage.auto_renew ? 'Auto-renewal enabled' : 'Manual renewal required'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {showUpgradeButton && (
          <div className="flex space-x-2 pt-2">
            <Link href="/marketplace/subscriptions/upgrade" className="flex-1">
              <Button size="sm" variant="outline" className="w-full">
                Upgrade Plan
              </Button>
            </Link>
            <Link href="/marketplace/subscriptions" className="flex-1">
              <Button size="sm" variant="ghost" className="w-full">
                Manage
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}