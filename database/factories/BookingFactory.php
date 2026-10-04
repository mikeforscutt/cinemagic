<?php

namespace Database\Factories;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\Screening;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'screening_id' => Screening::factory(),
            'reference' => 'CIN-'.Str::upper(Str::random(6)),
            'status' => BookingStatus::Held,
            'total_pence' => 0,
            'held_until' => now()->addMinutes(10),
            'confirmed_at' => null,
        ];
    }

    /**
     * A booking that has been paid for and confirmed.
     */
    public function confirmed(): static
    {
        return $this->state(fn (): array => [
            'status' => BookingStatus::Confirmed,
            'held_until' => null,
            'confirmed_at' => now(),
        ]);
    }

    /**
     * A hold that has lapsed and whose seats should be released.
     */
    public function expired(): static
    {
        return $this->state(fn (): array => [
            'status' => BookingStatus::Held,
            'held_until' => now()->subMinute(),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (): array => [
            'status' => BookingStatus::Cancelled,
            'held_until' => null,
        ]);
    }
}
