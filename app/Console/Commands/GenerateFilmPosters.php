<?php

namespace App\Console\Commands;

use App\Models\Film;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class GenerateFilmPosters extends Command
{
    protected $signature = 'films:posters {--force : Regenerate posters that already exist}';

    protected $description = 'Generate a poster image for each film using Pollinations';

    public function handle(): int
    {
        $directory = public_path('posters');

        if (! is_dir($directory)) {
            mkdir($directory, recursive: true);
        }

        $films = Film::all();

        foreach ($films as $film) {
            $path = "{$directory}/{$film->slug}.jpg";

            if (file_exists($path) && ! $this->option('force')) {
                $this->line("Skipping {$film->title} — poster already exists.");

                continue;
            }

            $this->info("Generating {$film->title}…");

            $prompt = $this->promptFor($film);

            $url = sprintf(
                'https://image.pollinations.ai/prompt/%s?width=600&height=900&nologo=true&seed=%d',
                urlencode($prompt),
                crc32($film->slug),
            );

            try {
                $response = Http::timeout(120)->get($url);
            } catch (\Throwable $e) {
                $this->error("  Failed: {$e->getMessage()}");

                continue;
            }

            if (! $response->successful()) {
                $this->error("  Failed with status {$response->status()}.");

                continue;
            }

            file_put_contents($path, $response->body());

            $film->update(['poster_path' => "/posters/{$film->slug}.jpg"]);

            $this->line('  Saved.');

            // Be polite to a free, anonymous endpoint.
            sleep(2);
        }

        $this->newLine();
        $this->info('Done.');

        return self::SUCCESS;
    }

    private function promptFor(Film $film): string
    {
        $genres = strtolower(implode(' and ', $film->genres));

        return "Minimalist cinematic film poster artwork for a {$genres} film titled "
            ."\"{$film->title}\". Moody atmospheric lighting, strong composition, "
            .'film grain, muted cinematic colour grade. No text, no lettering, '
            .'no words, no title, no credits. Vertical poster format.';
    }
}
