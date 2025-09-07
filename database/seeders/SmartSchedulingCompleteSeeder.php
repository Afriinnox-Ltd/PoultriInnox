<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class SmartSchedulingCompleteSeeder extends Seeder
{
    /**
     * Run all smart scheduling seeders
     */
    public function run(): void
    {
        $this->command->info('🚀 Starting comprehensive smart scheduling system seeding...');
        
        // Run all the individual seeders
        $this->call([
            SmartSchedulingTestSeeder::class,
            ComprehensiveSmartSchedulingSeeder::class,
            ExtensiveProtocolSeeder::class,
        ]);
        
        $this->command->info('✅ Smart scheduling system fully populated with test data!');
        $this->command->info('📊 Database now contains comprehensive medication and vaccination protocols');
        $this->command->info('🔬 Ready for testing all smart scheduling features');
    }
}
