import { Head, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import SiteHeader from '@/components/site-header';
import Spinner from '@/components/spinner';

type SeatTypeName = 'standard' | 'premium' | 'wheelchair';

interface Seat {
    id: number;
    row_label: string;
    seat_number: number;
    type: SeatTypeName;
    position_x: number;
    position_y: number;
    price_pence: number;
}

interface TicketType {
    value: string;
    label: string;
    multiplier: number;
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
    ticketTypes: TicketType[];
}

const MAX_SEATS = 8;

const DEFAULT_TICKET_TYPE = 'adult';

/** Longest the staggered seat entrance is allowed to run, in ms. */
const MAX_STAGGER_MS = 420;

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

export default function Show({
    screening,
    seats,
    takenSeatIds,
    ticketTypes,
}: Props) {
    const { data, setData, post, processing, errors } = useForm<{
        seat_ids: number[];
        ticket_types: Record<number, string>;
    }>({
        seat_ids: [],
        ticket_types: {},
    });

    const [shakingSeatId, setShakingSeatId] = useState<number | null>(null);

    const selected = data.seat_ids;

    const taken = useMemo(() => new Set(takenSeatIds), [takenSeatIds]);

    const multipliers = useMemo(() => {
        const map = new Map<string, number>();

        for (const type of ticketTypes) {
            map.set(type.value, type.multiplier);
        }

        return map;
    }, [ticketTypes]);

    const { columns, rows } = useMemo(
        () => ({
            columns: Math.max(...seats.map((s) => s.position_x)),
            rows: Math.max(...seats.map((s) => s.position_y)),
        }),
        [seats],
    );

    // Row labels down the left of the grid, one per distinct position_y.
    const rowLabels = useMemo(() => {
        const labels = new Map<number, string>();

        for (const seat of seats) {
            if (!labels.has(seat.position_y)) {
                labels.set(seat.position_y, seat.row_label);
            }
        }

        return labels;
    }, [seats]);

    const selectedSeats = useMemo(
        () => seats.filter((seat) => selected.includes(seat.id)),
        [seats, selected],
    );

    function priceFor(seat: Seat): number {
        const type = data.ticket_types[seat.id] ?? DEFAULT_TICKET_TYPE;
        const multiplier = multipliers.get(type) ?? 1;

        return Math.round(seat.price_pence * multiplier);
    }

    const total = selectedSeats.reduce((sum, seat) => sum + priceFor(seat), 0);

    const atLimit = selected.length >= MAX_SEATS;

    /**
     * A refused tap gets a brief shake rather than silence, so it's clear
     * the click registered and the seat is unavailable.
     */
    function refuse(seatId: number) {
        setShakingSeatId(seatId);
        window.setTimeout(() => setShakingSeatId(null), 260);
    }

    function toggle(seat: Seat) {
        if (taken.has(seat.id)) {
            refuse(seat.id);

            return;
        }

        if (selected.includes(seat.id)) {
            const types = { ...data.ticket_types };
            delete types[seat.id];

            setData({
                seat_ids: selected.filter((id) => id !== seat.id),
                ticket_types: types,
            });

            return;
        }

        if (selected.length >= MAX_SEATS) {
            refuse(seat.id);

            return;
        }

        setData({
            seat_ids: [...selected, seat.id],
            ticket_types: {
                ...data.ticket_types,
                [seat.id]: DEFAULT_TICKET_TYPE,
            },
        });
    }

    function setTicketType(seatId: number, value: string) {
        setData('ticket_types', {
            ...data.ticket_types,
            [seatId]: value,
        });
    }

    function submit() {
        post(`/screenings/${screening.id}/hold`, {
            preserveScroll: true,
            preserveState: false,
        });
    }

    return (
        <>
            <Head
                title={`${screening.film.title} — ${formatStart(screening.starts_at)}`}
            />

            <div className="min-h-screen bg-[#0a0a0b] text-neutral-100">
                <SiteHeader maxWidth="max-w-5xl" />

                <div className="mx-auto max-w-5xl px-6 py-12">
                    <div className="fade-up mb-10">
                        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                            {screening.film.title}
                        </h1>
                        <p className="mt-2 text-sm text-neutral-400">
                            {formatStart(screening.starts_at)} ·{' '}
                            {screening.screen.name} ·{' '}
                            {screening.film.certificate} ·{' '}
                            {screening.film.runtime_minutes} min
                        </p>
                    </div>

                    {errors.seat_ids && (
                        <div
                            role="alert"
                            className="fade-up mb-8 rounded-md border border-red-900 bg-red-950/60 px-4 py-3 text-sm text-red-200"
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
                                    gridTemplateColumns: `1.5rem repeat(${columns}, 1.75rem)`,
                                    gridTemplateRows: `repeat(${rows}, 1.75rem)`,
                                }}
                            >
                                {[...rowLabels.entries()].map(([y, label]) => (
                                    <span
                                        key={`row-${y}`}
                                        aria-hidden="true"
                                        style={{ gridColumn: 1, gridRow: y }}
                                        className="flex items-center justify-center text-[0.65rem] text-neutral-600"
                                    >
                                        {label}
                                    </span>
                                ))}

                                {seats.map((seat, index) => {
                                    const isTaken = taken.has(seat.id);
                                    const isSelected = selected.includes(
                                        seat.id,
                                    );
                                    const blocked = !isSelected && atLimit;
                                    const isShaking = shakingSeatId === seat.id;

                                    return (
                                        <button
                                            key={seat.id}
                                            type="button"
                                            onClick={() => toggle(seat)}
                                            aria-pressed={isSelected}
                                            aria-disabled={isTaken || blocked}
                                            aria-label={`Row ${seat.row_label} seat ${seat.seat_number}, ${seat.type}, ${
                                                isTaken
                                                    ? 'unavailable'
                                                    : formatPence(
                                                          seat.price_pence,
                                                      )
                                            }`}
                                            title={`${seat.row_label}${seat.seat_number}`}
                                            style={{
                                                gridColumn: seat.position_x + 1,
                                                gridRow: seat.position_y,
                                                animationDelay: `${Math.min(
                                                    index * 5,
                                                    MAX_STAGGER_MS,
                                                )}ms`,
                                            }}
                                            className={[
                                                'seat-enter rounded-sm text-[0.6rem] transition-[background-color,transform,box-shadow] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
                                                isShaking ? 'seat-shake' : '',
                                                isTaken
                                                    ? 'cursor-not-allowed bg-neutral-800 text-neutral-700'
                                                    : isSelected
                                                      ? 'z-10 scale-110 bg-amber-400 text-neutral-900 shadow-[0_0_12px_rgba(251,191,36,0.45)]'
                                                      : seat.type === 'premium'
                                                        ? 'bg-neutral-700 text-neutral-400 hover:scale-105 hover:bg-neutral-600'
                                                        : seat.type ===
                                                            'wheelchair'
                                                          ? 'bg-sky-900 text-sky-300 hover:scale-105 hover:bg-sky-800'
                                                          : 'bg-neutral-800/80 text-neutral-500 hover:scale-105 hover:bg-neutral-700',
                                                blocked && !isTaken
                                                    ? 'cursor-not-allowed opacity-40'
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
                        {selectedSeats.length > 0 && (
                            <ul className="mb-4 flex max-h-32 flex-wrap gap-2 overflow-y-auto">
                                {selectedSeats.map((seat) => (
                                    <li
                                        key={seat.id}
                                        className="fade-up flex items-center gap-2 rounded-md border border-neutral-800 py-1.5 pr-2 pl-3 text-sm"
                                    >
                                        <span className="font-medium tabular-nums">
                                            {seat.row_label}
                                            {seat.seat_number}
                                        </span>

                                        <label
                                            className="sr-only"
                                            htmlFor={`ticket-${seat.id}`}
                                        >
                                            Ticket type for seat{' '}
                                            {seat.row_label}
                                            {seat.seat_number}
                                        </label>
                                        <select
                                            id={`ticket-${seat.id}`}
                                            value={
                                                data.ticket_types[seat.id] ??
                                                DEFAULT_TICKET_TYPE
                                            }
                                            onChange={(event) =>
                                                setTicketType(
                                                    seat.id,
                                                    event.target.value,
                                                )
                                            }
                                            className="rounded bg-white/5 px-2 py-1 text-xs text-neutral-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                                        >
                                            {ticketTypes.map((type) => (
                                                <option
                                                    key={type.value}
                                                    value={type.value}
                                                    className="bg-neutral-900"
                                                >
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>

                                        <span className="text-xs text-neutral-500 tabular-nums">
                                            {formatPence(priceFor(seat))}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="text-sm">
                                {selectedSeats.length === 0 ? (
                                    <p className="text-neutral-400">
                                        Choose your seats to continue.
                                    </p>
                                ) : (
                                    <p className="text-neutral-400">
                                        {selectedSeats.length}{' '}
                                        {selectedSeats.length === 1
                                            ? 'seat'
                                            : 'seats'}{' '}
                                        selected
                                    </p>
                                )}
                                {atLimit && (
                                    <p className="fade-up mt-1 text-xs text-neutral-500">
                                        You can book up to {MAX_SEATS} seats at
                                        a time.
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-5">
                                <span className="text-lg font-semibold tabular-nums transition-all duration-200">
                                    {formatPence(total)}
                                </span>
                                <button
                                    type="button"
                                    onClick={submit}
                                    disabled={
                                        selected.length === 0 || processing
                                    }
                                    className="inline-flex items-center gap-2 rounded-md bg-amber-400 px-5 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-600"
                                >
                                    {processing && <Spinner />}
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
