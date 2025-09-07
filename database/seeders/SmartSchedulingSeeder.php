<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class SmartSchedulingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🧬 Seeding Smart Scheduling System...');
        
        // Create medication protocols
        $this->call(MedicationProtocolSeeder::class);
        
        // Create vaccination protocols
        $this->call(VaccinationProtocolSeeder::class);
        
        $this->command->info('✅ Smart Scheduling System seeded successfully!');
        $this->command->info('');
        $this->command->info('📋 Summary:');
        $this->command->info('   • Medication protocols: Various antibiotics, vitamins, dewormers, supplements');
        $this->command->info('   • Vaccination protocols: Core vaccines, layer-specific, broiler-specific, emergency vaccines');
        $this->command->info('   • Status variety: Active, inactive, and emergency protocols');
        $this->command->info('   • Priority levels: Critical, high, medium, low');
        $this->command->info('   • Target breeds: Broiler, Layer, Breeder, Duck, Turkey, Free-range');
        $this->command->info('');
        $this->command->info('🚀 Ready for testing!');
    }
}
