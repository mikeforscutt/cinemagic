import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AdminShell from '@/components/admin-shell';

interface UserRow {
    id: number;
    name: string;
    email: string;
    role: string;
    bookings_count: number;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    users: {
        data: UserRow[];
        links: PaginationLink[];
        total: number;
        from: number | null;
        to: number | null;
    };
    filters: {
        search: string;
    };
    roles: { value: string; label: string }[];
}

const ROLE_STYLES: Record<string, string> = {
    admin: 'bg-amber-400/10 text-amber-300',
    staff: 'bg-sky-400/10 text-sky-300',
    customer: 'bg-white/5 text-neutral-400',
};

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export default function Index({ users, filters, roles }: Props) {
    const [search, setSearch] = useState(filters.search);
    const { delete: destroy } = useForm();

    // Debounced search, so typing doesn't fire a request per keystroke.
    useEffect(() => {
        if (search === filters.search) {
            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                '/admin/users',
                { search },
                { preserveState: true, replace: true },
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, filters.search]);

    function remove(user: UserRow) {
        if (
            !confirm(
                `Remove ${user.name}? Their bookings will be deleted too. This can't be undone.`,
            )
        ) {
            return;
        }

        destroy(`/admin/users/${user.id}`, { preserveScroll: true });
    }

    function roleLabel(value: string): string {
        return roles.find((role) => role.value === value)?.label ?? value;
    }

    return (
        <>
            <Head title="Users" />

            <AdminShell
                title="Users"
                description={`${users.total} ${users.total === 1 ? 'account' : 'accounts'}`}
                actions={
                    <Link
                        href="/admin/users/create"
                        className="rounded-md bg-amber-400 px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-amber-300"
                    >
                        Add user
                    </Link>
                }
            >
                <div className="mb-6">
                    <label htmlFor="search" className="sr-only">
                        Search users
                    </label>
                    <input
                        id="search"
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by name or email"
                        className="w-full max-w-sm rounded-md border border-neutral-800 bg-transparent px-3 py-2 text-sm placeholder:text-neutral-600 focus:border-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    />
                </div>

                {users.data.length === 0 ? (
                    <p className="rounded-lg border border-white/5 px-6 py-12 text-center text-neutral-400">
                        No users match that search.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/5 text-left text-xs text-neutral-500 [&>th]:pr-6 [&>th:last-child]:pr-0">
                                    <th
                                        scope="col"
                                        className="pb-3 font-medium"
                                    >
                                        Name
                                    </th>
                                    <th
                                        scope="col"
                                        className="pb-3 font-medium"
                                    >
                                        Email
                                    </th>
                                    <th
                                        scope="col"
                                        className="pb-3 font-medium"
                                    >
                                        Role
                                    </th>
                                    <th
                                        scope="col"
                                        className="pb-3 text-right font-medium"
                                    >
                                        Bookings
                                    </th>
                                    <th
                                        scope="col"
                                        className="pb-3 font-medium"
                                    >
                                        Joined
                                    </th>
                                    <th scope="col" className="pb-3">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b border-white/5 [&>td]:pr-6 [&>td:last-child]:pr-0"
                                    >
                                        <td className="py-3 font-medium">
                                            {user.name}
                                        </td>
                                        <td className="py-3 text-neutral-400">
                                            {user.email}
                                        </td>
                                        <td className="py-3">
                                            <span
                                                className={[
                                                    'rounded-full px-2 py-0.5 text-[0.65rem]',
                                                    ROLE_STYLES[user.role] ??
                                                        ROLE_STYLES.customer,
                                                ].join(' ')}
                                            >
                                                {roleLabel(user.role)}
                                            </span>
                                        </td>
                                        <td className="py-3 text-right text-neutral-400 tabular-nums">
                                            {user.bookings_count}
                                        </td>
                                        <td className="py-3 whitespace-nowrap text-neutral-500">
                                            {formatDate(user.created_at)}
                                        </td>
                                        <td className="py-3 text-right whitespace-nowrap">
                                            <Link
                                                href={`/admin/users/${user.id}/edit`}
                                                className="text-neutral-400 transition-colors hover:text-amber-400"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => remove(user)}
                                                className="ml-4 text-neutral-500 transition-colors hover:text-red-400"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {users.links.length > 3 && (
                    <nav
                        aria-label="Pagination"
                        className="mt-6 flex flex-wrap gap-1"
                    >
                        {users.links.map((link, index) =>
                            link.url ? (
                                <Link
                                    key={index}
                                    href={link.url}
                                    preserveState
                                    className={[
                                        'rounded px-3 py-1.5 text-sm transition-colors',
                                        link.active
                                            ? 'bg-neutral-100 text-neutral-900'
                                            : 'text-neutral-400 hover:bg-white/5',
                                    ].join(' ')}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ) : (
                                <span
                                    key={index}
                                    className="rounded px-3 py-1.5 text-sm text-neutral-700"
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ),
                        )}
                    </nav>
                )}
            </AdminShell>
        </>
    );
}
