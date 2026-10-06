<?php

use App\Enums\SeatType;

it('only charges a surcharge for premium seats', function () {
    expect(SeatType::Premium->surchargePence())->toBeGreaterThan(0)
        ->and(SeatType::Standard->surchargePence())->toBe(0)
        ->and(SeatType::Wheelchair->surchargePence())->toBe(0);
});
