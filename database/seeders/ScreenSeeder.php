<?php

namespace Database\Seeders;

use App\Enums\SeatType;
use App\Models\Screen;
use App\Models\Seat;
use Illuminate\Database\Seeder;

class ScreenSeeder extends Seeder
{
    /**
     * Layouts for each screen.
     *
     * rows:          how many rows of seats
     * seats_per_row: seats in each row, excluding the aisle
     * aisle_after:   a gap is left after this many seats in every row
     * premium_rows:  the last N rows are premium seating
     */
    private const LAYOUTS = [
        ['name' => 'Screen 1', 'rows' => 10, 'seats_per_row' => 16, 'aisle_after' => 8, 'premium_rows' => 3],
        ['name' => 'Screen 2', 'rows' => 8, 'seats_per_row' => 12, 'aisle_after' => 6, 'premium_rows' => 2],
        ['name' => 'Screen 3', 'rows' => 6, 'seats_per_row' => 10, 'aisle_after' => 5, 'premium_rows' => 2],
    ];

    public function run(): void
    {
        foreach (self::LAYOUTS as $layout) {
            $screen = Screen::firstOrCreate(['name' => $layout['name']]);

            // Skip screens that already have their seats, so the seeder can be
            // re-run safely — including against production.
            if ($screen->seats()->exists()) {
                continue;
            }

            $this->buildSeats($screen, $layout);
        }
    }

    /**
     * @param  array<string, mixed>  $layout
     */
    private function buildSeats(Screen $screen, array $layout): void
    {
        $rows = $layout['rows'];
        $perRow = $layout['seats_per_row'];
        $aisleAfter = $layout['aisle_after'];
        $premiumFrom = $rows - $layout['premium_rows'];

        $seats = [];

        foreach (range(0, $rows - 1) as $rowIndex) {
            $rowLabel = chr(65 + $rowIndex); // A, B, C...
            $isPremium = $rowIndex >= $premiumFrom;
            $isAccessibleRow = $rowIndex === $rows - 1;

            foreach (range(1, $perRow) as $seatNumber) {
                // Leave a visual gap for the aisle by skipping an x position.
                $positionX = $seatNumber <= $aisleAfter
                    ? $seatNumber
                    : $seatNumber + 1;

                $type = match (true) {
                    $isAccessibleRow && $seatNumber > $perRow - 2 => SeatType::Wheelchair,
                    $isPremium => SeatType::Premium,
                    default => SeatType::Standard,
                };

                $seats[] = [
                    'screen_id' => $screen->id,
                    'row_label' => $rowLabel,
                    'seat_number' => $seatNumber,
                    'type' => $type->value,
                    'position_x' => $positionX,
                    'position_y' => $rowIndex + 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        // One insert per screen rather than one per seat.
        foreach (array_chunk($seats, 200) as $chunk) {
            Seat::insert($chunk);
        }
    }
}
