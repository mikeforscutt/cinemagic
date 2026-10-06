<?php

use App\Enums\UserRole;
use App\Models\User;

it('lists users for an admin', function () {
    $admin = User::factory()->admin()->create(['name' => 'Alice Admin']);
    User::factory()->create(['name' => 'Bob Customer']);

    $this->actingAs($admin)
        ->get('/admin/users')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/users/index')
            ->has('users.data', 2)
        );
});

it('filters users by name or email', function () {
    $admin = User::factory()->admin()->create(['name' => 'Alice Admin']);
    User::factory()->create(['name' => 'Bob Customer', 'email' => 'bob@example.test']);

    $this->actingAs($admin)
        ->get('/admin/users?search=bob')
        ->assertInertia(fn ($page) => $page->has('users.data', 1));
});

it('refuses the user list to a customer', function () {
    $this->actingAs(User::factory()->create())
        ->get('/admin/users')
        ->assertForbidden();
});

it('refuses the user list to staff', function () {
    // Staff reach the admin area but UserPolicy::viewAny is admin only.
    $this->actingAs(User::factory()->staff()->create())
        ->get('/admin/users')
        ->assertForbidden();
});

it('creates a user with the chosen role', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post('/admin/users', [
            'name' => 'New Staffer',
            'email' => 'staffer@example.test',
            'password' => 'password-is-long-enough',
            'role' => UserRole::Staff->value,
        ])
        ->assertRedirect('/admin/users');

    $created = User::where('email', 'staffer@example.test')->first();

    expect($created)->not->toBeNull()
        ->and($created->role)->toBe(UserRole::Staff);
});

it('stops a customer creating users', function () {
    $this->actingAs(User::factory()->create())
        ->post('/admin/users', [
            'name' => 'Sneaky',
            'email' => 'sneaky@example.test',
            'password' => 'password-is-long-enough',
            'role' => UserRole::Admin->value,
        ])
        ->assertForbidden();

    expect(User::where('email', 'sneaky@example.test')->exists())->toBeFalse();
});

it('updates a user without touching their password when it is blank', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create(['name' => 'Old Name']);
    $originalPassword = $user->password;

    $this->actingAs($admin)
        ->put("/admin/users/{$user->id}", [
            'name' => 'New Name',
            'email' => $user->email,
            'password' => '',
            'role' => UserRole::Customer->value,
        ])
        ->assertRedirect('/admin/users');

    $user->refresh();

    expect($user->name)->toBe('New Name')
        ->and($user->password)->toBe($originalPassword);
});

it('changes another user role', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create();

    $this->actingAs($admin)
        ->put("/admin/users/{$user->id}", [
            'name' => $user->name,
            'email' => $user->email,
            'role' => UserRole::Staff->value,
        ]);

    expect($user->refresh()->role)->toBe(UserRole::Staff);
});

it('ignores an attempt to change your own role', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->put("/admin/users/{$admin->id}", [
            'name' => $admin->name,
            'email' => $admin->email,
            'role' => UserRole::Customer->value,
        ]);

    expect($admin->refresh()->role)->toBe(UserRole::Admin);
});

it('deletes another user', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create();

    $this->actingAs($admin)
        ->delete("/admin/users/{$user->id}")
        ->assertRedirect('/admin/users');

    expect(User::find($user->id))->toBeNull();
});

it('refuses to delete your own account from the admin area', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->delete("/admin/users/{$admin->id}")
        ->assertForbidden();

    expect(User::find($admin->id))->not->toBeNull();
});

it('rejects a duplicate email', function () {
    $admin = User::factory()->admin()->create();
    $existing = User::factory()->create();

    $this->actingAs($admin)
        ->post('/admin/users', [
            'name' => 'Clash',
            'email' => $existing->email,
            'password' => 'password-is-long-enough',
            'role' => UserRole::Customer->value,
        ])
        ->assertSessionHasErrors('email');
});

it('lets a user keep their own email when editing', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->put("/admin/users/{$admin->id}", [
            'name' => 'Renamed',
            'email' => $admin->email,
        ])
        ->assertSessionHasNoErrors();
});

it('sends an admin to the admin area after login', function () {
    $admin = User::factory()->admin()->create();

    $this->post('/login', [
        'email' => $admin->email,
        'password' => 'password',
    ])->assertRedirect('/admin/users');
});

it('sends a customer to their bookings after login', function () {
    $customer = User::factory()->create();

    $this->post('/login', [
        'email' => $customer->email,
        'password' => 'password',
    ])->assertRedirect('/bookings');
});
