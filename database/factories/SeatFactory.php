<?php

namespace Database\Factories;

use App\Enums\SeatType;
use App\Models\Screen;
use App\Models\Seat;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Seat>
 */
class SeatFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'screen_id' => Screen::factory(),
            'row_label' => fake()->randomLetter(),
            'seat_number' => fake()->unique()->numberBetween(1, 200),
            'type' => SeatType::Standard,
            'position_x' => fake()->numberBetween(0, 20),
            'position_y' => fake()->numberBetween(0, 10),
        ];
    }

    public function premium(): static
    {
        return $this->state(fn (): array => [
            'type' => SeatType::Premium,
        ]);
    }

    public function wheelchair(): static
    {
        return $this->state(fn (): array => [
            'type' => SeatType::Wheelchair,
        ]);
    }
}
