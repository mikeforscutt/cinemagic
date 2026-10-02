<?php

namespace Database\Factories;

use App\Enums\TicketType;
use App\Models\Booking;
use App\Models\BookingSeat;
use App\Models\Screening;
use App\Models\Seat;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BookingSeat>
 */
class BookingSeatFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'booking_id' => Booking::factory(),
            'screening_id' => Screening::factory(),
            'seat_id' => Seat::factory(),
            'ticket_type' => TicketType::Adult,
            'price_pence' => 850,
        ];
    }
}
