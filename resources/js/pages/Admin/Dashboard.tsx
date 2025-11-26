import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Users, ShoppingCart, BarChart3, Store, Package, DollarSign,
    TrendingUp, Bell, CreditCard, Database, Award, Boxes,
    Clock, AlertTriangle, ArrowUpRight,
} from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';

interface Props {
    user_stats: { total: number; new_today: number; new_this_week: number; new_this_month: number };
    marketplace_stats: {
        vendors: { total: number; approved: number; pending: number };
        products: { total: number; active: number; pending: number };
        orders: { total: number; pending: number; completed: number };
        categories: number;
    };
    revenue_stats: { today: number; this_week: number; this_month: number; this_year: number; total_commission: number; pending_payouts: number };
    subscription_stats: { active_subscriptions: number; total_plans: number; subscription_revenue: number };
    feed_stats: { feed_types: number; feed_programs: number; suppliers: number };
    iot_stats: { unread_alerts: number; total_alerts: number };
    module_stats: { total_modules: number; active_assignments: number };
    role_stats: { id: number; name: string; slug: string; users_count: number }[];
    recent_orders: { id: number; order_number?: string; total_amount: number; status: string; created_at: string; user?: { name: string }; vendor?: { business_name: string } }[];
    recent_users: { id: number; name: string; email: string; created_at: string }[];
    pending_vendors: { id: number; business_name: string; created_at: string; user?: { name: string; email: string } }[];
    monthly_revenue: { month: string; orders: number; revenue: number }[];
    monthly_users: { month: string; count: number }[];
}

export default function Dashboard({
    user_stats, marketplace_stats, revenue_stats, subscription_stats,
    feed_stats, iot_stats, module_stats, role_stats,
    recent_orders, recent_users, pending_vendors,
    monthly_revenue, monthly_users,
}: Props) {
    const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(n || 0);
    const fmtN = (n: number) => new Intl.NumberFormat('en-US').format(n || 0);
    const maxRev = Math.max(...(monthly_revenue.map(m => m.revenue) || [0]), 1);

    const statusColor = (s: string) => {
        const map: Record<string, string> = { completed: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-800', processing: 'bg-blue-100 text-blue-800', shipped: 'bg-indigo-100 text-indigo-800', cancelled: 'bg-red-100 text-red-800', delivered: 'bg-teal-100 text-teal-800' };
        return map[s] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Welcome to Agriinnox Admin Panel. Overview of your entire system.</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{fmtN(user_stats.total)}</div>
                            <p className="text-xs text-muted-foreground">+{fmtN(user_stats.new_this_month)} this month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{fmt(revenue_stats.this_year)}</div>
                            <p className="text-xs text-muted-foreground">{fmt(revenue_stats.this_month)} this month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{fmtN(marketplace_stats.orders.total)}</div>
                            <p className="text-xs text-muted-foreground">{fmtN(marketplace_stats.orders.pending)} pending</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
                            <Store className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{fmtN(marketplace_stats.vendors.approved)}</div>
                            <p className="text-xs text-muted-foreground">{fmtN(marketplace_stats.vendors.pending)} pending approval</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Revenue + Financial Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 mb-1"><DollarSign className="h-4 w-4 text-emerald-500" /><span className="text-xs text-muted-foreground">Today</span></div>
                            <div className="text-xl font-bold">{fmt(revenue_stats.today)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-blue-500" /><span className="text-xs text-muted-foreground">This Week</span></div>
                            <div className="text-xl font-bold">{fmt(revenue_stats.this_week)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 mb-1"><Award className="h-4 w-4 text-purple-500" /><span className="text-xs text-muted-foreground">Commission Earned</span></div>
                            <div className="text-xl font-bold text-purple-600">{fmt(revenue_stats.total_commission)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 mb-1"><Clock className="h-4 w-4 text-orange-500" /><span className="text-xs text-muted-foreground">Pending Payouts</span></div>
                            <div className="text-xl font-bold text-orange-600">{fmt(revenue_stats.pending_payouts)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Marketplace + System Overview */}
                <div className="grid lg:grid-cols-3 gap-4">
                    {/* Marketplace Summary */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Marketplace</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <Link href="/admin/marketplace/products" className="flex items-center justify-between hover:bg-muted p-2 rounded-md -mx-2">
                                <div className="flex items-center gap-2"><Package className="h-4 w-4 text-green-500" /><span className="text-sm">Products</span></div>
                                <div className="text-right">
                                    <span className="text-sm font-semibold">{fmtN(marketplace_stats.products.total)}</span>
                                    {marketplace_stats.products.pending > 0 && <Badge variant="secondary" className="ml-2 text-xs">{marketplace_stats.products.pending} pending</Badge>}
                                </div>
                            </Link>
                            <Link href="/admin/marketplace/vendors" className="flex items-center justify-between hover:bg-muted p-2 rounded-md -mx-2">
                                <div className="flex items-center gap-2"><Store className="h-4 w-4 text-blue-500" /><span className="text-sm">Vendors</span></div>
                                <div className="text-right">
                                    <span className="text-sm font-semibold">{fmtN(marketplace_stats.vendors.total)}</span>
                                    {marketplace_stats.vendors.pending > 0 && <Badge variant="destructive" className="ml-2 text-xs">{marketplace_stats.vendors.pending} pending</Badge>}
                                </div>
                            </Link>
                            <Link href="/admin/marketplace/orders" className="flex items-center justify-between hover:bg-muted p-2 rounded-md -mx-2">
                                <div className="flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-purple-500" /><span className="text-sm">Orders</span></div>
                                <span className="text-sm font-semibold">{fmtN(marketplace_stats.orders.total)}</span>
                            </Link>
                            <Link href="/admin/marketplace/categories" className="flex items-center justify-between hover:bg-muted p-2 rounded-md -mx-2">
                                <div className="flex items-center gap-2"><Boxes className="h-4 w-4 text-teal-500" /><span className="text-sm">Categories</span></div>
                                <span className="text-sm font-semibold">{fmtN(marketplace_stats.categories)}</span>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* System Stats */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">System</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <Link href="/admin/marketplace/subscriptions" className="flex items-center justify-between hover:bg-muted p-2 rounded-md -mx-2">
                                <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-purple-500" /><span className="text-sm">Active Subscriptions</span></div>
                                <span className="text-sm font-semibold">{fmtN(subscription_stats.active_subscriptions)}</span>
                            </Link>
                            <Link href="/admin/modules" className="flex items-center justify-between hover:bg-muted p-2 rounded-md -mx-2">
                                <div className="flex items-center gap-2"><Boxes className="h-4 w-4 text-indigo-500" /><span className="text-sm">Modules</span></div>
                                <span className="text-sm font-semibold">{fmtN(module_stats.total_modules)}</span>
                            </Link>
                            <Link href="/admin/feed-templates" className="flex items-center justify-between hover:bg-muted p-2 rounded-md -mx-2">
                                <div className="flex items-center gap-2"><Database className="h-4 w-4 text-orange-500" /><span className="text-sm">Feed Templates</span></div>
                                <span className="text-sm font-semibold">{fmtN(feed_stats.feed_types + feed_stats.feed_programs)}</span>
                            </Link>
                            {iot_stats.unread_alerts > 0 && (
                                <div className="flex items-center justify-between p-2 rounded-md bg-red-50 -mx-2">
                                    <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500" /><span className="text-sm text-red-700">Unread IoT Alerts</span></div>
                                    <Badge variant="destructive">{fmtN(iot_stats.unread_alerts)}</Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Roles Distribution */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Users by Role</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            {role_stats.map(r => {
                                const total = role_stats.reduce((s, x) => s + x.users_count, 0) || 1;
                                const pct = Math.round((r.users_count / total) * 100);
                                return (
                                    <div key={r.id}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="capitalize">{r.name}</span>
                                            <span className="text-muted-foreground">{fmtN(r.users_count)}</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div className="h-full bg-primary rounded-full" style={{ width: `${Math.max(pct, 2)}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>

                {/* Monthly Revenue Chart */}
                <Card>
                    <CardHeader><CardTitle>Revenue Trend (6 months)</CardTitle></CardHeader>
                    <CardContent>
                        {monthly_revenue.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">No revenue data yet</div>
                        ) : (
                            <div className="space-y-2">
                                {monthly_revenue.map(m => (
                                    <div key={m.month} className="flex items-center gap-3">
                                        <span className="text-xs text-muted-foreground w-20 shrink-0">{m.month}</span>
                                        <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full flex items-center justify-end pr-2"
                                                style={{ width: `${Math.max((m.revenue / maxRev) * 100, 3)}%` }}>
                                                {m.revenue > maxRev * 0.15 && <span className="text-[10px] text-white font-medium">{fmt(m.revenue)}</span>}
                                            </div>
                                        </div>
                                        {m.revenue <= maxRev * 0.15 && <span className="text-xs text-muted-foreground">{fmt(m.revenue)}</span>}
                                        <span className="text-xs text-muted-foreground w-16 text-right">{fmtN(m.orders)} orders</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Tables Row */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Recent Orders */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base">Recent Orders</CardTitle>
                                <CardDescription>Latest 5 orders</CardDescription>
                            </div>
                            <Link href="/admin/marketplace/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
                                View All <ArrowUpRight className="h-3 w-3" />
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {recent_orders.length > 0 ? recent_orders.map(o => (
                                        <TableRow key={o.id}>
                                            <TableCell className="font-medium text-xs">#{o.order_number || o.id}</TableCell>
                                            <TableCell className="text-xs">{o.user?.name || '-'}</TableCell>
                                            <TableCell><Badge className={`text-xs ${statusColor(o.status)}`}>{o.status}</Badge></TableCell>
                                            <TableCell className="text-right text-xs font-medium">{fmt(o.total_amount)}</TableCell>
                                        </TableRow>
                                    )) : <TableRow><TableCell colSpan={4} className="text-center py-4 text-muted-foreground">No orders yet</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Recent Users + Pending Vendors */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">New Users</CardTitle>
                                    <CardDescription>Recently registered</CardDescription>
                                </div>
                                <Link href="/admin/users" className="text-sm text-primary hover:underline flex items-center gap-1">
                                    View All <ArrowUpRight className="h-3 w-3" />
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {recent_users.map(u => (
                                        <div key={u.id} className="flex items-center justify-between text-sm">
                                            <div>
                                                <p className="font-medium">{u.name}</p>
                                                <p className="text-xs text-muted-foreground">{u.email}</p>
                                            </div>
                                            <span className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {pending_vendors.length > 0 && (
                            <Card className="border-orange-200">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base text-orange-700">Pending Vendors</CardTitle>
                                        <CardDescription>Awaiting approval</CardDescription>
                                    </div>
                                    <Link href="/admin/marketplace/vendors" className="text-sm text-primary hover:underline flex items-center gap-1">
                                        Review <ArrowUpRight className="h-3 w-3" />
                                    </Link>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {pending_vendors.map(v => (
                                            <div key={v.id} className="flex items-center justify-between text-sm">
                                                <div>
                                                    <p className="font-medium">{v.business_name}</p>
                                                    <p className="text-xs text-muted-foreground">{v.user?.name}</p>
                                                </div>
                                                <Badge variant="outline" className="text-orange-700 border-orange-300">Pending</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
