<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', User::class);

        $search = trim((string) $request->query('search', ''));

        $users = User::query()
            ->when($search !== '', fn ($query) => $query->where(
                fn ($q) => $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%")
            ))
            ->withCount('bookings')
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => ['search' => $search],
            'roles' => $this->roles(),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', User::class);

        return Inertia::render('admin/users/create', [
            'roles' => $this->roles(),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        Gate::authorize('create', User::class);

        $user = new User;

        $user->fill($request->safe()->only(['name', 'email']));
        $user->password = Hash::make($request->validated('password'));

        // Not mass assignable, so set explicitly — and only an admin reaches here.
        $user->forceFill([
            'role' => UserRole::from($request->validated('role')),
            'email_verified_at' => now(),
        ])->save();

        return to_route('admin.users.index')
            ->with('success', "{$user->name} has been added.");
    }

    public function edit(User $user): Response
    {
        Gate::authorize('update', $user);

        return Inertia::render('admin/users/edit', [
            'user' => $user->only(['id', 'name', 'email', 'role']),
            'roles' => $this->roles(),
            'canChangeRole' => Gate::allows('changeRole', $user),
            'canDelete' => Gate::allows('delete', $user),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        Gate::authorize('update', $user);

        $user->fill($request->safe()->only(['name', 'email']));

        if ($request->filled('password')) {
            $user->password = Hash::make($request->validated('password'));
        }

        // Role changes are a separate permission, and never apply to yourself.
        if ($request->filled('role') && Gate::allows('changeRole', $user)) {
            $user->forceFill(['role' => UserRole::from($request->validated('role'))]);
        }

        $user->save();

        return to_route('admin.users.index')
            ->with('success', "{$user->name} has been updated.");
    }

    public function destroy(User $user): RedirectResponse
    {
        Gate::authorize('delete', $user);

        $name = $user->name;

        $user->delete();

        return to_route('admin.users.index')
            ->with('success', "{$name} has been removed.");
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    private function roles(): array
    {
        return collect(UserRole::cases())
            ->map(fn (UserRole $role): array => [
                'value' => $role->value,
                'label' => $role->label(),
            ])
            ->all();
    }
}
