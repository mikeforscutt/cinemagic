<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\Booking;
use App\Models\Film;
use App\Models\Screen;
use App\Models\Screening;
use App\Models\User;

it('lists screenings for an admin', function (): void {
    Screening::factory()->count(3)->create();

    $this->actingAs(User::factory()->create(['role' => UserRole::Admin]))
        ->get(route('admin.screenings.index'))
        ->assertOk();
});

it('refuses the schedule to a customer', function (): void {
    $this->actingAs(User::factory()->create(['role' => UserRole::Customer]))
        ->get(route('admin.screenings.index'))
        ->assertForbidden();
});

it('stops staff scheduling a screening', function (): void {
    $film = Film::factory()->create();
    $screen = Screen::factory()->create();

    $this->actingAs(User::factory()->create(['role' => UserRole::Staff]))
        ->post(route('admin.screenings.store'), [
            'film_id' => $film->id,
            'screen_id' => $screen->id,
            'starts_at' => '2026-07-15T19:30',
            'base_price' => '9.50',
        ])
        ->assertForbidden();
});

it('reads the entered time as London time and stores it as UTC', function (): void {
    $film = Film::factory()->create(['runtime_minutes' => 120]);
    $screen = Screen::factory()->create();

    $this->actingAs(User::factory()->create(['role' => UserRole::Admin]))
        ->post(route('admin.screenings.store'), [
            'film_id' => $film->id,
            'screen_id' => $screen->id,
            'starts_at' => '2026-07-15T19:30',
            'base_price' => '9.50',
        ])
        ->assertRedirect(route('admin.screenings.index'));

    $screening = Screening::sole();

    // July is BST, so 19:30 local is 18:30 UTC.
    expect($screening->starts_at->utc()->format('Y-m-d H:i'))
        ->toBe('2026-07-15 18:30')
        ->and($screening->base_price_pence)->toBe(950);
});

it('keeps winter times unshifted', function (): void {
    $film = Film::factory()->create(['runtime_minutes' => 120]);
    $screen = Screen::factory()->create();

    $this->actingAs(User::factory()->create(['role' => UserRole::Admin]))
        ->post(route('admin.screenings.store'), [
            'film_id' => $film->id,
            'screen_id' => $screen->id,
            'starts_at' => '2026-01-15T19:30',
            'base_price' => '9.50',
        ]);

    // January is GMT, so local and UTC agree.
    expect(Screening::sole()->starts_at->utc()->format('Y-m-d H:i'))
        ->toBe('2026-01-15 19:30');
});

it('refuses a screening that overlaps another in the same screen', function (): void {
    $screen = Screen::factory()->create();
    $existing = Film::factory()->create(['runtime_minutes' => 120]);

    Screening::factory()->create([
        'screen_id' => $screen->id,
        'film_id' => $existing->id,
        'starts_at' => '2026-07-15 18:00:00',
    ]);

    $this->actingAs(User::factory()->create(['role' => UserRole::Admin]))
        ->post(route('admin.screenings.store'), [
            'film_id' => Film::factory()->create(['runtime_minutes' => 90])->id,
            'screen_id' => $screen->id,
            // 20:30 BST is 19:30 UTC, inside the 18:00–20:15 window.
            'starts_at' => '2026-07-15T20:30',
            'base_price' => '9.50',
        ])
        ->assertSessionHasErrors('starts_at');

    expect(Screening::count())->toBe(1);
});

it('allows the same time in a different screen', function (): void {
    $film = Film::factory()->create(['runtime_minutes' => 120]);

    Screening::factory()->create([
        'screen_id' => Screen::factory()->create()->id,
        'film_id' => $film->id,
        'starts_at' => '2026-07-15 18:00:00',
    ]);

    $this->actingAs(User::factory()->create(['role' => UserRole::Admin]))
        ->post(route('admin.screenings.store'), [
            'film_id' => $film->id,
            'screen_id' => Screen::factory()->create()->id,
            'starts_at' => '2026-07-15T19:00',
            'base_price' => '9.50',
        ])
        ->assertSessionHasNoErrors();

    expect(Screening::count())->toBe(2);
});

it('allows a screening starting after the turnaround gap', function (): void {
    $screen = Screen::factory()->create();
    $film = Film::factory()->create(['runtime_minutes' => 120]);

    Screening::factory()->create([
        'screen_id' => $screen->id,
        'film_id' => $film->id,
        'starts_at' => '2026-07-15 17:00:00',
    ]);

    $this->actingAs(User::factory()->create(['role' => UserRole::Admin]))
        ->post(route('admin.screenings.store'), [
            'film_id' => $film->id,
            'screen_id' => $screen->id,
            // Previous film ends 19:00 UTC, turnaround to 19:15.
            // 20:15 BST is 19:15 UTC, so this is the earliest legal slot.
            'starts_at' => '2026-07-15T20:15',
            'base_price' => '9.50',
        ])
        ->assertSessionHasNoErrors();

    expect(Screening::count())->toBe(2);
});

it('refuses to edit a screening that has bookings', function (): void {
    $screening = Screening::factory()->create();
    Booking::factory()->for($screening)->create();

    $this->actingAs(User::factory()->create(['role' => UserRole::Admin]))
        ->get(route('admin.screenings.edit', $screening))
        ->assertForbidden();
});

it('refuses to delete a screening that has bookings', function (): void {
    $screening = Screening::factory()->create();
    Booking::factory()->for($screening)->create();

    $this->actingAs(User::factory()->create(['role' => UserRole::Admin]))
        ->delete(route('admin.screenings.destroy', $screening))
        ->assertForbidden();

    expect(Screening::count())->toBe(1);
});

it('deletes a screening with no bookings', function (): void {
    $screening = Screening::factory()->create();

    $this->actingAs(User::factory()->create(['role' => UserRole::Admin]))
        ->delete(route('admin.screenings.destroy', $screening))
        ->assertRedirect(route('admin.screenings.index'));

    expect(Screening::count())->toBe(0);
});
