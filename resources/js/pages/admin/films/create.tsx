import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AdminShell from '@/components/admin-shell';
import FilmForm, { type FilmFormData } from '@/components/film-form';

function toList(value: string): string[] {
    return value
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
}

export default function Create() {
    const { data, setData, post, transform, processing, errors } =
        useForm<FilmFormData>({
            title: '',
            synopsis: '',
            runtime_minutes: '',
            certificate: '15',
            release_date: '',
            director: '',
            genres: '',
            cast_list: '',
            poster_path: '',
        });

    function submit(event: FormEvent) {
        event.preventDefault();

        transform((form) => ({
            ...form,
            runtime_minutes: Number(form.runtime_minutes),
            genres: toList(form.genres),
            cast_list: toList(form.cast_list),
        }));

        post('/admin/films');
    }

    return (
        <>
            <Head title="Add film" />

            <AdminShell
                title="Add film"
                description="The slug is generated from the title, so make it distinct."
            >
                <FilmForm
                    data={data}
                    errors={errors}
                    processing={processing}
                    onChange={(fieldName, value) => setData(fieldName, value)}
                    onSubmit={submit}
                    submitLabel="Add film"
                    busyLabel="Adding…"
                />
            </AdminShell>
        </>
    );
}
