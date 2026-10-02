<?php

use App\Models\Screening;
use App\Models\Seat;
use App\Models\User;
use App\Services\SeatBookingService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('sends taken seats to the seat map', function () {
    $screening = Screening::factory()->create();
    $seat = Seat::factory()->for($screening->screen)->create();

    app(SeatBookingService::class)->hold($screening, User::factory()->create(), [$seat->id]);

    $this->get("/screenings/{$screening->id}")
        ->assertInertia(fn ($page) => $page
            ->component('screenings/show')
            ->where('takenSeatIds', [$seat->id])
        );
});