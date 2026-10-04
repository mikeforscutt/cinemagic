import { Head, Link } from '@inertiajs/react';
import SiteHeader from '@/components/site-header';

interface BookingSeat {
    id: number;
    seat: {
        row_label: string;
        seat_number: number;
    };
}

interface Booking {
    id: number;
    reference: string;
    status: 'held' | 'confirmed' | 'cancelled';
    total_pence: number;
    held_until: string | null;
    screening: {
        id: number;
        starts_at: string;
        film: {
            title: string;
        };
        screen: {
            name: string;
        };
    };
    seats: BookingSeat[];
}

interface Props {
    bookings: Booking[];
}

const STATUS_STYLES: Record<Booking['status'], string> = {
    held: 'bg-amber-400/10 text-amber-300',
    confirmed: 'bg-emerald-400/10 text-emerald-300',
    cancelled: 'bg-white/5 text-neutral-500',
};

function formatPence(pence: number): string {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
    }).format(pence / 100);
}

function formatStart(iso: string): string {
    return new Date(iso).toLocaleString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function Index({ bookings }: Props) {
    const upcoming = bookings.filter(
        (booking) =>
            booking.status !== 'cancelled' &&
            new Date(booking.screening.starts_at) > new Date(),
    );

    const past = bookings.filter((booking) => !upcoming.includes(booking));

    return (
        <>
            <Head title="My bookings" />

            <div className="min-h-screen bg-[#0a0a0b] text-neutral-100">
                <SiteHeader maxWidth="max-w-3xl" />

                <div className="mx-auto max-w-3xl px-6 py-12">
                    <h1 className="text-3xl font-semibold tracking-tight">
                        My bookings
                    </h1>

                    {bookings.length === 0 && (
                        <div className="mt-10 rounded-lg border border-white/5 px-6 py-12 text-center">
                            <p className="text-neutral-400">
                                You haven&apos;t booked anything yet.
                            </p>
                            <Link
                                href="/screenings"
                                className="mt-5 inline-block rounded-md bg-amber-400 px-5 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-amber-300"
                            >
                                See what&apos;s on
                            </Link>
                        </div>
                    )}

                    {upcoming.length > 0 && (
                        <section className="mt-10">
                            <h2 className="mb-4 text-sm font-medium text-neutral-400">
                                Upcoming
                            </h2>
                            <ul className="space-y-3">
                                {upcoming.map((booking) => (
                                    <BookingRow
                                        key={booking.id}
                                        booking={booking}
                                    />
                                ))}
                            </ul>
                        </section>
                    )}

                    {past.length > 0 && (
                        <section className="mt-12">
                            <h2 className="mb-4 text-sm font-medium text-neutral-400">
                                Past and cancelled
                            </h2>
                            <ul className="space-y-3">
                                {past.map((booking) => (
                                    <BookingRow
                                        key={booking.id}
                                        booking={booking}
                                        muted
                                    />
                                ))}
                            </ul>
                        </section>
                    )}
                </div>
            </div>
        </>
    );
}

function BookingRow({
    booking,
    muted = false,
}: {
    booking: Booking;
    muted?: boolean;
}) {
    return (
        <li>
            <Link
                href={`/bookings/${booking.id}`}
                className={[
                    'block rounded-lg border border-white/5 px-5 py-4 transition-colors hover:border-white/15',
                    muted ? 'opacity-60' : '',
                ].join(' ')}
            >
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="font-medium">
                            {booking.screening.film.title}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                            {formatStart(booking.screening.starts_at)} ·{' '}
                            {booking.screening.screen.name} ·{' '}
                            {booking.seats
                                .map(
                                    (s) =>
                                        `${s.seat.row_label}${s.seat.seat_number}`,
                                )
                                .join(', ')}
                        </p>
                        <p className="mt-2 font-mono text-[0.65rem] tracking-widest text-neutral-600">
                            {booking.reference}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span
                            className={[
                                'rounded-full px-2.5 py-1 text-[0.65rem] capitalize',
                                STATUS_STYLES[booking.status],
                            ].join(' ')}
                        >
                            {booking.status}
                        </span>
                        <span className="text-sm tabular-nums">
                            {formatPence(booking.total_pence)}
                        </span>
                    </div>
                </div>
            </Link>
        </li>
    );
}
