<?php

namespace App\Modules\Marketplace\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Marketplace\Models\Payment;
use App\Modules\Marketplace\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    /**
     * Display payments dashboard with analytics
     */
    public function index(Request $request): Response
    {
        $period = $request->get('period', 'all');

        // Get revenue statistics
        $revenueStats = Payment::getRevenueStats($period);

        // Get additional dashboard stats
        $dashboardStats = [
            'total_revenue' => Payment::getTotalRevenue(),
            'total_commission' => Payment::getTotalCommission(),
            'pending_vendor_payouts' => Payment::getPendingVendorPayouts(),
            'completed_vendor_payouts' => Payment::getCompletedVendorPayouts(),
            'total_payments' => Payment::where('type', 'payment')->count(),
            'successful_payments' => Payment::where('type', 'payment')->where('status', 'completed')->count(),
            'failed_payments' => Payment::where('type', 'payment')->where('status', 'failed')->count(),
        ];

        // Calculate success rate
        $dashboardStats['success_rate'] = $dashboardStats['total_payments'] > 0
            ? round(($dashboardStats['successful_payments'] / $dashboardStats['total_payments']) * 100, 2)
            : 0;

        // Get monthly revenue trend
        $monthlyTrend = Payment::getMonthlyRevenueTrend();

        // Get payment method stats
        $paymentMethodStats = Payment::getPaymentMethodStats();

        // Get recent payments
        $recentPayments = Payment::getRecentPayments(10);

        return Inertia::render('Admin/Payments/Index', [
            'revenueStats' => $revenueStats,
            'dashboardStats' => $dashboardStats,
            'monthlyTrend' => $monthlyTrend,
            'paymentMethodStats' => $paymentMethodStats,
            'recentPayments' => $recentPayments,
            'currentPeriod' => $period,
        ]);
    }

    /**
     * Display all payments with filtering and pagination
     */
    public function payments(Request $request): Response
    {
        $query = Payment::with(['order.user', 'order.vendor'])
            ->where('type', 'payment');

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->filled('vendor_id')) {
            $query->byVendor($request->vendor_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('processed_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('processed_at', '<=', $request->date_to);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('transaction_id', 'like', "%{$search}%")
                  ->orWhereHas('order', function ($orderQuery) use ($search) {
                      $orderQuery->where('order_number', 'like', "%{$search}%");
                  });
            });
        }

        $payments = $query->orderByDesc('processed_at')
            ->paginate(20)
            ->withQueryString();

        // Get filter options
        $filterOptions = [
            'statuses' => ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
            'payment_methods' => Payment::distinct()->pluck('payment_method')->filter()->values(),
        ];

        return Inertia::render('Admin/Payments/List', [
            'payments' => $payments,
            'filters' => $request->only(['status', 'payment_method', 'vendor_id', 'date_from', 'date_to', 'search']),
            'filterOptions' => $filterOptions,
        ]);
    }

    /**
     * Mark vendor payout as completed
     */
    public function markVendorPaid(Request $request, Payment $payment)
    {
        $request->validate([
            'note' => 'nullable|string|max:500',
        ]);

        if ($payment->vendor_paid) {
            return back()->with('error', 'Vendor has already been paid for this transaction.');
        }

        // Mark as processing first if not already
        if (!$payment->payout_processing) {
            $payment->update([
                'payout_processing' => true,
                'payout_processing_at' => now(),
                'payout_processing_by' => Auth::id(),
            ]);
        }

        $payment->markVendorPaid();

        // Add note to payment metadata if provided
        if ($request->filled('note')) {
            $metadata = $payment->metadata ?? [];
            $metadata['payout_note'] = $request->note;
            $metadata['payout_processed_by'] = Auth::user()->name;
            $metadata['payout_processed_at'] = now()->toISOString();
            $payment->update(['metadata' => $metadata]);
        }

        return back()->with('success', 'Vendor payout marked as completed successfully.');
    }

    /**
     * Batch process vendor payouts
     */
    public function vendorPayouts(Request $request): Response
    {
        $query = Payment::with(['order.user', 'order.vendor.user'])
            ->where('type', 'payment')
            ->where('status', 'completed');

        // Filter by payout status
        if ($request->filled('payout_status')) {
            switch ($request->payout_status) {
                case 'pending':
                    $query->where('vendor_paid', false)
                          ->where('payout_requested', false);
                    break;
                case 'requested':
                    $query->where('vendor_paid', false)
                          ->where('payout_requested', true)
                          ->where('payout_processing', false);
                    break;
                case 'processing':
                    $query->where('vendor_paid', false)
                          ->where('payout_processing', true);
                    break;
                case 'completed':
                    $query->where('vendor_paid', true);
                    break;
            }
        }

        // Filter by payout requested
        if ($request->filled('payout_requested')) {
            if ($request->payout_requested === 'yes') {
                $query->where('payout_requested', true);
            } elseif ($request->payout_requested === 'no') {
                $query->where('payout_requested', false);
            }
        }

        // Filter by vendor
        if ($request->filled('vendor_id')) {
            $query->byVendor($request->vendor_id);
        }

        $payouts = $query->orderByDesc('payout_requested_at')
            ->orderByDesc('processed_at')
            ->paginate(20)
            ->withQueryString();

        // Get enhanced summary stats
        $payoutStats = [
            'pending_amount' => Payment::where('status', 'completed')
                ->where('vendor_paid', false)
                ->where('payout_requested', false)
                ->sum('vendor_amount'),
            'requested_amount' => Payment::where('status', 'completed')
                ->where('vendor_paid', false)
                ->where('payout_requested', true)
                ->where('payout_processing', false)
                ->sum('vendor_amount'),
            'processing_amount' => Payment::where('status', 'completed')
                ->where('vendor_paid', false)
                ->where('payout_processing', true)
                ->sum('vendor_amount'),
            'completed_amount' => Payment::getCompletedVendorPayouts(),
            'pending_count' => Payment::where('status', 'completed')
                ->where('vendor_paid', false)
                ->where('payout_requested', false)
                ->count(),
            'requested_count' => Payment::where('status', 'completed')
                ->where('vendor_paid', false)
                ->where('payout_requested', true)
                ->where('payout_processing', false)
                ->count(),
            'processing_count' => Payment::where('status', 'completed')
                ->where('vendor_paid', false)
                ->where('payout_processing', true)
                ->count(),
            'completed_count' => Payment::where('vendor_paid', true)->count(),
        ];

        // Get vendor summaries
        $vendorSummaries = \DB::table('marketplace_payments as p')
            ->join('marketplace_orders as o', 'p.order_id', '=', 'o.id')
            ->join('marketplace_vendors as v', 'o.vendor_id', '=', 'v.id')
            ->join('users as u', 'v.user_id', '=', 'u.id')
            ->select(
                'v.id as vendor_id',
                'v.business_name as vendor_name',
                'u.email as vendor_email',
                \DB::raw('SUM(CASE WHEN p.vendor_paid = false AND p.payout_requested = false THEN p.vendor_amount ELSE 0 END) as total_pending'),
                \DB::raw('SUM(CASE WHEN p.vendor_paid = false AND p.payout_requested = true THEN p.vendor_amount ELSE 0 END) as total_requested'),
                \DB::raw('COUNT(CASE WHEN p.vendor_paid = false THEN 1 END) as payment_count'),
                \DB::raw('MAX(p.payout_requested_at) as last_request_date')
            )
            ->where('p.status', 'completed')
            ->where('p.vendor_paid', false)
            ->groupBy('v.id', 'v.business_name', 'u.email')
            ->having('payment_count', '>', 0)
            ->orderByDesc('total_requested')
            ->orderByDesc('total_pending')
            ->get();

        return Inertia::render('Admin/Payments/VendorPayouts', [
            'payouts' => $payouts,
            'payoutStats' => $payoutStats,
            'vendorSummaries' => $vendorSummaries,
            'filters' => $request->only(['payout_status', 'vendor_id', 'payout_requested']),
        ]);
    }

    /**
     * Batch process vendor payouts
     */
    public function batchProcessPayouts(Request $request)
    {
        $request->validate([
            'selected_payments' => 'required|array|min:1',
            'selected_payments.*' => 'exists:marketplace_payments,id',
            'batch_id' => 'nullable|string|max:100',
            'processing_note' => 'nullable|string|max:1000',
        ]);

        $batchId = $request->batch_id ?: 'BATCH_' . now()->format('YmdHis') . '_' . uniqid();
        $userId = Auth::id();
        $processedCount = 0;
        $totalAmount = 0;

        \DB::transaction(function () use ($request, $batchId, $userId, &$processedCount, &$totalAmount) {
            $payments = Payment::whereIn('id', $request->selected_payments)
                ->where('status', 'completed')
                ->where('vendor_paid', false)
                ->where('payout_requested', true)
                ->get();

            foreach ($payments as $payment) {
                // Mark as processing first
                $payment->update([
                    'payout_processing' => true,
                    'payout_processing_at' => now(),
                    'payout_processing_by' => $userId,
                    'payout_batch_id' => $batchId,
                    'payout_notes' => $request->processing_note,
                ]);

                // Then mark as paid (in real scenario, this would be after actual payment)
                $payment->markVendorPaid();
                
                $processedCount++;
                $totalAmount += $payment->vendor_amount;
            }
        });

        return back()->with('success', 
            "Successfully processed {$processedCount} payouts totaling " . 
            number_format($totalAmount, 2) . " in batch {$batchId}."
        );
    }

    /**
     * Get payment analytics data for charts
     */
    public function analytics(Request $request)
    {
        $period = $request->get('period', 'year');

        $data = [
            'revenue_trend' => Payment::getMonthlyRevenueTrend(),
            'payment_methods' => Payment::getPaymentMethodStats(),
            'revenue_stats' => Payment::getRevenueStats($period),
        ];

        return response()->json($data);
    }

    /**
     * Export payments data
     */
    public function export(Request $request)
    {
        $request->validate([
            'format' => 'required|in:csv,xlsx',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
        ]);

        // This would implement CSV/Excel export functionality
        // For now, return a basic CSV response
        $payments = Payment::with(['order.user', 'order.vendor'])
            ->where('type', 'payment')
            ->when($request->date_from, function ($query) use ($request) {
                $query->whereDate('processed_at', '>=', $request->date_from);
            })
            ->when($request->date_to, function ($query) use ($request) {
                $query->whereDate('processed_at', '<=', $request->date_to);
            })
            ->orderByDesc('processed_at')
            ->get();

        $filename = 'payments_export_' . now()->format('Y-m-d_H-i-s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($payments) {
            $file = fopen('php://output', 'w');

            // Add CSV headers
            fputcsv($file, [
                'Transaction ID',
                'Order Number',
                'Customer',
                'Vendor',
                'Payment Method',
                'Status',
                'Amount',
                'Net Amount',
                'Commission',
                'Vendor Amount',
                'Processed At',
            ]);

            // Add data rows
            foreach ($payments as $payment) {
                fputcsv($file, [
                    $payment->transaction_id,
                    $payment->order->order_number,
                    $payment->order->user->name ?? '',
                    $payment->order->vendor->business_name ?? '',
                    $payment->payment_method,
                    $payment->status,
                    $payment->amount,
                    $payment->net_amount,
                    $payment->commission_amount,
                    $payment->vendor_amount,
                    $payment->processed_at?->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
