<?php

namespace App\Modules\Marketplace\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Marketplace\Models\CartItem;
use App\Modules\Marketplace\Models\Order;
use App\Modules\Marketplace\Models\OrderItem;
use App\Modules\Marketplace\Models\Payment;
use App\Modules\Marketplace\Models\Shipping;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display the checkout page.
     */
    public function index()
    {
        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login');
        }

        $cartItems = CartItem::with([
            'product.images',
            'product.vendor.user',
            'product.vendor.activeSubscription',
            'product' => function($query) {
                $query->select('id', 'name', 'price', 'vendor_id', 'payment_methods', 'shipping_option', 'extra_fee', 'delivery_time', 'return_policy', 'stock_quantity', 'status', 'minimum_order_quantity', 'maximum_order_quantity', 'is_negotiable');
            }
        ])
            ->where('user_id', $user->id)
            ->get();

        // Filter payment methods based on vendor active subscription
        $cartItems->each(function ($item) {
            if ($item->product && $item->product->vendor) {
                $vendor = $item->product->vendor;
                $subscription = $vendor->activeSubscription;

                // Check if vendor has an active subscription with COD access
                // Only vendors with active subscriptions that include allow_cod=true can offer COD
                $hasCODAccess = $subscription && $subscription->allowsCOD();

                // Parse payment methods
                $paymentMethods = $item->product->payment_methods;
                if (is_string($paymentMethods)) {
                    try {
                        $paymentMethods = json_decode($paymentMethods, true) ?? explode(',', $paymentMethods);
                    } catch (\Exception $e) {
                        $paymentMethods = explode(',', $paymentMethods);
                    }
                }

                // Filter out COD if vendor doesn't have access
                if (is_array($paymentMethods) && !$hasCODAccess) {
                    $paymentMethods = array_filter($paymentMethods, function($method) {
                        $method = trim($method);
                        return $method !== 'cod' && $method !== 'cash_on_delivery';
                    });
                    $item->product->payment_methods = array_values($paymentMethods);
                } else {
                    $item->product->payment_methods = is_array($paymentMethods) ? $paymentMethods : [];
                }
            }
        });

        if ($cartItems->isEmpty()) {
            return redirect()->route('cart.index')
                ->with('error', 'Your cart is empty.');
        }

        // Validate cart items (check stock, active status)
        $validationErrors = $this->validateCartItems($cartItems);
        if (!empty($validationErrors)) {
            return redirect()->route('cart.index')
                ->withErrors($validationErrors);
        }

        // Group by vendor
        $cartByVendor = $cartItems->groupBy('product.vendor_id');

        // Calculate totals
        $subtotal = $cartItems->sum(function ($item) {
            return $item->quantity * $item->unit_price;
        });

        // Calculate tax (16% VAT on subtotal)
        $taxRate = 0.16;
        $tax = $subtotal * $taxRate;

        // Calculate shipping based on vendor settings (use max shipping from products)
        $shippingCost = 0;
        foreach ($cartItems as $item) {
            if ($item->product && $item->product->shipping_option === 'paid' && $item->product->extra_fee) {
                $shippingCost = max($shippingCost, $item->product->extra_fee);
            }
        }

        $total = $subtotal + $tax + $shippingCost;

        return Inertia::render('Public/Marketplace/checkout/index', [
            'cart' => [
                'items' => $cartItems
            ],
            'cartByVendor' => $cartByVendor,
            'shipping_cost' => $shippingCost,
            'tax_amount' => $tax,
            'discount_amount' => 0,
            'total_amount' => $total,
            'user_addresses' => [],
            'user' => $user
        ]);
    }

    /**
     * Process the checkout and create order.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        $validated = $request->validate([
            'shipping_address' => 'required|array',
            'shipping_address.name' => 'required|string|max:255',
            'shipping_address.phone' => 'required|string|max:20',
            'shipping_address.address_line_1' => 'required|string|max:255',
            'shipping_address.address_line_2' => 'nullable|string|max:255',
            'shipping_address.city' => 'required|string|max:255',
            'shipping_address.state' => 'required|string|max:255',
            'shipping_address.country' => 'required|string|max:255',
            'billing_address' => 'required|array',
            'billing_address.name' => 'required|string|max:255',
            'billing_address.phone' => 'required|string|max:20',
            'billing_address.address_line_1' => 'required|string|max:255',
            'billing_address.address_line_2' => 'nullable|string|max:255',
            'billing_address.city' => 'required|string|max:255',
            'billing_address.state' => 'required|string|max:255',
            'billing_address.country' => 'required|string|max:255',
            'payment_method' => 'required|in:cash_on_delivery,online',
            'payment_phone_number' => 'required_if:payment_method,online|nullable|string|regex:/^[0-9]{9,12}$/',
            'notes' => 'nullable|string|max:500'
        ]);

        $cartItems = CartItem::with(['product.vendor.activeSubscription'])
            ->where('user_id', $user->id)
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['error' => 'Cart is empty'], 400);
        }

        // Validate cart items one more time
        $validationErrors = $this->validateCartItems($cartItems);
        if (!empty($validationErrors)) {
            return response()->json(['errors' => $validationErrors], 400);
        }

        // If payment method is COD, validate that all vendors support it
        if ($validated['payment_method'] === 'cash_on_delivery') {
            foreach ($cartItems as $item) {
                $vendor = $item->product->vendor;
                $subscription = $vendor->activeSubscription;

                if (!$subscription) {
                    return response()->json([
                        'error' => 'Cash on Delivery is not available. Vendor "' . $vendor->business_name . '" does not have an active subscription plan.'
                    ], 400);
                }

                if (!$subscription->allowsCOD()) {
                    return response()->json([
                        'error' => 'Cash on Delivery is not available. Vendor "' . $vendor->business_name . '" subscription plan does not include COD payment option.'
                    ], 400);
                }
            }
        }

        DB::beginTransaction();

        try {
            // Group cart items by vendor to create separate orders
            $cartByVendor = $cartItems->groupBy('product.vendor_id');
            $orders = [];

            foreach ($cartByVendor as $vendorId => $items) {
                $order = $this->createOrderForVendor($user, $vendorId, $items, $validated);
                $orders[] = $order;
            }

            DB::commit();

            // Handle different payment methods
            if ($validated['payment_method'] === 'online') {
                // For online payments, redirect to payment page with phone number
                // Don't clear cart yet - will be cleared after successful payment
                $firstOrder = $orders[0]; // For now, handle first order (can be expanded for multiple)

                return redirect()->route('payment.show', [
                    'order' => $firstOrder->id,
                    'phone' => $validated['payment_phone_number'] ?? ''
                ]);
            } else {
                // For COD, clear cart and go to confirmation
                CartItem::where('user_id', $user->id)->delete();

                return redirect()->route('orders.confirmation', [
                    'orders' => collect($orders)->pluck('id')->join(',')
                ])->with('success', 'Orders created successfully');
            }

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Checkout process failed: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'cart_items' => $cartItems->toArray(),
                'exception' => $e
            ]);

            return back()->withErrors([
                'message' => 'An error occurred during checkout: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Show order confirmation page.
     */
    public function confirmation(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login');
        }

        $orderIds = explode(',', $request->get('orders', ''));

        $orders = Order::with(['items.product.images', 'vendor.user', 'shipping', 'payments'])
            ->where('user_id', $user->id)
            ->whereIn('id', $orderIds)
            ->get();

        if ($orders->isEmpty()) {
            return redirect()->route('marketplace.index')
                ->with('error', 'Orders not found.');
        }

        return Inertia::render('Public/Marketplace/orders/confirmation', [
            'orders' => $orders,
            'totalAmount' => $orders->sum('total_amount')
        ]);
    }

    /**
     * Create an order for a specific vendor.
     */
    private function createOrderForVendor($user, $vendorId, $items, $validated)
    {
        // Get vendor and check subscription limits
        $vendor = \App\Modules\Marketplace\Models\Vendor::find($vendorId);

        if ($vendor) {
            // Get active subscription
            $subscription = $vendor->subscriptions()
                ->where('is_active', true)
                ->where('end_date', '>', now())
                ->first();

            if ($subscription && $subscription->order_limit !== null) {
                // Count orders this month for this vendor
                $ordersThisMonth = Order::where('vendor_id', $vendorId)
                    ->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count();

                // Check if vendor has reached their monthly order limit
                if ($ordersThisMonth >= $subscription->order_limit) {
                    throw new \Exception(
                        "This vendor has reached their monthly order limit. " .
                        "Please try again later or contact the vendor."
                    );
                }
            }
        }

        // Calculate order totals
        $subtotal = $items->sum(function ($item) {
            return $item->quantity * $item->unit_price;
        });

        $taxRate = 0.16; // 16% VAT
        $taxAmount = $subtotal * $taxRate;
        $shippingCost = $this->calculateShippingCostForVendor($items);
        $totalAmount = $subtotal + $taxAmount + $shippingCost;

        // Create order
        // Create order
        $order = Order::create([
            'user_id' => $user->id,
            'vendor_id' => $vendorId,
            'order_number' => $this->generateOrderNumber(),
            'status' => 'confirmed',
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'shipping_amount' => $shippingCost,
            'total_amount' => $totalAmount,
            'currency' => 'RWF', // Adjust as needed
            'payment_method' => $validated['payment_method'],
            'shipping_address' => $validated['shipping_address'],
            'billing_address' => $validated['billing_address'],
            'notes' => $validated['notes'] ?? null
        ]);


        $order->markAsAdminConfirmed($user->id);

        // Create order items
        foreach ($items as $cartItem) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $cartItem->product_id,
                'product_name' => $cartItem->product->name,
                'product_sku' => $cartItem->product->sku ?? null,
                'quantity' => $cartItem->quantity,
                'unit_price' => $cartItem->unit_price,
                'total_price' => $cartItem->quantity * $cartItem->unit_price
            ]);

            // Update product stock
            $cartItem->product->decrement('stock_quantity', $cartItem->quantity);
        }

        // Create shipping record
        $shippingAddr = $validated['shipping_address'];

        Shipping::create([
            'order_id' => $order->id,
            'recipient_name' => $shippingAddr['name'],
            'phone' => $shippingAddr['phone'],
            'address' => $shippingAddr['address_line_1'] . ($shippingAddr['address_line_2'] ? ', ' . $shippingAddr['address_line_2'] : ''),
            'city' => $shippingAddr['city'],
            'state' => $shippingAddr['state'],
            'country' => $shippingAddr['country'],
            'service_type' => 'standard',
            'shipping_cost' => $shippingCost,
            'estimated_delivery' => now()->addDays(3),
            'status' => 'pending'
        ]);

        // Create payment record only for COD (online payments will be created when initiated)
        if ($validated['payment_method'] === 'cash_on_delivery') {
            $transactionId = 'TXN-' . strtoupper(uniqid()) . '-' . $order->id;

            // Get commission rate from settings
            $commissionRate = config('modules.marketplace.config.commission_rate', 5.0) / 100;
            $commissionAmount = $totalAmount * $commissionRate;
            $vendorAmount = $totalAmount - $commissionAmount;

            Payment::create([
                'order_id' => $order->id,
                'transaction_id' => $transactionId,
                'payment_method' => 'cash_on_delivery',
                'gateway' => 'cash',
                'type' => 'payment',
                'status' => 'pending',
                'amount' => $totalAmount,
                'currency' => 'RWF',
                'fees' => 0,
                'net_amount' => $totalAmount,
                'vendor_amount' => $vendorAmount,
                'commission_amount' => $commissionAmount,
            ]);
        }

        return $order;
    }

    /**
     * Validate cart items before checkout.
     */
    private function validateCartItems($cartItems)
    {
        $errors = [];

        foreach ($cartItems as $cartItem) {
            $product = $cartItem->product;

            // Check if product is still active
            if ($product->status !== 'active') {
                $errors[] = "Product '{$product->name}' is no longer available.";
                continue;
            }

            // Check stock availability
            if ($product->stock_quantity < $cartItem->quantity) {
                $errors[] = "Insufficient stock for '{$product->name}'. Only {$product->stock_quantity} available.";
                continue;
            }

            // Check minimum order quantity
            if ($product->minimum_order_quantity && $cartItem->quantity < $product->minimum_order_quantity) {
                $errors[] = "Minimum order quantity for '{$product->name}' is {$product->minimum_order_quantity}.";
            }

            // Check maximum order quantity
            if ($product->maximum_order_quantity && $cartItem->quantity > $product->maximum_order_quantity) {
                $errors[] = "Maximum order quantity for '{$product->name}' is {$product->maximum_order_quantity}.";
            }
        }

        return $errors;
    }

    /**
     * Calculate shipping cost for all cart items.
     */
    private function calculateShippingCost($cartItems)
    {
        $totalWeight = $cartItems->sum(function ($item) {
            return ($item->product->weight ?? 1) * $item->quantity;
        });

        $baseShippingCost = 5.00; // Base cost
        $weightCost = $totalWeight * 0.50; // $0.50 per kg

        return $baseShippingCost + $weightCost;
    }

    /**
     * Calculate shipping cost for items from a specific vendor.
     * Uses the vendor's configured shipping settings from products.
     */
    private function calculateShippingCostForVendor($items)
    {
        $maxShippingCost = 0;

        foreach ($items as $item) {
            $product = $item->product;

            // Check if product has paid shipping option with extra fee
            if ($product && $product->shipping_option === 'paid' && $product->extra_fee) {
                $maxShippingCost = max($maxShippingCost, $product->extra_fee);
            }
        }

        return $maxShippingCost;
    }

    /**
     * Generate a unique order number.
     */
    private function generateOrderNumber()
    {
        $prefix = 'MP'; // Marketplace prefix
        $timestamp = now()->format('ymd');
        $random = strtoupper(Str::random(4));

        $orderNumber = "{$prefix}{$timestamp}{$random}";

        // Ensure uniqueness
        while (Order::where('order_number', $orderNumber)->exists()) {
            $random = strtoupper(Str::random(4));
            $orderNumber = "{$prefix}{$timestamp}{$random}";
        }

        return $orderNumber;
    }

    /**
     * Show payment simulation page for online payments.
     */
    public function paymentSimulation(Order $order)
    {
        // Verify that this order belongs to the authenticated user and is pending payment
        if ($order->user_id !== auth()->id() || $order->payment_status !== 'pending') {
            abort(403, 'Unauthorized access to payment page.');
        }

        // Get order items with products
        $order->load(['items.product', 'vendor']);

        return inertia('Public/Marketplace/payment/Simulation', [
            'order' => $order
        ]);
    }

    /**
     * Process payment simulation result.
     */
    public function processPayment(Order $order, Request $request)
    {
        // Verify that this order belongs to the authenticated user
        if ($order->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access.');
        }

        $validated = $request->validate([
            'payment_method' => 'required|in:card,mobile_money',
            'success' => 'required|boolean',
            'transaction_id' => 'required|string',
        ]);

        DB::beginTransaction();

        try {
            if ($validated['success']) {
                // Payment successful - update order and payment status
                $order->update([
                    'payment_status' => 'paid',
                    'status' => 'confirmed'
                ]);

                // Update payment record
                $payment = $order->payment;
                if ($payment) {
                    $payment->update([
                        'status' => 'completed',
                        'transaction_id' => $validated['transaction_id'],
                        'payment_method' => $validated['payment_method'],
                        'processed_at' => now()
                    ]);
                }

                // Update product stock quantities
                foreach ($order->items as $orderItem) {
                    $product = $orderItem->product;
                    $product->decrement('stock_quantity', $orderItem->quantity);
                }

                // Clear the user's cart now that payment is successful
                $cartItemsDeleted = CartItem::where('user_id', auth()->id())->delete();
                Log::info('Cart items deleted after successful payment', [
                    'user_id' => auth()->id(),
                    'items_deleted' => $cartItemsDeleted,
                    'order_id' => $order->id
                ]);

                // Send notification to customer
                $user = $order->user;
                $user->notify(new \App\Notifications\OrderPaymentSuccessfulNotification($order));

                // Send notification to vendor
                $vendor = $order->vendor;
                if ($vendor && $vendor->user) {
                    $vendor->user->notify(new \App\Notifications\NewOrderReceivedNotification($order));
                }

                DB::commit();

                return redirect()->route('orders.confirmation', ['orders' => $order->id])
                    ->with('success', 'Payment processed successfully!');

            } else {
                // Payment failed - update payment status but keep order as pending
                $payment = $order->payment;
                if ($payment) {
                    $payment->update([
                        'status' => 'failed',
                        'transaction_id' => $validated['transaction_id'],
                        'payment_method' => $validated['payment_method'],
                        'processed_at' => now()
                    ]);
                }

                DB::commit();

                return redirect()->route('checkout.index')
                    ->with('error', 'Payment failed. Please try again.');
            }

        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Payment processing failed: ' . $e->getMessage());

            return redirect()->route('checkout.index')
                ->with('error', 'An error occurred while processing payment.');
        }
    }
}
