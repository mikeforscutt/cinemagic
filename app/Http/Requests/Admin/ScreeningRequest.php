<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Models\Film;
use App\Models\Screening;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

abstract class ScreeningRequest extends FormRequest
{
    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'film_id' => ['required', 'integer', 'exists:films,id'],
            'screen_id' => ['required', 'integer', 'exists:screens,id'],
            'starts_at' => ['required', 'date'],
            'base_price' => ['required', 'numeric', 'min:0', 'max:100'],
        ];
    }

    /**
     * The admin types local time. Everything is stored in UTC, so the input
     * is read in the cinema's timezone and converted exactly once, here.
     */
    public function startsAt(): CarbonImmutable
    {
        return CarbonImmutable::parse(
            (string) $this->input('starts_at'),
            Screening::TIMEZONE,
        )->utc();
    }

    public function basePricePence(): int
    {
        return (int) round(((float) $this->input('base_price')) * 100);
    }

    /**
     * Two films cannot run in one screen at once. A screening occupies its
     * screen for the runtime plus a turnaround gap, so the check compares
     * whole windows rather than start times.
     *
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $film = Film::find($this->input('film_id'));

                if (! $film) {
                    return;
                }

                $start = $this->startsAt();
                $end = $start->addMinutes(
                    $film->runtime_minutes + Screening::TURNAROUND_MINUTES,
                );

                $clash = Screening::query()
                    ->where('screen_id', $this->input('screen_id'))
                    ->when(
                        $this->ignoredScreeningId(),
                        fn ($query, int $id) => $query->whereKeyNot($id),
                    )
                    ->whereBetween('starts_at', [
                        $start->subDay(),
                        $start->addDay(),
                    ])
                    ->with('film:id,title,runtime_minutes')
                    ->get()
                    ->first(function (Screening $existing) use ($start, $end): bool {
                        $existingEnd = $existing->starts_at->addMinutes(
                            $existing->film->runtime_minutes
                                + Screening::TURNAROUND_MINUTES,
                        );

                        return $start < $existingEnd
                            && $existing->starts_at < $end;
                    });

                if ($clash !== null) {
                    $validator->errors()->add(
                        'starts_at',
                        sprintf(
                            'That screen is showing %s until %s.',
                            $clash->film->title,
                            $clash->starts_at
                                ->addMinutes(
                                    $clash->film->runtime_minutes
                                        + Screening::TURNAROUND_MINUTES,
                                )
                                ->setTimezone(Screening::TIMEZONE)
                                ->format('H:i'),
                        ),
                    );
                }
            },
        ];
    }

    abstract protected function ignoredScreeningId(): ?int;
}
