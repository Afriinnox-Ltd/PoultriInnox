<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::select(['id', 'name', 'email', 'role', 'email_verified_at', 'created_at', 'updated_at'])
            ->latest()
            ->get();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Users/Create');
    }

    public function store()
    {
        // Logic to store a new user
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
            'role' => 'nullable|string|in:user,supervisor,manager,admin'
        ]);

        $user->update($validated);

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
