<?php

namespace App\Http\Controllers\Partner;

use App\Http\Controllers\Controller;
use App\Mail\PartnerAccountCreatedMail;
use App\Models\PartnerApplication;
use App\Models\PartnerProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PartnerApplicationController extends Controller
{
    /**
     * Show the public apply form.
     */
    public function create()
    {
        return Inertia::render('Public/PartnerApply');
    }

    /**
     * Store a new application from the public form.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'business_name' => 'required|string|max:200',
            'partner_type'  => 'required|in:hotel,restaurant,catering,other',
            'contact_person'=> 'required|string|max:150',
            'email'         => 'required|email|unique:partner_applications,email|unique:users,email',
            'phone'         => 'nullable|string|max:30',
            'address'       => 'nullable|string|max:500',
            'city'          => 'nullable|string|max:100',
            'country'       => 'nullable|string|max:100',
            'notes'         => 'nullable|string|max:1000',
        ]);

        PartnerApplication::create($validated);
   
        return back()->with('success', 'Your application has been submitted. We will review it and get back to you within 24 hours.');
    }

    // ─── Admin methods ────────────────────────────────────────────

    /**
     * List all partner applications (admin).
     */
    public function index(Request $request)
    {
        $query = PartnerApplication::latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('business_name', 'like', "%$s%")
                  ->orWhere('email', 'like', "%$s%")
                  ->orWhere('contact_person', 'like', "%$s%");
            });
        }

        $applications = $query->paginate(20)->withQueryString();

        return Inertia::render('Admin/Partners/Applications/Index', [
            'applications' => $applications,
            'filters'      => $request->only(['search', 'status']),
            'counts'       => [
                'pending'  => PartnerApplication::where('status', 'pending')->count(),
                'approved' => PartnerApplication::where('status', 'approved')->count(),
                'rejected' => PartnerApplication::where('status', 'rejected')->count(),
            ],
        ]);
    }

    /**
     * Show a single application (admin).
     */
    public function show(PartnerApplication $application)
    {
        return Inertia::render('Admin/Partners/Applications/Show', [
            'application' => $application->load('reviewer'),
        ]);
    }

    /**
     * Approve an application: create user + partner profile, send credentials.
     */
    public function approve(Request $request, PartnerApplication $application)
    {
        if (! $application->isPending()) {
            return back()->with('error', 'This application has already been reviewed.');
        }

        $request->validate([
            'admin_notes' => 'nullable|string|max:500',
        ]);

        // Check if email already registered
        if (User::where('email', $application->email)->exists()) {
            return back()->with('error', 'A user with this email already exists.');
        }

        $tempPassword = Str::random(12);

        // Create the user account
        $user = User::create([
            'name'     => $application->contact_person,
            'email'    => $application->email,
            'password' => bcrypt($tempPassword),
            'role'     => 'partner',
        ]);

        // Create the partner profile
        PartnerProfile::create([
            'user_id'        => $user->id,
            'business_name'  => $application->business_name,
            'partner_type'   => $application->partner_type,
            'contact_person' => $application->contact_person,
            'phone'          => $application->phone,
            'address'        => $application->address,
            'city'           => $application->city,
            'country'        => $application->country,
            'is_verified'    => true,
            'is_active'      => true,
        ]);

        // Mark application as approved
        $application->update([
            'status'      => 'approved',
            'admin_notes' => $request->admin_notes,
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
        ]);

        // Send credentials email
        Mail::to($application->email)->send(
            new PartnerAccountCreatedMail($application, $tempPassword, url('/partner/dashboard'))
        );

        return back()->with('success', 'Application approved. Account created and credentials sent to ' . $application->email);
    }

    /**
     * Reject an application (admin).
     */
    public function reject(Request $request, PartnerApplication $application)
    {
        if (! $application->isPending()) {
            return back()->with('error', 'This application has already been reviewed.');
        }

        $request->validate([
            'rejection_reason' => 'required|string|max:500',
            'admin_notes'      => 'nullable|string|max:500',
        ]);

        $application->update([
            'status'           => 'rejected',
            'rejection_reason' => $request->rejection_reason,
            'admin_notes'      => $request->admin_notes,
            'reviewed_by'      => Auth::id(),
            'reviewed_at'      => now(),
        ]);

        return back()->with('success', 'Application rejected.');
    }
}
