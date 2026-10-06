<?php

use App\Models\Booking;
use App\Models\Screening;
use App\Models\User;

it('shows the dashboard to an admin', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->get('/admin')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/dashboard'));
});

it('shows the dashboard to staff', function () {
    $this->actingAs(User::factory()->staff()->create())
        ->get('/admin')
        ->assertOk();
});

it('refuses the dashboard to a customer', function () {
    $this->actingAs(User::factory()->create())
        ->get('/admin')
        ->assertForbidden();
});

it('counts only confirmed bookings towards revenue', function () {
    Booking::factory()->confirmed()->create(['total_pence' => 2000]);
    Booking::factory()->create(['total_pence' => 5000]); // held, not confirmed
    Booking::factory()->cancelled()->create(['total_pence' => 9000]);

    $this->actingAs(User::factory()->admin()->create())
        ->get('/admin')
        ->assertInertia(fn ($page) => $page
            ->where('stats.revenue_pence', 2000)
            ->where('stats.bookings', 1)
        );
});

it('reports occupancy for todays screenings', function () {
    $screening = Screening::factory()->create([
        'starts_at' => today()->setTime(20, 0),
    ]);

    $this->actingAs(User::factory()->admin()->create())
        ->get('/admin')
        ->assertInertia(fn ($page) => $page
            ->has('today', 1)
            ->where('today.0.booked', 0)
        );
});

it('leaves out screenings on other days', function () {
    Screening::factory()->create(['starts_at' => today()->addDays(3)->setTime(20, 0)]);

    $this->actingAs(User::factory()->admin()->create())
        ->get('/admin')
        ->assertInertia(fn ($page) => $page->has('today', 0));
});
