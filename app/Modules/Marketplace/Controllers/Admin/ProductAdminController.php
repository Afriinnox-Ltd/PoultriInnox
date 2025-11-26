<?php

namespace App\Modules\Marketplace\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Marketplace\Models\Product;
use App\Modules\Marketplace\Models\Category;
use App\Modules\Marketplace\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Mail\Marketplace\ProductApproved;
use App\Mail\Marketplace\ProductRejected;

class ProductAdminController extends Controller
{
    /**
     * Display a listing of products.
     */
    public function index(Request $request)
    {
        $query = Product::with(['vendor', 'category'])->withCount('orderItems');

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%')
                  ->orWhere('sku', 'like', '%' . $search . '%')
                  ->orWhereHas('vendor', function($vendorQuery) use ($search) {
                      $vendorQuery->where('business_name', 'like', '%' . $search . '%');
                  });
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status != '') {
            $query->where('status', $request->status);
        }

        // Filter by category
        if ($request->has('category') && $request->category != '') {
            $query->where('category_id', $request->category);
        }

        // Filter by vendor
        if ($request->has('vendor') && $request->vendor != '') {
            $query->where('vendor_id', $request->vendor);
        }

        // Filter by stock status
        if ($request->has('stock_status') && $request->stock_status != '') {
            switch ($request->stock_status) {
                case 'in_stock':
                    $query->where('stock_quantity', '>', 0);
                    break;
                case 'low_stock':
                    $query->where('stock_quantity', '>', 0)->where('stock_quantity', '<=', 10);
                    break;
                case 'out_of_stock':
                    $query->where('stock_quantity', 0);
                    break;
            }
        }

        // Sort
        $sort_by = $request->get('sort_by', 'created_at');
        $sort_direction = $request->get('sort_direction', 'desc');
        $query->orderBy($sort_by, $sort_direction);

        $products = $query->paginate(15);

        // Get filter options
        $categories = Category::where('is_active', true)->orderBy('name')->get(['id', 'name']);
        $vendors = Vendor::where('status', 'approved')->orderBy('business_name')->get(['id', 'business_name']);

        return Inertia::render('Admin/Marketplace/Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'vendors' => $vendors,
            'filters' => $request->only(['search', 'status', 'category', 'vendor', 'stock_status', 'sort_by', 'sort_direction']),
            'status_options' => [
                'active' => 'Active',
                'inactive' => 'Inactive',
                'pending' => 'Pending',
                'rejected' => 'Rejected',
            ],
            'stock_status_options' => [
                'in_stock' => 'In Stock',
                'low_stock' => 'Low Stock',
                'out_of_stock' => 'Out of Stock',
            ],
        ]);
    }

    /**
     * Display the specified product.
     */
    public function show(Product $product)
    {
        $product->load([
            'vendor.user',
            'category',
            'images',
            'orderItems.order.user',
            'reviews.user'
        ]);

        // Calculate product statistics
        $stats = [
            'total_orders' => $product->orderItems()->count(),
            'total_sold' => $product->orderItems()->sum('quantity'),
            'total_revenue' => $product->orderItems()->sum('total_price'),
            'average_rating' => $product->reviews()->avg('rating') ?? 0,
            'total_reviews' => $product->reviews()->count(),
            'stock_status' => $this->getStockStatus($product->stock_quantity),
        ];

        return Inertia::render('Admin/Marketplace/Products/Show', [
            'product' => $product,
            'stats' => $stats,
        ]);
    }

    /**
     * Approve a product.
     */
    public function approve(Request $request, Product $product)
    {
        $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        $product->update([
            'status' => 'active',
            'approved_at' => now(),
            'admin_notes' => $request->notes,
        ]);

        // Send approval email to vendor
        try {
            if ($product->vendor && $product->vendor->business_email) {
                Mail::to($product->vendor->business_email)->send(new ProductApproved($product));
            }
        } catch (\Exception $e) {
            Log::error('Failed to send product approval email', ['product_id' => $product->id, 'error' => $e->getMessage()]);
        }

        return back()->with('success', 'Product approved successfully.');
    }

    /**
     * Reject a product.
     */
    public function reject(Request $request, Product $product)
    {
        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $product->update([
            'status' => 'rejected',
            'rejection_reason' => $request->reason,
            'admin_notes' => $request->get('notes'),
        ]);

        // Send rejection email to vendor
        try {
            if ($product->vendor && $product->vendor->business_email) {
                Mail::to($product->vendor->business_email)->send(new ProductRejected($product, $request->reason));
            }
        } catch (\Exception $e) {
            Log::error('Failed to send product rejection email', ['product_id' => $product->id, 'error' => $e->getMessage()]);
        }

        return back()->with('success', 'Product rejected successfully.');
    }

    /**
     * Toggle product status.
     */
    public function toggleStatus(Product $product)
    {
        $new_status = $product->status== 'active' ? 'inactive' : 'active';

        $product->update([
            'status' => $new_status,
        ]);

        $status = $new_status== 'active' ? 'activated' : 'deactivated';

        return back()->with('success', "Product {$status} successfully.");
    }

    /**
     * Feature/unfeature a product.
     */
    public function toggleFeatured(Product $product)
    {
        $product->update([
            'is_featured' => !$product->is_featured,
        ]);

        $status = $product->is_featured ? 'featured' : 'unfeatured';

        return back()->with('success', "Product {$status} successfully.");
    }

    /**
     * Update product admin notes.
     */
    public function updateNotes(Request $request, Product $product)
    {
        $request->validate([
            'admin_notes' => 'nullable|string|max:2000',
        ]);

        $product->update([
            'admin_notes' => $request->admin_notes,
        ]);

        return back()->with('success', 'Admin notes updated successfully.');
    }

    /**
     * Update product priority/sort order.
     */
    public function updatePriority(Request $request, Product $product)
    {
        $request->validate([
            'priority' => 'required|integer|min:0|max:100',
        ]);

        $product->update([
            'priority' => $request->priority,
        ]);

        return back()->with('success', 'Product priority updated successfully.');
    }

    /**
     * Bulk actions for products.
     */
    public function bulkAction(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|in:approve,reject,activate,deactivate,feature,unfeature,delete',
            'product_ids' => 'required|array|min:1',
            'product_ids.*' => 'exists:marketplace_products,id',
            'reason' => 'required_if:action,reject|string|max:1000',
            'notes' => 'nullable|string|max:1000',
        ]);

        $products = Product::whereIn('id', $validated['product_ids']);

        switch ($validated['action']) {
            case 'approve':
                $products->update([
                    'status' => 'active',
                    'approved_at' => now(),
                    'admin_notes' => $validated['notes'] ?? null,
                ]);
                // Send bulk approval emails
                foreach ($products->get() as $product) {
                    try {
                        if ($product->vendor && $product->vendor->business_email) {
                            Mail::to($product->vendor->business_email)->send(new ProductApproved($product));
                        }
                    } catch (\Exception $e) {
                        Log::error('Failed to send bulk product approval email', ['product_id' => $product->id, 'error' => $e->getMessage()]);
                    }
                }
                $message = 'Products approved successfully.';
                break;

            case 'reject':
                $products->update([
                    'status' => 'rejected',
                    'rejection_reason' => $validated['reason'],
                    'admin_notes' => $validated['notes'] ?? null,
                ]);
                // Send bulk rejection emails
                foreach ($products->get() as $product) {
                    try {
                        if ($product->vendor && $product->vendor->business_email) {
                            Mail::to($product->vendor->business_email)->send(new ProductRejected($product, $validated['reason']));
                        }
                    } catch (\Exception $e) {
                        Log::error('Failed to send bulk product rejection email', ['product_id' => $product->id, 'error' => $e->getMessage()]);
                    }
                }
                $message = 'Products rejected successfully.';
                break;

            case 'activate':
                $products->update(['status' => 'active']);
                $message = 'Products activated successfully.';
                break;

            case 'deactivate':
                $products->update(['status' => 'inactive']);
                $message = 'Products deactivated successfully.';
                break;

            case 'feature':
                $products->update(['is_featured' => true]);
                $message = 'Products featured successfully.';
                break;

            case 'unfeature':
                $products->update(['is_featured' => false]);
                $message = 'Products unfeatured successfully.';
                break;

            case 'delete':
                // Check if any product has orders
                $products_with_orders = $products->withCount('orderItems')->get();
                $cannot_delete = $products_with_orders->filter(function($product) {
                    return $product->order_items_count > 0;
                });

                if ($cannot_delete->count() > 0) {
                    return back()->with('error', 'Some products cannot be deleted because they have orders.');
                }

                $products->delete();
                $message = 'Products deleted successfully.';
                break;
        }

        // TODO: Send bulk notifications to vendors

        return back()->with('success', $message);
    }

    /**
     * Get product statistics for dashboard.
     */
    public function getStatistics()
    {
        $stats = [
            'total' => Product::count(),
            'active' => Product::where('status', 'active')->count(),
            'pending' => Product::where('status', 'pending')->count(),
            'rejected' => Product::where('status', 'rejected')->count(),
            'inactive' => Product::where('status', 'inactive')->count(),
            'featured' => Product::where('is_featured', true)->count(),
            'out_of_stock' => Product::where('stock_quantity', 0)->count(),
            'low_stock' => Product::where('stock_quantity', '>', 0)->where('stock_quantity', '<=', 10)->count(),
            'this_month' => Product::whereMonth('created_at', now()->month)->count(),
            'this_week' => Product::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Get stock status label.
     */
    private function getStockStatus($quantity)
    {
        if ($quantity == 0) {
            return 'Out of Stock';
        } elseif ($quantity <= 10) {
            return 'Low Stock';
        } else {
            return 'In Stock';
        }
    }
}
