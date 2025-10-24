<?php

namespace App\Modules\Marketplace\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Marketplace\Models\Payment;
use App\Modules\Marketplace\Models\Order;
use App\Services\MarketplaceSettingsService;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class VendorPaymentController extends Controller
{
    /**
     * Display vendor payout request dashboard
     */
    public function index(Request $request)
    {
        $vendor = Auth::user()->vendor;

        if (!$vendor) {
            return redirect()->route('marketplace.vendor.register');
        }

        // Get marketplace settings
        $settingsService = new MarketplaceSettingsService();
        $formattedSettings = $settingsService->getFormattedSettings();
        $minPayoutAmount = $formattedSettings['payout']['min_payout_amount'] ?? 0;

        // Calculate available earnings (not yet requested for payout)
        $availableEarnings = Payment::whereHas('order', function($q) use ($vendor) {
            $q->where('vendor_id', $vendor->id)
              ->where('status', 'delivered')
              ->whereHas('deliveryConfirmation', function($dc) {
                  $dc->where('confirmed', true);
              });
        })->where('vendor_paid', false)
          ->where('payout_requested', false)
          ->sum('vendor_amount');

        // Calculate pending payout requests (requested but not yet paid)
        $pendingPayoutsAmount = Payment::whereHas('order', function($q) use ($vendor) {
            $q->where('vendor_id', $vendor->id)
              ->where('status', 'delivered')
              ->whereHas('deliveryConfirmation', function($dc) {
                  $dc->where('confirmed', true);
              });
        })->where('vendor_paid', false)
          ->where('payout_requested', true)
          ->sum('vendor_amount');

        // Calculate total payouts (already paid to vendor)
        $totalPayouts = Payment::whereHas('order', function($q) use ($vendor) {
            $q->where('vendor_id', $vendor->id)
              ->where('status', 'delivered');
        })->where('vendor_paid', true)
          ->sum('vendor_amount');

        // Get all payout requests with their status
        $payoutRequests = Payment::whereHas('order', function($q) use ($vendor) {
            $q->where('vendor_id', $vendor->id)
              ->where('status', 'delivered')
              ->whereHas('deliveryConfirmation', function($dc) {
                  $dc->where('confirmed', true);
              });
        })->where(function($q) {
            $q->where('payout_requested', true)
              ->orWhere('vendor_paid', true);
        })->with(['order.user', 'order.deliveryConfirmation'])
          ->orderBy('payout_requested_at', 'desc')
          ->orderBy('vendor_paid_at', 'desc')
          ->paginate(15);

        $stats = [
            'available_earnings' => $availableEarnings,
            'pending_payouts' => $pendingPayoutsAmount,
            'total_payouts' => $totalPayouts,
            'can_request_payout' => $availableEarnings >= $minPayoutAmount,
        ];

        return Inertia::render('modules/marketplace/vendor/payments/Index', [
            'stats' => $stats,
            'payoutRequests' => $payoutRequests,
            'minPayoutAmount' => $minPayoutAmount,
            'marketplaceSettings' => $formattedSettings,
        ]);
    }

    /**
     * Display vendor payment analytics
     */
    public function analytics(Request $request)
    {
        $vendor = Auth::user()->vendor;

        if (!$vendor) {
            return redirect()->route('marketplace.vendor.register');
        }

        // Monthly earnings trend (last 12 months)
        $monthlyEarnings = Payment::whereHas('order', function($q) use ($vendor) {
            $q->where('vendor_id', $vendor->id);
        })
        ->selectRaw('
            strftime("%Y-%m", created_at) as month,
            SUM(vendor_amount) as total_amount,
            COUNT(*) as total_payments
        ')
        ->where('created_at', '>=', now()->subYear())
        ->groupBy('month')
        ->orderBy('month')
        ->get();

        // Payment method breakdown
        $paymentMethods = Payment::whereHas('order', function($q) use ($vendor) {
            $q->where('vendor_id', $vendor->id);
        })
        ->selectRaw('payment_method, SUM(vendor_amount) as total_amount, COUNT(*) as count')
        ->groupBy('payment_method')
        ->get();

        // Top products by revenue
        $topProducts = Order::where('vendor_id', $vendor->id)
            ->whereHas('payment')
            ->with(['items.product', 'payment'])
            ->get()
            ->flatMap(function ($order) {
                return $order->items->map(function ($item) use ($order) {
                    return [
                        'product' => $item->product,
                        'revenue' => ($item->price * $item->quantity * 0.9), // 90% vendor share
                        'quantity_sold' => $item->quantity,
                    ];
                });
            })
            ->groupBy('product.id')
            ->map(function ($group) {
                $product = $group->first()['product'];
                return [
                    'product' => $product,
                    'total_revenue' => $group->sum('revenue'),
                    'total_quantity' => $group->sum('quantity_sold'),
                ];
            })
            ->sortByDesc('total_revenue')
            ->take(10)
            ->values();

        // Get marketplace settings for commission calculations
        $settingsService = new MarketplaceSettingsService();
        $formattedSettings = $settingsService->getFormattedSettings();

        return Inertia::render('modules/marketplace/vendor/payments/Analytics', [
            'monthlyEarnings' => $monthlyEarnings,
            'paymentMethods' => $paymentMethods,
            'topProducts' => $topProducts,
            'marketplaceSettings' => $formattedSettings,
        ]);
    }

    /**
     * Show delivery confirmation reminder (buyers confirm delivery, not vendors)
     */
    public function remindBuyerConfirmation(Request $request, Order $order)
    {
        $vendor = Auth::user()->vendor;

        // Verify the order belongs to the vendor
        if ($order->vendor_id !== $vendor->id) {
            return back()->with('error', 'Unauthorized action.');
        }

        // Send reminder notification to buyer
        if ($order->user) {
            $order->user->notify(new \App\Notifications\DeliveryConfirmationRequestNotification($order));
        }

        return back()->with('success', 'Reminder sent to buyer to confirm delivery.');
    }

    /**
     * Request payout for available earnings
     */
    public function requestPayout(Request $request)
    {
        $vendor = Auth::user()->vendor;
        $settingsService = new MarketplaceSettingsService();
        $minPayoutAmount = $settingsService->getFormattedSettings()['payout']['min_payout_amount'];

        // Calculate available earnings (from buyer-confirmed deliveries)
        $availableEarnings = Payment::whereHas('order', function($q) use ($vendor) {
            $q->where('vendor_id', $vendor->id)
              ->where('status', 'delivered')
              ->where('payment_status', 'completed')
              ->whereHas('deliveryConfirmation', function($dc) {
                  $dc->where('confirmed', true);
              });
        })->where('vendor_paid', false)
          ->where('payout_requested', false)
          ->sum('vendor_amount');

        // Check if minimum payout amount is met
        if ($availableEarnings < $minPayoutAmount) {
            return back()->with('error', "Minimum payout amount is {$settingsService->getCurrencySymbol()}{$minPayoutAmount}. Your available earnings: {$settingsService->getCurrencySymbol()}{$availableEarnings}");
        }

        // Mark payments as payout requested
        $affectedPayments = Payment::whereHas('order', function($q) use ($vendor) {
            $q->where('vendor_id', $vendor->id)
              ->where('status', 'delivered')
              ->where('payment_status', 'completed')
              ->whereHas('deliveryConfirmation', function($dc) {
                  $dc->where('confirmed', true);
              });
        })->where('vendor_paid', false)
          ->where('payout_requested', false)
          ->update([
              'payout_requested' => true,
              'payout_requested_at' => now(),
              'payout_requested_by' => Auth::id(),
          ]);

        // Notify admin about the payout request
        $adminUsers = User::where('role', 'admin')->get();
        foreach ($adminUsers as $admin) {
            $admin->notify(new \App\Notifications\VendorPayoutRequestNotification(
                $vendor,
                $availableEarnings,
                $affectedPayments,
                $settingsService->getCurrencySymbol()
            ));
        }

        // Send confirmation to vendor
        $vendor->user->notify(new \App\Notifications\VendorPayoutRequestConfirmationNotification(
            $availableEarnings,
            $affectedPayments,
            $settingsService->getCurrencySymbol(),
            $vendor->business_name,
            $settingsService->getFormattedSettings()['payout']['payment_hold_days']
        ));

        return back()->with('success', "Payout request submitted for {$settingsService->getCurrencySymbol()}{$availableEarnings}. We will process your request within {$settingsService->getFormattedSettings()['payout']['payment_hold_days']} business days.");
    }
}
