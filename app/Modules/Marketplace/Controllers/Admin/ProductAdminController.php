<?php

namespace App\Modules\Marketplace\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Marketplace\Models\Product;
use App\Modules\Marketplace\Models\ProductImage;
use App\Modules\Marketplace\Models\Category;
use App\Modules\Marketplace\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
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

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
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
            'filters' => $request->only(['search', 'status', 'category', 'vendor', 'stock_status', 'date_from', 'date_to', 'sort_by', 'sort_direction']),
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
            'stock_remaining' => $product->stock_quantity,
        ];

        // Orders for this product (paginated)
        $orders = $product->orderItems()
            ->with(['order.user', 'order.vendor'])
            ->latest('created_at')
            ->paginate(10, ['*'], 'orders_page')
            ->through(function ($item) {
                return [
                    'id' => $item->id,
                    'order_id' => $item->order->id,
                    'order_number' => $item->order->order_number,
                    'buyer_name' => $item->order->user->name ?? 'N/A',
                    'buyer_email' => $item->order->user->email ?? 'N/A',
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'total_price' => $item->total_price,
                    'order_status' => $item->order->status,
                    'payment_status' => $item->order->payment_status,
                    'ordered_at' => $item->created_at->toDateTimeString(),
                ];
            });

        // Top buyers for this product
        $topBuyers = $product->orderItems()
            ->join('marketplace_orders', 'marketplace_order_items.order_id', '=', 'marketplace_orders.id')
            ->join('users', 'marketplace_orders.user_id', '=', 'users.id')
            ->selectRaw('users.id as user_id, users.name, users.email, SUM(marketplace_order_items.quantity) as total_qty, SUM(marketplace_order_items.total_price) as total_spent, COUNT(DISTINCT marketplace_orders.id) as order_count')
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderByDesc('total_spent')
            ->limit(10)
            ->get();

        // Revenue by month (last 6 months)
        $revenueByMonth = $product->orderItems()
            ->join('marketplace_orders', 'marketplace_order_items.order_id', '=', 'marketplace_orders.id')
            ->where('marketplace_orders.created_at', '>=', now()->subMonths(6))
            ->selectRaw("DATE_FORMAT(marketplace_orders.created_at, '%Y-%m') as month, SUM(marketplace_order_items.quantity) as units_sold, SUM(marketplace_order_items.total_price) as revenue")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Order status breakdown
        $orderStatusBreakdown = $product->orderItems()
            ->join('marketplace_orders', 'marketplace_order_items.order_id', '=', 'marketplace_orders.id')
            ->selectRaw('marketplace_orders.status, COUNT(*) as count, SUM(marketplace_order_items.quantity) as total_qty')
            ->groupBy('marketplace_orders.status')
            ->get();

        return Inertia::render('Admin/Marketplace/Products/Show', [
            'product' => $product,
            'stats' => $stats,
            'orders' => $orders,
            'topBuyers' => $topBuyers,
            'revenueByMonth' => $revenueByMonth,
            'orderStatusBreakdown' => $orderStatusBreakdown,
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
     * Show the form for creating a new product.
     */
    public function create()
    {
        $categories = Category::whereNull('parent_id')
            ->with('children')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $vendors = Vendor::where('status', 'approved')
            ->orderBy('business_name')
            ->get(['id', 'business_name']);

        return Inertia::render('Admin/Marketplace/Products/Create', [
            'categories' => $categories,
            'vendors' => $vendors,
        ]);
    }

    /**
     * Store a new product.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'vendor_id' => 'required|exists:marketplace_vendors,id',
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'category_ids' => 'required|array|min:1',
            'category_ids.*' => 'exists:marketplace_categories,id',
            'sku' => 'required|string|unique:marketplace_products,sku',
            'stock_quantity' => 'required|integer|min:0',
            'minimum_stock' => 'nullable|integer|min:0',
            'unit_of_measure' => 'required|string|in:kg,g,liter,ml,piece,box,bag,dozen,pack',
            'minimum_order_quantity' => 'nullable|integer|min:1',
            'maximum_order_quantity' => 'nullable|integer|gte:minimum_order_quantity',
            'is_negotiable' => 'nullable|boolean',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'meta_description' => 'nullable|string|max:160',
            'status' => 'required|in:draft,active,inactive',
            'is_featured' => 'nullable|boolean',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'video' => 'nullable|mimes:mp4,mov,ogg,qt|max:10240',
            'payment_methods' => 'nullable|array',
            'payment_methods.*' => 'string|in:online,cod',
            'shipping_option' => 'nullable|string|in:free,paid',
            'extra_fee' => 'nullable|numeric|min:0',
            'delivery_time' => 'nullable|string|max:255',
            'return_policy' => 'nullable|string',
            'additional_info' => 'nullable|string',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        $originalSlug = $validated['slug'];
        $counter = 1;
        while (Product::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug . '-' . $counter;
            $counter++;
        }

        $validated['category_id'] = $validated['category_ids'][0];
        $categoryIds = $validated['category_ids'];
        unset($validated['category_ids']);

        $imageFiles = $validated['images'] ?? [];
        unset($validated['images']);

        if ($request->hasFile('video')) {
            $videoPath = $request->file('video')->store('marketplace/products/videos/admin', 'public');
            $validated['video_path'] = $videoPath;
        }
        unset($validated['video']);

        $product = Product::create($validated);
        $product->categories()->sync($categoryIds);

        if ($imageFiles) {
            foreach ($imageFiles as $index => $image) {
                $path = $image->store('marketplace/products/' . $product->id, 'public');
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $path,
                    'alt_text' => $product->name . ' - Image ' . ($index + 1),
                    'sort_order' => $index + 1,
                    'is_primary' => $index == 0,
                ]);
            }
        }

        return redirect()->route('admin.marketplace.products.show', $product)
            ->with('success', 'Product created successfully.');
    }

    /**
     * Show the form for editing a product.
     */
    public function edit(Product $product)
    {
        $product->load(['vendor', 'category', 'images', 'categories']);

        $categories = Category::whereNull('parent_id')
            ->with('children')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $vendors = Vendor::where('status', 'approved')
            ->orderBy('business_name')
            ->get(['id', 'business_name']);

        return Inertia::render('Admin/Marketplace/Products/Edit', [
            'product' => $product,
            'categories' => $categories,
            'vendors' => $vendors,
        ]);
    }

    /**
     * Update the specified product.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'vendor_id' => 'required|exists:marketplace_vendors,id',
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'category_ids' => 'required|array|min:1',
            'category_ids.*' => 'exists:marketplace_categories,id',
            'sku' => 'required|string|unique:marketplace_products,sku,' . $product->id,
            'stock_quantity' => 'required|integer|min:0',
            'minimum_stock' => 'nullable|integer|min:0',
            'unit_of_measure' => 'required|string|in:kg,g,liter,ml,piece,box,bag,dozen,pack',
            'minimum_order_quantity' => 'nullable|integer|min:1',
            'maximum_order_quantity' => 'nullable|integer|gte:minimum_order_quantity',
            'is_negotiable' => 'nullable|boolean',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'meta_description' => 'nullable|string|max:160',
            'status' => 'required|in:draft,active,inactive',
            'is_featured' => 'nullable|boolean',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'remove_images' => 'nullable|array',
            'remove_images.*' => 'exists:marketplace_product_images,id',
            'video' => 'nullable|mimes:mp4,mov,ogg,qt|max:10240',
            'remove_video' => 'nullable|boolean',
            'payment_methods' => 'nullable|array',
            'payment_methods.*' => 'string|in:online,cod',
            'shipping_option' => 'nullable|string|in:free,paid',
            'extra_fee' => 'nullable|numeric|min:0',
            'delivery_time' => 'nullable|string|max:255',
            'return_policy' => 'nullable|string',
            'additional_info' => 'nullable|string',
        ]);

        // Update slug if name changed
        if ($validated['name'] != $product->name) {
            $validated['slug'] = Str::slug($validated['name']);
            $originalSlug = $validated['slug'];
            $counter = 1;
            while (Product::where('slug', $validated['slug'])->where('id', '!=', $product->id)->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        // Handle video removal
        if ($request->boolean('remove_video') && $product->video_path) {
            $relativePath = str_replace('/storage/', '', parse_url($product->video_path, PHP_URL_PATH) ?? '');
            if ($relativePath && Storage::disk('public')->exists($relativePath)) {
                Storage::disk('public')->delete($relativePath);
            }
            $validated['video_path'] = null;
        }

        // Handle new video upload
        if ($request->hasFile('video')) {
            if ($product->video_path) {
                $relativePath = str_replace('/storage/', '', parse_url($product->video_path, PHP_URL_PATH) ?? '');
                if ($relativePath && Storage::disk('public')->exists($relativePath)) {
                    Storage::disk('public')->delete($relativePath);
                }
            }
            $validated['video_path'] = $request->file('video')->store('marketplace/products/videos/admin', 'public');
        }
        unset($validated['video'], $validated['remove_video']);

        $validated['category_id'] = $validated['category_ids'][0];
        $categoryIds = $validated['category_ids'];
        unset($validated['category_ids']);

        $imageFiles = $validated['images'] ?? [];
        unset($validated['images']);
        $removeImages = $validated['remove_images'] ?? [];
        unset($validated['remove_images']);

        $product->update($validated);
        $product->categories()->sync($categoryIds);

        // Remove selected images
        if (!empty($removeImages)) {
            $imagesToRemove = ProductImage::whereIn('id', $removeImages)
                ->where('product_id', $product->id)
                ->get();
            foreach ($imagesToRemove as $image) {
                if ($image->image_path && Storage::disk('public')->exists($image->image_path)) {
                    Storage::disk('public')->delete($image->image_path);
                }
                $image->delete();
            }
        }

        // Upload new images
        if (!empty($imageFiles)) {
            $existingCount = $product->images()->count();
            foreach ($imageFiles as $index => $image) {
                $path = $image->store('marketplace/products/' . $product->id, 'public');
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $path,
                    'alt_text' => $product->name . ' - Image ' . ($existingCount + $index + 1),
                    'sort_order' => $existingCount + $index + 1,
                    'is_primary' => $product->images()->count() == 0 && $index == 0,
                ]);
            }
        }

        return redirect()->route('admin.marketplace.products.show', $product)
            ->with('success', 'Product updated successfully.');
    }

    /**
     * Delete the specified product.
     */
    public function destroy(Product $product)
    {
        // Check if product has orders
        if ($product->orderItems()->count() > 0) {
            return back()->with('error', 'Cannot delete product with existing orders.');
        }

        $product->delete();

        return redirect()->route('admin.marketplace.products.index')
            ->with('success', 'Product deleted successfully.');
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
