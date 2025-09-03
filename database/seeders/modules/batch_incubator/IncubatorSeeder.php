<?php

namespace Database\Seeders\Modules\BatchIncubator;

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
                'current_load' => 0,
                'target_temperature' => 37.5,
                'target_humidity' => 60.0,
                'current_temperature' => 37.2,
                'current_humidity' => 58.5,
                'status' => IncubatorStatus::IDLE,
                'location' => 'Building A - Room 1',
                'settings' => [
                    'auto_turning' => true,
                    'turning_interval' => 2, // hours
                    'ventilation_mode' => 'auto',
                    'alarm_enabled' => true,
                ],
                'sensors_data' => [
                    'temperature_sensor_1' => 37.2,
                    'temperature_sensor_2' => 37.1,
                    'humidity_sensor' => 58.5,
                    'co2_level' => 0.4,
                ],
                'access_control' => [
                    'required_authorization' => true,
                    'maintenance_password' => true,
                ],
                'next_maintenance' => now()->addDays(30),
                'maintenance_notes' => 'Regular maintenance scheduled monthly',
                'owner_id' => $owner->id,
            ],
            [
                'name' => 'Incubator B2',
                'model' => 'Petersime BioStreamer',
                'serial_number' => 'PBS-2024-002',
                'description' => 'Secondary incubator for layer eggs',
                'capacity' => 800,
                'current_load' => 600,
                'target_temperature' => 37.8,
                'target_humidity' => 62.0,
                'current_temperature' => 37.7,
                'current_humidity' => 61.8,
                'status' => IncubatorStatus::RUNNING,
                'location' => 'Building B - Room 2',
                'settings' => [
                    'auto_turning' => true,
                    'turning_interval' => 1, // hours
                    'ventilation_mode' => 'manual',
                    'alarm_enabled' => true,
                ],
                'sensors_data' => [
                    'temperature_sensor_1' => 37.7,
                    'temperature_sensor_2' => 37.8,
                    'humidity_sensor' => 61.8,
                    'co2_level' => 0.3,
                ],
                'access_control' => [
                    'required_authorization' => true,
                    'maintenance_password' => true,
                ],
                'last_maintenance' => now()->subDays(15),
                'next_maintenance' => now()->addDays(15),
                'maintenance_notes' => 'Last serviced 15 days ago. Running smoothly.',
                'owner_id' => $owner->id,
            ],
            [
                'name' => 'Incubator C3',
                'model' => 'Chick Master SetPro',
                'serial_number' => 'CMS-2024-003',
                'description' => 'Backup incubator for emergency use',
                'capacity' => 500,
                'current_load' => 0,
                'target_temperature' => 37.5,
                'target_humidity' => 60.0,
                'current_temperature' => null,
                'current_humidity' => null,
                'status' => IncubatorStatus::OFFLINE,
                'location' => 'Building C - Storage',
                'settings' => [
                    'auto_turning' => false,
                    'turning_interval' => 4, // hours
                    'ventilation_mode' => 'manual',
                    'alarm_enabled' => false,
                ],
                'sensors_data' => null,
                'access_control' => [
                    'required_authorization' => false,
                    'maintenance_password' => false,
                ],
                'next_maintenance' => now()->addDays(60),
                'maintenance_notes' => 'Backup unit - activate only when needed',
                'owner_id' => $owner->id,
            ],
            [
                'name' => 'Incubator D4',
                'model' => 'Pas Reform SmartPro',
                'serial_number' => 'PRS-2024-004',
                'description' => 'High-tech incubator with AI monitoring',
                'capacity' => 1200,
                'current_load' => 950,
                'target_temperature' => 37.6,
                'target_humidity' => 61.5,
                'current_temperature' => 37.5,
                'current_humidity' => 61.2,
                'status' => IncubatorStatus::RUNNING,
                'location' => 'Building D - Main Hall',
                'settings' => [
                    'auto_turning' => true,
                    'turning_interval' => 1, // hours
                    'ventilation_mode' => 'smart',
                    'alarm_enabled' => true,
                    'ai_monitoring' => true,
                ],
                'sensors_data' => [
                    'temperature_sensor_1' => 37.5,
                    'temperature_sensor_2' => 37.6,
                    'humidity_sensor' => 61.2,
                    'co2_level' => 0.2,
                    'oxygen_level' => 20.8,
                ],
                'access_control' => [
                    'required_authorization' => true,
                    'maintenance_password' => true,
                    'biometric_access' => true,
                ],
                'last_maintenance' => now()->subDays(5),
                'next_maintenance' => now()->addDays(25),
                'maintenance_notes' => 'Premium model with advanced features',
                'owner_id' => $owner->id,
            ],
        ];

        foreach ($incubators as $incubatorData) {
            Incubator::create($incubatorData);
        }

        $this->command->info('✅ Incubators seeded successfully!');
    }
}
