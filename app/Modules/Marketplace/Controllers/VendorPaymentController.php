<?php

namespace App\Modules\Marketplace\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Marketplace\Models\Payment;
use App\Modules\Marketplace\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class VendorPaymentController extends Controller
{
    /**
     * Display vendor payments and earnings dashboard
     */
    public function index(Request $request)
    {
        $vendor = Auth::user()->vendor;

        if (!$vendor) {
            return redirect()->route('marketplace.vendor.register');
        }

        // Get vendor's orders with payments
        $query = Order::where('vendor_id', $vendor->id)
            ->with(['payment', 'user', 'items.product'])
            ->orderBy('created_at', 'desc');

        // Filter by payment status if requested
        if ($request->filled('payment_status')) {
            if ($request->payment_status === 'paid') {
                $query->whereHas('payment');
            } elseif ($request->payment_status === 'unpaid') {
                $query->whereDoesntHave('payment');
            }
        }

        $orders = $query->paginate(15);

        // Calculate vendor statistics
        $stats = [
            'total_earnings' => Payment::whereHas('order', function($q) use ($vendor) {
                $q->where('vendor_id', $vendor->id);
            })->sum('vendor_amount'),

            'pending_payouts' => Payment::whereHas('order', function($q) use ($vendor) {
                $q->where('vendor_id', $vendor->id);
            })->where('vendor_paid', false)->sum('vendor_amount'),

            'completed_payouts' => Payment::whereHas('order', function($q) use ($vendor) {
                $q->where('vendor_id', $vendor->id);
            })->where('vendor_paid', true)->sum('vendor_amount'),

            'total_orders' => Order::where('vendor_id', $vendor->id)->count(),

            'paid_orders' => Order::where('vendor_id', $vendor->id)
                ->whereHas('payment')->count(),
        ];

        // Recent payments
        $recentPayments = Payment::whereHas('order', function($q) use ($vendor) {
            $q->where('vendor_id', $vendor->id);
        })->with(['order.user'])->latest()->take(10)->get();

        return Inertia::render('Marketplace/Vendor/Payments/Index', [
            'orders' => $orders,
            'stats' => $stats,
            'recentPayments' => $recentPayments,
            'filters' => $request->only(['payment_status']),
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

        return Inertia::render('Marketplace/Vendor/Payments/Analytics', [
            'monthlyEarnings' => $monthlyEarnings,
            'paymentMethods' => $paymentMethods,
            'topProducts' => $topProducts,
        ]);
    }
}
