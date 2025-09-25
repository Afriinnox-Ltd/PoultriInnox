<?php

namespace App\Modules\Marketplace\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Marketplace\Models\Order;
use App\Modules\Marketplace\Models\OrderItem;
use App\Modules\Marketplace\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;

class OrderController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display user's orders.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login');
        }

        $query = Order::with(['user', 'vendor.user', 'items.product.images', 'payments', 'shipping', 'deliveryConfirmation'])
            ->where('user_id', $user->id);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('vendor')) {
            $query->where('vendor_id', $request->vendor);
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        $allowedSorts = ['created_at', 'total_amount', 'status'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection);
        }

        $orders = $query->paginate(10)->withQueryString();

        // Get order statistics
        $stats = [
            'total_orders' => Order::where('user_id', $user->id)->count(),
            'pending_orders' => Order::where('user_id', $user->id)->where('status', 'pending')->count(),
            'completed_orders' => Order::where('user_id', $user->id)->where('status', 'delivered')->count(),
            'total_spent' => Order::where('user_id', $user->id)
                ->whereIn('status', ['processing', 'shipped', 'delivered'])
                ->sum('total_amount')
        ];

        return Inertia::render('Public/Marketplace/orders/index', [
            'orders' => $orders,
            'stats' => $stats,
            'filters' => $request->only(['status', 'vendor']),
            'sort' => ['sort_by' => $sortBy, 'sort_direction' => $sortDirection],
            'user_type' => 'customer'
        ]);
    }

    /**
     * Display the specified order.
     */
    public function show(Order $order)
    {
        $user = Auth::user();

        // Check if user owns this order or is admin
        if (!$user || ($order->user_id !== $user->id && !$user->isAdmin())) {
            abort(403, 'Unauthorized access to order');
        }

        $order->load([
            'user',
            'vendor.user',
            'items.product.images',
            'payments',
            'shipping',
            'deliveryConfirmation'
        ]);

        return Inertia::render('Marketplace/Orders/Show', [
            'order' => $order
        ]);
    }

    /**
     * Cancel an order (if allowed).
     */
    public function cancel(Order $order)
    {
        $user = Auth::user();

        if (!$user || $order->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Check if order can be cancelled
        if (!in_array($order->status, ['pending', 'confirmed'])) {
            return response()->json([
                'error' => 'Order cannot be cancelled at this stage'
            ], 400);
        }

        $order->update(['status' => 'cancelled']);

        // Restore product stock
        foreach ($order->items as $item) {
            $item->product->increment('stock_quantity', $item->quantity);
        }

        // Update payment status if needed
        if ($order->payments->isNotEmpty() && $order->payments->first()->status === 'pending') {
            $order->payments->first()->update(['status' => 'cancelled']);
        }

        return response()->json([
            'message' => 'Order cancelled successfully'
        ]);
    }

    /**
     * Request order return/refund.
     */
    public function requestReturn(Request $request, Order $order)
    {
        $user = Auth::user();

        if (!$user || $order->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Check if order can be returned
        if ($order->status !== 'delivered') {
            return response()->json([
                'error' => 'Only delivered orders can be returned'
            ], 400);
        }

        // Check return window (e.g., 30 days)
        if ($order->updated_at->diffInDays(now()) > 30) {
            return response()->json([
                'error' => 'Return window has expired (30 days)'
            ], 400);
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:500',
            'return_type' => 'required|in:refund,exchange'
        ]);

        $order->update([
            'status' => 'return_requested',
            'return_reason' => $validated['reason'],
            'return_type' => $validated['return_type'],
            'return_requested_at' => now()
        ]);

        return response()->json([
            'message' => 'Return request submitted successfully'
        ]);
    }

    /**
     * Vendor: View orders for their products.
     */
    public function vendorOrders(Request $request)
    {
        $user = Auth::user();
        $vendor = $user->vendor ?? null;

        if (!$vendor) {
            return redirect()->route('marketplace.vendor.register')
                ->with('error', 'You need to be a registered vendor.');
        }

        $query = Order::with(['user', 'items.product.images', 'payments', 'shipping', 'deliveryConfirmation'])
            ->where('vendor_id', $vendor->id);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('order_number')) {
            $query->where('order_number', 'like', '%' . $request->order_number . '%');
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        $allowedSorts = ['created_at', 'total_amount', 'status'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection);
        }

        $orders = $query->paginate(15)->withQueryString();

        // Get vendor order statistics
        $stats = [
            'total_orders' => Order::where('vendor_id', $vendor->id)->count(),
            'pending_orders' => Order::where('vendor_id', $vendor->id)->where('status', 'pending')->count(),
            'processing_orders' => Order::where('vendor_id', $vendor->id)->where('status', 'processing')->count(),
            'shipped_orders' => Order::where('vendor_id', $vendor->id)->where('status', 'shipped')->count(),
            'total_revenue' => Order::where('vendor_id', $vendor->id)
                ->whereIn('status', ['processing', 'shipped', 'delivered'])
                ->sum('total_amount'),
            'this_month_revenue' => Order::where('vendor_id', $vendor->id)
                ->whereIn('status', ['processing', 'shipped', 'delivered'])
                ->where('created_at', '>=', now()->startOfMonth())
                ->sum('total_amount')
        ];

        return Inertia::render('modules/marketplace/orders/index', [
            'orders' => $orders,
            'stats' => $stats,
            'filters' => $request->only(['status', 'order_number']),
            'sort' => ['sort_by' => $sortBy, 'sort_direction' => $sortDirection],
            'user_type' => 'vendor'
        ]);
    }

    /**
     * Vendor: Update order status.
     */
    public function updateStatus(Request $request, Order $order)
    {
        $user = Auth::user();
        $vendor = $user->vendor ?? null;

        if (!$vendor || $order->vendor_id !== $vendor->id) {
            return redirect()->back()
                ->with('error', 'Unauthorized access to order.');
        }

        // Check if admin has confirmed the order
        if (!$order->isAdminConfirmed()) {
            return redirect()->back()
                ->with('error', 'Order must be confirmed by admin before you can update its status.');
        }

        // Check if vendor can update this order
        if (!$order->canVendorUpdate()) {
            return redirect()->back()
                ->with('error', 'You cannot update the status of this order at its current stage.');
        }

        $validated = $request->validate([
            'status' => 'required|in:confirmed,processing,shipped,delivered',
            'tracking_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:500'
        ]);

        // If status is delivered, use the special method that confirms payment
        if ($validated['status'] === 'delivered') {
            $order->markAsDeliveredWithPayment();

            // Update shipping information
            if ($order->shipping) {
                $order->shipping->update([
                    'status' => 'delivered',
                    'delivered_at' => now()
                ]);
            }
        } else {
            // Regular status update
            $updateData = ['status' => $validated['status']];

            if ($validated['status'] === 'shipped' && !empty($validated['tracking_number'])) {
                $updateData['tracking_number'] = $validated['tracking_number'];
                $updateData['shipped_at'] = now();
            }

            if (!empty($validated['notes'])) {
                $updateData['vendor_notes'] = $validated['notes'];
            }

            $order->update($updateData);

            // Update shipping information if order is shipped
            if ($validated['status'] === 'shipped' && $order->shipping) {
                $order->shipping->update([
                    'status' => 'dispatched',
                    'tracking_number' => $validated['tracking_number'] ?? null,
                    'dispatched_at' => now()
                ]);
            }
        }

        return redirect()->back()->with('success', 'Order status updated successfully.');
    }

    /**
     * Confirm an order (vendor self-confirmation).
     */
    public function confirmOrder(Order $order)
    {
        $user = Auth::user();
        
        // Verify this user is the vendor for this order
        if (!$user->vendor || $user->vendor->id !== $order->vendor_id) {
            abort(403, 'Unauthorized to confirm this order.');
        }

        // Check if order is in a state that can be confirmed
        if ($order->admin_confirmed) {
            return redirect()->back()->with('error', 'Order is already confirmed.');
        }

        if (!in_array($order->status, ['pending', 'confirmed'])) {
            return redirect()->back()->with('error', 'Order cannot be confirmed in its current state.');
        }

        // Confirm the order
        $order->markAsAdminConfirmed($user->id);
        

        return redirect()->back()->with('success', 'Order confirmed successfully. You can now manage this order.');
    }

    /**
     * Show delivery confirmation page for buyer
     */
    public function showDeliveryConfirmation(Order $order)
    {
        $user = Auth::user();

        // Check if user owns this order
        if (!$user || $order->user_id !== $user->id) {
            abort(403, 'Unauthorized access to order');
        }

        // Check if order is eligible for delivery confirmation
        if (!$order->isDeliveryConfirmationPending()) {
            return redirect()->route('orders.index')
                ->with('error', 'This order is not pending delivery confirmation.');
        }

        $order->load(['vendor.user', 'items.product.images', 'deliveryConfirmation']);

        return Inertia::render('Public/Marketplace/orders/confirm-delivery', [
            'order' => $order
        ]);
    }

    /**
     * Confirm delivery by buyer
     */
    public function confirmDelivery(Request $request, Order $order)
    {
        $user = Auth::user();

        // Check if user owns this order
        if (!$user || $order->user_id !== $user->id) {
            abort(403, 'Unauthorized access to order');
        }

        // Check if order is eligible for delivery confirmation
        if (!$order->isDeliveryConfirmationPending()) {
            return response()->json([
                'error' => 'This order is not pending delivery confirmation.'
            ], 400);
        }

        $validated = $request->validate([
            'proof_images' => 'required|array|min:1|max:5',
            'proof_images.*' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'confirmation_notes' => 'nullable|string|max:500'
        ]);

        try {
            // Handle image uploads
            $proofImages = [];
            if ($request->hasFile('proof_images')) {
                foreach ($request->file('proof_images') as $image) {
                    $path = $image->store('delivery-confirmations/' . $order->id, 'public');
                    $proofImages[] = $path;
                }
            }

            // Confirm delivery
            $order->confirmDeliveryByBuyer($proofImages, $validated['confirmation_notes'] ?? null);

            return response()->json([
                'message' => 'Delivery confirmed successfully! Payment has been released to the vendor.',
                'redirect' => route('orders.show', $order->id)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to confirm delivery. Please try again.'
            ], 500);
        }
    }
}
