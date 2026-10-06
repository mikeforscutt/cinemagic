<?php

use App\Models\Film;
use App\Models\Screening;

it('shows films that have an upcoming screening', function () {
    $screening = Screening::factory()->create([
        'starts_at' => now()->addDay(),
    ]);

    Film::factory()->create(); // no screenings, so shouldn't appear

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('home')
            ->has('nowShowing', 1)
            ->where('featured.id', $screening->film_id)
        );
});
