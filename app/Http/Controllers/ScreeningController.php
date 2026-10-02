<?php

namespace App\Http\Controllers;

use App\Models\Screening;
use App\Models\Seat;
use App\Services\SeatBookingService;
use Inertia\Inertia;
use Inertia\Response;

class ScreeningController extends Controller
{
    public function __construct(private SeatBookingService $bookings) {}

    /**
     * Upcoming screenings, soonest first.
     */
    public function index(): Response
    {
        $screenings = Screening::query()
            ->with('film:id,title,slug,certificate,runtime_minutes,poster_path')
            ->where('starts_at', '>', now())
            ->orderBy('starts_at')
            ->limit(60)
            ->get();

        return Inertia::render('screenings/index', [
            'screenings' => $screenings,
        ]);
    }

    /**
     * One screening, with its full seat map and current availability.
     */
    public function show(Screening $screening): Response
    {
        $screening->load('film', 'screen');

        // Free anything whose hold has lapsed before reporting availability,
        // so we never need a scheduled job to do it.
        $this->bookings->releaseExpiredHolds($screening);

        return Inertia::render('screenings/show', [
            'screening' => [
                'id' => $screening->id,
                'starts_at' => $screening->starts_at,
                'base_price_pence' => $screening->base_price_pence,
                'film' => $screening->film->only([
                    'id', 'title', 'certificate', 'runtime_minutes', 'synopsis',
                ]),
                'screen' => $screening->screen->only(['id', 'name']),
            ],
            'seats' => $screening->screen->seats()
                ->orderBy('position_y')
                ->orderBy('position_x')
                ->get(['id', 'row_label', 'seat_number', 'type', 'position_x', 'position_y'])
                ->map(fn (Seat $seat) => [
                    ...$seat->only(['id', 'row_label', 'seat_number', 'position_x', 'position_y']),
                    'type' => $seat->type->value,
                    'price_pence' => $screening->base_price_pence + $seat->type->surchargePence(),
                ]),
            'takenSeatIds' => $this->bookings->takenSeatIds($screening),
        ]);

    }
}
