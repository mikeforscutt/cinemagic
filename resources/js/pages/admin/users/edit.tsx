import { Head, Link, useForm } from '@inertiajs/react';
import AdminShell from '@/components/admin-shell';

interface Props {
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    roles: { value: string; label: string }[];
    canChangeRole: boolean;
    canDelete: boolean;
}

export default function Edit({ user, roles, canChangeRole, canDelete }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
    });

    const { delete: destroy, processing: deleting } = useForm();

    function submit(event: React.FormEvent) {
        event.preventDefault();
        put(`/admin/users/${user.id}`);
    }

    function remove() {
        if (
            !confirm(
                `Remove ${user.name}? Their bookings will be deleted too. This can't be undone.`,
            )
        ) {
            return;
        }

        destroy(`/admin/users/${user.id}`);
    }

    return (
        <>
            <Head title={`Edit ${user.name}`} />

            <AdminShell title={user.name} description={user.email}>
                <form onSubmit={submit} className="max-w-lg space-y-6">
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm text-neutral-400"
                        >
                            Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(event) =>
                                setData('name', event.target.value)
                            }
                            required
                            className="mt-1.5 w-full rounded-md border border-neutral-800 bg-transparent px-3 py-2 text-sm focus:border-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                        />
                        {errors.name && (
                            <p className="mt-1.5 text-sm text-red-400">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm text-neutral-400"
                        >
                            Email address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(event) =>
                                setData('email', event.target.value)
                            }
                            required
                            className="mt-1.5 w-full rounded-md border border-neutral-800 bg-transparent px-3 py-2 text-sm focus:border-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                        />
                        {errors.email && (
                            <p className="mt-1.5 text-sm text-red-400">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm text-neutral-400"
                        >
                            New password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(event) =>
                                setData('password', event.target.value)
                            }
                            autoComplete="new-password"
                            className="mt-1.5 w-full rounded-md border border-neutral-800 bg-transparent px-3 py-2 text-sm focus:border-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                        />
                        <p className="mt-1.5 text-xs text-neutral-600">
                            Leave blank to keep their current password.
                        </p>
                        {errors.password && (
                            <p className="mt-1.5 text-sm text-red-400">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="role"
                            className="block text-sm text-neutral-400"
                        >
                            Role
                        </label>
                        <select
                            id="role"
                            value={data.role}
                            onChange={(event) =>
                                setData('role', event.target.value)
                            }
                            disabled={!canChangeRole}
                            className="mt-1.5 w-full rounded-md border border-neutral-800 bg-transparent px-3 py-2 text-sm focus:border-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:text-neutral-600"
                        >
                            {roles.map((role) => (
                                <option
                                    key={role.value}
                                    value={role.value}
                                    className="bg-neutral-900"
                                >
                                    {role.label}
                                </option>
                            ))}
                        </select>
                        {!canChangeRole && (
                            <p className="mt-1.5 text-xs text-neutral-600">
                                You can't change your own role.
                            </p>
                        )}
                        {errors.role && (
                            <p className="mt-1.5 text-sm text-red-400">
                                {errors.role}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-amber-400 px-5 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-amber-300 disabled:bg-neutral-800 disabled:text-neutral-600"
                        >
                            {processing ? 'Saving…' : 'Save changes'}
                        </button>
                        <Link
                            href="/admin/users"
                            className="rounded-md px-4 py-2.5 text-sm text-neutral-400 transition-colors hover:text-neutral-100"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>

                {canDelete && (
                    <div className="mt-12 max-w-lg border-t border-white/5 pt-6">
                        <h2 className="text-sm font-medium">
                            Remove this user
                        </h2>
                        <p className="mt-1 text-sm text-neutral-500">
                            Deletes the account and every booking attached to
                            it. This can't be undone.
                        </p>
                        <button
                            type="button"
                            onClick={remove}
                            disabled={deleting}
                            className="mt-4 rounded-md border border-red-900 px-4 py-2 text-sm text-red-300 transition-colors hover:bg-red-950/40"
                        >
                            {deleting ? 'Removing…' : `Remove ${user.name}`}
                        </button>
                    </div>
                )}
            </AdminShell>
        </>
    );
}
