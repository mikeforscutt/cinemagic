import { Link, router, usePage } from '@inertiajs/react';
import type { PropsWithChildren, ReactNode } from 'react';

interface Props {
    title: string;
    description?: string;
    actions?: ReactNode;
}

interface AuthUser {
    name: string;
}

const NAV = [
    { label: 'Dashboard', href: '/admin', exact: true },
    { label: 'Films', href: '/admin/films' },
    { label: 'Users', href: '/admin/users' },
];

export default function AdminShell({
    title,
    description,
    actions,
    children,
}: PropsWithChildren<Props>) {
    const { auth, url } = usePage().props as unknown as {
        auth: { user: AuthUser | null };
        url?: string;
    };

    const currentPath =
        url ?? (typeof window !== 'undefined' ? window.location.pathname : '');

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-neutral-100">
            <header className="border-b border-white/5">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-8">
                        <Link
                            href="/admin/"
                            className="text-sm font-semibold tracking-tight"
                        >
                            Cinemagic
                            <span className="ml-2 rounded bg-amber-400/10 px-1.5 py-0.5 text-[0.65rem] font-medium text-amber-400">
                                Admin
                            </span>
                        </Link>

                        <nav className="flex items-center gap-5 text-sm">
                            {NAV.map((item) => {
                                const active = item.exact
                                    ? currentPath === item.href
                                    : currentPath.startsWith(item.href);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={
                                            active
                                                ? 'text-neutral-100'
                                                : 'text-neutral-500 transition-colors hover:text-neutral-300'
                                        }
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <nav className="flex items-center gap-5 text-sm text-neutral-400">
                        <Link
                            href="/"
                            className="transition-colors hover:text-neutral-100"
                        >
                            View site
                        </Link>
                        {auth.user && (
                            <span className="hidden text-neutral-500 sm:inline">
                                {auth.user.name}
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={() => router.post('/logout')}
                            className="transition-colors hover:text-neutral-100"
                        >
                            Log out
                        </button>
                    </nav>
                </div>
            </header>

            <div className="mx-auto max-w-6xl px-6 py-10">
                <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {title}
                        </h1>
                        {description && (
                            <p className="mt-1 text-sm text-neutral-500">
                                {description}
                            </p>
                        )}
                    </div>

                    {actions}
                </div>

                {children}
            </div>
        </div>
    );
}
