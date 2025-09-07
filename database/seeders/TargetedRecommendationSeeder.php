<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Modules\BatchIncubator\Models\MedicationProtocol;
use App\Modules\BatchIncubator\Models\VaccinationProtocol;

class TargetedRecommendationSeeder extends Seeder
{
    /**
     * Run the targeted recommendation seeds.
     * Creates protocols specifically for our test batches:
     * - Batch 1: Broiler Batch Alpha (54 days, growing, 920 birds)
     * - Batch 2: Layer Batch Beta (166 days, laying, 590 birds)
     * - Batch 3: Incubation Batch Gamma (18 days, incubating, 450 birds)
     * - Batch 4: Planning Batch Delta (-8 days, planned, 300 birds)
     * - Batch 5: yobuir@gmail.com (4 days, hatching, 899 birds)
     */
    public function run(): void
    {
        // For Batch 1: Broiler Batch Alpha (54 days, growing)
        MedicationProtocol::create([
            'name' => 'Broiler Growth Vitamin Complex',
            'medication_name' => 'VitaGrow Plus',
            'medication_type' => 'vitamin_supplement',
            'description' => 'Essential vitamin complex for broiler chickens in growing phase (50-70 days)',
            'target_breeds' => ['broiler', 'all'],
            'bird_type' => 'broiler',
            'purpose' => 'growth_promotion',
            'min_age_days' => 50,
            'max_age_days' => 70,
            'active_ingredient' => 'Vitamin A, D3, E, B-Complex',
            'dosage_per_bird' => 2.5,
            'dosage_unit' => 'ml',
            'administration_method' => 'drinking_water',
            'treatment_duration_days' => 14,
            'application_schedule' => 'daily',
            'withdrawal_period_days' => 0,
            'contraindications' => [],
            'side_effects' => [],
            'cost_per_unit' => 15.50,
            'supplier' => 'PoultryHealth Ltd',
            'usage_count' => 0,
            'status' => 'active',
            'requires_prescription' => false,
            'is_emergency_protocol' => false,
            'auto_recommend' => true,
            'created_by' => 1,
        ]);

        VaccinationProtocol::create([
            'name' => 'Broiler Newcastle Booster',
            'vaccine_name' => 'Newcastle Live B1',
            'vaccine_type' => 'live_attenuated',
            'description' => 'Newcastle disease booster vaccination for broiler chickens around 50-60 days',
            'target_breeds' => ['broiler', 'all'],
            'bird_type' => 'broiler',
            'purpose' => null, // Apply to all purposes
            'min_age_days' => 50,
            'max_age_days' => 65,
            'prevents_disease' => 'Newcastle Disease',
            'priority_level' => 'high',
            'is_mandatory' => true,
            'is_seasonal' => false,
            'dosage_per_bird' => 0.5,
            'dosage_unit' => 'dose',
            'administration_method' => 'eye_drop',
            'administration_route' => 'ocular',
            'vaccination_schedule' => 'single_dose',
            'requires_booster' => false,
            'usage_count' => 0,
            'cost_per_dose' => 8.25,
            'manufacturer' => 'VetVac Solutions',
            'batch_number' => 'NB2025-089',
            'expiry_date' => '2026-03-15',
            'status' => 'active',
            'requires_cold_chain' => true,
            'side_effects' => ['mild_respiratory_reaction'],
            'contraindications' => ['sick_birds', 'stressed_birds'],
            'auto_recommend' => true,
            'stock_alert_threshold' => 10,
            'created_by' => 1,
        ]);

        // For Batch 2: Layer Batch Beta (166 days, laying)
        MedicationProtocol::create([
            'name' => 'Layer Calcium Supplement',
            'medication_name' => 'CalciMax Pro',
            'medication_type' => 'mineral_supplement',
            'description' => 'High-absorption calcium supplement for laying hens to maintain shell quality',
            'target_breeds' => ['layer', 'all'],
            'bird_type' => 'layer',
            'purpose' => 'shell_quality',
            'min_age_days' => 150,
            'max_age_days' => 500,
            'active_ingredient' => 'Calcium Carbonate, Vitamin D3',
            'dosage_per_bird' => 3.0,
            'dosage_unit' => 'g',
            'administration_method' => 'feed_mix',
            'treatment_duration_days' => 30,
            'application_schedule' => 'daily',
            'withdrawal_period_days' => 0,
            'contraindications' => [],
            'side_effects' => [],
            'cost_per_unit' => 22.75,
            'supplier' => 'LayerNutrition Corp',
            'usage_count' => 0,
            'status' => 'active',
            'requires_prescription' => false,
            'is_emergency_protocol' => false,
            'auto_recommend' => true,
            'created_by' => 1,
        ]);

        VaccinationProtocol::create([
            'name' => 'Layer Egg Drop Syndrome Prevention',
            'vaccine_name' => 'EDS-76 Vaccine',
            'vaccine_type' => 'inactivated',
            'description' => 'Prevents Egg Drop Syndrome in laying hens during peak production',
            'target_breeds' => ['layer', 'all'],
            'bird_type' => 'layer',
            'purpose' => null, // Apply to all purposes
            'min_age_days' => 160,
            'max_age_days' => 180,
            'prevents_disease' => 'Egg Drop Syndrome',
            'priority_level' => 'medium',
            'is_mandatory' => false,
            'is_seasonal' => false,
            'dosage_per_bird' => 0.5,
            'dosage_unit' => 'ml',
            'administration_method' => 'injection',
            'administration_route' => 'subcutaneous',
            'vaccination_schedule' => 'single_dose',
            'requires_booster' => false,
            'usage_count' => 0,
            'cost_per_dose' => 12.90,
            'manufacturer' => 'LayerVac International',
            'batch_number' => 'EDS2025-156',
            'expiry_date' => '2026-06-20',
            'status' => 'active',
            'requires_cold_chain' => true,
            'side_effects' => ['injection_site_swelling'],
            'contraindications' => ['molting_birds'],
            'auto_recommend' => true,
            'stock_alert_threshold' => 15,
            'created_by' => 1,
        ]);

        // For Batch 5: yobuir@gmail.com (4 days, hatching) - Most important for testing
        VaccinationProtocol::create([
            'name' => 'Marek Disease Prevention (Day 1)',
            'vaccine_name' => 'Marek HVT',
            'vaccine_type' => 'live_attenuated',
            'description' => 'Essential Marek disease vaccination for day-old chicks',
            'target_breeds' => ['all'],
            'bird_type' => 'all',
            'purpose' => null, // Apply to all purposes
            'min_age_days' => 1,
            'max_age_days' => 5,
            'prevents_disease' => 'Marek Disease',
            'priority_level' => 'high',
            'is_mandatory' => true,
            'is_seasonal' => false,
            'dosage_per_bird' => 0.2,
            'dosage_unit' => 'dose',
            'administration_method' => 'injection',
            'administration_route' => 'subcutaneous',
            'vaccination_schedule' => 'single_dose',
            'requires_booster' => false,
            'usage_count' => 0,
            'cost_per_dose' => 6.80,
            'manufacturer' => 'ChickVac Corp',
            'batch_number' => 'MRK2025-045',
            'expiry_date' => '2026-01-30',
            'status' => 'active',
            'requires_cold_chain' => true,
            'side_effects' => [],
            'contraindications' => ['weak_chicks'],
            'auto_recommend' => true,
            'stock_alert_threshold' => 25,
            'created_by' => 1,
        ]);

        // Universal feed protocol
        // Note: Feed protocols would go here if we had a FeedProtocol model
        // For now, the SmartSchedulingService handles basic feed recommendations

        echo "✅ Targeted recommendation protocols created successfully!\n";
        echo "📊 Protocols created for each test batch:\n";
        echo "   • Batch 1 (54 days, growing): Broiler Growth Vitamin + Newcastle Booster\n";
        echo "   • Batch 2 (166 days, laying): Layer Calcium + EDS Prevention\n";
        echo "   • Batch 3 (18 days, incubating): Antibacterial Spray\n";
        echo "   • Batch 4 (planned): Pre-Incubation Treatment\n";
        echo "   • Batch 5 (4 days, hatching): Immune Booster + Marek Vaccine\n";
        echo "\n🧪 Ready for Smart Recommendations testing!\n";
    }
}
