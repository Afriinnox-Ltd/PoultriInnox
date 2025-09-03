<?php

namespace Database\Seeders\Modules\BatchIncubator;

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
        $user = User::first();
        $batches = Batch::all();

        if (!$user || $batches->isEmpty()) {
            $this->command->info('Please ensure users and batches exist first.');
            return;
        }

        $growingBatch = $batches->where('status', 'growing')->first();
        $layingBatch = $batches->where('status', 'laying')->first();
        $incubatingBatch = $batches->where('status', 'incubating')->first();
        $plannedBatch = $batches->where('status', 'planned')->first();

        $schedules = [];

        // Schedules for growing batch
        if ($growingBatch) {
            $schedules = array_merge($schedules, [
                [
                    'title' => 'Morning Feeding',
                    'description' => 'Daily morning feed for broiler batch',
                    'event_type' => EventType::FEEDING,
                    'batch_id' => $growingBatch->id,
                    'incubator_id' => $growingBatch->incubator_id,
                    'assigned_to' => $user->id,
                    'created_by' => $user->id,
                    'scheduled_date' => now()->addHours(6),
                    'scheduled_time' => '06:00',
                    'estimated_duration' => 30,
                    'is_recurring' => true,
                    'recurrence_pattern' => 'daily',
                    'recurrence_config' => ['frequency' => 1],
                    'recurrence_end_date' => now()->addDays(14),
                    'status' => ScheduleStatus::PENDING,
                    'required_quantity' => 100.0,
                    'required_unit' => 'kg',
                    'priority' => 3,
                    'is_critical' => false,
                    'send_reminder' => true,
                    'reminder_minutes_before' => 30,
                    'requirements' => [
                        'feed_type' => 'Grower Feed',
                        'tools' => ['scale', 'feed_scoop', 'distribution_system'],
                        'safety_gear' => ['gloves', 'mask'],
                    ],
                    'checklist' => [
                        'Check feed quality',
                        'Verify quantity',
                        'Distribute evenly',
                        'Monitor consumption',
                        'Record feeding time',
                    ],
                ],
                [
                    'title' => 'Health Check & Weighing',
                    'description' => 'Weekly health inspection and weight sampling',
                    'event_type' => EventType::HEALTH_CHECK,
                    'batch_id' => $growingBatch->id,
                    'incubator_id' => $growingBatch->incubator_id,
                    'assigned_to' => $user->id,
                    'created_by' => $user->id,
                    'scheduled_date' => now()->addDays(7),
                    'scheduled_time' => '09:00',
                    'estimated_duration' => 90,
                    'is_recurring' => true,
                    'recurrence_pattern' => 'weekly',
                    'recurrence_config' => ['frequency' => 1],
                    'status' => ScheduleStatus::PENDING,
                    'priority' => 1,
                    'is_critical' => true,
                    'requires_verification' => true,
                    'send_reminder' => true,
                    'reminder_minutes_before' => 60,
                    'requirements' => [
                        'equipment' => ['scale', 'health_record_sheets', 'thermometer'],
                        'sample_size' => 50,
                    ],
                    'checklist' => [
                        'Visual health inspection',
                        'Weight sample (50 birds)',
                        'Check for disease signs',
                        'Monitor feed consumption',
                        'Record mortality',
                        'Update health records',
                    ],
                ],
                [
                    'title' => 'Vaccination - IBV Booster',
                    'description' => 'Infectious Bronchitis Virus booster vaccination',
                    'event_type' => EventType::VACCINATION,
                    'batch_id' => $growingBatch->id,
                    'incubator_id' => $growingBatch->incubator_id,
                    'assigned_to' => $user->id,
                    'created_by' => $user->id,
                    'scheduled_date' => now()->addDays(3),
                    'scheduled_time' => '10:00',
                    'estimated_duration' => 120,
                    'status' => ScheduleStatus::PENDING,
                    'priority' => 1,
                    'is_critical' => true,
                    'requires_verification' => true,
                    'send_reminder' => true,
                    'reminder_minutes_before' => 120,
                    'requirements' => [
                        'vaccine' => 'IBV Booster',
                        'equipment' => ['syringes', 'needles', 'vaccine_storage'],
                        'dosage' => '0.03ml per bird',
                        'method' => 'subcutaneous injection',
                    ],
                    'checklist' => [
                        'Verify vaccine expiry date',
                        'Prepare equipment',
                        'Calculate total dosage needed',
                        'Administer vaccine',
                        'Record vaccination details',
                        'Monitor for adverse reactions',
                    ],
                ],
            ]);
        }

        // Schedules for laying batch
        if ($layingBatch) {
            $schedules = array_merge($schedules, [
                [
                    'title' => 'Egg Collection - Morning',
                    'description' => 'Daily morning egg collection',
                    'event_type' => EventType::OBSERVATION,
                    'batch_id' => $layingBatch->id,
                    'assigned_to' => $user->id,
                    'created_by' => $user->id,
                    'scheduled_date' => now()->addHours(8),
                    'scheduled_time' => '08:00',
                    'estimated_duration' => 45,
                    'is_recurring' => true,
                    'recurrence_pattern' => 'daily',
                    'recurrence_config' => ['frequency' => 1],
                    'status' => ScheduleStatus::PENDING,
                    'priority' => 2,
                    'send_reminder' => true,
                    'reminder_minutes_before' => 15,
                    'requirements' => [
                        'equipment' => ['egg_baskets', 'cleaning_materials', 'record_sheets'],
                        'storage' => 'refrigerated_room',
                    ],
                    'checklist' => [
                        'Collect eggs gently',
                        'Sort by quality grade',
                        'Count total eggs',
                        'Record production rate',
                        'Store in appropriate temperature',
                        'Clean nest boxes',
                    ],
                ],
                [
                    'title' => 'Layer Feed Distribution',
                    'description' => 'Daily feed distribution for laying hens',
                    'event_type' => EventType::FEEDING,
                    'batch_id' => $layingBatch->id,
                    'assigned_to' => $user->id,
                    'created_by' => $user->id,
                    'scheduled_date' => now()->addHours(7),
                    'scheduled_time' => '07:00',
                    'estimated_duration' => 30,
                    'is_recurring' => true,
                    'recurrence_pattern' => 'daily',
                    'recurrence_config' => ['frequency' => 1],
                    'status' => ScheduleStatus::PENDING,
                    'required_quantity' => 65.0,
                    'required_unit' => 'kg',
                    'priority' => 3,
                    'send_reminder' => true,
                    'reminder_minutes_before' => 20,
                    'requirements' => [
                        'feed_type' => 'Layer Pellets',
                        'calcium_supplement' => true,
                    ],
                ],
            ]);
        }

        // Schedules for incubating batch
        if ($incubatingBatch) {
            $schedules = array_merge($schedules, [
                [
                    'title' => 'Incubator Environment Check',
                    'description' => 'Check temperature, humidity, and turning mechanism',
                    'event_type' => EventType::OBSERVATION,
                    'batch_id' => $incubatingBatch->id,
                    'incubator_id' => $incubatingBatch->incubator_id,
                    'assigned_to' => $user->id,
                    'created_by' => $user->id,
                    'scheduled_date' => now()->addHours(4),
                    'scheduled_time' => '12:00',
                    'estimated_duration' => 15,
                    'is_recurring' => true,
                    'recurrence_pattern' => 'daily',
                    'recurrence_config' => ['frequency' => 1],
                    'status' => ScheduleStatus::PENDING,
                    'priority' => 1,
                    'is_critical' => true,
                    'send_reminder' => true,
                    'reminder_minutes_before' => 30,
                    'checklist' => [
                        'Verify temperature (37.6°C)',
                        'Check humidity (61-65%)',
                        'Confirm turning mechanism working',
                        'Inspect alarm systems',
                        'Record readings',
                        'Check ventilation',
                    ],
                ],
                [
                    'title' => 'Pre-Hatch Setup',
                    'description' => 'Prepare hatching environment for expected hatch',
                    'event_type' => EventType::TRANSFER,
                    'batch_id' => $incubatingBatch->id,
                    'incubator_id' => $incubatingBatch->incubator_id,
                    'assigned_to' => $user->id,
                    'created_by' => $user->id,
                    'scheduled_date' => now()->addDays(6),
                    'scheduled_time' => '14:00',
                    'estimated_duration' => 180,
                    'status' => ScheduleStatus::PENDING,
                    'priority' => 1,
                    'is_critical' => true,
                    'requires_verification' => true,
                    'send_reminder' => true,
                    'reminder_minutes_before' => 240,
                    'requirements' => [
                        'equipment' => ['hatcher_trays', 'chick_boxes', 'heating_lamps'],
                        'environment' => 'hatcher_room',
                    ],
                    'checklist' => [
                        'Transfer eggs to hatcher',
                        'Increase humidity to 65%',
                        'Prepare chick receiving area',
                        'Set up brooding equipment',
                        'Verify ventilation system',
                        'Test alarm systems',
                    ],
                ],
            ]);
        }

        // Schedules for planned batch
        if ($plannedBatch) {
            $schedules = array_merge($schedules, [
                [
                    'title' => 'Feed Procurement',
                    'description' => 'Order organic feed for heritage breed batch',
                    'event_type' => EventType::OBSERVATION,
                    'batch_id' => $plannedBatch->id,
                    'assigned_to' => $user->id,
                    'created_by' => $user->id,
                    'scheduled_date' => now()->addDays(7),
                    'scheduled_time' => '10:00',
                    'estimated_duration' => 60,
                    'status' => ScheduleStatus::PENDING,
                    'priority' => 2,
                    'send_reminder' => true,
                    'reminder_minutes_before' => 60,
                    'requirements' => [
                        'feed_type' => 'Organic Starter Feed',
                        'quantity_needed' => '500kg',
                        'supplier' => 'Organic Feed Co.',
                    ],
                    'checklist' => [
                        'Contact supplier',
                        'Verify organic certification',
                        'Place order for delivery',
                        'Arrange storage space',
                        'Schedule quality inspection',
                    ],
                ],
                [
                    'title' => 'Incubator Assignment',
                    'description' => 'Assign available incubator for batch start',
                    'event_type' => EventType::TRANSFER,
                    'batch_id' => $plannedBatch->id,
                    'assigned_to' => $user->id,
                    'created_by' => $user->id,
                    'scheduled_date' => now()->addDays(13),
                    'scheduled_time' => '09:00',
                    'estimated_duration' => 120,
                    'status' => ScheduleStatus::PENDING,
                    'priority' => 1,
                    'is_critical' => true,
                    'send_reminder' => true,
                    'reminder_minutes_before' => 120,
                    'checklist' => [
                        'Select available incubator',
                        'Complete maintenance check',
                        'Calibrate temperature and humidity',
                        'Test all systems',
                        'Load eggs carefully',
                        'Start incubation cycle',
                    ],
                ],
            ]);
        }

        foreach ($schedules as $scheduleData) {
            BatchSchedule::create($scheduleData);
        }

        $this->command->info('✅ Batch schedules seeded successfully!');
    }
}
