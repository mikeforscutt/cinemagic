import { Head, Link, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AdminShell from '@/components/admin-shell';
import FilmForm, { type FilmFormData } from '@/components/film-form';

interface Film {
    id: number;
    title: string;
    synopsis: string;
    runtime_minutes: number;
    certificate: string;
    release_date: string | null;
    director: string;
    genres: string[];
    cast_list: string[];
    poster_path: string;
}

interface Props {
    film: Film;
    screeningsCount: number;
}

function toList(value: string): string[] {
    return value
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
}

export default function Edit({ film, screeningsCount }: Props) {
    const { data, setData, put, transform, processing, errors } =
        useForm<FilmFormData>({
            title: film.title,
            synopsis: film.synopsis,
            runtime_minutes: String(film.runtime_minutes),
            certificate: film.certificate,
            release_date: film.release_date ?? '',
            director: film.director,
            genres: film.genres.join(', '),
            cast_list: film.cast_list.join(', '),
            poster_path: film.poster_path,
        });

    function submit(event: FormEvent) {
        event.preventDefault();

        transform((form) => ({
            ...form,
            runtime_minutes: Number(form.runtime_minutes),
            genres: toList(form.genres),
            cast_list: toList(form.cast_list),
        }));

        put(`/admin/films/${film.id}`);
    }

    function destroy() {
        if (window.confirm(`Delete “${film.title}”? This cannot be undone.`)) {
            router.delete(`/admin/films/${film.id}`);
        }
    }

    return (
        <>
            <Head title={`Edit ${film.title}`} />

            <AdminShell
                title="Edit film"
                description={
                    screeningsCount > 0
                        ? `${screeningsCount} screening${screeningsCount === 1 ? '' : 's'} scheduled, so this film cannot be deleted.`
                        : 'No screenings scheduled yet.'
                }
                actions={
                    screeningsCount === 0 ? (
                        <button
                            type="button"
                            onClick={destroy}
                            className="rounded-md border border-red-500/30 px-4 py-2 text-sm text-red-400 transition-colors hover:border-red-500/60 hover:text-red-300"
                        >
                            Delete film
                        </button>
                    ) : (
                        <Link
                            href="/admin/films"
                            className="rounded-md px-4 py-2 text-sm text-neutral-400 transition-colors hover:text-neutral-100"
                        >
                            Back to films
                        </Link>
                    )
                }
            >
                <FilmForm
                    data={data}
                    errors={errors}
                    processing={processing}
                    onChange={(fieldName, value) => setData(fieldName, value)}
                    onSubmit={submit}
                    submitLabel="Save changes"
                    busyLabel="Saving…"
                />
            </AdminShell>
        </>
    );
}
