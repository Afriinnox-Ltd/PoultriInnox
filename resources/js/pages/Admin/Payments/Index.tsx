import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Users,
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

interface DashboardStats {
  total_revenue: number;
  total_commission: number;
  pending_vendor_payouts: number;
  completed_vendor_payouts: number;
  total_payments: number;
  successful_payments: number;
  failed_payments: number;
  success_rate: number;
}

interface MonthlyTrend {
  month: string;
  month_number: number;
  revenue: number;
  transactions: number;
}

interface PaymentMethodStat {
  payment_method: string;
  total_amount: number;
  transaction_count: number;
}

interface MarketplaceSettings {
  general?: {
    currency?: string;
    currency_symbol?: string;
  };
}

interface Props {
  dashboardStats: DashboardStats;
  monthlyTrend: MonthlyTrend[];
  paymentMethodStats: PaymentMethodStat[];
  recentPayments: Payment[];
  currentPeriod: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function PaymentsIndex({
  dashboardStats,
  monthlyTrend,
  paymentMethodStats,
  recentPayments,
  currentPeriod,
}: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState(currentPeriod);

  const { props } = usePage();
  const marketplaceSettings = props.marketplaceSettings as MarketplaceSettings;

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    window.location.href = `?period=${period}`;
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
      <Head title="Payments Dashboard" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Payments Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor revenue, track payments, and manage vendor payouts
            </p>
          </div>

          <div className="flex gap-2">
            <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="default" asChild>
              <a href="/admin/marketplace/payments/list">View All Payments</a>
            </Button>

            <Button variant="outline" asChild>
              <a href="/admin/marketplace/payments/export">Export Data</a>
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(dashboardStats.total_revenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                +{dashboardStats.successful_payments} successful payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commission Earned</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(dashboardStats.total_commission)}
              </div>
              <p className="text-xs text-muted-foreground">
                Platform commission earnings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(dashboardStats.pending_vendor_payouts)}
              </div>
              <p className="text-xs text-muted-foreground">
                To vendors awaiting payment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.success_rate}%</div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.successful_payments}/{dashboardStats.total_payments} payments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Monthly Revenue Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {monthlyTrend.slice(-6).map((month) => (
                  <div key={month.month_number} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{month.month}</span>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(month.revenue)}</div>
                      <div className="text-xs text-muted-foreground">
                        {month.transactions} transactions
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentMethodStats.map((method, index) => (
                  <div key={method.payment_method} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium capitalize">
                        {method.payment_method.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(method.total_amount)}</div>
                      <div className="text-xs text-muted-foreground">
                        {method.transaction_count} transactions
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Payments</CardTitle>

          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No payments found
                </p>
              ) : (
                recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(payment.status)}
                        <Badge variant={getStatusBadgeVariant(payment.status)}>
                          {payment.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="font-medium">{payment.transaction_id}</p>
                        <p className="text-sm text-muted-foreground">
                          Order #{payment.order.order_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{payment.order.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          via {payment.order.vendor.business_name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{payment.formatted_net_amount}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payment.processed_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vendor Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage pending vendor payouts and payment schedules
              </p>
              <Button className="w-full" asChild>
                <a href="/admin/marketplace/payments/vendor-payouts">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Payouts
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
