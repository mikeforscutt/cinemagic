<?php

namespace Database\Seeders;

use App\Models\Film;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class FilmSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('seeders/data/films.json');

        if (! file_exists($path)) {
            $this->command->warn('No films.json found — falling back to the factory.');

            Film::factory()->count(8)->create();

            return;
        }

        $films = json_decode(file_get_contents($path), true, flags: JSON_THROW_ON_ERROR);

        foreach ($films as $film) {
            $slug = Str::slug($film['title']);

            Film::updateOrCreate(
                ['slug' => $slug],
                [
                    'title' => $film['title'],
                    'synopsis' => $film['synopsis'],
                    'runtime_minutes' => $film['runtime_minutes'],
                    'certificate' => $film['certificate'],
                    'release_date' => $film['release_date'],
                    'director' => $film['director'],
                    'genres' => $film['genres'],
                    'cast_list' => $film['cast_list'],
                    'poster_path' => $this->posterFor($slug),
                ],
            );
        }
    }

    /**
     * Posters live in public/posters, named by slug. Returns null when a
     * film has no artwork, so the UI can fall back to a generated card.
     */
    private function posterFor(string $slug): ?string
    {
        foreach (['jpg', 'jpeg', 'png', 'webp'] as $extension) {
            $relative = "/posters/{$slug}.{$extension}";

            if (file_exists(public_path($relative))) {
                return $relative;
            }
        }

        return null;
    }
}
