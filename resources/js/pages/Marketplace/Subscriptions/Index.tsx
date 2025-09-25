import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Star, ArrowRight } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  billing_cycle: string;
  product_limit: number | null;
  order_limit: number | null;
  allow_cod: boolean;
  features: string[];
  is_active: boolean;
}

interface CurrentSubscription {
  id: number;
  plan_name: string;
  price: number;
  billing_cycle: string;
  end_date: string;
  days_remaining: number;
  is_active: boolean;
  auto_renew: boolean;
  allow_cod: boolean;
}

interface SubscriptionHistory {
  id: number;
  plan_name: string;
  price: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  payment_status: string;
}

interface Props {
  plans: SubscriptionPlan[];
  currentSubscription: CurrentSubscription | null;
  subscriptionHistory: SubscriptionHistory[];
  hasVendorProfile: boolean;
}

export default function Index({ plans, currentSubscription, subscriptionHistory, hasVendorProfile }: Props) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('rw-RW', { 
      style: 'currency', 
      currency: 'RWF',
      minimumFractionDigits: 0 
    }).format(price);
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return <Star className="w-6 h-6 text-gray-500" />;
      case 'premium':
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 'enterprise':
        return <Zap className="w-6 h-6 text-purple-500" />;
      default:
        return <Star className="w-6 h-6 text-gray-500" />;
    }
  };

  if (!hasVendorProfile) {
    return (
      <AppLayout>
        <Head title="Subscription Plans" />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Subscription Plans</h1>
            <p className="text-lg text-gray-600 mb-8">
              You need a vendor profile to access subscription plans.
            </p>
            <Link href="/marketplace/vendor/register">
              <Button size="lg">
                Create Vendor Profile
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Head title="Subscription Plans" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-lg text-gray-600">
            Select the perfect plan for your marketplace business
          </p>
        </div>

        {/* Current Subscription */}
        {currentSubscription && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Current Plan: {currentSubscription.plan_name}</span>
                <Badge variant="default">Active</Badge>
              </CardTitle>
              <CardDescription>
                {currentSubscription.price > 0 
                  ? `${formatPrice(currentSubscription.price)} / ${currentSubscription.billing_cycle}` 
                  : 'Free Plan'
                } • 
                {currentSubscription.days_remaining > 0 
                  ? ` ${currentSubscription.days_remaining} days remaining`
                  : ' Expired'
                } • 
                Auto-renew: {currentSubscription.auto_renew ? 'On' : 'Off'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <Link href="/marketplace/subscriptions/upgrade">
                  <Button>Upgrade Plan</Button>
                </Link>
                <Link href="/marketplace/subscriptions/usage">
                  <Button variant="outline">View Usage</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => {
            const isCurrentPlan = currentSubscription?.plan_name === plan.name;
            const isUpgrade = currentSubscription && plan.price > currentSubscription.price;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative ${
                  plan.name === 'Premium' ? 'ring-2 ring-yellow-400 ring-offset-2' : ''
                } ${isCurrentPlan ? 'opacity-60' : ''}`}
              >
                {plan.name === 'Premium' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-yellow-400 text-yellow-900">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    {getPlanIcon(plan.name)}
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    {plan.price > 0 ? (
                      <>
                        <span className="text-3xl font-bold">{formatPrice(plan.price)}</span>
                        <span className="text-gray-500">/{plan.billing_cycle}</span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold">Free</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-2 mb-6 text-sm text-gray-600">
                    <div>Products: {plan.product_limit || 'Unlimited'}</div>
                    <div>Orders: {plan.order_limit || 'Unlimited'}/month</div>
                    <div>COD: {plan.allow_cod ? 'Yes' : 'No'}</div>
                  </div>

                  {isCurrentPlan ? (
                    <Button disabled className="w-full">Current Plan</Button>
                  ) : (
                    <Link href={`/marketplace/subscriptions/plans/${plan.id}`}>
                      <Button 
                        className="w-full" 
                        variant={plan.name === 'Premium' ? 'default' : 'outline'}
                      >
                        {isUpgrade ? 'Upgrade to' : 'Select'} {plan.name}
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Subscription History */}
        {subscriptionHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Subscription History</CardTitle>
              <CardDescription>Your past subscription plans and payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Plan</th>
                      <th className="text-left py-2">Price</th>
                      <th className="text-left py-2">Period</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptionHistory.map((subscription) => (
                      <tr key={subscription.id} className="border-b">
                        <td className="py-2 font-medium">{subscription.plan_name}</td>
                        <td className="py-2">{formatPrice(subscription.price)}</td>
                        <td className="py-2">
                          {new Date(subscription.start_date).toLocaleDateString()} - 
                          {new Date(subscription.end_date).toLocaleDateString()}
                        </td>
                        <td className="py-2">
                          <Badge variant={subscription.is_active ? "default" : "secondary"}>
                            {subscription.is_active ? "Active" : "Expired"}
                          </Badge>
                        </td>
                        <td className="py-2">
                          <Badge variant="outline">{subscription.payment_status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}