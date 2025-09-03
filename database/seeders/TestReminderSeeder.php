<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Modules\BatchIncubator\Models\BatchSchedule;
use App\Modules\BatchIncubator\Models\Batch;
use App\Modules\BatchIncubator\Enums\EventType;

class TestReminderSeeder extends Seeder
{
    public function run()
    {
        // Create a test user if it doesn't exist
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
                'email_verified_at' => now()
            ]
        );

        // Create a test batch if none exists
        $batch = Batch::first();
        if (!$batch) {
            $batch = Batch::create([
                'batch_code' => 'TEST001',
                'name' => 'Test Batch for Reminders',
                'description' => 'A test batch for demonstration',
                'total_eggs' => 100,
                'breed' => 'Test Breed',
                'incubation_start_date' => now(),
                'expected_hatch_date' => now()->addDays(21),
                'created_by' => $user->id,
                'status' => 'active',
            ]);
        }

        // Create a test schedule using batch_schedules table structure
        $schedule = BatchSchedule::create([
            'title' => 'Test Schedule for Reminders',
            'description' => 'A test schedule to demonstrate the reminder system',
            'event_type' => EventType::FEEDING->value,
            'batch_id' => $batch->id,
            'assigned_to' => $user->id,
            'created_by' => $user->id,
            'scheduled_date' => now()->addDays(1),
            'scheduled_time' => '10:00:00',
            'status' => 'pending',
        ]);

        $this->command->info("Created test user: {$user->email}");
        $this->command->info("Created test batch: {$batch->name} (ID: {$batch->id})");
        $this->command->info("Created test schedule: {$schedule->title} (ID: {$schedule->id})");
    }
}
