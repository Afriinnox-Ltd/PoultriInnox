import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

export default function Create() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
    price: '',
    billing_cycle: 'monthly',
    product_limit: '',
    order_limit: '',
    allow_cod: false,
    features: [] as string[],
    is_active: true,
  });

  const [newFeature, setNewFeature] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/admin/marketplace/subscription-plans');
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
    if (isNaN(numPrice)) return 'RWF 0';
    return new Intl.NumberFormat('rw-RW', { 
      style: 'currency', 
      currency: 'RWF',
      minimumFractionDigits: 0 
    }).format(numPrice);
  };

  return (
    <AdminLayout>
      <Head title="Create Subscription Plan" />

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
              <BreadcrumbPage>Create Plan</BreadcrumbPage>
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
              <h1 className="text-2xl font-bold text-gray-900">Create Subscription Plan</h1>
              <p className="text-gray-600">Set up a new subscription plan for marketplace vendors</p>
            </div>
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
                      <Label htmlFor="name">Plan Name *</Label>
                      <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="e.g., Premium Plan"
                        className={errors.name ? 'border-red-500' : ''}
                        required
                      />
                      {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <Label htmlFor="price">Price (RWF) *</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={data.price}
                        onChange={(e) => setData('price', e.target.value)}
                        placeholder="15000"
                        className={errors.price ? 'border-red-500' : ''}
                        required
                      />
                      {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price}</p>}
                      <p className="text-xs text-gray-500 mt-1">
                        Preview: {formatPrice(data.price || 0)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="billing_cycle">Billing Cycle *</Label>
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
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      placeholder="Describe what this plan offers..."
                      rows={3}
                      className={errors.description ? 'border-red-500' : ''}
                      required
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
                      <p className="text-xs text-gray-500 mt-1">
                        Maximum number of products vendor can list
                      </p>
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
                      <p className="text-xs text-gray-500 mt-1">
                        Maximum orders vendor can receive per month
                      </p>
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
                  <p className="text-xs text-gray-500">
                    If enabled, vendors on this plan can accept cash payments on delivery
                  </p>
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
                      Inactive plans will not be available for new subscriptions
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-purple-50">
                    <h3 className="font-bold text-lg">{data.name || 'Plan Name'}</h3>
                    <div className="text-2xl font-bold text-blue-600 my-2">
                      {formatPrice(data.price || 0)}
                      <span className="text-sm text-gray-600">/{data.billing_cycle}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {data.description || 'Plan description will appear here'}
                    </p>
                    <div className="space-y-1">
                      <div className="text-xs">
                        <span className="font-medium">Products:</span> {data.product_limit || '∞'}
                      </div>
                      <div className="text-xs">
                        <span className="font-medium">Orders:</span> {data.order_limit || '∞'}/month
                      </div>
                      <div className="text-xs">
                        <span className="font-medium">COD:</span> {data.allow_cod ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                    {data.features.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-xs font-medium mb-1">Features:</div>
                        <ul className="text-xs space-y-1">
                          {data.features.slice(0, 3).map((feature, index) => (
                            <li key={index}>• {feature}</li>
                          ))}
                          {data.features.length > 3 && (
                            <li>• +{data.features.length - 3} more...</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col space-y-2">
                <Button type="submit" disabled={processing}>
                  {processing ? 'Creating...' : 'Create Plan'}
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