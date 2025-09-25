<?php

namespace App\Modules\Marketplace\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use App\Modules\Marketplace\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class SubscriptionPlanAdminController extends Controller
{
    /**
     * Display subscription management dashboard
     */
    public function dashboard()
    {
        $totalPlans = SubscriptionPlan::count();
        $activePlans = SubscriptionPlan::where('is_active', true)->count();
        $totalSubscriptions = Subscription::count();
        $activeSubscriptions = Subscription::where('is_active', true)->count();
        
        // Calculate monthly revenue (current month)
        $monthlyRevenue = Subscription::where('marketplace_subscriptions.is_active', true)
            ->whereMonth('marketplace_subscriptions.created_at', now()->month)
            ->whereYear('marketplace_subscriptions.created_at', now()->year)
            ->join('marketplace_subscription_plans', 'marketplace_subscriptions.plan_id', '=', 'marketplace_subscription_plans.id')
            ->sum('marketplace_subscription_plans.price');

        // Get recent subscriptions
        $recentSubscriptions = Subscription::with(['user', 'subscriptionPlan'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($subscription) {
                return [
                    'id' => $subscription->id,
                    'user_name' => $subscription->user->name ?? 'Unknown User',
                    'plan_name' => $subscription->subscriptionPlan->name ?? 'Unknown Plan',
                    'created_at' => $subscription->created_at->toISOString(),
                ];
            });

        $stats = [
            'totalPlans' => $totalPlans,
            'activePlans' => $activePlans,
            'totalSubscriptions' => $totalSubscriptions,
            'activeSubscriptions' => $activeSubscriptions,
            'monthlyRevenue' => $monthlyRevenue,
            'recentSubscriptions' => $recentSubscriptions,
        ];

        return Inertia::render('Admin/Marketplace/SubscriptionDashboard', [
            'stats' => $stats,
        ]);
    }

    /**
     * Display subscription plans management page
     */
    public function index()
    {
        $plans = SubscriptionPlan::withCount('subscriptions')->paginate(10);
        
        // Ensure features are always arrays
        $plans->getCollection()->transform(function ($plan) {
            if (!is_array($plan->features)) {
                $plan->features = [];
            }
            return $plan;
        });
        
        $stats = [
            'total_plans' => SubscriptionPlan::count(),
            'active_plans' => SubscriptionPlan::where('is_active', true)->count(),
            'total_subscriptions' => Subscription::count(),
            'active_subscriptions' => Subscription::where('is_active', true)->count(),
        ];

        return Inertia::render('Admin/Marketplace/SubscriptionPlans/Index', [
            'plans' => $plans,
            'stats' => $stats,
        ]);
    }

    /**
     * Show create subscription plan form
     */
    public function create()
    {
        return Inertia::render('Admin/Marketplace/SubscriptionPlans/Create');
    }

    /**
     * Store new subscription plan
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:marketplace_subscription_plans,name'],
            'description' => ['required', 'string', 'max:1000'],
            'price' => ['required', 'numeric', 'min:0'],
            'billing_cycle' => ['required', 'string', 'in:monthly,quarterly,yearly'],
            'duration_days' => ['nullable', 'integer', 'min:1'],
            'product_limit' => ['nullable', 'integer', 'min:0'],
            'order_limit' => ['nullable', 'integer', 'min:0'],
            'allow_cod' => ['boolean'],
            'featured_badge' => ['boolean'],
            'features' => ['required', 'array'],
            'features.*' => ['string', 'max:255'],
            'is_active' => ['boolean'],
        ]);

        // Set default duration based on billing cycle
        if (!isset($validated['duration_days']) || !$validated['duration_days']) {
            $validated['duration_days'] = match($validated['billing_cycle']) {
                'monthly' => 30,
                'quarterly' => 90,
                'yearly' => 365,
                default => 30,
            };
        }

        $plan = SubscriptionPlan::create($validated);

        return redirect()->route('admin.marketplace.subscription-plans.index')
            ->with('success', 'Subscription plan created successfully.');
    }

    /**
     * Show edit subscription plan form
     */
    public function edit(SubscriptionPlan $subscriptionPlan)
    {
        return Inertia::render('Admin/Marketplace/SubscriptionPlans/Edit', [
            'plan' => $subscriptionPlan,
        ]);
    }

    /**
     * Update subscription plan
     */
    public function update(Request $request, SubscriptionPlan $subscriptionPlan)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('marketplace_subscription_plans', 'name')->ignore($subscriptionPlan->id)],
            'description' => ['required', 'string', 'max:1000'],
            'price' => ['required', 'numeric', 'min:0'],
            'billing_cycle' => ['required', 'string', 'in:monthly,quarterly,yearly'],
            'duration_days' => ['nullable', 'integer', 'min:1'],
            'product_limit' => ['nullable', 'integer', 'min:0'],
            'order_limit' => ['nullable', 'integer', 'min:0'],
            'allow_cod' => ['boolean'],
            'featured_badge' => ['boolean'],
            'features' => ['required', 'array'],
            'features.*' => ['string', 'max:255'],
            'is_active' => ['boolean'],
        ]);

        // Set default duration based on billing cycle if not provided
        if (!isset($validated['duration_days']) || !$validated['duration_days']) {
            $validated['duration_days'] = match($validated['billing_cycle']) {
                'monthly' => 30,
                'quarterly' => 90,
                'yearly' => 365,
                default => 30,
            };
        }

        $subscriptionPlan->update($validated);

        return redirect()->route('admin.marketplace.subscription-plans.index')
            ->with('success', 'Subscription plan updated successfully.');
    }

    /**
     * Delete subscription plan
     */
    public function destroy(SubscriptionPlan $subscriptionPlan)
    {
        // Check if plan has active subscriptions
        $activeSubscriptions = $subscriptionPlan->subscriptions()->where('is_active', true)->count();
        
        if ($activeSubscriptions > 0) {
            return back()->with('error', 'Cannot delete plan with active subscriptions. Please migrate users first.');
        }

        $subscriptionPlan->delete();

        return redirect()->route('admin.marketplace.subscription-plans.index')
            ->with('success', 'Subscription plan deleted successfully.');
    }

    /**
     * Toggle plan active status
     */
    public function toggleStatus(SubscriptionPlan $subscriptionPlan)
    {
        $subscriptionPlan->update([
            'is_active' => !$subscriptionPlan->is_active
        ]);

        $status = $subscriptionPlan->is_active ? 'activated' : 'deactivated';
        
        return back()->with('success', "Subscription plan {$status} successfully.");
    }

    /**
     * Show user subscriptions management
     */
    public function userSubscriptions(Request $request)
    {
        $query = Subscription::with(['vendor.user', 'subscriptionPlan']);

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('vendor.user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('plan')) {
            $query->where('plan_id', $request->input('plan'));
        }

        if ($request->filled('status')) {
            $status = $request->input('status');
            switch ($status) {
                case 'active':
                    $query->where('is_active', true)
                          ->where(function($q) {
                              $q->whereNull('end_date')
                                ->orWhere('end_date', '>', now());
                          });
                    break;
                case 'inactive':
                    $query->where('is_active', false);
                    break;
                case 'expired':
                    $query->where('end_date', '<', now());
                    break;
                case 'pending':
                    $query->where('payment_status', 'pending');
                    break;
            }
        }

        $subscriptions = $query->orderBy('created_at', 'desc')->paginate(15);

        // Transform data for frontend
        $subscriptions->getCollection()->transform(function ($subscription) {
            return [
                'id' => $subscription->id,
                'user' => [
                    'id' => $subscription->vendor->user->id ?? null,
                    'name' => $subscription->vendor->user->name ?? 'Unknown User',
                    'email' => $subscription->vendor->user->email ?? 'Unknown Email',
                    'created_at' => $subscription->vendor->user->created_at ?? null,
                ],
                'plan' => [
                    'id' => $subscription->subscriptionPlan->id ?? null,
                    'name' => $subscription->subscriptionPlan->name ?? $subscription->plan_name,
                    'price' => $subscription->subscriptionPlan->price ?? $subscription->price,
                    'billing_cycle' => $subscription->subscriptionPlan->billing_cycle ?? $subscription->billing_cycle,
                    'is_active' => $subscription->subscriptionPlan->is_active ?? true,
                ],
                'start_date' => $subscription->start_date,
                'end_date' => $subscription->end_date,
                'is_active' => $subscription->is_active,
                'payment_status' => $subscription->payment_status ?? 'pending',
                'created_at' => $subscription->created_at->toISOString(),
            ];
        });

        $plans = SubscriptionPlan::where('is_active', true)->get();
        $users = User::whereHas('vendor')->get(['id', 'name', 'email', 'created_at']);

        // Calculate stats
        $stats = [
            'total_subscriptions' => Subscription::count(),
            'active_subscriptions' => Subscription::where('is_active', true)->count(),
            'expired_subscriptions' => Subscription::where('end_date', '<', now())->count(),
            'revenue_this_month' => Subscription::where('is_active', true)
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('price'),
        ];

        return Inertia::render('Admin/Marketplace/SubscriptionPlans/UserSubscriptions', [
            'subscriptions' => $subscriptions,
            'plans' => $plans,
            'users' => $users,
            'filters' => [
                'search' => $request->input('search'),
                'plan' => $request->input('plan'),
                'status' => $request->input('status'),
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Assign plan to user
     */
    public function assignPlan(Request $request)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'plan_id' => ['required', 'exists:marketplace_subscription_plans,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after:start_date'],
        ]);

        $user = User::findOrFail($validated['user_id']);
        $plan = SubscriptionPlan::findOrFail($validated['plan_id']);

        // Check if user has vendor profile
        if (!$user->vendor) {
            return back()->with('error', 'User must have a vendor profile to assign subscription plan.');
        }

        // Check for existing active subscription
        $existingSubscription = Subscription::where('vendor_id', $user->vendor->id)
            ->where('is_active', true)
            ->first();

        if ($existingSubscription) {
            return back()->with('error', 'User already has an active subscription. Please remove it first.');
        }

        // Calculate end date if not provided
        $startDate = Carbon::parse($validated['start_date']);
        $endDate = $validated['end_date'] 
            ? Carbon::parse($validated['end_date'])
            : $startDate->copy()->addDays($plan->duration_days ?? 30);
        
        Subscription::create([
            'vendor_id' => $user->vendor->id,
            'plan_id' => $plan->id,
            'plan_name' => $plan->name,
            'price' => $plan->price,
            'billing_cycle' => $plan->billing_cycle,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'is_active' => true,
            'auto_renew' => false,
            'product_limit' => $plan->product_limit,
            'order_limit' => $plan->order_limit,
            'allow_cod' => $plan->allow_cod,
            'payment_status' => 'paid',
        ]);

        return back()->with('success', "Plan '{$plan->name}' assigned to {$user->name} successfully.");
    }

    /**
     * Remove user subscription
     */
    public function removeUserSubscription(Subscription $subscription)
    {
        $userName = $subscription->vendor->user->name ?? 'User';
        $subscription->delete();

        return back()->with('success', "Subscription for {$userName} has been removed successfully.");
    }

    /**
     * Get subscription analytics
     */
    public function analytics()
    {
        // Plan distribution with subscription counts
        $planDistribution = SubscriptionPlan::withCount(['subscriptions' => function($query) {
            $query->where('is_active', true);
        }])->get()->map(function ($plan) {
            return [
                'id' => $plan->id,
                'name' => $plan->name,
                'price' => $plan->price,
                'billing_cycle' => $plan->billing_cycle,
                'subscriptions_count' => $plan->subscriptions_count,
            ];
        });

        // Monthly revenue over the last 12 months
        $monthlyRevenue = collect();
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $revenue = Subscription::where('is_active', true)
                ->whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->sum('price');
            
            $subscriptionCount = Subscription::where('is_active', true)
                ->whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->count();

            $monthlyRevenue->push([
                'month' => $date->format('Y-m'),
                'revenue' => (float) $revenue,
                'subscriptions' => $subscriptionCount,
            ]);
        }

        // Daily subscription trends for last 30 days
        $subscriptionTrends = collect();
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $newSubscriptions = Subscription::whereDate('created_at', $date->format('Y-m-d'))->count();
            $activeSubscriptions = Subscription::where('is_active', true)
                ->where('start_date', '<=', $date)
                ->where(function($query) use ($date) {
                    $query->whereNull('end_date')
                          ->orWhere('end_date', '>', $date);
                })
                ->count();

            $subscriptionTrends->push([
                'date' => $date->format('Y-m-d'),
                'new_subscriptions' => $newSubscriptions,
                'active_subscriptions' => $activeSubscriptions,
            ]);
        }

        // Calculate comprehensive stats
        $totalRevenue = Subscription::where('is_active', true)->sum('price');
        $totalSubscriptions = Subscription::where('is_active', true)->count();
        $averageRevenuePerUser = $totalSubscriptions > 0 ? $totalRevenue / $totalSubscriptions : 0;
        
        // Growth rate (current month vs last month)
        $currentMonthRevenue = Subscription::where('is_active', true)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('price');
            
        $lastMonthRevenue = Subscription::where('is_active', true)
            ->whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->sum('price');
            
        $growthRate = $lastMonthRevenue > 0 ? (($currentMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100 : 0;

        // Churn rate estimation (expired subscriptions last month)
        $expiredLastMonth = Subscription::where('end_date', '>=', now()->subMonth()->startOfMonth())
            ->where('end_date', '<=', now()->subMonth()->endOfMonth())
            ->count();
        $activeLastMonth = Subscription::where('is_active', true)
            ->whereMonth('created_at', '<=', now()->subMonth()->month)
            ->count();
        $churnRate = $activeLastMonth > 0 ? ($expiredLastMonth / $activeLastMonth) * 100 : 0;

        // Most popular plan
        $mostPopularPlan = $planDistribution->sortByDesc('subscriptions_count')->first();
        $mostPopularPlanName = $mostPopularPlan ? $mostPopularPlan['name'] : 'None';

        $totalStats = [
            'total_revenue' => (float) $totalRevenue,
            'total_active_subscriptions' => $totalSubscriptions,
            'average_revenue_per_user' => (float) $averageRevenuePerUser,
            'growth_rate' => (float) $growthRate,
            'churn_rate' => (float) $churnRate,
            'most_popular_plan' => $mostPopularPlanName,
        ];

        return Inertia::render('Admin/Marketplace/SubscriptionPlans/Analytics', [
            'planDistribution' => $planDistribution,
            'monthlyRevenue' => $monthlyRevenue,
            'subscriptionTrends' => $subscriptionTrends,
            'totalStats' => $totalStats,
        ]);
    }
}