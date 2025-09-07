import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
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
  Users,
  Calendar
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
  vendor_paid: boolean;
  vendor_paid_at: string | null;
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
  pending_count: number;
  completed_count: number;
}

interface Filters {
  payout_status?: string;
  vendor_id?: string;
  [key: string]: string | undefined;
}

interface Props {
  payouts: PaginatedPayments;
  payoutStats: PayoutStats;
  filters: Filters;
}

export default function VendorPayouts({ payouts, payoutStats, filters }: Props) {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    note: '',
  });

  const handleFilterChange = (key: keyof Filters, value: string) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);

    router.get('/marketplace/admin/payments/vendor-payouts', newFilters, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const clearFilters = () => {
    const clearedFilters = {};
    setLocalFilters(clearedFilters);
    router.get('/marketplace/admin/payments/vendor-payouts', clearedFilters);
  };

  const handleMarkAsPaid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;

    post(`/marketplace/admin/payments/${selectedPayment.id}/mark-vendor-paid`, {
      onSuccess: () => {
        setShowPayoutDialog(false);
        setSelectedPayment(null);
        reset();
      },
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
              <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(payoutStats.pending_amount)}
              </div>
              <p className="text-xs text-muted-foreground">
                {payoutStats.pending_count} payments pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Payouts</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(payoutStats.completed_amount)}
              </div>
              <p className="text-xs text-muted-foreground">
                {payoutStats.completed_count} payments completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {payoutStats.pending_count + payoutStats.completed_count}
              </div>
              <p className="text-xs text-muted-foreground">
                Active vendors with payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing Rate</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {payoutStats.pending_count + payoutStats.completed_count > 0
                  ? Math.round((payoutStats.completed_count / (payoutStats.pending_count + payoutStats.completed_count)) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Payouts completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
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
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
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

        {/* Payouts Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Vendor Amount</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      No payouts found
                    </TableCell>
                  </TableRow>
                ) : (
                  payouts.data.map((payment) => (
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
                        <p className="font-medium">{payment.order.vendor.business_name}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{payment.order.user.name}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="font-medium">
                          {formatCurrency(payment.vendor_amount)}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="font-medium">
                          {formatCurrency(payment.commission_amount)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={payment.vendor_paid ? 'default' : 'secondary'}>
                          {payment.vendor_paid ? 'Paid' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">
                            {new Date(payment.processed_at).toLocaleDateString()}
                          </p>
                          {payment.vendor_paid_at && (
                            <p className="text-xs text-muted-foreground">
                              Paid: {new Date(payment.vendor_paid_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {!payment.vendor_paid && (
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
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

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
      </div>
    </AdminLayout>
  );
}
