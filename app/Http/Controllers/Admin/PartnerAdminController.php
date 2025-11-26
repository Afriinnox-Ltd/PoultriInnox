<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PartnerOrder;
use App\Models\PartnerOrderItem;
use App\Models\PartnerOrderItemAllocation;
use App\Models\PartnerProfile;
use App\Modules\Marketplace\Models\Product;
use App\Modules\Marketplace\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PartnerAdminController extends Controller
{
    // ───────────────────── Partner Profiles ─────────────────────

    public function partnersIndex(Request $request)
    {
        $query = PartnerProfile::with('user')
            ->withCount('orders');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('business_name', 'like', "%$s%")
                  ->orWhere('city', 'like', "%$s%")
                  ->orWhereHas('user', fn ($u) => $u->where('email', 'like', "%$s%"));
            });
        }

        if ($request->filled('type')) {
            $query->where('partner_type', $request->type);
        }

        $partners = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Admin/Partners/Index', [
            'partners' => $partners,
            'filters'  => $request->only(['search', 'type']),
        ]);
    }

    public function partnerShow(PartnerProfile $partner)
    {
        $partner->load(['user', 'orders.items']);

        return Inertia::render('Admin/Partners/Show', [
            'partner' => $partner,
        ]);
    }

    public function partnerVerify(PartnerProfile $partner)
    {
        $partner->update(['is_verified' => !$partner->is_verified]);

        return back()->with('success', $partner->is_verified ? 'Partner verified.' : 'Partner unverified.');
    }

    public function partnerToggleActive(PartnerProfile $partner)
    {
        $partner->update(['is_active' => !$partner->is_active]);

        return back()->with('success', 'Partner status updated.');
    }

    // ───────────────────── Partner Orders ─────────────────────

    public function ordersIndex(Request $request)
    {
        $query = PartnerOrder::with(['partner.user', 'items'])
            ->latest();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('order_number', 'like', "%$s%")
                  ->orWhereHas('partner', fn ($p) => $p->where('business_name', 'like', "%$s%"));
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        $orders = $query->paginate(20)->withQueryString();

        $stats = [
            'total'      => PartnerOrder::count(),
            'pending'    => PartnerOrder::where('status', 'pending')->count(),
            'processing' => PartnerOrder::where('status', 'processing')->count(),
            'delivered'  => PartnerOrder::where('status', 'delivered')->count(),
            'unpaid'     => PartnerOrder::where('payment_status', 'pending')->count(),
        ];

        return Inertia::render('Admin/Partners/Orders/Index', [
            'orders'  => $orders,
            'stats'   => $stats,
            'filters' => $request->only(['search', 'status', 'payment_status']),
        ]);
    }

    public function orderShow(PartnerOrder $order)
    {
        $order->load(['partner.user', 'items.product.images', 'items.vendor', 'items.allocations.vendor']);

        $vendors = Vendor::where('is_active', true)
            ->select('id', 'business_name')
            ->get();

        $products = Product::where('status', 'active')
            ->select('id', 'name', 'price', 'unit_of_measure', 'vendor_id', 'stock_quantity')
            ->with('vendor:id,business_name')
            ->get();

        // Stock per vendor (grouped by vendor_id: sum of stock_quantity across their products)
        $vendorStock = Product::where('status', 'active')
            ->selectRaw('vendor_id, SUM(stock_quantity) as total_stock')
            ->groupBy('vendor_id')
            ->pluck('total_stock', 'vendor_id');

        return Inertia::render('Admin/Partners/Orders/Show', [
            'order'       => $order,
            'vendors'     => $vendors,
            'products'    => $products,
            'vendorStock' => $vendorStock,
        ]);
    }

    public function orderUpdateStatus(Request $request, PartnerOrder $order)
    {
        $validated = $request->validate([
            'status'                   => 'required|in:pending,reviewing,confirmed,processing,shipped,delivered,cancelled',
            'admin_notes'              => 'nullable|string|max:1000',
            'delivery_tracking_number' => 'nullable|string|max:255',
        ]);

        $timestamps = [];
        if ($validated['status'] === 'confirmed' && !$order->confirmed_at) {
            $timestamps['confirmed_at'] = now();
        }
        if ($validated['status'] === 'shipped' && !$order->shipped_at) {
            $timestamps['shipped_at'] = now();
        }
        if ($validated['status'] === 'delivered' && !$order->delivered_at) {
            $timestamps['delivered_at'] = now();
        }
        if ($validated['status'] === 'cancelled' && !$order->cancelled_at) {
            $timestamps['cancelled_at'] = now();
        }

        // Deduct stock from allocated products when order moves to 'processing'
        if ($validated['status'] === 'processing' && $order->status !== 'processing') {
            $order->load('items.allocations');
            DB::transaction(function () use ($order) {
                foreach ($order->items as $item) {
                    foreach ($item->allocations as $alloc) {
                        // Prefer the specific product saved on the allocation; fall back to item product
                        $productId = $alloc->product_id ?? $item->product_id;
                        if ($productId) {
                            Product::where('id', $productId)
                                ->decrement('stock_quantity', max(0, (float) $alloc->quantity));
                        }
                    }
                    // If no allocations, deduct from item's product directly
                    if ($item->allocations->isEmpty() && $item->product_id) {
                        Product::where('id', $item->product_id)
                            ->decrement('stock_quantity', max(0, (float) $item->quantity));
                    }
                }
            });
        }

        $order->update(array_merge($validated, $timestamps));

        return back()->with('success', 'Order status updated.');
    }

    public function orderUpdatePayment(Request $request, PartnerOrder $order)
    {
        $validated = $request->validate([
            'payment_status'        => 'required|in:pending,partial,paid,refunded',
            'total_amount'          => 'nullable|numeric|min:0',
            'payment_due_date'      => 'nullable|date',
            'payment_reminder_days' => 'nullable|integer|min:1|max:365',
        ]);

        if ($validated['payment_status'] === 'paid' && !$order->paid_at) {
            $validated['paid_at'] = now();
        }

        $order->update($validated);

        return back()->with('success', 'Payment status updated.');
    }

    public function orderUpdateItems(Request $request, PartnerOrder $order)
    {
        $validated = $request->validate([
            'items'                  => 'required|array|min:1',
            'items.*.id'             => 'nullable|exists:partner_order_items,id',
            'items.*.product_id'     => 'nullable|exists:marketplace_products,id',
            'items.*.vendor_id'      => 'nullable|exists:marketplace_vendors,id',
            'items.*.product_name'   => 'required|string|max:255',
            'items.*.description'    => 'nullable|string|max:500',
            'items.*.quantity'       => 'required|numeric|min:0.01',
            'items.*.unit'           => 'required|string|max:30',
            'items.*.unit_price'     => 'nullable|numeric|min:0',
            'items.*.vendor_payout'  => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated, $order) {
            $submittedIds = collect($validated['items'])->pluck('id')->filter()->values();

            // Delete removed items
            $order->items()->whereNotIn('id', $submittedIds)->delete();

            $total = 0;
            foreach ($validated['items'] as $itemData) {
                $unitPrice   = $itemData['unit_price'] ?? 0;
                $totalPrice  = $unitPrice * $itemData['quantity'];
                $total      += $totalPrice;

                $payload = [
                    'product_id'    => $itemData['product_id'] ?? null,
                    'vendor_id'     => $itemData['vendor_id'] ?? null,
                    'product_name'  => $itemData['product_name'],
                    'description'   => $itemData['description'] ?? null,
                    'quantity'      => $itemData['quantity'],
                    'unit'          => $itemData['unit'],
                    'unit_price'    => $unitPrice ?: null,
                    'total_price'   => $totalPrice ?: null,
                    'vendor_payout' => $itemData['vendor_payout'] ?? null,
                ];

                if (!empty($itemData['id'])) {
                    $order->items()->where('id', $itemData['id'])->update($payload);
                } else {
                    $order->items()->create($payload);
                }
            }

            $order->update(['total_amount' => $total ?: $order->total_amount]);
        });

        return back()->with('success', 'Order items updated.');
    }

    public function markVendorPaid(Request $request, PartnerOrder $order, PartnerOrderItem $item)
    {
        if ($item->partner_order_id !== $order->id) {
            abort(404);
        }

        $item->update([
            'vendor_paid'    => true,
            'vendor_paid_at' => now(),
        ]);

        return back()->with('success', 'Vendor marked as paid for this item.');
    }

    public function orderUpdateItemAllocations(Request $request, PartnerOrder $order, PartnerOrderItem $item)
    {
        if ($item->partner_order_id !== $order->id) {
            abort(404);
        }

        $validated = $request->validate([
            'allocations'                  => 'required|array',
            'allocations.*.id'             => 'nullable|exists:partner_order_item_allocations,id',
            'allocations.*.vendor_id'      => 'required|exists:marketplace_vendors,id',
            'allocations.*.product_id'     => 'nullable|exists:marketplace_products,id',
            'allocations.*.quantity'       => 'required|numeric|min:0.01',
            'allocations.*.unit_price'     => 'nullable|numeric|min:0',
            'allocations.*.vendor_payout'  => 'nullable|numeric|min:0',
            'allocations.*.notes'          => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($validated, $item) {
            $submittedIds = collect($validated['allocations'])->pluck('id')->filter()->values();
            $item->allocations()->whereNotIn('id', $submittedIds)->delete();

            foreach ($validated['allocations'] as $alloc) {
                $payload = [
                    'vendor_id'     => $alloc['vendor_id'],
                    'product_id'    => $alloc['product_id'] ?? null,
                    'quantity'      => $alloc['quantity'],
                    'unit_price'    => $alloc['unit_price'] ?? null,
                    'vendor_payout' => $alloc['vendor_payout'] ?? null,
                    'notes'         => $alloc['notes'] ?? null,
                ];

                if (!empty($alloc['id'])) {
                    $item->allocations()->where('id', $alloc['id'])->update($payload);
                } else {
                    $item->allocations()->create($payload);
                }
            }
        });

        return back()->with('success', 'Allocations saved.');
    }

    public function markAllocationVendorPaid(Request $request, PartnerOrder $order, PartnerOrderItemAllocation $allocation)
    {
        if ($allocation->item->partner_order_id !== $order->id) {
            abort(403);
        }

        $allocation->update([
            'vendor_paid'    => true,
            'vendor_paid_at' => now(),
        ]);

        return back()->with('success', 'Vendor marked as paid for this allocation.');
    }

    public function vendorPayoutSummary()    {
        $items = PartnerOrderItem::with(['vendor', 'order.partner'])
            ->whereNotNull('vendor_id')
            ->whereNotNull('vendor_payout')
            ->latest()
            ->get()
            ->groupBy('vendor_id');

        $summary = $items->map(function ($vendorItems) {
            $first = $vendorItems->first();
            return [
                'vendor'       => $first->vendor,
                'total_payout' => $vendorItems->sum('vendor_payout'),
                'unpaid'       => $vendorItems->where('vendor_paid', false)->sum('vendor_payout'),
                'items'        => $vendorItems->values(),
            ];
        })->values();

        return Inertia::render('Admin/Partners/VendorPayouts', [
            'summary' => $summary,
        ]);
    }
}
