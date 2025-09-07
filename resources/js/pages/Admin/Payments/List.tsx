import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Clock,
  ArrowUpDown
} from 'lucide-react';

interface Payment {
  id: number;
  transaction_id: string;
  order: {
    order_number: string;
    user: { name: string };
    vendor: { business_name: string };
  };
  payment_method: string;
  status: string;
  amount: number;
  net_amount: number;
  commission_amount: number;
  vendor_amount: number;
  processed_at: string;
  formatted_amount: string;
  formatted_net_amount: string;
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
  status?: string;
  payment_method?: string;
  vendor_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  [key: string]: string | undefined;
}

interface FilterOptions {
  statuses: string[];
  payment_methods: string[];
}

interface Props {
  payments: PaginatedPayments;
  filters: Filters;
  filterOptions: FilterOptions;
}

export default function PaymentsList({ payments, filters, filterOptions }: Props) {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);

    // Update URL with new filters
    router.get('/marketplace/admin/payments/list', newFilters, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/marketplace/admin/payments/list', localFilters, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const clearFilters = () => {
    const clearedFilters = {};
    setLocalFilters(clearedFilters);
    router.get('/marketplace/admin/payments/list', clearedFilters);
  };

  const exportPayments = () => {
    const exportParams = new URLSearchParams({
      format: 'csv',
      ...localFilters,
    });
    window.open(`/marketplace/admin/payments/export?${exportParams}`, '_blank');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
      <Head title="All Payments" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">All Payments</h1>
            <p className="text-muted-foreground">
              View and manage all payment transactions
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
                      <SelectItem value="">All statuses</SelectItem>
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
                      <SelectItem value="">All methods</SelectItem>
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
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
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
                          <p className="font-medium">{payment.transaction_id}</p>
                          <p className="text-sm text-muted-foreground">ID: {payment.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{payment.order.order_number}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{payment.order.user.name}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{payment.order.vendor.business_name}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {payment.payment_method.replace('_', ' ')}
                        </Badge>
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
                          <p className="font-medium">{payment.formatted_net_amount}</p>
                          <p className="text-sm text-muted-foreground">
                            of {payment.formatted_amount}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="font-medium">
                          {formatCurrency(payment.commission_amount)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">
                          {new Date(payment.processed_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.processed_at).toLocaleTimeString()}
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
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Payment Details</DialogTitle>
                              <DialogDescription>
                                Transaction {payment.transaction_id}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Amount</Label>
                                  <p className="font-medium">{payment.formatted_amount}</p>
                                </div>
                                <div>
                                  <Label>Net Amount</Label>
                                  <p className="font-medium">{payment.formatted_net_amount}</p>
                                </div>
                                <div>
                                  <Label>Commission</Label>
                                  <p className="font-medium">
                                    {formatCurrency(payment.commission_amount)}
                                  </p>
                                </div>
                                <div>
                                  <Label>Vendor Amount</Label>
                                  <p className="font-medium">
                                    {formatCurrency(payment.vendor_amount)}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <Label>Order Details</Label>
                                <p>Order #{payment.order.order_number}</p>
                                <p>Customer: {payment.order.user.name}</p>
                                <p>Vendor: {payment.order.vendor.business_name}</p>
                              </div>
                              <div>
                                <Label>Payment Information</Label>
                                <p>Method: {payment.payment_method}</p>
                                <p>Status: {payment.status}</p>
                                <p>Processed: {new Date(payment.processed_at).toLocaleString()}</p>
                              </div>
                            </div>
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
