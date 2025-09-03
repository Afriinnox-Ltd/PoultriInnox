<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Modules\BatchIncubator\Models\Batch;
use App\Modules\BatchIncubator\Models\Incubator;
use App\Models\User;

class BatchIncubatorTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create test users if they don't exist
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
                'email_verified_at' => now()
            ]
        );

        // Create test incubators
        $incubator1 = Incubator::firstOrCreate(
            ['name' => 'Incubator A'],
            [
                'model' => 'IA-1000',
                'capacity' => 1000,
                'status' => 'running',
                'target_temperature' => 37.5,
                'target_humidity' => 62.0,
                'current_temperature' => 37.4,
                'current_humidity' => 61.8,
                'location' => 'Building A - Room 1',
                'owner_id' => $user->id
            ]
        );

        $incubator2 = Incubator::firstOrCreate(
            ['name' => 'Incubator B'],
            [
                'model' => 'IB-2000',
                'capacity' => 2000,
                'status' => 'idle',
                'target_temperature' => 37.5,
                'target_humidity' => 62.0,
                'location' => 'Building A - Room 2',
                'owner_id' => $user->id
            ]
        );

        // Create test batches with incubators
        Batch::firstOrCreate(
            ['batch_code' => 'BT001'],
            [
                'name' => 'Batch with Incubator A',
                'breed' => 'Rhode Island Red',
                'initial_count' => 500,
                'current_count' => 500,
                'incubator_id' => $incubator1->id,
                'status' => 'incubating',
                'start_date' => now()->subDays(5),
                'hatch_date' => now()->addDays(16),
                'manager_id' => $user->id
            ]
        );

        Batch::firstOrCreate(
            ['batch_code' => 'BT002'],
            [
                'name' => 'Batch with Incubator B',
                'breed' => 'Leghorn',
                'initial_count' => 800,
                'current_count' => 800,
                'incubator_id' => $incubator2->id,
                'status' => 'incubating',
                'start_date' => now()->subDays(3),
                'hatch_date' => now()->addDays(18),
                'manager_id' => $user->id
            ]
        );

        Batch::firstOrCreate(
            ['batch_code' => 'BT003'],
            [
                'name' => 'Batch without Incubator',
                'breed' => 'Sussex',
                'initial_count' => 300,
                'current_count' => 300,
                'incubator_id' => null,
                'status' => 'planned',
                'start_date' => now(),
                'hatch_date' => null,
                'manager_id' => $user->id
            ]
        );

        $this->command->info('BatchIncubator test data created successfully!');
        $this->command->info('- Created 2 incubators');
        $this->command->info('- Created 3 batches (2 with incubators, 1 without)');
        $this->command->info('- Test user: test@example.com / password');
    }
}
