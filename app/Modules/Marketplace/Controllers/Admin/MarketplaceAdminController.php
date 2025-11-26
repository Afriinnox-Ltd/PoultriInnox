<?php

namespace App\Modules\Marketplace\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Marketplace\Models\Category;
use App\Modules\Marketplace\Models\Product;
use App\Modules\Marketplace\Models\Vendor;
use App\Modules\Marketplace\Models\Order;
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
        $period = $request->get('period', 'month'); // day, week, month, year
        $start_date = $request->get('start_date');
        $end_date = $request->get('end_date');

        // If custom date range provided, use it
        if ($start_date && $end_date) {
            $start = \Carbon\Carbon::parse($start_date)->startOfDay();
            $end = \Carbon\Carbon::parse($end_date)->endOfDay();
        } else {
            // Use period-based dates
            $start = match($period) {
                'day' => now()->startOfDay(),
                'week' => now()->startOfWeek(),
                'month' => now()->startOfMonth(),
                'year' => now()->startOfYear(),
                default => now()->startOfMonth(),
            };
            $end = now()->endOfDay();
        }

        // Sales analytics - include all order statuses that count as sales
        $sales_data = Order::whereIn('status', ['completed', 'delivered', 'shipped', 'processing'])
            ->whereBetween('created_at', [$start, $end])
            ->selectRaw("date(created_at) as date, COUNT(*) as orders, SUM(total_amount) as revenue")
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Product performance - with date range
        $product_performance = Product::withCount(['orderItems' => function($query) use ($start, $end) {
                $query->whereHas('order', function($q) use ($start, $end) {
                    $q->whereBetween('created_at', [$start, $end]);
                });
            }])
            ->with('category')
            ->get()
            ->filter(function($product) {
                return $product->order_items_count > 0;
            })
            ->sortByDesc('order_items_count')
            ->take(10)
            ->values();

        // Vendor performance - with date range
        $vendor_performance = Vendor::withCount(['orders' => function($query) use ($start, $end) {
                $query->whereBetween('created_at', [$start, $end]);
            }])
            ->with(['orders' => function($query) use ($start, $end) {
                $query->whereBetween('created_at', [$start, $end]);
            }])
            ->withCount('products')
            ->get()
            ->map(function($vendor) {
                $vendor->orders_sum_total_amount = $vendor->orders->sum('total_amount');
                return $vendor;
            })
            ->sortByDesc('orders_sum_total_amount')
            ->take(10)
            ->values();

        // Category performance
        $category_performance = Category::withCount('products')
            ->with(['products' => function($query) {
                $query->withCount('orderItems');
            }])
            ->get()
            ->map(function($category) {
                $total_sales = $category->products->sum('order_items_count');
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'products_count' => $category->products_count,
                    'total_sales' => $total_sales,
                ];
            })
            ->sortByDesc('total_sales')
            ->take(10)
            ->values();

        // Revenue statistics for overview
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

        return Inertia::render('Admin/Marketplace/Analytics', [
            'period' => $period,
            'start_date' => $start_date ?? $start->format('Y-m-d'),
            'end_date' => $end_date ?? $end->format('Y-m-d'),
            'sales_data' => $sales_data,
            'product_performance' => $product_performance,
            'vendor_performance' => $vendor_performance,
            'category_performance' => $category_performance,
            'revenue_stats' => $revenue_stats,
        ]);
    }
}
