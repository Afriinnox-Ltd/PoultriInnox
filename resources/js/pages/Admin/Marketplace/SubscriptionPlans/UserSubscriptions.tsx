import React from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
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
  Search, 
  UserPlus, 
  Crown, 
  Trash2,
  Filter,
  Home 
} from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';

interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  billing_cycle: string;
  is_active: boolean;
}

interface UserSubscription {
  id: number;
  user: User;
  plan: SubscriptionPlan;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  payment_status: string;
  created_at: string;
}

interface Props {
  subscriptions: {
    data: UserSubscription[];
    meta?: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
      from: number;
      to: number;
    };
  };
  plans: SubscriptionPlan[];
  users: User[];
  filters: {
    search?: string;
    plan?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
  };
  stats: {
    total_subscriptions: number;
    active_subscriptions: number;
    expired_subscriptions: number;
    revenue_this_month: number;
  };
}

export default function UserSubscriptions({ subscriptions, plans, users, filters, stats }: Props) {
  const [showAssignDialog, setShowAssignDialog] = React.useState(false);
  
  const { data: searchData, setData: setSearchData, get } = useForm({
    search: filters.search || '',
    plan: filters.plan || '',
    status: filters.status || '',
    date_from: filters.date_from || '',
    date_to: filters.date_to || '',
  });

  const { data: assignData, setData: setAssignData, post, processing, errors, reset } = useForm({
    user_id: '',
    plan_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    get('/admin/marketplace/subscription-plans/user-subscriptions', {
      preserveState: true,
      replace: true,
    });
  };

  const handleAssignPlan = (e: React.FormEvent) => {
    e.preventDefault();
    post('/admin/marketplace/subscription-plans/assign-plan', {
      onSuccess: () => {
        setShowAssignDialog(false);
        reset();
        router.reload({ only: ['subscriptions', 'stats'] });
      },
    });
  };

  const removeSubscription = (subscriptionId: number, userName: string) => {
    if (confirm(`Are you sure you want to remove the subscription for ${userName}? This action cannot be undone.`)) {
      router.delete(`/admin/marketplace/subscription-plans/subscriptions/${subscriptionId}`, {
        preserveState: true,
        onSuccess: () => {
          router.reload({ only: ['subscriptions', 'stats'] });
        },
      });
    }
  };

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
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (subscription: UserSubscription) => {
    if (!subscription.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    
    if (subscription.end_date && new Date(subscription.end_date) < new Date()) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    if (subscription.payment_status === 'pending') {
      return <Badge variant="outline">Pending Payment</Badge>;
    }
    
    return <Badge variant="default">Active</Badge>;
  };

  return (
    <AdminLayout>
      <Head title="User Subscriptions Management" />

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
              <BreadcrumbPage>User Subscriptions</BreadcrumbPage>
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
              <h1 className="text-2xl font-bold text-gray-900">User Subscriptions</h1>
              <p className="text-gray-600">Manage individual user subscription assignments</p>
            </div>
          </div>
          
          <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Assign Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Subscription Plan</DialogTitle>
                <DialogDescription>
                  Assign a subscription plan to a user
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAssignPlan} className="space-y-4">
                <div>
                  <Label htmlFor="user_id">User</Label>
                  <Select value={assignData.user_id} onValueChange={(value) => setAssignData('user_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.user_id && <p className="text-sm text-red-600 mt-1">{errors.user_id}</p>}
                </div>

                <div>
                  <Label htmlFor="plan_id">Subscription Plan</Label>
                  <Select value={assignData.plan_id} onValueChange={(value) => setAssignData('plan_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.filter(plan => plan.is_active).map((plan) => (
                        <SelectItem key={plan.id} value={plan.id.toString()}>
                          {plan.name} - {formatPrice(plan.price)}/{plan.billing_cycle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.plan_id && <p className="text-sm text-red-600 mt-1">{errors.plan_id}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={assignData.start_date}
                      onChange={(e) => setAssignData('start_date', e.target.value)}
                      className={errors.start_date ? 'border-red-500' : ''}
                    />
                    {errors.start_date && <p className="text-sm text-red-600 mt-1">{errors.start_date}</p>}
                  </div>

                  <div>
                    <Label htmlFor="end_date">End Date (Optional)</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={assignData.end_date}
                      onChange={(e) => setAssignData('end_date', e.target.value)}
                      className={errors.end_date ? 'border-red-500' : ''}
                    />
                    {errors.end_date && <p className="text-sm text-red-600 mt-1">{errors.end_date}</p>}
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowAssignDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={processing}>
                    {processing ? 'Assigning...' : 'Assign Plan'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_subscriptions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{stats.active_subscriptions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Expired/Inactive</CardTitle>  
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.expired_subscriptions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatPrice(stats.revenue_this_month)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <Label htmlFor="search">Search Users</Label>
                  <Input
                    id="search"
                    placeholder="Search by name or email..."
                    value={searchData.search}
                    onChange={(e) => setSearchData('search', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="plan">Filter by Plan</Label>
                  <Select value={searchData.plan} onValueChange={(value) => setSearchData('plan', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All plans" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=" ">All plans</SelectItem>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id.toString()}>
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Filter by Status</Label>
                  <Select value={searchData.status} onValueChange={(value) => setSearchData('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=" ">All statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="pending">Pending Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date_from">From Date</Label>
                  <Input
                    id="date_from"
                    type="date"
                    value={searchData.date_from}
                    onChange={(e) => setSearchData('date_from', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="date_to">To Date</Label>
                  <Input
                    id="date_to"
                    type="date"
                    value={searchData.date_to}
                    onChange={(e) => setSearchData('date_to', e.target.value)}
                  />
                </div>

                <div className="flex items-end">
                  <Button type="submit" className="w-full">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Subscriptions Table */}
        <Card>
          <CardHeader>
            <CardTitle>User Subscriptions</CardTitle>
            <CardDescription>
              Manage individual user subscription assignments and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3">User</th>
                    <th className="text-left py-3">Plan</th>
                    <th className="text-left py-3">Duration</th>
                    <th className="text-left py-3">Status</th>
                    <th className="text-left py-3">Payment</th>
                    <th className="text-left py-3">Started</th>
                    <th className="text-left py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.data.map((subscription) => (
                    <tr key={subscription.id} className="border-b hover:bg-gray-50">
                      <td className="py-4">
                        <div>
                          <div className="font-medium text-gray-900">{subscription.user.name}</div>
                          <div className="text-gray-500 text-sm">{subscription.user.email}</div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center space-x-2">
                          <Crown className="w-4 h-4 text-yellow-500" />
                          <div>
                            <div className="font-medium">{subscription.plan.name}</div>
                            <div className="text-gray-500 text-sm">
                              {formatPrice(subscription.plan.price)}/{subscription.plan.billing_cycle}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="text-sm">
                          <div>{formatDate(subscription.start_date)}</div>
                          {subscription.end_date && (
                            <div className="text-gray-500">to {formatDate(subscription.end_date)}</div>
                          )}
                          {!subscription.end_date && (
                            <div className="text-gray-500">Ongoing</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4">
                        {getStatusBadge(subscription)}
                      </td>
                      <td className="py-4">
                        <Badge variant={subscription.payment_status === 'paid' ? 'default' : 'outline'}>
                          {subscription.payment_status}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <div className="text-sm text-gray-600">
                          {formatDate(subscription.created_at)}
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => removeSubscription(subscription.id, subscription.user.name)}
                            title="Remove subscription"
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

            {subscriptions.data.length === 0 && (
              <div className="text-center py-8">
                <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions found</h3>
                <p className="text-gray-600 mb-4">
                  {filters.search || filters.plan || filters.status 
                    ? "No subscriptions match your current filters."
                    : "No users have been assigned subscription plans yet."
                  }
                </p>
                {!filters.search && !filters.plan && !filters.status && (
                  <Button onClick={() => setShowAssignDialog(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Assign First Plan
                  </Button>
                )}
              </div>
            )}

            {/* Pagination */}
            {subscriptions.meta && subscriptions.meta.last_page > 1 && (
              <div className="mt-4 text-sm text-gray-600 text-center">
                Showing {subscriptions.meta.from || 0} to {subscriptions.meta.to || 0} of{' '}
                {subscriptions.meta.total} subscriptions
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}