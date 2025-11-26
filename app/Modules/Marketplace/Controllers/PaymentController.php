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
        ]);

        $order = Order::with('vendor')->findOrFail($orderId);

        // Check if user owns this order
        if ($order->user_id != auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Check if order is already paid
        if ($order->payment_status== 'paid') {
            return response()->json(['error' => 'Order already paid'], 400);
        }

        try {
            // Check if payment record already exists
            $payment = Payment::where('order_id', $order->id)->latest()->first();

            if (!$payment) {
                // Get commission rate from settings
                $commissionRate = config('modules.marketplace.config.commission_rate', 5.0) / 100;
                $commissionAmount = $order->total_amount * $commissionRate;
                $vendorAmount = $order->total_amount - $commissionAmount;

                // Create payment record
                $payment = Payment::create([
                    'order_id' => $order->id,
                    'amount' => $order->total_amount,
                    'currency' => 'RWF',
                    'payment_method' => 'mtn_momo',
                    'gateway' => 'ishema',
                    'type' => 'payment',
                    'status' => 'pending',
                    'transaction_id' => 'ORD-' . $order->order_number,
                    'vendor_amount' => $vendorAmount,
                    'commission_amount' => $commissionAmount,
                    'fees' => 0,
                    'net_amount' => $order->total_amount,
                    'metadata' => json_encode([
                        'phone_number' => $validated['phone_number'],
                        'order_number' => $order->order_number,
                    ])
                ]);
            } else {
                // Update existing payment with phone number
                $metadata = json_decode($payment->metadata, true) ?? [];
                $metadata['phone_number'] = $validated['phone_number'];
                $payment->update([
                    'metadata' => json_encode($metadata)
                ]);
            }

            // Create Ishema transaction
            // RWF is already the smallest unit, no need to multiply
            // Generate unique reference ID for each attempt to avoid duplicates
            $uniqueRef = 'ORD-' . $order->order_number . '-' . time();

            $transactionData = [
                'amount' => (int) round($order->total_amount),
                'phoneNumber' => $validated['phone_number'],
                'referenceId' => $uniqueRef,
                'senderMessage' => 'Payment for Order #' . $order->order_number,
                'callbackUrl' => route('payment.callback'),
            ];

            $result = $this->ishemaService->createTransaction($transactionData);

            // Update payment with external ID and Ishema response
            $metadata = json_decode($payment->metadata, true) ?? [];
            $metadata['ishema_response'] = $result;

            $payment->update([
                'transaction_id' => $result['savedTransaction']['externalId'] ?? $payment->transaction_id,
                'payment_method' => 'mtn_momo',
                'metadata' => json_encode($metadata)
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment initiated. Please check your phone to complete the payment.',
                'payment' => $payment->fresh(),
                'transaction' => $result['savedTransaction'] ?? null
            ]);

        } catch (\Exception $e) {
            Log::error('Payment initiation failed', [
                'order_id' => $orderId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to initiate payment. Please try again.',
                'message' => $e->getMessage()
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
            if (!$this->ishemaService->verifyCallback($callbackData)) {
                Log::warning('Invalid payment callback received', $callbackData);
                return response()->json(['error' => 'Invalid callback'], 400);
            }

            $referenceId = $callbackData['referenceId'];
            $status = $callbackData['status'];
            $statusCode = $callbackData['statusCode'] ?? null;

            // Find payment by reference ID (order number)
            $payment = Payment::where('transaction_id', 'LIKE', '%' . str_replace('ORD-', '', $referenceId) . '%')
                ->first();

            if (!$payment) {
                Log::error('Payment not found for callback', ['referenceId' => $referenceId]);
                return response()->json(['error' => 'Payment not found'], 404);
            }

            $order = Order::find($payment->order_id);

            if (!$order) {
                Log::error('Order not found for payment', ['payment_id' => $payment->id]);
                return response()->json(['error' => 'Order not found'], 404);
            }

            // Update payment status based on callback
            if ($status== 'success' && $statusCode == 200) {
                $payment->update([
                    'status' => 'completed',
                    'paid_at' => now(),
                    'metadata' => json_encode(array_merge(
                        json_decode($payment->metadata, true) ?? [],
                        ['callback' => $callbackData]
                    ))
                ]);

                // Update order payment status
                $order->update([
                    'payment_status' => 'paid',
                    'status' => 'processing'
                ]);

                // Clear user's cart after successful payment
                \App\Modules\Marketplace\Models\CartItem::where('user_id', $order->user_id)->delete();

                Log::info('Payment completed successfully', [
                    'order_id' => $order->id,
                    'payment_id' => $payment->id
                ]);

            } else {
                $payment->update([
                    'status' => 'failed',
                    'metadata' => json_encode(array_merge(
                        json_decode($payment->metadata, true) ?? [],
                        ['callback' => $callbackData]
                    ))
                ]);

                Log::info('Payment failed', [
                    'order_id' => $order->id,
                    'payment_id' => $payment->id,
                    'reason' => $callbackData['message'] ?? 'Unknown'
                ]);
            }

            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            Log::error('Payment callback processing failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
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

        if (!$payment) {
            return response()->json(['error' => 'Payment not found'], 404);
        }

        try {
            // Check status from Ishema if still pending
            if ($payment->status== 'pending') {
                // Get the actual reference ID from metadata or payment record
                $metadata = json_decode($payment->metadata, true) ?? [];
                $ishemaResponse = $metadata['ishema_response'] ?? null;

                if ($ishemaResponse && isset($ishemaResponse['savedTransaction']['referenceId'])) {
                    $referenceId = $ishemaResponse['savedTransaction']['referenceId'];
                } else {
                    // Fallback to order number format (for backward compatibility)
                    $referenceId = 'ORD-' . $order->order_number;
                }

                $result = $this->ishemaService->checkTransactionStatus($referenceId);

                if (isset($result['transaction'])) {
                    $transaction = $result['transaction'];

                    // Update payment based on current status
                    if ($transaction['status']== 'success') {
                        $payment->update(['status' => 'completed', 'paid_at' => now()]);
                        $order->update(['payment_status' => 'paid', 'status' => 'processing']);

                        // Clear user's cart after successful payment
                        \App\Modules\Marketplace\Models\CartItem::where('user_id', $order->user_id)->delete();
                    } elseif ($transaction['status']== 'failed') {
                        $payment->update(['status' => 'failed']);
                    }
                }
            }

            return response()->json([
                'payment' => $payment->fresh(),
                'order' => $order->fresh()
            ]);

        } catch (\Exception $e) {
            Log::error('Payment status check failed', [
                'order_id' => $orderId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'payment' => $payment,
                'order' => $order
            ]);
        }
    }

    /**
     * Show payment page
     */
    public function show($orderId, Request $request)
    {
        $order = Order::with(['items.product.images', 'vendor', 'payments'])
            ->findOrFail($orderId);

        // Check if user owns this order
        if ($order->user_id != auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $latestPayment = $order->payments()->latest()->first();

        // If no payment record exists, create a pending one
        if (!$latestPayment && $order->payment_method== 'online') {
            // Get commission rate from settings
            $commissionRate = config('modules.marketplace.config.commission_rate', 5.0) / 100;
            $commissionAmount = $order->total_amount * $commissionRate;
            $vendorAmount = $order->total_amount - $commissionAmount;

            $latestPayment = Payment::create([
                'order_id' => $order->id,
                'amount' => $order->total_amount,
                'currency' => 'RWF',
                'payment_method' => 'online',
                'gateway' => 'ishema',
                'type' => 'payment',
                'status' => 'pending',
                'transaction_id' => 'ORD-' . $order->order_number,
                'vendor_amount' => $vendorAmount,
                'commission_amount' => $commissionAmount,
                'fees' => 0,
                'net_amount' => $order->total_amount,
                'metadata' => json_encode([
                    'order_number' => $order->order_number,
                    'created_on_page_load' => true
                ])
            ]);
        }

        // Get phone number from query parameter (passed from checkout)
        $phoneNumber = $request->query('phone', '');

        return Inertia::render('Public/Marketplace/payment/index', [
            'order' => $order,
            'payment' => $latestPayment,
            'phoneNumber' => $phoneNumber
        ]);
    }
}
