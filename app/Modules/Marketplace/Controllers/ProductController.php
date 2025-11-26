<?php

namespace App\Modules\Marketplace\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Marketplace\Models\Category;
use App\Modules\Marketplace\Models\Product;
use App\Modules\Marketplace\Models\ProductImage;
use App\Modules\Marketplace\Models\Vendor;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

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

        if (! $vendor) {
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

        // Get subscription data for layout
        $currentSubscription = null;
        $subscriptionUsage = null;
        $needsUpgrade = false;

        try {
            $currentSubscription = $vendor->subscriptions()->where('is_active', true)->first();

            if ($currentSubscription) {
                $productCount = $vendor->products()->count();

                $subscriptionUsage = [
                    'products_used' => $productCount,
                    'products_limit' => $currentSubscription->product_limit,
                    'can_create_more' => $currentSubscription->product_limit ?
                        ($productCount < $currentSubscription->product_limit) : true,
                    'plan_name' => $currentSubscription->plan_name,
                    'allows_cod' => $currentSubscription->allow_cod,
                    'usage_percentage' => [
                        'products' => $currentSubscription->product_limit ?
                            min(100, ($productCount / $currentSubscription->product_limit) * 100) : 0,
                    ],
                ];

                $needsUpgrade = ($currentSubscription->product_limit &&
                    $productCount >= $currentSubscription->product_limit * 0.9) ||
                    ($currentSubscription->daysRemaining() != null && $currentSubscription->daysRemaining() <= 7);
            } else {
                // No subscription - disable all product creation
                $subscriptionUsage = [
                    'products_used' => $vendor->products()->count(),
                    'products_limit' => 0,
                    'can_create_more' => false,
                    'plan_name' => 'No Active Plan',
                    'allows_cod' => false,
                    'usage_percentage' => [
                        'products' => 0,
                    ],
                ];
                $needsUpgrade = true;
            }
        } catch (\Exception $e) {
            \Log::warning('Could not load vendor subscription: '.$e->getMessage());
            $needsUpgrade = true;
        }

        // Get marketplace settings for earnings calculations
        \App\Models\MarketplaceSetting::clearCache();
        $marketplaceSettings = \App\Models\MarketplaceSetting::getAllGrouped();

        // Helper function to get setting value by key from a group
        $getSetting = function ($group, $key, $default = null) use ($marketplaceSettings) {
            if (! isset($marketplaceSettings[$group])) {
                return $default;
            }

            foreach ($marketplaceSettings[$group] as $setting) {
                if (isset($setting['key']) && $setting['key'] == $key) {
                    return $setting['value'] ?? $default;
                }
            }

            return $default;
        };

        // Format settings for frontend
        $formattedSettings = [
            'commission' => [
                'default_commission_rate' => (float) $getSetting('commission', 'default_commission_rate', 10),
                'commission_type' => $getSetting('commission', 'commission_type', 'percentage'),
            ],
            'general' => [
                'currency' => $getSetting('general', 'default_currency', 'RWF'),
                'currency_symbol' => $getSetting('general', 'currency_symbol', 'RWF'),
            ],
            'platform_fees' => [
                'platform_fee_rate' => (float) $getSetting('platform_fees', 'listing_fee', 0),
                'processing_fee' => (float) $getSetting('platform_fees', 'processing_fee', 0),
            ],
        ];

        return Inertia::render('modules/marketplace/vendor/products/index', [
            'products' => $products,
            'categories' => Category::whereNull('parent_id')
                ->where('is_active', true)
                ->with(['children' => function ($query) {
                    $query->where('is_active', true);
                }])
                ->get(),
            'stats' => $stats,
            'filters' => $request->only(['status', 'category', 'search', 'sort', 'direction']),
            'vendor' => $vendor,
            'currentSubscription' => $currentSubscription,
            'subscriptionUsage' => $subscriptionUsage,
            'needsUpgrade' => $needsUpgrade,
            'upgradeReason' => ! $currentSubscription ? 'no_subscription' : 'product_limit',
            'marketplaceSettings' => $formattedSettings,
        ]);
    }

    /**
     * Show the form for creating a new product.
     */
    public function create()
    {
        $this->authorize('create', Product::class);

        $vendor = Auth::user()->vendor;

        if (! $vendor) {
            return redirect()->route('marketplace.vendor.register')
                ->with('error', 'You need to register as a vendor first.');
        }

        // Check subscription product limit BEFORE showing the form
        $currentSubscription = $vendor->subscriptions()
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('end_date')
                    ->orWhere('end_date', '>', now());
            })
            ->first();

        if ($currentSubscription && $currentSubscription->product_limit != null) {
            $currentProductCount = $vendor->products()->count();

            if ($currentProductCount >= $currentSubscription->product_limit) {
                return redirect()->route('marketplace.vendor.products.index')
                    ->withErrors([
                        'message' => 'You have reached your product limit ('.$currentSubscription->product_limit.' products). Please upgrade your subscription to add more products.',
                    ]);
            }
        }

        $subscriptionUsage = null;
        $needsUpgrade = false;

        // Safely load subscription data for the form
        try {
            if ($currentSubscription) {
                $productCount = $vendor->products()->count();

                $subscriptionUsage = [
                    'products_used' => $productCount,
                    'products_limit' => $currentSubscription->product_limit,
                    'can_create_more' => $currentSubscription->product_limit ?
                        ($productCount < $currentSubscription->product_limit) : true,
                    'plan_name' => $currentSubscription->plan_name,
                    'allows_cod' => $currentSubscription->allow_cod,
                ];

                // Check if upgrade is needed
                $needsUpgrade = ($currentSubscription->product_limit &&
                    $productCount >= $currentSubscription->product_limit * 0.9) ||
                    ($currentSubscription->daysRemaining() != null && $currentSubscription->daysRemaining() <= 7);
            } else {
                // No subscription - disable product creation
                $subscriptionUsage = [
                    'products_used' => $vendor->products()->count(),
                    'products_limit' => 0,
                    'can_create_more' => false,
                    'plan_name' => 'No Active Plan',
                    'allows_cod' => false,
                ];
                $needsUpgrade = true;
            }
        } catch (\Exception $e) {
            // If subscription table doesn't exist or other DB issues, continue without it
            \Log::warning('Could not load vendor subscription: '.$e->getMessage());
            $subscriptionUsage = [
                'products_used' => $vendor->products()->count(),
                'products_limit' => 0,
                'can_create_more' => false,
                'plan_name' => 'No Active Plan',
                'allows_cod' => false,
            ];
            $needsUpgrade = true;
        }

        // Get marketplace settings for earnings calculations
        $marketplaceSettings = \App\Models\MarketplaceSetting::getAllGrouped();

        // Helper function to get setting value by key from a group
        $getSetting = function ($group, $key, $default = null) use ($marketplaceSettings) {
            if (! isset($marketplaceSettings[$group])) {
                return $default;
            }

            foreach ($marketplaceSettings[$group] as $setting) {
                if ($setting['key'] == $key) {
                    return $setting['value'];
                }
            }

            return $default;
        };

        // Format settings for frontend
        $formattedSettings = [
            'commission' => [
                'rate' => (float) $getSetting('commission', 'default_commission_rate', 10),
                'commission_type' => $getSetting('commission', 'commission_type', 'percentage'),
            ],
            'general' => [
                'default_currency' => $getSetting('general', 'default_currency', 'RWF'),
                'currency_symbol' => $getSetting('general', 'currency_symbol', 'RWF'),
            ],
            'platform_fees' => [
                'listing_fee' => (float) $getSetting('platform_fees', 'listing_fee', 0),
                'processing_fee' => (float) $getSetting('platform_fees', 'processing_fee', 0),
                'platform_fee_rate' => (float) $getSetting('platform_fees', 'platform_fee_rate', 0),
                'transaction_fee_rate' => (float) $getSetting('platform_fees', 'transaction_fee_rate', 0),
            ],
        ];

        return Inertia::render('modules/marketplace/vendor/products/create', [
            'categories' => Category::where('is_active', true)->whereNull('parent_id')->with('children')->get(),
            'vendor' => $vendor,
            'currentSubscription' => $currentSubscription,
            'subscriptionUsage' => $subscriptionUsage,
            'needsUpgrade' => $needsUpgrade,
            'upgradeReason' => ! $currentSubscription ? 'no_subscription' : 'product_limit',
            'marketplaceSettings' => $formattedSettings,
        ]);
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', Product::class);

        $vendor = Auth::user()->vendor;

        if (! $vendor) {
            return redirect()->back()->withErrors([
                'message' => 'You must be a registered vendor to create products.',
            ]);
        }

        // Check subscription product limit FIRST before any processing
        $allSubscriptions = $vendor->subscriptions()
            ->where('is_active', true)
            ->get();

        Log::info('All active subscriptions', [
            'vendor_id' => $vendor->id,
            'count' => $allSubscriptions->count(),
            'subscriptions' => $allSubscriptions->toArray(),
        ]);

        $currentSubscription = $vendor->subscriptions()
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('end_date')
                    ->orWhere('end_date', '>', now());
            })
            ->first();

        // Debug logging
        Log::info('Product creation attempt', [
            'vendor_id' => $vendor->id,
            'has_subscription' => $currentSubscription != null,
            'product_limit' => $currentSubscription->product_limit ?? 'null',
            'current_count' => $vendor->products()->count(),
            'is_active' => $currentSubscription->is_active ?? 'null',
            'end_date' => $currentSubscription->end_date ?? 'null',
        ]);

        // Block if no subscription at all
        if (! $currentSubscription) {
            Log::warning('Product creation blocked - no active subscription');

            return redirect()->route('marketplace.vendor.products.index')
                ->withErrors([
                    'message' => 'You need an active subscription to create products. Please subscribe to a plan.',
                ]);
        }

        // Block if product limit is set and reached
        $productLimit = (int) $currentSubscription->product_limit;

        if ($productLimit > 0) {
            $currentProductCount = $vendor->products()->count();

            Log::info('Checking product limit', [
                'current_count' => $currentProductCount,
                'limit' => $productLimit,
                'limit_raw' => $currentSubscription->product_limit,
                'limit_type' => gettype($currentSubscription->product_limit),
                'should_block' => $currentProductCount >= $productLimit,
            ]);

            if ($currentProductCount >= $productLimit) {
                Log::warning('Product creation blocked - limit reached', [
                    'vendor_id' => $vendor->id,
                    'count' => $currentProductCount,
                    'limit' => $productLimit,
                ]);

                return redirect()->route('marketplace.vendor.products.index')
                    ->withErrors([
                        'message' => 'You have reached your product limit ('.$productLimit.' products). Please upgrade your subscription to add more products.',
                    ]);
            }
        } else {
            Log::info('Product limit not enforced', [
                'limit_value' => $currentSubscription->product_limit,
                'reason' => $productLimit <= 0 ? 'unlimited' : 'no limit set',
            ]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'category_ids' => 'required|array|min:1',
            'category_ids.*' => 'exists:marketplace_categories,id',
            'sku' => 'required|string|unique:marketplace_products,sku',
            'stock_quantity' => 'required|integer|min:0',
            'unit_of_measure' => 'required|string|in:kg,g,liter,ml,piece,box,bag,dozen,pack',
            'minimum_order_quantity' => 'nullable|integer|min:1',
            'is_negotiable' => 'nullable|boolean',
            'maximum_order_quantity' => 'nullable|integer|gte:minimum_order_quantity',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'meta_description' => 'nullable|string|max:160',
            'images' => 'required|array|max:5',
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

        //  Enforce COD restriction
        if (! $currentSubscription) {
            // If no active subscription, don't allow COD
            if (isset($validated['payment_methods']) && in_array('cod', $validated['payment_methods'])) {
                return redirect()->back()->withErrors([
                    'payment_methods' => 'Cash on Delivery requires an active subscription. Please subscribe to a plan.',
                ]);
            }
        } elseif (
            isset($validated['payment_methods'])
            && in_array('cod', $validated['payment_methods'])
            && ! $currentSubscription->allow_cod
        ) {
            return redirect()->back()->withErrors([
                'payment_methods' => 'Cash on Delivery is not available in your current plan. Please upgrade your subscription.',
            ]);
        }

        $validated['vendor_id'] = $vendor->id;
        $validated['slug'] = Str::slug($validated['name']);
        $validated['status'] = 'draft';

        // Ensure slug uniqueness
        $originalSlug = $validated['slug'];
        $counter = 1;
        while (Product::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug.'-'.$counter;
            $counter++;
        }

        // Handle images
        $imageFiles = $validated['images'] ?? [];
        unset($validated['images']);

        // Handle video
        if ($request->hasFile('video')) {
            $videoPath = $request->file('video')->store('marketplace/products/videos/'.$vendor->id, 'public');
            $validated['video_path'] = $videoPath;
        }
        unset($validated['video']);

        // Set primary category (first one selected)
        $validated['category_id'] = $validated['category_ids'][0];
        $categoryIds = $validated['category_ids'];
        unset($validated['category_ids']);

        $product = Product::create($validated);

        // Sync categories
        $product->categories()->sync($categoryIds);

        if ($imageFiles) {
            foreach ($imageFiles as $index => $image) {
                $path = $image->store('marketplace/products/'.$product->id, 'public');

                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $path,
                    'alt_text' => $product->name.' - Image '.($index + 1),
                    'sort_order' => $index + 1,
                    'is_primary' => $index == 0,
                ]);
            }
        }

        return redirect()
            ->route('marketplace.vendor.products.index')
            ->with('success', 'Product created successfully!');
    }

    /**
     * Display the specified product.
     */
    public function show(Product $product)
    {
        // Log product view


        $product->load([
            'category.parent',
            'vendor.user',
            'images' => function ($query) {
                $query->orderBy('sort_order');
            },
            'reviews' => function ($query) {
                $query->where('is_approved', true)->with('user');
            },
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
            'relatedProducts' => $relatedProducts,
            'currentUser' => Auth::user() ? [
                'id' => Auth::id(),
                'name' => Auth::user()->name,
            ] : null,
        ]);
    }

    /**
     * Show the form for editing the specified product.
     */
    public function edit(Product $product)
    {
        $this->authorize('update', $product);

        $product->load(['images', 'categories']);

        $vendor = Auth::user()->vendor;
        $currentSubscription = null;
        $subscriptionUsage = null;
        $needsUpgrade = false;

        // Safely load subscription if it exists
        try {
            $currentSubscription = $vendor->subscriptions()->where('is_active', true)->first();

            if ($currentSubscription) {
                $productCount = $vendor->products()->count();

                $subscriptionUsage = [
                    'products_used' => $productCount,
                    'products_limit' => $currentSubscription->product_limit,
                    'can_create_more' => $currentSubscription->product_limit ?
                        ($productCount < $currentSubscription->product_limit) : true,
                    'plan_name' => $currentSubscription->plan_name,
                    'allows_cod' => $currentSubscription->allow_cod,
                ];

                // Check if upgrade is needed
                $needsUpgrade = ($currentSubscription->product_limit &&
                    $productCount >= $currentSubscription->product_limit * 0.9) ||
                    ($currentSubscription->daysRemaining() != null && $currentSubscription->daysRemaining() <= 7);
            } else {
                // No subscription - show subscription data
                $subscriptionUsage = [
                    'products_used' => $vendor->products()->count(),
                    'products_limit' => 0,
                    'can_create_more' => false,
                    'plan_name' => 'No Active Plan',
                    'allows_cod' => false,
                ];
                $needsUpgrade = true;
            }
        } catch (\Exception $e) {
            // If subscription table doesn't exist or other DB issues, continue without it
            \Log::warning('Could not load vendor subscription: '.$e->getMessage());
            $subscriptionUsage = [
                'products_used' => $vendor->products()->count(),
                'products_limit' => 0,
                'can_create_more' => false,
                'plan_name' => 'No Active Plan',
                'allows_cod' => false,
            ];
            $needsUpgrade = true;
        }

        // Get marketplace settings for earnings calculations
        \App\Models\MarketplaceSetting::clearCache();
        $marketplaceSettings = \App\Models\MarketplaceSetting::getAllGrouped();

        // Helper function to get setting value by key from a group
        $getSetting = function ($group, $key, $default = null) use ($marketplaceSettings) {
            if (! isset($marketplaceSettings[$group])) {
                return $default;
            }

            foreach ($marketplaceSettings[$group] as $setting) {
                if (isset($setting['key']) && $setting['key'] == $key) {
                    return $setting['value'] ?? $default;
                }
            }

            return $default;
        };

        // Format settings for frontend
        $formattedSettings = [
            'commission' => [
                'default_commission_rate' => (float) $getSetting('commission', 'default_commission_rate', 10),
                'commission_type' => $getSetting('commission', 'commission_type', 'percentage'),
            ],
            'general' => [
                'currency' => $getSetting('general', 'default_currency', 'RWF'),
                'currency_symbol' => $getSetting('general', 'currency_symbol', 'RWF'),
            ],
            'platform_fees' => [
                'platform_fee_rate' => (float) $getSetting('platform_fees', 'listing_fee', 0),
                'processing_fee' => (float) $getSetting('platform_fees', 'processing_fee', 0),
                'transaction_fee_rate' => (float) $getSetting('platform_fees', 'transaction_fee_rate', 0),
            ],
        ];

        return Inertia::render('modules/marketplace/vendor/products/edit', [
            'product' => $product,
            'categories' => Category::where('is_active', true)->whereNull('parent_id')->with('children')->get(),
            'vendor' => $vendor,
            'currentSubscription' => $currentSubscription,
            'subscriptionUsage' => $subscriptionUsage,
            'needsUpgrade' => $needsUpgrade,
            'upgradeReason' => ! $currentSubscription ? 'no_subscription' : 'product_limit',
            'marketplaceSettings' => $formattedSettings,
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
            'category_ids' => 'required|array|min:1',
            'category_ids.*' => 'exists:marketplace_categories,id',
            'sku' => 'required|string|unique:marketplace_products,sku,'.$product->id,
            'stock_quantity' => 'required|integer|min:0',
            'unit_of_measure' => 'required|string|in:kg,g,liter,ml,piece,box,bag,dozen,pack',
            'minimum_order_quantity' => 'nullable|integer|min:1',
            'is_negotiable' => 'nullable|boolean',
            'maximum_order_quantity' => 'nullable|integer|gte:minimum_order_quantity',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string',
            'is_digital' => 'boolean',
            'requires_shipping' => 'boolean',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'meta_description' => 'nullable|string|max:160',
            'status' => 'required|in:draft,active,inactive',
            'payment_methods' => 'nullable|array',
            'payment_methods.*' => 'string|in:online,cod',
            'shipping_option' => 'nullable|string|in:free,paid',
            'extra_fee' => 'nullable|numeric|min:0',
            'delivery_time' => 'nullable|string|max:255',
            'return_policy' => 'nullable|string',
            'additional_info' => 'nullable|string',
            'images' => 'required|array|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'remove_images' => 'nullable|array',
            'remove_images.*' => 'exists:marketplace_product_images,id',
            'video' => 'nullable|mimes:mp4,mov,ogg,qt|max:10240',
            'remove_video' => 'nullable|boolean',
        ]);

        // Enforce COD restriction
        $vendor = Auth::user()->vendor;
        $hasValidSubscription = false;
        try {
            $currentSubscription = $vendor->subscriptions()->where('is_active', true)->first();
            $hasValidSubscription = $currentSubscription && $currentSubscription->allow_cod;
        } catch (\Exception $e) {
            \Log::warning('Could not load vendor subscription for COD check: '.$e->getMessage());
            $hasValidSubscription = false;
        }

        if (
            isset($validated['payment_methods'])
            && in_array('cod', $validated['payment_methods'])
            && ! $hasValidSubscription
        ) {
            return redirect()->back()->withErrors([
                'payment_methods' => 'Cash on Delivery is not available for your current subscription plan. Please upgrade your plan.',
            ]);
        }

        // Convert arrays to JSON for storage
        foreach (['tags', 'payment_methods'] as $field) {
            if (isset($validated[$field]) && is_array($validated[$field])) {
                $validated[$field] = json_encode($validated[$field]);
            }
        }

        // Update slug if name changed
        if ($validated['name'] != $product->name) {
            $validated['slug'] = Str::slug($validated['name']);

            // Ensure slug is unique
            $originalSlug = $validated['slug'];
            $counter = 1;
            while (Product::where('slug', $validated['slug'])->where('id', '!=', $product->id)->exists()) {
                $validated['slug'] = $originalSlug.'-'.$counter;
                $counter++;
            }
        }

        // Handle video removal
        if ($request->boolean('remove_video')) {
            if ($product->video_path) {
                $path = parse_url($product->video_path, PHP_URL_PATH);
                if ($path) {
                    $relativePath = str_replace('/storage/', '', $path);
                    if (Storage::disk('public')->exists($relativePath)) {
                        Storage::disk('public')->delete($relativePath);
                    }
                }
                $validated['video_path'] = null;
            }
        }

        // Handle video upload
        if ($request->hasFile('video')) {
            // Delete old video if exists
            if ($product->video_path) {
                $path = parse_url($product->video_path, PHP_URL_PATH);
                if ($path) {
                    $relativePath = str_replace('/storage/', '', $path);
                    if (Storage::disk('public')->exists($relativePath)) {
                        Storage::disk('public')->delete($relativePath);
                    }
                }
            }

            $videoPath = $request->file('video')->store('marketplace/products/videos/'.$vendor->id, 'public');
            $validated['video_path'] = $videoPath;
        }
        unset($validated['video']);
        unset($validated['remove_video']);

        // Set primary category (first one selected) if category_ids changed
        if (isset($validated['category_ids'])) {
            $validated['category_id'] = $validated['category_ids'][0];
        } else {
            // Keep existing category_id if not updating categories (though frontend should always send it)
            unset($validated['category_id']);
        }

        $categoryIds = $validated['category_ids'] ?? [];
        unset($validated['category_ids']);

        $product->update($validated);

        if (! empty($categoryIds)) {
            $product->categories()->sync($categoryIds);
        }

        // Handle image removals first
        if ($request->filled('remove_images')) {
            $imagesToRemove = ProductImage::whereIn('id', $request->remove_images)
                ->where('product_id', $product->id)
                ->get();

            /** @var \App\Modules\Marketplace\Models\ProductImage $image */
            foreach ($imagesToRemove as $image) {
                if ($image->storage_path) {
                    if (Storage::disk('public')->exists($image->storage_path)) {
                        Storage::disk('public')->delete($image->storage_path);
                    }
                }
                $image->delete();
            }
        }

        // Handle image reordering and new uploads
        if ($request->filled('images_order')) {
            $imagesOrder = json_decode($request->images_order, true);
            $newUploadedImages = [];

            // Store new images first
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $path = $image->store('marketplace/products/'.$product->id, 'public');

                    $newImage = ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => $path,
                        'alt_text' => $product->name,
                        'sort_order' => 999, // Temporary high sort order
                        'is_primary' => false,
                    ]);
                    $newUploadedImages[] = $newImage;
                }
            }

            // Now apply the specified order
            $newImageIndex = 0;
            foreach ($imagesOrder as $orderItem) {
                if ($orderItem['type'] == 'existing') {
                    ProductImage::where('id', $orderItem['id'])
                        ->where('product_id', $product->id)
                        ->update([
                            'sort_order' => $orderItem['sort_order'],
                            'is_primary' => $orderItem['is_primary'],
                            'alt_text' => $product->name.' - Image '.$orderItem['sort_order'],
                        ]);
                } elseif ($orderItem['type'] == 'new' && isset($newUploadedImages[$newImageIndex])) {
                    $newUploadedImages[$newImageIndex]->update([
                        'sort_order' => $orderItem['sort_order'],
                        'is_primary' => $orderItem['is_primary'],
                        'alt_text' => $product->name.' - Image '.$orderItem['sort_order'],
                    ]);
                    $newImageIndex++;
                }
            }
        } elseif ($request->hasFile('images')) {
            // Fallback for cases where images_order is not sent (backward compatibility)
            $existingImagesCount = $product->images()->count();

            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('marketplace/products/'.$product->id, 'public');

                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $path,
                    'alt_text' => $product->name.' - Image '.($existingImagesCount + $index + 1),
                    'sort_order' => $existingImagesCount + $index + 1,
                    'is_primary' => $product->images()->count() == 0 && $index == 0,
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
            if ($image->storage_path) {
                if (Storage::disk('public')->exists($image->storage_path)) {
                    Storage::disk('public')->delete($image->storage_path);
                }
            }
        }

        $product->delete();

        return redirect()->back()
            ->with('success', 'Product deleted successfully!');
    }

    /**
     * Toggle product status between active and inactive.
     */
    public function toggleStatus(Product $product)
    {
        $this->authorize('update', $product);

        $newStatus = $product->status == 'active' ? 'inactive' : 'active';
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

        // Check subscription product limit
        $vendor = Auth::user()->vendor;

        if (! $vendor) {
            return redirect()->back()->withErrors([
                'message' => 'Vendor profile not found.',
            ]);
        }

        $currentSubscription = $vendor->subscriptions()
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('end_date')
                    ->orWhere('end_date', '>', now());
            })
            ->first();

        if ($currentSubscription && $currentSubscription->product_limit != null) {
            $currentProductCount = $vendor->products()->count();

            if ($currentProductCount >= $currentSubscription->product_limit) {
                return redirect()->back()->withErrors([
                    'message' => 'You have reached your product limit. Please upgrade your subscription to add more products.',
                ]);
            }
        }

        $newProduct = $product->replicate();
        $newProduct->name = $product->name.' (Copy)';
        $newProduct->slug = Str::slug($newProduct->name);
        $newProduct->sku = $product->sku.'-copy';
        $newProduct->status = 'draft';

        // Ensure unique slug and SKU
        $originalSlug = $newProduct->slug;
        $originalSku = $newProduct->sku;
        $counter = 1;

        while (Product::where('slug', $newProduct->slug)->exists()) {
            $newProduct->slug = $originalSlug.'-'.$counter;
            $counter++;
        }

        $counter = 1;
        while (Product::where('sku', $newProduct->sku)->exists()) {
            $newProduct->sku = $originalSku.'-'.$counter;
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
                'is_primary' => $image->is_primary,
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
        $activeProductScope = function ($query) {
            $query->where('status', 'active')
                ->whereHas('vendor', function ($q) {
                    $q->where('status', 'approved')->whereHas('user', function ($q2) {
                        $q2->where('is_verified', true);
                    });
                });
        };

        // Featured / trending products
        $featuredProducts = Product::with(['category', 'vendor.user', 'images'])
            ->where($activeProductScope)
            ->where('is_featured', true)
            ->inRandomOrder()
            ->limit(8)
            ->get();

        // If not enough featured, fill with random active products
        if ($featuredProducts->count() < 4) {
            $featuredProducts = Product::with(['category', 'vendor.user', 'images'])
                ->where($activeProductScope)
                ->where('stock_quantity', '>', 0)
                ->inRandomOrder()
                ->limit(8)
                ->get();
        }

        // New arrivals
        $newArrivals = Product::with(['category', 'vendor.user', 'images'])
            ->where($activeProductScope)
            ->where('stock_quantity', '>', 0)
            ->latest()
            ->limit(8)
            ->get();

        // Best sellers (products with most orders)
        $bestSellers = Product::with(['category', 'vendor.user', 'images'])
            ->where($activeProductScope)
            ->where('stock_quantity', '>', 0)
            ->withCount('orderItems')
            ->orderByDesc('order_items_count')
            ->limit(6)
            ->get();

        // Free delivery products
        $freeDelivery = Product::with(['category', 'vendor.user', 'images'])
            ->where($activeProductScope)
            ->where('shipping_option', 'free')
            ->where('stock_quantity', '>', 0)
            ->inRandomOrder()
            ->limit(4)
            ->get();

        // Categories with product counts
        $categories = Category::where('is_active', true)
            ->withCount(['products' => function ($q) use ($activeProductScope) {
                $q->where($activeProductScope);
            }])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        // Stats for social proof
        $stats = [
            'total_products' => Product::where($activeProductScope)->count(),
            'total_vendors' => Vendor::where('status', 'approved')->count(),
            'total_categories' => $categories->where('products_count', '>', 0)->count(),
        ];

        return Inertia::render('Public/Marketplace/Index', [
            'featuredProducts' => $featuredProducts,
            'newArrivals' => $newArrivals,
            'bestSellers' => $bestSellers,
            'freeDelivery' => $freeDelivery,
            'categories' => $categories,
            'stats' => $stats,
        ]);
    }

    /**
     * Display a public product detail page (no authentication required).
     */
    public function publicShow(Product $product)
    {
        $product->load([
            'category',
            'vendor.user',
            'images',
            'reviews' => function ($query) {
                $query->where('is_approved', true)->with('user');
            },
        ]);

        // Only show active products
        if ($product->status != 'active') {
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
            'currentUser' => Auth::user() ? [
                'id' => Auth::id(),
                'name' => Auth::user()->name,
            ] : null,
        ]);
    }

    /**
     * Display the search page with comprehensive filtering.
     */
    public function search(Request $request)
    {
        $query = Product::with(['category', 'vendor.user', 'images'])
            ->where('status', 'active')
            ->whereHas('vendor', function ($q) {
                $q->where('status', 'approved')->whereHas('user', function ($q2) {
                    $q2->where('is_verified', true);
                });
            });

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Apply category filter
        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        // Apply vendor filter
        if ($request->filled('vendor')) {
            $query->where('vendor_id', $request->vendor);
        }

        // Apply price range filter
        if ($request->filled('price_min')) {
            $query->where('price', '>=', $request->price_min);
        }
        if ($request->filled('price_max')) {
            $query->where('price', '<=', $request->price_max);
        }

        // Apply stock filter
        if ($request->boolean('in_stock')) {
            $query->where('stock_quantity', '>', 0);
        }

        // Apply condition filter (if you have this field in your products table)
        // Uncomment if you add a 'condition' column to your products table
        // if ($request->filled('condition')) {
        //     $query->where('condition', $request->condition);
        // }

        // Apply rating filter
        if ($request->filled('rating')) {
            $query->where('rating', '>=', (float) $request->rating);
        }

        // Apply free shipping filter
        if ($request->boolean('free_shipping')) {
            $query->where('shipping_option', 'free');
        }

        // Apply sorting
        $sort = $request->get('sort', 'best_match');
        switch ($sort) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            case 'popular':
                // You can implement view count or sales count here
                $query->orderBy('created_at', 'desc');
                break;
            default: // best_match
                // For best match, prioritize exact name matches, then partial matches
                if ($request->filled('search')) {
                    $search = $request->search;
                    $query->orderByRaw('CASE 
                        WHEN name LIKE ? THEN 1 
                        WHEN name LIKE ? THEN 2 
                        ELSE 3 
                    END', [$search, "%{$search}%"]);
                }
                $query->orderBy('created_at', 'desc');
                break;
        }

        // Paginate results
        $perPage = $request->get('per_page', 24);
        $products = $query->paginate($perPage);

        // Get all categories and vendors for filters
        $categories = Category::where('is_active', true)->orderBy('name')->get();
        $vendors = Vendor::with('user')
            ->where('status', 'approved')
            ->whereHas('user', function ($q) {
                $q->where('is_verified', true);
            })
            ->orderBy('business_name')
            ->get();

        return Inertia::render('Public/Marketplace/Search', [
            'products' => $products->items(),
            'categories' => $categories,
            'vendors' => $vendors,
            'filters' => [
                'search' => $request->get('search'),
                'category' => $request->get('category'),
                'vendor' => $request->get('vendor'),
                'price_min' => $request->get('price_min'),
                'price_max' => $request->get('price_max'),
                'in_stock' => $request->boolean('in_stock'),
                'condition' => $request->get('condition'),
                'rating' => $request->get('rating'),
                'free_shipping' => $request->boolean('free_shipping'),
            ],
            'pagination' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }
}
