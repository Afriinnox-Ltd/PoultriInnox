<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckVendorAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('login');
        }

        // Check if user has an approved vendor account
        $vendor = $user->vendor;

        if (!$vendor) {
            return redirect()->route('marketplace.vendor.register')
                ->with('error', 'You need to register as a vendor to access this area.');
        }

        if ($vendor->verification_status != 'verified') {
            return redirect()->route('marketplace.index')
                ->with('error', 'Your vendor application is pending verification or has been rejected.');
        }

        return $next($request);
    }
}
