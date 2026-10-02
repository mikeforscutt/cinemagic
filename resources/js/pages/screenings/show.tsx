import { Head, useForm } from '@inertiajs/react';
import { useMemo } from 'react';

type SeatType = 'standard' | 'premium' | 'wheelchair';

interface Seat {
    id: number;
    row_label: string;
    seat_number: number;
    type: SeatType;
    position_x: number;
    position_y: number;
    price_pence: number;
}

interface Screening {
    id: number;
    starts_at: string;
    base_price_pence: number;
    film: {
        id: number;
        title: string;
        certificate: string;
        runtime_minutes: number;
        synopsis: string;
    };
    screen: {
        id: number;
        name: string;
    };
}

interface Props {
    screening: Screening;
    seats: Seat[];
    takenSeatIds: number[];
}

const MAX_SEATS = 8;

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

export default function Show({ screening, seats, takenSeatIds }: Props) {
    const { data, setData, post, processing, errors } = useForm<{
        seat_ids: number[];
    }>({
        seat_ids: [],
    });

    const selected = data.seat_ids;

    const taken = useMemo(() => new Set(takenSeatIds), [takenSeatIds]);

    const { columns, rows } = useMemo(
        () => ({
            columns: Math.max(...seats.map((s) => s.position_x)),
            rows: Math.max(...seats.map((s) => s.position_y)),
        }),
        [seats],
    );

    const selectedSeats = useMemo(
        () => seats.filter((seat) => selected.includes(seat.id)),
        [seats, selected],
    );

    const total = selectedSeats.reduce(
        (sum, seat) => sum + seat.price_pence,
        0,
    );

    const atLimit = selected.length >= MAX_SEATS;

    function toggle(seat: Seat) {
        if (taken.has(seat.id)) {
            return;
        }

        if (selected.includes(seat.id)) {
            setData(
                'seat_ids',
                selected.filter((id) => id !== seat.id),
            );

            return;
        }

        if (selected.length >= MAX_SEATS) {
            return;
        }

        setData('seat_ids', [...selected, seat.id]);
    }

    function submit() {
        post(`/screenings/${screening.id}/hold`, {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head
                title={`${screening.film.title} — ${formatStart(screening.starts_at)}`}
            />

            <div className="min-h-screen bg-neutral-950 text-neutral-100">
                <div className="mx-auto max-w-5xl px-6 py-12">
                    <header className="mb-10">
                        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                            {screening.film.title}
                        </h1>
                        <p className="mt-2 text-sm text-neutral-400">
                            {formatStart(screening.starts_at)} ·{' '}
                            {screening.screen.name} ·{' '}
                            {screening.film.certificate} ·{' '}
                            {screening.film.runtime_minutes} min
                        </p>
                    </header>

                    {errors.seat_ids && (
                        <div
                            role="alert"
                            className="mb-8 rounded-md border border-red-900 bg-red-950/60 px-4 py-3 text-sm text-red-200"
                        >
                            {errors.seat_ids}
                        </div>
                    )}

                    <div className="mb-12">
                        <div className="mx-auto mb-10 w-full max-w-2xl">
                            <div className="h-2 rounded-[100%] bg-gradient-to-b from-neutral-300 to-neutral-600 shadow-[0_0_60px_20px_rgba(255,255,255,0.08)]" />
                            <p className="mt-3 text-center text-xs tracking-widest text-neutral-500">
                                screen
                            </p>
                        </div>

                        <div className="overflow-x-auto pb-4">
                            <div
                                className="mx-auto grid w-max gap-1.5"
                                style={{
                                    gridTemplateColumns: `repeat(${columns}, 1.75rem)`,
                                    gridTemplateRows: `repeat(${rows}, 1.75rem)`,
                                }}
                            >
                                {seats.map((seat) => {
                                    const isTaken = taken.has(seat.id);
                                    const isSelected = selected.includes(
                                        seat.id,
                                    );
                                    const blocked = !isSelected && atLimit;

                                    return (
                                        <button
                                            key={seat.id}
                                            type="button"
                                            onClick={() => toggle(seat)}
                                            disabled={isTaken || blocked}
                                            aria-pressed={isSelected}
                                            aria-label={`Row ${seat.row_label} seat ${seat.seat_number}, ${seat.type}, ${
                                                isTaken
                                                    ? 'unavailable'
                                                    : formatPence(
                                                          seat.price_pence,
                                                      )
                                            }`}
                                            title={`${seat.row_label}${seat.seat_number}`}
                                            style={{
                                                gridColumn: seat.position_x,
                                                gridRow: seat.position_y,
                                            }}
                                            className={[
                                                'rounded-sm text-[0.6rem] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
                                                isTaken
                                                    ? 'cursor-not-allowed bg-neutral-800 text-neutral-700'
                                                    : isSelected
                                                      ? 'bg-amber-400 text-neutral-900'
                                                      : seat.type === 'premium'
                                                        ? 'bg-neutral-700 text-neutral-400 hover:bg-neutral-600'
                                                        : seat.type ===
                                                            'wheelchair'
                                                          ? 'bg-sky-900 text-sky-300 hover:bg-sky-800'
                                                          : 'bg-neutral-800/80 text-neutral-500 hover:bg-neutral-700',
                                                blocked && !isTaken
                                                    ? 'opacity-40'
                                                    : '',
                                            ].join(' ')}
                                        >
                                            {seat.type === 'wheelchair'
                                                ? '♿'
                                                : seat.seat_number}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-neutral-400">
                            <li className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-sm bg-neutral-800/80" />{' '}
                                Standard
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-sm bg-neutral-700" />{' '}
                                Premium
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-sm bg-sky-900" />{' '}
                                Wheelchair space
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-sm bg-amber-400" />{' '}
                                Selected
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-sm bg-neutral-800" />{' '}
                                Taken
                            </li>
                        </ul>
                    </div>

                    <div className="sticky bottom-0 -mx-6 border-t border-neutral-800 bg-neutral-950/95 px-6 py-4 backdrop-blur">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="text-sm">
                                {selectedSeats.length === 0 ? (
                                    <p className="text-neutral-400">
                                        Choose your seats to continue.
                                    </p>
                                ) : (
                                    <p>
                                        <span className="text-neutral-400">
                                            {selectedSeats.length}{' '}
                                            {selectedSeats.length === 1
                                                ? 'seat'
                                                : 'seats'}
                                            :{' '}
                                        </span>
                                        {selectedSeats
                                            .map(
                                                (seat) =>
                                                    `${seat.row_label}${seat.seat_number}`,
                                            )
                                            .join(', ')}
                                    </p>
                                )}
                                {atLimit && (
                                    <p className="mt-1 text-xs text-neutral-500">
                                        You can book up to {MAX_SEATS} seats at
                                        a time.
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-5">
                                <span className="text-lg font-semibold tabular-nums">
                                    {formatPence(total)}
                                </span>
                                <button
                                    type="button"
                                    onClick={submit}
                                    disabled={
                                        selected.length === 0 || processing
                                    }
                                    className="rounded-md bg-amber-400 px-5 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-600"
                                >
                                    {processing
                                        ? 'Holding seats…'
                                        : 'Hold these seats'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
