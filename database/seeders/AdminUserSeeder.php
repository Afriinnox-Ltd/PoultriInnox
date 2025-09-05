<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now()
        ]);

        // Create manager user
        User::create([
            'name' => 'Farm Manager',
            'email' => 'manager@example.com',
            'password' => Hash::make('password'),
            'role' => 'manager',
            'email_verified_at' => now()
        ]);

        // Create supervisor user
        User::create([
            'name' => 'Supervisor John',
            'email' => 'supervisor@example.com',
            'password' => Hash::make('password'),
            'role' => 'supervisor',
            'email_verified_at' => now()
        ]);

        // Create regular users
        User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'email_verified_at' => null // Unverified
        ]);

        User::create([
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'email_verified_at' => now()
        ]);

        User::create([
            'name' => 'Bob Wilson',
            'email' => 'bob@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'email_verified_at' => now()
        ]);
    }
}
