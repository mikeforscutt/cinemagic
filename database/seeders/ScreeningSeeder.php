<?php

namespace Database\Seeders;

use App\Models\Film;
use App\Models\Screen;
use App\Models\Screening;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class ScreeningSeeder extends Seeder
{
    /**
     * Start times offered each day, as hours past midnight.
     */
    private const SLOTS = [11, 14, 17, 20];

    private const DAYS_AHEAD = 14;

    public function run(): void
    {
        $films = Film::all();
        $screens = Screen::all();

        if ($films->isEmpty() || $screens->isEmpty()) {
            $this->command->warn('Need films and screens before screenings can be scheduled.');

            return;
        }

        foreach (range(0, self::DAYS_AHEAD - 1) as $dayOffset) {
            $day = Carbon::today()->addDays($dayOffset);

            foreach ($screens as $screenIndex => $screen) {
                foreach (self::SLOTS as $slotIndex => $hour) {
                    // Rotate films so each screen shows something different.
                    $film = $films[($dayOffset + $screenIndex + $slotIndex) % $films->count()];

                    $startsAt = $day->copy()->setTime($hour, 0);

                    if ($startsAt->isPast()) {
                        continue;
                    }

                    // Matches the unique constraint on (screen_id, starts_at),
                    // so re-running the seeder adds nothing it already has.
                    Screening::firstOrCreate(
                        [
                            'screen_id' => $screen->id,
                            'starts_at' => $startsAt,
                        ],
                        [
                            'film_id' => $film->id,
                            'base_price_pence' => $this->priceFor($startsAt),
                        ],
                    );
                }
            }
        }
    }

    /**
     * Evenings and weekends cost more.
     */
    private function priceFor(Carbon $startsAt): int
    {
        $price = 850;

        if ($startsAt->hour >= 17) {
            $price += 150;
        }

        if ($startsAt->isWeekend()) {
            $price += 100;
        }

        return $price;
    }
}
