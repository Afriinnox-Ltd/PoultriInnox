<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Modules\BatchIncubator\Models\Incubator;
use App\Modules\BatchIncubator\Enums\IncubatorStatus;
use App\Models\User;

class IncubatorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the farm manager as the owner
        $owner = User::where('email', 'manager@poultriinnox.com')->first();

        if (!$owner) {
            $this->command->error('Farm manager user not found. Please ensure users are seeded first.');
            return;
        }

        // Check if incubators already exist
        if (Incubator::count() > 0) {
            $this->command->info('Incubators already exist. Skipping incubator seeding.');
            return;
        }

        $incubators = [
            [
                'name' => 'Incubator A1',
                'model' => 'HatchTech HatchCare',
                'serial_number' => 'HTC-2024-001',
                'description' => 'Primary incubator for broiler eggs',
                'capacity' => 1000,
                'current_load' => 800,
                'target_temperature' => 37.7,
                'target_humidity' => 61.5,
                'current_temperature' => 37.6,
                'current_humidity' => 61.8,
                'status' => IncubatorStatus::RUNNING,
                'settings' => [
                    'auto_turn' => true,
                    'turn_interval' => 2, // hours
                    'alarm_enabled' => true,
                    'backup_power' => true,
                ],
                'sensors_data' => [
                    'temperature_probe_1' => 37.6,
                    'temperature_probe_2' => 37.7,
                    'humidity_sensor' => 61.8,
                    'last_reading' => now()->toISOString(),
                ],
                'location' => 'Building A, Room 101',
                'access_control' => [
                    'keypad_code' => '1234',
                    'rfid_enabled' => true,
                ],
                'last_maintenance' => now()->subDays(15),
                'next_maintenance' => now()->addDays(15),
                'maintenance_notes' => 'Regular maintenance completed. All systems operating normally.',
                'owner_id' => $owner->id,
                'authorized_users' => [$owner->id],
            ],
            [
                'name' => 'Incubator B2',
                'model' => 'Petersime BioStreamer',
                'serial_number' => 'PBS-2024-002',
                'description' => 'High-capacity incubator for layer eggs',
                'capacity' => 1500,
                'current_load' => 1350,
                'target_temperature' => 37.8,
                'target_humidity' => 62.0,
                'current_temperature' => 37.8,
                'current_humidity' => 62.1,
                'status' => IncubatorStatus::RUNNING,
                'settings' => [
                    'auto_turn' => true,
                    'turn_interval' => 1.5, // hours
                    'alarm_enabled' => true,
                    'backup_power' => true,
                    'co2_control' => true,
                ],
                'sensors_data' => [
                    'temperature_probe_1' => 37.8,
                    'temperature_probe_2' => 37.7,
                    'humidity_sensor' => 62.1,
                    'co2_level' => 0.4,
                    'last_reading' => now()->toISOString(),
                ],
                'location' => 'Building B, Room 205',
                'access_control' => [
                    'keypad_code' => '5678',
                    'rfid_enabled' => true,
                ],
                'last_maintenance' => now()->subDays(8),
                'next_maintenance' => now()->addDays(22),
                'maintenance_notes' => 'CO2 sensors calibrated. Temperature probes checked.',
                'owner_id' => $owner->id,
                'authorized_users' => [$owner->id],
            ],
            [
                'name' => 'Incubator C3',
                'model' => 'Chick Master G3',
                'serial_number' => 'CMG3-2024-003',
                'description' => 'Backup incubator currently idle',
                'capacity' => 800,
                'current_load' => 0,
                'target_temperature' => null,
                'target_humidity' => null,
                'current_temperature' => 22.5, // Room temperature
                'current_humidity' => 45.0,
                'status' => IncubatorStatus::IDLE,
                'settings' => [
                    'auto_turn' => false,
                    'turn_interval' => 2,
                    'alarm_enabled' => false,
                    'backup_power' => true,
                ],
                'sensors_data' => [
                    'temperature_probe_1' => 22.5,
                    'temperature_probe_2' => 22.4,
                    'humidity_sensor' => 45.0,
                    'last_reading' => now()->toISOString(),
                ],
                'location' => 'Building C, Room 301',
                'access_control' => [
                    'keypad_code' => '9012',
                    'rfid_enabled' => false,
                ],
                'last_maintenance' => now()->subDays(30),
                'next_maintenance' => now()->addDays(5),
                'maintenance_notes' => 'Scheduled for deep cleaning and calibration.',
                'owner_id' => $owner->id,
                'authorized_users' => [$owner->id],
            ],
            [
                'name' => 'Incubator D4',
                'model' => 'Pas Reform Boreas',
                'serial_number' => 'PRB-2024-004',
                'description' => 'Research incubator for specialized breeds',
                'capacity' => 600,
                'current_load' => 480,
                'target_temperature' => 37.6,
                'target_humidity' => 60.8,
                'current_temperature' => 37.5,
                'current_humidity' => 60.9,
                'status' => IncubatorStatus::RUNNING,
                'settings' => [
                    'auto_turn' => true,
                    'turn_interval' => 2,
                    'alarm_enabled' => true,
                    'backup_power' => true,
                    'research_mode' => true,
                ],
                'sensors_data' => [
                    'temperature_probe_1' => 37.5,
                    'temperature_probe_2' => 37.6,
                    'humidity_sensor' => 60.9,
                    'oxygen_level' => 20.8,
                    'last_reading' => now()->toISOString(),
                ],
                'location' => 'Research Lab, Building D',
                'access_control' => [
                    'keypad_code' => '3456',
                    'rfid_enabled' => true,
                    'biometric_enabled' => true,
                ],
                'last_maintenance' => now()->subDays(5),
                'next_maintenance' => now()->addDays(25),
                'maintenance_notes' => 'Research protocols updated. Oxygen sensors recalibrated.',
                'owner_id' => $owner->id,
                'authorized_users' => [$owner->id],
            ],
        ];

        foreach ($incubators as $incubatorData) {
            Incubator::create($incubatorData);
        }

        $this->command->info('✅ Incubators seeded successfully!');
    }
}
