<?php

namespace App\Modules\Marketplace\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Marketplace\Models\Vendor;
use App\Modules\Marketplace\Models\Product;
use App\Models\User;
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
     * Display a listing of vendors.
     */
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

        return Inertia::render('Marketplace/Vendors/Index', [
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

        return Inertia::render('modules/marketplace/vendor/register', [
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
            'business_type' => 'required|in:individual,company,cooperative',
            'business_description' => 'required|string',
            'business_address' => 'required|string',
            'business_phone' => 'required|string|max:20',
            'business_email' => 'required|email|max:255',
            'business_website' => 'nullable|url|max:255',

            // Banking details
            'bank_name' => 'required|string|max:255',
            'bank_account_number' => 'required|string|max:50',
            'bank_account_name' => 'required|string|max:255',
            'bank_branch' => 'nullable|string|max:255',

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

        // Ensure slug is unique
        $originalSlug = $vendorData['slug'];
        $counter = 1;
        while (Vendor::where('slug', $vendorData['slug'])->exists()) {
            $vendorData['slug'] = $originalSlug . '-' . $counter;
            $counter++;
        }

        Vendor::create($vendorData);

        return redirect()->route('marketplace.vendor.pending')
            ->with('success', 'Vendor registration submitted successfully! Your application is pending review.');
    }

    /**
     * Display the specified vendor profile.
     */
    public function show(Vendor $vendor)
    {
        $vendor->load(['user', 'products' => function ($query) {
            $query->where('status', 'active')->with(['images', 'category']);
        }]);

        return Inertia::render('Marketplace/Vendors/Show', [
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

        // Calculate comprehensive statistics
        $stats = [
            'total_products' => $vendor->products()->count(),
            'active_products' => $vendor->products()->where('status', 'active')->count(),
            'pending_products' => $vendor->products()->where('status', 'pending')->count(),
            'draft_products' => $vendor->products()->where('status', 'draft')->count(),
            'total_orders' => 0, // Will be implemented when order system is ready
            'pending_orders' => 0, // Will be implemented when order system is ready
            'completed_orders' => 0, // Will be implemented when order system is ready
            'total_revenue' => $vendor->total_sales ?? 0,
            'monthly_revenue' => 0, // Will be calculated when order system is ready
            'avg_rating' => $vendor->rating ?? 0,
            'total_reviews' => $vendor->total_reviews ?? 0,
            'status' => $vendor->status,
            'is_verified' => $vendor->is_verified,
            'response_rate' => 98, // This would be calculated from actual data
            'on_time_delivery' => 95, // This would be calculated from actual delivery data
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

        // Recent orders (if orders table exists)
        $recentOrders = collect(); // This would be populated when order system is implemented

        // Top performing products
        $topProducts = $vendor->products()
            ->where('status', 'active')
            ->orderBy('total_sales', 'desc')
            ->limit(5)
            ->get();

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

        return Inertia::render('modules/marketplace/vendor/dashboard', [
            'vendor' => $vendorProfile,
            'stats' => $stats,
            'recentProducts' => $recentProducts,
            'lowStockProducts' => $lowStockProducts,
            'recent_orders' => $recentOrders,
            'products' => $vendor->products()->with(['category', 'images'])->latest()->get(),
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

        return Inertia::render('modules/marketplace/vendor/profile', [
            'vendor' => $vendorData
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
            $updateData['logo'] = '/storage/' . $logoPath;
        }

        if ($request->hasFile('banner_image')) {
            // Delete old banner if exists
            if ($vendor->banner_image) {
                Storage::delete(str_replace('/storage/', '', $vendor->banner_image));
            }

            $bannerPath = $request->file('banner_image')->store('vendor-banners', 'public');
            $updateData['banner_image'] = '/storage/' . $bannerPath;
        }

        // Update vendor record
        $vendor->update($updateData);

        return redirect()->back()->with('success', 'Vendor profile updated successfully!');
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

        return Inertia::render('Marketplace/Vendors/Pending', [
            'vendor' => $vendor
        ]);
    }

    /**
     * Admin: List all vendor applications.
     */
    public function adminIndex(Request $request)
    {
        $this->authorize('viewAny', Vendor::class);

        $query = Vendor::with('user');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('business_name', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%")
                               ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        $vendors = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Admin/Vendors/Index', [
            'vendors' => $vendors,
            'filters' => $request->only(['status', 'search'])
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
}
