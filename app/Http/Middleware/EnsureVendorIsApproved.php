<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureVendorIsApproved
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Check if user is authenticated
        if (!$user) {
            return redirect()->route('login')
                ->with('error', 'You must be logged in to access vendor features.');
        }

        // Check if user has a vendor account
        $vendor = $user->vendor;

        if (!$vendor) {
            return redirect()->route('marketplace.vendor.register')
                ->with('error', 'You need to register as a vendor first.');
        }

        // Check vendor status
        switch ($vendor->status) {
            case 'pending':
                return redirect()->route('marketplace.vendor.pending')
                    ->with('info', 'Your vendor application is still pending approval.');
            case 'rejected':
                return redirect()->route('marketplace.vendor.register')
                    ->with('error', 'Your vendor application was rejected. Please contact support or submit a new application.');
            case 'suspended':
                return redirect()->route('dashboard')
                    ->with('error', 'Your vendor account has been suspended. Please contact support.');
            case 'approved':
                // Vendor is approved, continue
                break;
            default:
                return redirect()->route('marketplace.vendor.register')
                    ->with('error', 'Invalid vendor status. Please contact support.');
        }

        return $next($request);
    }
}
