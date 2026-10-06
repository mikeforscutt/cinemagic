<?php

namespace App\Policies;

use App\Models\Film;
use App\Models\User;

class FilmPolicy
{
    /**
     * Films are public, so anyone can browse them.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Film $film): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Film $film): bool
    {
        return $user->isAdmin();
    }

    /**
     * A film with screenings can't be deleted, because its screenings cascade
     * and would take their bookings with them.
     */
    public function delete(User $user, Film $film): bool
    {
        return $user->isAdmin() && $film->screenings()->doesntExist();
    }
}
