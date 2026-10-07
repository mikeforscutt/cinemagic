<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\Film;
use App\Models\Screening;
use App\Models\User;

function filmPayload(array $overrides = []): array
{
    return array_merge([
        'title' => 'The Long Weekend',
        'synopsis' => 'Two strangers share a train carriage and a secret.',
        'runtime_minutes' => 114,
        'certificate' => '15',
        'release_date' => '2026-03-14',
        'director' => 'Ava Mendel',
        'genres' => ['Drama', 'Thriller'],
        'cast_list' => ['Niamh Carter', 'Luis Oyelaran'],
        'poster_path' => 'https://images.unsplash.com/photo-long-weekend',
    ], $overrides);
}

function admin(): User
{
    return User::factory()->create(['role' => UserRole::Admin]);
}

it('lists films for an admin', function (): void {
    Film::factory()->count(3)->create();

    $this->actingAs(admin())
        ->get(route('admin.films.index'))
        ->assertOk();
});

it('denies the film list to a customer', function (): void {
    $this->actingAs(User::factory()->create(['role' => UserRole::Customer]))
        ->get(route('admin.films.index'))
        ->assertForbidden();
});

it('redirects a guest to login', function (): void {
    $this->get(route('admin.films.index'))
        ->assertRedirect(route('login'));
});

it('creates a film and derives the slug from the title', function (): void {
    $this->actingAs(admin())
        ->post(route('admin.films.store'), filmPayload())
        ->assertRedirect(route('admin.films.index'));

    $film = Film::sole();

    expect($film->title)->toBe('The Long Weekend')
        ->and($film->slug)->toBe('the-long-weekend')
        ->and($film->genres)->toBe(['Drama', 'Thriller']);
});

it('rejects a duplicate title', function (): void {
    Film::factory()->create(['title' => 'The Long Weekend', 'slug' => 'the-long-weekend']);

    $this->actingAs(admin())
        ->post(route('admin.films.store'), filmPayload())
        ->assertSessionHasErrors('slug');

    expect(Film::count())->toBe(1);
});

it('rejects an invalid certificate', function (): void {
    $this->actingAs(admin())
        ->post(route('admin.films.store'), filmPayload(['certificate' => 'R']))
        ->assertSessionHasErrors('certificate');
});

it('updates a film', function (): void {
    $film = Film::factory()->create();

    $this->actingAs(admin())
        ->put(route('admin.films.update', $film), filmPayload(['runtime_minutes' => 99]))
        ->assertRedirect(route('admin.films.index'));

    expect($film->refresh()->runtime_minutes)->toBe(99)
        ->and($film->slug)->toBe('the-long-weekend');
});

it('keeps its own slug valid when updating', function (): void {
    $film = Film::factory()->create(['title' => 'The Long Weekend', 'slug' => 'the-long-weekend']);

    $this->actingAs(admin())
        ->put(route('admin.films.update', $film), filmPayload(['director' => 'Someone Else']))
        ->assertSessionHasNoErrors();
});

it('deletes a film with no screenings', function (): void {
    $film = Film::factory()->create();

    $this->actingAs(admin())
        ->delete(route('admin.films.destroy', $film))
        ->assertRedirect(route('admin.films.index'));

    expect(Film::count())->toBe(0);
});

it('refuses to delete a film that has screenings', function (): void {
    $film = Film::factory()->create();
    Screening::factory()->for($film)->create();

    $this->actingAs(admin())
        ->delete(route('admin.films.destroy', $film))
        ->assertForbidden();

    expect(Film::count())->toBe(1);
});
