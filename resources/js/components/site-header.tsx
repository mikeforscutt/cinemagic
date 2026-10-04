import { Link, router, usePage } from '@inertiajs/react';

interface Props {
    /** Matches the max width of the page content below, so the header lines up. */
    maxWidth?: string;
}

interface AuthUser {
    name: string;
}

export default function SiteHeader({ maxWidth = 'max-w-6xl' }: Props) {
    const { auth } = usePage().props as unknown as {
        auth: { user: AuthUser | null };
    };

    return (
        <header className="border-b border-white/5">
            <div
                className={`mx-auto flex ${maxWidth} items-center justify-between px-6 py-5`}
            >
                <Link href="/" className="text-lg font-semibold tracking-tight">
                    Cinemagic
                </Link>

                <nav className="flex items-center gap-6 text-sm text-neutral-400">
                    <Link
                        href="/screenings"
                        className="transition-colors hover:text-neutral-100"
                    >
                        What&apos;s on
                    </Link>

                    {auth.user ? (
                        <>
                            <Link
                                href="/bookings"
                                className="transition-colors hover:text-neutral-100"
                            >
                                My bookings
                            </Link>
                            <span className="hidden text-neutral-100 sm:inline">
                                {auth.user.name}
                            </span>
                            <button
                                type="button"
                                onClick={() => router.post('/logout')}
                                className="transition-colors hover:text-neutral-100"
                            >
                                Log out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="transition-colors hover:text-neutral-100"
                            >
                                Log in
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-md bg-white/10 px-3 py-1.5 text-neutral-100 transition-colors hover:bg-white/15"
                            >
                                Sign up
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
