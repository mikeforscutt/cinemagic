import { Head, Link } from '@inertiajs/react';

interface Film {
    id: number;
    title: string;
    slug: string;
    synopsis: string;
    certificate: string;
    runtime_minutes: number;
    poster_path: string | null;
    next_screening_at?: string;
    bookings_count?: number;
}

interface Props {
    featured: Film | null;
    nowShowing: Film[];
    popular: Film[];
}

function nextShowing(iso?: string): string {
    if (!iso) {
        return '';
    }

    const date = new Date(iso);
    const today = new Date();
    const sameDay = date.toDateString() === today.toDateString();

    return sameDay
        ? `Next showing today, ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
        : `Next showing ${date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}`;
}

function FilmCard({ film }: { film: Film }) {
    return (
        <Link href={`/films/${film.slug}`} className="group block">
            {film.poster_path ? (
                <img
                    src={film.poster_path}
                    alt=""
                    loading="lazy"
                    className="aspect-[2/3] w-full rounded-lg object-cover transition-opacity group-hover:opacity-80"
                />
            ) : (
                <div className="aspect-[2/3] w-full rounded-lg bg-white/5" />
            )}

            <h3 className="mt-3 text-sm leading-snug font-medium group-hover:text-amber-400">
                {film.title}
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
                {film.certificate} · {film.runtime_minutes} min
            </p>
        </Link>
    );
}

export default function Home({ featured, nowShowing, popular }: Props) {
    return (
        <>
            <Head title="Cinemagic" />

            <div className="min-h-screen bg-[#0a0a0b] text-neutral-100">
                <header className="border-b border-white/5">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
                        <Link
                            href="/"
                            className="text-lg font-semibold tracking-tight"
                        >
                            Cinemagic
                        </Link>
                        <nav className="flex items-center gap-6 text-sm text-neutral-400">
                            <Link
                                href="/screenings"
                                className="transition-colors hover:text-neutral-100"
                            >
                                What's on
                            </Link>
                            <Link
                                href="/bookings"
                                className="transition-colors hover:text-neutral-100"
                            >
                                My bookings
                            </Link>
                        </nav>
                    </div>
                </header>

                {featured && (
                    <section className="relative border-b border-white/5">
                        {featured.poster_path && (
                            <div
                                aria-hidden="true"
                                className="absolute inset-0 bg-cover bg-center opacity-20 blur-2xl"
                                style={{
                                    backgroundImage: `url(${featured.poster_path})`,
                                }}
                            />
                        )}

                        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 sm:flex-row sm:items-center">
                            {featured.poster_path && (
                                <img
                                    src={featured.poster_path}
                                    alt=""
                                    className="w-56 shrink-0 rounded-lg object-cover shadow-2xl"
                                />
                            )}

                            <div className="max-w-xl">
                                <p className="text-xs tracking-widest text-amber-400 uppercase">
                                    Showing next
                                </p>
                                <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                                    {featured.title}
                                </h1>
                                <p className="mt-4 text-sm leading-relaxed text-neutral-400">
                                    {featured.synopsis}
                                </p>
                                <p className="mt-4 text-xs text-neutral-500">
                                    {featured.certificate} ·{' '}
                                    {featured.runtime_minutes} min
                                    {featured.next_screening_at &&
                                        ` · ${nextShowing(featured.next_screening_at)}`}
                                </p>

                                <Link
                                    href={`/films/${featured.slug}`}
                                    className="mt-7 inline-block rounded-md bg-amber-400 px-6 py-3 text-sm font-medium text-neutral-900 transition-colors hover:bg-amber-300"
                                >
                                    Book tickets
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                <div className="mx-auto max-w-6xl px-6 py-14">
                    <section>
                        <div className="mb-6 flex items-baseline justify-between">
                            <h2 className="text-xl font-semibold tracking-tight">
                                Now showing
                            </h2>
                            <Link
                                href="/screenings"
                                className="text-sm text-neutral-400 transition-colors hover:text-neutral-100"
                            >
                                See all times
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                            {nowShowing.map((film) => (
                                <FilmCard key={film.id} film={film} />
                            ))}
                        </div>
                    </section>

                    {popular.some((film) => (film.bookings_count ?? 0) > 0) && (
                        <section className="mt-16">
                            <h2 className="mb-6 text-xl font-semibold tracking-tight">
                                Most popular
                            </h2>

                            <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
                                {popular.map((film) => (
                                    <FilmCard key={film.id} film={film} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </>
    );
}
