<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param string $permission Comma-separated permission slugs (user needs ANY of them)
     */
    public function handle(Request $request, Closure $next, string $permission)
    {
        $user = Auth::user();

        if (!$user) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }
            return redirect()->route('login');
        }

        $permissions = array_map('trim', explode(',', $permission));

        if (!$user->hasAnyPermission($permissions)) {
            Log::warning('Unauthorized permission access attempt', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'role' => $user->role,
                'required_permissions' => $permissions,
                'ip_address' => $request->ip(),
                'url' => $request->fullUrl(),
            ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'Insufficient permissions',
                    'message' => 'You do not have the required permissions for this action.'
                ], 403);
            }

            abort(403, 'Insufficient permissions');
        }

        return $next($request);
    }
}
