import { Head, Link, router } from '@inertiajs/react';
import AdminShell from '@/components/admin-shell';

interface ScreeningRow {
    id: number;
    starts_at: string;
    film: string;
    screen: string;
    runtime_minutes: number;
    base_price_pence: number;
    bookings_count: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    screenings: {
        data: ScreeningRow[];
        links: PaginationLink[];
    };
    canManage: boolean;
}

const TIMEZONE = 'Europe/London';

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        timeZone: TIMEZONE,
    });
}

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: TIMEZONE,
    });
}

function formatPrice(pence: number): string {
    return `£${(pence / 100).toFixed(2)}`;
}

function cleanLabel(label: string): string {
    return label.replace('&laquo;', '‹').replace('&raquo;', '›');
}

export default function Index({ screenings, canManage }: Props) {
    function destroy(screening: ScreeningRow) {
        const when = `${formatDate(screening.starts_at)} at ${formatTime(screening.starts_at)}`;

        if (
            window.confirm(
                `Remove ${screening.film} on ${when}? This cannot be undone.`,
            )
        ) {
            router.delete(`/admin/screenings/${screening.id}`, {
                preserveScroll: true,
            });
        }
    }

    return (
        <>
            <Head title="Screenings" />

            <AdminShell
                title="Screenings"
                description={
                    canManage
                        ? 'Everything scheduled from today onwards, soonest first.'
                        : 'Everything scheduled from today onwards. Scheduling is admin only.'
                }
                actions={
                    canManage ? (
                        <Link
                            href="/admin/screenings/create"
                            className="rounded-md bg-amber-400 px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-amber-300"
                        >
                            Schedule screening
                        </Link>
                    ) : null
                }
            >
                {screenings.data.length === 0 ? (
                    <p className="rounded-lg border border-neutral-900 px-6 py-12 text-center text-sm text-neutral-500">
                        Nothing scheduled.
                    </p>
                ) : (
                    <div className="overflow-hidden rounded-lg border border-neutral-900">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-neutral-900 text-xs tracking-wide text-neutral-500 uppercase">
                                <tr>
                                    <th className="px-4 py-3 font-medium">
                                        When
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Film
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Screen
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        From
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Bookings
                                    </th>
                                    {canManage && <th className="px-4 py-3" />}
                                </tr>
                            </thead>
                            <tbody>
                                {screenings.data.map((screening) => {
                                    const booked = screening.bookings_count > 0;

                                    return (
                                        <tr
                                            key={screening.id}
                                            className="border-b border-neutral-900 last:border-0"
                                        >
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-neutral-100">
                                                    {formatTime(
                                                        screening.starts_at,
                                                    )}
                                                </p>
                                                <p className="text-xs text-neutral-600">
                                                    {formatDate(
                                                        screening.starts_at,
                                                    )}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 text-neutral-300">
                                                {screening.film}
                                                <span className="ml-2 text-xs text-neutral-600">
                                                    {screening.runtime_minutes}{' '}
                                                    min
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-neutral-400">
                                                {screening.screen}
                                            </td>
                                            <td className="px-4 py-3 text-neutral-400">
                                                {formatPrice(
                                                    screening.base_price_pence,
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-neutral-400">
                                                {screening.bookings_count}
                                            </td>
                                            {canManage && (
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-4">
                                                        {booked ? (
                                                            <span
                                                                title="People have booked this screening"
                                                                className="cursor-not-allowed text-neutral-700"
                                                            >
                                                                Edit
                                                            </span>
                                                        ) : (
                                                            <Link
                                                                href={`/admin/screenings/${screening.id}/edit`}
                                                                className="text-amber-400 transition-colors hover:text-amber-300"
                                                            >
                                                                Edit
                                                            </Link>
                                                        )}

                                                        {booked ? (
                                                            <span
                                                                title="People have booked this screening"
                                                                className="cursor-not-allowed text-neutral-700"
                                                            >
                                                                Remove
                                                            </span>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    destroy(
                                                                        screening,
                                                                    )
                                                                }
                                                                className="text-red-400 transition-colors hover:text-red-300"
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {screenings.links.length > 3 && (
                    <nav className="mt-6 flex flex-wrap items-center gap-1">
                        {screenings.links.map((link) => {
                            const label = cleanLabel(link.label);

                            if (!link.url) {
                                return (
                                    <span
                                        key={label}
                                        className="rounded px-3 py-1.5 text-sm text-neutral-700"
                                    >
                                        {label}
                                    </span>
                                );
                            }

                            return (
                                <Link
                                    key={label}
                                    href={link.url}
                                    className={
                                        link.active
                                            ? 'rounded bg-amber-400 px-3 py-1.5 text-sm font-medium text-neutral-900'
                                            : 'rounded px-3 py-1.5 text-sm text-neutral-400 transition-colors hover:text-neutral-100'
                                    }
                                >
                                    {label}
                                </Link>
                            );
                        })}
                    </nav>
                )}
            </AdminShell>
        </>
    );
}
