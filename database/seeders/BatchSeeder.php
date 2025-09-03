<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Modules\BatchIncubator\Models\Batch;
use App\Modules\BatchIncubator\Models\Incubator;
use App\Modules\BatchIncubator\Enums\BatchStatus;
use App\Models\User;

class BatchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get users and incubators
        $manager = User::where('email', 'manager@poultriinnox.com')->first();
        $incubators = Incubator::all();

        if (!$manager) {
            $this->command->error('Farm manager user not found. Please ensure users are seeded first.');
            return;
        }

        if ($incubators->isEmpty()) {
            $this->command->error('No incubators found. Please run IncubatorSeeder first.');
            return;
        }

        // Check if batches already exist
        if (Batch::count() > 0) {
            $this->command->info('Batches already exist. Skipping batch seeding.');
            return;
        }

        $batches = [
            [
                'batch_code' => 'BTH-20240901-A001',
                'name' => 'Broiler Batch Alpha',
                'description' => 'High-performance broiler chickens for meat production',
                'breed' => 'Ross 308',
                'initial_count' => 950,
                'current_count' => 920,
                'initial_weight' => 47500.0,
                'current_weight' => 184000.0,
                'status' => BatchStatus::GROWING,
                'hatch_date' => now()->subDays(28),
                'start_date' => now()->subDays(49),
                'expected_completion_date' => now()->addDays(14),
                'incubator_id' => $incubators->where('name', 'Incubator A1')->first()?->id,
                'incubator_assigned_at' => now()->subDays(49),
                'avg_temperature' => 37.7,
                'avg_humidity' => 61.5,
                'mortality_count' => 30,
                'mortality_rate' => 3.16,
                'cull_count' => 5,
                'initial_cost' => 2850.0,
                'feed_cost' => 1420.0,
                'medication_cost' => 285.0,
                'other_costs' => 190.0,
                'revenue' => 0,
                'manager_id' => $manager->id,
            ],
            [
                'batch_code' => 'BTH-20240815-L002',
                'name' => 'Layer Batch Beta',
                'description' => 'High-production layer hens for egg laying',
                'breed' => 'Lohmann Brown',
                'initial_count' => 600,
                'current_count' => 590,
                'initial_weight' => 30000.0,
                'current_weight' => 944000.0,
                'status' => BatchStatus::LAYING,
                'hatch_date' => now()->subDays(140),
                'start_date' => now()->subDays(161),
                'expected_completion_date' => now()->addDays(225),
                'incubator_id' => null,
                'incubator_assigned_at' => now()->subDays(161),
                'avg_temperature' => 37.8,
                'avg_humidity' => 62.0,
                'mortality_count' => 10,
                'mortality_rate' => 1.67,
                'cull_count' => 3,
                'total_eggs_produced' => 35400,
                'avg_daily_production' => 506,
                'initial_cost' => 3600.0,
                'feed_cost' => 4720.0,
                'medication_cost' => 360.0,
                'other_costs' => 590.0,
                'revenue' => 10620.0,
                'batch_data' => [
                    'genetics' => 'Lohmann Brown Classic',
                    'peak_production_age' => '24-32 weeks',
                    'expected_production_rate' => '92%',
                ],
                'performance_metrics' => [
                    'survival_rate' => 98.33,
                    'current_production_rate' => 86.0,
                    'egg_weight_avg' => 62.5, // grams
                ],
                'manager_id' => $manager->id,
            ],
            [
                'batch_code' => 'BTH-20240920-I003',
                'name' => 'Incubation Batch Gamma',
                'description' => 'Fresh batch currently in incubation',
                'breed' => 'Cobb 500',
                'initial_count' => 450,
                'current_count' => 450,
                'initial_weight' => 22500.0, // 50g per egg
                'current_weight' => 22500.0, // Still in eggs
                'status' => BatchStatus::INCUBATING,
                'hatch_date' => now()->addDays(8), // Expected hatch in 8 days
                'start_date' => now()->subDays(13), // Started 13 days ago
                'expected_completion_date' => now()->addDays(50), // 6 weeks after hatch
                'incubator_id' => $incubators->where('name', 'Incubator D4')->first()?->id,
                'incubator_assigned_at' => now()->subDays(13),
                'avg_temperature' => 37.5,
                'avg_humidity' => 61.0,
                'mortality_count' => 0,
                'mortality_rate' => 0,
                'cull_count' => 0,
                'total_eggs_produced' => 0,
                'avg_daily_production' => 0,
                'initial_cost' => 1350.0, // $3 per egg
                'feed_cost' => 0, // No feed yet
                'medication_cost' => 0,
                'other_costs' => 45.0, // Incubation costs
                'revenue' => 0,
                'batch_data' => [
                    'genetics' => 'Cobb 500 Standard',
                    'expected_hatch_rate' => '92%',
                    'incubation_period' => 21,
                ],
                'performance_metrics' => [
                    'incubation_day' => 13,
                    'expected_hatch_weight' => 40, // grams
                    'fertility_rate' => 95.0,
                ],
                'manager_id' => $manager->id,
            ],
            [
                'batch_code' => 'BTH-20240905-P004',
                'name' => 'Planning Batch Delta',
                'description' => 'Batch in planning stage for next month',
                'breed' => 'Heritage Rhode Island Red',
                'initial_count' => 300,
                'current_count' => 300,
                'initial_weight' => null,
                'current_weight' => null,
                'status' => BatchStatus::PLANNED,
                'hatch_date' => now()->addDays(35),
                'start_date' => now()->addDays(14), // Start in 2 weeks
                'expected_completion_date' => now()->addDays(105), // 15 weeks total
                'incubator_id' => null, // Not assigned yet
                'incubator_assigned_at' => null,
                'avg_temperature' => null,
                'avg_humidity' => null,
                'mortality_count' => 0,
                'mortality_rate' => 0,
                'cull_count' => 0,
                'total_eggs_produced' => 0,
                'avg_daily_production' => 0,
                'initial_cost' => 1500.0, // $5 per heritage breed egg
                'feed_cost' => 0,
                'medication_cost' => 0,
                'other_costs' => 0,
                'revenue' => 0,
                'batch_data' => [
                    'genetics' => 'Heritage Rhode Island Red',
                    'purpose' => 'Dual-purpose (meat and eggs)',
                    'special_requirements' => 'Organic feed only',
                ],
                'performance_metrics' => [
                    'planning_stage' => 'Feed procurement',
                    'expected_survival_rate' => 94.0,
                ],
                'manager_id' => $manager->id,
            ],
        ];

        foreach ($batches as $batchData) {
            Batch::create($batchData);
        }

        $this->command->info('✅ 4 Batches seeded successfully!');
        $this->command->info('   → 1 Growing (920 broilers, 4 weeks old)');
        $this->command->info('   → 1 Laying (590 layers, producing 506 eggs/day)');
        $this->command->info('   → 1 Incubating (450 eggs, 8 days to hatch)');
        $this->command->info('   → 1 Planned (300 heritage breed, starts in 2 weeks)');
    }
}
