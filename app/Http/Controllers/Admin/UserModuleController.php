<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\User;
use App\Services\UserModuleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class UserModuleController extends Controller
{
    public function __construct(
        private UserModuleService $userModuleService
    ) {
        // Middleware will be applied at route level
    }

    /**
     * Display user module management interface
     */
    public function index()
    {
        $users = User::with(['modules' => function ($query) {
            $query->where('is_enabled', true);
        }])->get();

        $modules = Module::where('is_active', true)->get();

        return Inertia::render('admin/user-modules/index', [
            'users' => $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'enabled_modules' => $user->modules->map(function ($module) {
                        return [
                            'slug' => $module->slug,
                            'name' => $module->name,
                            'icon' => $module->icon
                        ];
                    })
                ];
            }),
            'modules' => $modules->map(function ($module) {
                return [
                    'slug' => $module->slug,
                    'name' => $module->name,
                    'description' => $module->description,
                    'icon' => $module->icon,
                    'dependencies' => $module->dependencies ?? []
                ];
            })
        ]);
    }

    /**
     * Enable a module for a user
     */
    public function enableModule(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'module_slug' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid input',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::findOrFail($request->user_id);
        $result = $this->userModuleService->enableModule($user, $request->module_slug);

        return response()->json($result, $result['success'] ? 200 : 400);
    }

    /**
     * Disable a module for a user
     */
    public function disableModule(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'module_slug' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid input',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::findOrFail($request->user_id);
        $result = $this->userModuleService->disableModule($user, $request->module_slug);

        return response()->json($result, $result['success'] ? 200 : 400);
    }

    /**
     * Get user's module status
     */
    public function getUserModules(User $user)
    {
        $status = $this->userModuleService->getUserModuleStatus($user);
        return response()->json($status);
    }

    /**
     * Bulk enable/disable modules for multiple users
     */
    public function bulkManageModules(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'module_slug' => 'required|string',
            'action' => 'required|in:enable,disable'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid input',
                'errors' => $validator->errors()
            ], 422);
        }

        $results = [];
        $users = User::whereIn('id', $request->user_ids)->get();

        foreach ($users as $user) {
            if ($request->action === 'enable') {
                $result = $this->userModuleService->enableModule($user, $request->module_slug);
            } else {
                $result = $this->userModuleService->disableModule($user, $request->module_slug);
            }

            $results[] = [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'result' => $result
            ];
        }

        return response()->json([
            'success' => true,
            'results' => $results
        ]);
    }
}
