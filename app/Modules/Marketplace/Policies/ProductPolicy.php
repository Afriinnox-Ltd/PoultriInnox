<?php

namespace App\Modules\Marketplace\Policies;

use App\Models\User;
use App\Modules\Marketplace\Models\Product;

class ProductPolicy
{
    /**
     * Determine whether the user can view any products.
     */
    public function viewAny(?User $user): bool
    {
        return true; // Anyone can view products
    }

    /**
     * Determine whether the user can view the product.
     */
    public function view(?User $user, Product $product): bool
    {
        return $product->status== 'active' ||
               ($user && ($user->isAdmin() || $this->owns($user, $product)));
    }

    /**
     * Determine whether the user can create products.
     */
    public function create(User $user): bool
    {
        return $user->vendor && $user->vendor->status== 'approved';
    }

    /**
     * Determine whether the user can update the product.
     */
    public function update(User $user, Product $product): bool
    {
        return $user->isAdmin() || $this->owns($user, $product);
    }

    /**
     * Determine whether the user can delete the product.
     */
    public function delete(User $user, Product $product): bool
    {
        return $user->isAdmin() || $this->owns($user, $product);
    }

    /**
     * Determine if the user owns the product.
     */
    private function owns(User $user, Product $product): bool
    {
        return $user->vendor && $user->vendor->id== $product->vendor_id;
    }
}
