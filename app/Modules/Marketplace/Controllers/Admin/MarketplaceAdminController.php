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
            'approved_vendors' => Vendor::where('verification_status', 'verified')->count(),
            'pending_vendors' => Vendor::where('verification_status', 'pending')->count(),
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
            ->selectRaw("strftime('%Y', created_at) as year, strftime('%m', created_at) as month, SUM(total_amount) as total")
            ->groupByRaw("strftime('%Y', created_at), strftime('%m', created_at)")
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
                'approved' => Vendor::where('verification_status', 'verified')->count(),
                'pending' => Vendor::where('verification_status', 'pending')->count(),
                'rejected' => Vendor::where('verification_status', 'rejected')->count(),
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
                ->whereRaw("strftime('%m', created_at) = ?", [now()->format('m')])
                ->whereRaw("strftime('%Y', created_at) = ?", [now()->format('Y')])
                ->sum('total_amount'),
            'this_year' => Order::where('status', 'completed')
                ->whereRaw("strftime('%Y', created_at) = ?", [now()->format('Y')])
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

        $start_date = match($period) {
            'day' => now()->startOfDay(),
            'week' => now()->startOfWeek(),
            'month' => now()->startOfMonth(),
            'year' => now()->startOfYear(),
            default => now()->startOfMonth(),
        };

        // Sales analytics
        $sales_data = Order::where('status', 'completed')
            ->where('created_at', '>=', $start_date)
            ->selectRaw("date(created_at) as date, COUNT(*) as orders, SUM(total_amount) as revenue")
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Product performance
        $product_performance = Product::withCount(['orderItems'])
            ->with('category')
            ->orderBy('order_items_count', 'desc')
            ->take(10)
            ->get();

        // Vendor performance
        $vendor_performance = Vendor::withCount(['orders', 'products'])
            ->withSum('orders', 'total_amount')
            ->orderBy('orders_sum_total_amount', 'desc')
            ->take(10)
            ->get();

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
                ->whereRaw("strftime('%m', created_at) = ?", [now()->format('m')])
                ->whereRaw("strftime('%Y', created_at) = ?", [now()->format('Y')])
                ->sum('total_amount'),
            'this_year' => Order::where('status', 'completed')
                ->whereRaw("strftime('%Y', created_at) = ?", [now()->format('Y')])
                ->sum('total_amount'),
        ];

        return Inertia::render('Admin/Marketplace/Analytics', [
            'period' => $period,
            'sales_data' => $sales_data,
            'product_performance' => $product_performance,
            'vendor_performance' => $vendor_performance,
            'category_performance' => $category_performance,
            'revenue_stats' => $revenue_stats,
        ]);
    }
}
