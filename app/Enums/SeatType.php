<?php

namespace App\Enums;

enum SeatType: string
{
    case Standard = 'standard';
    case Premium = 'premium';
    case Wheelchair = 'wheelchair';

    /**
     * Added to a screening's base price for this seat type.
     */
    public function surchargePence(): int
    {
        return match ($this) {
            self::Premium => 200,
            self::Standard, self::Wheelchair => 0,
        };
    }
}
