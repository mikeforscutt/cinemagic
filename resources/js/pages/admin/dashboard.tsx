import { Head, Link } from '@inertiajs/react';
import AdminShell from '@/components/admin-shell';

interface Stats {
    revenue_pence: number;
    bookings: number;
    upcoming_screenings: number;
    customers: number;
}

interface TodayScreening {
    id: number;
    starts_at: string;
    film: string;
    screen: string;
    booked: number;
    capacity: number;
    revenue_pence: number;
}

interface PopularFilm {
    id: number;
    title: string;
    bookings_count: number;
}

interface RecentBooking {
    id: number;
    reference: string;
    status: string;
    user: string;
    film: string;
    seats: number;
    total_pence: number;
    created_at: string;
}

interface Props {
    stats: Stats;
    today: TodayScreening[];
    popular: PopularFilm[];
    recent: RecentBooking[];
}

const STATUS_STYLES: Record<string, string> = {
    confirmed: 'bg-emerald-400/10 text-emerald-300',
    held: 'bg-amber-400/10 text-amber-300',
    cancelled: 'bg-white/5 text-neutral-500',
};

function formatPence(pence: number): string {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        maximumFractionDigits: 0,
    }).format(pence / 100);
}

function formatPencePrecise(pence: number): string {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
    }).format(pence / 100);
}

function time(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

function relative(iso: string): string {
    const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.round(minutes / 60)}h ago`;

    return `${Math.round(minutes / 1440)}d ago`;
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-white/5 px-5 py-4">
            <p className="text-xs text-neutral-500">{label}</p>
            <p className="mt-1.5 text-2xl font-semibold tabular-nums">
                {value}
            </p>
        </div>
    );
}

export default function Dashboard({ stats, today, popular, recent }: Props) {
    return (
        <>
            <Head title="Dashboard" />

            <AdminShell
                title="Dashboard"
                description="Bookings and occupancy over the last 30 days"
            >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Stat
                        label="Revenue, 30 days"
                        value={formatPence(stats.revenue_pence)}
                    />
                    <Stat
                        label="Bookings, 30 days"
                        value={String(stats.bookings)}
                    />
                    <Stat
                        label="Upcoming screenings"
                        value={String(stats.upcoming_screenings)}
                    />
                    <Stat label="Customers" value={String(stats.customers)} />
                </div>

                <div className="mt-12 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
                    <section>
                        <h2 className="mb-4 text-sm font-medium text-neutral-400">
                            Today&apos;s screenings
                        </h2>

                        {today.length === 0 ? (
                            <p className="rounded-lg border border-white/5 px-6 py-10 text-center text-sm text-neutral-500">
                                Nothing scheduled today.
                            </p>
                        ) : (
                            <ul className="space-y-3">
                                {today.map((screening) => {
                                    const percent =
                                        screening.capacity > 0
                                            ? Math.round(
                                                  (screening.booked /
                                                      screening.capacity) *
                                                      100,
                                              )
                                            : 0;

                                    return (
                                        <li key={screening.id}>
                                            <Link
                                                href={`/screenings/${screening.id}`}
                                                className="block rounded-lg border border-white/5 px-5 py-4 transition-colors hover:border-white/15"
                                            >
                                                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                                                    <p className="font-medium">
                                                        <span className="mr-3 text-neutral-400 tabular-nums">
                                                            {time(
                                                                screening.starts_at,
                                                            )}
                                                        </span>
                                                        {screening.film}
                                                    </p>
                                                    <p className="text-sm text-neutral-500 tabular-nums">
                                                        {screening.booked} /{' '}
                                                        {screening.capacity}{' '}
                                                        seats ·{' '}
                                                        {formatPencePrecise(
                                                            screening.revenue_pence,
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="mt-3 flex items-center gap-3">
                                                    <div
                                                        className="h-1 flex-1 overflow-hidden rounded-full bg-white/5"
                                                        role="presentation"
                                                    >
                                                        <div
                                                            className="h-full rounded-full bg-amber-400"
                                                            style={{
                                                                width: `${percent}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="w-10 text-right text-xs text-neutral-600 tabular-nums">
                                                        {percent}%
                                                    </span>
                                                </div>

                                                <span className="sr-only">
                                                    {screening.screen},{' '}
                                                    {percent}% full
                                                </span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>

                    <div className="space-y-12">
                        <section>
                            <h2 className="mb-4 text-sm font-medium text-neutral-400">
                                Most booked, 30 days
                            </h2>

                            {popular.length === 0 ? (
                                <p className="text-sm text-neutral-600">
                                    No bookings yet.
                                </p>
                            ) : (
                                <ol className="space-y-2.5 text-sm">
                                    {popular.map((film) => (
                                        <li
                                            key={film.id}
                                            className="flex justify-between gap-4"
                                        >
                                            <span className="truncate">
                                                {film.title}
                                            </span>
                                            <span className="shrink-0 text-neutral-500 tabular-nums">
                                                {film.bookings_count}
                                            </span>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </section>

                        <section>
                            <h2 className="mb-4 text-sm font-medium text-neutral-400">
                                Recent bookings
                            </h2>

                            {recent.length === 0 ? (
                                <p className="text-sm text-neutral-600">
                                    Nothing booked yet.
                                </p>
                            ) : (
                                <ul className="space-y-3 text-sm">
                                    {recent.map((booking) => (
                                        <li key={booking.id}>
                                            <div className="flex items-baseline justify-between gap-3">
                                                <span className="truncate">
                                                    {booking.user}
                                                </span>
                                                <span
                                                    className={[
                                                        'shrink-0 rounded-full px-2 py-0.5 text-[0.65rem]',
                                                        STATUS_STYLES[
                                                            booking.status
                                                        ] ??
                                                            STATUS_STYLES.cancelled,
                                                    ].join(' ')}
                                                >
                                                    {booking.status}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 truncate text-xs text-neutral-600">
                                                {booking.film} · {booking.seats}{' '}
                                                {booking.seats === 1
                                                    ? 'seat'
                                                    : 'seats'}{' '}
                                                ·{' '}
                                                {formatPencePrecise(
                                                    booking.total_pence,
                                                )}{' '}
                                                · {relative(booking.created_at)}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </div>
                </div>
            </AdminShell>
        </>
    );
}
