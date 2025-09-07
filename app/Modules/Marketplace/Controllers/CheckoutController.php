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

        $cartItems = CartItem::with(['product.images', 'product.vendor.user'])
            ->where('user_id', $user->id)
            ->get();

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

        $tax =  0;
        $shippingCost = $this->calculateShippingCost($cartItems);
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
            'payment_method' => 'required|in:cash_on_delivery',
            'notes' => 'nullable|string|max:500'
        ]);

        $cartItems = CartItem::with(['product.vendor'])
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

        DB::beginTransaction();

        try {
            // Group cart items by vendor to create separate orders
            $cartByVendor = $cartItems->groupBy('product.vendor_id');
            $orders = [];

            foreach ($cartByVendor as $vendorId => $items) {
                $order = $this->createOrderForVendor($user, $vendorId, $items, $validated);
                $orders[] = $order;
            }

            // Clear the cart
            CartItem::where('user_id', $user->id)->delete();

            DB::commit();

            // For Inertia requests, redirect to confirmation page
            return redirect()->route('orders.confirmation', [
                'orders' => collect($orders)->pluck('id')->join(',')
            ])->with('success', 'Orders created successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Checkout process failed: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'cart_items' => $cartItems->toArray(),
                'exception' => $e
            ]);

            return back()->withErrors([
                'message' => 'An error occurred during checkout. Please try again.'
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
        // Calculate order totals
        $subtotal = $items->sum(function ($item) {
            return $item->quantity * $item->unit_price;
        });

        $taxRate = 0.16; // 16% VAT
        $taxAmount = $subtotal * $taxRate;
        $shippingCost = $this->calculateShippingCostForVendor($items);
        $totalAmount = $subtotal + $taxAmount + $shippingCost;

        // Create order
        $order = Order::create([
            'user_id' => $user->id,
            'vendor_id' => $vendorId,
            'order_number' => $this->generateOrderNumber(),
            'status' => 'pending',
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'shipping_amount' => $shippingCost,
            'total_amount' => $totalAmount,
            'currency' => 'RWF', // Adjust as needed
            'payment_method' => $validated['payment_method'],
            'shipping_address' => json_encode($validated['shipping_address']),
            'billing_address' => json_encode($validated['billing_address']),
            'notes' => $validated['notes'] ?? null
        ]);

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

        // Generate unique transaction ID for the payment
        $transactionId = 'TXN-' . strtoupper(uniqid()) . '-' . $order->id;

        // Create payment record
        Payment::create([
            'order_id' => $order->id,
            'transaction_id' => $transactionId,
            'payment_method' => $validated['payment_method'],
            'gateway' => $validated['payment_method'] === 'cash_on_delivery' ? 'cash' : 'cash',
            'type' => 'payment',
            'status' => $validated['payment_method'] === 'cash_on_delivery' ? 'pending' : 'pending',
            'amount' => $totalAmount,
            'currency' => 'RWF',
            'fees' => 0,
            'net_amount' => $totalAmount,
            'vendor_amount' => $totalAmount * 0.9, // 90% to vendor
            'commission_amount' => $totalAmount * 0.1, // 10% commission
        ]);

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
            if ($product->min_order_quantity && $cartItem->quantity < $product->min_order_quantity) {
                $errors[] = "Minimum order quantity for '{$product->name}' is {$product->min_order_quantity}.";
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
     */
    private function calculateShippingCostForVendor($items)
    {
        $totalWeight = $items->sum(function ($item) {
            return ($item->product->weight ?? 1) * $item->quantity;
        });

        $baseShippingCost = 5.00; // Base cost per vendor
        $weightCost = $totalWeight * 0.50; // $0.50 per kg

        return $baseShippingCost + $weightCost;
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
}
