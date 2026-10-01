<?php

namespace Database\Factories;

use App\Models\Film;
use App\Models\Screen;
use App\Models\Screening;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Screening>
 */
class ScreeningFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'film_id' => Film::factory(),
            'screen_id' => Screen::factory(),
            'starts_at' => fake()->dateTimeBetween('+1 hour', '+2 weeks'),
            'base_price_pence' => fake()->randomElement([750, 850, 950, 1200]),
        ];
    }
}
