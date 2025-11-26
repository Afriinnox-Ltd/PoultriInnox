<?php

namespace App\Modules\FeedManagement\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\FeedManagement\Models\FeedInventory;
use App\Modules\FeedManagement\Models\FeedType;
use App\Modules\FeedManagement\Models\FeedSupplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FeedInventoryController extends Controller
{
    /**
     * Display feed inventory
     */
    public function index(Request $request)
    {
        $search = $request->input('batch_number');

        $inventory = FeedInventory::with(['feedType', 'supplier'])
            ->when($search, function ($query, $search) {
                $query->where('batch_number', 'like', "%{$search}%");
            })
            ->orderBy('quantity', 'asc')
            ->get()
            ->map(function ($item) {
                // Add formatted dates
                $item->formatted_expiry_date = $item->formatted_expiry_date;
                $item->formatted_received_date = $item->formatted_received_date;
                $item->formatted_production_date = $item->formatted_production_date;
                return $item;
            });

        $feedTypes = FeedType::all();
        $suppliers = FeedSupplier::where('status', 'active')->get();

        // Get available batch numbers from existing inventory
        $availableBatchNumbers = FeedInventory::select('batch_number')
            ->distinct()
            ->whereNotNull('batch_number')
            ->orderBy('batch_number')
            ->pluck('batch_number')
            ->toArray();

        // Calculate inventory statistics
        $stats = [
            'total_items' => $inventory->count(),
            'low_stock_items' => $inventory->filter(function ($item) {
                return $item->quantity <= ($item->reorder_point ?? 0);
            })->count(),
            'total_value' => $inventory->sum(function ($item) {
                return $item->quantity * $item->cost_per_unit;
            }),
            'expiring_soon' => $inventory->filter(function ($item) {
                return $item->expiry_date && $item->expiry_date <= now()->addDays(7);
            })->count(),
        ];

        return Inertia::render('modules/feed-management/inventory/index', [
            'inventory' => $inventory,
            'feedTypes' => $feedTypes,
            'suppliers' => $suppliers,
            'availableBatchNumbers' => $availableBatchNumbers,
            'stats' => $stats,
        ]);
    }

    /**
     * Store new inventory item
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'feed_type_id' => 'required|exists:feed_types,id',
            'supplier_id' => 'required|exists:feed_suppliers,id',
            'batch_number' => 'required|string|max:255',
            'internal_code' => 'nullable|string|max:255',
            'quantity' => 'required|numeric|min:0',
            'cost_per_unit' => 'required|numeric|min:0',
            'received_date' => 'required|date',
            'production_date' => 'nullable|date',
            'expiry_date' => 'required|date|after:received_date',
            'storage_location' => 'required|string|max:255',
            'warehouse_section' => 'nullable|string|max:255',
            'reorder_point' => 'nullable|numeric|min:0',
            'quality_notes' => 'nullable|string'
        ]);

        // Calculate additional fields
        $validated['original_quantity'] = $validated['quantity'];
        $validated['total_cost'] = $validated['quantity'] * $validated['cost_per_unit'];
        $validated['currency'] = 'RWF';
        $validated['received_by'] = Auth::id();
        $validated['quality_approved'] = true;
        $validated['status'] = 'available';

        FeedInventory::create($validated);

        return redirect()->back()->with('success', 'Feed inventory added successfully');
    }

    /**
     * Update inventory item
     */
    public function update(Request $request, FeedInventory $feedInventory)
    {
        $validated = $request->validate([
            'batch_number' => 'required|string|max:255',
            'internal_code' => 'nullable|string|max:255',
            'cost_per_unit' => 'required|numeric|min:0',
            'production_date' => 'nullable|date',
            'expiry_date' => 'required|date',
            'storage_location' => 'required|string|max:255',
            'warehouse_section' => 'nullable|string|max:255',
            'reorder_point' => 'nullable|numeric|min:0',
            'quality_notes' => 'nullable|string'
        ]);

        // Recalculate total cost if cost per unit changed
        if ($feedInventory->cost_per_unit != $validated['cost_per_unit']) {
            $validated['total_cost'] = $feedInventory->quantity * $validated['cost_per_unit'];
        }

        $validated['updated_by'] = Auth::id();

        $feedInventory->update($validated);

        return redirect()->back()->with('success', 'Feed inventory updated successfully');
    }

    /**
     * Delete inventory item
     */
    public function destroy(FeedInventory $feedInventory)
    {
        $feedInventory->delete();

        return redirect()->back()->with('success', 'Feed inventory deleted successfully');
    }

    /**
     * Adjust stock quantity
     */
    public function adjustStock(Request $request, FeedInventory $feedInventory)
    {
        $validated = $request->validate([
            'adjustment_type' => 'required|in:add,subtract',
            'quantity' => 'required|numeric|min:0.01',
            'reason' => 'required|string',
            'notes' => 'nullable|string'
        ]);

        DB::transaction(function () use ($feedInventory, $validated) {
            $oldQuantity = $feedInventory->quantity;

            if ($validated['adjustment_type']== 'add') {
                $newQuantity = $oldQuantity + $validated['quantity'];
            } else {
                $newQuantity = max(0, $oldQuantity - $validated['quantity']);
            }

            // Update inventory
            $feedInventory->update([
                'quantity' => $newQuantity,
                'updated_by' => Auth::id()
            ]);

            // Log the adjustment (you might want to create a separate model for this)
            // For now, we'll just add it to the notes
            $adjustmentLog = "Stock adjustment: {$validated['adjustment_type']} {$validated['quantity']} kg. Reason: {$validated['reason']}";
            if ($validated['notes']) {
                $adjustmentLog .= " Notes: {$validated['notes']}";
            }

            // You could create a StockAdjustment model to track these changes
        });

        return redirect()->back()->with('success', 'Stock adjustment completed successfully');
    }

    /**
     * Get low stock alerts
     */
    public function lowStockAlerts()
    {
        $lowStock = FeedInventory::with(['feedType', 'supplier'])
            ->whereRaw('quantity <= COALESCE(reorder_point, 0)')
            ->orderBy('quantity', 'asc')
            ->get();

        return response()->json($lowStock);
    }

    /**
     * Get expiring items
     */
    public function expiringItems()
    {
        $expiring = FeedInventory::with(['feedType', 'supplier'])
            ->where('expiry_date', '<=', now()->addDays(7))
            ->where('expiry_date', '>', now())
            ->orderBy('expiry_date', 'asc')
            ->get();

        return response()->json($expiring);
    }

    /**
     * Get available batch numbers for API
     */
    public function getBatchNumbers()
    {
        $batchNumbers = FeedInventory::select('batch_number')
            ->distinct()
            ->whereNotNull('batch_number')
            ->orderBy('batch_number')
            ->pluck('batch_number');

        return response()->json($batchNumbers);
    }
}
