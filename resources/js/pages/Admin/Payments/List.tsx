import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface Payment {
  id: number;
  transaction_id: string;
  reference?: string;
  gateway_transaction_id?: string;
  type: 'payment' | 'subscription';
  order?: {
    order_number: string;
    user: { name: string; email: string };
    vendor: { business_name: string };
  };
  subscription?: {
    id: number;
    plan_name: string;
    vendor: {
      business_name: string;
      user: { name: string; email: string };
    };
  };
  payment_method: string;
  gateway?: string;
  status: string;
  amount: number;
  currency: string;
  net_amount: number;
  commission_amount: number;
  vendor_amount: number;
  created_at: string;
  processed_at?: string;
  formatted_amount?: string;
  formatted_net_amount?: string;
}

interface PaginatedPayments {
  data: Payment[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
}

interface Filters {
  type?: string;
  status?: string;
  payment_method?: string;
  gateway?: string;
  vendor_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  [key: string]: string | undefined;
}

interface FilterOptions {
  types: string[];
  statuses: string[];
  payment_methods: string[];
  gateways: string[];
}

interface Stats {
  total_payments: number;
  total_amount: number;
  order_payments: number;
  subscription_payments: number;
  completed_payments: number;
  pending_payments: number;
  failed_payments: number;
}

interface Props {
  payments: PaginatedPayments;
  stats: Stats;
  filters: Filters;
  filterOptions: FilterOptions;
}

export default function PaymentsList({ payments, stats, filters, filterOptions }: Props) {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);

    // Update URL with new filters
    router.get('/admin/marketplace/payments/list', newFilters, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/admin/marketplace/payments/list', localFilters, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const clearFilters = () => {
    const clearedFilters = {};
    setLocalFilters(clearedFilters);
    router.get('/admin/marketplace/payments/list', clearedFilters);
  };

  const exportPayments = () => {
    const exportParams = new URLSearchParams({
      format: 'csv',
      ...localFilters,
    });
    window.open(`/admin/marketplace/payments/export?${exportParams}`, '_blank');
  };



  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'processing':
        return 'outline';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <AdminLayout>
      <Head title="Payment Records" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Payment Records</h1>
            <p className="text-muted-foreground">
              View all payment transactions including orders and subscriptions
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Button variant="outline" onClick={exportPayments}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total_payments}</div>
              <p className="text-xs text-muted-foreground">Total Payments</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{formatCurrency(stats.total_amount)}</div>
              <p className="text-xs text-muted-foreground">Total Amount</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.order_payments}</div>
              <p className="text-xs text-muted-foreground">Order Payments</p>
              <p className="text-xs text-muted-foreground mt-1">{stats.subscription_payments} Subscription Payments</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2 text-sm">
                <Badge variant="default">{stats.completed_payments} Completed</Badge>
                <Badge variant="secondary">{stats.pending_payments} Pending</Badge>
                <Badge variant="destructive">{stats.failed_payments} Failed</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Status Distribution</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by transaction ID or order number..."
                  value={localFilters.search || ''}
                  onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                />
              </div>
              <Button type="submit">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </form>

            {/* Expandable Filters */}
            {showFilters && (
              <div className="grid gap-4 md:grid-cols-5 pt-4 border-t">
                <div>
                  <Label>Status</Label>
                  <Select
                    value={localFilters.status || ''}
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=" ">All statuses</SelectItem>
                      {filterOptions.statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Payment Method</Label>
                  <Select
                    value={localFilters.payment_method || ''}
                    onValueChange={(value) => handleFilterChange('payment_method', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All methods" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=" ">All methods</SelectItem>
                      {filterOptions.payment_methods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Date From</Label>
                  <Input
                    type="date"
                    value={localFilters.date_from || ''}
                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Date To</Label>
                  <Input
                    type="date"
                    value={localFilters.date_to || ''}
                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                  />
                </div>

                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Service/Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Vendor/Plan</TableHead>
                  <TableHead>Method / Gateway</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      No payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.data.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{payment.transaction_id}</p>
                          {payment.reference && (
                            <p className="text-xs text-muted-foreground">Ref: {payment.reference}</p>
                          )}
                          <p className="text-xs text-muted-foreground">ID: {payment.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={payment.type === 'subscription' ? 'default' : 'outline'}>
                          {payment.type === 'subscription' ? 'Subscription' : 'Order'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {payment.type === 'payment' && payment.order ? (
                          <div>
                            <p className="font-medium">Order #{payment.order.order_number}</p>
                            <p className="text-xs text-muted-foreground">Product Purchase</p>
                          </div>
                        ) : payment.subscription ? (
                          <div>
                            <p className="font-medium">{payment.subscription.plan_name}</p>
                            <p className="text-xs text-muted-foreground">Subscription Plan</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {payment.type === 'payment' && payment.order ? (
                          <div>
                            <p className="font-medium">{payment.order.user.name}</p>
                            <p className="text-xs text-muted-foreground">{payment.order.user.email}</p>
                          </div>
                        ) : payment.subscription?.vendor?.user ? (
                          <div>
                            <p className="font-medium">{payment.subscription.vendor.user.name}</p>
                            <p className="text-xs text-muted-foreground">{payment.subscription.vendor.user.email}</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {payment.type === 'payment' && payment.order?.vendor ? (
                          <p className="font-medium">{payment.order.vendor.business_name}</p>
                        ) : payment.subscription ? (
                          <p className="font-medium">{payment.subscription.vendor.business_name}</p>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <Badge variant="outline" className="capitalize mb-1">
                            {payment.payment_method.replace('_', ' ')}
                          </Badge>
                          {payment.gateway && (
                            <p className="text-xs text-muted-foreground capitalize">{payment.gateway}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(payment.status)}
                          <Badge variant={getStatusBadgeVariant(payment.status)}>
                            {payment.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <p className="font-medium">
                            {payment.formatted_amount || formatCurrency(payment.amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">{payment.currency}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.created_at).toLocaleTimeString()}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedPayment(payment)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Payment Details</DialogTitle>
                              <DialogDescription>
                                Transaction {payment.transaction_id}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedPayment && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Type</Label>
                                    <p className="font-medium capitalize">{selectedPayment.type}</p>
                                  </div>
                                  <div>
                                    <Label>Status</Label>
                                    <Badge variant={getStatusBadgeVariant(selectedPayment.status)}>
                                      {selectedPayment.status}
                                    </Badge>
                                  </div>
                                  <div>
                                    <Label>Amount</Label>
                                    <p className="font-medium">
                                      {selectedPayment.formatted_amount || formatCurrency(selectedPayment.amount)} {selectedPayment.currency}
                                    </p>
                                  </div>
                                  <div>
                                    <Label>Net Amount</Label>
                                    <p className="font-medium">
                                      {selectedPayment.formatted_net_amount || formatCurrency(selectedPayment.net_amount)}
                                    </p>
                                  </div>
                                  {selectedPayment.type === 'payment' && (
                                    <>
                                      <div>
                                        <Label>Commission</Label>
                                        <p className="font-medium">
                                          {formatCurrency(selectedPayment.commission_amount)}
                                        </p>
                                      </div>
                                      <div>
                                        <Label>Vendor Amount</Label>
                                        <p className="font-medium">
                                          {formatCurrency(selectedPayment.vendor_amount)}
                                        </p>
                                      </div>
                                    </>
                                  )}
                                </div>

                                {selectedPayment.type === 'payment' && selectedPayment.order && (
                                  <div className="border-t pt-4">
                                    <Label>Order Details</Label>
                                    <div className="mt-2 space-y-1">
                                      <p>Order #{selectedPayment.order.order_number}</p>
                                      <p>Customer: {selectedPayment.order.user.name}</p>
                                      <p>Email: {selectedPayment.order.user.email}</p>
                                      <p>Vendor: {selectedPayment.order.vendor.business_name}</p>
                                    </div>
                                  </div>
                                )}

                                {selectedPayment.type === 'subscription' && selectedPayment.subscription && (
                                  <div className="border-t pt-4">
                                    <Label>Subscription Details</Label>
                                    <div className="mt-2 space-y-1">
                                      <p>Plan: {selectedPayment.subscription.plan_name}</p>
                                      <p>Subscriber: {selectedPayment.subscription.vendor.user.name}</p>
                                      <p>Email: {selectedPayment.subscription.vendor.user.email}</p>
                                      <p>Business: {selectedPayment.subscription.vendor.business_name}</p>
                                    </div>
                                  </div>
                                )}

                                <div className="border-t pt-4">
                                  <Label>Payment Information</Label>
                                  <div className="mt-2 space-y-1">
                                    <p>Method: {selectedPayment.payment_method}</p>
                                    {selectedPayment.gateway && <p>Gateway: {selectedPayment.gateway}</p>}
                                    {selectedPayment.reference && <p>Reference: {selectedPayment.reference}</p>}
                                    {selectedPayment.gateway_transaction_id && (
                                      <p>Gateway Transaction: {selectedPayment.gateway_transaction_id}</p>
                                    )}
                                    <p>Created: {new Date(selectedPayment.created_at).toLocaleString()}</p>
                                    {selectedPayment.processed_at && (
                                      <p>Processed: {new Date(selectedPayment.processed_at).toLocaleString()}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {payments.last_page > 1 && (
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              {payments.links.map((link, index) => (
                <Button
                  key={index}
                  variant={link.active ? 'default' : 'outline'}
                  size="sm"
                  disabled={!link.url}
                  onClick={() => {
                    if (link.url) {
                      router.get(link.url);
                    }
                  }}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
