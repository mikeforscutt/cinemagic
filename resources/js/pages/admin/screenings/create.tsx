import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AdminShell from '@/components/admin-shell';
import ScreeningForm, {
    type FilmOption,
    type ScreenOption,
    type ScreeningFormData,
} from '@/components/screening-form';

interface Props {
    films: FilmOption[];
    screens: ScreenOption[];
    timezone: string;
}

export default function Create({ films, screens, timezone }: Props) {
    const { data, setData, post, processing, errors } =
        useForm<ScreeningFormData>({
            film_id: '',
            screen_id: '',
            starts_at: '',
            base_price: '9.50',
        });

    function submit(event: FormEvent) {
        event.preventDefault();
        post('/admin/screenings');
    }

    return (
        <>
            <Head title="Schedule screening" />

            <AdminShell
                title="Schedule screening"
                description="A screen needs 15 minutes between films, so overlapping times are rejected."
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
                    submitLabel="Schedule it"
                    busyLabel="Scheduling…"
                />
            </AdminShell>
        </>
    );
}