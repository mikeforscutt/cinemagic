<?php

namespace App\Http\Controllers;

use App\Enums\BookingStatus;
use App\Models\Film;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Inertia\Inertia;
use Inertia\Response;

class FilmController extends Controller
{
    public function home(): Response
    {
        return Inertia::render('home', [
            'featured' => $this->nowShowing()->first(),
            'nowShowing' => $this->nowShowing()->take(8)->get(),
            'popular' => $this->mostPopular(),
        ]);
    }

    public function show(Film $film): Response
    {
        $film->load(['screenings' => fn ($query) => $query
            ->where('starts_at', '>', now())
            ->orderBy('starts_at')
            ->with('screen:id,name'),
        ]);

        return Inertia::render('films/show', [
            'film' => $film,
        ]);
    }

    /**
     * Films with at least one upcoming screening, soonest first.
     */
    private function nowShowing(): Builder
    {
        return Film::query()
            ->whereHas('screenings', fn (Builder $query) => $query->where('starts_at', '>', now()))
            ->withMin(['screenings as next_screening_at' => fn (Builder $query) => $query
                ->where('starts_at', '>', now()),
            ], 'starts_at')
            ->orderBy('next_screening_at');
    }

    /**
     * Ranked by confirmed bookings over the last 30 days, so the list stays
     * current rather than rewarding whatever has been showing longest.
     *
     * @return Collection<int, Film>
     */
    private function mostPopular(int $limit = 6): Collection
    {
        return Film::query()
            ->whereHas('screenings', fn (Builder $query) => $query->where('starts_at', '>', now()))
            ->withCount(['bookings as bookings_count' => fn (Builder $query) => $query
                ->where('bookings.status', BookingStatus::Confirmed->value)
                ->where('bookings.created_at', '>', now()->subDays(30)),
            ])
            ->orderByDesc('bookings_count')
            ->take($limit)
            ->get();
    }
}
