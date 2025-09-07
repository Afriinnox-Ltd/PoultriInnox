<?php

namespace Database\Seeders;

use App\Models\User;
use Database\Seeders\Modules\BatchIncubator\BatchIncubatorModuleSeeder;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create test users first (only if they don't exist)
        User::firstOrCreate(
            ['email' => 'manager@poultriinnox.com'],
            [
                'name' => 'Farm Manager',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'worker@poultriinnox.com'],
            [
                'name' => 'Farm Worker',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'supervisor@poultriinnox.com'],
            [
                'name' => 'Farm Supervisor',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('✅ Users created/verified');

        // Seed modules first
        $this->call([
            ModuleSeeder::class,
        ]);

        $this->command->info('✅ Modules seeded');

        // Seed BatchIncubator module in proper order
        $this->call([
            AdminUserSeeder::class,
            ModuleSeeder::class,
            MarketplaceSeeder::class,

            IncubatorSeeder::class,
            BatchSeeder::class,
            BatchEventSeeder::class,
            BatchScheduleSeeder::class,
            // SmartSchedulingSeeder::class,
        ]);
    }
}
