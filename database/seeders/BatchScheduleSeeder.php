<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Modules\BatchIncubator\Models\BatchSchedule;
use App\Modules\BatchIncubator\Models\Batch;
use App\Modules\BatchIncubator\Enums\EventType;
use App\Modules\BatchIncubator\Enums\ScheduleStatus;
use App\Models\User;

class BatchScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get users and batches
        $manager = User::where('email', 'manager@poultriinnox.com')->first();
        $supervisor = User::where('email', 'supervisor@poultriinnox.com')->first();
        $batches = Batch::all();

        if (!$manager || !$supervisor) {
            $this->command->error('Required users not found. Please ensure users are seeded first.');
            return;
        }

        if ($batches->isEmpty()) {
            $this->command->error('No batches found. Please run BatchSeeder first.');
            return;
        }

        // Check if schedules already exist
        if (BatchSchedule::count() > 0) {
            $this->command->info('Batch schedules already exist. Skipping schedule seeding.');
            return;
        }

        $broilerBatch = $batches->where('batch_code', 'BTH-20240901-A001')->first();
        $layerBatch = $batches->where('batch_code', 'BTH-20240815-L002')->first();
        $incubatingBatch = $batches->where('batch_code', 'BTH-20240920-I003')->first();
        $plannedBatch = $batches->where('batch_code', 'BTH-20240905-P004')->first();

        $schedules = [];

        // Schedules for Broiler Batch (Growing - already started)
        if ($broilerBatch) {
            $schedules = array_merge($schedules, [
                // Feeding schedules
                [
                    'batch_id' => $broilerBatch->id,
                    'event_type' => EventType::FEEDING,
                    'title' => 'Daily Feed Distribution - Morning',
                    'description' => 'Distribute grower feed for optimal weight gain',
                    'scheduled_date' => now()->addHours(8)->startOfHour(), // Tomorrow 8 AM
                    'assigned_to' => $supervisor->id,
                    'status' => ScheduleStatus::PENDING,
                    'priority' => 2, // high priority
                    'estimated_duration' => 45, // minutes
                    'requirements' => [
                        'feed_type' => 'Grower Pellets',
                        'quantity_kg' => 85,
                        'equipment' => ['Feed spreader', 'Scale'],
                    ],
                    'notes' => 'Distribute feed evenly across all feeders. Check water availability.',
                    'created_by' => $manager->id,
                ],
                [
                    'batch_id' => $broilerBatch->id,
                    'event_type' => EventType::FEEDING,
                    'title' => 'Daily Feed Distribution - Evening',
                    'description' => 'Evening feed distribution to maintain growth rate',
                    'scheduled_date' => now()->addHours(18)->startOfHour(), // Tomorrow 6 PM
                    'assigned_to' => $supervisor->id,
                    'status' => ScheduleStatus::PENDING,
                    'priority' => 2,
                    'estimated_duration' => 40,
                    'requirements' => [
                        'feed_type' => 'Grower Pellets',
                        'quantity_kg' => 70,
                        'equipment' => ['Feed spreader'],
                    ],
                    'notes' => 'Check feed consumption from morning. Adjust quantity if needed.',
                    'created_by' => $manager->id,
                ],
                // Health check schedule
                [
                    'batch_id' => $broilerBatch->id,
                    'event_type' => EventType::HEALTH_CHECK,
                    'title' => 'Weekly Health Inspection',
                    'description' => 'Comprehensive health assessment and weight sampling',
                    'scheduled_date' => now()->addDays(3)->setTime(10, 0), // 3 days from now at 10 AM
                    'assigned_to' => $manager->id,
                    'status' => ScheduleStatus::PENDING,
                    'priority' => 2,
                    'estimated_duration' => 120,
                    'requirements' => [
                        'equipment' => ['Digital scale', 'Sampling crates', 'Health record sheets'],
                        'sample_size' => 50,
                    ],
                    'notes' => 'Weigh random sample of 50 birds. Check for signs of disease, leg problems, or respiratory issues.',
                    'created_by' => $manager->id,
                ],
                // Upcoming vaccination
                [
                    'batch_id' => $broilerBatch->id,
                    'event_type' => EventType::VACCINATION,
                    'title' => 'Newcastle Booster Vaccination',
                    'description' => 'Second Newcastle disease vaccination via drinking water',
                    'scheduled_date' => now()->addDays(7)->setTime(9, 0), // 1 week from now
                    'assigned_to' => $manager->id,
                    'status' => ScheduleStatus::PENDING,
                    'priority' => 1, // critical
                    'estimated_duration' => 90,
                    'requirements' => [
                        'vaccine' => 'Newcastle B1 Strain Booster',
                        'dosage' => '1 dose per bird',
                        'water_restriction' => '2 hours before vaccination',
                    ],
                    'notes' => 'Restrict water 2 hours before. Ensure all birds have access to medicated water.',
                    'created_by' => $manager->id,
                ],
                // Cleaning schedule
                [
                    'batch_id' => $broilerBatch->id,
                    'event_type' => EventType::CLEANING,
                    'title' => 'Pen Area Cleaning',
                    'description' => 'Deep cleaning of brooding area and equipment',
                    'scheduled_date' => now()->addDays(2)->setTime(14, 0), // 2 days from now at 2 PM
                    'assigned_to' => $supervisor->id,
                    'status' => ScheduleStatus::PENDING,
                    'priority' => 3, // medium
                    'estimated_duration' => 180,
                    'requirements' => [
                        'equipment' => ['Pressure washer', 'Disinfectant', 'Fresh bedding'],
                        'disinfectant' => 'Quaternary ammonium compound',
                    ],
                    'notes' => 'Remove old bedding, pressure wash, disinfect, and add fresh bedding.',
                    'created_by' => $manager->id,
                ],
            ]);
        }

        // Schedules for Layer Batch (Currently laying)
        if ($layerBatch) {
            $schedules = array_merge($schedules, [
                [
                    'batch_id' => $layerBatch->id,
                    'event_type' => EventType::FEEDING,
                    'title' => 'Layer Feed Distribution',
                    'description' => 'Daily high-calcium layer feed for optimal egg production',
                    'scheduled_date' => now()->addHours(7)->startOfHour(), // Tomorrow 7 AM
                    'assigned_to' => $supervisor->id,
                    'status' => ScheduleStatus::PENDING,
                    'priority' => 2,
                    'estimated_duration' => 60,
                    'requirements' => [
                        'feed_type' => 'Layer Pellets Premium',
                        'quantity_kg' => 70,
                        'calcium_supplement' => 'Oyster shell',
                    ],
                    'notes' => 'Check egg collection before feeding. Ensure calcium supplement is available.',
                    'created_by' => $manager->id,
                ],
                [
                    'batch_id' => $layerBatch->id,
                    'event_type' => EventType::OBSERVATION,
                    'title' => 'Egg Collection and Quality Check',
                    'description' => 'Collect eggs and assess shell quality and internal condition',
                    'scheduled_date' => now()->addHours(16)->startOfHour(), // Tomorrow 4 PM
                    'assigned_to' => $supervisor->id,
                    'status' => ScheduleStatus::PENDING,
                    'priority' => 2,
                    'estimated_duration' => 90,
                    'requirements' => [
                        'equipment' => ['Egg collection baskets', 'Candling light', 'Quality assessment sheets'],
                    ],
                    'notes' => 'Collect all eggs, candle for quality, record any abnormalities.',
                    'created_by' => $manager->id,
                ],
                [
                    'batch_id' => $layerBatch->id,
                    'event_type' => EventType::HEALTH_CHECK,
                    'title' => 'Reproductive Health Assessment',
                    'description' => 'Check for prolapse, egg binding, and general reproductive health',
                    'scheduled_date' => now()->addDays(5)->setTime(11, 0),
                    'assigned_to' => $manager->id,
                    'status' => ScheduleStatus::PENDING,
                    'priority' => 2,
                    'estimated_duration' => 150,
                    'requirements' => [
                        'equipment' => ['Examination gloves', 'Lubricant', 'Health record sheets'],
                        'sample_size' => 30,
                    ],
                    'notes' => 'Focus on reproductive tract examination. Check for any prolapse cases.',
                    'created_by' => $manager->id,
                ],
            ]);
        }

        // Schedules for Incubating Batch
        if ($incubatingBatch) {
            $schedules = array_merge($schedules, [
                [
                    'batch_id' => $incubatingBatch->id,
                    'event_type' => EventType::OBSERVATION,
                    'title' => 'Day 18 Final Candling',
                    'description' => 'Final candling before moving to hatcher',
                    'scheduled_date' => $incubatingBatch->hatch_date->subDays(3)->setTime(10, 0),
                    'assigned_to' => $manager->id,
                    'status' => ScheduleStatus::PENDING,
                    'priority' => 1, // critical
                    'estimated_duration' => 120,
                    'requirements' => [
                        'equipment' => ['High-intensity candling light', 'Hatcher trays'],
                        'transfer_preparation' => true,
                    ],
                    'notes' => 'Remove clear eggs, prepare viable eggs for transfer to hatcher.',
                    'created_by' => $manager->id,
                ],
                [
                    'batch_id' => $incubatingBatch->id,
                    'event_type' => EventType::TRANSFER,
                    'title' => 'Transfer to Hatcher',
                    'description' => 'Move eggs from incubator to hatcher for final 3 days',
                    'scheduled_date' => $incubatingBatch->hatch_date->subDays(3)->setTime(14, 0),
                    'assigned_to' => $supervisor->id,
                    'status' => ScheduleStatus::PENDING,
                    'priority' => 1,
                    'estimated_duration' => 90,
                    'requirements' => [
                        'hatcher_settings' => [
                            'temperature' => 37.2,
                            'humidity' => 65.0,
                        ],
                        'equipment' => ['Hatcher trays', 'Chick boxes'],
                    ],
                    'notes' => 'Carefully transfer eggs. Set hatcher to appropriate temperature and humidity.',
                    'created_by' => $manager->id,
                ],
                [
                    'batch_id' => $incubatingBatch->id,
                    'event_type' => EventType::OBSERVATION,
                    'title' => 'Hatch Day Monitoring',
                    'description' => 'Monitor hatching process and remove healthy chicks',
                    'scheduled_date' => $incubatingBatch->hatch_date->setTime(8, 0),
                    'assigned_to' => $manager->id,
                    'status' => ScheduleStatus::PENDING,
                    'priority' => 1,
                    'estimated_duration' => 480, // 8 hours
                    'requirements' => [
                        'equipment' => ['Chick processing area', 'Brooding setup', 'Vaccination supplies'],
                        'immediate_care' => 'Water, starter feed, heat lamps',
                    ],
                    'notes' => 'Monitor throughout the day. Remove dry chicks every 4-6 hours.',
                    'created_by' => $manager->id,
                ],
            ]);
        }

        // Schedules for Planned Batch (Future activities)
        if ($plannedBatch) {
            $schedules = array_merge($schedules, [
                [
                    'batch_id' => $plannedBatch->id,
                    'event_type' => EventType::CLEANING,
                    'title' => 'Incubator Preparation',
                    'description' => 'Deep clean and prepare incubator for new batch',
                    'scheduled_date' => $plannedBatch->start_date->subDays(3)->setTime(9, 0),
                    'assigned_to' => $supervisor->id,
                    'status' => ScheduleStatus::PENDING,
                    'priority' => 2,
                    'estimated_duration' => 240,
                    'requirements' => [
                        'cleaning_supplies' => ['Disinfectant', 'Calibration tools'],
                        'incubator' => 'Reserve Incubator C3',
                    ],
                    'notes' => 'Deep clean, calibrate sensors, test all systems before egg placement.',
                    'created_by' => $manager->id,
                ],
                [
                    'batch_id' => $plannedBatch->id,
                    'event_type' => EventType::OBSERVATION,
                    'title' => 'Organic Feed Procurement',
                    'description' => 'Source and inspect organic feed for heritage breed requirements',
                    'scheduled_date' => $plannedBatch->start_date->subDays(7)->setTime(10, 0),
                    'assigned_to' => $manager->id,
                    'status' => ScheduleStatus::PENDING,
                    'priority' => 3,
                    'estimated_duration' => 180,
                    'requirements' => [
                        'feed_specs' => 'Certified organic, heritage breed appropriate',
                        'quantity' => '500kg starter, 1000kg grower',
                    ],
                    'notes' => 'Verify organic certification. Check protein content and quality.',
                    'created_by' => $manager->id,
                ],
            ]);
        }

        foreach ($schedules as $scheduleData) {
            BatchSchedule::create($scheduleData);
        }

        $this->command->info('✅ ' . count($schedules) . ' Batch schedules seeded successfully!');
        $this->command->info('   → Daily feeding schedules for active batches');
        $this->command->info('   → Health checks and vaccinations');
        $this->command->info('   → Critical incubation milestones');
        $this->command->info('   → Cleaning and maintenance tasks');
        $this->command->info('   → Future planning activities');
    }
}
