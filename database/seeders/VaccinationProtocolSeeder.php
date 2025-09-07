<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Modules\BatchIncubator\Models\VaccinationProtocol;
use App\Models\User;

class VaccinationProtocolSeeder extends Seeder
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

        $vaccinations = [
            // Core vaccines - high priority
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
                            'is_booster' => false,
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
                'name' => 'Newcastle Disease + Infectious Bronchitis',
                'vaccine_name' => 'ND-IB Combination Vaccine',
                'vaccine_type' => 'live',
                'description' => 'Combined protection against Newcastle Disease and Infectious Bronchitis',
                'target_breeds' => ['Broiler', 'Layer', 'Breeder'],
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
                            'is_booster' => false,
                            'administration_method' => 'eye_drop',
                            'dosage' => 0.03,
                            'notes' => 'First vaccination - eye drop or spray'
                        ],
                        [
                            'age_days' => 21,
                            'is_primary' => false,
                            'is_booster' => true,
                            'administration_method' => 'drinking_water',
                            'dosage' => 1.0,
                            'notes' => 'Booster via drinking water'
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
                'name' => 'Infectious Bursal Disease (Gumboro)',
                'vaccine_name' => 'IBD Intermediate Vaccine',
                'vaccine_type' => 'live',
                'description' => 'Protection against Infectious Bursal Disease (Gumboro)',
                'target_breeds' => ['Broiler', 'Layer'],
                'min_age_days' => 14,
                'max_age_days' => 21,
                'prevents_disease' => 'Infectious Bursal Disease (Gumboro)',
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
                            'is_booster' => false,
                            'administration_method' => 'eye_drop',
                            'dosage' => 0.03,
                            'notes' => 'Primary vaccination - individual bird administration'
                        ],
                        [
                            'age_days' => 28,
                            'is_primary' => false,
                            'is_booster' => true,
                            'administration_method' => 'drinking_water',
                            'dosage' => 1.0,
                            'notes' => 'Booster vaccination for layers only'
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

            // Layer-specific vaccines
            [
                'name' => 'Infectious Coryza Prevention',
                'vaccine_name' => 'Coryza Bacterin',
                'vaccine_type' => 'killed',
                'description' => 'Inactivated vaccine for prevention of Infectious Coryza',
                'target_breeds' => ['Layer', 'Breeder'],
                'min_age_days' => 84,
                'max_age_days' => 112,
                'prevents_disease' => 'Infectious Coryza',
                'priority_level' => 'medium',
                'is_mandatory' => false,
                'dosage_per_bird' => 0.5,
                'dosage_unit' => 'ml',
                'administration_method' => 'subcutaneous',
                'vaccination_schedule' => [
                    'schedule_type' => 'age_based',
                    'vaccinations' => [
                        [
                            'age_days' => 84,
                            'is_primary' => true,
                            'is_booster' => false,
                            'administration_method' => 'subcutaneous',
                            'dosage' => 0.5,
                            'notes' => 'First vaccination before point of lay'
                        ],
                        [
                            'age_days' => 112,
                            'is_primary' => false,
                            'is_booster' => true,
                            'administration_method' => 'subcutaneous',
                            'dosage' => 0.5,
                            'notes' => 'Booster vaccination'
                        ]
                    ]
                ],
                'manufacturer' => 'Elanco',
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
                'name' => 'Egg Drop Syndrome Prevention',
                'vaccine_name' => 'EDS-76 Killed Vaccine',
                'vaccine_type' => 'killed',
                'description' => 'Inactivated vaccine for prevention of Egg Drop Syndrome',
                'target_breeds' => ['Layer', 'Breeder'],
                'min_age_days' => 112,
                'max_age_days' => 140,
                'prevents_disease' => 'Egg Drop Syndrome',
                'priority_level' => 'high',
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
                            'is_booster' => false,
                            'administration_method' => 'intramuscular',
                            'dosage' => 0.5,
                            'notes' => 'Single vaccination before point of lay'
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

            // Broiler-specific vaccines
            [
                'name' => 'Coccidiosis Live Vaccine',
                'vaccine_name' => 'Coccivac-B52',
                'vaccine_type' => 'live',
                'description' => 'Live oocyst vaccine for coccidiosis prevention',
                'target_breeds' => ['Broiler'],
                'min_age_days' => 1,
                'max_age_days' => 5,
                'prevents_disease' => 'Coccidiosis',
                'priority_level' => 'medium',
                'is_mandatory' => false,
                'dosage_per_bird' => 1.0,
                'dosage_unit' => 'dose',
                'administration_method' => 'oral',
                'vaccination_schedule' => [
                    'schedule_type' => 'age_based',
                    'vaccinations' => [
                        [
                            'age_days' => 1,
                            'is_primary' => true,
                            'is_booster' => false,
                            'administration_method' => 'oral',
                            'dosage' => 1.0,
                            'notes' => 'Hatchery spray or gel application'
                        ]
                    ]
                ],
                'manufacturer' => 'Merck',
                'storage_requirements' => [
                    'temperature_min' => 2,
                    'temperature_max' => 8,
                    'storage_type' => 'refrigerated'
                ],
                'auto_recommend' => false,
                'status' => 'active',
                'created_by' => $adminUser->id,
            ],

            // Optional/Regional vaccines
            [
                'name' => 'Fowl Pox Prevention',
                'vaccine_name' => 'Fowl Pox Vaccine',
                'vaccine_type' => 'live',
                'description' => 'Live vaccine for prevention of Fowl Pox',
                'target_breeds' => ['Layer', 'Breeder', 'Free-range'],
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
                            'is_booster' => false,
                            'administration_method' => 'subcutaneous',
                            'dosage' => 0.01,
                            'notes' => 'Wing web stab method'
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
                'name' => 'Avian Encephalomyelitis Prevention',
                'vaccine_name' => 'AE Live Vaccine',
                'vaccine_type' => 'live',
                'description' => 'Live vaccine for prevention of Avian Encephalomyelitis',
                'target_breeds' => ['Breeder'],
                'min_age_days' => 84,
                'max_age_days' => 112,
                'prevents_disease' => 'Avian Encephalomyelitis',
                'priority_level' => 'medium',
                'is_mandatory' => false,
                'dosage_per_bird' => 0.03,
                'dosage_unit' => 'ml',
                'administration_method' => 'eye_drop',
                'vaccination_schedule' => [
                    'schedule_type' => 'age_based',
                    'vaccinations' => [
                        [
                            'age_days' => 84,
                            'is_primary' => true,
                            'is_booster' => false,
                            'administration_method' => 'eye_drop',
                            'dosage' => 0.03,
                            'notes' => 'Single vaccination for breeding stock'
                        ]
                    ]
                ],
                'manufacturer' => 'Lohmann',
                'storage_requirements' => [
                    'temperature_min' => 2,
                    'temperature_max' => 8,
                    'storage_type' => 'refrigerated'
                ],
                'auto_recommend' => false,
                'status' => 'active',
                'created_by' => $adminUser->id,
            ],

            // Emergency/Outbreak vaccines
            [
                'name' => 'Avian Influenza Emergency Vaccine',
                'vaccine_name' => 'AI H5N1 Killed Vaccine',
                'vaccine_type' => 'killed',
                'description' => 'Emergency vaccine for Avian Influenza outbreak control',
                'target_breeds' => ['Broiler', 'Layer', 'Breeder', 'Duck', 'Turkey'],
                'min_age_days' => 21,
                'max_age_days' => 365,
                'prevents_disease' => 'Avian Influenza H5N1',
                'priority_level' => 'critical',
                'is_mandatory' => false,
                'dosage_per_bird' => 0.5,
                'dosage_unit' => 'ml',
                'administration_method' => 'subcutaneous',
                'vaccination_schedule' => [
                    'schedule_type' => 'emergency',
                    'vaccinations' => [
                        [
                            'age_days' => 21,
                            'is_primary' => true,
                            'is_booster' => false,
                            'administration_method' => 'subcutaneous',
                            'dosage' => 0.5,
                            'notes' => 'Emergency vaccination only during outbreaks'
                        ],
                        [
                            'age_days' => 42,
                            'is_primary' => false,
                            'is_booster' => true,
                            'administration_method' => 'subcutaneous',
                            'dosage' => 0.5,
                            'notes' => 'Booster if outbreak continues'
                        ]
                    ]
                ],
                'manufacturer' => 'Harbin Veterinary Research Institute',
                'storage_requirements' => [
                    'temperature_min' => 2,
                    'temperature_max' => 8,
                    'storage_type' => 'refrigerated'
                ],
                'auto_recommend' => false,
                'status' => 'inactive', // Only activated during outbreaks
                'created_by' => $adminUser->id,
            ],

            // Archived/Outdated vaccines
            [
                'name' => 'Old Newcastle Disease Vaccine',
                'vaccine_name' => 'ND B1 Vaccine (Outdated)',
                'vaccine_type' => 'live',
                'description' => 'DISCONTINUED: Older strain Newcastle Disease vaccine',
                'target_breeds' => ['Broiler', 'Layer'],
                'min_age_days' => 7,
                'max_age_days' => 14,
                'prevents_disease' => 'Newcastle Disease',
                'priority_level' => 'high',
                'is_mandatory' => false,
                'dosage_per_bird' => 0.03,
                'dosage_unit' => 'ml',
                'administration_method' => 'eye_drop',
                'vaccination_schedule' => [
                    'schedule_type' => 'age_based',
                    'vaccinations' => [
                        [
                            'age_days' => 7,
                            'is_primary' => true,
                            'is_booster' => false,
                            'administration_method' => 'eye_drop',
                            'dosage' => 0.03,
                            'notes' => 'Replaced by newer combination vaccines'
                        ]
                    ]
                ],
                'manufacturer' => 'Generic',
                'storage_requirements' => [
                    'temperature_min' => 2,
                    'temperature_max' => 8,
                    'storage_type' => 'refrigerated'
                ],
                'auto_recommend' => false,
                'status' => 'inactive',
                'created_by' => $adminUser->id,
            ],
        ];

        foreach ($vaccinations as $vaccination) {
            VaccinationProtocol::create($vaccination);
        }

        $this->command->info('Created ' . count($vaccinations) . ' vaccination protocols');
    }
}
