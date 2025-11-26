<?php

namespace App\Modules\Marketplace\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Marketplace\Models\Order;
use App\Modules\Marketplace\Models\Payment;
use App\Services\IshemaPaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PaymentController extends Controller
{
    protected $ishemaService;

    public function __construct(IshemaPaymentService $ishemaService)
    {
        $this->ishemaService = $ishemaService;
    }

    /**
     * Initiate payment for an order
     */
    public function initiatePayment(Request $request, $orderId)
    {
        $validated = $request->validate([
            'phone_number' => 'required|string|regex:/^[0-9]{9,12}$/',
            'group_id' => 'nullable|string',
        ]);

        $order = Order::with('vendor')->findOrFail($orderId);

        // Check if user owns this order
        if ($order->user_id != auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // If a group_id is provided, find all related orders that are pending payment
        $ordersToPay = collect([$order]);
        $groupId = $request->input('group_id');
        if ($groupId) {
            $groupedOrders = Order::where('payment_group_id', $groupId)
                ->where('user_id', auth()->id())
                ->where('payment_status', 'pending')
                ->get();
            if ($groupedOrders->count() > 0) {
                $ordersToPay = $groupedOrders;
            }
        }

        $totalAmount = $ordersToPay->sum('total_amount');
        $orderNumbers = $ordersToPay->pluck('order_number')->join(', ');

        try {
            // Check if payment record already exists for this attempt
            // We use the first order as the primary anchor for the payment record
            $payment = Payment::where('order_id', $order->id)->where('status', 'pending')->latest()->first();

            if (! $payment) {
                // Calculation for the whole group
                $totalCommission = 0;
                foreach ($ordersToPay as $o) {
                    $commissionRate = config('modules.marketplace.config.commission_rate', 5.0) / 100;
                    $totalCommission += $o->total_amount * $commissionRate;
                }
                $vendorAmount = $totalAmount - $totalCommission;

                // Create payment record
                $payment = Payment::create([
                    'order_id' => $order->id,
                    'amount' => $totalAmount,
                    'currency' => 'RWF',
                    'payment_method' => 'mtn_momo',
                    'gateway' => 'ishema',
                    'type' => 'payment',
                    'status' => 'pending',
                    'transaction_id' => 'GRP-'.($groupId ?? $order->order_number),
                    'vendor_amount' => $vendorAmount,
                    'commission_amount' => $totalCommission,
                    'fees' => 0,
                    'net_amount' => $totalAmount,
                    'metadata' => [
                        'phone_number' => $validated['phone_number'],
                        'order_numbers' => $orderNumbers,
                        'payment_group_id' => $groupId,
                        'order_ids' => $ordersToPay->pluck('id')->toArray(),
                    ],
                ]);
            } else {
                // Update existing payment with phone number and ensure metadata is correct
                $metadata = is_array($payment->metadata) ? $payment->metadata : (json_decode($payment->metadata, true) ?? []);
                $metadata['phone_number'] = $validated['phone_number'];
                $metadata['payment_group_id'] = $groupId;
                $metadata['order_ids'] = $ordersToPay->pluck('id')->toArray();

                $payment->update([
                    'metadata' => $metadata,
                    'amount' => $totalAmount,
                    'net_amount' => $totalAmount,
                ]);
            }

            // Create Ishema transaction
            $uniqueRef = ($groupId ? (str_starts_with($groupId, 'GRP-') ? $groupId : 'GRP-'.$groupId) : 'ORD-'.$order->order_number).'-'.time();

            $transactionData = [
                'amount' => (int) round($totalAmount),
                'phoneNumber' => $validated['phone_number'],
                'referenceId' => $uniqueRef,
                'senderMessage' => 'Payment for Orders: '.$orderNumbers,
                'callbackUrl' => route('payment.callback'),
            ];

            Log::info('Initiating Ishema transaction', ['data' => $transactionData]);
            $result = $this->ishemaService->createTransaction($transactionData);

            // Update payment with external ID and Ishema response
            $metadata = is_array($payment->metadata) ? $payment->metadata : (json_decode($payment->metadata, true) ?? []);
            $metadata['ishema_response'] = $result;

            $payment->update([
                'transaction_id' => $result['savedTransaction']['externalId'] ?? $payment->transaction_id,
                'payment_method' => 'mtn_momo',
                'metadata' => $metadata,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment initiated. Please check your phone to complete the payment.',
                'payment' => $payment->fresh(),
                'transaction' => $result['savedTransaction'] ?? null,
            ]);

        } catch (\Exception $e) {
            Log::error('Payment initiation failed', [
                'order_id' => $orderId,
                'group_id' => $groupId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to initiate payment. Please try again.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle payment callback from Ishema
     */
    public function handleCallback(Request $request)
    {
        Log::info('Ishema payment callback received', $request->all());

        try {
            $callbackData = $request->all();

            // Verify callback
            if (! $this->ishemaService->verifyCallback($callbackData)) {
                Log::warning('Invalid payment callback received', $callbackData);

                return response()->json(['error' => 'Invalid callback'], 400);
            }

            $referenceId = $callbackData['referenceId'];
            $status = $callbackData['status'];
            $statusCode = $callbackData['statusCode'] ?? null;

            // Find payment by reference ID/transaction ID
            $payment = Payment::where('transaction_id', $referenceId)
                ->orWhere('transaction_id', 'LIKE', '%'.str_replace(['ORD-', 'GRP-'], '', $referenceId).'%')
                ->first();

            if (! $payment) {
                Log::error('Payment not found for callback', ['referenceId' => $referenceId]);

                return response()->json(['error' => 'Payment not found'], 404);
            }

            // Identify all orders covered by this payment
            $metadata = is_array($payment->metadata) ? $payment->metadata : (json_decode($payment->metadata, true) ?? []);
            $orderIds = $metadata['order_ids'] ?? [$payment->order_id];
            $orders = Order::whereIn('id', $orderIds)->get();

            if ($orders->isEmpty()) {
                Log::error('No orders found for payment callback', ['payment_id' => $payment->id, 'order_ids' => $orderIds]);

                return response()->json(['error' => 'Orders not found'], 404);
            }

            // Update payment status based on callback
            if ($status == 'success' && $statusCode == 200) {
                $payment->update([
                    'status' => 'completed',
                    'paid_at' => now(),
                    'metadata' => array_merge($metadata, ['callback' => $callbackData]),
                ]);

                // Update all orders' payment status
                foreach ($orders as $order) {
                    /** @var \App\Modules\Marketplace\Models\Order $order */
                    $order->update([
                        'payment_status' => 'paid',
                        'status' => 'processing',
                    ]);

                    // Send notifications if needed (already handled by successful payment logic usually)
                    // Clear user's cart after successful payment (only once)
                }

                \App\Modules\Marketplace\Models\CartItem::where('user_id', $orders->first()->user_id)->delete();

                Log::info('Group Payment completed successfully', [
                    'order_ids' => $orders->pluck('id')->toArray(),
                    'payment_id' => $payment->id,
                ]);

            } else {
                $payment->update([
                    'status' => 'failed',
                    'metadata' => array_merge($metadata, ['callback' => $callbackData]),
                ]);

                Log::info('Payment failed', [
                    'payment_id' => $payment->id,
                    'reason' => $callbackData['message'] ?? 'Unknown',
                ]);
            }

            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            Log::error('Payment callback processing failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['error' => 'Callback processing failed'], 500);
        }
    }

    /**
     * Check payment status
     */
    public function checkStatus($orderId)
    {
        $order = Order::findOrFail($orderId);

        // Check if user owns this order
        if ($order->user_id != auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $payment = Payment::where('order_id', $orderId)->latest()->first();

        if (! $payment) {
            return response()->json(['error' => 'Payment not found'], 404);
        }

        try {
            // Check status from Ishema if still pending
            if ($payment->status == 'pending') {
                // Get the actual reference ID from metadata or payment record
                $metadata = $payment->metadata ?? [];
                $ishemaResponse = $metadata['ishema_response'] ?? null;

                if ($ishemaResponse && isset($ishemaResponse['savedTransaction']['referenceId'])) {
                    $referenceId = $ishemaResponse['savedTransaction']['referenceId'];
                } else {
                    // Fallback to order number format (for backward compatibility)
                    $referenceId = 'ORD-'.$order->order_number;
                }

                $result = $this->ishemaService->checkTransactionStatus($referenceId);

                if (isset($result['transaction'])) {
                    $transaction = $result['transaction'];

                    // Update payment based on current status
                    if ($transaction['status'] == 'success') {
                        $payment->update(['status' => 'completed', 'paid_at' => now()]);

                        // Update all linked orders
                        $metadata = is_array($payment->metadata) ? $payment->metadata : (json_decode($payment->metadata, true) ?? []);
                        $orderIds = $metadata['order_ids'] ?? [$order->id];

                        Order::whereIn('id', $orderIds)->update([
                            'payment_status' => 'paid',
                            'status' => 'processing',
                        ]);

                        // Clear user's cart after successful payment
                        \App\Modules\Marketplace\Models\CartItem::where('user_id', $order->user_id)->delete();
                    } elseif ($transaction['status'] == 'failed') {
                        Log::warning('Ishema payment failed during status check', ['transaction' => $transaction]);
                        $payment->update(['status' => 'failed']);
                    }
                }
            }

            $updatedOrders = Order::whereIn('id', $orderIds ?? [$order->id])->get();

            return response()->json([
                'payment' => $payment->fresh(),
                'orders' => $updatedOrders,
            ]);

        } catch (\Exception $e) {
            Log::error('Payment status check failed', [
                'order_id' => $orderId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'payment' => $payment,
                'order' => $order,
            ]);
        }
    }

    /**
     * Show payment page
     */
    public function show($orderId, Request $request)
    {
        $groupId = $request->query('group');

        $order = Order::with(['items.product.images', 'vendor', 'payments'])
            ->findOrFail($orderId);

        // Check if user owns this order
        if ($order->user_id != auth()->id()) {
            abort(403, 'Unauthorized');
        }

        // If a group ID is present, get all orders in that group
        $orders = collect([$order]);
        if ($groupId) {
            $groupedOrders = Order::with(['items.product.images', 'vendor', 'payments'])
                ->where('payment_group_id', $groupId)
                ->where('user_id', auth()->id())
                ->get();
            if ($groupedOrders->count() > 0) {
                $orders = $groupedOrders;
            }
        }

        $latestPayment = $order->payments()->latest()->first();

        // If no payment record exists, create a pending one for the group anchor order
        if (! $latestPayment && $order->payment_method == 'online') {
            $totalAmount = $orders->sum('total_amount');

            // Get commission rate from settings
            $commissionRate = config('modules.marketplace.config.commission_rate', 5.0) / 100;
            $commissionAmount = $totalAmount * $commissionRate;
            $vendorAmount = $totalAmount - $commissionAmount;

            $latestPayment = Payment::create([
                'order_id' => $order->id,
                'amount' => $totalAmount,
                'currency' => 'RWF',
                'payment_method' => 'online',
                'gateway' => 'ishema',
                'type' => 'payment',
                'status' => 'pending',
                'transaction_id' => ($groupId ? 'GRP-'.$groupId : 'ORD-'.$order->order_number),
                'vendor_amount' => $vendorAmount,
                'commission_amount' => $commissionAmount,
                'fees' => 0,
                'net_amount' => $totalAmount,
                'metadata' => [
                    'order_numbers' => $orders->pluck('order_number')->join(', '),
                    'payment_group_id' => $groupId,
                    'order_ids' => $orders->pluck('id')->toArray(),
                    'created_on_page_load' => true,
                ],
            ]);
        }

        // Get phone number from query parameter (passed from checkout)
        $phoneNumber = $request->query('phone', '');

        return Inertia::render('Public/Marketplace/payment/index', [
            'order' => $order, // Keep primary order for legacy UI
            'orders' => $orders, // Pass all orders in group
            'payment' => $latestPayment,
            'phoneNumber' => $phoneNumber,
            'groupId' => $groupId,
        ]);
    }
}
