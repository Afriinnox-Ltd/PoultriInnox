<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Modules\BatchIncubator\Models\VaccinationProtocol;

class VaccinationProtocolsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $protocols = [
            [
                'name' => 'Newcastle Disease Vaccination',
                'vaccine_name' => 'Newcastle Disease Vaccine (La Sota)',
                'vaccine_type' => 'live',
                'description' => 'Live Newcastle Disease vaccine for primary immunity',
                'target_breeds' => ['All breeds'],
                'bird_type' => 'chicken',
                'purpose' => 'broiler',
                'min_age_days' => 7,
                'max_age_days' => 365,
                'prevents_disease' => 'Newcastle Disease',
                'priority_level' => 'critical',
                'is_mandatory' => true,
                'dosage_per_bird' => 1.0,
                'dosage_unit' => 'dose',
                'administration_method' => 'water',
                'administration_route' => 'oral',
                'vaccination_schedule' => [
                    'schedule_type' => 'age_based',
                    'vaccinations' => [
                        [
                            'age_days' => 7,
                            'is_primary' => true,
                            'description' => 'Primary Newcastle vaccination'
                        ],
                        [
                            'age_days' => 21,
                            'is_booster' => true,
                            'description' => 'First booster vaccination'
                        ]
                    ]
                ],
                'requires_booster' => true,
                'booster_interval_days' => 14,
                'immunity_duration_days' => 90,
                'storage_requirements' => 'Store at 2-8°C. Use within 2 hours of reconstitution.',
                'preparation_instructions' => 'Reconstitute with sterile water immediately before use',
                'contraindications' => ['Sick birds', 'Immunocompromised birds'],
                'side_effects' => 'Mild respiratory symptoms may occur 3-5 days post vaccination',
                'cost_per_dose' => 2.50,
                'manufacturer' => 'Ceva Animal Health',
                'supplier' => 'Agrivet Kenya',
                'status' => 'active',
                'requires_cold_chain' => true,
                'auto_recommend' => true,
                'created_by' => 1,
            ],
            [
                'name' => 'Gumboro Disease Vaccination',
                'vaccine_name' => 'IBD Vaccine (Intermediate Plus)',
                'vaccine_type' => 'live',
                'description' => 'Infectious Bursal Disease vaccine for immune system protection',
                'target_breeds' => ['All breeds'],
                'bird_type' => 'chicken',
                'purpose' => 'broiler',
                'min_age_days' => 14,
                'max_age_days' => 28,
                'prevents_disease' => 'Infectious Bursal Disease (Gumboro)',
                'priority_level' => 'critical',
                'is_mandatory' => true,
                'dosage_per_bird' => 1.0,
                'dosage_unit' => 'dose',
                'administration_method' => 'water',
                'administration_route' => 'oral',
                'vaccination_schedule' => [
                    'schedule_type' => 'age_based',
                    'vaccinations' => [
                        [
                            'age_days' => 14,
                            'is_primary' => true,
                            'description' => 'Primary Gumboro vaccination'
                        ]
                    ]
                ],
                'requires_booster' => false,
                'immunity_duration_days' => 120,
                'storage_requirements' => 'Store at 2-8°C. Protect from light.',
                'preparation_instructions' => 'Dissolve in chlorine-free water. Use immediately.',
                'contraindications' => ['Birds under stress', 'Recently medicated birds'],
                'side_effects' => 'Temporary reduction in weight gain may occur',
                'cost_per_dose' => 3.00,
                'manufacturer' => 'Boehringer Ingelheim',
                'supplier' => 'Norbrook Kenya',
                'status' => 'active',
                'requires_cold_chain' => true,
                'auto_recommend' => true,
                'created_by' => 1,
            ],
            [
                'name' => 'Marek\'s Disease Vaccination',
                'vaccine_name' => 'Marek\'s Disease Vaccine (CVI988)',
                'vaccine_type' => 'live',
                'description' => 'Live Marek\'s Disease vaccine given at hatchery',
                'target_breeds' => ['All breeds'],
                'bird_type' => 'chicken',
                'purpose' => 'layer',
                'min_age_days' => 0,
                'max_age_days' => 1,
                'prevents_disease' => 'Marek\'s Disease',
                'priority_level' => 'critical',
                'is_mandatory' => true,
                'dosage_per_bird' => 0.2,
                'dosage_unit' => 'ml',
                'administration_method' => 'injection',
                'administration_route' => 'subcutaneous',
                'vaccination_schedule' => [
                    'schedule_type' => 'age_based',
                    'vaccinations' => [
                        [
                            'age_days' => 0,
                            'is_primary' => true,
                            'description' => 'Day-old Marek\'s vaccination at hatchery'
                        ]
                    ]
                ],
                'requires_booster' => false,
                'immunity_duration_days' => 365,
                'storage_requirements' => 'Store in liquid nitrogen or dry ice. Use immediately upon thawing.',
                'preparation_instructions' => 'Thaw vaccine carefully and mix gently before use',
                'contraindications' => ['Already infected birds'],
                'side_effects' => 'None when administered properly',
                'cost_per_dose' => 1.50,
                'manufacturer' => 'Merial',
                'supplier' => 'Kenchic Hatchery',
                'status' => 'active',
                'requires_cold_chain' => true,
                'auto_recommend' => true,
                'created_by' => 1,
            ],
            [
                'name' => 'Fowl Pox Vaccination',
                'vaccine_name' => 'Fowl Pox Vaccine',
                'vaccine_type' => 'live',
                'description' => 'Live fowl pox vaccine for layer and breeder protection',
                'target_breeds' => ['Layer breeds', 'Breeder stock'],
                'bird_type' => 'chicken',
                'purpose' => 'layer',
                'min_age_days' => 56,
                'max_age_days' => 84,
                'prevents_disease' => 'Fowl Pox',
                'priority_level' => 'high',
                'is_mandatory' => false,
                'is_seasonal' => true,
                'dosage_per_bird' => 1.0,
                'dosage_unit' => 'stab',
                'administration_method' => 'wing web',
                'administration_route' => 'intradermal',
                'vaccination_schedule' => [
                    'schedule_type' => 'age_based',
                    'vaccinations' => [
                        [
                            'age_days' => 56,
                            'is_primary' => true,
                            'description' => 'Fowl pox vaccination before laying period'
                        ]
                    ]
                ],
                'requires_booster' => false,
                'immunity_duration_days' => 365,
                'storage_requirements' => 'Store at 2-8°C. Protect from light.',
                'preparation_instructions' => 'Reconstitute with sterile saline. Use special needle for wing web',
                'contraindications' => ['Molting birds', 'Stressed birds'],
                'side_effects' => 'Small scab formation at vaccination site',
                'cost_per_dose' => 1.20,
                'manufacturer' => 'Zoetis',
                'supplier' => 'Pembe Pharmaceuticals',
                'status' => 'active',
                'requires_cold_chain' => true,
                'auto_recommend' => false,
                'created_by' => 1,
            ],
        ];

        foreach ($protocols as $protocol) {
            VaccinationProtocol::updateOrCreate(
                ['name' => $protocol['name']],
                $protocol
            );
        }
    }
}
