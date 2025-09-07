<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Modules\BatchIncubator\Models\MedicationProtocol;

class MedicationProtocolsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $protocols = [
            [
                'name' => 'Broiler Day-Old Chick Treatment',
                'medication_name' => 'Enrofloxacin',
                'medication_type' => 'antibiotic',
                'description' => 'Preventive antibiotic treatment for day-old broiler chicks',
                'target_breeds' => ['Ross 308', 'Cobb 500', 'Arbor Acres'],
                'bird_type' => 'chicken',
                'purpose' => 'broiler',
                'min_age_days' => 1,
                'max_age_days' => 5,
                'active_ingredient' => 'Enrofloxacin 10%',
                'dosage_per_kg_body_weight' => 10.0,
                'dosage_unit' => 'ml',
                'administration_method' => 'water',
                'treatment_duration_days' => 3,
                'application_schedule' => [
                    'schedule_type' => 'age_based',
                    'applications' => [
                        ['age_days' => 1, 'purpose' => 'prevention', 'dosage_modifier' => 1.0]
                    ]
                ],
                'withdrawal_period_days' => 14,
                'contraindications' => ['pregnant_birds', 'egg_laying_birds'],
                'precautions' => 'Monitor for signs of resistance. Ensure adequate water intake.',
                'side_effects' => 'Possible digestive upset in sensitive birds',
                'cost_per_unit' => 25.00,
                'supplier' => 'Agrivet Kenya',
                'status' => 'active',
                'requires_prescription' => true,
                'created_by' => 1,
            ],
            [
                'name' => 'Layer Vitamin Supplement',
                'medication_name' => 'Multivitamin Complex',
                'medication_type' => 'vitamin',
                'description' => 'Weekly vitamin supplementation for laying hens',
                'target_breeds' => ['Lohmann Brown', 'ISA Brown', 'Hyline'],
                'bird_type' => 'chicken',
                'purpose' => 'layer',
                'min_age_days' => 140,
                'max_age_days' => 520,
                'active_ingredient' => 'Vitamins A, D3, E, B-complex',
                'dosage_per_bird' => 2.0,
                'dosage_unit' => 'ml',
                'administration_method' => 'water',
                'treatment_duration_days' => 1,
                'application_schedule' => [
                    'schedule_type' => 'recurring',
                    'frequency' => 'weekly',
                    'applications' => [
                        ['day_of_week' => 'monday', 'purpose' => 'supplement', 'dosage_modifier' => 1.0]
                    ]
                ],
                'withdrawal_period_days' => 0,
                'contraindications' => [],
                'precautions' => 'Do not exceed recommended dosage',
                'side_effects' => 'None reported at recommended dosage',
                'cost_per_unit' => 15.00,
                'supplier' => 'Pembe Pharmaceuticals',
                'status' => 'active',
                'requires_prescription' => false,
                'auto_recommend' => true,
                'created_by' => 1,
            ],
            [
                'name' => 'Emergency Coccidiosis Treatment',
                'medication_name' => 'Amprolium',
                'medication_type' => 'anti-coccidial',
                'description' => 'Emergency treatment for coccidiosis outbreak',
                'target_breeds' => ['All breeds'],
                'bird_type' => 'chicken',
                'purpose' => 'emergency',
                'min_age_days' => 7,
                'max_age_days' => 365,
                'active_ingredient' => 'Amprolium HCl 20%',
                'dosage_per_kg_body_weight' => 25.0,
                'dosage_unit' => 'mg',
                'administration_method' => 'water',
                'treatment_duration_days' => 5,
                'application_schedule' => [
                    'schedule_type' => 'event_based',
                    'triggers' => ['coccidiosis_symptoms', 'bloody_droppings', 'high_mortality']
                ],
                'withdrawal_period_days' => 7,
                'contraindications' => ['severe_dehydration'],
                'precautions' => 'Ensure adequate vitamin B1 supplementation during treatment',
                'side_effects' => 'Possible vitamin B1 deficiency with prolonged use',
                'cost_per_unit' => 45.00,
                'supplier' => 'Norbrook Kenya',
                'status' => 'active',
                'requires_prescription' => true,
                'is_emergency_protocol' => true,
                'created_by' => 1,
            ],
            [
                'name' => 'Probiotic Growth Promoter',
                'medication_name' => 'Lactobacillus Mix',
                'medication_type' => 'probiotic',
                'description' => 'Natural growth promoter and gut health supplement',
                'target_breeds' => ['All breeds'],
                'bird_type' => 'chicken',
                'purpose' => 'broiler',
                'min_age_days' => 1,
                'max_age_days' => 42,
                'active_ingredient' => 'Lactobacillus acidophilus, L. casei',
                'dosage_per_kg_body_weight' => 1.0,
                'dosage_unit' => 'g',
                'administration_method' => 'feed',
                'treatment_duration_days' => 1,
                'application_schedule' => [
                    'schedule_type' => 'recurring',
                    'frequency' => 'weekly',
                    'applications' => [
                        ['age_days' => 1, 'purpose' => 'gut_health', 'dosage_modifier' => 1.0],
                        ['age_days' => 7, 'purpose' => 'growth_promotion', 'dosage_modifier' => 1.0],
                        ['age_days' => 14, 'purpose' => 'growth_promotion', 'dosage_modifier' => 1.0],
                        ['age_days' => 21, 'purpose' => 'growth_promotion', 'dosage_modifier' => 1.0],
                        ['age_days' => 28, 'purpose' => 'growth_promotion', 'dosage_modifier' => 1.0],
                        ['age_days' => 35, 'purpose' => 'growth_promotion', 'dosage_modifier' => 1.0]
                    ]
                ],
                'withdrawal_period_days' => 0,
                'contraindications' => [],
                'precautions' => 'Store in cool, dry place. Do not mix with antibiotics.',
                'side_effects' => 'None reported',
                'cost_per_unit' => 18.00,
                'supplier' => 'Bio-Kenya Ltd',
                'status' => 'active',
                'requires_prescription' => false,
                'auto_recommend' => true,
                'created_by' => 1,
            ],
            [
                'name' => 'Stress Relief Protocol',
                'medication_name' => 'Electrolyte Solution',
                'medication_type' => 'electrolyte',
                'description' => 'Stress relief and electrolyte balance during transport and heat stress',
                'target_breeds' => ['All breeds'],
                'bird_type' => 'chicken',
                'purpose' => 'stress_relief',
                'min_age_days' => 1,
                'max_age_days' => 365,
                'active_ingredient' => 'Sodium, Potassium, Chloride, Glucose',
                'dosage_per_bird' => 5.0,
                'dosage_unit' => 'ml',
                'administration_method' => 'water',
                'treatment_duration_days' => 2,
                'application_schedule' => [
                    'schedule_type' => 'event_based',
                    'triggers' => ['transport', 'heat_stress', 'vaccination', 'handling_stress']
                ],
                'withdrawal_period_days' => 0,
                'contraindications' => [],
                'precautions' => 'Ensure birds have access to fresh water at all times',
                'side_effects' => 'None reported',
                'cost_per_unit' => 12.00,
                'supplier' => 'Kenchic Pharmacy',
                'status' => 'active',
                'requires_prescription' => false,
                'auto_recommend' => true,
                'created_by' => 1,
            ],
        ];

        foreach ($protocols as $protocol) {
            MedicationProtocol::updateOrCreate(
                ['name' => $protocol['name']],
                $protocol
            );
        }
    }
}
