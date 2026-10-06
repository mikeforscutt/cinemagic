import { Head, Link } from '@inertiajs/react';
import { useMemo } from 'react';
import SiteHeader from '@/components/site-header';

interface Screening {
    id: number;
    starts_at: string;
    base_price_pence: number;
    screen: {
        id: number;
        name: string;
    };
}

interface Film {
    id: number;
    title: string;
    slug: string;
    synopsis: string;
    runtime_minutes: number;
    certificate: string;
    release_date: string;
    director: string | null;
    genres: string[];
    cast_list: string[] | null;
    poster_path: string | null;
    screenings: Screening[];
}

interface Props {
    film: Film;
}

function dayKey(iso: string): string {
    return new Date(iso).toISOString().slice(0, 10);
}

function dayLabel(iso: string): string {
    const date = new Date(iso);
    const today = new Date();
    const diff = Math.round(
        (new Date(date).setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)) /
            86400000,
    );

    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';

    return date.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });
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
    }).format(pence / 100);
}

function runtime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;

    return hours > 0 ? `${hours}h ${rest}m` : `${rest}m`;
}

export default function Show({ film }: Props) {
    const days = useMemo(() => {
        const grouped = new Map<string, Screening[]>();

        for (const screening of film.screenings) {
            const key = dayKey(screening.starts_at);

            if (!grouped.has(key)) {
                grouped.set(key, []);
            }

            grouped.get(key)!.push(screening);
        }

        return [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b));
    }, [film.screenings]);

    return (
        <>
            <Head title={film.title} />

            <div className="min-h-screen bg-[#0a0a0b] text-neutral-100">
                <SiteHeader maxWidth="max-w-5xl" />

                <div className="mx-auto max-w-5xl px-6 py-12">
                    <div className="flex flex-col gap-10 sm:flex-row sm:gap-12">
                        {film.poster_path ? (
                            <img
                                src={film.poster_path}
                                alt=""
                                className="w-full max-w-64 self-start rounded-lg object-cover shadow-2xl"
                            />
                        ) : (
                            <div className="aspect-[2/3] w-full max-w-64 self-start rounded-lg bg-white/5" />
                        )}

                        <div className="min-w-0 flex-1">
                            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                                {film.title}
                            </h1>

                            <p className="mt-3 text-sm text-neutral-400">
                                {film.certificate} ·{' '}
                                {runtime(film.runtime_minutes)}
                                {film.genres.length > 0 &&
                                    ` · ${film.genres.join(', ')}`}
                            </p>

                            <p className="mt-6 max-w-prose leading-relaxed text-neutral-300">
                                {film.synopsis}
                            </p>

                            <dl className="mt-8 space-y-2 text-sm">
                                {film.director && (
                                    <div className="flex gap-3">
                                        <dt className="w-20 shrink-0 text-neutral-500">
                                            Director
                                        </dt>
                                        <dd>{film.director}</dd>
                                    </div>
                                )}

                                {film.cast_list &&
                                    film.cast_list.length > 0 && (
                                        <div className="flex gap-3">
                                            <dt className="w-20 shrink-0 text-neutral-500">
                                                Cast
                                            </dt>
                                            <dd>{film.cast_list.join(', ')}</dd>
                                        </div>
                                    )}

                                <div className="flex gap-3">
                                    <dt className="w-20 shrink-0 text-neutral-500">
                                        Released
                                    </dt>
                                    <dd>
                                        {new Date(
                                            film.release_date,
                                        ).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    <section className="mt-16">
                        <h2 className="text-xl font-semibold tracking-tight">
                            Book tickets
                        </h2>

                        {days.length === 0 ? (
                            <p className="mt-4 text-neutral-400">
                                No screenings scheduled at the moment.{' '}
                                <Link
                                    href="/screenings"
                                    className="text-amber-400 underline-offset-4 hover:underline"
                                >
                                    See what else is on
                                </Link>
                                .
                            </p>
                        ) : (
                            <div className="mt-6 space-y-8">
                                {days.map(([key, screenings]) => (
                                    <div key={key}>
                                        <h3 className="mb-3 text-sm font-medium text-neutral-400">
                                            {dayLabel(key)}
                                        </h3>

                                        <ul className="flex flex-wrap gap-2">
                                            {screenings.map((screening) => (
                                                <li key={screening.id}>
                                                    <Link
                                                        href={`/screenings/${screening.id}`}
                                                        className="flex flex-col items-center rounded-md bg-white/5 px-4 py-2.5 transition-colors hover:bg-amber-400 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                                                    >
                                                        <span className="text-sm font-medium tabular-nums">
                                                            {time(
                                                                screening.starts_at,
                                                            )}
                                                        </span>
                                                        <span className="text-[0.65rem] opacity-60">
                                                            {
                                                                screening.screen
                                                                    .name
                                                            }
                                                            {' · '}
                                                            {formatPence(
                                                                screening.base_price_pence,
                                                            )}
                                                        </span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}
