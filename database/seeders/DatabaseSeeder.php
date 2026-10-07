<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->demoUser('demo@cinemagic.test', 'Demo User', UserRole::Customer);
        $this->demoUser('admin@cinemagic.test', 'Admin User', UserRole::Admin);
        $this->demoUser('staff@cinemagic.test', 'Staff User', UserRole::Staff);

        $this->call([
            ScreenSeeder::class,
            FilmSeeder::class,
            ScreeningSeeder::class,
        ]);
    }

    /**
     * Accounts for trying the app out. Role and verification are set with
     * forceFill because neither is mass assignable — role deliberately so,
     * since it would otherwise be settable from a registration request.
     */
    private function demoUser(string $email, string $name, UserRole $role): User
    {
        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make('password'),
            ],
        );

        $user->forceFill([
            'role' => $role,
            'email_verified_at' => now(),
        ])->save();

        return $user;
    }
}
