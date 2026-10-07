<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\FilmCertificate;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreFilmRequest;
use App\Http\Requests\Admin\UpdateFilmRequest;
use App\Models\Film;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

final class FilmController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('viewAny', Film::class);

        $films = Film::query()
            ->withCount('screenings')
            ->orderByDesc('created_at')
            ->paginate(15)
            ->through(fn (Film $film): array => [
                'id' => $film->id,
                'title' => $film->title,
                'slug' => $film->slug,
                'certificate' => $film->certificate->value,
                'runtime_minutes' => $film->runtime_minutes,
                'release_date' => $film->release_date?->toDateString(),
                'screenings_count' => $film->screenings_count,
                'poster_path' => $film->poster_path,
            ]);

        return Inertia::render('admin/films/index', [
            'films' => $films,
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Film::class);

        return Inertia::render('admin/films/create', [
            'certificates' => FilmCertificate::options(),
        ]);
    }

    public function store(StoreFilmRequest $request): RedirectResponse
    {
        Gate::authorize('create', Film::class);

        Film::create($request->validated());

        return to_route('admin.films.index')
            ->with('success', 'Film created.');
    }

    public function edit(Film $film): Response
    {
        Gate::authorize('update', $film);

        return Inertia::render('admin/films/edit', [
            'film' => [
                'id' => $film->id,
                'title' => $film->title,
                'synopsis' => $film->synopsis,
                'runtime_minutes' => $film->runtime_minutes,
                'certificate' => $film->certificate->value,
                'release_date' => $film->release_date?->toDateString(),
                'director' => $film->director,
                'genres' => $film->genres,
                'cast_list' => $film->cast_list,
                'poster_path' => $film->poster_path,
            ],
            'certificates' => FilmCertificate::options(),
            'screeningsCount' => $film->screenings()->count(),
        ]);
    }

    public function update(UpdateFilmRequest $request, Film $film): RedirectResponse
    {
        Gate::authorize('update', $film);

        $film->update($request->validated());

        return to_route('admin.films.index')
            ->with('success', 'Film updated.');
    }

    public function destroy(Film $film): RedirectResponse
    {
        Gate::authorize('delete', $film);

        $film->delete();

        return to_route('admin.films.index')
            ->with('success', 'Film deleted.');
    }
}
