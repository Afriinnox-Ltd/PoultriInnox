<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class RolePermissionController extends Controller
{
    public function index()
    {
        $roles = Role::with('permissions')->get();
        $permissions = Permission::orderBy('group')->orderBy('name')->get();

        $groupedPermissions = $permissions->groupBy('group')->map(function ($perms, $group) {
            return [
                'group' => $group,
                'permissions' => $perms,
            ];
        })->values();

        return Inertia::render('Admin/Roles/Index', [
            'roles' => $roles,
            'permissions' => $permissions,
            'groupedPermissions' => $groupedPermissions,
        ]);
    }

    public function storeRole(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
        ]);

        $slug = Str::slug($validated['name']);

        if (Role::where('slug', $slug)->exists()) {
            return back()->withErrors(['name' => 'A role with this name already exists.']);
        }

        Role::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
        ]);

        return back()->with('success', 'Role created successfully.');
    }

    public function updateRole(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
        ]);

        $slug = Str::slug($validated['name']);

        if (Role::where('slug', $slug)->where('id', '!=', $role->id)->exists()) {
            return back()->withErrors(['name' => 'A role with this name already exists.']);
        }

        // Update user role column if slug changed
        if ($role->slug !== $slug) {
            \App\Models\User::where('role', $role->slug)->update(['role' => $slug]);
        }

        $role->update([
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
        ]);

        return back()->with('success', 'Role updated successfully.');
    }

    public function destroyRole(Role $role)
    {
        if ($role->is_default) {
            return back()->withErrors(['role' => 'Cannot delete a default role.']);
        }

        // Move users with this role to the default role and clear their cache
        $defaultRole = Role::where('is_default', true)->first();
        $affectedUserIds = \App\Models\User::where('role', $role->slug)->pluck('id');
        if ($defaultRole) {
            \App\Models\User::where('role', $role->slug)->update(['role' => $defaultRole->slug]);
        }

        // Clear permission cache for affected users
        $permSlugs = Permission::pluck('slug');
        foreach ($affectedUserIds as $userId) {
            foreach ($permSlugs as $slug) {
                \Illuminate\Support\Facades\Cache::forget("user_{$userId}_permission_{$slug}");
            }
        }

        $role->delete();

        return back()->with('success', 'Role deleted successfully.');
    }

    public function syncPermissions(Request $request, Role $role)
    {
        $validated = $request->validate([
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role->syncPermissions($validated['permissions'] ?? []);

        // Clear cached permissions for users with this role
        $userIds = \App\Models\User::where('role', $role->slug)->pluck('id');
        foreach ($userIds as $userId) {
            $cacheKeys = Permission::pluck('slug')->map(fn($slug) => "user_{$userId}_permission_{$slug}");
            foreach ($cacheKeys as $key) {
                \Illuminate\Support\Facades\Cache::forget($key);
            }
        }

        return back()->with('success', 'Permissions updated successfully.');
    }

    public function storePermission(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'group' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
        ]);

        $slug = Str::slug($validated['name']);

        if (Permission::where('slug', $slug)->exists()) {
            return back()->withErrors(['name' => 'A permission with this name already exists.']);
        }

        Permission::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'group' => $validated['group'],
            'description' => $validated['description'] ?? null,
        ]);

        return back()->with('success', 'Permission created successfully.');
    }

    public function destroyPermission(Permission $permission)
    {
        $permission->delete();

        return back()->with('success', 'Permission deleted successfully.');
    }
}
