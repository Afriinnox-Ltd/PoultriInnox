<?php

namespace App\Modules\Marketplace\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Marketplace\Models\Vendor;
use App\Modules\Marketplace\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Notifications\VendorSuspensionNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class VendorAdminController extends Controller
{
    /**
     * Display a listing of vendors.
     */
    public function index(Request $request)
    {
        $query = Vendor::with('user')->withCount(['products', 'orders']);

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('business_name', 'like', '%' . $search . '%')
                    ->orWhere('business_email', 'like', '%' . $search . '%')
                    ->orWhere('business_description', 'like', '%' . $search . '%')
                    ->orWhereHas('user', function($userQuery) use ($search) {
                        $userQuery->where('name', 'like', '%' . $search . '%')
                                ->orWhere('email', 'like', '%' . $search . '%');
                    });
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status != '') {
            $query->where('status', $request->status);
        }

        // Filter by verification status
        if ($request->has('verification') && $request->verification != '') {
            $query->where('is_verified', $request->verification== 'verified');
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

        $vendors = $query->paginate(15);

        // Get statistics
        $stats = [
            'total' => Vendor::count(),
            'pending' => Vendor::where('status', 'pending')->count(),
            'approved' => Vendor::where('status', 'approved')->count(),
            'rejected' => Vendor::where('status', 'rejected')->count(),
            'suspended' => Vendor::where('status', 'suspended')->count(),
        ];

        return Inertia::render('Admin/Marketplace/Vendors/Index', [
            'vendors' => $vendors,
            'filters' => $request->only(['search', 'status', 'verification', 'date_from', 'date_to', 'sort_by', 'sort_direction']),
            'stats' => $stats,
            'status_options' => [
                'pending' => 'Pending',
                'approved' => 'Approved',
                'rejected' => 'Rejected',
                'suspended' => 'Suspended',
            ],
        ]);
    }

    /**
     * Display the specified vendor.
     */
    public function show(Vendor $vendor)
    {
        $vendor->load([
            'user',
            'products' => function($query) {
                $query->withCount('orderItems')->latest()->take(10);
            },
            'orders' => function($query) {
                $query->with('user')->latest()->take(10);
            }
        ]);

        // Calculate vendor statistics
        $stats = [
            'total_products' => $vendor->products()->count(),
            'active_products' => $vendor->products()->where('status', 'active')->count(),
            'total_orders' => $vendor->orders()->count(),
            'completed_orders' => $vendor->orders()->where('status', 'completed')->count(),
            'total_revenue' => $vendor->orders()->where('status', 'completed')->sum('total_amount'),
            'average_rating' => $vendor->products()->avg('rating') ?? 0,
        ];

        return Inertia::render('Admin/Marketplace/Vendors/Show', [
            'vendor' => $vendor,
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for creating a new vendor.
     */
    public function create()
    {
        $availableUsers = User::whereDoesntHave('vendor')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('Admin/Marketplace/Vendors/Create', [
            'users' => $availableUsers,
        ]);
    }

    /**
     * Store a newly created vendor.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id|unique:marketplace_vendors,user_id',
            'business_name' => 'required|string|max:255',
            'business_type' => 'nullable|string|max:100',
            'business_description' => 'nullable|string',
            'business_email' => 'required|email|max:255',
            'business_phone' => 'required|string|max:30',
            'business_website' => 'nullable|url|max:255',
            'business_address' => 'required|string|max:500',
            'business_registration_number' => 'nullable|string|max:100',
            'city' => 'required|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'required|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'bank_name' => 'nullable|string|max:255',
            'bank_account_number' => 'nullable|string|max:50',
            'bank_account_name' => 'nullable|string|max:255',
            'bank_branch' => 'nullable|string|max:255',
            'tax_id' => 'nullable|string|max:50',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'years_in_business' => 'nullable|integer|min:0',
            'status' => 'required|in:pending,approved',
            'is_verified' => 'nullable|boolean',
            'additional_info' => 'nullable|string',
            'admin_notes' => 'nullable|string|max:2000',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Generate slug
        $slug = Str::slug($validated['business_name']);
        $count = Vendor::where('slug', $slug)->count();
        $validated['slug'] = $count > 0 ? $slug . '-' . ($count + 1) : $slug;

        // Handle logo upload
        if ($request->hasFile('logo')) {
            $validated['logo'] = '/storage/' . $request->file('logo')->store('marketplace/vendors/logos', 'public');
        }

        // Set defaults
        $validated['is_active'] = true;
        if (!empty($validated['is_verified'])) {
            $validated['verified_at'] = now();
        }
        if ($validated['status'] == 'approved') {
            $validated['approved_at'] = now();
        }

        // Set contact info from user
        $user = User::findOrFail($validated['user_id']);
        $validated['email'] = $user->email;
        $validated['phone'] = $validated['business_phone'];

        $vendor = Vendor::create($validated);

        // Auto-assign free subscription plan if available
        $freePlan = SubscriptionPlan::where('price', 0)->where('is_active', 1)->first();
        if ($freePlan) {
            Subscription::create([
                'vendor_id' => $vendor->id,
                'plan_id' => $freePlan->id,
                'start_date' => now(),
                'end_date' => null,
                'is_active' => true,
            ]);
        }

        return redirect()->route('admin.marketplace.vendors.show', $vendor)
            ->with('success', 'Vendor created successfully.');
    }

    /**
     * Approve a vendor.
     */
    public function approve(Request $request, Vendor $vendor)
    {
        $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        $vendor->update([
            'status' => 'approved',
            'is_verified' => true,
            'is_active' => true,
            'verification_notes' => $request->notes,
            'approved_at' => now(),
            'admin_notes' => $request->notes,
        ]);

        // Send notification to vendor
        // TODO: Add notification logic

        return back()->with('success', 'Vendor approved successfully.');
    }

    /**
     * Reject a vendor.
     */
    public function reject(Request $request, Vendor $vendor)
    {
        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $vendor->update([
            'status' => 'rejected',
            'is_verified' => false,
            'rejection_reason' => $request->reason,
            'admin_notes' => $request->get('notes'),
        ]);

        // Send notification to vendor
        // TODO: Add notification logic

        return back()->with('success', 'Vendor rejected successfully.');
    }

    /**
     * Suspend a vendor.
     */
    public function suspend(Request $request, Vendor $vendor)
    {
        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);


        try {
            $vendor->update([
                'status' => 'suspended',
                'is_verified' => false,
                'suspension_reason' => $request->reason,
                'suspended_at' => now(),
                'admin_notes' => $request->get('notes'),
            ]);

            // Deactivate all vendor products
            $vendor->products()->update(['status' => 'inactive']);

            // Send suspension notification to vendor
            if ($vendor->user) {
                $vendor->user->notify(new VendorSuspensionNotification($vendor, $request->reason));
            }

            return back()->with('success', 'Vendor suspended successfully. Notification sent to vendor.');
        } catch (\Throwable $th) {
            dd($th);
            return back()->with('error', 'Failed to suspend vendor: ' . $th->getMessage());
        }


    }

    /**
     * Reactivate a suspended vendor.
     */
    public function reactivate(Request $request, Vendor $vendor)
    {
        $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        $vendor->update([
            'status' => 'approved',
            'is_verified' => true,
            'suspension_reason' => null,
            'suspended_at' => null,
            'admin_notes' => $request->notes,
        ]);

        // Reactivate vendor products (if they were active before suspension)
        // This is a simplified approach - in production you might want to track previous states
        $vendor->products()->where('status', 'inactive')->update(['status' => 'active']);

        // Send notification to vendor
        // TODO: Add notification logic

        return back()->with('success', 'Vendor reactivated successfully.');
    }

    /**
     * Toggle vendor verification status.
     */
    public function toggleVerification(Vendor $vendor)
    {
        $newVerificationStatus = !$vendor->is_verified;

        $vendor->update([
            'is_verified' => $newVerificationStatus,
            'verified_at' => $newVerificationStatus ? now() : null,
        ]);

        $status = $newVerificationStatus ? 'verified' : 'unverified';

        return back()->with('success', "Vendor {$status} successfully.");
    }

    /**
     * Update vendor commission rate.
     */
    public function updateCommission(Request $request, Vendor $vendor)
    {
        $request->validate([
            'commission_rate' => 'required|numeric|min:0|max:100',
            'notes' => 'nullable|string|max:1000',
        ]);

        $vendor->update([
            'commission_rate' => $request->commission_rate,
            'admin_notes' => $request->notes,
        ]);

        return back()->with('success', 'Commission rate updated successfully.');
    }

    /**
     * Update vendor admin notes.
     */
    public function updateNotes(Request $request, Vendor $vendor)
    {
        $request->validate([
            'admin_notes' => 'nullable|string|max:2000',
        ]);

        $vendor->update([
            'admin_notes' => $request->admin_notes,
        ]);

        return back()->with('success', 'Admin notes updated successfully.');
    }

    /**
     * Send a specific message/email to a vendor.
     */
    public function sendMessage(Request $request, Vendor $vendor)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        if ($vendor->user) {
            // Send email
            try {
                // Using a generic notification for now, or raw mail if no notification class exists
                // For better structure, we should creat a generic VendorMessageNotification
                // But for now, let's assuming we can send a simple notification
                $vendor->user->notify(new \App\Notifications\VendorMessageNotification($request->subject, $request->message));
                
                return back()->with('success', 'Message sent to vendor successfully.');
            } catch (\Exception $e) {
                // Fallback or error logging
                return back()->with('error', 'Failed to send email: ' . $e->getMessage());
            }
        }

        return back()->with('error', 'Vendor has no associated user account.');
    }

    /**
     * Request changes from a vendor (updates status to changes_requested).
     */
    public function requestChanges(Request $request, Vendor $vendor)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $vendor->update([
            'status' => 'changes_requested',
            'admin_notes' => $request->message // Optionally save the message as a note
        ]);

        if ($vendor->user) {
            try {
                // Send email notification
                $vendor->user->notify(new \App\Notifications\VendorMessageNotification($request->subject, $request->message));
                
                return back()->with('success', 'Changes requested successfully. Vendor has been notified.');
            } catch (\Exception $e) {
                return back()->with('warning', 'Changes requested, but failed to send email: ' . $e->getMessage());
            }
        }

        return back()->with('success', 'Changes requested successfully.');
    }

    /**
     * Bulk actions for vendors.
     */
    public function bulkAction(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|in:approve,reject,suspend,verify,unverify',
            'vendor_ids' => 'required|array|min:1',
            'vendor_ids.*' => 'exists:marketplace_vendors,id',
            'reason' => 'required_if:action,reject,suspend|string|max:1000',
            'notes' => 'nullable|string|max:1000',
        ]);

        $vendors = Vendor::whereIn('id', $validated['vendor_ids']);

        switch ($validated['action']) {
            case 'approve':
                $vendors->update([
                    'status' => 'approved',
                    'is_verified' => true,
                    'approved_at' => now(),
                    'admin_notes' => $validated['notes'] ?? null,
                ]);
                $message = 'Vendors approved successfully.';
                break;

            case 'reject':
                $vendors->update([
                    'status' => 'rejected',
                    'is_verified' => false,
                    'rejection_reason' => $validated['reason'],
                    'admin_notes' => $validated['notes'] ?? null,
                ]);
                $message = 'Vendors rejected successfully.';
                break;

            case 'suspend':
                $vendors->update([
                    'status' => 'suspended',
                    'is_verified' => false,
                    'suspension_reason' => $validated['reason'],
                    'suspended_at' => now(),
                    'admin_notes' => $validated['notes'] ?? null,
                ]);

                // Deactivate all products for suspended vendors
                $vendor_ids = $validated['vendor_ids'];
                \App\Modules\Marketplace\Models\Product::whereIn('vendor_id', $vendor_ids)
                    ->update(['status' => 'inactive']);

                // Send suspension notifications to all suspended vendors
                $suspendedVendors = Vendor::whereIn('id', $vendor_ids)->with('user')->get();
                foreach ($suspendedVendors as $vendor) {
                    if ($vendor->user) {
                        $vendor->user->notify(new VendorSuspensionNotification($vendor, $validated['reason']));
                    }
                }

                $message = 'Vendors suspended successfully. Notifications sent to all affected vendors.';
                break;

            case 'verify':
                $vendors->update([
                    'is_verified' => true,
                    'verified_at' => now(),
                ]);
                $message = 'Vendors verified successfully.';
                break;

            case 'unverify':
                $vendors->update([
                    'is_verified' => false,
                    'verified_at' => null,
                ]);
                $message = 'Vendors unverified successfully.';
                break;
        }

        // TODO: Send bulk notifications to vendors

        return back()->with('success', $message);
    }

    /**
     * Get vendor statistics for dashboard.
     */
    public function getStatistics()
    {
        $stats = [
            'total' => Vendor::count(),
            'pending' => Vendor::where('status', 'pending')->count(),
            'approved' => Vendor::where('status', 'approved')->count(),
            'rejected' => Vendor::where('status', 'rejected')->count(),
            'suspended' => Vendor::where('status', 'suspended')->count(),
            'verified' => Vendor::where('is_verified', true)->count(),
            'this_month' => Vendor::whereMonth('created_at', now()->month)->count(),
            'this_week' => Vendor::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Show the form for editing the specified vendor.
     */
    public function edit(Vendor $vendor)
    {
        $vendor->load('user');

        return Inertia::render('Admin/Marketplace/Vendors/Edit', [
            'vendor' => $vendor,
        ]);
    }

    /**
     * Update the specified vendor.
     */
    public function update(Request $request, Vendor $vendor)
    {
        $validated = $request->validate([
            'business_name' => 'required|string|max:255',
            'business_type' => 'nullable|string|max:100',
            'business_description' => 'nullable|string',
            'business_email' => 'nullable|email|max:255',
            'business_phone' => 'nullable|string|max:30',
            'business_website' => 'nullable|url|max:255',
            'business_address' => 'nullable|string|max:500',
            'business_registration_number' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'bank_name' => 'nullable|string|max:255',
            'bank_account_number' => 'nullable|string|max:50',
            'bank_account_name' => 'nullable|string|max:255',
            'bank_branch' => 'nullable|string|max:255',
            'tax_id' => 'nullable|string|max:50',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'years_in_business' => 'nullable|integer|min:0',
            'status' => 'nullable|in:pending,approved,rejected,suspended,changes_requested',
            'is_verified' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'additional_info' => 'nullable|string',
            'admin_notes' => 'nullable|string|max:2000',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'remove_logo' => 'nullable|boolean',
        ]);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            // Delete old logo
            if ($vendor->logo) {
                $oldPath = str_replace('/storage/', '', parse_url($vendor->logo, PHP_URL_PATH) ?? '');
                Storage::disk('public')->delete($oldPath);
            }
            $validated['logo'] = '/storage/' . $request->file('logo')->store('marketplace/vendors/logos', 'public');
        } elseif ($request->boolean('remove_logo') && $vendor->logo) {
            $oldPath = str_replace('/storage/', '', parse_url($vendor->logo, PHP_URL_PATH) ?? '');
            Storage::disk('public')->delete($oldPath);
            $validated['logo'] = null;
        }
        unset($validated['remove_logo']);

        // Update slug if business name changed
        if ($validated['business_name'] !== $vendor->business_name) {
            $slug = Str::slug($validated['business_name']);
            $count = Vendor::where('slug', $slug)->where('id', '!=', $vendor->id)->count();
            $validated['slug'] = $count > 0 ? $slug . '-' . ($count + 1) : $slug;
        }

        // Handle verification changes
        if (isset($validated['is_verified']) && $validated['is_verified'] !== $vendor->is_verified) {
            $validated['verified_at'] = $validated['is_verified'] ? now() : null;
        }

        $vendor->update($validated);

        return redirect()->route('admin.marketplace.vendors.show', $vendor)
            ->with('success', 'Vendor updated successfully.');
    }

    /**
     * Delete the specified vendor.
     */
    public function destroy(Vendor $vendor)
    {
        // Check for active orders
        $activeOrders = $vendor->orders()
            ->whereNotIn('status', ['completed', 'cancelled', 'refunded'])
            ->count();

        if ($activeOrders > 0) {
            return back()->with('error', "Cannot delete vendor with {$activeOrders} active order(s).");
        }

        // Delete logo
        if ($vendor->logo) {
            $oldPath = str_replace('/storage/', '', parse_url($vendor->logo, PHP_URL_PATH) ?? '');
            Storage::disk('public')->delete($oldPath);
        }

        // Delete product images
        foreach ($vendor->products as $product) {
            Storage::disk('public')->deleteDirectory("marketplace/products/{$product->id}");
        }

        // Delete products (cascade will handle images, cart items etc.)
        $vendor->products()->delete();

        $vendor->delete();

        return redirect()->route('admin.marketplace.vendors.index')
            ->with('success', 'Vendor deleted successfully.');
    }
}
