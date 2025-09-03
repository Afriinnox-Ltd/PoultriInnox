<?php

namespace Database\Seeders\Modules\BatchIncubator;

use Illuminate\Database\Seeder;

class BatchIncubatorModuleSeeder extends Seeder
{
    /**
     * Run the database seeds for the Batch & Incubator Management Module.
     */
    public function run(): void
    {
        $this->command->info('🚀 Seeding Batch & Incubator Management Module...');

        // Seed in order of dependencies
        $this->call([
            IncubatorSeeder::class,
            BatchSeeder::class,
            BatchEventSeeder::class,
            BatchScheduleSeeder::class,
        ]);

        $this->command->info('✅ Batch & Incubator Management Module seeded successfully!');
        $this->command->info('');
        $this->command->info('📊 Summary:');
        $this->command->info('- 4 Incubators created with different statuses and capacities');
        $this->command->info('- 4 Batches created across different lifecycle stages');
        $this->command->info('- Multiple events logged for feeding, health checks, vaccinations');
        $this->command->info('- Schedules created for upcoming tasks and recurring activities');
        $this->command->info('');
        $this->command->info('🎯 Ready for use! You can now manage:');
        $this->command->info('  → Incubator operations and monitoring');
        $this->command->info('  → Batch lifecycle tracking');
        $this->command->info('  → Event logging and history');
        $this->command->info('  → Task scheduling and reminders');
    }
}
