<?php

namespace App\Enums;

enum BookingStatus: string
{
    case Held = 'held';
    case Confirmed = 'confirmed';
    case Cancelled = 'cancelled';
}
