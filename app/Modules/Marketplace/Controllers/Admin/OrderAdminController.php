<?php

namespace App\Modules\Marketplace\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Marketplace\Models\Order;
use App\Modules\Marketplace\Models\Vendor;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderAdminController extends Controller
{
    /**
     * Display a listing of orders.
     */
    public function index(Request $request)
    {
        $query = Order::with(['user', 'vendor', 'orderItems.product']);

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('order_number', 'like', '%' . $search . '%')
                  ->orWhereHas('user', function($userQuery) use ($search) {
                      $userQuery->where('name', 'like', '%' . $search . '%')
                               ->orWhere('email', 'like', '%' . $search . '%');
                  })
                  ->orWhereHas('vendor', function($vendorQuery) use ($search) {
                      $vendorQuery->where('business_name', 'like', '%' . $search . '%');
                  });
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        // Filter by vendor
        if ($request->has('vendor') && $request->vendor !== '') {
            $query->where('vendor_id', $request->vendor);
        }

        // Filter by date range
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Filter by amount range
        if ($request->has('amount_min') && $request->amount_min !== '') {
            $query->where('total_amount', '>=', $request->amount_min);
        }
        if ($request->has('amount_max') && $request->amount_max !== '') {
            $query->where('total_amount', '<=', $request->amount_max);
        }

        // Sort
        $sort_by = $request->get('sort_by', 'created_at');
        $sort_direction = $request->get('sort_direction', 'desc');
        $query->orderBy($sort_by, $sort_direction);

        $orders = $query->paginate(15);

        // Get filter options
        $vendors = Vendor::where('status', 'approved')->orderBy('business_name')->get(['id', 'business_name']);

        return Inertia::render('Admin/Marketplace/Orders/Index', [
            'orders' => $orders,
            'vendors' => $vendors,
            'filters' => $request->only([
                'search', 'status', 'vendor', 'date_from', 'date_to',
                'amount_min', 'amount_max', 'sort_by', 'sort_direction'
            ]),
            'status_options' => [
                'pending' => 'Pending',
                'confirmed' => 'Confirmed',
                'processing' => 'Processing',
                'shipped' => 'Shipped',
                'delivered' => 'Delivered',
                'cancelled' => 'Cancelled',
                'refunded' => 'Refunded',
            ],
        ]);
    }

    /**
     * Display the specified order.
     */
    public function show(Order $order)
    {
        $order->load([
            'user',
            'vendor.user',
            'orderItems.product.images',
            'payments',
            'shippingAddress',
            'billingAddress'
        ]);

        // Get order timeline/history
        $timeline = [
            [
                'status' => 'pending',
                'label' => 'Order Placed',
                'date' => $order->created_at,
                'completed' => true,
            ],
            [
                'status' => 'confirmed',
                'label' => 'Order Confirmed',
                'date' => $order->confirmed_at,
                'completed' => in_array($order->status, ['confirmed', 'processing', 'shipped', 'delivered']),
            ],
            [
                'status' => 'processing',
                'label' => 'Processing',
                'date' => $order->processing_at,
                'completed' => in_array($order->status, ['processing', 'shipped', 'delivered']),
            ],
            [
                'status' => 'shipped',
                'label' => 'Shipped',
                'date' => $order->shipped_at,
                'completed' => in_array($order->status, ['shipped', 'delivered']),
            ],
            [
                'status' => 'delivered',
                'label' => 'Delivered',
                'date' => $order->delivered_at,
                'completed' => $order->status === 'delivered',
            ],
        ];

        return Inertia::render('Admin/Marketplace/Orders/Show', [
            'order' => $order,
            'timeline' => $timeline,
        ]);
    }

    /**
     * Update order status.
     */
    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,processing,shipped,delivered,cancelled,refunded',
            'notes' => 'nullable|string|max:1000',
            'tracking_number' => 'nullable|string|max:255',
        ]);

        $old_status = $order->status;

        // Update status with timestamp
        $updates = [
            'status' => $validated['status'],
            'admin_notes' => $validated['notes'] ?? $order->admin_notes,
        ];

        // Add tracking number if provided
        if (isset($validated['tracking_number'])) {
            $updates['tracking_number'] = $validated['tracking_number'];
        }

        // Set appropriate timestamp based on status
        switch ($validated['status']) {
            case 'confirmed':
                $updates['confirmed_at'] = now();
                break;
            case 'processing':
                $updates['processing_at'] = now();
                break;
            case 'shipped':
                $updates['shipped_at'] = now();
                break;
            case 'delivered':
                $updates['delivered_at'] = now();
                break;
            case 'cancelled':
                $updates['cancelled_at'] = now();
                break;
            case 'refunded':
                $updates['refunded_at'] = now();
                break;
        }

        $order->update($updates);

        // Handle inventory updates for cancelled/refunded orders
        if (in_array($validated['status'], ['cancelled', 'refunded']) && !in_array($old_status, ['cancelled', 'refunded'])) {
            $this->restoreInventory($order);
        }

        // Send notification to customer and vendor
        // TODO: Add notification logic

        return back()->with('success', 'Order status updated successfully.');
    }

    /**
     * Cancel an order.
     */
    public function cancel(Request $request, Order $order)
    {
        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        if (in_array($order->status, ['delivered', 'cancelled', 'refunded'])) {
            return back()->with('error', 'This order cannot be cancelled.');
        }

        $order->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $request->reason,
            'admin_notes' => $request->get('notes'),
        ]);

        // Restore inventory
        $this->restoreInventory($order);

        // Send notification
        // TODO: Add notification logic

        return back()->with('success', 'Order cancelled successfully.');
    }

    /**
     * Process refund for an order.
     */
    public function refund(Request $request, Order $order)
    {
        $request->validate([
            'refund_amount' => 'required|numeric|min:0|max:' . $order->total_amount,
            'reason' => 'required|string|max:1000',
        ]);

        if (!in_array($order->status, ['delivered', 'cancelled'])) {
            return back()->with('error', 'Refunds can only be processed for delivered or cancelled orders.');
        }

        $order->update([
            'status' => 'refunded',
            'refunded_at' => now(),
            'refund_amount' => $request->refund_amount,
            'refund_reason' => $request->reason,
            'admin_notes' => $request->get('notes'),
        ]);

        // If full refund and not already cancelled, restore inventory
        if ($request->refund_amount == $order->total_amount && $order->status !== 'cancelled') {
            $this->restoreInventory($order);
        }

        // Process actual refund through payment gateway
        // TODO: Add payment gateway refund logic

        // Send notification
        // TODO: Add notification logic

        return back()->with('success', 'Refund processed successfully.');
    }

    /**
     * Update order notes.
     */
    public function updateNotes(Request $request, Order $order)
    {
        $request->validate([
            'admin_notes' => 'nullable|string|max:2000',
        ]);

        $order->update([
            'admin_notes' => $request->admin_notes,
        ]);

        return back()->with('success', 'Order notes updated successfully.');
    }

    /**
     * Get order statistics for dashboard.
     */
    public function getStatistics()
    {
        $stats = [
            'total' => Order::count(),
            'pending' => Order::where('status', 'pending')->count(),
            'confirmed' => Order::where('status', 'confirmed')->count(),
            'processing' => Order::where('status', 'processing')->count(),
            'shipped' => Order::where('status', 'shipped')->count(),
            'delivered' => Order::where('status', 'delivered')->count(),
            'cancelled' => Order::where('status', 'cancelled')->count(),
            'refunded' => Order::where('status', 'refunded')->count(),
            'today' => Order::whereDate('created_at', today())->count(),
            'this_week' => Order::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'this_month' => Order::whereMonth('created_at', now()->month)->count(),
        ];

        // Revenue statistics
        $revenue = [
            'today' => Order::where('status', 'delivered')->whereDate('created_at', today())->sum('total_amount'),
            'this_week' => Order::where('status', 'delivered')->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->sum('total_amount'),
            'this_month' => Order::where('status', 'delivered')->whereMonth('created_at', now()->month)->sum('total_amount'),
            'this_year' => Order::where('status', 'delivered')->whereYear('created_at', now()->year)->sum('total_amount'),
        ];

        return response()->json([
            'orders' => $stats,
            'revenue' => $revenue,
        ]);
    }

    /**
     * Export orders to CSV.
     */
    public function export(Request $request)
    {
        $query = Order::with(['user', 'vendor']);

        // Apply same filters as index
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $orders = $query->get();

        $filename = 'orders_' . now()->format('Y-m-d_H-i-s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($orders) {
            $file = fopen('php://output', 'w');

            // CSV Headers
            fputcsv($file, [
                'Order Number', 'Customer', 'Vendor', 'Status', 'Total Amount',
                'Items Count', 'Created At', 'Updated At'
            ]);

            // Data rows
            foreach ($orders as $order) {
                fputcsv($file, [
                    $order->order_number,
                    $order->user->name,
                    $order->vendor->business_name,
                    $order->status,
                    $order->total_amount,
                    $order->orderItems->count(),
                    $order->created_at->format('Y-m-d H:i:s'),
                    $order->updated_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Restore inventory for cancelled/refunded orders.
     */
    private function restoreInventory(Order $order)
    {
        foreach ($order->orderItems as $item) {
            $product = $item->product;
            $product->increment('stock_quantity', $item->quantity);
        }
    }
}
