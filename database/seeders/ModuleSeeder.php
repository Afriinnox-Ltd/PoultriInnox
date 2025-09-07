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
                'code' => 'BATCH_INCUBATOR',
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
                'code' => 'FEED_MANAGEMENT',
                'description' => 'Track feed inventory, consumption, and optimize feeding schedules for different poultry groups.',
                'icon' => 'shopping-cart',
                'version' => '1.0.0',
                'dependencies' => ['batch-incubator'], // Requires Batch Incubator module
                'config' => [
                    'features' => [
                        'Feed inventory tracking',
                        'Automated feeding schedules',
                        'Admin feed program management',
                        'Consumption monitoring with FCR calculation',
                        'Cost analysis and optimization',
                        'Supplier management',
                        'Quality control tracking',
                        'Excel template uploads',
                        'AI-powered feed program suggestions'
                    ],
                    'benefits' => [
                        'Reduce feed waste and costs',
                        'Ensure optimal nutrition timing',
                        'Track feed conversion rates',
                        'Manage multiple feed types efficiently',
                        'Expert feeding programs from admin',
                        'Automated batch-specific schedules'
                    ],
                    'ideal_for' => 'Operations focusing on feed efficiency and cost management',
                    'requires' => [
                        'batch-incubator' => 'Needed for batch data, schedules, and FCR calculations'
                    ]
                ],
                'is_active' => true,
                'is_core' => false,
                'sort_order' => 2,
            ],

            [
                'name' => 'Marketplace',
                'slug' => 'marketplace',
                'code' => 'MARKETPLACE',
                'description' => 'Complete e-commerce marketplace for buying and selling poultry equipment, supplies, and services.',
                'icon' => 'store',
                'version' => '1.0.0',
                'config' => [
                    'features' => [
                        'Product catalog and search',
                        'Multi-vendor marketplace',
                        'Shopping cart and checkout',
                        'Order management and tracking',
                        'Vendor registration and dashboard',
                        'Product reviews and ratings',
                        'Commission system for vendors',
                        'Secure payment processing',
                        'Shipping and delivery tracking',
                        'Inventory management',
                        'Sales analytics and reporting',
                        'Wishlist and favorites'
                    ],
                    'benefits' => [
                        'Buy equipment and supplies easily',
                        'Sell your products to wider audience',
                        'Compare prices from multiple vendors',
                        'Track orders and deliveries',
                        'Secure payment processing',
                        'Professional vendor tools'
                    ],
                    'ideal_for' => 'Farmers looking to buy/sell equipment and suppliers wanting to reach customers',
                    'dashboard_widgets' => [
                        'marketplace_stats',
                        'recent_orders',
                        'vendor_performance',
                        'popular_products',
                        'revenue_overview'
                    ],
                    'routes' => [
                        'prefix' => 'marketplace',
                        'namespace' => 'App\\Modules\\Marketplace\\Controllers'
                    ]
                ],
                'is_active' => true,
                'is_core' => false,
                'sort_order' => 3,
            ],
        ];

        foreach ($modules as $moduleData) {
            Module::updateOrCreate(
                ['code' => $moduleData['code']],
                $moduleData
            );
        }
    }
}
