<?php

namespace App\Services;

use App\Models\Module;
use App\Models\User;
use Illuminate\Support\Collection;

class ModuleDependencyService
{
    /**
     * Validate if a module can be enabled for a user
     */
    public function canEnableModule(Module $module, User $user): array
    {
        $result = [
            'can_enable' => false,
            'missing_dependencies' => [],
            'message' => ''
        ];

        // Check if module is already enabled
        if ($user->modules()->where('module_id', $module->id)->where('is_enabled', true)->exists()) {
            $result['message'] = "Module '{$module->name}' is already enabled.";
            return $result;
        }

        // Check dependencies
        $missingDependencies = $module->getMissingDependencies($user->id);

        if (empty($missingDependencies)) {
            $result['can_enable'] = true;
            $result['message'] = "Module '{$module->name}' can be enabled.";
        } else {
            $result['missing_dependencies'] = $missingDependencies;
            $dependencyNames = collect($missingDependencies)->pluck('name')->join(', ');
            $result['message'] = "Cannot enable '{$module->name}'. Missing dependencies: {$dependencyNames}";
        }

        return $result;
    }

    /**
     * Validate if a module can be disabled for a user
     */
    public function canDisableModule(Module $module, User $user): array
    {
        $result = [
            'can_disable' => false,
            'dependent_modules' => [],
            'message' => ''
        ];

        // Check if module is enabled
        if (!$user->modules()->where('module_id', $module->id)->where('is_enabled', true)->exists()) {
            $result['message'] = "Module '{$module->name}' is not enabled.";
            return $result;
        }

        // Check if other modules depend on this one
        $dependentModules = $module->getDependentModules($user->id);

        if (empty($dependentModules)) {
            $result['can_disable'] = true;
            $result['message'] = "Module '{$module->name}' can be disabled.";
        } else {
            $result['dependent_modules'] = $dependentModules;
            $dependentNames = collect($dependentModules)->pluck('name')->join(', ');
            $result['message'] = "Cannot disable '{$module->name}'. Required by: {$dependentNames}";
        }

        return $result;
    }

    /**
     * Get modules with their dependency status for a user
     */
    public function getModulesWithDependencyStatus(User $user): Collection
    {
        $allModules = Module::where('is_active', true)->orderBy('sort_order')->get();
        $enabledModules = $user->modules()->where('is_enabled', true)->pluck('modules.id');

        return $allModules->map(function ($module) use ($user, $enabledModules) {
            $isEnabled = $enabledModules->contains($module->id);
            $canEnable = !$isEnabled ? $this->canEnableModule($module, $user) : null;
            $canDisable = $isEnabled ? $this->canDisableModule($module, $user) : null;

            return [
                'module' => $module,
                'is_enabled' => $isEnabled,
                'can_enable' => $canEnable,
                'can_disable' => $canDisable,
                'missing_dependencies' => $isEnabled ? [] : $module->getMissingDependencies($user->id),
                'dependent_modules' => $isEnabled ? $module->getDependentModules($user->id) : []
            ];
        });
    }

    /**
     * Enable a module with dependency validation
     */
    public function enableModule(Module $module, User $user, array $settings = []): array
    {
        $validation = $this->canEnableModule($module, $user);

        if (!$validation['can_enable']) {
            return [
                'success' => false,
                'message' => $validation['message'],
                'missing_dependencies' => $validation['missing_dependencies']
            ];
        }

        // Enable the module
        $user->modules()->syncWithoutDetaching([
            $module->id => [
                'is_enabled' => true,
                'settings' => $settings,
                'activated_at' => now()
            ]
        ]);

        return [
            'success' => true,
            'message' => "Module '{$module->name}' has been enabled successfully."
        ];
    }

    /**
     * Disable a module with dependency validation
     */
    public function disableModule(Module $module, User $user): array
    {
        $validation = $this->canDisableModule($module, $user);

        if (!$validation['can_disable']) {
            return [
                'success' => false,
                'message' => $validation['message'],
                'dependent_modules' => $validation['dependent_modules']
            ];
        }

        // Disable the module
        $user->modules()->updateExistingPivot($module->id, [
            'is_enabled' => false
        ]);

        return [
            'success' => true,
            'message' => "Module '{$module->name}' has been disabled successfully."
        ];
    }

    /**
     * Auto-enable required dependencies when enabling a module
     */
    public function enableModuleWithDependencies(Module $module, User $user, array $settings = []): array
    {
        $missingDependencies = $module->getMissingDependencies($user->id);

        if (!empty($missingDependencies)) {
            // Try to auto-enable missing dependencies
            foreach ($missingDependencies as $dependency) {
                if ($dependency['module']) {
                    $dependencyResult = $this->enableModule($dependency['module'], $user);
                    if (!$dependencyResult['success']) {
                        return [
                            'success' => false,
                            'message' => "Failed to enable dependency '{$dependency['name']}': {$dependencyResult['message']}"
                        ];
                    }
                }
            }
        }

        // Now enable the main module
        return $this->enableModule($module, $user, $settings);
    }
}
