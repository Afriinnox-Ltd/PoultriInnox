<?php

namespace App\Modules\BatchIncubator\Traits;

use App\Models\User;

/**
 * Trait for models that need basic user access control
 */
trait HasBasicUserAccess
{
    /**
     * Check if a user has access to this resource
     */
    public function userHasAccess(User $user): bool
    {
        // Check if user is the owner/manager
        if (isset($this->owner_id) && $this->owner_id === $user->id) {
            return true;
        }

        if (isset($this->manager_id) && $this->manager_id === $user->id) {
            return true;
        }

        // Check authorized users array
        $authorizedUsers = $this->authorized_users ?? [];
        return in_array($user->id, $authorizedUsers);
    }

    /**
     * Grant access to a user
     */
    public function grantAccess(User $user): void
    {
        $authorizedUsers = $this->authorized_users ?? [];

        if (!in_array($user->id, $authorizedUsers)) {
            $authorizedUsers[] = $user->id;
            $this->update(['authorized_users' => $authorizedUsers]);
        }
    }

    /**
     * Revoke access from a user
     */
    public function revokeAccess(User $user): void
    {
        $authorizedUsers = $this->authorized_users ?? [];
        $authorizedUsers = array_filter($authorizedUsers, fn($id) => $id !== $user->id);

        $this->update(['authorized_users' => array_values($authorizedUsers)]);
    }
}
