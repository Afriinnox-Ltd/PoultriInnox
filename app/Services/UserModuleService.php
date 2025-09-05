<?php

namespace App\Services;

use App\Models\Module;
use App\Models\User;
use App\Models\UserModule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UserModuleService
{
    /**
     * Enable a module for a user with security checks
     */
    public function enableModule(User $user, string $moduleSlug): array
    {
        try {
            DB::beginTransaction();

            // Get the module with validation
            $module = Module::where('slug', $moduleSlug)
                           ->where('is_active', true)
                           ->first();

            if (!$module) {
                return [
                    'success' => false,
                    'message' => 'Module not found or inactive'
                ];
            }

            // Check if already enabled
            $existing = UserModule::where('user_id', $user->id)
                                 ->where('module_id', $module->id)
                                 ->first();

            if ($existing && $existing->is_enabled) {
                return [
                    'success' => false,
                    'message' => 'Module is already enabled'
                ];
            }

            // Check dependencies
            if (!$module->hasDependenciesSatisfied($user->id)) {
                $missingDeps = $module->getMissingDependencies($user->id);
                return [
                    'success' => false,
                    'message' => 'Module dependencies not satisfied',
                    'missing_dependencies' => $missingDeps
                ];
            }

            // Enable the module
            if ($existing) {
                $existing->update([
                    'is_enabled' => true,
                    'activated_at' => now()
                ]);
            } else {
                UserModule::create([
                    'user_id' => $user->id,
                    'module_id' => $module->id,
                    'is_enabled' => true,
                    'activated_at' => now()
                ]);
            }

            // Log the action
            Log::info('Module enabled for user', [
                'user_id' => $user->id,
                'module_slug' => $moduleSlug,
                'module_name' => $module->name
            ]);

            DB::commit();

            return [
                'success' => true,
                'message' => "Module {$module->name} enabled successfully"
            ];

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to enable module', [
                'user_id' => $user->id,
                'module_slug' => $moduleSlug,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Failed to enable module'
            ];
        }
    }

    /**
     * Disable a module for a user with security checks
     */
    public function disableModule(User $user, string $moduleSlug): array
    {
        try {
            DB::beginTransaction();

            // Get the module
            $module = Module::where('slug', $moduleSlug)->first();

            if (!$module) {
                return [
                    'success' => false,
                    'message' => 'Module not found'
                ];
            }

            // Check if module can be disabled (no dependent modules)
            if (!$module->canBeDisabled($user->id)) {
                $dependentModules = $module->getDependentModules($user->id);
                return [
                    'success' => false,
                    'message' => 'Cannot disable module: other modules depend on it',
                    'dependent_modules' => array_map(fn($m) => $m->name, $dependentModules)
                ];
            }

            // Disable the module
            $userModule = UserModule::where('user_id', $user->id)
                                   ->where('module_id', $module->id)
                                   ->first();

            if ($userModule) {
                $userModule->update(['is_enabled' => false]);
            }

            // Log the action
            Log::info('Module disabled for user', [
                'user_id' => $user->id,
                'module_slug' => $moduleSlug,
                'module_name' => $module->name
            ]);

            DB::commit();

            return [
                'success' => true,
                'message' => "Module {$module->name} disabled successfully"
            ];

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to disable module', [
                'user_id' => $user->id,
                'module_slug' => $moduleSlug,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Failed to disable module'
            ];
        }
    }

    /**
     * Get user's module status with validation
     */
    public function getUserModuleStatus(User $user): array
    {
        $enabledModules = Module::enabledForUser($user->id)->map(function ($module) {
            return [
                'slug' => $module->slug,
                'name' => $module->name,
                'description' => $module->description,
                'icon' => $module->icon,
                'version' => $module->version
            ];
        });

        $availableModules = Module::availableWithDependenciesForUser($user->id)->map(function ($module) {
            return [
                'slug' => $module->slug,
                'name' => $module->name,
                'description' => $module->description,
                'icon' => $module->icon,
                'version' => $module->version,
                'dependencies' => $module->dependencies ?? []
            ];
        });

        return [
            'enabled' => $enabledModules,
            'available' => $availableModules
        ];
    }

    /**
     * Validate user has access to specific module
     */
    public function validateUserModuleAccess(User $user, string $moduleSlug): bool
    {
        $module = Module::where('slug', $moduleSlug)
                       ->where('is_active', true)
                       ->first();

        if (!$module) {
            return false;
        }

        $userModule = UserModule::where('user_id', $user->id)
                               ->where('module_id', $module->id)
                               ->where('is_enabled', true)
                               ->exists();

        return $userModule && $module->hasDependenciesSatisfied($user->id);
    }
}
