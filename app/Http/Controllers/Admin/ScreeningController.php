<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreScreeningRequest;
use App\Http\Requests\Admin\UpdateScreeningRequest;
use App\Models\Film;
use App\Models\Screen;
use App\Models\Screening;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

final class ScreeningController extends Controller
{
    /**
     * No Gate call here: ScreeningPolicy::viewAny is public because the
     * customer-facing listing uses it. The admin middleware is what keeps
     * this page to admins and staff.
     */
    public function index(): Response
    {
        $screenings = Screening::query()
            ->with(['film:id,title,runtime_minutes', 'screen:id,name'])
            ->withCount('bookings')
            ->where('starts_at', '>', now()->subDay())
            ->orderBy('starts_at')
            ->paginate(20)
            ->through(fn (Screening $screening): array => [
                'id' => $screening->id,
                'starts_at' => $screening->starts_at->toAtomString(),
                'film' => $screening->film->title,
                'screen' => $screening->screen->name,
                'runtime_minutes' => $screening->film->runtime_minutes,
                'base_price_pence' => $screening->base_price_pence,
                'bookings_count' => $screening->bookings_count,
            ]);

        return Inertia::render('admin/screenings/index', [
            'screenings' => $screenings,
            // Staff read the schedule but cannot change it, so the page is
            // told whether to offer the controls at all.
            'canManage' => Gate::allows('create', Screening::class),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Screening::class);

        return Inertia::render('admin/screenings/create', [
            'films' => $this->filmOptions(),
            'screens' => $this->screenOptions(),
            'timezone' => Screening::TIMEZONE,
        ]);
    }

    public function store(StoreScreeningRequest $request): RedirectResponse
    {
        Gate::authorize('create', Screening::class);

        Screening::create([
            'film_id' => $request->integer('film_id'),
            'screen_id' => $request->integer('screen_id'),
            'starts_at' => $request->startsAt(),
            'base_price_pence' => $request->basePricePence(),
        ]);

        return to_route('admin.screenings.index')
            ->with('success', 'Screening scheduled.');
    }

    public function edit(Screening $screening): Response
    {
        Gate::authorize('update', $screening);

        return Inertia::render('admin/screenings/edit', [
            'screening' => [
                'id' => $screening->id,
                'film_id' => $screening->film_id,
                'screen_id' => $screening->screen_id,
                'starts_at' => $screening->starts_at
                    ->setTimezone(Screening::TIMEZONE)
                    ->format('Y-m-d\TH:i'),
                'base_price' => number_format(
                    $screening->base_price_pence / 100,
                    2,
                    '.',
                    '',
                ),
            ],
            'films' => $this->filmOptions(),
            'screens' => $this->screenOptions(),
            'timezone' => Screening::TIMEZONE,
        ]);
    }

    public function update(
        UpdateScreeningRequest $request,
        Screening $screening,
    ): RedirectResponse {
        Gate::authorize('update', $screening);

        $screening->update([
            'film_id' => $request->integer('film_id'),
            'screen_id' => $request->integer('screen_id'),
            'starts_at' => $request->startsAt(),
            'base_price_pence' => $request->basePricePence(),
        ]);

        return to_route('admin.screenings.index')
            ->with('success', 'Screening updated.');
    }

    public function destroy(Screening $screening): RedirectResponse
    {
        Gate::authorize('delete', $screening);

        $screening->delete();

        return to_route('admin.screenings.index')
            ->with('success', 'Screening removed.');
    }

    /**
     * @return array<int, array{value: int, label: string, runtime: int}>
     */
    private function filmOptions(): array
    {
        return Film::query()
            ->orderBy('title')
            ->get(['id', 'title', 'runtime_minutes'])
            ->map(fn (Film $film): array => [
                'value' => $film->id,
                'label' => $film->title,
                'runtime' => $film->runtime_minutes,
            ])
            ->all();
    }

    /**
     * @return array<int, array{value: int, label: string}>
     */
    private function screenOptions(): array
    {
        return Screen::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Screen $screen): array => [
                'value' => $screen->id,
                'label' => $screen->name,
            ])
            ->all();
    }
}
