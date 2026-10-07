import { Link } from '@inertiajs/react';
import type { FormEvent } from 'react';

export interface ScreeningFormData {
    film_id: string;
    screen_id: string;
    starts_at: string;
    base_price: string;
}

export interface FilmOption {
    value: number;
    label: string;
    runtime: number;
}

export interface ScreenOption {
    value: number;
    label: string;
}

interface Props {
    data: ScreeningFormData;
    errors: Partial<Record<string, string>>;
    processing: boolean;
    films: FilmOption[];
    screens: ScreenOption[];
    timezone: string;
    onChange: (field: keyof ScreeningFormData, value: string) => void;
    onSubmit: (event: FormEvent) => void;
    submitLabel: string;
    busyLabel: string;
}

const field =
    'mt-1.5 w-full rounded-md border border-neutral-800 bg-transparent px-3 py-2 text-sm focus:border-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400';

const labelClass = 'block text-sm text-neutral-400';

function FieldError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return <p className="mt-1.5 text-sm text-red-400">{message}</p>;
}

function endsAt(startsAt: string, runtime: number): string | null {
    if (!startsAt || !runtime) {
        return null;
    }

    const start = new Date(startsAt);

    if (Number.isNaN(start.getTime())) {
        return null;
    }

    const end = new Date(start.getTime() + runtime * 60_000);

    return end.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function ScreeningForm({
    data,
    errors,
    processing,
    films,
    screens,
    timezone,
    onChange,
    onSubmit,
    submitLabel,
    busyLabel,
}: Props) {
    const film = films.find((option) => String(option.value) === data.film_id);
    const finish = film ? endsAt(data.starts_at, film.runtime) : null;

    return (
        <form onSubmit={onSubmit} className="max-w-xl space-y-6">
            <div>
                <label htmlFor="film_id" className={labelClass}>
                    Film
                </label>
                <select
                    id="film_id"
                    value={data.film_id}
                    onChange={(event) =>
                        onChange('film_id', event.target.value)
                    }
                    required
                    className={field}
                >
                    <option value="" className="bg-neutral-900">
                        Choose a film
                    </option>
                    {films.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            className="bg-neutral-900"
                        >
                            {option.label} ({option.runtime} min)
                        </option>
                    ))}
                </select>
                <FieldError message={errors.film_id} />
            </div>

            <div>
                <label htmlFor="screen_id" className={labelClass}>
                    Screen
                </label>
                <select
                    id="screen_id"
                    value={data.screen_id}
                    onChange={(event) =>
                        onChange('screen_id', event.target.value)
                    }
                    required
                    className={field}
                >
                    <option value="" className="bg-neutral-900">
                        Choose a screen
                    </option>
                    {screens.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            className="bg-neutral-900"
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
                <FieldError message={errors.screen_id} />
            </div>

            <div>
                <label htmlFor="starts_at" className={labelClass}>
                    Starts
                </label>
                <input
                    id="starts_at"
                    type="datetime-local"
                    value={data.starts_at}
                    onChange={(event) =>
                        onChange('starts_at', event.target.value)
                    }
                    required
                    className={field}
                />
                <p className="mt-1.5 text-xs text-neutral-600">
                    {timezone} time.
                    {finish && ` The film ends around ${finish}.`}
                </p>
                <FieldError message={errors.starts_at} />
            </div>

            <div>
                <label htmlFor="base_price" className={labelClass}>
                    Base price (£)
                </label>
                <input
                    id="base_price"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={data.base_price}
                    onChange={(event) =>
                        onChange('base_price', event.target.value)
                    }
                    required
                    className={field}
                />
                <p className="mt-1.5 text-xs text-neutral-600">
                    Before seat surcharges and ticket type discounts.
                </p>
                <FieldError message={errors.base_price} />
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-md bg-amber-400 px-5 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-amber-300 disabled:bg-neutral-800 disabled:text-neutral-600"
                >
                    {processing ? busyLabel : submitLabel}
                </button>
                <Link
                    href="/admin/screenings"
                    className="rounded-md px-4 py-2.5 text-sm text-neutral-400 transition-colors hover:text-neutral-100"
                >
                    Cancel
                </Link>
            </div>
        </form>
    );
}
