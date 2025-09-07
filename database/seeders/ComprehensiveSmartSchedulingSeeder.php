<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Modules\BatchIncubator\Models\MedicationProtocol;
use App\Modules\BatchIncubator\Models\VaccinationProtocol;
use App\Models\User;

class ComprehensiveSmartSchedulingSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::first() ?? User::factory()->create([
            'name' => 'System Admin',
            'email' => 'admin@poultriinnox.com'
        ]);

        // Create 15 comprehensive medication protocols
        $medicationProtocols = [
            [
                'name' => 'Emergency Antibiotic Protocol',
                'medication_name' => 'Enrofloxacin Injectable',
                'medication_type' => 'antibiotic',
                'description' => 'Fast-acting injectable antibiotic for severe bacterial infections including E.coli, Salmonella, and Pasteurella outbreaks.',
                'target_breeds' => ['broiler', 'layer', 'duck', 'turkey'],
                'bird_type' => 'all',
                'purpose' => 'Treatment of severe bacterial infections with rapid onset',
                'min_age_days' => 1,
                'max_age_days' => 365,
                'active_ingredient' => 'Enrofloxacin 10%',
                'dosage_per_kg_body_weight' => '10.000',
                'dosage_per_bird' => '0.100',
                'dosage_unit' => 'ml',
                'administration_method' => 'subcutaneous_injection',
                'treatment_duration_days' => 3,
                'application_schedule' => [
                    ['day' => 1, 'time' => '08:00', 'dosage' => '0.1ml', 'notes' => 'Initial dose'],
                    ['day' => 2, 'time' => '08:00', 'dosage' => '0.1ml', 'notes' => 'Second dose'],
                    ['day' => 3, 'time' => '08:00', 'dosage' => '0.1ml', 'notes' => 'Final dose']
                ],
                'withdrawal_period_days' => 14,
                'contraindications' => ['pregnant_breeders', 'laying_hens', 'kidney_disease'],
                'precautions' => 'Monitor for injection site reactions',
                'side_effects' => 'Possible temporary appetite loss',
                'cost_per_unit' => '15.50',
                'supplier' => 'VetCorp Pharmaceuticals',
                'batch_number' => 'ENR2024001',
                'effectiveness_data' => [
                    'efficacy_rate' => 92.5,
                    'mortality_reduction' => 85.0,
                    'recovery_time_days' => 4.2
                ],
                'status' => 'active',
                'requires_prescription' => true,
                'is_emergency_protocol' => true,
                'auto_recommend' => false,
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Respiratory Support Treatment',
                'medication_name' => 'Tylosin Phosphate',
                'medication_type' => 'antibiotic',
                'description' => 'Specialized treatment for chronic respiratory disease (CRD) and mycoplasma infections in poultry.',
                'target_breeds' => ['broiler', 'layer', 'breeder'],
                'bird_type' => 'chicken',
                'purpose' => 'Treatment of respiratory infections and CRD',
                'min_age_days' => 7,
                'max_age_days' => 300,
                'active_ingredient' => 'Tylosin phosphate 20%',
                'dosage_per_kg_body_weight' => '15.000',
                'dosage_per_bird' => '0.200',
                'dosage_unit' => 'mg',
                'administration_method' => 'water_medication',
                'treatment_duration_days' => 5,
                'application_schedule' => [
                    ['day' => 1, 'concentration' => '500mg/L', 'duration_hours' => 8],
                    ['day' => 2, 'concentration' => '500mg/L', 'duration_hours' => 8],
                    ['day' => 3, 'concentration' => '400mg/L', 'duration_hours' => 8],
                    ['day' => 4, 'concentration' => '400mg/L', 'duration_hours' => 8],
                    ['day' => 5, 'concentration' => '300mg/L', 'duration_hours' => 8]
                ],
                'withdrawal_period_days' => 21,
                'contraindications' => ['severe_kidney_disease', 'liver_dysfunction'],
                'precautions' => 'Ensure adequate water intake during treatment',
                'side_effects' => 'Possible reduced feed intake in first 24 hours',
                'cost_per_unit' => '8.75',
                'supplier' => 'AgriHealth Solutions',
                'batch_number' => 'TYL2024015',
                'effectiveness_data' => [
                    'efficacy_rate' => 88.3,
                    'symptom_improvement_days' => 3.5,
                    'relapse_rate' => 12.1
                ],
                'status' => 'active',
                'requires_prescription' => true,
                'is_emergency_protocol' => false,
                'auto_recommend' => true,
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Digestive Health Probiotic',
                'medication_name' => 'Multi-strain Probiotic Complex',
                'medication_type' => 'probiotic',
                'description' => 'Advanced multi-strain probiotic supplement to maintain gut health and prevent digestive disorders.',
                'target_breeds' => ['broiler', 'layer', 'duck', 'turkey', 'quail'],
                'bird_type' => 'all',
                'purpose' => 'Digestive health maintenance and disease prevention',
                'min_age_days' => 1,
                'max_age_days' => 365,
                'active_ingredient' => 'Lactobacillus, Bifidobacterium, Enterococcus blend',
                'dosage_per_kg_body_weight' => '5.000',
                'dosage_per_bird' => '1.000',
                'dosage_unit' => 'g',
                'administration_method' => 'feed_additive',
                'treatment_duration_days' => 30,
                'application_schedule' => [
                    ['week' => 1, 'daily_dose' => '1g', 'timing' => 'morning_feed'],
                    ['week' => 2, 'daily_dose' => '1g', 'timing' => 'morning_feed'],
                    ['week' => 3, 'daily_dose' => '0.8g', 'timing' => 'morning_feed'],
                    ['week' => 4, 'daily_dose' => '0.5g', 'timing' => 'morning_feed']
                ],
                'withdrawal_period_days' => 0,
                'contraindications' => [],
                'precautions' => 'Store in cool, dry place',
                'side_effects' => 'None reported',
                'cost_per_unit' => '12.20',
                'supplier' => 'BioHealth Nutrition',
                'batch_number' => 'PRB2024008',
                'effectiveness_data' => [
                    'efficacy_rate' => 94.7,
                    'digestive_improvement' => 89.2,
                    'feed_conversion_improvement' => 8.5
                ],
                'status' => 'active',
                'requires_prescription' => false,
                'is_emergency_protocol' => false,
                'auto_recommend' => true,
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Anti-Coccidial Treatment',
                'medication_name' => 'Amprolium Hydrochloride',
                'medication_type' => 'anticoccidial',
                'description' => 'Effective treatment for coccidiosis in young birds with proven track record.',
                'target_breeds' => ['broiler', 'layer'],
                'bird_type' => 'chicken',
                'purpose' => 'Treatment and prevention of coccidiosis',
                'min_age_days' => 3,
                'max_age_days' => 42,
                'active_ingredient' => 'Amprolium HCl 20%',
                'dosage_per_kg_body_weight' => '25.000',
                'dosage_per_bird' => '0.125',
                'dosage_unit' => 'mg',
                'administration_method' => 'water_medication',
                'treatment_duration_days' => 7,
                'application_schedule' => [
                    ['day' => 1, 'concentration' => '125mg/L', 'duration_hours' => 24],
                    ['day' => 2, 'concentration' => '125mg/L', 'duration_hours' => 24],
                    ['day' => 3, 'concentration' => '125mg/L', 'duration_hours' => 24],
                    ['day' => 4, 'concentration' => '62.5mg/L', 'duration_hours' => 24],
                    ['day' => 5, 'concentration' => '62.5mg/L', 'duration_hours' => 24],
                    ['day' => 6, 'concentration' => '62.5mg/L', 'duration_hours' => 24],
                    ['day' => 7, 'concentration' => '31.25mg/L', 'duration_hours' => 24]
                ],
                'withdrawal_period_days' => 7,
                'contraindications' => ['severe_dehydration', 'kidney_failure'],
                'precautions' => 'Monitor water consumption closely',
                'side_effects' => 'Temporary reduction in appetite',
                'cost_per_unit' => '6.50',
                'supplier' => 'PoultryMed Inc.',
                'batch_number' => 'AMP2024022',
                'effectiveness_data' => [
                    'efficacy_rate' => 91.8,
                    'oocyst_reduction' => 96.3,
                    'mortality_prevention' => 88.7
                ],
                'status' => 'active',
                'requires_prescription' => true,
                'is_emergency_protocol' => false,
                'auto_recommend' => true,
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Vitamin Deficiency Correction',
                'medication_name' => 'Multi-Vitamin Injectable',
                'medication_type' => 'vitamin_supplement',
                'description' => 'Comprehensive vitamin supplement for deficiency correction and stress recovery.',
                'target_breeds' => ['broiler', 'layer', 'breeder', 'duck', 'turkey'],
                'bird_type' => 'all',
                'purpose' => 'Vitamin deficiency correction and stress management',
                'min_age_days' => 1,
                'max_age_days' => 365,
                'active_ingredient' => 'Vitamins A, D3, E, B-complex, C',
                'dosage_per_kg_body_weight' => '1.000',
                'dosage_per_bird' => '0.050',
                'dosage_unit' => 'ml',
                'administration_method' => 'intramuscular_injection',
                'treatment_duration_days' => 1,
                'application_schedule' => [
                    ['day' => 1, 'time' => '09:00', 'dosage' => '0.05ml', 'site' => 'breast_muscle']
                ],
                'withdrawal_period_days' => 0,
                'contraindications' => ['vitamin_toxicity', 'hypersensitivity'],
                'precautions' => 'Use sterile injection technique',
                'side_effects' => 'Mild injection site swelling possible',
                'cost_per_unit' => '4.25',
                'supplier' => 'NutriVet Products',
                'batch_number' => 'MVT2024011',
                'effectiveness_data' => [
                    'efficacy_rate' => 97.2,
                    'recovery_time_hours' => 48.0,
                    'symptom_resolution' => 94.5
                ],
                'status' => 'active',
                'requires_prescription' => false,
                'is_emergency_protocol' => false,
                'auto_recommend' => true,
                'created_by' => $admin->id,
            ],
            // Add 10 more comprehensive medication protocols
            [
                'name' => 'Growth Promoter Natural',
                'medication_name' => 'Herbal Growth Complex',
                'medication_type' => 'growth_promoter',
                'description' => 'Natural herbal blend to promote healthy growth and improve feed conversion rates.',
                'target_breeds' => ['broiler', 'turkey'],
                'bird_type' => 'meat_birds',
                'purpose' => 'Natural growth promotion and feed efficiency',
                'min_age_days' => 7,
                'max_age_days' => 42,
                'active_ingredient' => 'Ginseng, Echinacea, Spirulina extract',
                'dosage_per_kg_body_weight' => '2.000',
                'dosage_per_bird' => '0.500',
                'dosage_unit' => 'g',
                'administration_method' => 'feed_additive',
                'treatment_duration_days' => 35,
                'application_schedule' => [
                    ['week' => 1, 'daily_dose' => '0.3g', 'timing' => 'morning_feed'],
                    ['week' => 2, 'daily_dose' => '0.4g', 'timing' => 'morning_feed'],
                    ['week' => 3, 'daily_dose' => '0.5g', 'timing' => 'morning_feed'],
                    ['week' => 4, 'daily_dose' => '0.5g', 'timing' => 'morning_feed'],
                    ['week' => 5, 'daily_dose' => '0.4g', 'timing' => 'morning_feed']
                ],
                'withdrawal_period_days' => 0,
                'contraindications' => [],
                'precautions' => 'Mix thoroughly with feed',
                'side_effects' => 'None reported',
                'cost_per_unit' => '18.90',
                'supplier' => 'Natural Poultry Solutions',
                'batch_number' => 'HGC2024003',
                'effectiveness_data' => [
                    'efficacy_rate' => 86.4,
                    'weight_gain_improvement' => 12.7,
                    'fcr_improvement' => 9.2
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

        // Create 15 comprehensive vaccination protocols
        $vaccinationProtocols = [
            [
                'name' => 'Newcastle Disease Live Vaccine',
                'vaccine_name' => 'NDV-LaSota Strain',
                'vaccine_type' => 'live_attenuated',
                'description' => 'Live attenuated Newcastle Disease vaccine providing strong immunity against velogenic strains.',
                'prevents_disease' => 'newcastle_disease',
                'target_breeds' => ['broiler', 'layer', 'breeder'],
                'bird_type' => 'chicken',
                'min_age_days' => 14,
                'max_age_days' => 365,
                'dosage_per_bird' => '0.030',
                'administration_method' => 'eye_drop',
                'vaccination_schedule' => [
                    ['age_days' => 14, 'method' => 'eye_drop', 'dose' => '0.03ml', 'notes' => 'Primary vaccination'],
                    ['age_days' => 35, 'method' => 'drinking_water', 'dose' => '0.03ml', 'notes' => 'Booster dose'],
                    ['age_days' => 120, 'method' => 'intramuscular', 'dose' => '0.5ml', 'notes' => 'Annual booster']
                ],
                'manufacturer' => 'BioVet International',
                'batch_number' => 'NDV2024L078',
                'storage_requirements' => ['frozen', 'temperature_minus_20'],
                'contraindications' => ['sick_birds', 'stressed_flocks', 'egg_production_peak'],
                'environmental_conditions' => [
                    'temperature_range' => '18-25°C',
                    'humidity_max' => 70,
                    'ventilation' => 'adequate'
                ],
                'efficacy_data' => [
                    'protection_rate' => 96.8,
                    'duration_months' => 12,
                    'antibody_response' => 94.2
                ],
                'cost_per_dose' => '0.85',
                'effectiveness_rate' => '96.80',
                'is_mandatory' => true,
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Infectious Bursal Disease Vaccine',
                'vaccine_name' => 'IBD Intermediate Plus',
                'vaccine_type' => 'intermediate',
                'description' => 'Intermediate strain IBD vaccine for bursa protection in areas with high field challenge.',
                'prevents_disease' => 'infectious_bursal_disease',
                'target_breeds' => ['broiler', 'layer'],
                'bird_type' => 'chicken',
                'min_age_days' => 10,
                'max_age_days' => 21,
                'dosage_per_bird' => '0.025',
                'administration_method' => 'drinking_water',
                'vaccination_schedule' => [
                    ['age_days' => 10, 'method' => 'drinking_water', 'dose' => '0.025ml', 'notes' => 'Early protection'],
                    ['age_days' => 18, 'method' => 'drinking_water', 'dose' => '0.025ml', 'notes' => 'Second dose for full immunity']
                ],
                'manufacturer' => 'Poultry Health Corp',
                'batch_number' => 'IBD2024I045',
                'storage_requirements' => ['refrigerated', 'temperature_2_8'],
                'contraindications' => ['maternal_antibody_interference', 'concurrent_medication'],
                'environmental_conditions' => [
                    'temperature_range' => '20-24°C',
                    'humidity_max' => 65,
                    'stress_level' => 'low'
                ],
                'efficacy_data' => [
                    'protection_rate' => 92.5,
                    'duration_weeks' => 8,
                    'bursa_protection' => 89.7
                ],
                'cost_per_dose' => '0.65',
                'effectiveness_rate' => '92.50',
                'is_mandatory' => true,
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Avian Influenza H9N2 Vaccine',
                'vaccine_name' => 'AI-H9N2 Inactivated',
                'vaccine_type' => 'inactivated',
                'description' => 'Inactivated H9N2 avian influenza vaccine for prevention of low pathogenic AI.',
                'prevents_disease' => 'avian_influenza_h9n2',
                'target_breeds' => ['layer', 'breeder'],
                'bird_type' => 'chicken',
                'min_age_days' => 42,
                'max_age_days' => 365,
                'dosage_per_bird' => '0.500',
                'administration_method' => 'subcutaneous',
                'vaccination_schedule' => [
                    ['age_days' => 42, 'method' => 'subcutaneous', 'dose' => '0.5ml', 'notes' => 'Primary vaccination'],
                    ['age_days' => 120, 'method' => 'subcutaneous', 'dose' => '0.5ml', 'notes' => 'Pre-lay booster'],
                    ['age_days' => 365, 'method' => 'subcutaneous', 'dose' => '0.5ml', 'notes' => 'Annual booster']
                ],
                'manufacturer' => 'Global Vaccines Ltd',
                'batch_number' => 'AIH9-2024K033',
                'storage_requirements' => ['refrigerated', 'temperature_2_8', 'protect_from_light'],
                'contraindications' => ['concurrent_live_vaccines', 'immunosuppressed_birds'],
                'environmental_conditions' => [
                    'temperature_range' => '18-22°C',
                    'stress_minimization' => 'critical',
                    'isolation_post_vaccination' => '24_hours'
                ],
                'efficacy_data' => [
                    'protection_rate' => 88.9,
                    'duration_months' => 6,
                    'haemagglutination_inhibition' => 85.3
                ],
                'cost_per_dose' => '2.40',
                'effectiveness_rate' => '88.90',
                'is_mandatory' => false,
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Infectious Bronchitis Multi-strain',
                'vaccine_name' => 'IB-Mass+4/91+QX',
                'vaccine_type' => 'live_attenuated',
                'description' => 'Multi-strain IB vaccine protecting against Massachusetts, 4/91, and QX variants.',
                'prevents_disease' => 'infectious_bronchitis',
                'target_breeds' => ['broiler', 'layer', 'breeder'],
                'bird_type' => 'chicken',
                'min_age_days' => 1,
                'max_age_days' => 365,
                'dosage_per_bird' => '0.020',
                'administration_method' => 'spray',
                'vaccination_schedule' => [
                    ['age_days' => 1, 'method' => 'spray', 'dose' => '0.02ml', 'notes' => 'Hatchery vaccination'],
                    ['age_days' => 14, 'method' => 'eye_drop', 'dose' => '0.02ml', 'notes' => 'First booster'],
                    ['age_days' => 28, 'method' => 'drinking_water', 'dose' => '0.02ml', 'notes' => 'Second booster'],
                    ['age_days' => 120, 'method' => 'intramuscular', 'dose' => '0.5ml', 'notes' => 'Inactivated booster']
                ],
                'manufacturer' => 'VetBio Sciences',
                'batch_number' => 'IB2024M067',
                'storage_requirements' => ['frozen', 'temperature_minus_70', 'dry_ice_transport'],
                'contraindications' => ['respiratory_disease', 'concurrent_stress'],
                'environmental_conditions' => [
                    'temperature_range' => '20-25°C',
                    'humidity_max' => 60,
                    'air_quality' => 'excellent'
                ],
                'efficacy_data' => [
                    'protection_rate' => 94.1,
                    'cross_protection' => 87.6,
                    'duration_months' => 10
                ],
                'cost_per_dose' => '0.75',
                'effectiveness_rate' => '94.10',
                'is_mandatory' => true,
                'created_by' => $admin->id,
            ],
            [
                'name' => 'Fowl Pox Vaccine',
                'vaccine_name' => 'FP-Live Attenuated',
                'vaccine_type' => 'live_attenuated',
                'description' => 'Live fowl pox vaccine for long-lasting immunity against pox virus.',
                'prevents_disease' => 'fowl_pox',
                'target_breeds' => ['layer', 'breeder', 'free_range'],
                'bird_type' => 'chicken',
                'min_age_days' => 56,
                'max_age_days' => 84,
                'dosage_per_bird' => '0.010',
                'administration_method' => 'wing_web',
                'vaccination_schedule' => [
                    ['age_days' => 56, 'method' => 'wing_web', 'dose' => '0.01ml', 'notes' => 'Single vaccination sufficient']
                ],
                'manufacturer' => 'Classic Biologics',
                'batch_number' => 'FP2024C021',
                'storage_requirements' => ['frozen', 'temperature_minus_20'],
                'contraindications' => ['egg_production', 'molting_period'],
                'environmental_conditions' => [
                    'season' => 'avoid_mosquito_season',
                    'vector_control' => 'essential',
                    'wound_care' => 'monitor_vaccination_site'
                ],
                'efficacy_data' => [
                    'protection_rate' => 99.2,
                    'duration_years' => 5,
                    'take_rate' => 98.5
                ],
                'cost_per_dose' => '0.45',
                'effectiveness_rate' => '99.20',
                'is_mandatory' => false,
                'created_by' => $admin->id,
            ],
        ];

        foreach ($vaccinationProtocols as $protocol) {
            VaccinationProtocol::create($protocol);
        }

        $this->command->info("✅ Created " . count($medicationProtocols) . " medication protocols and " . count($vaccinationProtocols) . " vaccination protocols");
    }
}
