<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Module;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class ModuleController extends Controller
{
    /**
     * Display all modules for admin management
     */
    public function index()
    {
        $modules = Module::orderBy('sort_order')->get();

        return Inertia::render('Admin/Modules/Index', [
            'modules' => $modules->map(function ($module) {
                return [
                    'id' => $module->id,
                    'name' => $module->name,
                    'slug' => $module->slug,
                    'code' => $module->code,
                    'description' => $module->description,
                    'icon' => $module->icon,
                    'version' => $module->version,
                    'is_active' => $module->is_active,
                    'is_core' => $module->is_core,
                    'dependencies' => $module->dependencies ?? [],
                    'config' => $module->config,
                    'sort_order' => $module->sort_order,
                    'users_count' => $module->users()->count(),
                ];
            })
        ]);
    }

    /**
     * Toggle module active status
     */
    public function toggleStatus(Module $module)
    {
        try {
            // Check if module is core - core modules cannot be disabled
            if ($module->is_core && $module->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'Core modules cannot be disabled.'
                ], 400);
            }

            // If disabling, check if other active modules depend on this one
            if ($module->is_active) {
                $dependentModules = Module::where('is_active', true)
                    ->get()
                    ->filter(function ($mod) use ($module) {
                        return in_array($module->slug, $mod->dependencies ?? []);
                    });

                if ($dependentModules->isNotEmpty()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cannot disable this module. The following modules depend on it: ' .
                            $dependentModules->pluck('name')->join(', '),
                        'dependent_modules' => $dependentModules->pluck('name')->toArray()
                    ], 400);
                }
            }

            // Toggle the status
            $module->is_active = !$module->is_active;
            $module->save();

            return redirect()->back()->with('success', $module->is_active
                ? "Module '{$module->name}' has been enabled."
                : "Module '{$module->name}' has been disabled.");

        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Update module configuration
     */
    public function update(Request $request, Module $module)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'icon' => 'sometimes|string|max:50',
            'version' => 'sometimes|string|max:20',
            'sort_order' => 'sometimes|integer|min:0',
            'config' => 'sometimes|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid input',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $module->update($request->only([
                'name',
                'description',
                'icon',
                'version',
                'sort_order',
                'config'
            ]));

            return response()->json([
                'success' => true,
                'message' => "Module '{$module->name}' has been updated successfully.",
                'module' => $module
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update module: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get module statistics
     */
    public function statistics()
    {
        $totalModules = Module::count();
        $activeModules = Module::where('is_active', true)->count();
        $inactiveModules = Module::where('is_active', false)->count();

        $moduleUsage = Module::withCount('users')->get()->map(function ($module) {
            return [
                'name' => $module->name,
                'users_count' => $module->users_count
            ];
        });

        return response()->json([
            'total_modules' => $totalModules,
            'active_modules' => $activeModules,
            'inactive_modules' => $inactiveModules,
            'module_usage' => $moduleUsage
        ]);
    }
}
