<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use App\Models\Permission;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::select(['id', 'name', 'email', 'role', 'email_verified_at', 'created_at', 'updated_at'])
            ->latest()
            ->get();

        $roles = Role::select(['id', 'name', 'slug', 'description'])->get();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    public function create()
    {
        $roles = Role::select(['id', 'name', 'slug', 'description'])->get();

        return Inertia::render('Admin/Users/Create', [
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => ['required', 'confirmed', Password::min(8)],
            'role' => 'required|string|exists:roles,slug',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        return redirect()->route('admin.users.index')->with('success', 'User created successfully.');
    }

    public function edit($id)
    {
        return Inertia::render('Admin/Users/Edit', ['userId' => $id]);
    }

    public function update($id)
    {
        $user = User::findOrFail($id);

        $validated = request()->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'nullable|string|exists:roles,slug',
        ]);

        $oldRole = $user->role;
        $user->update($validated);

        // Clear permission cache if role changed
        if (isset($validated['role']) && $validated['role'] !== $oldRole) {
            $permSlugs = Permission::pluck('slug');
            foreach ($permSlugs as $slug) {
                Cache::forget("user_{$user->id}_permission_{$slug}");
            }
        }

        return redirect()->back()->with('success', 'User updated successfully');
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return redirect()->back()->with('success', 'User deleted successfully');
    }

    public function bulkDelete()
    {
        $validated = request()->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id'
        ]);

        User::whereIn('id', $validated['user_ids'])->delete();

        return redirect()->back()->with('success', count($validated['user_ids']) . ' users deleted successfully');
    }
}
