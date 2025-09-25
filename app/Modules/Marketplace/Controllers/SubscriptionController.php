<?php

namespace App\Modules\Marketplace\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use App\Modules\Marketplace\Models\Subscription;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class SubscriptionController extends Controller
{
    /**
     * Display subscription plans for users
     */
    public function index()
    {
        $user = Auth::user();
        $plans = SubscriptionPlan::active()->get();
        $currentSubscription = null;
        $subscriptionHistory = collect();

        if ($user->vendor) {
            $currentSubscription = $user->vendor->subscriptions()
                ->where('is_active', true)
                ->first();
                
            $subscriptionHistory = $user->vendor->subscriptions()
                ->orderBy('created_at', 'desc')
                ->take(10)
                ->get();
        }

        return Inertia::render('Marketplace/Subscriptions/Index', [
            'plans' => $plans,
            'currentSubscription' => $currentSubscription,
            'subscriptionHistory' => $subscriptionHistory,
            'hasVendorProfile' => (bool) $user->vendor,
        ]);
    }

    /**
     * Show upgrade options
     */
    public function upgrade()
    {
        $user = Auth::user();
        
        if (!$user->vendor) {
            return redirect()->route('marketplace.vendor.register')
                ->with('info', 'Please create a vendor profile first to access subscription plans.');
        }

        $currentSubscription = $user->vendor->subscriptions()
            ->where('is_active', true)
            ->first();

        $availablePlans = SubscriptionPlan::active()
            ->when($currentSubscription, function($query) use ($currentSubscription) {
                return $query->where('price', '>', $currentSubscription->price);
            })
            ->get();

        return Inertia::render('Marketplace/Subscriptions/Upgrade', [
            'currentSubscription' => $currentSubscription,
            'availablePlans' => $availablePlans,
        ]);
    }

    /**
     * Select a plan for upgrade
     */
    public function selectPlan(Request $request, SubscriptionPlan $plan)
    {
        $user = Auth::user();
        
        if (!$user->vendor) {
            return back()->with('error', 'Vendor profile required to subscribe to plans.');
        }

        if (!$plan->is_active) {
            return back()->with('error', 'This subscription plan is not available.');
        }

        $currentSubscription = $user->vendor->subscriptions()
            ->where('is_active', true)
            ->first();

        // Calculate pricing
        $pricing = $this->calculatePricing($plan, $currentSubscription);

        return Inertia::render('Marketplace/Subscriptions/Checkout', [
            'plan' => $plan,
            'currentSubscription' => $currentSubscription,
            'pricing' => $pricing,
        ]);
    }

    /**
     * Process subscription upgrade
     */
    public function processUpgrade(Request $request)
    {
        $validated = $request->validate([
            'plan_id' => ['required', 'exists:marketplace_subscription_plans,id'],
            'payment_method' => ['required', 'in:online,cod'],
        ]);

        $user = Auth::user();
        $plan = SubscriptionPlan::findOrFail($validated['plan_id']);

        if (!$user->vendor) {
            return back()->with('error', 'Vendor profile required.');
        }

        // Deactivate current subscription
        $user->vendor->subscriptions()
            ->where('is_active', true)
            ->update(['is_active' => false]);

        // Create new subscription
        $subscription = Subscription::create([
            'vendor_id' => $user->vendor->id,
            'plan_id' => $plan->id,
            'plan_name' => $plan->name,
            'price' => $plan->price,
            'billing_cycle' => $plan->billing_cycle,
            'start_date' => now(),
            'end_date' => now()->addDays($plan->duration_days ?? 30),
            'is_active' => true,
            'auto_renew' => $request->boolean('auto_renew', false),
            'product_limit' => $plan->product_limit,
            'order_limit' => $plan->order_limit,
            'allow_cod' => $plan->allow_cod,
            'payment_reference' => 'UPGRADE_' . uniqid(),
            'payment_status' => $validated['payment_method'] === 'online' ? 'pending' : 'cod_pending',
        ]);

        if ($validated['payment_method'] === 'online') {
            // Redirect to payment gateway
            return $this->redirectToPayment($subscription);
        }

        return redirect()->route('marketplace.subscriptions.success', $subscription)
            ->with('success', 'Subscription upgraded successfully! Your new plan is now active.');
    }

    /**
     * Show subscription success page
     */
    public function success(Subscription $subscription)
    {
        if ($subscription->vendor->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to subscription details.');
        }

        return Inertia::render('Marketplace/Subscriptions/Success', [
            'subscription' => $subscription->load('vendor'),
        ]);
    }

    /**
     * Cancel subscription
     */
    public function cancel(Request $request)
    {
        $user = Auth::user();
        $currentSubscription = $user->vendor->subscriptions()
            ->where('is_active', true)
            ->first();

        if (!$currentSubscription) {
            return back()->with('error', 'No active subscription found.');
        }

        $validated = $request->validate([
            'cancellation_reason' => ['nullable', 'string', 'max:500'],
        ]);

        // Set subscription to expire at the end of current period
        $currentSubscription->update([
            'auto_renew' => false,
            'cancellation_reason' => $validated['cancellation_reason'] ?? null,
            'cancelled_at' => now(),
        ]);

        return back()->with('success', 'Subscription will be cancelled at the end of current billing period.');
    }

    /**
     * Reactivate cancelled subscription
     */
    public function reactivate()
    {
        $user = Auth::user();
        $subscription = $user->vendor->subscriptions()
            ->where('is_active', true)
            ->whereNotNull('cancelled_at')
            ->first();

        if (!$subscription) {
            return back()->with('error', 'No cancelled subscription found.');
        }

        $subscription->update([
            'auto_renew' => true,
            'cancelled_at' => null,
            'cancellation_reason' => null,
        ]);

        return back()->with('success', 'Subscription reactivated successfully.');
    }

    /**
     * Get subscription usage statistics
     */
    public function usage()
    {
        $user = Auth::user();
        
        if (!$user->vendor) {
            return redirect()->route('marketplace.vendor.register')
                ->with('error', 'Vendor profile required to view usage statistics.');
        }

        $subscription = $user->vendor->subscriptions()
            ->where('is_active', true)
            ->first();

        if (!$subscription) {
            return redirect()->route('marketplace.subscriptions.index')
                ->with('error', 'No active subscription found.');
        }

        $usage = [
            'products' => [
                'used' => $user->vendor->products()->count(),
                'limit' => $subscription->product_limit,
                'percentage' => $subscription->product_limit ? 
                    min(100, ($user->vendor->products()->count() / $subscription->product_limit) * 100) : 0,
            ],
            'orders' => [
                'used' => $user->vendor->orders()->whereMonth('created_at', now()->month)->count(),
                'limit' => $subscription->order_limit,
                'percentage' => $subscription->order_limit ? 
                    min(100, ($user->vendor->orders()->whereMonth('created_at', now()->month)->count() / $subscription->order_limit) * 100) : 0,
            ],
            'days_remaining' => $subscription->daysRemaining(),
            'can_use_cod' => $subscription->allowsCOD(),
        ];

        return Inertia::render('Marketplace/Subscriptions/Usage', [
            'subscription' => $subscription,
            'usage' => $usage,
        ]);
    }

    /**
     * Get subscription usage statistics as JSON for API calls
     */
    public function usageApi()
    {
        $user = Auth::user();
        
        if (!$user->vendor) {
            return response()->json(['error' => 'No vendor profile found'], 404);
        }

        $subscription = $user->vendor->subscriptions()
            ->where('is_active', true)
            ->first();

        if (!$subscription) {
            return response()->json(['error' => 'No active subscription found'], 404);
        }

        $usage = [
            'products' => [
                'used' => $user->vendor->products()->count(),
                'limit' => $subscription->product_limit,
                'percentage' => $subscription->product_limit ? 
                    min(100, ($user->vendor->products()->count() / $subscription->product_limit) * 100) : 0,
            ],
            'orders' => [
                'used' => $user->vendor->orders()->whereMonth('created_at', now()->month)->count(),
                'limit' => $subscription->order_limit,
                'percentage' => $subscription->order_limit ? 
                    min(100, ($user->vendor->orders()->whereMonth('created_at', now()->month)->count() / $subscription->order_limit) * 100) : 0,
            ],
            'days_remaining' => $subscription->daysRemaining(),
            'can_use_cod' => $subscription->allowsCOD(),
        ];

        return response()->json($usage);
    }

    /**
     * Calculate pricing for upgrade
     */
    private function calculatePricing(SubscriptionPlan $newPlan, ?Subscription $currentSubscription): array
    {
        $pricing = [
            'plan_price' => $newPlan->price,
            'current_plan_credit' => 0,
            'upgrade_cost' => $newPlan->price,
            'billing_cycle' => $newPlan->billing_cycle,
        ];

        if ($currentSubscription && $currentSubscription->isActive()) {
            // Calculate prorated credit for remaining time
            $daysRemaining = $currentSubscription->daysRemaining();
            $totalDays = $currentSubscription->start_date->diffInDays($currentSubscription->end_date);
            
            if ($daysRemaining > 0 && $totalDays > 0) {
                $pricing['current_plan_credit'] = ($currentSubscription->price * $daysRemaining) / $totalDays;
                $pricing['upgrade_cost'] = max(0, $newPlan->price - $pricing['current_plan_credit']);
            }
        }

        return $pricing;
    }

    /**
     * Redirect to payment gateway (placeholder)
     */
    private function redirectToPayment(Subscription $subscription)
    {
        // This is where you would integrate with your payment provider
        // For now, we'll simulate successful payment
        $subscription->update(['payment_status' => 'completed']);
        
        return redirect()->route('marketplace.subscriptions.success', $subscription);
    }
}