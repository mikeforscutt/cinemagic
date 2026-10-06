<?php

use App\Enums\UserRole;
use App\Models\Booking;
use App\Models\Film;
use App\Models\Screening;
use App\Models\User;
use Illuminate\Support\Facades\Route;

beforeEach(function () {
    Route::middleware(['auth', 'admin'])->get('/admin-area-test', fn () => 'ok');
});

it('lets an admin through to the admin area', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->get('/admin-area-test')
        ->assertOk();
});

it('lets staff through to the admin area', function () {
    $this->actingAs(User::factory()->staff()->create())
        ->get('/admin-area-test')
        ->assertOk();
});

it('blocks customers from the admin area', function () {
    $this->actingAs(User::factory()->create())
        ->get('/admin-area-test')
        ->assertForbidden();
});

it('blocks guests from the admin area', function () {
    $this->get('/admin-area-test')->assertRedirect('/login');
});

it('defaults new users to the customer role', function () {
    expect(User::factory()->create()->role)->toBe(UserRole::Customer);
});

it('only lets admins manage films', function () {
    $film = Film::factory()->create();

    expect(User::factory()->admin()->create()->can('update', $film))->toBeTrue()
        ->and(User::factory()->staff()->create()->can('update', $film))->toBeFalse()
        ->and(User::factory()->create()->can('update', $film))->toBeFalse();
});

it('refuses to delete a film that has screenings', function () {
    $admin = User::factory()->admin()->create();
    $withScreenings = Screening::factory()->create()->film;
    $withoutScreenings = Film::factory()->create();

    expect($admin->can('delete', $withScreenings))->toBeFalse()
        ->and($admin->can('delete', $withoutScreenings))->toBeTrue();
});

it('refuses to change a screening that has bookings', function () {
    $admin = User::factory()->admin()->create();
    $booked = Booking::factory()->create()->screening;
    $unbooked = Screening::factory()->create();

    expect($admin->can('update', $booked))->toBeFalse()
        ->and($admin->can('update', $unbooked))->toBeTrue();
});

it('stops an admin deleting their own account from the admin area', function () {
    $admin = User::factory()->admin()->create();
    $other = User::factory()->create();

    expect($admin->can('delete', $admin))->toBeFalse()
        ->and($admin->can('delete', $other))->toBeTrue();
});

it('stops an admin changing their own role', function () {
    $admin = User::factory()->admin()->create();

    expect($admin->can('changeRole', $admin))->toBeFalse();
});

it('lets a user view and edit themselves but not others', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();

    expect($user->can('view', $user))->toBeTrue()
        ->and($user->can('update', $user))->toBeTrue()
        ->and($user->can('view', $other))->toBeFalse()
        ->and($user->can('update', $other))->toBeFalse();
});
