import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AdminShell from '@/components/admin-shell';
import ScreeningForm, {
    type FilmOption,
    type ScreenOption,
    type ScreeningFormData,
} from '@/components/screening-form';

interface Props {
    screening: {
        id: number;
        film_id: number;
        screen_id: number;
        starts_at: string;
        base_price: string;
    };
    films: FilmOption[];
    screens: ScreenOption[];
    timezone: string;
}

export default function Edit({ screening, films, screens, timezone }: Props) {
    const { data, setData, put, processing, errors } =
        useForm<ScreeningFormData>({
            film_id: String(screening.film_id),
            screen_id: String(screening.screen_id),
            starts_at: screening.starts_at,
            base_price: screening.base_price,
        });

    function submit(event: FormEvent) {
        event.preventDefault();
        put(`/admin/screenings/${screening.id}`);
    }

    return (
        <>
            <Head title="Edit screening" />

            <AdminShell
                title="Edit screening"
                description="Nobody has booked this one yet, so it can still be moved."
                actions={
                    <Link
                        href="/admin/screenings"
                        className="rounded-md px-4 py-2 text-sm text-neutral-400 transition-colors hover:text-neutral-100"
                    >
                        Back to schedule
                    </Link>
                }
            >
                <ScreeningForm
                    data={data}
                    errors={errors}
                    processing={processing}
                    films={films}
                    screens={screens}
                    timezone={timezone}
                    onChange={(fieldName, value) => setData(fieldName, value)}
                    onSubmit={submit}
                    submitLabel="Save changes"
                    busyLabel="Saving…"
                />
            </AdminShell>
        </>
    );
}
