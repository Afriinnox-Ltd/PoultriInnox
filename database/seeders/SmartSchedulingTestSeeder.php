<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Modules\BatchIncubator\Models\MedicationProtocol;
use App\Modules\BatchIncubator\Models\VaccinationProtocol;
use App\Models\User;

class SmartSchedulingTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminUser = User::where('email', 'admin@poultriinnox.com')->first();
        if (!$adminUser) {
            $adminUser = User::factory()->create([
                'name' => 'Admin User',
                'email' => 'admin@poultriinnox.com',
                'password' => bcrypt('password'),
            ]);
        }

        // Create 5 sample medication protocols
        $medications = [
            [
                'name' => 'Amoxicillin Treatment Protocol',
                'medication_name' => 'Amoxicillin',
                'medication_type' => 'antibiotic',
                'description' => 'Broad-spectrum antibiotic for bacterial infections',
                'target_breeds' => ['Broiler', 'Layer'],
                'bird_type' => 'chicken',
                'purpose' => 'broiler',
                'min_age_days' => 7,
                'max_age_days' => 365,
                'active_ingredient' => 'Amoxicillin trihydrate',
                'dosage_per_kg_body_weight' => 15.0,
                'dosage_unit' => 'mg',
                'administration_method' => 'water',
                'treatment_duration_days' => 5,
                'application_schedule' => [
                    'schedule_type' => 'event_based',
                    'triggers' => ['respiratory_infection']
                ],
                'withdrawal_period_days' => 7,
                'contraindications' => ['known_penicillin_allergy'],
                'cost_per_unit' => 2.50,
                'supplier' => 'Zoetis',
                'status' => 'active',
                'is_emergency_protocol' => false,
                'auto_recommend' => true,
                'created_by' => $adminUser->id,
            ],
            [
                'name' => 'Vitamin B Complex Supplement',
                'medication_name' => 'B-Complex Vitamins',
                'medication_type' => 'vitamin',
                'description' => 'Water-soluble vitamin complex for stress recovery',
                'target_breeds' => ['Broiler', 'Layer', 'Turkey'],
                'bird_type' => 'chicken',
                'purpose' => 'layer',
                'min_age_days' => 1,
                'max_age_days' => 365,
                'active_ingredient' => 'Thiamine, Riboflavin, Niacin',
                'dosage_per_kg_body_weight' => 2.0,
                'dosage_unit' => 'g',
                'administration_method' => 'water',
                'treatment_duration_days' => 5,
                'application_schedule' => [
                    'schedule_type' => 'event_based',
                    'triggers' => ['stress', 'transport']
                ],
                'withdrawal_period_days' => 0,
                'contraindications' => [],
                'cost_per_unit' => 0.75,
                'supplier' => 'Norbrook',
                'status' => 'active',
                'is_emergency_protocol' => false,
                'auto_recommend' => true,
                'created_by' => $adminUser->id,
            ],
            [
                'name' => 'Fenbendazole Deworming',
                'medication_name' => 'Fenbendazole',
                'medication_type' => 'dewormer',
                'description' => 'Broad-spectrum anthelmintic for internal parasites',
                'target_breeds' => ['Layer', 'Breeder'],
                'bird_type' => 'chicken',
                'purpose' => 'layer',
                'min_age_days' => 28,
                'max_age_days' => 365,
                'active_ingredient' => 'Fenbendazole',
                'dosage_per_kg_body_weight' => 5.0,
                'dosage_unit' => 'mg',
                'administration_method' => 'feed',
                'treatment_duration_days' => 5,
                'application_schedule' => [
                    'schedule_type' => 'age_based',
                    'applications' => [
                        ['age_days' => 60, 'purpose' => 'prevention'],
                        ['age_days' => 120, 'purpose' => 'prevention']
                    ]
                ],
                'withdrawal_period_days' => 14,
                'contraindications' => ['breeding_birds'],
                'cost_per_unit' => 1.25,
                'supplier' => 'Merck',
                'status' => 'active',
                'is_emergency_protocol' => false,
                'auto_recommend' => true,
                'created_by' => $adminUser->id,
            ],
            [
                'name' => 'Emergency Enrofloxacin Protocol',
                'medication_name' => 'Enrofloxacin',
                'medication_type' => 'antibiotic',
                'description' => 'Fluoroquinolone for severe bacterial infections',
                'target_breeds' => ['Broiler', 'Layer'],
                'bird_type' => 'chicken',
                'purpose' => 'broiler',
                'min_age_days' => 14,
                'max_age_days' => 365,
                'active_ingredient' => 'Enrofloxacin',
                'dosage_per_kg_body_weight' => 10.0,
                'dosage_unit' => 'mg',
                'administration_method' => 'injection',
                'treatment_duration_days' => 3,
                'application_schedule' => [
                    'schedule_type' => 'event_based',
                    'triggers' => ['severe_infection', 'colibacillosis']
                ],
                'withdrawal_period_days' => 14,
                'contraindications' => ['young_birds_under_14_days'],
                'cost_per_unit' => 8.75,
                'supplier' => 'Bayer',
                'status' => 'active',
                'is_emergency_protocol' => true,
                'auto_recommend' => true,
                'created_by' => $adminUser->id,
            ],
            [
                'name' => 'Probiotics Supplement',
                'medication_name' => 'Multi-strain Probiotics',
                'medication_type' => 'supplement',
                'description' => 'Beneficial bacteria for gut health',
                'target_breeds' => ['Broiler', 'Layer'],
                'bird_type' => 'chicken',
                'purpose' => 'broiler',
                'min_age_days' => 1,
                'max_age_days' => 365,
                'active_ingredient' => 'Lactobacillus, Bifidobacterium',
                'dosage_per_kg_body_weight' => 0.5,
                'dosage_unit' => 'g',
                'administration_method' => 'feed',
                'treatment_duration_days' => 30,
                'application_schedule' => [
                    'schedule_type' => 'continuous',
                    'frequency' => 'daily'
                ],
                'withdrawal_period_days' => 0,
                'contraindications' => [],
                'cost_per_unit' => 2.75,
                'supplier' => 'Chr. Hansen',
                'status' => 'active',
                'is_emergency_protocol' => false,
                'auto_recommend' => true,
                'created_by' => $adminUser->id,
            ],
        ];

        foreach ($medications as $medication) {
            MedicationProtocol::create($medication);
        }

        // Create 5 sample vaccination protocols
        $vaccinations = [
            [
                'name' => 'Marek\'s Disease Vaccination',
                'vaccine_name' => 'Marek\'s Disease Vaccine (HVT)',
                'vaccine_type' => 'live',
                'description' => 'Protection against Marek\'s disease lymphoma',
                'target_breeds' => ['Broiler', 'Layer', 'Breeder'],
                'min_age_days' => 1,
                'max_age_days' => 1,
                'prevents_disease' => 'Marek\'s Disease',
                'priority_level' => 'critical',
                'is_mandatory' => true,
                'dosage_per_bird' => 0.2,
                'dosage_unit' => 'ml',
                'administration_method' => 'subcutaneous',
                'vaccination_schedule' => [
                    'schedule_type' => 'age_based',
                    'vaccinations' => [
                        [
                            'age_days' => 1,
                            'is_primary' => true,
                            'administration_method' => 'subcutaneous',
                            'dosage' => 0.2,
                            'notes' => 'Day-old vaccination at hatchery'
                        ]
                    ]
                ],
                'manufacturer' => 'Boehringer Ingelheim',
                'storage_requirements' => [
                    'temperature_min' => -20,
                    'temperature_max' => -10,
                    'storage_type' => 'frozen'
                ],
                'auto_recommend' => true,
                'status' => 'active',
                'created_by' => $adminUser->id,
            ],
            [
                'name' => 'Newcastle Disease + IB Combo',
                'vaccine_name' => 'ND-IB Combination Vaccine',
                'vaccine_type' => 'live',
                'description' => 'Combined protection against ND and IB',
                'target_breeds' => ['Broiler', 'Layer'],
                'min_age_days' => 7,
                'max_age_days' => 14,
                'prevents_disease' => 'Newcastle Disease, Infectious Bronchitis',
                'priority_level' => 'critical',
                'is_mandatory' => true,
                'dosage_per_bird' => 0.03,
                'dosage_unit' => 'ml',
                'administration_method' => 'eye_drop',
                'vaccination_schedule' => [
                    'schedule_type' => 'age_based',
                    'vaccinations' => [
                        [
                            'age_days' => 7,
                            'is_primary' => true,
                            'administration_method' => 'eye_drop',
                            'dosage' => 0.03
                        ],
                        [
                            'age_days' => 21,
                            'is_primary' => false,
                            'administration_method' => 'drinking_water',
                            'dosage' => 1.0
                        ]
                    ]
                ],
                'manufacturer' => 'Ceva',
                'storage_requirements' => [
                    'temperature_min' => 2,
                    'temperature_max' => 8,
                    'storage_type' => 'refrigerated'
                ],
                'auto_recommend' => true,
                'status' => 'active',
                'created_by' => $adminUser->id,
            ],
            [
                'name' => 'Infectious Bursal Disease',
                'vaccine_name' => 'IBD Intermediate Vaccine',
                'vaccine_type' => 'live',
                'description' => 'Protection against Gumboro disease',
                'target_breeds' => ['Broiler', 'Layer'],
                'min_age_days' => 14,
                'max_age_days' => 21,
                'prevents_disease' => 'Infectious Bursal Disease',
                'priority_level' => 'high',
                'is_mandatory' => true,
                'dosage_per_bird' => 0.03,
                'dosage_unit' => 'ml',
                'administration_method' => 'eye_drop',
                'vaccination_schedule' => [
                    'schedule_type' => 'age_based',
                    'vaccinations' => [
                        [
                            'age_days' => 14,
                            'is_primary' => true,
                            'administration_method' => 'eye_drop',
                            'dosage' => 0.03
                        ]
                    ]
                ],
                'manufacturer' => 'Zoetis',
                'storage_requirements' => [
                    'temperature_min' => 2,
                    'temperature_max' => 8,
                    'storage_type' => 'refrigerated'
                ],
                'auto_recommend' => true,
                'status' => 'active',
                'created_by' => $adminUser->id,
            ],
            [
                'name' => 'Fowl Pox Prevention',
                'vaccine_name' => 'Fowl Pox Vaccine',
                'vaccine_type' => 'live',
                'description' => 'Protection against Fowl Pox',
                'target_breeds' => ['Layer', 'Free-range'],
                'min_age_days' => 70,
                'max_age_days' => 140,
                'prevents_disease' => 'Fowl Pox',
                'priority_level' => 'low',
                'is_mandatory' => false,
                'dosage_per_bird' => 0.01,
                'dosage_unit' => 'ml',
                'administration_method' => 'subcutaneous',
                'vaccination_schedule' => [
                    'schedule_type' => 'age_based',
                    'vaccinations' => [
                        [
                            'age_days' => 70,
                            'is_primary' => true,
                            'administration_method' => 'subcutaneous',
                            'dosage' => 0.01
                        ]
                    ]
                ],
                'manufacturer' => 'Virbac',
                'storage_requirements' => [
                    'temperature_min' => 2,
                    'temperature_max' => 8,
                    'storage_type' => 'refrigerated'
                ],
                'auto_recommend' => false,
                'status' => 'active',
                'created_by' => $adminUser->id,
            ],
            [
                'name' => 'Egg Drop Syndrome Prevention',
                'vaccine_name' => 'EDS-76 Killed Vaccine',
                'vaccine_type' => 'killed',
                'description' => 'Prevention of Egg Drop Syndrome',
                'target_breeds' => ['Layer', 'Breeder'],
                'min_age_days' => 112,
                'max_age_days' => 140,
                'prevents_disease' => 'Egg Drop Syndrome',
                'priority_level' => 'medium',
                'is_mandatory' => false,
                'dosage_per_bird' => 0.5,
                'dosage_unit' => 'ml',
                'administration_method' => 'intramuscular',
                'vaccination_schedule' => [
                    'schedule_type' => 'age_based',
                    'vaccinations' => [
                        [
                            'age_days' => 112,
                            'is_primary' => true,
                            'administration_method' => 'intramuscular',
                            'dosage' => 0.5
                        ]
                    ]
                ],
                'manufacturer' => 'Intervet',
                'storage_requirements' => [
                    'temperature_min' => 2,
                    'temperature_max' => 8,
                    'storage_type' => 'refrigerated'
                ],
                'auto_recommend' => true,
                'status' => 'active',
                'created_by' => $adminUser->id,
            ],
        ];

        foreach ($vaccinations as $vaccination) {
            VaccinationProtocol::create($vaccination);
        }

        $this->command->info('✅ Created ' . count($medications) . ' medication protocols and ' . count($vaccinations) . ' vaccination protocols');
    }
}
