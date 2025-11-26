import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    TrendingUp,
    DollarSign,
    Package,
    ShoppingCart,
    Users,
    Activity,
    BarChart3,
    Calendar,
    Filter,
    Store,
    CreditCard,
    CheckCircle,
    XCircle,
    Clock,
    Wallet,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
    Percent,
    Shield,
    Star,
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface SalesData { date: string; orders: number; revenue: number; }
interface ProductPerformance { id: number; name: string; order_items_count: number; category?: { name: string }; }
interface VendorPerformance { id: number; business_name: string; orders_count: number; products_count: number; orders_sum_total_amount: number; }
interface CategoryPerformance { id: number; name: string; products_count: number; total_sales: number; }
interface RevenueStats { today: number; this_week: number; this_month: number; this_year: number; }
interface MonthlyTrend { month: string; orders: number; revenue: number; }
interface MonthlyCount { month: string; count: number; revenue?: number; }
interface PaymentMethod { payment_method: string; count: number; total_amount: number; }
interface PlanDistribution { id: number; name: string; price: number; billing_cycle: string; subscriptions_count: number; active_subscriptions_count: number; }

interface Props {
    period: string;
    start_date: string;
    end_date: string;
    sales_data: SalesData[];
    revenue_stats: RevenueStats;
    order_stats: { total: number; period_total: number; pending: number; processing: number; shipped: number; delivered: number; completed: number; cancelled: number; refunded: number; };
    vendor_stats: { total: number; approved: number; pending: number; rejected: number; suspended: number; verified: number; new_this_month: number; };
    product_stats: { total: number; active: number; pending: number; inactive: number; out_of_stock: number; new_this_month: number; };
    payment_stats: { total_revenue: number; total_commission: number; pending_payouts: number; completed_payouts: number; total_payments: number; successful: number; failed: number; success_rate: number; };
    subscription_stats: { total_plans: number; active_plans: number; total_subscriptions: number; active_subscriptions: number; subscription_revenue: number; new_this_month: number; };
    monthly_trend: MonthlyTrend[];
    monthly_vendors: MonthlyCount[];
    monthly_orders: MonthlyCount[];
    product_performance: ProductPerformance[];
    vendor_performance: VendorPerformance[];
    category_performance: CategoryPerformance[];
    payment_methods: PaymentMethod[];
    plan_distribution: PlanDistribution[];
}

export default function Analytics({
    period, start_date, end_date, sales_data, revenue_stats, order_stats, vendor_stats, product_stats, payment_stats, subscription_stats,
    monthly_trend, monthly_vendors, monthly_orders, product_performance, vendor_performance, category_performance, payment_methods, plan_distribution,
}: Props) {
    const [selectedPeriod, setSelectedPeriod] = useState(period);
    const [startDate, setStartDate] = useState(start_date);
    const [endDate, setEndDate] = useState(end_date);
    const [showDatePicker, setShowDatePicker] = useState(period === 'custom');

    const handlePeriodChange = (newPeriod: string) => {
        setSelectedPeriod(newPeriod);
        if (newPeriod !== 'custom') {
            setShowDatePicker(false);
            router.get('/admin/marketplace/analytics', { period: newPeriod }, { preserveState: true, replace: true });
        } else {
            setShowDatePicker(true);
        }
    };

    const handleDateFilter = () => {
        router.get('/admin/marketplace/analytics', { period: 'custom', start_date: startDate, end_date: endDate }, { preserveState: true, replace: true });
    };

    const fmt = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(amount || 0);
    const fmtN = (num: number) => new Intl.NumberFormat('en-US').format(num || 0);

    const totalRevenue = sales_data.reduce((s, i) => s + (i.revenue || 0), 0);
    const totalOrders = sales_data.reduce((s, i) => s + (i.orders || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const maxTrend = Math.max(...(monthly_trend.map(m => m.revenue) || [0]), 1);
    const maxCat = Math.max(...(category_performance.map(c => c.total_sales) || [0]), 1);

    return (
        <AdminLayout>
            <Head title="Marketplace Analytics" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Marketplace Analytics</h1>
                            <p className="text-muted-foreground">Comprehensive insights across all marketplace functions</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <select value={selectedPeriod} onChange={(e) => handlePeriodChange(e.target.value)}
                                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                                <option value="day">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="year">This Year</option>
                                <option value="custom">Custom Range</option>
                            </select>
                        </div>
                    </div>
                    {showDatePicker && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-end gap-4">
                                    <div className="flex-1">
                                        <label className="text-sm font-medium mb-2 block">Start Date</label>
                                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                                            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-sm font-medium mb-2 block">End Date</label>
                                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                                            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                                    </div>
                                    <Button onClick={handleDateFilter}><Filter className="h-4 w-4 mr-2" /> Apply</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Revenue Overview */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{fmt(revenue_stats.today)}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">This Week</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{fmt(revenue_stats.this_week)}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">This Month</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{fmt(revenue_stats.this_month)}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">This Year</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{fmt(revenue_stats.this_year)}</div></CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="overview">
                    <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="orders">Orders</TabsTrigger>
                        <TabsTrigger value="vendors">Vendors</TabsTrigger>
                        <TabsTrigger value="products">Products</TabsTrigger>
                        <TabsTrigger value="payments">Payments</TabsTrigger>
                        <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                    </TabsList>

                    {/* ─── OVERVIEW TAB ─── */}
                    <TabsContent value="overview" className="space-y-6">
                        {/* Period Summary */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Period Revenue</CardTitle>
                                    <DollarSign className="h-4 w-4 text-emerald-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-emerald-600">{fmt(totalRevenue)}</div>
                                    <p className="text-xs text-muted-foreground">{fmtN(totalOrders)} orders</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-purple-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-purple-600">{fmt(avgOrderValue)}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Commission Earned</CardTitle>
                                    <Percent className="h-4 w-4 text-blue-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-blue-600">{fmt(payment_stats.total_commission)}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Payment Success</CardTitle>
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{payment_stats.success_rate}%</div>
                                    <p className="text-xs text-muted-foreground">{payment_stats.successful}/{payment_stats.total_payments}</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Key Counts */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {[
                                { label: 'Total Vendors', value: vendor_stats.total, icon: Store, color: 'text-blue-600' },
                                { label: 'Active Products', value: product_stats.active, icon: Package, color: 'text-green-600' },
                                { label: 'Total Orders', value: order_stats.total, icon: ShoppingCart, color: 'text-purple-600' },
                                { label: 'Active Subs', value: subscription_stats.active_subscriptions, icon: Star, color: 'text-orange-600' },
                                { label: 'Pending Payouts', value: fmt(payment_stats.pending_payouts), icon: Wallet, color: 'text-red-600', raw: true },
                                { label: 'New Vendors (mo)', value: vendor_stats.new_this_month, icon: ArrowUpRight, color: 'text-teal-600' },
                            ].map((item, i) => (
                                <Card key={i}>
                                    <CardContent className="pt-4 pb-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <item.icon className={`h-4 w-4 ${item.color}`} />
                                            <span className="text-xs text-muted-foreground">{item.label}</span>
                                        </div>
                                        <div className={`text-xl font-bold ${item.color}`}>{item.raw ? item.value : fmtN(item.value as number)}</div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Monthly Revenue Trend */}
                        <Card>
                            <CardHeader><CardTitle>Monthly Revenue Trend (12 months)</CardTitle></CardHeader>
                            <CardContent>
                                {monthly_trend.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">No data yet</div>
                                ) : (
                                    <div className="space-y-2">
                                        {monthly_trend.map(m => (
                                            <div key={m.month} className="flex items-center gap-3">
                                                <span className="text-xs text-muted-foreground w-20 shrink-0">{m.month}</span>
                                                <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                                                    <div className="h-full bg-primary rounded-full flex items-center justify-end pr-2"
                                                        style={{ width: `${Math.max((m.revenue / maxTrend) * 100, 3)}%` }}>
                                                        {m.revenue > maxTrend * 0.15 && <span className="text-[10px] text-primary-foreground font-medium">{fmt(m.revenue)}</span>}
                                                    </div>
                                                </div>
                                                {m.revenue <= maxTrend * 0.15 && <span className="text-xs text-muted-foreground">{fmt(m.revenue)}</span>}
                                                <span className="text-xs text-muted-foreground w-12 text-right">{m.orders} txns</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Top Performers Side by Side */}
                        <div className="grid lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader><CardTitle>Top Products</CardTitle><CardDescription>By sales volume in period</CardDescription></CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Sales</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {product_performance.length > 0 ? product_performance.map(p => (
                                                <TableRow key={p.id}>
                                                    <TableCell className="font-medium">{p.name}</TableCell>
                                                    <TableCell><Badge variant="outline">{p.category?.name || '-'}</Badge></TableCell>
                                                    <TableCell className="text-right">{fmtN(p.order_items_count)}</TableCell>
                                                </TableRow>
                                            )) : <TableRow><TableCell colSpan={3} className="text-center py-4 text-muted-foreground">No data</TableCell></TableRow>}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Top Vendors</CardTitle><CardDescription>By revenue in period</CardDescription></CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Vendor</TableHead><TableHead className="text-right">Orders</TableHead><TableHead className="text-right">Revenue</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {vendor_performance.length > 0 ? vendor_performance.map(v => (
                                                <TableRow key={v.id}>
                                                    <TableCell className="font-medium">{v.business_name}</TableCell>
                                                    <TableCell className="text-right">{fmtN(v.orders_count)}</TableCell>
                                                    <TableCell className="text-right font-semibold">{fmt(v.orders_sum_total_amount)}</TableCell>
                                                </TableRow>
                                            )) : <TableRow><TableCell colSpan={3} className="text-center py-4 text-muted-foreground">No data</TableCell></TableRow>}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* ─── ORDERS TAB ─── */}
                    <TabsContent value="orders" className="space-y-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground mb-1">Total Orders</div><div className="text-2xl font-bold">{fmtN(order_stats.total)}</div><p className="text-xs text-muted-foreground">{fmtN(order_stats.period_total)} in period</p></CardContent></Card>
                            <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground mb-1">Completed</div><div className="text-2xl font-bold text-green-600">{fmtN(order_stats.completed)}</div></CardContent></Card>
                            <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground mb-1">Pending</div><div className="text-2xl font-bold text-yellow-600">{fmtN(order_stats.pending)}</div></CardContent></Card>
                            <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground mb-1">Cancelled / Refunded</div><div className="text-2xl font-bold text-red-600">{fmtN(order_stats.cancelled + order_stats.refunded)}</div></CardContent></Card>
                        </div>

                        {/* Order Status Breakdown */}
                        <Card>
                            <CardHeader><CardTitle>Order Status Breakdown</CardTitle></CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                    {([
                                        { label: 'Pending', value: order_stats.pending, color: 'bg-yellow-100 text-yellow-800' },
                                        { label: 'Processing', value: order_stats.processing, color: 'bg-blue-100 text-blue-800' },
                                        { label: 'Shipped', value: order_stats.shipped, color: 'bg-indigo-100 text-indigo-800' },
                                        { label: 'Delivered', value: order_stats.delivered, color: 'bg-teal-100 text-teal-800' },
                                        { label: 'Completed', value: order_stats.completed, color: 'bg-green-100 text-green-800' },
                                        { label: 'Cancelled', value: order_stats.cancelled, color: 'bg-red-100 text-red-800' },
                                        { label: 'Refunded', value: order_stats.refunded, color: 'bg-gray-100 text-gray-800' },
                                    ] as const).map(s => (
                                        <div key={s.label} className={`rounded-lg p-3 text-center ${s.color}`}>
                                            <div className="text-2xl font-bold">{fmtN(s.value)}</div>
                                            <div className="text-xs font-medium">{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Daily Sales Table */}
                        <Card>
                            <CardHeader><CardTitle>Daily Sales</CardTitle><CardDescription>Sales for the selected period</CardDescription></CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader><TableRow><TableHead>Date</TableHead><TableHead className="text-right">Orders</TableHead><TableHead className="text-right">Revenue</TableHead><TableHead className="text-right">Avg Order</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {sales_data.length > 0 ? sales_data.map((item, i) => (
                                            <TableRow key={i}>
                                                <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right">{fmtN(item.orders)}</TableCell>
                                                <TableCell className="text-right">{fmt(item.revenue)}</TableCell>
                                                <TableCell className="text-right">{item.orders > 0 ? fmt(item.revenue / item.orders) : '-'}</TableCell>
                                            </TableRow>
                                        )) : <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No sales data for this period</TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Monthly Orders */}
                        <Card>
                            <CardHeader><CardTitle>Monthly Orders (12 months)</CardTitle></CardHeader>
                            <CardContent>
                                {monthly_orders.length === 0 ? <div className="text-center py-8 text-muted-foreground">No data</div> : (
                                    <div className="space-y-2">
                                        {monthly_orders.map(m => {
                                            const max = Math.max(...monthly_orders.map(x => x.count), 1);
                                            return (
                                                <div key={m.month} className="flex items-center gap-3">
                                                    <span className="text-xs text-muted-foreground w-20 shrink-0">{m.month}</span>
                                                    <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.max((m.count / max) * 100, 3)}%` }} />
                                                    </div>
                                                    <span className="text-xs font-medium w-16 text-right">{fmtN(m.count)} orders</span>
                                                    <span className="text-xs text-muted-foreground w-24 text-right">{fmt(m.revenue || 0)}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ─── VENDORS TAB ─── */}
                    <TabsContent value="vendors" className="space-y-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card><CardContent className="pt-4"><div className="flex items-center gap-2 mb-1"><Store className="h-4 w-4 text-blue-500" /><span className="text-xs text-muted-foreground">Total Vendors</span></div><div className="text-2xl font-bold">{fmtN(vendor_stats.total)}</div></CardContent></Card>
                            <Card><CardContent className="pt-4"><div className="flex items-center gap-2 mb-1"><CheckCircle className="h-4 w-4 text-green-500" /><span className="text-xs text-muted-foreground">Approved</span></div><div className="text-2xl font-bold text-green-600">{fmtN(vendor_stats.approved)}</div></CardContent></Card>
                            <Card><CardContent className="pt-4"><div className="flex items-center gap-2 mb-1"><Clock className="h-4 w-4 text-yellow-500" /><span className="text-xs text-muted-foreground">Pending</span></div><div className="text-2xl font-bold text-yellow-600">{fmtN(vendor_stats.pending)}</div></CardContent></Card>
                            <Card><CardContent className="pt-4"><div className="flex items-center gap-2 mb-1"><ArrowUpRight className="h-4 w-4 text-teal-500" /><span className="text-xs text-muted-foreground">New This Month</span></div><div className="text-2xl font-bold text-teal-600">{fmtN(vendor_stats.new_this_month)}</div></CardContent></Card>
                        </div>

                        {/* Vendor Status Breakdown */}
                        <Card>
                            <CardHeader><CardTitle>Vendor Status Distribution</CardTitle></CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {([
                                        { label: 'Approved', value: vendor_stats.approved, color: 'bg-green-100 text-green-800' },
                                        { label: 'Pending', value: vendor_stats.pending, color: 'bg-yellow-100 text-yellow-800' },
                                        { label: 'Rejected', value: vendor_stats.rejected, color: 'bg-red-100 text-red-800' },
                                        { label: 'Suspended', value: vendor_stats.suspended, color: 'bg-gray-100 text-gray-800' },
                                        { label: 'Verified', value: vendor_stats.verified, color: 'bg-blue-100 text-blue-800' },
                                    ] as const).map(s => (
                                        <div key={s.label} className={`rounded-lg p-4 text-center ${s.color}`}>
                                            <div className="text-3xl font-bold">{fmtN(s.value)}</div>
                                            <div className="text-xs font-medium mt-1">{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Monthly New Vendors */}
                        <Card>
                            <CardHeader><CardTitle>Vendor Growth (12 months)</CardTitle></CardHeader>
                            <CardContent>
                                {monthly_vendors.length === 0 ? <div className="text-center py-8 text-muted-foreground">No data</div> : (
                                    <div className="space-y-2">
                                        {monthly_vendors.map(m => {
                                            const max = Math.max(...monthly_vendors.map(x => x.count), 1);
                                            return (
                                                <div key={m.month} className="flex items-center gap-3">
                                                    <span className="text-xs text-muted-foreground w-20 shrink-0">{m.month}</span>
                                                    <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                                                        <div className="h-full bg-teal-500 rounded-full" style={{ width: `${Math.max((m.count / max) * 100, 3)}%` }} />
                                                    </div>
                                                    <span className="text-xs font-medium w-20 text-right">{fmtN(m.count)} new</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Top Vendors */}
                        <Card>
                            <CardHeader><CardTitle>Top Vendors by Revenue</CardTitle><CardDescription>Period performance</CardDescription></CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Vendor</TableHead><TableHead className="text-right">Products</TableHead><TableHead className="text-right">Orders</TableHead><TableHead className="text-right">Revenue</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {vendor_performance.length > 0 ? vendor_performance.map((v, i) => (
                                            <TableRow key={v.id}>
                                                <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                                                <TableCell className="font-medium">{v.business_name}</TableCell>
                                                <TableCell className="text-right">{fmtN(v.products_count)}</TableCell>
                                                <TableCell className="text-right">{fmtN(v.orders_count)}</TableCell>
                                                <TableCell className="text-right font-semibold">{fmt(v.orders_sum_total_amount)}</TableCell>
                                            </TableRow>
                                        )) : <TableRow><TableCell colSpan={5} className="text-center py-4 text-muted-foreground">No data</TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ─── PRODUCTS TAB ─── */}
                    <TabsContent value="products" className="space-y-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card><CardContent className="pt-4"><div className="flex items-center gap-2 mb-1"><Package className="h-4 w-4 text-blue-500" /><span className="text-xs text-muted-foreground">Total Products</span></div><div className="text-2xl font-bold">{fmtN(product_stats.total)}</div></CardContent></Card>
                            <Card><CardContent className="pt-4"><div className="flex items-center gap-2 mb-1"><CheckCircle className="h-4 w-4 text-green-500" /><span className="text-xs text-muted-foreground">Active</span></div><div className="text-2xl font-bold text-green-600">{fmtN(product_stats.active)}</div></CardContent></Card>
                            <Card><CardContent className="pt-4"><div className="flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4 text-red-500" /><span className="text-xs text-muted-foreground">Out of Stock</span></div><div className="text-2xl font-bold text-red-600">{fmtN(product_stats.out_of_stock)}</div></CardContent></Card>
                            <Card><CardContent className="pt-4"><div className="flex items-center gap-2 mb-1"><ArrowUpRight className="h-4 w-4 text-teal-500" /><span className="text-xs text-muted-foreground">New This Month</span></div><div className="text-2xl font-bold text-teal-600">{fmtN(product_stats.new_this_month)}</div></CardContent></Card>
                        </div>

                        {/* Product Status */}
                        <Card>
                            <CardHeader><CardTitle>Product Status Distribution</CardTitle></CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {([
                                        { label: 'Active', value: product_stats.active, color: 'bg-green-100 text-green-800' },
                                        { label: 'Pending', value: product_stats.pending, color: 'bg-yellow-100 text-yellow-800' },
                                        { label: 'Inactive', value: product_stats.inactive, color: 'bg-gray-100 text-gray-800' },
                                        { label: 'Out of Stock', value: product_stats.out_of_stock, color: 'bg-red-100 text-red-800' },
                                        { label: 'Total', value: product_stats.total, color: 'bg-blue-100 text-blue-800' },
                                    ] as const).map(s => (
                                        <div key={s.label} className={`rounded-lg p-4 text-center ${s.color}`}>
                                            <div className="text-3xl font-bold">{fmtN(s.value)}</div>
                                            <div className="text-xs font-medium mt-1">{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Products & Category Performance */}
                        <div className="grid lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader><CardTitle>Top Products</CardTitle><CardDescription>By period sales volume</CardDescription></CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Product</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Sales</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {product_performance.length > 0 ? product_performance.map((p, i) => (
                                                <TableRow key={p.id}>
                                                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                                                    <TableCell className="font-medium">{p.name}</TableCell>
                                                    <TableCell><Badge variant="outline">{p.category?.name || '-'}</Badge></TableCell>
                                                    <TableCell className="text-right font-semibold">{fmtN(p.order_items_count)}</TableCell>
                                                </TableRow>
                                            )) : <TableRow><TableCell colSpan={4} className="text-center py-4 text-muted-foreground">No data</TableCell></TableRow>}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Category Performance</CardTitle></CardHeader>
                                <CardContent>
                                    {category_performance.length === 0 ? <div className="text-center py-8 text-muted-foreground">No data</div> : (
                                        <div className="space-y-3">
                                            {category_performance.map(c => (
                                                <div key={c.id} className="flex items-center gap-3">
                                                    <span className="text-sm font-medium w-32 truncate">{c.name}</span>
                                                    <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.max((c.total_sales / maxCat) * 100, 3)}%` }} />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground w-20 text-right">{fmtN(c.total_sales)} sales</span>
                                                    <span className="text-xs text-muted-foreground w-16 text-right">{fmtN(c.products_count)} prod</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* ─── PAYMENTS TAB ─── */}
                    <TabsContent value="payments" className="space-y-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                    <DollarSign className="h-4 w-4 text-emerald-500" />
                                </CardHeader>
                                <CardContent><div className="text-2xl font-bold text-emerald-600">{fmt(payment_stats.total_revenue)}</div></CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Commission</CardTitle>
                                    <Percent className="h-4 w-4 text-blue-500" />
                                </CardHeader>
                                <CardContent><div className="text-2xl font-bold text-blue-600">{fmt(payment_stats.total_commission)}</div></CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
                                    <Wallet className="h-4 w-4 text-orange-500" />
                                </CardHeader>
                                <CardContent><div className="text-2xl font-bold text-orange-600">{fmt(payment_stats.pending_payouts)}</div></CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Paid Out</CardTitle>
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                </CardHeader>
                                <CardContent><div className="text-2xl font-bold text-green-600">{fmt(payment_stats.completed_payouts)}</div></CardContent>
                            </Card>
                        </div>

                        {/* Payment Success/Failure */}
                        <div className="grid lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader><CardTitle>Payment Outcomes</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-green-100 text-green-800 rounded-lg p-4 text-center">
                                            <div className="text-3xl font-bold">{fmtN(payment_stats.successful)}</div>
                                            <div className="text-xs font-medium mt-1">Successful</div>
                                        </div>
                                        <div className="bg-red-100 text-red-800 rounded-lg p-4 text-center">
                                            <div className="text-3xl font-bold">{fmtN(payment_stats.failed)}</div>
                                            <div className="text-xs font-medium mt-1">Failed</div>
                                        </div>
                                        <div className="bg-blue-100 text-blue-800 rounded-lg p-4 text-center">
                                            <div className="text-3xl font-bold">{payment_stats.success_rate}%</div>
                                            <div className="text-xs font-medium mt-1">Success Rate</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Payment Methods</CardTitle></CardHeader>
                                <CardContent>
                                    {payment_methods.length === 0 ? <div className="text-center py-8 text-muted-foreground">No data</div> : (
                                        <div className="space-y-3">
                                            {payment_methods.map(pm => (
                                                <div key={pm.payment_method} className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium capitalize">{pm.payment_method?.replace('_', ' ') || 'Unknown'}</p>
                                                        <p className="text-xs text-muted-foreground">{fmtN(pm.count)} transactions</p>
                                                    </div>
                                                    <span className="font-semibold">{fmt(pm.total_amount)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* ─── SUBSCRIPTIONS TAB ─── */}
                    <TabsContent value="subscriptions" className="space-y-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card><CardContent className="pt-4"><div className="flex items-center gap-2 mb-1"><CreditCard className="h-4 w-4 text-blue-500" /><span className="text-xs text-muted-foreground">Active Plans</span></div><div className="text-2xl font-bold">{subscription_stats.active_plans} <span className="text-sm text-muted-foreground">/ {subscription_stats.total_plans}</span></div></CardContent></Card>
                            <Card><CardContent className="pt-4"><div className="flex items-center gap-2 mb-1"><Users className="h-4 w-4 text-purple-500" /><span className="text-xs text-muted-foreground">Active Subscriptions</span></div><div className="text-2xl font-bold text-purple-600">{fmtN(subscription_stats.active_subscriptions)}</div><p className="text-xs text-muted-foreground">{fmtN(subscription_stats.total_subscriptions)} total</p></CardContent></Card>
                            <Card><CardContent className="pt-4"><div className="flex items-center gap-2 mb-1"><DollarSign className="h-4 w-4 text-emerald-500" /><span className="text-xs text-muted-foreground">Subscription Revenue</span></div><div className="text-2xl font-bold text-emerald-600">{fmt(subscription_stats.subscription_revenue)}</div></CardContent></Card>
                            <Card><CardContent className="pt-4"><div className="flex items-center gap-2 mb-1"><ArrowUpRight className="h-4 w-4 text-teal-500" /><span className="text-xs text-muted-foreground">New This Month</span></div><div className="text-2xl font-bold text-teal-600">{fmtN(subscription_stats.new_this_month)}</div></CardContent></Card>
                        </div>

                        {/* Plan Distribution */}
                        <Card>
                            <CardHeader><CardTitle>Plan Distribution</CardTitle><CardDescription>Subscribers across plans</CardDescription></CardHeader>
                            <CardContent>
                                {plan_distribution.length === 0 ? <div className="text-center py-8 text-muted-foreground">No plans</div> : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Plan</TableHead>
                                                <TableHead>Price</TableHead>
                                                <TableHead>Cycle</TableHead>
                                                <TableHead className="text-right">Total Subs</TableHead>
                                                <TableHead className="text-right">Active</TableHead>
                                                <TableHead>Distribution</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {plan_distribution.map(plan => {
                                                const totalSubs = plan_distribution.reduce((s, p) => s + p.subscriptions_count, 0) || 1;
                                                const pct = Math.round((plan.subscriptions_count / totalSubs) * 100);
                                                return (
                                                    <TableRow key={plan.id}>
                                                        <TableCell className="font-medium">{plan.name}</TableCell>
                                                        <TableCell>{plan.price > 0 ? fmt(plan.price) : <Badge variant="secondary">Free</Badge>}</TableCell>
                                                        <TableCell className="capitalize">{plan.billing_cycle}</TableCell>
                                                        <TableCell className="text-right">{fmtN(plan.subscriptions_count)}</TableCell>
                                                        <TableCell className="text-right font-semibold text-green-600">{fmtN(plan.active_subscriptions_count)}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                                                                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.max(pct, 3)}%` }} />
                                                                </div>
                                                                <span className="text-xs text-muted-foreground w-8">{pct}%</span>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
