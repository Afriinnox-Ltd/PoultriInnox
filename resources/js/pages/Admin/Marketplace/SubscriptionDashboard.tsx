import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Breadcrumb, 
  BreadcrumbList, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { Crown, Users, DollarSign, TrendingUp, Settings, Eye, Plus, Home, Store, ShoppingBag } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';

interface DashboardStats {
  totalPlans: number;
  activePlans: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  recentSubscriptions: Array<{
    id: number;
    user_name: string;
    plan_name: string;
    created_at: string;
  }>;
}

interface Props {
  stats: DashboardStats;
}

export default function SubscriptionDashboard({ stats }: Props) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('rw-RW', { 
      style: 'currency', 
      currency: 'RWF',
      minimumFractionDigits: 0 
    }).format(amount);
  };

  return (
    <AdminLayout>
      <Head title="Subscription Management Dashboard" />

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
              <BreadcrumbPage>Subscriptions</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
            <p className="text-gray-600">Manage subscription plans and monitor revenue</p>
          </div>
          <div className="flex space-x-3">
            <Link href="/admin/marketplace/subscription-plans/analytics">
              <Button variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </Link>
            <Link href="/admin/marketplace/subscription-plans/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Plan
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Crown className="w-4 h-4 mr-2" />
                Total Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPlans}</div>
              <p className="text-xs text-gray-500">{stats.activePlans} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Subscribers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
              <p className="text-xs text-gray-500">{stats.activeSubscriptions} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
              <p className="text-xs text-gray-500">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Conversion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalSubscriptions > 0 ? 
                  Math.round((stats.activeSubscriptions / stats.totalSubscriptions) * 100) : 0}%
              </div>
              <p className="text-xs text-gray-500">Active rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="subscriptions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 h-auto gap-2 bg-transparent">
            <TabsTrigger 
              value="subscriptions" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Crown className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Subscription</span> Plans
            </TabsTrigger>
            <TabsTrigger 
              value="users"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Users className="w-4 h-4 mr-2" />
              User Subscriptions
            </TabsTrigger>
            <TabsTrigger 
              value="vendors"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Store className="w-4 h-4 mr-2" />
              Vendor Stores
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Subscription Plans Tab */}
          <TabsContent value="subscriptions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/admin/marketplace/subscription-plans">
                <Card className="hover:shadow-lg transition-all cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Settings className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Manage Plans</h3>
                        <p className="text-sm text-gray-600 mt-1">Create, edit, and configure subscription plans</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/marketplace/subscription-plans/create">
                <Card className="hover:shadow-lg transition-all cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                      <div className="p-3 bg-emerald-100 rounded-lg">
                        <Plus className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Create New Plan</h3>
                        <p className="text-sm text-gray-600 mt-1">Add a new subscription plan with custom features</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/marketplace/subscription-plans">
                <Card className="hover:shadow-lg transition-all cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <Eye className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">View All Plans</h3>
                        <p className="text-sm text-gray-600 mt-1">Browse and manage all subscription plans</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </TabsContent>

          {/* User Subscriptions Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/admin/marketplace/subscription-plans/user-subscriptions">
                <Card className="hover:shadow-lg transition-all cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                      <div className="p-3 bg-emerald-100 rounded-lg">
                        <Users className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Manage Subscriptions</h3>
                        <p className="text-sm text-gray-600 mt-1">Assign plans and manage user subscriptions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <Users className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-500">Active Users</h3>
                      <p className="text-sm text-gray-600 mt-1">{stats.activeSubscriptions} users with active plans</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Vendor Stores Tab */}
          <TabsContent value="vendors" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/admin/marketplace/vendors">
                <Card className="hover:shadow-lg transition-all cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <Store className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Manage Vendors</h3>
                        <p className="text-sm text-gray-600 mt-1">View and manage all vendor stores</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/marketplace/products">
                <Card className="hover:shadow-lg transition-all cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                      <div className="p-3 bg-indigo-100 rounded-lg">
                        <ShoppingBag className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Products</h3>
                        <p className="text-sm text-gray-600 mt-1">Manage vendor products and inventory</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/admin/marketplace/subscription-plans/analytics">
                <Card className="hover:shadow-lg transition-all cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Revenue Analytics</h3>
                        <p className="text-sm text-gray-600 mt-1">View revenue and subscription analytics</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <DollarSign className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-500">Monthly Revenue</h3>
                      <p className="text-sm text-gray-600 mt-1">{formatCurrency(stats.monthlyRevenue)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Recent Activity */}
        {stats.recentSubscriptions && stats.recentSubscriptions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Subscriptions
                <Link href="/admin/marketplace/subscription-plans/user-subscriptions">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentSubscriptions.map((subscription) => (
                  <div key={subscription.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{subscription.user_name}</p>
                      <p className="text-sm text-gray-600">Subscribed to {subscription.plan_name}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(subscription.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}