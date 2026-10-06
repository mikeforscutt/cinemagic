<?php

namespace App\Enums;

enum TicketType: string
{
    case Adult = 'adult';
    case Child = 'child';
    case Student = 'student';
    case Senior = 'senior';

    /**
     * Multiplier applied to a screening's base price.
     */
    public function multiplier(): float
    {
        return match ($this) {
            self::Adult => 1.0,
            self::Child => 0.6,
            self::Student => 0.8,
            self::Senior => 0.7,
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::Adult => 'Adult',
            self::Child => 'Child',
            self::Student => 'Student',
            self::Senior => 'Senior',
        };
    }
}
