<?php

namespace Database\Seeders\Modules\BatchIncubator;

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
        $user = User::first();
        $batches = Batch::all();

        if (!$user || $batches->isEmpty()) {
            $this->command->info('Please ensure users and batches exist first.');
            return;
        }

        // Get specific batches for different event types
        $growingBatch = $batches->where('status', 'growing')->first();
        $layingBatch = $batches->where('status', 'laying')->first();
        $incubatingBatch = $batches->where('status', 'incubating')->first();

        $events = [];

        // Events for growing batch (Broiler Batch Alpha)
        if ($growingBatch) {
            $events = array_merge($events, [
                [
                    'event_type' => EventType::FEEDING,
                    'title' => 'Morning Feed - Starter Crumbles',
                    'description' => 'Regular morning feeding with starter feed',
                    'batch_id' => $growingBatch->id,
                    'incubator_id' => $growingBatch->incubator_id,
                    'user_id' => $user->id,
                    'event_date' => now()->subDays(1),
                    'feed_type' => 'Starter Crumbles',
                    'feed_amount' => 95.5,
                    'quantity' => 95.5,
                    'unit' => 'kg',
                    'temperature' => 25.0,
                    'humidity' => 65.0,
                    'affected_count' => $growingBatch->current_count,
                    'event_data' => [
                        'protein_content' => '22%',
                        'feed_conversion_target' => 1.65,
                        'consumption_rate' => 'normal',
                    ],
                    'notes' => 'Birds showing good appetite and growth',
                ],
                [
                    'event_type' => EventType::HEALTH_CHECK,
                    'title' => 'Weekly Health Inspection',
                    'description' => 'Routine health check and monitoring',
                    'batch_id' => $growingBatch->id,
                    'incubator_id' => $growingBatch->incubator_id,
                    'user_id' => $user->id,
                    'event_date' => now()->subDays(2),
                    'affected_count' => $growingBatch->current_count,
                    'temperature' => 24.5,
                    'humidity' => 62.0,
                    'health_notes' => 'Overall flock health excellent. No signs of disease.',
                    'event_data' => [
                        'weight_sample' => [
                            'sample_size' => 50,
                            'avg_weight' => 210,
                            'weight_range' => '185-240g',
                        ],
                        'mortality_check' => 'none',
                        'behavior_assessment' => 'active and alert',
                    ],
                    'is_critical' => false,
                ],
                [
                    'event_type' => EventType::VACCINATION,
                    'title' => 'NDV Vaccination',
                    'description' => 'Newcastle Disease Vaccine administration',
                    'batch_id' => $growingBatch->id,
                    'incubator_id' => $growingBatch->incubator_id,
                    'user_id' => $user->id,
                    'event_date' => now()->subDays(7),
                    'vaccine_name' => 'Newcastle Disease Vaccine (NDV)',
                    'dosage' => '0.03ml per bird',
                    'administration_method' => 'Eye drop',
                    'affected_count' => $growingBatch->current_count,
                    'is_critical' => true,
                    'requires_followup' => true,
                    'followup_date' => now()->addDays(7),
                    'event_data' => [
                        'vaccine_batch' => 'NDV-2024-089',
                        'expiry_date' => '2025-03-15',
                        'storage_temp' => '2-8°C',
                    ],
                ],
                [
                    'event_type' => EventType::MORTALITY,
                    'title' => 'Mortality Record - 2 birds',
                    'description' => 'Daily mortality check found 2 casualties',
                    'batch_id' => $growingBatch->id,
                    'incubator_id' => $growingBatch->incubator_id,
                    'user_id' => $user->id,
                    'event_date' => now()->subDays(3),
                    'mortality_count' => 2,
                    'mortality_cause' => 'Natural causes - weak birds',
                    'affected_count' => 2,
                    'is_critical' => true,
                    'health_notes' => 'No signs of disease. Appeared to be naturally weak birds.',
                    'event_data' => [
                        'post_mortem' => 'No visible abnormalities',
                        'disposal_method' => 'Incineration',
                        'flock_impact' => 'minimal',
                    ],
                ],
            ]);
        }

        // Events for laying batch (Layer Batch Beta)
        if ($layingBatch) {
            $events = array_merge($events, [
                [
                    'event_type' => EventType::FEEDING,
                    'title' => 'Layer Feed - Pellets',
                    'description' => 'Daily feeding with layer pellets',
                    'batch_id' => $layingBatch->id,
                    'user_id' => $user->id,
                    'event_date' => now()->subHours(6),
                    'feed_type' => 'Layer Pellets',
                    'feed_amount' => 65.0,
                    'quantity' => 65.0,
                    'unit' => 'kg',
                    'affected_count' => $layingBatch->current_count,
                    'event_data' => [
                        'calcium_content' => '4.2%',
                        'protein_content' => '16%',
                        'consumption_pattern' => 'steady',
                    ],
                ],
                [
                    'event_type' => EventType::OBSERVATION,
                    'title' => 'Egg Collection - Morning',
                    'description' => 'Daily egg collection and quality check',
                    'batch_id' => $layingBatch->id,
                    'user_id' => $user->id,
                    'event_date' => now()->subHours(2),
                    'quantity' => 506,
                    'unit' => 'eggs',
                    'affected_count' => $layingBatch->current_count,
                    'event_data' => [
                        'production_rate' => '85.8%',
                        'egg_quality' => [
                            'grade_a' => 480,
                            'grade_b' => 22,
                            'cracked' => 4,
                        ],
                        'avg_weight' => '62.3g',
                    ],
                    'notes' => 'Excellent production rate maintained',
                ],
                [
                    'event_type' => EventType::WEIGHING,
                    'title' => 'Weekly Weight Check',
                    'description' => 'Sample weighing for body condition monitoring',
                    'batch_id' => $layingBatch->id,
                    'user_id' => $user->id,
                    'event_date' => now()->subDays(1),
                    'quantity' => 80000.0, // Sample of 50 birds
                    'unit' => 'g',
                    'affected_count' => 50,
                    'event_data' => [
                        'sample_size' => 50,
                        'avg_weight_per_bird' => 1600,
                        'weight_range' => '1450-1750g',
                        'body_condition' => 'optimal',
                    ],
                ],
            ]);
        }

        // Events for incubating batch
        if ($incubatingBatch) {
            $events = array_merge($events, [
                [
                    'event_type' => EventType::TEMPERATURE_CHANGE,
                    'title' => 'Temperature Adjustment',
                    'description' => 'Adjusted incubator temperature for optimal development',
                    'batch_id' => $incubatingBatch->id,
                    'incubator_id' => $incubatingBatch->incubator_id,
                    'user_id' => $user->id,
                    'event_date' => now()->subDays(1),
                    'temperature' => 37.6,
                    'before_measurements' => ['temperature' => 37.4],
                    'after_measurements' => ['temperature' => 37.6],
                    'event_data' => [
                        'reason' => 'Day 13 adjustment for optimal development',
                        'sensor_calibration' => 'verified',
                    ],
                ],
                [
                    'event_type' => EventType::HUMIDITY_CHANGE,
                    'title' => 'Humidity Increase',
                    'description' => 'Increased humidity for hatching preparation',
                    'batch_id' => $incubatingBatch->id,
                    'incubator_id' => $incubatingBatch->incubator_id,
                    'user_id' => $user->id,
                    'event_date' => now()->subHours(12),
                    'humidity' => 65.0,
                    'before_measurements' => ['humidity' => 61.2],
                    'after_measurements' => ['humidity' => 65.0],
                    'event_data' => [
                        'reason' => 'Preparing for hatching phase',
                        'expected_hatch' => 'in 8 days',
                    ],
                ],
                [
                    'event_type' => EventType::OBSERVATION,
                    'title' => 'Candling Check',
                    'description' => 'Egg candling to check embryo development',
                    'batch_id' => $incubatingBatch->id,
                    'incubator_id' => $incubatingBatch->incubator_id,
                    'user_id' => $user->id,
                    'event_date' => now()->subDays(3),
                    'affected_count' => 100, // Sample size
                    'event_data' => [
                        'sample_size' => 100,
                        'viable_embryos' => 94,
                        'clear_eggs' => 4,
                        'blood_rings' => 2,
                        'development_stage' => 'day 10 - good development',
                    ],
                    'notes' => '94% viability rate - excellent development',
                ],
            ]);
        }

        foreach ($events as $eventData) {
            BatchEvent::create($eventData);
        }

        $this->command->info('✅ Batch events seeded successfully!');
    }
}
