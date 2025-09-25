import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, X } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { 
  Breadcrumb, 
  BreadcrumbList, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';

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
  subscriptions_count: number;
  created_at: string;
}

interface Props {
  plan: SubscriptionPlan;
}

export default function Edit({ plan }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    name: plan.name,
    description: plan.description,
    price: plan.price.toString(),
    billing_cycle: plan.billing_cycle,
    product_limit: plan.product_limit?.toString() || '',
    order_limit: plan.order_limit?.toString() || '',
    allow_cod: plan.allow_cod,
    features: plan.features || [],
    is_active: plan.is_active,
  });

  const [newFeature, setNewFeature] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/admin/marketplace/subscription-plans/${plan.id}`);
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setData('features', [...data.features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setData('features', data.features.filter((_, i) => i !== index));
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('rw-RW', { 
      style: 'currency', 
      currency: 'RWF',
      minimumFractionDigits: 0 
    }).format(numPrice);
  };

  return (
    <AdminLayout>
      <Head title={`Edit ${plan.name} Plan`} />

      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin">Admin</Link>
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
                <Link href="/admin/marketplace/subscription-plans">Subscription Plans</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit {plan.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/admin/marketplace/subscription-plans"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 text-xs"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Plans
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Subscription Plan</h1>
              <p className="text-gray-600">Update the details of the {plan.name} plan</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={plan.is_active ? "default" : "secondary"}>
              {plan.is_active ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="outline">
              {plan.subscriptions_count} subscribers
            </Badge>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Plan Details</CardTitle>
                  <CardDescription>
                    Configure the basic information for this subscription plan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Plan Name</Label>
                      <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="e.g., Premium Plan"
                        className={errors.name ? 'border-red-500' : ''}
                      />
                      {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <Label htmlFor="price">Price (RWF)</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={data.price}
                        onChange={(e) => setData('price', e.target.value)}
                        placeholder="15000"
                        className={errors.price ? 'border-red-500' : ''}
                      />
                      {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price}</p>}
                      <p className="text-xs text-gray-500 mt-1">
                        Preview: {formatPrice(data.price || 0)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="billing_cycle">Billing Cycle</Label>
                    <Select value={data.billing_cycle} onValueChange={(value) => setData('billing_cycle', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select billing cycle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.billing_cycle && <p className="text-sm text-red-600 mt-1">{errors.billing_cycle}</p>}
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      placeholder="Describe what this plan offers..."
                      rows={3}
                    />
                    {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Limits */}
              <Card>
                <CardHeader>
                  <CardTitle>Plan Limits</CardTitle>
                  <CardDescription>
                    Set usage limits for this plan. Leave empty for unlimited.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="product_limit">Product Limit</Label>
                      <Input
                        id="product_limit"
                        type="number"
                        min="0"
                        value={data.product_limit}
                        onChange={(e) => setData('product_limit', e.target.value)}
                        placeholder="Leave empty for unlimited"
                      />
                      {errors.product_limit && <p className="text-sm text-red-600 mt-1">{errors.product_limit}</p>}
                    </div>

                    <div>
                      <Label htmlFor="order_limit">Monthly Order Limit</Label>
                      <Input
                        id="order_limit"
                        type="number"
                        min="0"
                        value={data.order_limit}
                        onChange={(e) => setData('order_limit', e.target.value)}
                        placeholder="Leave empty for unlimited"
                      />
                      {errors.order_limit && <p className="text-sm text-red-600 mt-1">{errors.order_limit}</p>}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="allow_cod"
                      checked={data.allow_cod}
                      onCheckedChange={(checked) => setData('allow_cod', checked)}
                    />
                    <Label htmlFor="allow_cod">Allow Cash on Delivery (COD)</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle>Plan Features</CardTitle>
                  <CardDescription>
                    Add features that highlight what this plan includes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="Add a feature..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    />
                    <Button type="button" onClick={addFeature} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {data.features.map((feature, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <span className="text-sm">{feature}</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFeature(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {data.features.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No features added yet</p>
                  )}
                  {errors.features && <p className="text-sm text-red-600">{errors.features}</p>}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Plan Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={data.is_active}
                      onCheckedChange={(checked) => setData('is_active', checked)}
                    />
                    <Label htmlFor="is_active">Plan is Active</Label>
                  </div>
                  
                  {!data.is_active && (
                    <p className="text-sm text-amber-600">
                      Inactive plans cannot be selected by new users
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current Subscribers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <div className="text-3xl font-bold text-gray-900">{plan.subscriptions_count}</div>
                    <p className="text-sm text-gray-600">active subscribers</p>
                  </div>
                  
                  {plan.subscriptions_count > 0 && (
                    <p className="text-xs text-amber-600 mt-2">
                      Changes to limits may affect existing subscribers
                    </p>
                  )}
                </CardContent>
              </Card>

              <div className="flex flex-col space-y-2">
                <Button type="submit" disabled={processing}>
                  {processing ? 'Updating...' : 'Update Plan'}
                </Button>
                <Link 
                  href="/admin/marketplace/subscription-plans"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}