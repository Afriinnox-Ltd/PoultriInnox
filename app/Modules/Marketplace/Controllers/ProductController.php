<?php

namespace App\Modules\Marketplace\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Marketplace\Models\Product;
use App\Modules\Marketplace\Models\Category;
use App\Modules\Marketplace\Models\Vendor;
use App\Modules\Marketplace\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of products.
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'vendor.user', 'images'])
            ->where('status', 'active');

        // Apply filters
        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        if ($request->filled('vendor')) {
            $query->where('vendor_id', $request->vendor);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($request->filled('price_min')) {
            $query->where('price', '>=', $request->price_min);
        }

        if ($request->filled('price_max')) {
            $query->where('price', '<=', $request->price_max);
        }

        if ($request->boolean('in_stock')) {
            $query->where('stock_quantity', '>', 0);
        }

        // Sort options
        $sortBy = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $products = $query->paginate(24);

        return Inertia::render('modules/marketplace/index', [
            'products' => $products,
            'categories' => Category::whereNull('parent_id')->with('children')->get(),
            'vendors' => Vendor::with('user')->where('status', 'approved')->get(),
            'filters' => $request->only(['category', 'vendor', 'search', 'price_min', 'price_max', 'in_stock']),
            'sort' => [
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
            ],
        ]);
    }

    /**
     * Display vendor's products for management.
     */
    public function vendorProducts(Request $request)
    {
        $vendor = Auth::user()->vendor;

        if (!$vendor) {
            return redirect()->route('marketplace.vendor.register')
                ->with('error', 'You need to register as a vendor first.');
        }

        $query = $vendor->products()->with(['category', 'images']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Sort options
        $sortBy = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $products = $query->paginate(12);

        // Get stats for the vendor
        $stats = [
            'total' => $vendor->products()->count(),
            'active' => $vendor->products()->where('status', 'active')->count(),
            'draft' => $vendor->products()->where('status', 'draft')->count(),
            'pending' => $vendor->products()->where('status', 'pending')->count(),
            'low_stock' => $vendor->products()->where('stock_quantity', '<=', 5)->where('status', 'active')->count(),
        ];

        return Inertia::render('modules/marketplace/vendor/products/index', [
            'products' => $products,
            'categories' => Category::whereNull('parent_id')->with('children')->get(),
            'stats' => $stats,
            'filters' => $request->only(['status', 'category', 'search', 'sort', 'direction']),
        ]);
    }

    /**
     * Show the form for creating a new product.
     */
    public function create()
    {
        $this->authorize('create', Product::class);

        return Inertia::render('modules/marketplace/vendor/products/create', [
            'categories' => Category::where('is_active', true)->whereNull('parent_id')->with('parent')->get(),
            'vendor' => Auth::user()->vendor
        ]);
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', Product::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:marketplace_categories,id',
            'sku' => 'required|string|unique:marketplace_products,sku',
            'stock_quantity' => 'required|integer|min:0',
            'minimum_order_quantity' => 'nullable|integer|min:1',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'meta_description' => 'nullable|string|max:160',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $vendor = Auth::user()->vendor;
        if (!$vendor) {
            return redirect()->back()->withErrors(['vendor' => 'You must be a registered vendor to create products.']);
        }

        // Convert tags array to JSON string for storage
        if (isset($validated['tags']) && is_array($validated['tags'])) {
            $validated['tags'] = json_encode($validated['tags']);
        }

        $validated['vendor_id'] = $vendor->id;
        $validated['slug'] = Str::slug($validated['name']);
        $validated['status'] = 'draft'; // Default status for new products

        // Ensure slug is unique
        $originalSlug = $validated['slug'];
        $counter = 1;
        while (Product::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug . '-' . $counter;
            $counter++;
        }

        // Remove images from validated data before creating product
        $imageFiles = $validated['images'] ?? [];
        unset($validated['images']);

        $product = Product::create($validated);

        // Handle image uploads
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('marketplace/products/' . $product->id, 'public');
                $fullUrl = Storage::url($path);

                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $fullUrl,
                    'alt_text' => $product->name . ' - Image ' . ($index + 1),
                    'sort_order' => $index + 1,
                    'is_primary' => $index === 0
                ]);
            }
        }

        return redirect()->route('marketplace.vendor.products.index')
            ->with('success', 'Product created successfully!');
    }

    /**
     * Display the specified product.
     */
    public function show(Product $product)
    {
        $product->load([
            'category.parent',
            'vendor.user',
            'images' => function ($query) {
                $query->orderBy('sort_order');
            },
            'reviews.user'
        ]);

        // Get related products from same category
        $relatedProducts = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('status', 'active')
            ->with(['images', 'vendor.user'])
            ->limit(4)
            ->get();

        return Inertia::render('modules/marketplace/products/show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts
        ]);
    }

    /**
     * Show the form for editing the specified product.
     */
    public function edit(Product $product)
    {
        $this->authorize('update', $product);

        $product->load('images');

        return Inertia::render('modules/marketplace/vendor/products/edit', [
            'product' => $product,
            'categories' =>  Category::where('is_active', true)->whereNull('parent_id')->with('parent')->get()
        ]);
    }

    /**
     * Update the specified product in storage.
     */
    public function update(Request $request, Product $product)
    {
        $this->authorize('update', $product);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:marketplace_categories,id',
            'sku' => 'required|string|unique:marketplace_products,sku,' . $product->id,
            'stock_quantity' => 'required|integer|min:0',
            'min_order_quantity' => 'nullable|integer|min:1',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string',
            'is_digital' => 'boolean',
            'requires_shipping' => 'boolean',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'meta_description' => 'nullable|string|max:160',
            'status' => 'required|in:draft,active,inactive',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'remove_images' => 'nullable|array',
            'remove_images.*' => 'exists:marketplace_product_images,id'
        ]);

        // Update slug if name changed
        if ($validated['name'] !== $product->name) {
            $validated['slug'] = Str::slug($validated['name']);

            // Ensure slug is unique
            $originalSlug = $validated['slug'];
            $counter = 1;
            while (Product::where('slug', $validated['slug'])->where('id', '!=', $product->id)->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        // Convert tags array to JSON string for storage
        if (isset($validated['tags']) && is_array($validated['tags'])) {
            $validated['tags'] = json_encode($validated['tags']);
        }

        $product->update($validated);

        // Handle image removal
        if ($request->filled('remove_images')) {
            $imagesToRemove = ProductImage::whereIn('id', $request->remove_images)
                ->where('product_id', $product->id)
                ->get();

            foreach ($imagesToRemove as $image) {
                // Delete file from storage - convert URL back to path
                if ($image->image_path) {
                    $relativePath = str_replace('/storage/', '', $image->image_path);
                    if (Storage::disk('public')->exists($relativePath)) {
                        Storage::disk('public')->delete($relativePath);
                    }
                }
                $image->delete();
            }
        }

        // Handle new image uploads
        if ($request->hasFile('images')) {
            $existingImagesCount = $product->images()->count();

            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('marketplace/products/' . $product->id, 'public');
                $fullUrl = Storage::url($path);

                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $fullUrl,
                    'alt_text' => $product->name . ' - Image ' . ($existingImagesCount + $index + 1),
                    'sort_order' => $existingImagesCount + $index + 1,
                    'is_primary' => $product->images()->count() === 0 && $index === 0
                ]);
            }
        }

        return redirect()->route('marketplace.vendor.products.edit', $product)
            ->with('success', 'Product updated successfully!');
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(Product $product)
    {
        $this->authorize('delete', $product);

        // Delete all associated images
        foreach ($product->images as $image) {
            if ($image->image_path) {
                $relativePath = str_replace('/storage/', '', $image->image_path);
                if (Storage::disk('public')->exists($relativePath)) {
                    Storage::disk('public')->delete($relativePath);
                }
            }
        }

        $product->delete();

        return redirect()->route('marketplace.products.index')
            ->with('success', 'Product deleted successfully!');
    }

    /**
     * Toggle product status between active and inactive.
     */
    public function toggleStatus(Product $product)
    {
        $this->authorize('update', $product);

        $newStatus = $product->status === 'active' ? 'inactive' : 'active';
        $product->update(['status' => $newStatus]);

        return redirect()->back()
            ->with('success', "Product status updated to {$newStatus}!");
    }

    /**
     * Duplicate a product.
     */
    public function duplicate(Product $product)
    {
        $this->authorize('create', Product::class);

        $newProduct = $product->replicate();
        $newProduct->name = $product->name . ' (Copy)';
        $newProduct->slug = Str::slug($newProduct->name);
        $newProduct->sku = $product->sku . '-copy';
        $newProduct->status = 'draft';

        // Ensure unique slug and SKU
        $originalSlug = $newProduct->slug;
        $originalSku = $newProduct->sku;
        $counter = 1;

        while (Product::where('slug', $newProduct->slug)->exists()) {
            $newProduct->slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        $counter = 1;
        while (Product::where('sku', $newProduct->sku)->exists()) {
            $newProduct->sku = $originalSku . '-' . $counter;
            $counter++;
        }

        $newProduct->save();

        // Duplicate images
        foreach ($product->images as $image) {
            ProductImage::create([
                'product_id' => $newProduct->id,
                'image_path' => $image->image_path,
                'alt_text' => str_replace($product->name, $newProduct->name, $image->alt_text),
                'sort_order' => $image->sort_order,
                'is_primary' => $image->is_primary
            ]);
        }

        return redirect()->route('marketplace.vendor.products.edit', $newProduct)
            ->with('success', 'Product duplicated successfully!');
    }

    /**
     * Display a public listing of products (no authentication required).
     */
    public function publicIndex(Request $request)
    {
        $query = Product::with(['category', 'vendor.user', 'images'])
            ->where('status', 'active');

        // Apply filters
        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        if ($request->filled('vendor')) {
            $query->where('vendor_id', $request->vendor);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($request->filled('price_min')) {
            $query->where('price', '>=', $request->price_min);
        }

        if ($request->filled('price_max')) {
            $query->where('price', '<=', $request->price_max);
        }

        if ($request->boolean('in_stock')) {
            $query->where('stock_quantity', '>', 0);
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        $allowedSorts = ['name', 'price', 'created_at', 'stock_quantity'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection);
        }

        $products = $query->paginate(12);

        // Get categories and vendors for filters
        $categories = Category::where('status', 'active')->orderBy('name')->get();
        $vendors = Vendor::with('user')
            ->where('status', 'approved')
            ->whereHas('user', function ($q) {
                $q->where('is_verified', true);
            })
            ->orderBy('business_name')
            ->get();

        return Inertia::render('Public/Marketplace/Index', [
            'products' => $products,
            'categories' => $categories,
            'vendors' => $vendors,
            'filters' => $request->only(['category', 'vendor', 'search', 'price_min', 'price_max', 'in_stock']),
            'sort' => [
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
            ],
        ]);
    }

    /**
     * Display a public product detail page (no authentication required).
     */
    public function publicShow(Product $product)
    {
        $product->load(['category', 'vendor.user', 'images']);

        // Only show active products
        if ($product->status !== 'active') {
            abort(404);
        }

        // Get related products from same category
        $relatedProducts = Product::with(['images', 'vendor.user'])
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('status', 'active')
            ->limit(4)
            ->get();

        return Inertia::render('Public/Marketplace/ProductShow', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
            'requiresAuth' => true, // Signal to frontend that purchasing requires auth
        ]);
    }
}
