import { Head, Link, useForm } from '@inertiajs/react';
import AdminShell from '@/components/admin-shell';

interface Props {
    roles: { value: string; label: string }[];
}

export default function Create({ roles }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'customer',
    });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        post('/admin/users');
    }

    return (
        <>
            <Head title="Add user" />

            <AdminShell
                title="Add user"
                description="The account is created verified, so they can sign in straight away."
            >
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
                            autoFocus
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
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(event) =>
                                setData('password', event.target.value)
                            }
                            required
                            autoComplete="new-password"
                            className="mt-1.5 w-full rounded-md border border-neutral-800 bg-transparent px-3 py-2 text-sm focus:border-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                        />
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
                            className="mt-1.5 w-full rounded-md border border-neutral-800 bg-transparent px-3 py-2 text-sm focus:border-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
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
                            {processing ? 'Adding…' : 'Add user'}
                        </button>
                        <Link
                            href="/admin/users"
                            className="rounded-md px-4 py-2.5 text-sm text-neutral-400 transition-colors hover:text-neutral-100"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </AdminShell>
        </>
    );
}
