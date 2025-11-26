import React from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Users, CreditCard, TrendingUp, Search, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  billing_cycle: string;
  product_limit: number | null;
  order_limit: number | null;
  allow_cod: boolean;
  features: string[] | null;
  is_active: boolean;
  subscriptions_count: number;
  created_at: string;
}

interface Stats {
  total_plans: number;
  active_plans: number;
  total_subscriptions: number;
  active_subscriptions: number;
}

interface Props {
  plans: {
    data: SubscriptionPlan[];
    links: Record<string, string>;
    meta: {
      current_page: number;
      from: number;
      to: number;
      total: number;
    };
  };
  stats: Stats;
}

export default function Index({ plans, stats }: Props) {
  const { data, setData, get } = useForm({
    search: '',
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    get('/admin/marketplace/subscription-plans', {
      preserveState: true,
      replace: true,
    });
  };

  const togglePlanStatus = (planId: number) => {
    router.patch(`/admin/marketplace/subscription-plans/${planId}/toggle-status`, {}, {
      preserveState: true,
      onSuccess: () => {
        // Refresh the page to show updated status
        router.reload({ only: ['plans', 'stats'] });
      },
    });
  };

  const deletePlan = (planId: number, planName: string) => {
    if (confirm(`Are you sure you want to delete the "${planName}" plan? This action cannot be undone.`)) {
      router.delete(`/admin/marketplace/subscription-plans/${planId}`, {
        preserveState: true,
        onSuccess: () => {
          // Toast will be handled globally by flash messages if configured, 
          // but we can enforce local success feedback or rely on backend redirect with flash
          router.reload({ only: ['plans', 'stats'] });
        },
        onError: (errors) => {
          // Log errors to console for debugging
          console.error('Delete failed:', errors);
          // If the backend returns a specific error bag or message, try to alert it
          // Assuming no global toast hook is readily available inside this specific function scope 
          // without importing a hook, but we can try alert for critical failures
          alert('Failed to delete plan. Please check if there are active subscriptions usage.');
        }
      });
    }
  };

  return (
    <AdminLayout>
      <Head title="Subscription Plans Management" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
            <p className="text-gray-600">Manage marketplace subscription plans and pricing</p>
          </div>
          <Link
            href="/admin/marketplace/subscription-plans/create"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Plan
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-blue-500" />
                <span className="text-2xl font-bold">{stats.total_plans}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <span className="text-2xl font-bold">{stats.active_plans}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-500" />
                <span className="text-2xl font-bold">{stats.total_subscriptions}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-orange-500" />
                <span className="text-2xl font-bold">{stats.active_subscriptions}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plans</CardTitle>
            <CardDescription>Manage and configure subscription plans</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search plans..."
                    value={data.search}
                    onChange={(e) => setData('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit">Search</Button>
              </div>
            </form>

            {/* Plans Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3">Plan</th>
                    <th className="text-left py-3">Price</th>
                    <th className="text-left py-3">Limits</th>
                    <th className="text-left py-3">Features</th>
                    <th className="text-left py-3">Subscriptions</th>
                    <th className="text-left py-3">Status</th>
                    <th className="text-left py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.data.map((plan) => (
                    <tr key={plan.id} className="border-b hover:bg-gray-50">
                      <td className="py-4">
                        <div>
                          <div className="font-medium text-gray-900">{plan.name}</div>
                          <div className="text-gray-500 text-xs">{plan.description}</div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div>
                          <div className="font-medium">{formatPrice(plan.price)}</div>
                          <div className="text-gray-500 text-xs">/{plan.billing_cycle}</div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="text-xs space-y-1">
                          <div>Products: {plan.product_limit || '∞'}</div>
                          <div>Orders: {plan.order_limit || '∞'}/mo</div>
                          <div>COD: {plan.allow_cod ? 'Yes' : 'No'}</div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="text-xs text-gray-600">
                          {Array.isArray(plan.features) && plan.features.length > 0 ? (
                            <>
                              {plan.features.slice(0, 2).join(', ')}
                              {plan.features.length > 2 && '...'}
                            </>
                          ) : (
                            <span className="text-gray-400">No features</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge variant="outline">
                          {plan.subscriptions_count} users
                        </Badge>
                      </td>
                      <td className="py-4">
                        <Badge variant={plan.is_active ? "default" : "secondary"}>
                          {plan.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => togglePlanStatus(plan.id)}
                          >
                            {plan.is_active ? (
                              <ToggleRight className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-gray-400" />
                            )}
                          </Button>
                          <Link
                            href={`/admin/marketplace/subscription-plans/${plan.id}/edit`}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            disabled={plan.subscriptions_count > 0}
                            onClick={() => deletePlan(plan.id, plan.name)}
                            title={plan.subscriptions_count > 0 ? 'Cannot delete plan with active subscriptions' : 'Delete plan'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination would go here */}
            {plans.meta && (
              <div className="mt-4 text-sm text-gray-600 text-center">
                Showing {plans.meta.from || 0} to {plans.meta.to || 0} of {plans.meta.total} plans
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/marketplace/subscription-plans/user-subscriptions">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">User Subscriptions</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Manage individual user subscriptions and assignments
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/marketplace/subscription-plans/analytics">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  <span className="font-medium">Analytics</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  View subscription revenue and usage analytics
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/marketplace/subscription-plans/create">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-purple-500" />
                  <span className="font-medium">Create New Plan</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Add a new subscription plan with custom features
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}