import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import SiteHeader from '@/components/site-header';

interface BookingSeat {
    id: number;
    ticket_type: string;
    price_pence: number;
    seat: {
        id: number;
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
    confirmed_at: string | null;
    screening: {
        id: number;
        starts_at: string;
        film: {
            title: string;
            certificate: string;
            runtime_minutes: number;
            poster_path: string | null;
        };
        screen: {
            name: string;
        };
    };
    seats: BookingSeat[];
}

interface Props {
    booking: Booking;
}

function formatPence(pence: number): string {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
    }).format(pence / 100);
}

function formatStart(iso: string): string {
    return new Date(iso).toLocaleString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function useCountdown(until: string | null): number | null {
    const [remaining, setRemaining] = useState<number | null>(null);

    useEffect(() => {
        if (!until) {
            setRemaining(null);

            return;
        }

        const tick = () => {
            const seconds = Math.max(
                0,
                Math.floor((new Date(until).getTime() - Date.now()) / 1000),
            );

            setRemaining(seconds);
        };

        tick();

        const id = setInterval(tick, 1000);

        return () => clearInterval(id);
    }, [until]);

    return remaining;
}

export default function Show({ booking }: Props) {
    const remaining = useCountdown(
        booking.status === 'held' ? booking.held_until : null,
    );

    const confirmForm = useForm();
    const cancelForm = useForm();

    const expired = remaining !== null && remaining === 0;

    const minutes = remaining === null ? 0 : Math.floor(remaining / 60);
    const seconds = remaining === null ? 0 : remaining % 60;

    return (
        <>
            <Head title={`Booking ${booking.reference}`} />

            <div className="min-h-screen bg-[#0a0a0b] text-neutral-100">
                <SiteHeader maxWidth="max-w-3xl" />

                <div className="mx-auto max-w-3xl px-6 py-12">
                    {booking.status === 'held' && !expired && (
                        <div className="mb-8 rounded-lg border border-amber-500/30 bg-amber-500/5 px-5 py-4">
                            <p className="text-sm text-amber-200">
                                Your seats are held for{' '}
                                <span className="font-semibold tabular-nums">
                                    {minutes}:{String(seconds).padStart(2, '0')}
                                </span>
                                . Confirm below to complete your booking.
                            </p>
                        </div>
                    )}

                    {booking.status === 'held' && expired && (
                        <div className="mb-8 rounded-lg border border-red-900 bg-red-950/50 px-5 py-4">
                            <p className="text-sm text-red-200">
                                This hold has expired and your seats have been
                                released.
                            </p>
                        </div>
                    )}

                    {booking.status === 'confirmed' && (
                        <div className="mb-8 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-5 py-4">
                            <p className="text-sm text-emerald-200">
                                Booking confirmed. See you there.
                            </p>
                        </div>
                    )}

                    {booking.status === 'cancelled' && (
                        <div className="mb-8 rounded-lg border border-neutral-800 bg-white/5 px-5 py-4">
                            <p className="text-sm text-neutral-400">
                                This booking was cancelled.
                            </p>
                        </div>
                    )}

                    <div className="flex gap-8">
                        {booking.screening.film.poster_path && (
                            <img
                                src={booking.screening.film.poster_path}
                                alt=""
                                className="hidden w-40 shrink-0 rounded-lg object-cover sm:block"
                            />
                        )}

                        <div className="min-w-0 flex-1">
                            <p className="font-mono text-xs tracking-widest text-neutral-500">
                                {booking.reference}
                            </p>

                            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                                {booking.screening.film.title}
                            </h1>

                            <p className="mt-2 text-sm text-neutral-400">
                                {formatStart(booking.screening.starts_at)}
                            </p>
                            <p className="mt-1 text-sm text-neutral-500">
                                {booking.screening.screen.name} ·{' '}
                                {booking.screening.film.certificate} ·{' '}
                                {booking.screening.film.runtime_minutes} min
                            </p>

                            <dl className="mt-8 space-y-3 border-t border-white/5 pt-6 text-sm">
                                {booking.seats.map((line) => (
                                    <div
                                        key={line.id}
                                        className="flex justify-between gap-6"
                                    >
                                        <dt className="text-neutral-400">
                                            {line.seat.row_label}
                                            {line.seat.seat_number}
                                            <span className="ml-2 text-neutral-600 capitalize">
                                                {line.ticket_type}
                                            </span>
                                        </dt>
                                        <dd className="tabular-nums">
                                            {formatPence(line.price_pence)}
                                        </dd>
                                    </div>
                                ))}

                                <div className="flex justify-between gap-6 border-t border-white/5 pt-3">
                                    <dt className="font-medium">Total</dt>
                                    <dd className="font-semibold tabular-nums">
                                        {formatPence(booking.total_pence)}
                                    </dd>
                                </div>
                            </dl>

                            <div className="mt-8 flex flex-wrap gap-3">
                                {booking.status === 'held' && !expired && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            confirmForm.post(
                                                `/bookings/${booking.id}/confirm`,
                                            )
                                        }
                                        disabled={confirmForm.processing}
                                        className="rounded-md bg-amber-400 px-5 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-amber-300 disabled:bg-neutral-800 disabled:text-neutral-600"
                                    >
                                        {confirmForm.processing
                                            ? 'Confirming…'
                                            : 'Confirm booking'}
                                    </button>
                                )}

                                {booking.status !== 'cancelled' && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            cancelForm.delete(
                                                `/bookings/${booking.id}`,
                                            )
                                        }
                                        disabled={cancelForm.processing}
                                        className="rounded-md border border-neutral-800 px-5 py-2.5 text-sm transition-colors hover:border-neutral-700 hover:text-neutral-100"
                                    >
                                        Cancel booking
                                    </button>
                                )}

                                <Link
                                    href={`/screenings/${booking.screening.id}`}
                                    className="rounded-md bg-white/5 px-5 py-2.5 text-sm transition-colors hover:bg-white/10"
                                >
                                    Back to seat map
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
