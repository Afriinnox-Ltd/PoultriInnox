<?php

namespace App\Modules\Marketplace\Policies;

use App\Models\User;
use App\Modules\Marketplace\Models\Vendor;

class VendorPolicy
{
    /**
     * Determine whether the user can view any vendors.
     */
    public function viewAny(?User $user): bool
    {
        return true; // Anyone can view approved vendors
    }

    /**
     * Determine whether the user can view the vendor.
     */
    public function view(?User $user, Vendor $vendor): bool
    {
        return $vendor->status== 'approved' ||
               ($user && ($user->isAdmin() || $this->owns($user, $vendor)));
    }

    /**
     * Determine whether the user can create vendors.
     */
    public function create(?User $user): bool
    {
        return true; // Anyone can register as a vendor
    }

    /**
     * Determine whether the user can update the vendor.
     */
    public function update(User $user, Vendor $vendor): bool
    {
        return $user->isAdmin() || $this->owns($user, $vendor);
    }

    /**
     * Determine whether the user can delete the vendor.
     */
    public function delete(User $user, Vendor $vendor): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine if the user owns the vendor profile.
     */
    private function owns(User $user, Vendor $vendor): bool
    {
        return $user->id== $vendor->user_id;
    }
}
