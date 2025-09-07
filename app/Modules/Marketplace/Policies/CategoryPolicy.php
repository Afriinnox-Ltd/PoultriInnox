<?php

namespace App\Modules\Marketplace\Policies;

use App\Models\User;
use App\Modules\Marketplace\Models\Category;

class CategoryPolicy
{
    /**
     * Determine whether the user can view any categories.
     */
    public function viewAny(?User $user): bool
    {
        return true; // Anyone can view categories
    }

    /**
     * Determine whether the user can view the category.
     */
    public function view(?User $user, Category $category): bool
    {
        return true; // Anyone can view categories
    }

    /**
     * Determine whether the user can create categories.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can update the category.
     */
    public function update(User $user, Category $category): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the category.
     */
    public function delete(User $user, Category $category): bool
    {
        return $user->isAdmin();
    }
}
