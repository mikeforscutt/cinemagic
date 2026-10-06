<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, User $subject): bool
    {
        return $user->isAdmin() || $user->is($subject);
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, User $subject): bool
    {
        return $user->isAdmin() || $user->is($subject);
    }

    /**
     * Admins can't delete themselves from the admin area — it's too easy to
     * lock yourself out, and the account settings page already offers a
     * deliberate way to close your own account.
     */
    public function delete(User $user, User $subject): bool
    {
        return $user->isAdmin() && ! $user->is($subject);
    }

    /**
     * Changing someone's role is a separate decision from editing their
     * details, and never applies to yourself.
     */
    public function changeRole(User $user, User $subject): bool
    {
        return $user->isAdmin() && ! $user->is($subject);
    }
}
