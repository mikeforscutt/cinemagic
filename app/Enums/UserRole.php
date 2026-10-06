<?php

namespace App\Enums;

enum UserRole: string
{
    case Customer = 'customer';
    case Staff = 'staff';
    case Admin = 'admin';

    public function label(): string
    {
        return match ($this) {
            self::Customer => 'Customer',
            self::Staff => 'Staff',
            self::Admin => 'Administrator',
        };
    }

    /**
     * Staff can see the admin area; what they can do there is decided by
     * the individual policies.
     */
    public function canAccessAdminArea(): bool
    {
        return $this !== self::Customer;
    }
}
