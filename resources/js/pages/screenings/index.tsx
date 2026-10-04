import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import SiteHeader from '@/components/site-header';

interface Film {
    id: number;
    title: string;
    slug: string;
    certificate: string;
    runtime_minutes: number;
    poster_path: string | null;
}

interface Screening {
    id: number;
    starts_at: string;
    base_price_pence: number;
    film: Film;
}

interface Props {
    screenings: Screening[];
}

const PALETTES = [
    ['#1e3a5f', '#0f1d2e'],
    ['#4a1e3d', '#20101c'],
    ['#1f4038', '#0e1d19'],
    ['#4a3412', '#211709'],
    ['#2e2a52', '#141327'],
    ['#4a2018', '#21100c'],
];

function paletteFor(film: Film): [string, string] {
    let seed = 0;

    for (let i = 0; i < film.title.length; i++) {
        seed += film.title.charCodeAt(i);
    }

    return PALETTES[seed % PALETTES.length] as [string, string];
}

function initials(title: string): string {
    return title
        .replace(/^(The|A|An)\s+/i, '')
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0])
        .join('')
        .toUpperCase();
}

function dayLabel(date: Date, today: Date): string {
    const diff = Math.round(
        (date.setHours(0, 0, 0, 0) - new Date(today).setHours(0, 0, 0, 0)) /
            86400000,
    );

    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';

    return new Date(date).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    });
}

function isoDay(iso: string): string {
    return new Date(iso).toISOString().slice(0, 10);
}

function time(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatPence(pence: number): string {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 2,
    }).format(pence / 100);
}

export default function Index({ screenings }: Props) {
    const today = useMemo(() => new Date(), []);

    const dayKeys = useMemo(() => {
        const keys = [...new Set(screenings.map((s) => isoDay(s.starts_at)))];

        return keys.sort();
    }, [screenings]);

    const [activeDay, setActiveDay] = useState(dayKeys[0] ?? '');

    const films = useMemo(() => {
        const grouped = new Map<number, { film: Film; times: Screening[] }>();

        for (const screening of screenings) {
            if (isoDay(screening.starts_at) !== activeDay) {
                continue;
            }

            if (!grouped.has(screening.film.id)) {
                grouped.set(screening.film.id, {
                    film: screening.film,
                    times: [],
                });
            }

            grouped.get(screening.film.id)!.times.push(screening);
        }

        return [...grouped.values()];
    }, [screenings, activeDay]);

    return (
        <>
            <Head title="What's on" />

            <div className="min-h-screen bg-[#0a0a0b] text-neutral-100">
                <SiteHeader maxWidth="max-w-6xl" />

                <div className="mx-auto max-w-6xl px-6 py-12">
                    <h1 className="text-4xl font-semibold tracking-tight">
                        What's on
                    </h1>

                    <div className="-mx-6 mt-8 overflow-x-auto px-6 pb-2">
                        <div className="flex gap-2">
                            {dayKeys.map((key) => {
                                const active = key === activeDay;

                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setActiveDay(key)}
                                        className={[
                                            'shrink-0 rounded-full px-4 py-2 text-sm transition-colors',
                                            active
                                                ? 'bg-neutral-100 font-medium text-neutral-900'
                                                : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-neutral-200',
                                        ].join(' ')}
                                    >
                                        {dayLabel(new Date(key), today)}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {films.length === 0 ? (
                        <p className="mt-16 text-neutral-400">
                            Nothing scheduled. Try another day.
                        </p>
                    ) : (
                        <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                            {films.map(({ film, times }) => {
                                const [from, to] = paletteFor(film);

                                return (
                                    <article key={film.id}>
                                        {film.poster_path ? (
                                            <img
                                                src={film.poster_path}
                                                alt=""
                                                loading="lazy"
                                                className="aspect-[2/3] w-full rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div
                                                className="flex aspect-[2/3] items-end rounded-lg p-5"
                                                style={{
                                                    background: `linear-gradient(160deg, ${from}, ${to})`,
                                                }}
                                            >
                                                <span
                                                    aria-hidden="true"
                                                    className="text-5xl font-bold tracking-tighter text-white/20"
                                                >
                                                    {initials(film.title)}
                                                </span>
                                            </div>
                                        )}

                                        <h2 className="mt-4 text-base leading-snug font-medium">
                                            {film.title}
                                        </h2>
                                        <p className="mt-1 text-xs text-neutral-500">
                                            {film.certificate} ·{' '}
                                            {film.runtime_minutes} min
                                        </p>

                                        <ul className="mt-4 flex flex-wrap gap-2">
                                            {times.map((screening) => (
                                                <li key={screening.id}>
                                                    <Link
                                                        href={`/screenings/${screening.id}`}
                                                        className="flex flex-col items-center rounded-md bg-white/5 px-3 py-2 transition-colors hover:bg-amber-400 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                                                    >
                                                        <span className="text-sm font-medium tabular-nums">
                                                            {time(
                                                                screening.starts_at,
                                                            )}
                                                        </span>
                                                        <span className="text-[0.65rem] opacity-60">
                                                            {formatPence(
                                                                screening.base_price_pence,
                                                            )}
                                                        </span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
