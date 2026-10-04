<?php

namespace App\Exceptions;

use RuntimeException;

class SeatUnavailableException extends RuntimeException
{
    public static function taken(): self
    {
        return new self('One or more of those seats have already been taken.');
    }

    public static function notInScreen(): self
    {
        return new self('One or more of those seats do not belong to this screen.');
    }
}
