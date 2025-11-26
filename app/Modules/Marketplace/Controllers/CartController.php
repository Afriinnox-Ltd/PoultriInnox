<?php

namespace App\Modules\Marketplace\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Marketplace\Models\CartItem;
use App\Modules\Marketplace\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;

class CartController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display the shopping cart.
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

        // Group cart items by vendor for better organization
        $cartByVendor = $cartItems->groupBy('product.vendor_id');

        // Calculate totals
        $subtotal = $cartItems->sum(function ($item) {
            return $item->quantity * $item->unit_price;
        });

        $totalItems = $cartItems->sum('quantity');

        return Inertia::render('Public/Marketplace/cart/index', [
            'cartItems' => $cartItems,
            'cartByVendor' => $cartByVendor,
            'subtotal' => $subtotal,
            'totalItems' => $totalItems,
            'tax' => 1,
            'total' => $subtotal
        ]);
    }

    /**
     * Add item to cart.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login');
        }

        $validated = $request->validate([
            'product_id' => 'required|exists:marketplace_products,id',
            'quantity' => 'required|integer|min:1|max:100'
        ]);


        try {
            $product = Product::findOrFail($validated['product_id']);

            // Check if product is available
            if ($product->status != 'active') {
                return redirect()->back()->with('error', 'This product is not available for purchase.');
            }

            // Check stock availability
            if ($product->stock_quantity < $validated['quantity']) {
                return redirect()->back()->with('error', 'Insufficient stock available for the requested quantity.');
            }

            // Check minimum order quantity
            if ($product->min_order_quantity && $validated['quantity'] < $product->min_order_quantity) {
                return redirect()->back()->with('error', "Minimum order quantity is {$product->min_order_quantity}");
            }

            // Check if item already exists in cart
            $existingCartItem = CartItem::where('user_id', $user->id)
                ->where('product_id', $product->id)
                ->first();

            if ($existingCartItem) {
                // Update existing item
                $newQuantity = $existingCartItem->quantity + $validated['quantity'];

                // Check total quantity against stock
                if ($newQuantity > $product->stock_quantity) {
                    return redirect()->back()->with('error', 'Insufficient stock available for the requested quantity.');
                }

                $existingCartItem->update([
                    'quantity' => $newQuantity,
                    'unit_price' => $product->price
                ]);

                $cartItem = $existingCartItem;
            } else {
                // Create new cart item
                $cartItem = CartItem::create([
                    'user_id' => $user->id,
                    'product_id' => $product->id,
                    'quantity' => $validated['quantity'],
                    'unit_price' => $product->price
                ]);
            }
            return  redirect()->back()->with('success', 'Product added to cart successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'An error occurred while adding to cart: ' . $th->getMessage());
        }
    }

    /**
     * Update cart item quantity.
     */
    public function update(Request $request, CartItem $cartItem)
    {
        $user = Auth::user();
        if (!$user || $cartItem->user_id != $user->id) {
            return redirect()->back()->with('error', 'Unauthorized');
        }

        $validated = $request->validate([
            'quantity' => 'required|integer|min:1|max:100'
        ]);

        $product = $cartItem->product;

        // Check stock availability
        if ($product->stock_quantity < $validated['quantity']) {
            return redirect()->back()->with('error', 'Insufficient stock available');
        }

        // Check minimum order quantity
        if ($product->min_order_quantity && $validated['quantity'] < $product->min_order_quantity) {
            return redirect()->back()->with('error', "Minimum order quantity is {$product->min_order_quantity}");
        }

        $cartItem->update([
            'quantity' => $validated['quantity'],
            'price' => $product->price
        ]);

        return redirect()->back()->with('success', 'Cart updated successfully');
    }

    /**
     * Remove item from cart.
     */
    public function destroy(CartItem $cartItem)
    {
        $user = Auth::user();
        if (!$user || $cartItem->user_id != $user->id) {
            return redirect()->back()->with('error', 'Unauthorized');
        }

        $cartItem->delete();

        return redirect()->back()->with('success', 'Item removed from cart');
    }

    /**
     * Clear entire cart.
     */
    public function clear()
    {
        $user = Auth::user();
        if (!$user) {
            return redirect()->back()->with('error', 'Unauthorized');
        }

        CartItem::where('user_id', $user->id)->delete();

        return redirect()->back()->with('success', 'Cart cleared successfully');
    }

    /**
     * Get cart item count for header/navigation.
     */
    public function count()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['count' => 0]);
        }

        $count = CartItem::where('user_id', $user->id)->sum('quantity');

        return response()->json(['count' => $count]);
    }

    /**
     * Apply coupon code to cart.
     */
    public function applyCoupon(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        $validated = $request->validate([
            'coupon_code' => 'required|string|max:50'
        ]);

        // This is a placeholder for coupon functionality
        // You would implement actual coupon logic here

        return response()->json([
            'error' => 'Coupon system not yet implemented'
        ], 501);
    }

    /**
     * Calculate shipping costs for cart items.
     */
    public function calculateShipping(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        $validated = $request->validate([
            'shipping_address' => 'required|array',
            'shipping_address.city' => 'required|string',
            'shipping_address.state' => 'required|string',
            'shipping_address.country' => 'required|string',
            'shipping_address.postal_code' => 'required|string'
        ]);

        $cartItems = CartItem::with('product')
            ->where('user_id', $user->id)
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['error' => 'Cart is empty'], 400);
        }

        // Calculate shipping costs (simplified logic)
        $totalWeight = $cartItems->sum(function ($item) {
            return ($item->product->weight ?? 1) * $item->quantity;
        });

        $baseShippingCost = 500; // Base cost in cents
        $weightCost = $totalWeight * 50; // 50 cents per kg
        $totalShippingCost = $baseShippingCost + $weightCost;

        // Group by vendor for multiple shipping costs
        $cartByVendor = $cartItems->groupBy('product.vendor_id');
        $shippingByVendor = [];

        foreach ($cartByVendor as $vendorId => $items) {
            $vendorWeight = $items->sum(function ($item) {
                return ($item->product->weight ?? 1) * $item->quantity;
            });

            $shippingByVendor[$vendorId] = [
                'vendor_name' => $items->first()->product->vendor->business_name,
                'weight' => $vendorWeight,
                'cost' => $baseShippingCost + ($vendorWeight * 50)
            ];
        }

        return response()->json([
            'total_shipping_cost' => $totalShippingCost,
            'shipping_by_vendor' => $shippingByVendor,
            'estimated_delivery' => now()->addDays(3)->format('Y-m-d')
        ]);
    }
}
