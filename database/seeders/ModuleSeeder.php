<?php

namespace Database\Seeders;

use App\Models\Module;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $modules = [
            [
                'name' => 'Batch Incubator',
                'slug' => 'batch-incubator',
                'description' => 'Complete poultry batch and incubator management system for tracking incubation cycles, monitoring equipment, and managing production.',
                'icon' => 'package',
                'version' => '1.0.0',
                'config' => [
                    'features' => [
                        'Complete egg incubation management',
                        'Chicken batch lifecycle tracking',
                        'Automated scheduling for feeding and maintenance',
                        'Environmental monitoring and alerts',
                        'Production analytics and reporting',
                        'Equipment management and monitoring'
                    ],
                    'benefits' => [
                        'Optimize hatch rates with precise monitoring',
                        'Reduce manual work with automated schedules',
                        'Track performance across all batches',
                        'Get alerts for critical events'
                    ],
                    'ideal_for' => 'Farmers managing egg incubation and chicken raising operations',
                    'dashboard_widgets' => [
                        'batch_stats',
                        'incubator_status',
                        'production_overview',
                        'alerts',
                        'upcoming_schedules'
                    ],
                    'routes' => [
                        'prefix' => 'batch-incubator',
                        'namespace' => 'App\\Modules\\BatchIncubator\\Controllers'
                    ]
                ],
                'is_active' => true,
                'is_core' => false,
                'sort_order' => 1,
            ],
            [
                'name' => 'Feed Management',
                'slug' => 'feed-management',
                'description' => 'Track feed inventory, consumption, and optimize feeding schedules for different poultry groups.',
                'icon' => 'shopping-cart',
                'version' => '1.0.0',
                'config' => [
                    'features' => [
                        'Feed inventory tracking',
                        'Automated feeding schedules',
                        'Consumption monitoring',
                        'Cost analysis and optimization',
                        'Supplier management',
                        'Quality control tracking'
                    ],
                    'benefits' => [
                        'Reduce feed waste and costs',
                        'Ensure optimal nutrition timing',
                        'Track feed conversion rates',
                        'Manage multiple feed types efficiently'
                    ],
                    'ideal_for' => 'Operations focusing on feed efficiency and cost management'
                ],
                'is_active' => true,
                'is_core' => false,
                'sort_order' => 2,
            ],
            [
                'name' => 'Health Monitoring',
                'slug' => 'health-monitoring',
                'description' => 'Monitor poultry health, track vaccinations, manage medical records and treatments.',
                'icon' => 'heart',
                'version' => '1.0.0',
                'config' => [
                    'features' => [
                        'Health check scheduling',
                        'Disease tracking and alerts',
                        'Vaccination management',
                        'Mortality tracking',
                        'Treatment records',
                        'Veterinary visit scheduling'
                    ],
                    'benefits' => [
                        'Early disease detection and prevention',
                        'Comprehensive health records',
                        'Improved flock health outcomes',
                        'Regulatory compliance tracking'
                    ],
                    'ideal_for' => 'Farms prioritizing flock health and preventive care'
                ],
                'is_active' => true,
                'is_core' => false,
                'sort_order' => 3,
            ],
            [
                'name' => 'Financial Management',
                'slug' => 'financial-management',
                'description' => 'Track expenses, revenue, profitability analysis and financial reporting for your poultry operations.',
                'icon' => 'dollar-sign',
                'version' => '1.0.0',
                'config' => [
                    'features' => [
                        'Revenue and expense tracking',
                        'Profit margin analysis',
                        'Cost per bird calculations',
                        'Investment ROI tracking',
                        'Budget planning and forecasting',
                        'Financial reporting'
                    ],
                    'benefits' => [
                        'Better financial visibility',
                        'Identify cost reduction opportunities',
                        'Plan investments effectively',
                        'Track business performance'
                    ],
                    'ideal_for' => 'Business-focused farmers and commercial operations'
                ],
                'is_active' => true,
                'is_core' => false,
                'sort_order' => 4,
            ],
            [
                'name' => 'Production Analytics',
                'slug' => 'production-analytics',
                'description' => 'Comprehensive analytics and reporting for production performance, trends, and optimization insights.',
                'icon' => 'trending-up',
                'version' => '1.0.0',
                'config' => [
                    'features' => [
                        'Production performance tracking',
                        'Efficiency metrics and KPIs',
                        'Trend analysis and forecasting',
                        'Comparative reporting',
                        'Custom dashboard creation',
                        'Data export capabilities'
                    ],
                    'benefits' => [
                        'Data-driven decision making',
                        'Identify improvement opportunities',
                        'Benchmark performance',
                        'Optimize operations'
                    ],
                    'ideal_for' => 'Data-driven operations seeking optimization insights'
                ],
                'is_active' => true,
                'is_core' => false,
                'sort_order' => 5,
            ],
        ];

        foreach ($modules as $moduleData) {
            Module::updateOrCreate(
                ['slug' => $moduleData['slug']],
                $moduleData
            );
        }
    }
}
