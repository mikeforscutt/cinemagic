<?php

namespace App\Http\Controllers;

use App\Exceptions\SeatUnavailableException;
use App\Http\Requests\HoldSeatsRequest;
use App\Models\Booking;
use App\Models\Screening;
use App\Services\SeatBookingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function __construct(private SeatBookingService $bookings) {}

    /**
     * The signed-in user's bookings.
     */
    public function index(Request $request): Response
    {
        $bookings = Booking::query()
            ->where('user_id', $request->user()->id)
            ->with([
                'screening.film:id,title',
                'screening.screen:id,name',
                'seats.seat:id,row_label,seat_number',
            ])
            ->latest()
            ->get();

        return Inertia::render('bookings/index', [
            'bookings' => $bookings,
        ]);
    }

    /**
     * A single booking.
     */
    public function show(Request $request, Booking $booking): Response
    {
        abort_unless($booking->user_id === $request->user()->id, 403);

        $booking->load([
            'screening.film',
            'screening.screen',
            'seats.seat',
        ]);

        return Inertia::render('bookings/show', [
            'booking' => $booking,
        ]);
    }

    /**
     * Place a temporary hold on the selected seats.
     */
    public function hold(HoldSeatsRequest $request, Screening $screening): RedirectResponse
    {
        try {
            $booking = $this->bookings->hold(
                $screening,
                $request->user(),
                $request->validated('seat_ids'),
                $request->ticketTypes(),
            );
        } catch (SeatUnavailableException $e) {
            return back()->withErrors(['seat_ids' => $e->getMessage()]);
        }

        return to_route('bookings.show', $booking);
    }

    /**
     * Turn a held booking into a confirmed one.
     */
    public function confirm(Request $request, Booking $booking): RedirectResponse
    {
        abort_unless($booking->user_id === $request->user()->id, 403);

        try {
            $this->bookings->confirm($booking);
        } catch (SeatUnavailableException $e) {
            return back()->withErrors(['booking' => $e->getMessage()]);
        }

        return to_route('bookings.show', $booking)
            ->with('success', 'Booking confirmed.');
    }

    /**
     * Cancel a booking and release its seats.
     */
    public function cancel(Request $request, Booking $booking): RedirectResponse
    {
        abort_unless($booking->user_id === $request->user()->id, 403);

        $this->bookings->cancel($booking);

        return to_route('bookings.index')
            ->with('success', 'Booking cancelled.');
    }
}
