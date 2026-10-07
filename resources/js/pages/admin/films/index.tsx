import { Head, Link, router } from '@inertiajs/react';
import AdminShell from '@/components/admin-shell';

interface FilmRow {
    id: number;
    title: string;
    slug: string;
    certificate: string;
    runtime_minutes: number;
    release_date: string | null;
    screenings_count: number;
    poster_path: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    films: {
        data: FilmRow[];
        links: PaginationLink[];
    };
}

function formatDate(value: string | null): string {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function cleanLabel(label: string): string {
    return label.replace('&laquo;', '‹').replace('&raquo;', '›');
}

export default function Index({ films }: Props) {
    function destroy(film: FilmRow) {
        if (window.confirm(`Delete “${film.title}”? This cannot be undone.`)) {
            router.delete(`/admin/films/${film.id}`, {
                preserveScroll: true,
            });
        }
    }

    return (
        <>
            <Head title="Films" />

            <AdminShell
                title="Films"
                description="Everything in the catalogue, newest first."
                actions={
                    <Link
                        href="/admin/films/create"
                        className="rounded-md bg-amber-400 px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-amber-300"
                    >
                        Add film
                    </Link>
                }
            >
                {films.data.length === 0 ? (
                    <p className="rounded-lg border border-neutral-900 px-6 py-12 text-center text-sm text-neutral-500">
                        No films yet. Add the first one.
                    </p>
                ) : (
                    <div className="overflow-hidden rounded-lg border border-neutral-900">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-neutral-900 text-xs tracking-wide text-neutral-500 uppercase">
                                <tr>
                                    <th className="px-4 py-3 font-medium">
                                        Film
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Certificate
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Runtime
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Released
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Screenings
                                    </th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody>
                                {films.data.map((film) => (
                                    <tr
                                        key={film.id}
                                        className="border-b border-neutral-900 last:border-0"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={film.poster_path}
                                                    alt=""
                                                    className="h-14 w-10 rounded border border-neutral-800 object-cover"
                                                />
                                                <div>
                                                    <p className="font-medium text-neutral-100">
                                                        {film.title}
                                                    </p>
                                                    <p className="text-xs text-neutral-600">
                                                        {film.slug}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-neutral-400">
                                            {film.certificate}
                                        </td>
                                        <td className="px-4 py-3 text-neutral-400">
                                            {film.runtime_minutes} min
                                        </td>
                                        <td className="px-4 py-3 text-neutral-400">
                                            {formatDate(film.release_date)}
                                        </td>
                                        <td className="px-4 py-3 text-neutral-400">
                                            {film.screenings_count}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-4">
                                                <Link
                                                    href={`/admin/films/${film.id}/edit`}
                                                    className="text-amber-400 transition-colors hover:text-amber-300"
                                                >
                                                    Edit
                                                </Link>

                                                {film.screenings_count > 0 ? (
                                                    <span
                                                        title="Remove its screenings first"
                                                        className="cursor-not-allowed text-neutral-700"
                                                    >
                                                        Delete
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            destroy(film)
                                                        }
                                                        className="text-red-400 transition-colors hover:text-red-300"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {films.links.length > 3 && (
                    <nav className="mt-6 flex flex-wrap items-center gap-1">
                        {films.links.map((link) => {
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
