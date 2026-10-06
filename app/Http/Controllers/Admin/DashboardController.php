<?php

namespace App\Http\Controllers\Admin;

use App\Enums\BookingStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Film;
use App\Models\Screening;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/dashboard', [
            'stats' => $this->stats(),
            'today' => $this->todaysScreenings(),
            'popular' => $this->popularFilms(),
            'recent' => $this->recentBookings(),
        ]);
    }

    /**
     * @return array<string, int>
     */
    private function stats(): array
    {
        $since = now()->subDays(30);

        return [
            'revenue_pence' => (int) Booking::query()
                ->where('status', BookingStatus::Confirmed)
                ->where('created_at', '>', $since)
                ->sum('total_pence'),

            'bookings' => Booking::query()
                ->where('status', BookingStatus::Confirmed)
                ->where('created_at', '>', $since)
                ->count(),

            'upcoming_screenings' => Screening::where('starts_at', '>', now())->count(),

            'customers' => User::where('role', UserRole::Customer)->count(),
        ];
    }

    /**
     * Today's schedule with how full each screening is.
     *
     * @return Collection<int, array<string, mixed>>
     */
    private function todaysScreenings(): Collection
    {
        return Screening::query()
            ->whereDate('starts_at', today())
            ->with([
                'film:id,title',
                'screen' => fn ($query) => $query->select('id', 'name')->withCount('seats'),
            ])
            ->withCount('bookingSeats')
            ->orderBy('starts_at')
            ->get()
            ->map(fn (Screening $screening): array => [
                'id' => $screening->id,
                'starts_at' => $screening->starts_at,
                'film' => $screening->film->title,
                'screen' => $screening->screen->name,
                'booked' => $screening->booking_seats_count,
                'capacity' => $screening->screen->seats_count,
                'revenue_pence' => (int) $screening->bookings()
                    ->where('status', BookingStatus::Confirmed)
                    ->sum('total_pence'),
            ]);
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function popularFilms(int $limit = 5): Collection
    {
        $recentConfirmed = fn (Builder $query) => $query
            ->where('bookings.status', BookingStatus::Confirmed->value)
            ->where('bookings.created_at', '>', now()->subDays(30));

        return Film::query()
            ->whereHas('bookings', $recentConfirmed)
            ->withCount(['bookings as bookings_count' => $recentConfirmed])
            ->orderByDesc('bookings_count')
            ->take($limit)
            ->get()
            ->map(fn (Film $film): array => [
                'id' => $film->id,
                'title' => $film->title,
                'bookings_count' => $film->bookings_count,
            ]);
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function recentBookings(int $limit = 8): Collection
    {
        return Booking::query()
            ->whereIn('status', [BookingStatus::Confirmed, BookingStatus::Held])
            ->with(['user:id,name', 'screening.film:id,title'])
            ->withCount('seats')
            ->latest()
            ->take($limit)
            ->get()
            ->map(fn (Booking $booking): array => [
                'id' => $booking->id,
                'reference' => $booking->reference,
                'status' => $booking->status->value,
                'user' => $booking->user->name,
                'film' => $booking->screening->film->title,
                'seats' => $booking->seats_count,
                'total_pence' => $booking->total_pence,
                'created_at' => $booking->created_at,
            ]);
    }
}
