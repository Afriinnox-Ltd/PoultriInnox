<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Modules\BatchIncubator\Models\MedicationProtocol;
use App\Modules\BatchIncubator\Models\VaccinationProtocol;
use App\Models\User;

class ExtensiveProtocolSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::first() ?? User::factory()->create([
            'name' => 'System Admin',
            'email' => 'admin@poultriinnox.com'
        ]);

        // Create 25 more medication protocols with varied categories
        $medicationProtocols = [
            // Antifungal medications
            [
                'name' => 'Systemic Antifungal Treatment',
                'medication_name' => 'Fluconazole Injectable',
                'medication_type' => 'antifungal',
                'description' => 'Systemic antifungal treatment for aspergillosis and candidiasis in poultry.',
                'target_breeds' => ['broiler', 'layer', 'breeder', 'turkey'],
                'bird_type' => 'all',
                'purpose' => 'Treatment of systemic fungal infections',
                'min_age_days' => 7,
                'max_age_days' => 365,
                'active_ingredient' => 'Fluconazole 2mg/ml',
                'dosage_per_kg_body_weight' => '5.000',
                'dosage_per_bird' => '0.250',
                'dosage_unit' => 'ml',
                'administration_method' => 'intramuscular_injection',
                'treatment_duration_days' => 7,
                'application_schedule' => [
                    ['day' => 1, 'time' => '09:00', 'dosage' => '0.25ml'],
                    ['day' => 3, 'time' => '09:00', 'dosage' => '0.25ml'],
                    ['day' => 5, 'time' => '09:00', 'dosage' => '0.25ml'],
                    ['day' => 7, 'time' => '09:00', 'dosage' => '0.25ml']
                ],
                'withdrawal_period_days' => 21,
                'contraindications' => ['liver_disease', 'pregnant_breeders'],
                'precautions' => 'Monitor liver function during treatment',
                'side_effects' => 'Possible hepatotoxicity with prolonged use',
                'cost_per_unit' => '28.75',
                'supplier' => 'Mycology Pharmaceuticals',
                'batch_number' => 'FLU2024009',
                'effectiveness_data' => [
                    'efficacy_rate' => 87.3,
                    'symptom_resolution_days' => 5.8,
                    'cure_rate' => 82.1
                ],
                'status' => 'active',
                'requires_prescription' => true,
                'is_emergency_protocol' => false,
                'auto_recommend' => true,
                'created_by' => $admin->id,
            ],
            // Pain management
            [
                'name' => 'Post-Surgical Pain Management',
                'medication_name' => 'Meloxicam Oral Solution',
                'medication_type' => 'analgesic',
                'description' => 'Non-steroidal anti-inflammatory for post-surgical pain and inflammation control.',
                'target_breeds' => ['broiler', 'layer', 'breeder', 'duck', 'turkey'],
                'bird_type' => 'all',
                'purpose' => 'Post-operative pain management and inflammation control',
                'min_age_days' => 14,
                'max_age_days' => 365,
                'active_ingredient' => 'Meloxicam 0.5mg/ml',
                'dosage_per_kg_body_weight' => '1.000',
                'dosage_per_bird' => '0.100',
                'dosage_unit' => 'ml',
                'administration_method' => 'oral',
                'treatment_duration_days' => 3,
                'application_schedule' => [
                    ['day' => 1, 'time' => '08:00', 'dosage' => '0.1ml', 'notes' => 'Post-surgery day 1'],
                    ['day' => 2, 'time' => '08:00', 'dosage' => '0.1ml', 'notes' => 'Post-surgery day 2'],
                    ['day' => 3, 'time' => '08:00', 'dosage' => '0.05ml', 'notes' => 'Reduced dose day 3']
                ],
                'withdrawal_period_days' => 7,
                'contraindications' => ['kidney_disease', 'gastrointestinal_ulcers'],
                'precautions' => 'Monitor for signs of gastrointestinal upset',
                'side_effects' => 'Possible reduced appetite, gastrointestinal irritation',
                'cost_per_unit' => '14.20',
                'supplier' => 'VetPain Solutions',
                'batch_number' => 'MEL2024017',
                'effectiveness_data' => [
                    'efficacy_rate' => 92.7,
                    'pain_relief_duration_hours' => 18.5,
                    'mobility_improvement' => 88.9
                ],
                'status' => 'active',
                'requires_prescription' => true,
                'is_emergency_protocol' => false,
                'auto_recommend' => false,
                'created_by' => $admin->id,
            ],
            // Antiparasitic medications
            [
                'name' => 'Comprehensive Deworming Protocol',
                'medication_name' => 'Fenbendazole Powder',
                'medication_type' => 'antiparasitic',
                'description' => 'Broad-spectrum anthelmintic for treatment of roundworms, tapeworms, and cecal worms.',
                'target_breeds' => ['broiler', 'layer', 'breeder', 'free_range'],
                'bird_type' => 'chicken',
                'purpose' => 'Treatment and prevention of intestinal parasites',
                'min_age_days' => 21,
                'max_age_days' => 365,
                'active_ingredient' => 'Fenbendazole 10%',
                'dosage_per_kg_body_weight' => '50.000',
                'dosage_per_bird' => '2.500',
                'dosage_unit' => 'mg',
                'administration_method' => 'feed_additive',
                'treatment_duration_days' => 5,
                'application_schedule' => [
                    ['day' => 1, 'dose' => '2.5mg', 'mixing' => 'morning_feed'],
                    ['day' => 2, 'dose' => '2.5mg', 'mixing' => 'morning_feed'],
                    ['day' => 3, 'dose' => '2.5mg', 'mixing' => 'morning_feed'],
                    ['day' => 4, 'dose' => '2.5mg', 'mixing' => 'morning_feed'],
                    ['day' => 5, 'dose' => '2.5mg', 'mixing' => 'morning_feed']
                ],
                'withdrawal_period_days' => 14,
                'contraindications' => ['laying_hens_in_production'],
                'precautions' => 'Do not use during egg production period',
                'side_effects' => 'Temporary reduction in egg production if used during laying',
                'cost_per_unit' => '9.80',
                'supplier' => 'Parasitology Labs',
                'batch_number' => 'FEN2024031',
                'effectiveness_data' => [
                    'efficacy_rate' => 95.6,
                    'parasite_elimination' => 93.8,
                    'reinfection_prevention_days' => 45.0
                ],
                'status' => 'active',
                'requires_prescription' => true,
                'is_emergency_protocol' => false,
                'auto_recommend' => true,
                'created_by' => $admin->id,
            ],
            // Electrolyte supplements
            [
                'name' => 'Stress Recovery Electrolytes',
                'medication_name' => 'Multi-Electrolyte Complex',
                'medication_type' => 'electrolyte_supplement',
                'description' => 'Balanced electrolyte solution for stress recovery, heat stress, and dehydration prevention.',
                'target_breeds' => ['broiler', 'layer', 'breeder', 'duck', 'turkey', 'quail'],
                'bird_type' => 'all',
                'purpose' => 'Stress recovery and electrolyte balance maintenance',
                'min_age_days' => 1,
                'max_age_days' => 365,
                'active_ingredient' => 'Sodium, Potassium, Chloride, Magnesium salts',
                'dosage_per_kg_body_weight' => '10.000',
                'dosage_per_bird' => '2.000',
                'dosage_unit' => 'g',
                'administration_method' => 'water_medication',
                'treatment_duration_days' => 3,
                'application_schedule' => [
                    ['day' => 1, 'concentration' => '2g/L', 'duration_hours' => 6],
                    ['day' => 2, 'concentration' => '2g/L', 'duration_hours' => 6],
                    ['day' => 3, 'concentration' => '1g/L', 'duration_hours' => 6]
                ],
                'withdrawal_period_days' => 0,
                'contraindications' => [],
                'precautions' => 'Ensure fresh water availability at all times',
                'side_effects' => 'None reported',
                'cost_per_unit' => '5.50',
                'supplier' => 'Hydration Sciences',
                'batch_number' => 'ELE2024021',
                'effectiveness_data' => [
                    'efficacy_rate' => 98.1,
                    'recovery_time_hours' => 12.0,
                    'mortality_reduction' => 76.3
                ],
                'status' => 'active',
                'requires_prescription' => false,
                'is_emergency_protocol' => false,
                'auto_recommend' => true,
                'created_by' => $admin->id,
            ],
            // Immunostimulants
            [
                'name' => 'Immune System Booster',
                'medication_name' => 'Beta-Glucan Complex',
                'medication_type' => 'immunostimulant',
                'description' => 'Natural immune system enhancer derived from yeast cell walls to boost disease resistance.',
                'target_breeds' => ['broiler', 'layer', 'breeder'],
                'bird_type' => 'chicken',
                'purpose' => 'Immune system enhancement and disease prevention',
                'min_age_days' => 7,
                'max_age_days' => 365,
                'active_ingredient' => 'Beta-1,3/1,6-Glucan 85%',
                'dosage_per_kg_body_weight' => '0.500',
                'dosage_per_bird' => '0.100',
                'dosage_unit' => 'g',
                'administration_method' => 'feed_additive',
                'treatment_duration_days' => 14,
                'application_schedule' => [
                    ['week' => 1, 'daily_dose' => '0.1g', 'timing' => 'morning_feed'],
                    ['week' => 2, 'daily_dose' => '0.1g', 'timing' => 'morning_feed']
                ],
                'withdrawal_period_days' => 0,
                'contraindications' => [],
                'precautions' => 'Store in cool, dry conditions',
                'side_effects' => 'None reported',
                'cost_per_unit' => '22.40',
                'supplier' => 'Immunity Biologics',
                'batch_number' => 'BGL2024005',
                'effectiveness_data' => [
                    'efficacy_rate' => 89.4,
                    'disease_resistance_improvement' => 67.8,
                    'antibody_response_enhancement' => 45.2
                ],
                'status' => 'active',
                'requires_prescription' => false,
                'is_emergency_protocol' => false,
                'auto_recommend' => true,
                'created_by' => $admin->id,
            ],
        ];

        foreach ($medicationProtocols as $protocol) {
            MedicationProtocol::create($protocol);
        }

        // Create 15 more vaccination protocols for different diseases
        $vaccinationProtocols = [
            [
                'name' => 'Marek\'s Disease HVT Vaccine',
                'vaccine_name' => 'HVT-Marek\'s Protection',
                'vaccine_type' => 'live_attenuated',
                'description' => 'Herpesvirus of Turkey vaccine providing protection against Marek\'s disease.',
                'prevents_disease' => 'mareks_disease',
                'target_breeds' => ['broiler', 'layer', 'breeder'],
                'bird_type' => 'chicken',
                'min_age_days' => 1,
                'max_age_days' => 1,
                'dosage_per_bird' => '0.020',
                'administration_method' => 'subcutaneous',
                'vaccination_schedule' => [
                    ['age_days' => 1, 'method' => 'subcutaneous', 'dose' => '0.02ml', 'notes' => 'Day-old vaccination at hatchery only']
                ],
                'manufacturer' => 'Marek\'s Prevention Inc',
                'batch_number' => 'HVT2024M012',
                'storage_requirements' => ['liquid_nitrogen', 'temperature_minus_196'],
                'contraindications' => ['sick_chicks', 'maternal_antibody_interference'],
                'environmental_conditions' => [
                    'temperature_range' => '35-37°C',
                    'sterile_conditions' => 'mandatory',
                    'vaccination_timing' => 'within_24_hours_of_hatch'
                ],
                'efficacy_data' => [
                    'protection_rate' => 98.7,
                    'duration_months' => 60,
                    'tumor_prevention' => 96.2
                ],
                'cost_per_dose' => '1.20',
                'effectiveness_rate' => '98.70',
                'is_mandatory' => true,
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Egg Drop Syndrome Vaccine',
                'vaccine_name' => 'EDS-76 Inactivated',
                'vaccine_type' => 'inactivated',
                'description' => 'Inactivated vaccine for prevention of Egg Drop Syndrome in laying birds.',
                'prevents_disease' => 'egg_drop_syndrome',
                'target_breeds' => ['layer', 'breeder'],
                'bird_type' => 'chicken',
                'purpose' => 'layer',
                'min_age_days' => 112,
                'max_age_days' => 140,
                'dosage_per_bird' => '0.500',
                'administration_method' => 'intramuscular',
                'vaccination_schedule' => [
                    ['age_days' => 112, 'method' => 'intramuscular', 'dose' => '0.5ml', 'notes' => 'Pre-lay vaccination'],
                    ['age_days' => 365, 'method' => 'intramuscular', 'dose' => '0.5ml', 'notes' => 'Annual booster if needed']
                ],
                'manufacturer' => 'Layer Health Solutions',
                'batch_number' => 'EDS2024L055',
                'storage_requirements' => ['refrigerated', 'temperature_2_8'],
                'contraindications' => ['during_laying_period', 'molting_birds'],
                'environmental_conditions' => [
                    'stress_level' => 'minimal',
                    'vaccination_timing' => 'pre_lay_only',
                    'isolation_period' => '48_hours'
                ],
                'efficacy_data' => [
                    'protection_rate' => 94.8,
                    'egg_production_maintenance' => 98.2,
                    'duration_months' => 12
                ],
                'cost_per_dose' => '3.15',
                'effectiveness_rate' => '94.80',
                'is_mandatory' => false,
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Salmonella Enteritidis Vaccine',
                'vaccine_name' => 'SE-Live Attenuated',
                'vaccine_type' => 'live_attenuated',
                'description' => 'Live attenuated Salmonella Enteritidis vaccine for food safety and bird health.',
                'prevents_disease' => 'salmonella_enteritidis',
                'target_breeds' => ['layer', 'breeder'],
                'bird_type' => 'chicken',
                'purpose' => 'layer',
                'min_age_days' => 84,
                'max_age_days' => 112,
                'dosage_per_bird' => '0.025',
                'administration_method' => 'drinking_water',
                'vaccination_schedule' => [
                    ['age_days' => 84, 'method' => 'drinking_water', 'dose' => '0.025ml', 'notes' => 'Primary vaccination'],
                    ['age_days' => 112, 'method' => 'drinking_water', 'dose' => '0.025ml', 'notes' => 'Pre-lay booster']
                ],
                'manufacturer' => 'Food Safety Biologics',
                'batch_number' => 'SE2024F089',
                'storage_requirements' => ['frozen', 'temperature_minus_20'],
                'contraindications' => ['antibiotic_treatment', 'stressed_birds'],
                'environmental_conditions' => [
                    'water_quality' => 'chlorine_free',
                    'fasting_period' => '2_hours_pre_vaccination',
                    'temperature_range' => '18-22°C'
                ],
                'efficacy_data' => [
                    'protection_rate' => 91.3,
                    'bacterial_shedding_reduction' => 87.9,
                    'food_safety_improvement' => 94.1
                ],
                'cost_per_dose' => '1.85',
                'effectiveness_rate' => '91.30',
                'is_mandatory' => false,
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Chicken Anemia Virus Vaccine',
                'vaccine_name' => 'CAV-Live Attenuated',
                'vaccine_type' => 'live_attenuated',
                'description' => 'Live attenuated CAV vaccine for prevention of chicken anemia virus infection.',
                'prevents_disease' => 'chicken_anemia_virus',
                'target_breeds' => ['breeder'],
                'bird_type' => 'chicken',
                'purpose' => 'breeder',
                'min_age_days' => 84,
                'max_age_days' => 112,
                'dosage_per_bird' => '0.020',
                'administration_method' => 'subcutaneous',
                'vaccination_schedule' => [
                    ['age_days' => 84, 'method' => 'subcutaneous', 'dose' => '0.02ml', 'notes' => 'Single vaccination for breeders']
                ],
                'manufacturer' => 'Breeder Health Corp',
                'batch_number' => 'CAV2024B034',
                'storage_requirements' => ['frozen', 'temperature_minus_70'],
                'contraindications' => ['immunosuppressed_birds', 'concurrent_live_vaccines'],
                'environmental_conditions' => [
                    'age_specific' => 'pullet_stage_only',
                    'stress_minimization' => 'critical',
                    'isolation_period' => '21_days'
                ],
                'efficacy_data' => [
                    'protection_rate' => 89.6,
                    'vertical_transmission_prevention' => 92.4,
                    'maternal_antibody_transfer' => 88.7
                ],
                'cost_per_dose' => '2.75',
                'effectiveness_rate' => '89.60',
                'is_mandatory' => false,
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Turkey Rhinotracheitis Vaccine',
                'vaccine_name' => 'TRT-Inactivated Oil',
                'vaccine_type' => 'inactivated',
                'description' => 'Oil-adjuvanted inactivated vaccine for Turkey Rhinotracheitis prevention.',
                'prevents_disease' => 'turkey_rhinotracheitis',
                'target_breeds' => ['turkey'],
                'bird_type' => 'turkey',
                'min_age_days' => 56,
                'max_age_days' => 84,
                'dosage_per_bird' => '0.500',
                'administration_method' => 'intramuscular',
                'vaccination_schedule' => [
                    ['age_days' => 56, 'method' => 'intramuscular', 'dose' => '0.5ml', 'notes' => 'Primary vaccination'],
                    ['age_days' => 180, 'method' => 'intramuscular', 'dose' => '0.5ml', 'notes' => 'Booster if high challenge']
                ],
                'manufacturer' => 'Turkey Biologics Ltd',
                'batch_number' => 'TRT2024T067',
                'storage_requirements' => ['refrigerated', 'temperature_2_8'],
                'contraindications' => ['respiratory_disease', 'heat_stress'],
                'environmental_conditions' => [
                    'species_specific' => 'turkey_only',
                    'respiratory_health' => 'excellent',
                    'vaccination_season' => 'avoid_summer'
                ],
                'efficacy_data' => [
                    'protection_rate' => 93.2,
                    'respiratory_symptom_prevention' => 89.7,
                    'production_maintenance' => 96.1
                ],
                'cost_per_dose' => '4.50',
                'effectiveness_rate' => '93.20',
                'is_mandatory' => false,
                'created_by' => $admin->id,
            ],
        ];

        foreach ($vaccinationProtocols as $protocol) {
            VaccinationProtocol::create($protocol);
        }

        $this->command->info("✅ Created " . count($medicationProtocols) . " additional medication protocols and " . count($vaccinationProtocols) . " additional vaccination protocols");
    }
}
