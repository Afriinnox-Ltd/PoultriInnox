<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Services\ModuleDependencyService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ModuleDependencyController extends Controller
{
    protected ModuleDependencyService $dependencyService;

    public function __construct(ModuleDependencyService $dependencyService)
    {
        $this->dependencyService = $dependencyService;
    }

    /**
     * Get all modules with dependency status for current user
     */
    public function getModulesWithDependencies(Request $request): JsonResponse
    {
        $user = $request->user();
        $modulesWithStatus = $this->dependencyService->getModulesWithDependencyStatus($user);

        return response()->json($modulesWithStatus);
    }

    /**
     * Enable a module for current user
     */
    public function enableModule(Request $request, Module $module): JsonResponse
    {
        $user = $request->user();
        $settings = $request->get('settings', []);

        $result = $this->dependencyService->enableModule($module, $user, $settings);

        return response()->json($result, $result['success'] ? 200 : 400);
    }

    /**
     * Disable a module for current user
     */
    public function disableModule(Request $request, Module $module): JsonResponse
    {
        $user = $request->user();

        $result = $this->dependencyService->disableModule($module, $user);

        return response()->json($result, $result['success'] ? 200 : 400);
    }

    /**
     * Enable a module with all its dependencies
     */
    public function enableModuleWithDependencies(Request $request, Module $module): JsonResponse
    {
        $user = $request->user();
        $settings = $request->get('settings', []);

        $result = $this->dependencyService->enableModuleWithDependencies($module, $user, $settings);

        return response()->json($result, $result['success'] ? 200 : 400);
    }

    /**
     * Check if a module can be enabled
     */
    public function checkCanEnable(Request $request, Module $module): JsonResponse
    {
        $user = $request->user();

        $result = $this->dependencyService->canEnableModule($module, $user);

        return response()->json($result);
    }

    /**
     * Check if a module can be disabled
     */
    public function checkCanDisable(Request $request, Module $module): JsonResponse
    {
        $user = $request->user();

        $result = $this->dependencyService->canDisableModule($module, $user);

        return response()->json($result);
    }

    /**
     * Get dependency tree for a module
     */
    public function getDependencyTree(Request $request, Module $module): JsonResponse
    {
        $user = $request->user();

        $tree = [
            'module' => $module,
            'dependencies' => [],
            'dependent_modules' => $module->getDependentModules($user->id)
        ];

        // Build dependency tree recursively
        if (!empty($module->dependencies)) {
            foreach ($module->dependencies as $dependencySlug) {
                $dependencyModule = Module::where('slug', $dependencySlug)->first();
                if ($dependencyModule) {
                    $tree['dependencies'][] = [
                        'module' => $dependencyModule,
                        'is_enabled' => $user->modules()
                            ->where('module_id', $dependencyModule->id)
                            ->where('is_enabled', true)
                            ->exists(),
                        'dependencies' => $this->getDependenciesRecursive($dependencyModule, $user)
                    ];
                }
            }
        }

        return response()->json($tree);
    }

    /**
     * Get dependencies recursively for dependency tree
     */
    private function getDependenciesRecursive(Module $module, $user, $visited = []): array
    {
        // Prevent circular dependencies
        if (in_array($module->slug, $visited)) {
            return [];
        }

        $visited[] = $module->slug;
        $dependencies = [];

        if (!empty($module->dependencies)) {
            foreach ($module->dependencies as $dependencySlug) {
                $dependencyModule = Module::where('slug', $dependencySlug)->first();
                if ($dependencyModule) {
                    $dependencies[] = [
                        'module' => $dependencyModule,
                        'is_enabled' => $user->modules()
                            ->where('module_id', $dependencyModule->id)
                            ->where('is_enabled', true)
                            ->exists(),
                        'dependencies' => $this->getDependenciesRecursive($dependencyModule, $user, $visited)
                    ];
                }
            }
        }

        return $dependencies;
    }
}
