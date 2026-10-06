<?php

namespace App\Services;

use App\Enums\BookingStatus;
use App\Enums\TicketType;
use App\Exceptions\SeatUnavailableException;
use App\Models\Booking;
use App\Models\BookingSeat;
use App\Models\Screening;
use App\Models\Seat;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SeatBookingService
{
    /**
     * How long a seat selection is held before it is released again.
     */
    public const HOLD_MINUTES = 10;

    /**
     * Place a temporary hold on the given seats for a screening.
     *
     * Ticket types are per seat, so one booking can mix adult, child and
     * concession tickets. Any seat without an entry is priced as an adult.
     *
     * @param  array<int, int>  $seatIds
     * @param  array<int, TicketType>  $ticketTypes  keyed by seat id
     *
     * @throws SeatUnavailableException
     */
    public function hold(
        Screening $screening,
        User $user,
        array $seatIds,
        array $ticketTypes = [],
    ): Booking {
        $seatIds = array_values(array_unique($seatIds));

        try {
            return DB::transaction(function () use ($screening, $user, $seatIds, $ticketTypes): Booking {
                $this->releaseExpiredHolds($screening);

                $seats = $this->validSeatsForScreening($screening, $seatIds);

                // Lock any existing rows for these seats so concurrent holds queue
                // rather than race. The unique index is what ultimately guarantees
                // correctness; this just turns most races into a clean wait.
                $taken = BookingSeat::query()
                    ->where('screening_id', $screening->id)
                    ->whereIn('seat_id', $seatIds)
                    ->lockForUpdate()
                    ->exists();

                if ($taken) {
                    throw SeatUnavailableException::taken();
                }

                $lines = $seats->map(fn (Seat $seat): array => [
                    'seat' => $seat,
                    'ticket_type' => $ticketTypes[$seat->id] ?? TicketType::Adult,
                ])->map(fn (array $line): array => [
                    ...$line,
                    'price_pence' => $this->priceFor($screening, $line['seat'], $line['ticket_type']),
                ]);

                $booking = Booking::create([
                    'user_id' => $user->id,
                    'screening_id' => $screening->id,
                    'reference' => $this->generateReference(),
                    'status' => BookingStatus::Held,
                    'total_pence' => $lines->sum('price_pence'),
                    'held_until' => now()->addMinutes(self::HOLD_MINUTES),
                    'confirmed_at' => null,
                ]);

                foreach ($lines as $line) {
                    BookingSeat::create([
                        'booking_id' => $booking->id,
                        'screening_id' => $screening->id,
                        'seat_id' => $line['seat']->id,
                        'ticket_type' => $line['ticket_type'],
                        'price_pence' => $line['price_pence'],
                    ]);
                }

                return $booking->load('seats.seat');
            });
        } catch (QueryException $e) {
            // 23505 is a unique violation: another request claimed a seat between
            // our check and our insert. Surface it as a normal unavailable seat.
            if ($e->getCode() === '23505') {
                throw SeatUnavailableException::taken();
            }

            throw $e;
        }
    }

    /**
     * Turn a held booking into a confirmed one.
     *
     * @throws SeatUnavailableException
     */
    public function confirm(Booking $booking): Booking
    {
        return DB::transaction(function () use ($booking): Booking {
            $fresh = Booking::query()
                ->whereKey($booking->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            if ($fresh->status !== BookingStatus::Held) {
                throw SeatUnavailableException::taken();
            }

            if ($fresh->held_until !== null && $fresh->held_until->isPast()) {
                $this->cancel($fresh);

                throw SeatUnavailableException::taken();
            }

            $fresh->update([
                'status' => BookingStatus::Confirmed,
                'held_until' => null,
                'confirmed_at' => now(),
            ]);

            return $fresh->load('seats.seat');
        });
    }

    /**
     * Cancel a booking and free its seats.
     *
     * Seat rows are deleted rather than flagged, because the unique index on
     * (screening_id, seat_id) would otherwise keep the seat occupied forever.
     */
    public function cancel(Booking $booking): Booking
    {
        return DB::transaction(function () use ($booking): Booking {
            $booking->seats()->delete();

            $booking->update([
                'status' => BookingStatus::Cancelled,
                'held_until' => null,
            ]);

            return $booking;
        });
    }

    /**
     * Release any holds on this screening that have lapsed.
     */
    public function releaseExpiredHolds(?Screening $screening = null): int
    {
        $query = Booking::query()
            ->where('status', BookingStatus::Held)
            ->whereNotNull('held_until')
            ->where('held_until', '<', now());

        if ($screening !== null) {
            $query->where('screening_id', $screening->id);
        }

        $expired = $query->get();

        foreach ($expired as $booking) {
            $booking->seats()->delete();
            $booking->update([
                'status' => BookingStatus::Cancelled,
                'held_until' => null,
            ]);
        }

        return $expired->count();
    }

    /**
     * The seats a screening currently has spoken for.
     *
     * @return Collection<int, int>
     */
    public function takenSeatIds(Screening $screening): Collection
    {
        return BookingSeat::query()
            ->where('screening_id', $screening->id)
            ->pluck('seat_id');
    }

    /**
     * @param  array<int, int>  $seatIds
     * @return Collection<int, Seat>
     *
     * @throws SeatUnavailableException
     */
    private function validSeatsForScreening(Screening $screening, array $seatIds): Collection
    {
        $seats = Seat::query()
            ->whereIn('id', $seatIds)
            ->where('screen_id', $screening->screen_id)
            ->get();

        if ($seats->count() !== count($seatIds)) {
            throw SeatUnavailableException::notInScreen();
        }

        return $seats;
    }

    /**
     * The seat type surcharge applies first, then the ticket type multiplier.
     * A child ticket in a premium seat is therefore a proportion of the premium
     * price rather than of the base price plus the full surcharge.
     */
    private function priceFor(Screening $screening, Seat $seat, TicketType $ticketType): int
    {
        $base = $screening->base_price_pence + $seat->type->surchargePence();

        return (int) round($base * $ticketType->multiplier());
    }

    private function generateReference(): string
    {
        do {
            $reference = 'CIN-'.Str::upper(Str::random(6));
        } while (Booking::where('reference', $reference)->exists());

        return $reference;
    }
}
