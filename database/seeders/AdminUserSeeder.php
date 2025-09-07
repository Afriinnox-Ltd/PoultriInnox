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
        // Create admin user (or update if exists)
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now()
            ]
        );

        // Create manager user (or update if exists)
        User::updateOrCreate(
            ['email' => 'manager@example.com'],
            [
                'name' => 'Farm Manager',
                'password' => Hash::make('password'),
                'role' => 'manager',
                'email_verified_at' => now()
            ]
        );

        // Create supervisor user (or update if exists)
        User::updateOrCreate(
            ['email' => 'supervisor@example.com'],
            [
                'name' => 'Supervisor John',
                'password' => Hash::make('password'),
                'role' => 'supervisor',
                'email_verified_at' => now()
            ]
        );

        // Create regular users (or update if exists)
        User::updateOrCreate(
            ['email' => 'john@example.com'],
            [
                'name' => 'John Doe',
                'password' => Hash::make('password'),
                'role' => 'user',
                'email_verified_at' => null // Unverified
            ]
        );

        User::updateOrCreate(
            ['email' => 'jane@example.com'],
            [
                'name' => 'Jane Smith',
                'password' => Hash::make('password'),
                'role' => 'user',
                'email_verified_at' => now()
            ]
        );

        User::updateOrCreate(
            ['email' => 'bob@example.com'],
            [
                'name' => 'Bob Wilson',
                'password' => Hash::make('password'),
                'role' => 'user',
                'email_verified_at' => now()
            ]
        );
    }
}
