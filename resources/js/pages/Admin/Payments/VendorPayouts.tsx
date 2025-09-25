import React, { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DollarSign,
  Clock,
  CheckCircle,
  Users
} from 'lucide-react';

interface Payment {
  id: number;
  transaction_id: string;
  order: {
    id: number;
    order_number: string;
    user: { name: string; email: string };
    vendor: { 
      id: number;
      business_name: string; 
      user: { name: string; email: string };
    };
  };
  payment_method: string;
  status: string;
  amount: number;
  net_amount: number;
  commission_amount: number;
  vendor_amount: number;
  vendor_paid: boolean;
  vendor_paid_at: string | null;
  payout_requested: boolean;
  payout_requested_at: string | null;
  payout_requested_by?: {
    name: string;
    email: string;
  };
  payout_processing: boolean;
  payout_processing_at: string | null;
  payout_batch_id: string | null;
  payout_notes: string | null;
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

interface PayoutStats {
  pending_amount: number;
  completed_amount: number;
  requested_amount: number;
  processing_amount: number;
  pending_count: number;
  completed_count: number;
  requested_count: number;
  processing_count: number;
}

interface VendorSummary {
  vendor_id: number;
  vendor_name: string;
  vendor_email: string;
  total_pending: number;
  total_requested: number;
  payment_count: number;
  last_request_date: string | null;
}

interface Filters {
  payout_status?: string;
  vendor_id?: string;
  payout_requested?: string;
  date_from?: string;
  date_to?: string;
  [key: string]: string | undefined;
}

interface MarketplaceSettings {
  general?: {
    currency?: string;
    currency_symbol?: string;
  };
  commission?: {
    default_commission_rate?: number;
    commission_type?: 'percentage' | 'fixed';
  };
  fees?: {
    platform_fee_rate?: number;
    transaction_fee_rate?: number;
  };
}

interface Props {
  payouts: PaginatedPayments;
  payoutStats: PayoutStats;
  vendorSummaries: VendorSummary[];
  filters: Filters;
}

export default function VendorPayouts({ payouts, payoutStats, vendorSummaries, filters }: Props) {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'payments' | 'vendors'>('payments');
  const [showBatchDialog, setShowBatchDialog] = useState(false);

  const { props } = usePage();
  const marketplaceSettings = props.marketplaceSettings as MarketplaceSettings;

  const { data, setData, post, processing, errors, reset } = useForm({
    note: '',
    batch_id: '',
    processing_note: '',
    selected_payments: [] as number[],
  });

  const handleFilterChange = (key: keyof Filters, value: string) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);

    router.get('/admin/marketplace/payments/vendor-payouts', newFilters, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const clearFilters = () => {
    const clearedFilters = {};
    setLocalFilters(clearedFilters);
    router.get('/admin/marketplace/payments/vendor-payouts', clearedFilters);
  };

  const handleMarkAsPaid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;

    post(`/admin/marketplace/payments/${selectedPayment.id}/mark-vendor-paid`, {
      onSuccess: () => {
        setShowPayoutDialog(false);
        setSelectedPayment(null);
        reset();
      },
    });
  };

  const handleBatchProcess = (e: React.FormEvent) => {
    e.preventDefault();
    setData('selected_payments', selectedPayments);
    
    post('/admin/marketplace/payments/batch-process-payouts', {
      onSuccess: () => {
        setShowBatchDialog(false);
        setSelectedPayments([]);
        reset();
      },
    });
  };

  const handleSelectPayment = (paymentId: number) => {
    setSelectedPayments(prev => 
      prev.includes(paymentId) 
        ? prev.filter(id => id !== paymentId)
        : [...prev, paymentId]
    );
  };

  const handleSelectAll = () => {
    const pendingPayments = payouts.data
      .filter(p => !p.vendor_paid && p.payout_requested)
      .map(p => p.id);
    
    setSelectedPayments(prev => 
      prev.length === pendingPayments.length ? [] : pendingPayments
    );
  };

  const formatCurrency = (amount: number) => {
    const currency = marketplaceSettings?.general?.currency || 'RWF';
    const symbol = marketplaceSettings?.general?.currency_symbol || 'RWF';
    
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'symbol'
    }).format(amount).replace(currency, symbol);
  };

  return (
    <AdminLayout>
      <Head title="Vendor Payouts" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Vendor Payouts</h1>
            <p className="text-muted-foreground">
              Manage vendor payments and payout schedules
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payout Requests</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(payoutStats.requested_amount)}
              </div>
              <p className="text-xs text-muted-foreground">
                {payoutStats.requested_count} requests pending review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(payoutStats.processing_amount)}
              </div>
              <p className="text-xs text-muted-foreground">
                {payoutStats.processing_count} payouts in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {formatCurrency(payoutStats.completed_amount)}
              </div>
              <p className="text-xs text-muted-foreground">
                {payoutStats.completed_count} payouts completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {vendorSummaries.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Vendors with pending payouts
              </p>
            </CardContent>
          </Card>
        </div>

        {/* View Mode Toggle and Filters */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'payments' ? 'default' : 'outline'}
              onClick={() => setViewMode('payments')}
            >
              Payment View
            </Button>
            <Button
              variant={viewMode === 'vendors' ? 'default' : 'outline'}
              onClick={() => setViewMode('vendors')}
            >
              Vendor Summary
            </Button>
          </div>
          
          {viewMode === 'payments' && selectedPayments.length > 0 && (
            <Button onClick={() => setShowBatchDialog(true)}>
              Process {selectedPayments.length} Payouts
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <Label>Payout Status</Label>
                <Select
                  value={localFilters.payout_status || ''}
                  onValueChange={(value) => handleFilterChange('payout_status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="requested">Requested</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Payout Requested</Label>
                <Select
                  value={localFilters.payout_requested || ''}
                  onValueChange={(value) => handleFilterChange('payout_requested', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All requests" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">All requests</SelectItem>
                    <SelectItem value="yes">Requested</SelectItem>
                    <SelectItem value="no">Not Requested</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Vendor ID</Label>
                <Input
                  placeholder="Enter vendor ID"
                  value={localFilters.vendor_id || ''}
                  onChange={(e) => setLocalFilters({ ...localFilters, vendor_id: e.target.value })}
                  onBlur={() => handleFilterChange('vendor_id', localFilters.vendor_id || '')}
                />
              </div>

              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tables Section */}
        {viewMode === 'vendors' ? (
          /* Vendor Summary Table */
          <Card>
            <CardHeader>
              <CardTitle>Vendor Payout Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Pending Amount</TableHead>
                    <TableHead className="text-right">Requested Amount</TableHead>
                    <TableHead className="text-center">Payment Count</TableHead>
                    <TableHead>Last Request</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendorSummaries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No vendor payouts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    vendorSummaries.map((vendor) => (
                      <TableRow key={vendor.vendor_id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{vendor.vendor_name}</p>
                            <p className="text-sm text-muted-foreground">ID: {vendor.vendor_id}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{vendor.vendor_email}</p>
                        </TableCell>
                        <TableCell className="text-right">
                          <p className="font-medium">
                            {formatCurrency(vendor.total_pending)}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <p className="font-medium text-orange-600">
                            {formatCurrency(vendor.total_requested)}
                          </p>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{vendor.payment_count}</Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">
                            {vendor.last_request_date 
                              ? new Date(vendor.last_request_date).toLocaleDateString()
                              : 'No requests'
                            }
                          </p>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFilterChange('vendor_id', vendor.vendor_id.toString())}
                          >
                            View Payments
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          /* Enhanced Payouts Table */
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Vendor Payouts</CardTitle>
              {payouts.data.filter(p => !p.vendor_paid && p.payout_requested).length > 0 && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {selectedPayments.length === payouts.data.filter(p => !p.vendor_paid && p.payout_requested).length 
                      ? 'Deselect All' 
                      : 'Select All Requested'
                    }
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {selectedPayments.length} selected
                  </span>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedPayments.length > 0 && selectedPayments.length === payouts.data.filter(p => !p.vendor_paid && p.payout_requested).length}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </TableHead>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Vendor Amount</TableHead>
                    <TableHead>Request Status</TableHead>
                    <TableHead>Payout Status</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        No payouts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    payouts.data.map((payment) => (
                      <TableRow key={payment.id} className={selectedPayments.includes(payment.id) ? 'bg-blue-50' : ''}>
                        <TableCell>
                          {!payment.vendor_paid && payment.payout_requested && (
                            <input
                              type="checkbox"
                              checked={selectedPayments.includes(payment.id)}
                              onChange={() => handleSelectPayment(payment.id)}
                              className="rounded"
                            />
                          )}
                        </TableCell>
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
                          <div>
                            <p className="font-medium">{payment.order.vendor.business_name}</p>
                            <p className="text-sm text-muted-foreground">{payment.order.vendor.user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{payment.order.user.name}</p>
                            <p className="text-sm text-muted-foreground">{payment.order.user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <p className="font-medium text-emerald-600">
                            {formatCurrency(payment.vendor_amount)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant={payment.payout_requested ? 'default' : 'secondary'}>
                              {payment.payout_requested ? 'Requested' : 'Not Requested'}
                            </Badge>
                            {payment.payout_requested_at && (
                              <p className="text-xs text-muted-foreground">
                                {new Date(payment.payout_requested_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge 
                              variant={
                                payment.vendor_paid ? 'default' : 
                                payment.payout_processing ? 'secondary' : 
                                'outline'
                              }
                            >
                              {payment.vendor_paid ? 'Paid' : 
                               payment.payout_processing ? 'Processing' : 
                               'Pending'}
                            </Badge>
                            {payment.payout_batch_id && (
                              <p className="text-xs text-muted-foreground">
                                Batch: {payment.payout_batch_id}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>Order: {new Date(payment.processed_at).toLocaleDateString()}</p>
                            {payment.vendor_paid_at && (
                              <p className="text-emerald-600">
                                Paid: {new Date(payment.vendor_paid_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {!payment.vendor_paid && payment.payout_requested && (
                              <Dialog open={showPayoutDialog && selectedPayment?.id === payment.id} onOpenChange={setShowPayoutDialog}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedPayment(payment)}
                                  >
                                    Mark as Paid
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <form onSubmit={handleMarkAsPaid}>
                                    <DialogHeader>
                                      <DialogTitle>Mark Vendor as Paid</DialogTitle>
                                      <DialogDescription>
                                        Confirm that {payment.order.vendor.business_name} has been paid{' '}
                                        {formatCurrency(payment.vendor_amount)} for transaction{' '}
                                        {payment.transaction_id}.
                                      </DialogDescription>
                                    </DialogHeader>

                                    <div className="my-4">
                                      <Label htmlFor="note">Note (Optional)</Label>
                                      <Textarea
                                        id="note"
                                        placeholder="Add a note about this payout..."
                                        value={data.note}
                                        onChange={(e) => setData('note', e.target.value)}
                                        className="mt-1"
                                      />
                                      {errors.note && (
                                        <p className="text-sm text-red-500 mt-1">{errors.note}</p>
                                      )}
                                    </div>

                                    <DialogFooter>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                          setShowPayoutDialog(false);
                                          setSelectedPayment(null);
                                          reset();
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                      <Button type="submit" disabled={processing}>
                                        {processing ? 'Processing...' : 'Mark as Paid'}
                                      </Button>
                                    </DialogFooter>
                                  </form>
                                </DialogContent>
                              </Dialog>
                            )}
                            {!payment.payout_requested && (
                              <Badge variant="outline" className="text-xs">
                                Awaiting Request
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {payouts.last_page > 1 && (
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              {payouts.links.map((link, index) => (
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

        {/* Batch Processing Dialog */}
        <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleBatchProcess}>
              <DialogHeader>
                <DialogTitle>Batch Process Payouts</DialogTitle>
                <DialogDescription>
                  Process {selectedPayments.length} selected payout{selectedPayments.length !== 1 ? 's' : ''} in a single batch.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-4">
                <div>
                  <Label htmlFor="batch_id">Batch ID</Label>
                  <Input
                    id="batch_id"
                    placeholder="Enter batch reference ID (optional)"
                    value={data.batch_id}
                    onChange={(e) => setData('batch_id', e.target.value)}
                    className="mt-1"
                  />
                  {errors.batch_id && (
                    <p className="text-sm text-red-500 mt-1">{errors.batch_id}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="processing_note">Processing Note</Label>
                  <Textarea
                    id="processing_note"
                    placeholder="Add a note about this batch processing..."
                    value={data.processing_note}
                    onChange={(e) => setData('processing_note', e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                  {errors.processing_note && (
                    <p className="text-sm text-red-500 mt-1">{errors.processing_note}</p>
                  )}
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Selected Payouts Summary:</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Count:</span> {selectedPayments.length} payments</p>
                    <p>
                      <span className="font-medium">Total Amount:</span> {' '}
                      {formatCurrency(
                        payouts.data
                          .filter(p => selectedPayments.includes(p.id))
                          .reduce((sum, p) => sum + p.vendor_amount, 0)
                      )}
                    </p>
                    <p>
                      <span className="font-medium">Vendors:</span> {' '}
                      {new Set(
                        payouts.data
                          .filter(p => selectedPayments.includes(p.id))
                          .map(p => p.order.vendor.business_name)
                      ).size} unique vendors
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowBatchDialog(false);
                    reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Processing...' : 'Process Batch Payout'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
