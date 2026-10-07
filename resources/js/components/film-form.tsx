import { Link } from '@inertiajs/react';
import type { FormEvent } from 'react';

export interface FilmFormData {
    title: string;
    synopsis: string;
    runtime_minutes: string;
    certificate: string;
    release_date: string;
    director: string;
    genres: string;
    cast_list: string;
    poster_path: string;
}

interface Props {
    data: FilmFormData;
    errors: Partial<Record<string, string>>;
    processing: boolean;
    onChange: (field: keyof FilmFormData, value: string) => void;
    onSubmit: (event: FormEvent) => void;
    submitLabel: string;
    busyLabel: string;
}

const CERTIFICATES = ['U', 'PG', '12A', '12', '15', '18'];

const field =
    'mt-1.5 w-full rounded-md border border-neutral-800 bg-transparent px-3 py-2 text-sm focus:border-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400';

const labelClass = 'block text-sm text-neutral-400';

function FieldError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return <p className="mt-1.5 text-sm text-red-400">{message}</p>;
}

export default function FilmForm({
    data,
    errors,
    processing,
    onChange,
    onSubmit,
    submitLabel,
    busyLabel,
}: Props) {
    return (
        <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
            <div>
                <label htmlFor="title" className={labelClass}>
                    Title
                </label>
                <input
                    id="title"
                    type="text"
                    value={data.title}
                    onChange={(event) => onChange('title', event.target.value)}
                    required
                    autoFocus
                    className={field}
                />
                <FieldError message={errors.title ?? errors.slug} />
            </div>

            <div>
                <label htmlFor="synopsis" className={labelClass}>
                    Synopsis
                </label>
                <textarea
                    id="synopsis"
                    value={data.synopsis}
                    onChange={(event) =>
                        onChange('synopsis', event.target.value)
                    }
                    required
                    rows={5}
                    className={field}
                />
                <FieldError message={errors.synopsis} />
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
                <div>
                    <label htmlFor="runtime_minutes" className={labelClass}>
                        Runtime (mins)
                    </label>
                    <input
                        id="runtime_minutes"
                        type="number"
                        min={1}
                        max={600}
                        value={data.runtime_minutes}
                        onChange={(event) =>
                            onChange('runtime_minutes', event.target.value)
                        }
                        required
                        className={field}
                    />
                    <FieldError message={errors.runtime_minutes} />
                </div>

                <div>
                    <label htmlFor="certificate" className={labelClass}>
                        Certificate
                    </label>
                    <select
                        id="certificate"
                        value={data.certificate}
                        onChange={(event) =>
                            onChange('certificate', event.target.value)
                        }
                        className={field}
                    >
                        {CERTIFICATES.map((certificate) => (
                            <option
                                key={certificate}
                                value={certificate}
                                className="bg-neutral-900"
                            >
                                {certificate}
                            </option>
                        ))}
                    </select>
                    <FieldError message={errors.certificate} />
                </div>

                <div>
                    <label htmlFor="release_date" className={labelClass}>
                        Release date
                    </label>
                    <input
                        id="release_date"
                        type="date"
                        value={data.release_date}
                        onChange={(event) =>
                            onChange('release_date', event.target.value)
                        }
                        required
                        className={field}
                    />
                    <FieldError message={errors.release_date} />
                </div>
            </div>

            <div>
                <label htmlFor="director" className={labelClass}>
                    Director
                </label>
                <input
                    id="director"
                    type="text"
                    value={data.director}
                    onChange={(event) =>
                        onChange('director', event.target.value)
                    }
                    required
                    className={field}
                />
                <FieldError message={errors.director} />
            </div>

            <div>
                <label htmlFor="genres" className={labelClass}>
                    Genres
                </label>
                <input
                    id="genres"
                    type="text"
                    value={data.genres}
                    onChange={(event) => onChange('genres', event.target.value)}
                    required
                    placeholder="Drama, Thriller"
                    className={field}
                />
                <p className="mt-1.5 text-xs text-neutral-600">
                    Separate with commas. Up to five.
                </p>
                <FieldError message={errors.genres} />
            </div>

            <div>
                <label htmlFor="cast_list" className={labelClass}>
                    Cast
                </label>
                <input
                    id="cast_list"
                    type="text"
                    value={data.cast_list}
                    onChange={(event) =>
                        onChange('cast_list', event.target.value)
                    }
                    required
                    placeholder="Niamh Carter, Luis Oyelaran"
                    className={field}
                />
                <p className="mt-1.5 text-xs text-neutral-600">
                    Separate with commas. Up to twenty.
                </p>
                <FieldError message={errors.cast_list} />
            </div>

            <div>
                <label htmlFor="poster_path" className={labelClass}>
                    Poster URL
                </label>
                <input
                    id="poster_path"
                    type="url"
                    value={data.poster_path}
                    onChange={(event) =>
                        onChange('poster_path', event.target.value)
                    }
                    required
                    placeholder="https://images.unsplash.com/..."
                    className={field}
                />
                <FieldError message={errors.poster_path} />
            </div>

            {data.poster_path && (
                <div>
                    <p className={labelClass}>Preview</p>
                    <img
                        src={data.poster_path}
                        alt=""
                        className="mt-1.5 h-48 w-32 rounded-md border border-neutral-800 object-cover"
                    />
                </div>
            )}

            <div className="flex items-center gap-3">
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-md bg-amber-400 px-5 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-amber-300 disabled:bg-neutral-800 disabled:text-neutral-600"
                >
                    {processing ? busyLabel : submitLabel}
                </button>
                <Link
                    href="/admin/films"
                    className="rounded-md px-4 py-2.5 text-sm text-neutral-400 transition-colors hover:text-neutral-100"
                >
                    Cancel
                </Link>
            </div>
        </form>
    );
}
