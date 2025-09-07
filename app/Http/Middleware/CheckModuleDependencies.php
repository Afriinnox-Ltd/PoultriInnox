<?php

namespace App\Http\Middleware;

use App\Models\Module;
use App\Models\UserModule;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CheckModuleDependencies
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $moduleSlug)
    {
        $user = Auth::user();

        // Ensure user is authenticated
        if (!$user) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }
            return redirect()->route('login');
        }

        // Prevent any direct bypass attempts
        if ($this->isDirectBypassAttempt($request)) {
            abort(403, 'Access denied: Direct bypass attempt detected');
        }

        // Get the module with additional validation
        $module = Module::where('slug', $moduleSlug)
                        ->where('is_active', true)
                        ->first();

        if (!$module) {
            abort(404, 'Module not found or inactive');
        }

        // CRITICAL: Check if user has this module enabled with additional security
        $userModule = UserModule::where('user_id', $user->id)
            ->where('module_id', $module->id)
            ->where('is_enabled', true)
            ->first();

        if (!$userModule) {
            // Log security event
            Log::warning('Unauthorized module access attempt', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'module_slug' => $moduleSlug,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'url' => $request->fullUrl(),
            ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'Module access denied',
                    'message' => "The {$module->name} module is not enabled for your account."
                ], 403);
            }

            return $this->redirectToModuleNotEnabled($moduleSlug);
        }

        // Verify module is still active and user access is valid
        if (!$this->validateModuleAccess($user, $module)) {
            abort(403, 'Module access validation failed');
        }

        // Check dependencies with enhanced validation
        $dependencies = $module->dependencies ?? [];

        if (!empty($dependencies)) {
            $enabledModules = Module::enabledForUser($user->id)->pluck('slug')->toArray();
            $missingDependencies = array_diff($dependencies, $enabledModules);

            if (!empty($missingDependencies)) {
                if ($request->expectsJson()) {
                    return response()->json([
                        'error' => 'Missing dependencies',
                        'missing_dependencies' => $missingDependencies,
                        'message' => "The {$module->name} module requires other modules to be enabled first."
                    ], 422);
                }

                return $this->redirectToMissingDependencies($moduleSlug, $missingDependencies);
            }
        }

        // Add security headers to prevent bypass attempts
        $response = $next($request);

        if (method_exists($response, 'headers')) {
            $response->headers->set('X-Module-Access-Validated', 'true');
            $response->headers->set('X-Frame-Options', 'DENY');
            $response->headers->set('X-Content-Type-Options', 'nosniff');
        }

        return $response;
    }

    /**
     * Detect direct bypass attempts
     */
    private function isDirectBypassAttempt(Request $request): bool
    {
        // Check for suspicious headers or parameters
        $suspiciousHeaders = [
            'X-Bypass-Module-Check',
            'X-Force-Access',
            'X-Override-Security',
            'X-Admin-Override'
        ];

        foreach ($suspiciousHeaders as $header) {
            if ($request->hasHeader($header)) {
                return true;
            }
        }

        // Check for suspicious query parameters
        $suspiciousParams = ['bypass', 'override', 'force_access', 'admin_override'];
        foreach ($suspiciousParams as $param) {
            if ($request->has($param)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Validate module access with additional security checks
     */
    private function validateModuleAccess($user, $module): bool
    {
        // Double-check user module relationship
        $userModule = UserModule::where('user_id', $user->id)
            ->where('module_id', $module->id)
            ->where('is_enabled', true)
            ->exists();

        if (!$userModule) {
            return false;
        }

        // Ensure module is still active
        if (!$module->is_active) {
            return false;
        }

        // Additional role-based checks if needed
        if ($module->is_core && !$user->hasRole('admin')) {
            // Core modules might require admin access
            return false;
        }

        return true;
    }

    /**
     * Redirect when module is not enabled
     */
    private function redirectToModuleNotEnabled(string $moduleSlug)
    {
        $module = Module::where('slug', $moduleSlug)->first();

        return Inertia::render('errors/module-not-enabled', [
            'module' => [
                'name' => $module->name,
                'slug' => $module->slug,
                'description' => $module->description,
                'icon' => $module->icon,
            ],
            'message' => "The {$module->name} module is not enabled for your account.",
            'action_text' => 'Enable Module',
            'action_url' => route('dashboard'), // Fallback to dashboard until modules settings page is created
        ]);
    }

    /**
     * Redirect when dependencies are missing
     */
    private function redirectToMissingDependencies(string $moduleSlug, array $missingDependencies)
    {
        $module = Module::where('slug', $moduleSlug)->first();
        $dependencyModules = Module::whereIn('slug', $missingDependencies)->get();

        return Inertia::render('errors/missing-dependencies', [
            'module' => [
                'name' => $module->name,
                'slug' => $module->slug,
                'description' => $module->description,
                'icon' => $module->icon,
            ],
            'missing_dependencies' => $dependencyModules->map(function ($dep) {
                return [
                    'name' => $dep->name,
                    'slug' => $dep->slug,
                    'description' => $dep->description,
                    'icon' => $dep->icon,
                ];
            }),
            'message' => "The {$module->name} module requires other modules to be enabled first.",
            'action_text' => 'Enable Required Modules',
            'action_url' => route('dashboard'), // Fallback to dashboard until modules settings page is created
        ]);
    }
}
