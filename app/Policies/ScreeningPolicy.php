<?php

namespace App\Policies;

use App\Models\Screening;
use App\Models\User;

class ScreeningPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Screening $screening): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Rescheduling a screening someone has already booked would move their
     * seats under them, so it's blocked once bookings exist.
     */
    public function update(User $user, Screening $screening): bool
    {
        return $user->isAdmin() && $screening->bookings()->doesntExist();
    }

    public function delete(User $user, Screening $screening): bool
    {
        return $user->isAdmin() && $screening->bookings()->doesntExist();
    }
}
