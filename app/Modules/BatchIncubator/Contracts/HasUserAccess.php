<?php

namespace App\Modules\BatchIncubator\Contracts;

use App\Models\User;

/**
 * Interface for models that support user access control
 */
interface HasUserAccess
{
    /**
     * Check if a user has access to this resource
     */
    public function userHasAccess(User $user): bool;

    /**
     * Grant access to a user
     */
    public function grantAccess(User $user): void;

    /**
     * Revoke access from a user
     */
    public function revokeAccess(User $user): void;

    /**
     * Get all users with access
     */
    public function getAuthorizedUsers(): array;
}
