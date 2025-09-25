import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Breadcrumb, 
  BreadcrumbList, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { 
  ArrowLeft, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Crown,
  Calendar,
  BarChart3,
  PieChart,
  Home 
} from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';

interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  billing_cycle: string;
  subscriptions_count: number;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
  subscriptions: number;
}

interface SubscriptionTrend {
  date: string;
  new_subscriptions: number;
  active_subscriptions: number;
}

interface Props {
  planDistribution: SubscriptionPlan[];
  monthlyRevenue: MonthlyRevenue[];
  subscriptionTrends: SubscriptionTrend[];
  totalStats: {
    total_revenue: number;
    average_revenue_per_user: number;
    total_active_subscriptions: number;
    growth_rate: number;
    churn_rate: number;
    most_popular_plan: string;
  };
}

export default function Analytics({ 
  planDistribution, 
  monthlyRevenue, 
  subscriptionTrends, 
  totalStats 
}: Props) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('rw-RW', { 
      style: 'currency', 
      currency: 'RWF',
      minimumFractionDigits: 0 
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const getGrowthColor = (rate: number) => {
    if (rate > 0) return 'text-green-600';
    if (rate < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (rate: number) => {
    return rate >= 0 ? '↗' : '↘';
  };

  return (
    <AdminLayout>
      <Head title="Subscription Analytics" />

      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin">
                  <Home className="w-4 h-4" />
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin/marketplace">Marketplace</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin/marketplace/subscriptions">Subscriptions</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Analytics</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/admin/marketplace/subscriptions"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 text-xs"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Subscription Analytics</h1>
              <p className="text-gray-600">Detailed insights into subscription performance and revenue</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(totalStats.total_revenue)}</div>
              <p className="text-xs text-gray-500 mt-1">All-time subscription revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Active Subscriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.total_active_subscriptions}</div>
              <p className="text-xs text-gray-500 mt-1">Currently active subscribers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                ARPU
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(totalStats.average_revenue_per_user)}</div>
              <p className="text-xs text-gray-500 mt-1">Average Revenue Per User</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Growth Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getGrowthColor(totalStats.growth_rate)}`}>
                {getGrowthIcon(totalStats.growth_rate)} {Math.abs(totalStats.growth_rate).toFixed(1)}%
              </div>
              <p className="text-xs text-gray-500 mt-1">Monthly growth rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <PieChart className="w-4 h-4 mr-2" />
                Churn Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getGrowthColor(-totalStats.churn_rate)}`}>
                {totalStats.churn_rate.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-500 mt-1">Customer churn rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Crown className="w-4 h-4 mr-2" />
                Top Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate">{totalStats.most_popular_plan}</div>
              <p className="text-xs text-gray-500 mt-1">Most popular plan</p>
            </CardContent>
          </Card>
        </div>

        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Plan Distribution
            </CardTitle>
            <CardDescription>
              Subscription breakdown by plan type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {planDistribution.map((plan) => {
                const totalSubscriptions = planDistribution.reduce((sum, p) => sum + p.subscriptions_count, 0);
                const percentage = totalSubscriptions > 0 ? (plan.subscriptions_count / totalSubscriptions * 100) : 0;
                
                return (
                  <div key={plan.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Crown className="w-5 h-5 text-yellow-500" />
                      <div>
                        <h4 className="font-medium">{plan.name}</h4>
                        <p className="text-sm text-gray-600">
                          {formatPrice(plan.price)}/{plan.billing_cycle}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{plan.subscriptions_count}</div>
                      <div className="text-sm text-gray-600">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {planDistribution.length === 0 && (
              <div className="text-center py-8">
                <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No subscription data</h3>
                <p className="text-gray-600">No active subscriptions to analyze yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Monthly Revenue Trend
            </CardTitle>
            <CardDescription>
              Revenue and subscription count over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyRevenue.map((month) => (
                <div key={month.month} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <div>
                      <h4 className="font-medium">{formatDate(month.month + '-01')}</h4>
                      <p className="text-sm text-gray-600">{month.subscriptions} subscriptions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{formatPrice(month.revenue)}</div>
                    <div className="text-sm text-gray-600">
                      {month.subscriptions > 0 ? formatPrice(month.revenue / month.subscriptions) : 'N/A'} avg
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {monthlyRevenue.length === 0 && (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No revenue data</h3>
                <p className="text-gray-600">No revenue data available to analyze yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Subscription Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Recent Subscription Activity (Last 30 Days)
            </CardTitle>
            <CardDescription>
              Daily new subscriptions and active count
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subscriptionTrends.slice(-10).map((trend) => (
                <div key={trend.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <h4 className="font-medium">{formatDate(trend.date)}</h4>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">+{trend.new_subscriptions}</div>
                      <div className="text-xs text-gray-500">New</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{trend.active_subscriptions}</div>
                      <div className="text-xs text-gray-500">Active</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {subscriptionTrends.length === 0 && (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No trend data</h3>
                <p className="text-gray-600">No subscription trend data available yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
            <CardDescription>
              Automated insights based on your subscription data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm">
                    <strong>Revenue Performance:</strong> Your total subscription revenue is {formatPrice(totalStats.total_revenue)} 
                    with an average of {formatPrice(totalStats.average_revenue_per_user)} per user.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm">
                    <strong>Popular Plan:</strong> "{totalStats.most_popular_plan}" is your most popular subscription plan.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm">
                    <strong>Growth Rate:</strong> Your subscription growth rate is{' '}
                    <span className={getGrowthColor(totalStats.growth_rate)}>
                      {totalStats.growth_rate >= 0 ? '+' : ''}{totalStats.growth_rate.toFixed(1)}%
                    </span> monthly.
                  </p>
                </div>
              </div>

              {totalStats.churn_rate > 5 && (
                <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm">
                      <strong>Churn Alert:</strong> Your churn rate is {totalStats.churn_rate.toFixed(1)}%, 
                      which is above the recommended 5%. Consider reviewing customer satisfaction.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}