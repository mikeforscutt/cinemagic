<?php

namespace Database\Factories;

use App\Models\Film;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Film>
 */
class FilmFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = rtrim(fake()->unique()->sentence(3), '.');

        return [
            'title' => $title,
            'slug' => Str::slug($title),
            'synopsis' => fake()->paragraph(4),
            'runtime_minutes' => fake()->numberBetween(85, 165),
            'certificate' => fake()->randomElement(['U', 'PG', '12A', '15', '18']),
            'release_date' => fake()->dateTimeBetween('-2 years', '+3 months'),
            'director' => fake()->name(),
            'genres' => fake()->randomElements(
                ['Action', 'Drama', 'Comedy', 'Thriller', 'Sci-Fi', 'Horror', 'Romance'],
                fake()->numberBetween(1, 3)
            ),
            'cast_list' => [fake()->name(), fake()->name(), fake()->name()],
            'poster_path' => null,
        ];
    }
}
