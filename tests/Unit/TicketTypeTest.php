<?php

use App\Enums\TicketType;

it('discounts concession tickets against the adult price', function () {
    expect(TicketType::Adult->multiplier())->toBe(1.0)
        ->and(TicketType::Child->multiplier())->toBeLessThan(1.0)
        ->and(TicketType::Student->multiplier())->toBeLessThan(1.0)
        ->and(TicketType::Senior->multiplier())->toBeLessThan(1.0);
});

it('gives every ticket type a label', function () {
    foreach (TicketType::cases() as $type) {
        expect($type->label())->not->toBeEmpty();
    }
});
