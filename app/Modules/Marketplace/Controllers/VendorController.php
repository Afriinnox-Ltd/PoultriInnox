<?php

namespace App\Modules\Marketplace\Controllers;

use App\Http\Controllers\Controller;
use App\Models\MarketplaceSetting;
use App\Modules\Marketplace\Models\Vendor;
use App\Modules\Marketplace\Models\Product;
use App\Models\User;
use App\Modules\Marketplace\Models\Order;
use App\Modules\Marketplace\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Notifications\NewVendorRegistrationNotification;
use App\Models\Module;
use App\Services\MarketplaceSettingsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;
use Illuminate\Support\Str;

class VendorController extends Controller
{
    use AuthorizesRequests;

    /**
     * Show the form for public vendor registration (combined user + vendor).
     */
    public function showPublicRegister()
    {
        if (Auth::check()) {
            return redirect()->route('marketplace.vendor.register');
        }

        // Get marketplace settings
        $settingsService = new MarketplaceSettingsService();
        $formattedSettings = $settingsService->getFormattedSettings();

        return Inertia::render('modules/marketplace/vendor/public-register', [
            'marketplaceGroupedSettings' => $formattedSettings,
        ]);
    }

    /**
     * Handle public vendor registration (create user + vendor).
     */
    public function publicRegister(Request $request)
    {
        // Combined validation
        $validated = $request->validate([
            // User details
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|confirmed|min:8',
            'phone' => 'required|string|max:20',

            // Business details
            'business_name' => 'required|string|max:255',
            'business_registration_number' => 'required|string|max:100|unique:marketplace_vendors',
            'business_type' => 'required',
            'business_description' => 'required|string',
            'business_address' => 'required|string',
            'business_phone' => 'required|string|max:20',
            'business_email' => 'required|email|max:255',
            'business_website' => 'nullable|url|max:255',

            // Banking details - Removed as they will be added in dashboard
            // 'bank_name' => 'required|string|max:255',
            // 'bank_account_number' => 'required|string|max:50',
            // 'bank_account_name' => 'required|string|max:255',
            // 'bank_branch' => 'nullable|string|max:255',

            'business_documents' => 'required|array|min:1',
            'business_documents.*' => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:5120',

            // Additional info
            'tax_number' => 'nullable|string|max:100',
            'years_in_business' => 'nullable|integer|min:0',
            'specializations' => 'nullable|string',
            'terms' => 'required|accepted',
        ]);

        DB::beginTransaction();

        try {
            // 1. Create User
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'phone' => $validated['phone'], // Assuming user table has phone
                'role' => 'user', // Default role
            ]);

            // Enable marketplace module
            $marketplaceModule = Module::where('slug', 'marketplace')->first();
            if ($marketplaceModule) {
                $user->modules()->attach($marketplaceModule->id, [
                    'is_enabled' => true,
                    'activated_at' => now(),
                    'settings' => json_encode([]),
                ]);
            }

            // 2. Create Vendor
            $vendorData = collect($validated)->except([
                'name',
                'email',
                'password',
                'password_confirmation',
                'phone',
                'terms'
            ])->toArray();

            $vendorData['user_id'] = $user->id;
            $vendorData['status'] = 'pending';
            $vendorData['slug'] = Str::slug($validated['business_name']);

            if ($request->hasFile('business_documents')) {
                $documentPaths = [];
                foreach ($request->file('business_documents') as $document) {
                    $path = $document->store('marketplace/vendor-documents/', 'public');
                    $documentPaths[] = asset(Storage::url($path));
                }
                $vendorData['business_documents'] = $documentPaths;
            }

            // Ensure unique slug
            $originalSlug = $vendorData['slug'];
            $counter = 1;
            while (Vendor::where('slug', $vendorData['slug'])->exists()) {
                $vendorData['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }

            $vendor = Vendor::create($vendorData);

            // 3. Assign Free Subscription
            $freePlan = SubscriptionPlan::where('price', 0)
                ->where('is_active', 1)
                ->first();

            if ($freePlan) {
                Subscription::create([
                    'vendor_id' => $vendor->id,
                    'plan_id' => $freePlan->id,
                    'start_date' => now(),
                    'end_date' => null,
                    'is_active' => true,
                ]);
            }

            // 4. Notify Admin
            $admins = User::where('is_admin', true)->get();
            foreach ($admins as $admin) {
                $admin->notify(new \App\Notifications\NewVendorRegistrationNotification($vendor));
            }

            DB::commit();

            // 5. Login and Redirect
            Auth::login($user);

            return redirect()->route('marketplace.vendor.pending')
                ->with('success', 'Registration successful! Your vendor application is pending review.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['message' => 'Registration failed: ' . $e->getMessage()])->withInput();
        }
    }

    public function index(Request $request)
    {
        $query = Vendor::with(['user', 'products'])
            ->where('status', 'approved');

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('business_name', 'like', "%{$search}%")
                    ->orWhere('business_description', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('location')) {
            $query->where('business_address', 'like', "%{$request->location}%");
        }

        if ($request->filled('rating_min')) {
            $query->where('rating', '>=', $request->rating_min);
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        $allowedSorts = ['business_name', 'rating', 'created_at', 'total_sales'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection);
        }

        $vendors = $query->paginate(12)->withQueryString();

        return Inertia::render('modules/marketplace/vendor/dashboard', [
            'vendors' => $vendors,
            'filters' => $request->only(['search', 'location', 'rating_min']),
            'sort' => ['sort_by' => $sortBy, 'sort_direction' => $sortDirection]
        ]);
    }

    /**
     * Show the form for vendor registration.
     */
    public function create()
    {
        // Check if user already has a vendor account
        $existingVendor = Auth::user()->vendor;

        if ($existingVendor) {
            // Redirect based on vendor status
            switch ($existingVendor->status) {
                case 'pending':
                    return redirect()->route('marketplace.vendor.pending')
                        ->with('info', 'You already have a pending vendor application.');
                case 'approved':
                    return redirect()->route('marketplace.vendor.dashboard')
                        ->with('info', 'You already have an approved vendor account.');
                case 'rejected':
                    // Allow re-registration for rejected applications
                    break;
                default:
                    return redirect()->route('marketplace.vendor.dashboard')
                        ->with('info', 'You already have a vendor account.');
            }
        }

        // Get marketplace settings for commission calculations
        $settingsService = new MarketplaceSettingsService();
        $formattedSettings = $settingsService->getFormattedSettings();

        return Inertia::render('modules/marketplace/vendor/register', [
            'marketplaceGroupedSettings' => $formattedSettings,
            'user' => Auth::user(),
            'existing_application' => $existingVendor
        ]);
    }

    /**
     * Store a newly created vendor registration.
     */
    public function store(Request $request)
    {
        // Check if user already has a vendor account
        $existingVendor = Auth::user()->vendor;

        if ($existingVendor) {
            // Redirect based on vendor status
            switch ($existingVendor->status) {
                case 'pending':
                    return redirect()->route('marketplace.vendor.pending')
                        ->with('info', 'You already have a pending vendor application.');
                case 'approved':
                    return redirect()->route('marketplace.vendor.dashboard')
                        ->with('info', 'You already have an approved vendor account.');
                case 'rejected':
                    return redirect()->route('marketplace.vendor.register')
                        ->with('warning', 'Your previous application was rejected. Please contact support or submit a new application.');
                default:
                    return redirect()->route('marketplace.vendor.dashboard')
                        ->with('info', 'You already have a vendor account.');
            }
        }

        $validated = $request->validate([

            // Business details
            'business_name' => 'required|string|max:255',
            'business_registration_number' => 'required|string|max:100|unique:marketplace_vendors',
            'business_type' => 'required',
            'business_description' => 'required|string',
            'business_address' => 'required|string',
            'business_phone' => 'required|string|max:20',
            'business_email' => 'required|email|max:255',
            'business_website' => 'nullable|url|max:255',

            // Banking details - Removed as they will be added in dashboard
            // 'bank_name' => 'required|string|max:255',
            // 'bank_account_number' => 'required|string|max:50',
            // 'bank_account_name' => 'required|string|max:255',
            // 'bank_branch' => 'nullable|string|max:255',

            'business_documents' => 'required|array|min:1',
            'business_documents.*' => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:5120',
            // Additional info
            'tax_number' => 'nullable|string|max:100',
            'years_in_business' => 'nullable|integer|min:0',
            'specializations' => 'nullable|string'
        ]);

        // Create vendor profile
        $vendorData = collect($validated)->except(['name', 'email', 'password', 'password_confirmation', 'phone'])->toArray();
        $vendorData['user_id'] = Auth::id();
        $vendorData['status'] = 'pending'; // Requires admin approval
        $vendorData['slug'] = Str::slug($validated['business_name']);

        if ($request->hasFile('business_documents')) {
            $documentPaths = [];
            foreach ($request->file('business_documents') as $document) {
                $path = $document->store('marketplace/vendor-documents/', 'public');
                $documentPaths[] = asset(Storage::url($path));
            }
            $vendorData['business_documents'] = $documentPaths;
        }

        // Ensure slug is unique
        $originalSlug = $vendorData['slug'];
        $counter = 1;
        while (Vendor::where('slug', $vendorData['slug'])->exists()) {
            $vendorData['slug'] = $originalSlug . '-' . $counter;
            $counter++;
        }

        $vendor = Vendor::create($vendorData);

        // Auto-assign free subscription plan if available
        $freePlan = SubscriptionPlan::where('price', 0)
            ->where('is_active', 1)
            ->first();

        if ($freePlan) {
            Subscription::create([
                'vendor_id' => $vendor->id,
                'plan_id' => $freePlan->id,
                'start_date' => now(),
                'end_date' => null, // Free plan has no expiration
                'is_active' => true,
            ]);
        }

        // Notify admin about new vendor registration
        $admins = User::where('is_admin', true)->get();
        foreach ($admins as $admin) {
            $admin->notify(new \App\Notifications\NewVendorRegistrationNotification($vendor));
        }

        return redirect()->route('marketplace.vendor.pending')
            ->with('success', 'Vendor registration submitted successfully! Your application is pending review.');
    }

    /**
     * Display the specified vendor profile.
     */
    public function show(Vendor $vendor)
    {
        $vendor->load([
            'user',
            'products' => function ($query) {
                $query->where('status', 'active')->with(['images', 'category']);
            }
        ]);

        return Inertia::render('modules/marketplace/vendor/show', [
            'vendor' => $vendor,
            'products' => $vendor->products()->where('status', 'active')
                ->with(['images', 'category'])
                ->paginate(12)
        ]);
    }

    /**
     * Show vendor dashboard.
     */
    public function dashboard()
    {
        $vendor = Auth::user()->vendor;

        if (!$vendor) {
            return redirect()->route('marketplace.vendor.register')
                ->with('error', 'You need to register as a vendor first.');
        }

        // Load vendor with all necessary relationships
        $vendor->load(['products.category', 'products.images', 'user']);

        // Calculate order statistics - Use fresh queries for each calculation
        $totalOrders = Order::where('vendor_id', $vendor->id)->count();
        $pendingOrders = Order::where('vendor_id', $vendor->id)->where('status', 'pending')->count();
        $processingOrders = Order::where('vendor_id', $vendor->id)->where('status', 'processing')->count();
        $completedOrders = Order::where('vendor_id', $vendor->id)->whereIn('status', ['delivered', 'completed'])->count();
        $cancelledOrders = Order::where('vendor_id', $vendor->id)->where('status', 'cancelled')->count();

        // Calculate revenue statistics - Use fresh queries
        $totalRevenue = Order::where('vendor_id', $vendor->id)
            ->whereIn('status', ['delivered', 'completed'])
            ->sum('total_amount');
        $monthlyRevenue = Order::where('vendor_id', $vendor->id)
            ->whereIn('status', ['delivered', 'completed'])
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('total_amount');

        // Calculate performance metrics
        $totalDeliveredOrders = Order::where('vendor_id', $vendor->id)->where('status', 'delivered')->count();
        $onTimeDeliveries = 0; // Default to 0 for safety

        if ($totalDeliveredOrders > 0) {
            // Only calculate if we have delivered orders and the necessary columns exist
            try {
                $onTimeDeliveries = Order::where('vendor_id', $vendor->id)
                    ->where('status', 'delivered')
                    ->whereNotNull('delivered_at')
                    ->whereNotNull('shipped_at')
                    ->whereColumn('delivered_at', '<=', 'shipped_at')
                    ->count();
            } catch (\Exception $e) {
                // If columns don't exist or there's an error, default to 0
                $onTimeDeliveries = 0;
            }
        }

        $onTimeDeliveryRate = $totalDeliveredOrders > 0 ? round(($onTimeDeliveries / $totalDeliveredOrders) * 100, 1) : 0;

        // Calculate comprehensive statistics
        $stats = [
            'total_products' => $vendor->products()->count(),
            'active_products' => $vendor->products()->where('status', 'active')->count(),
            'pending_products' => $vendor->products()->where('status', 'pending')->count(),
            'draft_products' => $vendor->products()->where('status', 'draft')->count(),
            'total_orders' => $totalOrders,
            'pending_orders' => $pendingOrders,
            'processing_orders' => $processingOrders,
            'completed_orders' => $completedOrders,
            'cancelled_orders' => $cancelledOrders,
            'total_revenue' => $totalRevenue,
            'monthly_revenue' => $monthlyRevenue,
            'avg_rating' => $vendor->rating ?? 0,
            'total_reviews' => $vendor->total_reviews ?? 0,
            'status' => $vendor->status,
            'is_verified' => $vendor->is_verified,
            'response_rate' => 98, // This would be calculated from actual response data
            'on_time_delivery' => $onTimeDeliveryRate,
            // Add top_products here for frontend compatibility
            'top_products' => [],  // Will be populated below
        ];

        // Recent products
        $recentProducts = $vendor->products()
            ->with(['category', 'images'])
            ->latest()
            ->limit(5)
            ->get();

        // Low stock products
        $lowStockProducts = $vendor->products()
            ->where('stock_quantity', '<=', DB::raw('COALESCE(minimum_stock, 5)'))
            ->where('status', 'active')
            ->with(['category', 'images'])
            ->limit(5)
            ->get();

        // Recent orders - now with real data
        $recentOrders = Order::where('vendor_id', $vendor->id)
            ->with(['user', 'items.product'])
            ->latest()
            ->limit(5)
            ->get();

        // Top performing products - based on actual sales data
        $topProducts = $vendor->products()
            ->withCount([
                'orderItems as total_sold' => function ($query) {
                    $query->whereHas('order', function ($orderQuery) {
                        $orderQuery->whereIn('status', ['delivered', 'completed']);
                    });
                }
            ])
            ->where('status', 'active')
            ->orderBy('total_sold', 'desc')
            ->limit(5)
            ->get();

        // Monthly sales data for charts (last 6 months)
        $monthlySales = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthSales = Order::where('vendor_id', $vendor->id)
                ->whereIn('status', ['delivered', 'completed'])
                ->whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->sum('total_amount');

            $monthlySales[] = [
                'month' => $date->format('M Y'),
                'sales' => $monthSales,
                'orders' => Order::where('vendor_id', $vendor->id)
                    ->whereMonth('created_at', $date->month)
                    ->whereYear('created_at', $date->year)
                    ->count()
            ];
        }

        // Update stats with top products
        $stats['top_products'] = $topProducts;

        // Order status distribution for charts
        $orderStatusDistribution = [
            'pending' => $pendingOrders,
            'processing' => $processingOrders,
            'completed' => $completedOrders,
            'cancelled' => $cancelledOrders
        ];

        // Detailed vendor profile for display
        $vendorProfile = [
            'id' => $vendor->id,
            'business_name' => $vendor->business_name,
            'business_type' => $vendor->business_type,
            // Use business description as primary, fallback to description
            'description' => $vendor->business_description ?: $vendor->description,
            // Use business email as primary, fallback to email
            'email' => $vendor->business_email ?: $vendor->email,
            // Use business phone as primary, fallback to phone
            'phone' => $vendor->business_phone ?: $vendor->phone,
            // Use business address as primary, fallback to address
            'address' => $vendor->business_address ?: $vendor->address,
            'city' => $vendor->city,
            'state' => $vendor->state,
            'country' => $vendor->country,
            'postal_code' => $vendor->postal_code,
            'website' => $vendor->business_website ?: $vendor->website,
            'social_media' => $vendor->social_media,
            'logo' => $vendor->logo,
            'banner_image' => $vendor->banner_image,
            'business_registration_number' => $vendor->business_registration_number,
            'tax_identification_number' => $vendor->tax_id ?: $vendor->tax_number,
            'bank_name' => $vendor->bank_name,
            'bank_account_number' => $vendor->bank_account_number,
            'bank_account_name' => $vendor->bank_account_name,
            'status' => $vendor->status,
            'is_verified' => $vendor->is_verified,
            'is_active' => $vendor->is_active,
            'created_at' => $vendor->created_at,
            'updated_at' => $vendor->updated_at,
            'total_sales' => $vendor->total_sales ?? 0,
            'rating' => $vendor->rating ?? 0,
        ];

        // Get subscription information
        $currentSubscription = $vendor->subscriptions()->where('is_active', true)->first();
        $subscriptionUsage = null;
        $needsUpgrade = false;

        if ($currentSubscription) {
            $subscriptionUsage = [
                'plan_name' => $currentSubscription->plan_name,
                'price' => $currentSubscription->price,
                'billing_cycle' => $currentSubscription->billing_cycle,
                'start_date' => $currentSubscription->start_date,
                'end_date' => $currentSubscription->end_date,
                'days_remaining' => $currentSubscription->daysRemaining(),
                'is_active' => $currentSubscription->isActive(),
                'auto_renew' => $currentSubscription->auto_renew,
                'allows_cod' => $currentSubscription->allow_cod,
                'products_used' => $vendor->products()->count(),
                'products_limit' => $currentSubscription->product_limit,
                'orders_this_month' => Order::where('vendor_id', $vendor->id)
                    ->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count(),
                'order_limit' => $currentSubscription->order_limit,
                'can_create_products' => $currentSubscription->product_limit ?
                    ($vendor->products()->count() < $currentSubscription->product_limit) : true,
                'usage_percentage' => [
                    'products' => $currentSubscription->product_limit ?
                        min(100, ($vendor->products()->count() / $currentSubscription->product_limit) * 100) : 0,
                    'orders' => $currentSubscription->order_limit ?
                        min(100, (Order::where('vendor_id', $vendor->id)
                            ->whereMonth('created_at', now()->month)
                            ->whereYear('created_at', now()->year)
                            ->count() / $currentSubscription->order_limit) * 100) : 0,
                ],
            ];
        }

        // Check if upgrade is needed
        if ($currentSubscription) {
            $needsUpgrade = ($currentSubscription->product_limit &&
                $vendor->products()->count() >= $currentSubscription->product_limit * 0.9) ||
                ($currentSubscription->order_limit &&
                    Order::where('vendor_id', $vendor->id)
                        ->whereMonth('created_at', now()->month)
                        ->whereYear('created_at', now()->year)
                        ->count() >= $currentSubscription->order_limit * 0.9) ||
                ($currentSubscription->daysRemaining() !== null && $currentSubscription->daysRemaining() <= 7);
        } else {
            $needsUpgrade = true;
        }

        // Get marketplace settings for commission calculations
        // Clear cache to ensure fresh data
        \App\Models\MarketplaceSetting::clearCache();
        $settingsService = new MarketplaceSettingsService();
        $formattedSettings = $settingsService->getFormattedSettings();

        return Inertia::render('modules/marketplace/vendor/dashboard', [
            'vendor' => $vendorProfile,
            'stats' => $stats,
            'recentProducts' => $recentProducts,
            'lowStockProducts' => $lowStockProducts,
            'recent_orders' => $recentOrders,
            'topProducts' => $topProducts,
            'monthlySales' => $monthlySales,
            'orderStatusDistribution' => $orderStatusDistribution,
            'products' => $vendor->products()->with(['category', 'images'])->latest()->get(),
            'marketplaceSettings' => $formattedSettings,
            'currentSubscription' => $currentSubscription,
            'subscriptionUsage' => $subscriptionUsage,
            'needsUpgrade' => $needsUpgrade,
            'upgradeReason' => !$currentSubscription ? 'no_subscription' : 'approaching_limits',
        ]);
    }

    /**
     * Show the form for editing vendor profile.
     */
    public function edit()
    {
        $vendor = Auth::user()->vendor;

        if (!$vendor) {
            return redirect()->route('marketplace.vendor.register')
                ->with('error', 'You need to register as a vendor first.');
        }

        $vendor->load('user');

        // Prepare vendor data for editing
        $vendorData = [
            'id' => $vendor->id,
            'business_name' => $vendor->business_name,
            'business_type' => $vendor->business_type,
            // Use business description as primary, fallback to description
            'description' => $vendor->business_description ?: $vendor->description,
            // Use business email as primary, fallback to email
            'email' => $vendor->business_email ?: $vendor->email,
            // Use business phone as primary, fallback to phone
            'phone' => $vendor->business_phone ?: $vendor->phone,
            // Use business address as primary, fallback to address
            'address' => $vendor->business_address ?: $vendor->address,
            'city' => $vendor->city,
            'state' => $vendor->state,
            'country' => $vendor->country,
            'postal_code' => $vendor->postal_code,
            'website' => $vendor->business_website ?: $vendor->website,
            'social_media' => $vendor->social_media ? json_decode($vendor->social_media, true) : [],
            'logo' => $vendor->logo,
            'banner_image' => $vendor->banner_image,
            'business_registration_number' => $vendor->business_registration_number,
            'tax_identification_number' => $vendor->tax_id ?: $vendor->tax_number,
            'bank_name' => $vendor->bank_name,
            'bank_account_number' => $vendor->bank_account_number,
            'bank_account_name' => $vendor->bank_account_name,
            'status' => $vendor->status,
            'is_verified' => $vendor->is_verified,
            'is_active' => $vendor->is_active,
            'additional_info' => $vendor->additional_info,
        ];

        // Get marketplace settings for commission calculations
        $settingsService = new MarketplaceSettingsService();
        $formattedSettings = $settingsService->getFormattedSettings();

        return Inertia::render('modules/marketplace/vendor/profile', [
            'vendor' => $vendorData,
            'marketplaceSettings' => $formattedSettings
        ]);
    }

    /**
     * Update vendor profile.
     */
    public function update(Request $request)
    {
        $vendor = Auth::user()->vendor;

        if (!$vendor) {
            return redirect()->route('marketplace.vendor.register')
                ->with('error', 'You need to register as a vendor first.');
        }

        $validated = $request->validate([
            // Business details
            'business_name' => 'required|string|max:255',
            'business_type' => 'required|string|in:individual,partnership,corporation,llc,cooperative,nonprofit',
            'description' => 'required|string|min:50',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'required|string|max:500',
            'city' => 'required|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'required|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',

            // Social media
            'facebook' => 'nullable|url|max:255',
            'twitter' => 'nullable|url|max:255',
            'instagram' => 'nullable|url|max:255',
            'linkedin' => 'nullable|url|max:255',

            // Business registration
            'business_registration_number' => 'nullable|string|max:100',
            'tax_identification_number' => 'nullable|string|max:100',

            // Banking details
            'bank_name' => 'required|string|max:255',
            'bank_account_number' => 'required|string|max:50',
            'bank_account_name' => 'required|string|max:255',

            // Additional info
            'additional_info' => 'nullable|string|max:1000',

            // File uploads
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'banner_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        try {


            // Handle image uploads
            $updateData = collect($validated)->except(['logo', 'banner_image', 'facebook', 'twitter', 'instagram', 'linkedin', 'description', 'email', 'phone', 'address', 'website', 'tax_identification_number'])->toArray();

            // Map simplified field names to business field names
            $updateData['business_description'] = $validated['description'];
            $updateData['business_email'] = $validated['email'];
            $updateData['business_phone'] = $validated['phone'];
            $updateData['business_address'] = $validated['address'];
            $updateData['business_website'] = $validated['website'];
            $updateData['tax_id'] = $validated['tax_identification_number'];

            // Handle social media as JSON
            $socialMedia = [
                'facebook' => $validated['facebook'] ?? null,
                'twitter' => $validated['twitter'] ?? null,
                'instagram' => $validated['instagram'] ?? null,
                'linkedin' => $validated['linkedin'] ?? null,
            ];
            $updateData['social_media'] = json_encode(array_filter($socialMedia));

            // Handle file uploads
            if ($request->hasFile('logo')) {
                // Delete old logo if exists
                if ($vendor->logo) {

                    Storage::delete(str_replace('/storage/', '', $vendor->logo));

                }

                $logoPath = $request->file('logo')->store('vendor-logos', 'public');
                $updateData['logo'] = asset(Storage::url($logoPath));
            }

            if ($request->hasFile('banner_image')) {
                // Delete old banner if exists
                if ($vendor->banner_image) {
                    Storage::delete(str_replace('/storage/', '', $vendor->banner_image));
                }

                $bannerPath = $request->file('banner_image')->store('vendor-banners', 'public');
                $updateData['banner_image'] = asset(Storage::url($bannerPath));
            }

            // Update vendor record
            $vendor->update($updateData);

            return redirect()->back()->with('success', 'Vendor profile updated successfully!');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Failed to update vendor profile.');
        }
    }

    /**
     * Show pending registration status.
     */
    public function pending()
    {
        $vendor = Auth::user()->vendor;

        if (!$vendor) {
            return redirect()->route('marketplace.vendor.register');
        }

        // Get marketplace settings for commission preview
        $settingsService = new MarketplaceSettingsService();
        $formattedSettings = $settingsService->getFormattedSettings();

        return Inertia::render('modules/marketplace/vendor/pending', [
            'vendor' => [
                'id' => $vendor->id,
                'business_name' => $vendor->business_name,
                'status' => $vendor->status,
                'submitted_at' => $vendor->created_at,
            ],
            'marketplaceSettings' => $formattedSettings
        ]);
    }


    /**
     * Admin: Approve vendor application.
     */
    public function approve(Vendor $vendor)
    {
        $this->authorize('update', $vendor);

        $vendor->update(['status' => 'approved']);

        return redirect()->back()
            ->with('success', 'Vendor application approved successfully!');
    }

    /**
     * Admin: Reject vendor application.
     */
    public function reject(Vendor $vendor, Request $request)
    {
        $this->authorize('update', $vendor);

        $request->validate([
            'rejection_reason' => 'required|string|max:500'
        ]);

        $vendor->update([
            'status' => 'rejected',
            'rejection_reason' => $request->rejection_reason
        ]);

        return redirect()->back()
            ->with('success', 'Vendor application rejected.');
    }

    /**
     * Display vendor analytics dashboard
     */
    public function analytics()
    {

        $vendor = Auth::user()->vendor;

        if (!$vendor) {
            return redirect()->route('marketplace.vendor.register');
        }

        // Get products statistics
        $totalProducts = $vendor->products()->count();
        $activeProducts = $vendor->products()->where('status', 'active')->count();
        // Check for low stock (less than 10 items) and out of stock
        $lowStockProducts = $vendor->products()->where('stock_quantity', '>', 0)->where('stock_quantity', '<=', 10)->count();
        $outOfStockProducts = $vendor->products()->where('stock_quantity', 0)->count();

        // Get sales statistics
        $totalOrders = Order::where('vendor_id', $vendor->id)->count();
        $completedOrders = Order::where('vendor_id', $vendor->id)->where('status', 'delivered')->count();
        $pendingOrders = Order::where('vendor_id', $vendor->id)
            ->whereNotIn('status', ['delivered', 'cancelled', 'refunded'])
            ->count();

        // Calculate total revenue
        $totalRevenue = Order::where('vendor_id', $vendor->id)
            ->where('status', 'delivered')
            ->sum('total_amount');

        // Get top selling products
        $topSellingProducts = DB::table('marketplace_order_items')
            ->join('marketplace_orders', 'marketplace_order_items.order_id', '=', 'marketplace_orders.id')
            ->join('marketplace_products', 'marketplace_order_items.product_id', '=', 'marketplace_products.id')
            ->where('marketplace_orders.vendor_id', $vendor->id)
            ->where('marketplace_orders.status', 'delivered')
            ->select(
                'marketplace_products.id',
                'marketplace_products.name',
                'marketplace_products.slug',
                DB::raw('SUM(marketplace_order_items.quantity) as total_sold'),
                DB::raw('SUM(marketplace_order_items.quantity * marketplace_order_items.unit_price) as total_revenue')
            )
            ->groupBy('marketplace_products.id', 'marketplace_products.name', 'marketplace_products.slug')
            ->orderByDesc('total_sold')
            ->limit(10)
            ->get();

        // Get low stock products (less than 10 items)
        $lowStockItems = $vendor->products()
            ->where('stock_quantity', '>', 0)
            ->where('stock_quantity', '<=', 10)
            ->orderBy('stock_quantity', 'asc')
            ->limit(10)
            ->get();

        // Get recent products
        $recentProducts = $vendor->products()
            ->with('category')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Monthly sales trend (last 6 months)
        $monthlySales = DB::table('marketplace_orders')
            ->where('vendor_id', $vendor->id)
            ->where('status', 'delivered')
            ->where('created_at', '>=', now()->subMonths(6))
            ->select(
                DB::raw('strftime("%Y-%m", created_at) as month'),
                DB::raw('COUNT(*) as total_orders'),
                DB::raw('SUM(total_amount) as total_revenue')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Category performance
        $categoryPerformance = DB::table('marketplace_order_items')
            ->join('marketplace_orders', 'marketplace_order_items.order_id', '=', 'marketplace_orders.id')
            ->join('marketplace_products', 'marketplace_order_items.product_id', '=', 'marketplace_products.id')
            ->join('marketplace_categories', 'marketplace_products.category_id', '=', 'marketplace_categories.id')
            ->where('marketplace_orders.vendor_id', $vendor->id)
            ->where('marketplace_orders.status', 'delivered')
            ->select(
                'marketplace_categories.name as category_name',
                DB::raw('COUNT(DISTINCT marketplace_products.id) as product_count'),
                DB::raw('SUM(marketplace_order_items.quantity) as total_sold'),
                DB::raw('SUM(marketplace_order_items.quantity * marketplace_order_items.unit_price) as total_revenue')
            )
            ->groupBy('marketplace_categories.id', 'marketplace_categories.name')
            ->orderByDesc('total_revenue')
            ->get();

        // Get marketplace settings for commission calculations
        $settingsService = new MarketplaceSettingsService();
        $formattedSettings = $settingsService->getFormattedSettings();

        return Inertia::render('modules/marketplace/vendor/analytics', [
            'stats' => [
                'totalProducts' => $totalProducts,
                'activeProducts' => $activeProducts,
                'lowStockProducts' => $lowStockProducts,
                'outOfStockProducts' => $outOfStockProducts,
                'totalOrders' => $totalOrders,
                'completedOrders' => $completedOrders,
                'pendingOrders' => $pendingOrders,
                'totalRevenue' => $totalRevenue,
            ],
            'topSellingProducts' => $topSellingProducts,
            'lowStockItems' => $lowStockItems,
            'recentProducts' => $recentProducts,
            'monthlySales' => $monthlySales,
            'categoryPerformance' => $categoryPerformance,
            'marketplaceSettings' => $formattedSettings,
        ]);
    }

    /**
     * Delete vendor store profile
     */
    public function destroy()
    {
        $vendor = Auth::user()->vendor;

        if (!$vendor) {
            return redirect()->route('marketplace.index')
                ->with('error', 'Vendor profile not found.');
        }

        // Check if vendor has active orders
        $activeOrders = $vendor->orders()
            ->whereNotIn('status', ['delivered', 'cancelled', 'refunded'])
            ->count();

        if ($activeOrders > 0) {
            return back()->with('error', 'Cannot delete store with active orders. Please complete or cancel all pending orders first.');
        }

        // Delete all vendor products
        $vendor->products()->delete();

        // Delete vendor subscriptions
        $vendor->subscriptions()->delete();

        // Delete vendor
        $vendor->delete();

        return redirect()->route('marketplace.index')
            ->with('success', 'Your vendor store has been permanently deleted.');
    }
}
