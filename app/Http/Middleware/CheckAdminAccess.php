<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CheckAdminAccess
{
    /**
     * Handle an incoming request.
     *
     * Allows access for admin users or any user that has at least one permission assigned via their role.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        // Ensure user is authenticated
        if (!$user) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }
            return redirect()->route('login');
        }

        // Allow admin role or any user with assigned permissions
        $hasAccess = $user->isAdmin() || count($user->getPermissions()) > 0;

        if (!$hasAccess) {
            // Log security event
            Log::warning('Unauthorized admin access attempt', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'role' => $user->role,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'url' => $request->fullUrl(),
            ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'Admin access required',
                    'message' => 'You do not have permissions to access the admin panel.'
                ], 403);
            }

            abort(403, 'Admin access required');
        }

        return $next($request);
    }
}
