<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Modules\BatchIncubator\Models\BatchEvent;
use App\Modules\BatchIncubator\Models\Batch;
use App\Modules\BatchIncubator\Enums\EventType;
use App\Models\User;

class BatchEventSeeder extends Seeder
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

        // Check if events already exist
        if (BatchEvent::count() > 0) {
            $this->command->info('Batch events already exist. Skipping event seeding.');
            return;
        }

        $broilerBatch = $batches->where('batch_code', 'BTH-20240901-A001')->first();
        $layerBatch = $batches->where('batch_code', 'BTH-20240815-L002')->first();
        $incubatingBatch = $batches->where('batch_code', 'BTH-20240920-I003')->first();

        $events = [];

        // Events for Broiler Batch (Growing)
        if ($broilerBatch) {
            $events = array_merge($events, [
                // Incubation events
                [
                    'batch_id' => $broilerBatch->id,
                    'event_type' => EventType::OBSERVATION,
                    'title' => 'Incubation Started',
                    'description' => 'Eggs placed in incubator A1 for 21-day incubation cycle',
                    'event_date' => $broilerBatch->start_date,
                    'user_id' => $manager->id,
                    'event_data' => [
                        'egg_count' => 950,
                        'incubator' => 'Incubator A1',
                        'temperature_set' => 37.7,
                        'humidity_set' => 61.5,
                    ],
                ],
                [
                    'batch_id' => $broilerBatch->id,
                    'event_type' => EventType::TRANSFER,
                    'title' => 'Hatching Completed',
                    'description' => 'Chicks successfully hatched and moved to brooding area',
                    'event_date' => $broilerBatch->hatch_date,
                    'user_id' => $supervisor->id,
                    'event_data' => [
                        'hatched_count' => 930,
                        'hatch_rate' => 97.9,
                        'avg_hatch_weight' => 42,
                        'culled_weak' => 5,
                    ],
                ],
                // Feeding events
                [
                    'batch_id' => $broilerBatch->id,
                    'event_type' => EventType::FEEDING,
                    'title' => 'Starter Feed Distribution',
                    'description' => 'High-protein starter feed distributed - Week 1',
                    'event_date' => $broilerBatch->hatch_date->addDays(1),
                    'user_id' => $supervisor->id,
                    'feed_type' => 'Starter Crumble',
                    'feed_amount' => 45,
                    'event_data' => [
                        'protein_content' => 23,
                        'cost' => 67.5,
                    ],
                ],
                [
                    'batch_id' => $broilerBatch->id,
                    'event_type' => EventType::FEEDING,
                    'title' => 'Grower Feed Transition',
                    'description' => 'Switched to grower feed for optimal weight gain',
                    'event_date' => $broilerBatch->hatch_date->addDays(14),
                    'user_id' => $supervisor->id,
                    'feed_type' => 'Grower Pellets',
                    'feed_amount' => 280,
                    'event_data' => [
                        'protein_content' => 20,
                        'cost' => 350,
                    ],
                ],
                // Vaccination events
                [
                    'batch_id' => $broilerBatch->id,
                    'event_type' => EventType::VACCINATION,
                    'title' => 'Newcastle Disease Vaccine',
                    'description' => 'First vaccination against Newcastle disease via drinking water',
                    'event_date' => $broilerBatch->hatch_date->addDays(7),
                    'user_id' => $manager->id,
                    'vaccine_name' => 'Newcastle B1 Strain',
                    'administration_method' => 'Drinking water',
                    'dosage' => '1 dose per bird',
                    'affected_count' => 925,
                    'event_data' => [
                        'cost' => 92.5,
                    ],
                ],
                [
                    'batch_id' => $broilerBatch->id,
                    'event_type' => EventType::VACCINATION,
                    'title' => 'Gumboro Vaccine',
                    'description' => 'Intermediate strain Gumboro vaccine administered',
                    'event_date' => $broilerBatch->hatch_date->addDays(21),
                    'user_id' => $manager->id,
                    'vaccine_name' => 'Gumboro Intermediate',
                    'administration_method' => 'Drinking water',
                    'dosage' => '1 dose per bird',
                    'affected_count' => 920,
                    'event_data' => [
                        'cost' => 138,
                    ],
                ],
                // Health monitoring
                [
                    'batch_id' => $broilerBatch->id,
                    'event_type' => EventType::HEALTH_CHECK,
                    'title' => 'Weekly Health Inspection',
                    'description' => 'Routine health check - no significant issues found',
                    'event_date' => $broilerBatch->hatch_date->addDays(21),
                    'user_id' => $supervisor->id,
                    'affected_count' => 50,
                    'health_notes' => 'Good growth rate, minor respiratory symptoms in 2 birds',
                    'event_data' => [
                        'mortality_this_week' => 8,
                        'avg_weight' => 680,
                        'feed_conversion' => 1.55,
                    ],
                ],
                // Mortality event
                [
                    'batch_id' => $broilerBatch->id,
                    'event_type' => EventType::MORTALITY,
                    'title' => 'Weekly Mortality Report',
                    'description' => 'Natural mortality and culling report for week 3-4',
                    'event_date' => $broilerBatch->hatch_date->addDays(25),
                    'user_id' => $supervisor->id,
                    'mortality_count' => 20,
                    'mortality_cause' => 'Multiple causes',
                    'event_data' => [
                        'natural_deaths' => 15,
                        'culled_weak' => 3,
                        'culled_sick' => 2,
                        'primary_causes' => ['Sudden Death Syndrome', 'Leg problems', 'Respiratory'],
                    ],
                ],
            ]);
        }

        // Events for Layer Batch (Laying)
        if ($layerBatch) {
            $events = array_merge($events, [
                [
                    'batch_id' => $layerBatch->id,
                    'event_type' => EventType::WEIGHING,
                    'title' => 'First Egg Production',
                    'description' => 'Hens started laying - reached point of lay at 18 weeks',
                    'event_date' => $layerBatch->hatch_date->addDays(126), // 18 weeks
                    'user_id' => $manager->id,
                    'event_data' => [
                        'first_eggs_count' => 45,
                        'production_rate' => 7.6,
                        'avg_egg_weight' => 48,
                        'milestone' => 'Point of Lay',
                    ],
                ],
                [
                    'batch_id' => $layerBatch->id,
                    'event_type' => EventType::WEIGHING,
                    'title' => 'Peak Production Achieved',
                    'description' => 'Reached 92% production rate - peak laying period',
                    'event_date' => $layerBatch->hatch_date->addDays(168), // 24 weeks
                    'user_id' => $supervisor->id,
                    'event_data' => [
                        'daily_eggs' => 543,
                        'production_rate' => 92.0,
                        'avg_egg_weight' => 62,
                        'feed_conversion_per_dozen' => 1.8,
                    ],
                ],
                [
                    'batch_id' => $layerBatch->id,
                    'event_type' => EventType::FEEDING,
                    'title' => 'Layer Feed Distribution',
                    'description' => 'High-calcium layer feed for optimal egg production',
                    'event_date' => now()->subDays(7),
                    'user_id' => $supervisor->id,
                    'feed_type' => 'Layer Pellets Premium',
                    'feed_amount' => 420,
                    'event_data' => [
                        'protein_content' => 18,
                        'calcium_content' => 4.2,
                        'cost' => 378,
                    ],
                ],
                [
                    'batch_id' => $layerBatch->id,
                    'event_type' => EventType::HEALTH_CHECK,
                    'title' => 'Production Health Assessment',
                    'description' => 'Monthly health check focused on reproductive health',
                    'event_date' => now()->subDays(3),
                    'user_id' => $manager->id,
                    'affected_count' => 75,
                    'health_notes' => 'Excellent production health, minimal issues',
                    'event_data' => [
                        'shell_quality_score' => 8.5,
                        'internal_quality_score' => 9.2,
                        'prolapse_cases' => 1,
                    ],
                ],
            ]);
        }

        // Events for Incubating Batch
        if ($incubatingBatch) {
            $events = array_merge($events, [
                [
                    'batch_id' => $incubatingBatch->id,
                    'event_type' => EventType::OBSERVATION,
                    'title' => 'Incubation Initiated',
                    'description' => 'Fresh Cobb 500 eggs placed in incubator D4',
                    'event_date' => $incubatingBatch->start_date,
                    'user_id' => $manager->id,
                    'event_data' => [
                        'egg_count' => 450,
                        'incubator' => 'Incubator D4',
                        'temperature_set' => 37.5,
                        'humidity_set' => 61.0,
                        'expected_hatch' => $incubatingBatch->hatch_date->format('Y-m-d'),
                    ],
                ],
                [
                    'batch_id' => $incubatingBatch->id,
                    'event_type' => EventType::OBSERVATION,
                    'title' => 'Day 7 Candling',
                    'description' => 'First candling to check embryo development',
                    'event_date' => $incubatingBatch->start_date->addDays(7),
                    'user_id' => $supervisor->id,
                    'affected_count' => 45, // Sample
                    'event_data' => [
                        'fertile_eggs' => 42,
                        'infertile_eggs' => 3,
                        'fertility_rate' => 93.3,
                        'development_normal' => 40,
                    ],
                ],
                [
                    'batch_id' => $incubatingBatch->id,
                    'event_type' => EventType::OBSERVATION,
                    'title' => 'Day 14 Development Check',
                    'description' => 'Second candling and development assessment',
                    'event_date' => now()->subDays(6), // Day 14 from start (now - 6 days)
                    'user_id' => $supervisor->id,
                    'affected_count' => 45,
                    'event_data' => [
                        'normal_development' => 40,
                        'late_mortality' => 2,
                        'projected_hatch_rate' => 89,
                        'weight_loss_percentage' => 12.5,
                    ],
                ],
            ]);
        }

        foreach ($events as $eventData) {
            BatchEvent::create($eventData);
        }

        $this->command->info('✅ ' . count($events) . ' Batch events seeded successfully!');
        $this->command->info('   → Incubation events (starts, candling, monitoring)');
        $this->command->info('   → Health events (vaccinations, health checks)');
        $this->command->info('   → Production events (feeding, milestones)');
        $this->command->info('   → Mortality tracking and analysis');
    }
}
