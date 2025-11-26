<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Module;
use App\Models\UserModule;
use App\Models\IotAlert;
use App\Models\SubscriptionPlan;
use App\Models\Role;
use App\Modules\Marketplace\Models\Vendor;
use App\Modules\Marketplace\Models\Product;
use App\Modules\Marketplace\Models\Order;
use App\Modules\Marketplace\Models\Payment;
use App\Modules\Marketplace\Models\Category;
use App\Modules\Marketplace\Models\Subscription;
use App\Modules\BatchIncubator\Models\Batch;
use App\Modules\BatchIncubator\Models\Incubator;
use App\Modules\FeedManagement\Models\FeedType;
use App\Modules\FeedManagement\Models\FeedProgram;
use App\Modules\FeedManagement\Models\FeedSupplier;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index()
    {
        // ── User Stats ──
        $user_stats = [
            'total' => User::count(),
            'new_today' => User::whereDate('created_at', today())->count(),
            'new_this_week' => User::where('created_at', '>=', now()->startOfWeek())->count(),
            'new_this_month' => User::where('created_at', '>=', now()->startOfMonth())->count(),
        ];

        // ── Marketplace Stats ──
        $marketplace_stats = [
            'vendors' => [
                'total' => Vendor::count(),
                'approved' => Vendor::where('status', 'approved')->count(),
                'pending' => Vendor::where('status', 'pending')->count(),
            ],
            'products' => [
                'total' => Product::count(),
                'active' => Product::where('status', 'active')->count(),
                'pending' => Product::where('status', 'pending')->count(),
            ],
            'orders' => [
                'total' => Order::count(),
                'pending' => Order::where('status', 'pending')->count(),
                'completed' => Order::where('status', 'completed')->count(),
            ],
            'categories' => Category::count(),
        ];

        // ── Revenue Stats ──
        $revenue_stats = [
            'today' => Order::where('status', 'completed')->whereDate('created_at', today())->sum('total_amount'),
            'this_week' => Order::where('status', 'completed')->where('created_at', '>=', now()->startOfWeek())->sum('total_amount'),
            'this_month' => Order::where('status', 'completed')->where('created_at', '>=', now()->startOfMonth())->sum('total_amount'),
            'this_year' => Order::where('status', 'completed')->whereYear('created_at', now()->year)->sum('total_amount'),
            'total_commission' => Payment::where('status', 'completed')->where('type', 'payment')->sum('commission_amount'),
            'pending_payouts' => Payment::where('status', 'completed')->where('type', 'payment')->where('vendor_paid', false)->sum('vendor_amount'),
        ];

        // ── Subscription Stats ──
        $subscription_stats = [
            'active_subscriptions' => Subscription::where('is_active', true)->count(),
            'total_plans' => SubscriptionPlan::count(),
            'subscription_revenue' => Payment::where('status', 'completed')->where('type', 'subscription')->sum('amount'),
        ];

        // ── Feed Management Stats ──
        $feed_stats = [
            'feed_types' => FeedType::count(),
            'feed_programs' => FeedProgram::count(),
            'suppliers' => FeedSupplier::count(),
        ];

        // ── IoT Stats ──
        $iot_stats = [
            'unread_alerts' => IotAlert::where('resolved', false)->count(),
            'total_alerts' => IotAlert::count(),
        ];

        // ── Module Stats ──
        $module_stats = [
            'total_modules' => Module::count(),
            'active_assignments' => UserModule::where('is_enabled', true)->count(),
        ];

        // ── Roles Stats ──
        $role_stats = Role::all(['id', 'name', 'slug'])->map(function ($role) {
            $role->users_count = User::where('role', $role->slug)->count();
            return $role;
        });

        // ── Recent Orders ──
        $recent_orders = Order::with('user', 'vendor')
            ->latest()
            ->take(5)
            ->get();

        // ── Recent Users ──
        $recent_users = User::latest()->take(5)->get(['id', 'name', 'email', 'created_at']);

        // ── Pending Vendors ──
        $pending_vendors = Vendor::where('status', 'pending')
            ->with('user:id,name,email')
            ->latest()
            ->take(5)
            ->get();

        // ── Monthly Revenue Trend (6 months) ──
        $monthly_revenue = Order::where('status', 'completed')
            ->where('created_at', '>=', now()->subMonths(6)->startOfMonth())
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as orders, SUM(total_amount) as revenue")
            ->groupByRaw("DATE_FORMAT(created_at, '%Y-%m')")
            ->orderBy('month')
            ->get();

        // ── Monthly Users (6 months) ──
        $monthly_users = User::where('created_at', '>=', now()->subMonths(6)->startOfMonth())
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count")
            ->groupByRaw("DATE_FORMAT(created_at, '%Y-%m')")
            ->orderBy('month')
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'user_stats' => $user_stats,
            'marketplace_stats' => $marketplace_stats,
            'revenue_stats' => $revenue_stats,
            'subscription_stats' => $subscription_stats,
            'feed_stats' => $feed_stats,
            'iot_stats' => $iot_stats,
            'module_stats' => $module_stats,
            'role_stats' => $role_stats,
            'recent_orders' => $recent_orders,
            'recent_users' => $recent_users,
            'pending_vendors' => $pending_vendors,
            'monthly_revenue' => $monthly_revenue,
            'monthly_users' => $monthly_users,
        ]);
    }
}
