<?php

namespace App\Modules\Marketplace\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Marketplace\Models\Category;
use App\Modules\Marketplace\Models\Product;
use App\Modules\Marketplace\Models\Vendor;
use App\Modules\Marketplace\Models\Order;
use App\Modules\Marketplace\Models\Payment;
use App\Modules\Marketplace\Models\Subscription;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class MarketplaceAdminController extends Controller
{
    /**
     * Display the marketplace admin dashboard.
     */
    public function index()
    {
        $stats = [
            'total_products' => Product::count(),
            'active_products' => Product::where('status', 'active')->count(),
            'pending_products' => Product::where('status', 'pending')->count(),
            'total_vendors' => Vendor::count(),
            'approved_vendors' => Vendor::where('status', 'approved')->count(),
            'pending_vendors' => Vendor::where('status', 'pending')->count(),
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'completed_orders' => Order::where('status', 'completed')->count(),
            'total_categories' => Category::count(),
            'active_categories' => Category::where('is_active', true)->count(),
        ];

        // Recent activity
        $recent_products = Product::with('vendor', 'category')
            ->latest()
            ->take(5)
            ->get();

        $recent_vendors = Vendor::latest()
            ->take(5)
            ->get();

        $recent_orders = Order::with('user', 'vendor')
            ->latest()
            ->take(5)
            ->get();

        // Sales analytics - SQLite compatible
        $monthly_sales = Order::where('status', 'completed')
            ->where('created_at', '>=', now()->subMonths(12))
            ->selectRaw("DATE_FORMAT(created_at, '%Y') as year, DATE_FORMAT(created_at, '%m') as month, SUM(total_amount) as total")
            ->groupByRaw("DATE_FORMAT(created_at, '%Y'), DATE_FORMAT(created_at, '%m')")
            ->orderByRaw("year, month")
            ->get();

        // Top categories by product count
        $top_categories = Category::withCount('products')
            ->orderBy('products_count', 'desc')
            ->take(10)
            ->get();

        return Inertia::render('Admin/Marketplace/Index', [
            'stats' => $stats,
            'recent_products' => $recent_products,
            'recent_vendors' => $recent_vendors,
            'recent_orders' => $recent_orders,
            'monthly_sales' => $monthly_sales,
            'top_categories' => $top_categories,
        ]);
    }

    /**
     * Get marketplace statistics for API calls.
     */
    public function getStatistics()
    {
        $stats = [
            'products' => [
                'total' => Product::count(),
                'active' => Product::where('status', 'active')->count(),
                'pending' => Product::where('status', 'pending')->count(),
                'inactive' => Product::where('status', 'inactive')->count(),
                'out_of_stock' => Product::where('stock_quantity', 0)->count(),
            ],
            'vendors' => [
                'total' => Vendor::count(),
                'approved' => Vendor::where('status', 'approved')->count(),
                'pending' => Vendor::where('status', 'pending')->count(),
                'rejected' => Vendor::where('status', 'rejected')->count(),
                'suspended' => Vendor::where('is_active', false)->count(),
            ],
            'orders' => [
                'total' => Order::count(),
                'pending' => Order::where('status', 'pending')->count(),
                'processing' => Order::where('status', 'processing')->count(),
                'shipped' => Order::where('status', 'shipped')->count(),
                'delivered' => Order::where('status', 'delivered')->count(),
                'cancelled' => Order::where('status', 'cancelled')->count(),
                'refunded' => Order::where('status', 'refunded')->count(),
            ],
            'categories' => [
                'total' => Category::count(),
                'active' => Category::where('is_active', true)->count(),
                'inactive' => Category::where('is_active', false)->count(),
            ],
        ];

        // Revenue statistics
        $revenue_stats = [
            'today' => Order::where('status', 'completed')
                ->whereDate('created_at', today())
                ->sum('total_amount'),
            'this_week' => Order::where('status', 'completed')
                ->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
                ->sum('total_amount'),
            'this_month' => Order::where('status', 'completed')
                ->whereRaw("DATE_FORMAT(created_at, '%m') = ?", [now()->format('m')])
                ->whereRaw("DATE_FORMAT(created_at, '%Y') = ?", [now()->format('Y')])
                ->sum('total_amount'),
            'this_year' => Order::where('status', 'completed')
                ->whereRaw("DATE_FORMAT(created_at, '%Y') = ?", [now()->format('Y')])
                ->sum('total_amount'),
        ];

        return response()->json([
            'stats' => $stats,
            'revenue' => $revenue_stats,
        ]);
    }

    /**
     * Display marketplace analytics page.
     */
    public function getAnalytics(Request $request)
    {
        $request->validate([
            'period' => 'nullable|in:day,week,month,year,custom',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $period = $request->get('period', 'month');
        $start_date = $request->get('start_date');
        $end_date = $request->get('end_date');

        if ($start_date && $end_date) {
            $start = \Carbon\Carbon::parse($start_date)->startOfDay();
            $end = \Carbon\Carbon::parse($end_date)->endOfDay();
        } else {
            $start = match($period) {
                'day' => now()->startOfDay(),
                'week' => now()->startOfWeek(),
                'month' => now()->startOfMonth(),
                'year' => now()->startOfYear(),
                default => now()->startOfMonth(),
            };
            $end = now()->endOfDay();
        }

        // ── Revenue Stats ──
        $revenue_stats = [
            'today' => Order::where('status', 'completed')->whereDate('created_at', today())->sum('total_amount'),
            'this_week' => Order::where('status', 'completed')->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->sum('total_amount'),
            'this_month' => Order::where('status', 'completed')->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->sum('total_amount'),
            'this_year' => Order::where('status', 'completed')->whereYear('created_at', now()->year)->sum('total_amount'),
        ];

        // ── Daily Sales (period) ──
        $sales_data = Order::whereIn('status', ['completed', 'delivered', 'shipped', 'processing'])
            ->whereBetween('created_at', [$start, $end])
            ->selectRaw("date(created_at) as date, COUNT(*) as orders, SUM(total_amount) as revenue")
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // ── Order Stats ──
        $order_stats = [
            'total' => Order::count(),
            'period_total' => Order::whereBetween('created_at', [$start, $end])->count(),
            'pending' => Order::where('status', 'pending')->count(),
            'processing' => Order::where('status', 'processing')->count(),
            'shipped' => Order::where('status', 'shipped')->count(),
            'delivered' => Order::where('status', 'delivered')->count(),
            'completed' => Order::where('status', 'completed')->count(),
            'cancelled' => Order::where('status', 'cancelled')->count(),
            'refunded' => Order::where('status', 'refunded')->count(),
        ];

        // ── Vendor Stats ──
        $vendor_stats = [
            'total' => Vendor::count(),
            'approved' => Vendor::where('status', 'approved')->count(),
            'pending' => Vendor::where('status', 'pending')->count(),
            'rejected' => Vendor::where('status', 'rejected')->count(),
            'suspended' => Vendor::where('status', 'suspended')->count(),
            'verified' => Vendor::where('is_verified', true)->count(),
            'new_this_month' => Vendor::whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count(),
        ];

        // ── Product Stats ──
        $product_stats = [
            'total' => Product::count(),
            'active' => Product::where('status', 'active')->count(),
            'pending' => Product::where('status', 'pending')->count(),
            'inactive' => Product::where('status', 'inactive')->count(),
            'out_of_stock' => Product::where('stock_quantity', 0)->count(),
            'new_this_month' => Product::whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count(),
        ];

        // ── Payment Stats (filtered by period) ──
        $periodPayments = Payment::where('type', 'payment')->whereBetween('created_at', [$start, $end]);
        $periodPaymentsCompleted = (clone $periodPayments)->where('status', 'completed');
        $totalPeriodPayments = (clone $periodPayments)->count();
        $successfulPeriodPayments = (clone $periodPaymentsCompleted)->count();
        $payment_stats = [
            'total_revenue' => (clone $periodPaymentsCompleted)->sum('net_amount'),
            'total_commission' => (clone $periodPaymentsCompleted)->sum('commission_amount'),
            'pending_payouts' => Payment::where('status', 'completed')->where('type', 'payment')->where('vendor_paid', false)->sum('vendor_amount'),
            'completed_payouts' => Payment::where('status', 'completed')->where('type', 'payment')->where('vendor_paid', true)->sum('vendor_amount'),
            'total_payments' => $totalPeriodPayments,
            'successful' => $successfulPeriodPayments,
            'failed' => (clone $periodPayments)->where('status', 'failed')->count(),
            'success_rate' => $totalPeriodPayments > 0
                ? round(($successfulPeriodPayments / $totalPeriodPayments) * 100, 1)
                : 0,
        ];

        // ── Subscription Stats ──
        $subscription_stats = [
            'total_plans' => SubscriptionPlan::count(),
            'active_plans' => SubscriptionPlan::where('is_active', true)->count(),
            'total_subscriptions' => Subscription::count(),
            'active_subscriptions' => Subscription::where('is_active', true)->count(),
            'subscription_revenue' => Payment::where('status', 'completed')->where('type', 'subscription')->sum('amount'),
            'new_this_month' => Subscription::whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count(),
        ];

        // ── Monthly Revenue Trend (12 months) ──
        $monthly_trend = Order::where('status', 'completed')
            ->where('created_at', '>=', now()->subMonths(12)->startOfMonth())
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as orders, SUM(total_amount) as revenue")
            ->groupByRaw("DATE_FORMAT(created_at, '%Y-%m')")
            ->orderBy('month')
            ->get();

        // ── Monthly New Vendors (12 months) ──
        $monthly_vendors = Vendor::where('created_at', '>=', now()->subMonths(12)->startOfMonth())
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count")
            ->groupByRaw("DATE_FORMAT(created_at, '%Y-%m')")
            ->orderBy('month')
            ->get();

        // ── Monthly New Orders (12 months) ──
        $monthly_orders = Order::where('created_at', '>=', now()->subMonths(12)->startOfMonth())
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count, SUM(total_amount) as revenue")
            ->groupByRaw("DATE_FORMAT(created_at, '%Y-%m')")
            ->orderBy('month')
            ->get();

        // ── Top Products (period) ──
        $product_performance = Product::withCount(['orderItems' => function($query) use ($start, $end) {
                $query->whereHas('order', function($q) use ($start, $end) {
                    $q->whereBetween('created_at', [$start, $end]);
                });
            }])
            ->with('category')
            ->having('order_items_count', '>', 0)
            ->orderByDesc('order_items_count')
            ->take(10)
            ->get();

        // ── Top Vendors (period) ──
        $vendor_performance = Vendor::withCount(['orders' => function($query) use ($start, $end) {
                $query->whereBetween('created_at', [$start, $end]);
            }])
            ->withSum(['orders' => function($query) use ($start, $end) {
                $query->whereBetween('created_at', [$start, $end]);
            }], 'total_amount')
            ->withCount('products')
            ->having('orders_count', '>', 0)
            ->orderByDesc('orders_sum_total_amount')
            ->take(10)
            ->get();

        // ── Category Performance (period) ──
        $category_performance = Category::withCount('products')
            ->with(['products' => function($query) use ($start, $end) {
                $query->withCount(['orderItems' => function($q) use ($start, $end) {
                    $q->whereHas('order', function($oq) use ($start, $end) {
                        $oq->whereBetween('created_at', [$start, $end]);
                    });
                }]);
            }])
            ->get()
            ->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'products_count' => $c->products_count,
                'total_sales' => $c->products->sum('order_items_count'),
            ])
            ->sortByDesc('total_sales')
            ->take(10)
            ->values();

        // ── Payment Method Breakdown (period) ──
        $payment_methods = Payment::where('status', 'completed')
            ->whereBetween('created_at', [$start, $end])
            ->selectRaw("payment_method, COUNT(*) as count, SUM(amount) as total_amount")
            ->groupBy('payment_method')
            ->orderByDesc('total_amount')
            ->get();

        // ── Subscription Plan Distribution ──
        $plan_distribution = SubscriptionPlan::withCount(['subscriptions', 'subscriptions as active_subscriptions_count' => function($q) {
                $q->where('is_active', true);
            }])
            ->get(['id', 'name', 'price', 'billing_cycle']);

        return Inertia::render('Admin/Marketplace/Analytics', [
            'period' => $period,
            'start_date' => $start_date ?? $start->format('Y-m-d'),
            'end_date' => $end_date ?? $end->format('Y-m-d'),
            'sales_data' => $sales_data,
            'revenue_stats' => $revenue_stats,
            'order_stats' => $order_stats,
            'vendor_stats' => $vendor_stats,
            'product_stats' => $product_stats,
            'payment_stats' => $payment_stats,
            'subscription_stats' => $subscription_stats,
            'monthly_trend' => $monthly_trend,
            'monthly_vendors' => $monthly_vendors,
            'monthly_orders' => $monthly_orders,
            'product_performance' => $product_performance,
            'vendor_performance' => $vendor_performance,
            'category_performance' => $category_performance,
            'payment_methods' => $payment_methods,
            'plan_distribution' => $plan_distribution,
        ]);
    }
}
