<?php

use App\Enums\BookingStatus;
use App\Exceptions\SeatUnavailableException;
use App\Models\Booking;
use App\Models\BookingSeat;
use App\Models\Screening;
use App\Models\Seat;
use App\Models\User;
use App\Services\SeatBookingService;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->screening = Screening::factory()->create();
    $this->seats = Seat::factory()
        ->count(3)
        ->for($this->screening->screen)
        ->create();
});

it('holds seats for a user', function () {
    $user = User::factory()->create();

    $booking = app(SeatBookingService::class)->hold(
        $this->screening,
        $user,
        $this->seats->pluck('id')->all(),
    );

    expect($booking->status)->toBe(BookingStatus::Held)
        ->and($booking->seats)->toHaveCount(3)
        ->and($booking->held_until)->toBeGreaterThan(now());
});

it('refuses a seat already held by someone else', function () {
    $first = User::factory()->create();
    $second = User::factory()->create();
    $service = app(SeatBookingService::class);

    $service->hold($this->screening, $first, [$this->seats[0]->id]);

    $service->hold($this->screening, $second, [$this->seats[0]->id]);
})->throws(SeatUnavailableException::class);

it('allows a seat to be taken once a hold has expired', function () {
    $first = User::factory()->create();
    $second = User::factory()->create();
    $service = app(SeatBookingService::class);

    $booking = $service->hold($this->screening, $first, [$this->seats[0]->id]);
    $booking->update(['held_until' => now()->subMinute()]);

    $second = $service->hold($this->screening, $second, [$this->seats[0]->id]);

    expect($second->seats)->toHaveCount(1);
});

it('cannot double-book a seat at the database level', function () {
    $booking = Booking::factory()->for($this->screening)->create();

    BookingSeat::factory()->create([
        'booking_id' => $booking->id,
        'screening_id' => $this->screening->id,
        'seat_id' => $this->seats[0]->id,
    ]);

    BookingSeat::factory()->create([
        'booking_id' => $booking->id,
        'screening_id' => $this->screening->id,
        'seat_id' => $this->seats[0]->id,
    ]);
})->throws(QueryException::class);
