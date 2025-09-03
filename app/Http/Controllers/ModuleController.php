<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\UserModule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ModuleController extends Controller
{
    /**
     * Display available modules for the user
     */
    public function index()
    {
        $user = Auth::user();

        // Get all active modules with user's activation status
        $modules = Module::where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(function ($module) use ($user) {
                $userModule = $user->modules()
                    ->where('module_id', $module->id)
                    ->first();

                return [
                    'id' => $module->id,
                    'name' => $module->name,
                    'slug' => $module->slug,
                    'description' => $module->description,
                    'icon' => $module->icon,
                    'version' => $module->version,
                    'config' => $module->config,
                    'is_enabled' => $userModule ? $userModule->pivot->is_enabled : false,
                    'is_activated' => (bool) $userModule,
                    'activated_at' => $userModule?->pivot->activated_at,
                ];
            });

        return Inertia::render('modules/index', [
            'modules' => $modules,
        ]);
    }

    /**
     * Activate a module for the current user
     */
    public function activate(Request $request, Module $module)
    {
        $user = Auth::user();

        // Check if module is already activated
        $userModule = UserModule::where('user_id', $user->id)
            ->where('module_id', $module->id)
            ->first();

        if ($userModule) {
            // Update existing record
            $userModule->update([
                'is_enabled' => true,
                'activated_at' => now(),
            ]);
        } else {
            // Create new activation
            UserModule::create([
                'user_id' => $user->id,
                'module_id' => $module->id,
                'is_enabled' => true,
                'activated_at' => now(),
            ]);
        }

        return redirect()->back()->with('success', "Module '{$module->name}' has been activated!");
    }

    /**
     * Deactivate a module for the current user
     */
    public function deactivate(Request $request, Module $module)
    {
        $user = Auth::user();

        UserModule::where('user_id', $user->id)
            ->where('module_id', $module->id)
            ->update(['is_enabled' => false]);

        return redirect()->back()->with('success', "Module '{$module->name}' has been deactivated!");
    }

    /**
     * Get user's enabled modules (for API/Ajax calls)
     */
    public function enabled()
    {
        $user = Auth::user();

        $enabledModules = $user->enabledModules()->get()->map(function ($module) {
            return [
                'id' => $module->id,
                'name' => $module->name,
                'slug' => $module->slug,
                'description' => $module->description,
                'icon' => $module->icon,
                'config' => $module->config,
            ];
        });

        return response()->json($enabledModules);
    }
}
