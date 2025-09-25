<?php

namespace App\Modules\Marketplace\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Marketplace\Models\Vendor;
use App\Models\User;
use Illuminate\Http\Request;
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
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        // Filter by verification status
        if ($request->has('verification') && $request->verification !== '') {
            $query->where('is_verified', $request->verification === 'verified');
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
            'filters' => $request->only(['search', 'status', 'verification', 'sort_by', 'sort_direction']),
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

            // Send notification to vendor
            // TODO: Add notification logic

            return back()->with('success', 'Vendor suspended successfully.');
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

                $message = 'Vendors suspended successfully.';
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
}
