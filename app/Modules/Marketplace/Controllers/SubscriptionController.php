<?php

namespace App\Modules\Marketplace\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use App\Modules\Marketplace\Models\Payment;
use App\Modules\Marketplace\Models\Subscription;
use App\Notifications\SubscriptionActivatedNotification;
use App\Notifications\SubscriptionCancelledNotification;
use App\Notifications\SubscriptionPaymentSuccessfulNotification;
use App\Services\IshemaPaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    protected $ishemaService;

    public function __construct(IshemaPaymentService $ishemaService)
    {
        $this->ishemaService = $ishemaService;
    }

    /**
     * Display subscription plans for users
     */
    public function index()
    {
        $user = Auth::user();
        // Show all active plans
        $plans = SubscriptionPlan::active()->orderBy('price', 'asc')->get();
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

        if (! $user->vendor) {
            return redirect()->route('marketplace.vendor.register')
                ->with('info', 'Please create a vendor profile first to access subscription plans.');
        }

        $currentSubscription = $user->vendor->subscriptions()
            ->where('is_active', true)
            ->first();

        // Only show paid plans (price > 0) that are better than current plan
        $availablePlans = SubscriptionPlan::active()
            ->where('price', '>', 0) // Only show paid plans
            ->when($currentSubscription, function ($query) use ($currentSubscription) {
                return $query->where('price', '>', $currentSubscription->price);
            })
            ->orderBy('price', 'asc')
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

        if (! $user->vendor) {
            return back()->with('error', 'Vendor profile required to subscribe to plans.');
        }

        if (! $plan->is_active) {
            return back()->with('error', 'This subscription plan is not available.');
        }

        // Auto-activate free plans immediately
        if ($plan->price <= 0) {
            // Deactivate current subscription
            $user->vendor->subscriptions()
                ->where('is_active', true)
                ->update(['is_active' => false]);

            // Create and activate free subscription
            $subscription = Subscription::create([
                'vendor_id' => $user->vendor->id,
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
                'price' => $plan->price,
                'billing_cycle' => $plan->billing_cycle,
                'start_date' => now(),
                'end_date' => now()->addDays($plan->duration_days ?? 30),
                'is_active' => true,
                'auto_renew' => true,
                'product_limit' => $plan->product_limit,
                'order_limit' => $plan->order_limit,
                'allow_cod' => $plan->allow_cod,
                'payment_reference' => null,
                'payment_status' => 'completed',
            ]);

            return redirect()->route('marketplace.subscriptions.success', $subscription)
                ->with('success', 'Free plan activated successfully!');
        }

        $currentSubscription = $user->vendor->subscriptions()
            ->where('is_active', true)
            ->first();

        // Calculate pricing for paid plans
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
            'phone_number' => ['nullable', 'string', 'min:9', 'max:12'],
        ]);

        $user = Auth::user();
        $plan = SubscriptionPlan::findOrFail($validated['plan_id']);

        if (! $user->vendor) {
            return back()->with('error', 'Vendor profile required.');
        }

        // Deactivate current subscription
        $user->vendor->subscriptions()
            ->where('is_active', true)
            ->update(['is_active' => false]);

        // Free plans are activated immediately, paid plans require payment
        $isFree = $plan->price <= 0;

        // Create new subscription (inactive until payment completed for paid plans)
        $subscription = Subscription::create([
            'vendor_id' => $user->vendor->id,
            'plan_id' => $plan->id,
            'plan_name' => $plan->name,
            'price' => $plan->price,
            'billing_cycle' => $plan->billing_cycle,
            'start_date' => now(),
            'end_date' => now()->addDays($plan->duration_days ?? 30),
            'is_active' => $isFree, // Free plans activated immediately
            'auto_renew' => $request->boolean('auto_renew', false),
            'product_limit' => $plan->product_limit,
            'order_limit' => $plan->order_limit,
            'allow_cod' => $plan->allow_cod,
            'payment_reference' => $isFree ? null : 'UPGRADE_'.uniqid(),
            'payment_status' => $isFree ? 'completed' : ($validated['payment_method'] === 'online' ? 'pending' : 'cod_pending'),
        ]);

        // Free plans don't need payment
        if ($isFree) {
            // Send activation notification
            $user->notify(new SubscriptionActivatedNotification($subscription));

            return redirect()->route('marketplace.subscriptions.success', $subscription)
                ->with('success', 'Free plan activated successfully!');
        }

        if ($validated['payment_method'] === 'online') {
            // Generate unique reference ID
            $referenceId = 'SUB-'.$subscription->id.'-'.time();

            // Create payment record
            $payment = Payment::create([
                'subscription_id' => $subscription->id,
                'amount' => $subscription->price,
                'currency' => 'RWF',
                'payment_method' => 'mtn_momo',
                'gateway' => 'ishema',
                'type' => 'subscription',
                'status' => 'pending',
                'transaction_id' => $referenceId,
                'reference' => $referenceId,
                'vendor_amount' => 0,
                'commission_amount' => 0,
                'fees' => 0,
                'net_amount' => $subscription->price,
                'metadata' => json_encode([
                    'subscription_id' => $subscription->id,
                    'plan_name' => $subscription->plan_name,
                    'reference_id' => $referenceId,
                ]),
            ]);

            // If phone number provided, initiate payment immediately
            if (! empty($validated['phone_number'])) {
                $phoneNumber = $validated['phone_number'];

                \Log::info('Initiating subscription payment', [
                    'subscription_id' => $subscription->id,
                    'phone_number' => $phoneNumber,
                    'amount' => $subscription->price,
                    'reference_id' => $referenceId,
                ]);

                // Initiate payment with Ishema
                $result = $this->ishemaService->createTransaction([
                    'phoneNumber' => $phoneNumber,
                    'amount' => (int) $subscription->price,
                    'currency' => 'RWF',
                    'referenceId' => $referenceId,
                    'senderMessage' => "Subscription: {$subscription->plan_name}",
                    'callbackUrl' => route('marketplace.subscriptions.payment.callback'),
                ]);

                \Log::info('Payment initiation result', [
                    'subscription_id' => $subscription->id,
                    'result' => $result,
                ]);

                if (isset($result['data']['status'])) {
                    // Update payment with gateway transaction ID
                    $payment->update([
                        'gateway_transaction_id' => $result['data']['id'] ?? null,
                    ]);

                    // Redirect to payment page with auto-check
                    return redirect()->route('marketplace.subscriptions.payment', $subscription->id)
                        ->with('payment_initiated', true);
                }

                // If payment initiation failed, still go to payment page for manual retry
                return redirect()->route('marketplace.subscriptions.payment', $subscription->id)
                    ->with('error', $result['message'] ?? 'Failed to initiate payment. Please try again.');
            }

            // Redirect to payment page
            return redirect()->route('marketplace.subscriptions.payment', $subscription->id);
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

        if (! $currentSubscription) {
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

        // Send cancellation notification
        $user->notify(new SubscriptionCancelledNotification($currentSubscription));

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

        if (! $subscription) {
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

        if (! $user->vendor) {
            return redirect()->route('marketplace.vendor.register')
                ->with('error', 'Vendor profile required to view usage statistics.');
        }

        $subscription = $user->vendor->subscriptions()
            ->where('is_active', true)
            ->first();

        if (! $subscription) {
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

        if (! $user->vendor) {
            return response()->json(['error' => 'No vendor profile found'], 404);
        }

        $subscription = $user->vendor->subscriptions()
            ->where('is_active', true)
            ->first();

        if (! $subscription) {
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
     * Show payment page for subscription
     */
    public function showPayment($subscriptionId)
    {
        $subscription = Subscription::with(['vendor', 'plan'])->findOrFail($subscriptionId);

        if ($subscription->vendor->user_id != Auth::id()) {
            abort(403, 'Unauthorized access to subscription payment.');
        }

        // Redirect to success if already paid or free plan
        if ($subscription->payment_status === 'completed' || $subscription->price <= 0) {
            return redirect()->route('marketplace.subscriptions.success', $subscription)
                ->with('success', 'Subscription already activated!');
        }

        // Get or create payment record
        $payment = Payment::where('subscription_id', $subscription->id)
            ->latest()
            ->first();

        if (! $payment) {
            $payment = Payment::create([
                'subscription_id' => $subscription->id,
                'amount' => $subscription->price,
                'currency' => 'RWF',
                'payment_method' => 'mtn_momo',
                'gateway' => 'ishema',
                'type' => 'subscription',
                'status' => 'pending',
                'transaction_id' => 'SUB-'.$subscription->id.'-'.time(),
                'vendor_amount' => 0,
                'commission_amount' => 0,
                'fees' => 0,
                'net_amount' => $subscription->price,
                'metadata' => json_encode([
                    'subscription_id' => $subscription->id,
                    'plan_name' => $subscription->plan_name,
                ]),
            ]);
        }

        return Inertia::render('Marketplace/Subscriptions/Payment', [
            'subscription' => $subscription,
            'payment' => $payment,
            'payment_initiated' => session('payment_initiated', false),
        ]);
    }

    /**
     * Initiate payment for subscription
     */
    public function initiatePayment(Request $request, $subscriptionId)
    {
        $validated = $request->validate([
            'phone_number' => 'required|string|regex:/^[0-9]{9,12}$/',
        ]);

        $subscription = Subscription::with('vendor')->findOrFail($subscriptionId);

        if ($subscription->vendor->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($subscription->payment_status === 'completed') {
            return response()->json(['error' => 'Subscription already paid'], 400);
        }

        try {
            $payment = Payment::where('subscription_id', $subscription->id)->latest()->first();

            if (! $payment) {
                $payment = Payment::create([
                    'subscription_id' => $subscription->id,
                    'amount' => $subscription->price,
                    'currency' => 'RWF',
                    'payment_method' => 'mtn_momo',
                    'gateway' => 'ishema',
                    'type' => 'subscription',
                    'status' => 'pending',
                    'transaction_id' => 'SUB-'.$subscription->id.'-'.time(),
                    'vendor_amount' => 0,
                    'commission_amount' => 0,
                    'fees' => 0,
                    'net_amount' => $subscription->price,
                    'metadata' => json_encode([
                        'phone_number' => $validated['phone_number'],
                        'subscription_id' => $subscription->id,
                        'plan_name' => $subscription->plan_name,
                    ]),
                ]);
            } else {
                $metadata = json_decode($payment->metadata, true) ?? [];
                $metadata['phone_number'] = $validated['phone_number'];
                $payment->update([
                    'metadata' => json_encode($metadata),
                ]);
            }

            // Generate unique reference ID
            $uniqueRef = 'SUB-'.$subscription->id.'-'.time();

            $transactionData = [
                'amount' => (int) round($subscription->price),
                'phoneNumber' => $validated['phone_number'],
                'referenceId' => $uniqueRef,
                'senderMessage' => 'Payment for '.$subscription->plan_name.' Subscription',
                'callbackUrl' => route('marketplace.subscriptions.payment.callback'),
            ];

            $result = $this->ishemaService->createTransaction($transactionData);

            $metadata = json_decode($payment->metadata, true) ?? [];
            $metadata['ishema_response'] = $result;
            $metadata['reference_id'] = $uniqueRef;

            $payment->update([
                'transaction_id' => $result['savedTransaction']['externalId'] ?? $payment->transaction_id,
                'metadata' => json_encode($metadata),
            ]);

            Log::info('Subscription payment initiated', [
                'subscription_id' => $subscription->id,
                'amount' => $subscription->price,
                'phone' => $validated['phone_number'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment initiated. Please check your phone to complete the payment.',
                'payment' => $payment,
            ]);

        } catch (\Exception $e) {
            Log::error('Subscription payment initiation failed', [
                'subscription_id' => $subscription->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to initiate payment: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check payment status
     */
    public function checkPaymentStatus($subscriptionId)
    {
        $subscription = Subscription::findOrFail($subscriptionId);

        if ($subscription->vendor->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $payment = Payment::where('subscription_id', $subscription->id)
            ->latest()
            ->first();

        if (! $payment) {
            return response()->json([
                'status' => 'pending',
                'payment_status' => 'pending',
            ]);
        }

        // Get reference ID from payment record
        $referenceId = $payment->reference ?? $payment->transaction_id;

        if ($referenceId && $payment->status !== 'completed') {
            try {
                $statusResponse = $this->ishemaService->checkTransactionStatus($referenceId);

                Log::info('Subscription payment status check', [
                    'subscription_id' => $subscription->id,
                    'reference_id' => $referenceId,
                    'response' => $statusResponse,
                ]);

                // Check status from Ishema API response (transaction.status or data.status)
                $transactionStatus = $statusResponse['transaction']['status']
                    ?? $statusResponse['data']['status']
                    ?? $statusResponse['status']
                    ?? null;

                // Normalize status to lowercase for comparison
                $transactionStatus = strtolower($transactionStatus ?? '');

                if ($transactionStatus === 'success' || $transactionStatus === 'successful') {
                    $payment->update(['status' => 'completed']);
                    $subscription->update([
                        'payment_status' => 'completed',
                        'is_active' => true, // Activate subscription on successful payment
                    ]);

                    // Send payment success and activation notifications
                    $user = $subscription->vendor->user;
                    $user->notify(new SubscriptionPaymentSuccessfulNotification($subscription, $payment));
                    $user->notify(new SubscriptionActivatedNotification($subscription));
                } elseif ($transactionStatus === 'failed' || $transactionStatus === 'failure') {
                    $payment->update(['status' => 'failed']);
                    $subscription->update(['payment_status' => 'failed']);
                }
            } catch (\Exception $e) {
                Log::error('Subscription payment status check failed', [
                    'subscription_id' => $subscription->id,
                    'reference_id' => $referenceId,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
            }
        }

        return response()->json([
            'status' => $payment->status,
            'payment_status' => $subscription->payment_status,
            'payment' => $payment,
        ]);
    }

    /**
     * Handle payment callback from Ishema
     */
    public function handlePaymentCallback(Request $request)
    {
        Log::info('Subscription payment callback received', $request->all());

        $referenceId = $request->input('referenceId');

        if (! $referenceId) {
            Log::error('No reference ID in subscription callback');

            return response()->json(['error' => 'Invalid callback'], 400);
        }

        try {
            // Find payment by reference ID in metadata
            $payment = Payment::whereJsonContains('metadata->reference_id', $referenceId)
                ->where('type', 'subscription')
                ->latest()
                ->first();

            if (! $payment) {
                Log::error('Payment not found for subscription callback', ['referenceId' => $referenceId]);

                return response()->json(['error' => 'Payment not found'], 404);
            }

            $status = $this->ishemaService->checkTransactionStatus($referenceId);

            // Normalize status to lowercase for comparison
            $transactionStatus = strtolower($status['transaction']['status'] ?? $status['data']['status'] ?? $status['status'] ?? '');

            if ($transactionStatus === 'success' || $transactionStatus === 'successful') {
                $payment->update(['status' => 'completed']);

                if ($payment->subscription_id) {
                    $subscription = Subscription::find($payment->subscription_id);
                    if ($subscription) {
                        $subscription->update([
                            'payment_status' => 'completed',
                            'is_active' => true, // Activate subscription on successful payment
                        ]);

                        // Send payment success and activation notifications
                        $user = $subscription->vendor->user;
                        $user->notify(new SubscriptionPaymentSuccessfulNotification($subscription, $payment));
                        $user->notify(new SubscriptionActivatedNotification($subscription));
                    }
                }

                Log::info('Subscription payment completed via callback', [
                    'subscription_id' => $payment->subscription_id,
                    'amount' => $payment->amount,
                ]);
            }

            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            Log::error('Subscription payment callback processing failed', [
                'error' => $e->getMessage(),
                'referenceId' => $referenceId,
            ]);

            return response()->json(['error' => 'Callback processing failed'], 500);
        }
    }
}
