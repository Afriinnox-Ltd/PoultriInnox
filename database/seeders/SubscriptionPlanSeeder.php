<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Free',
                'description' => 'Basic marketplace access with limited features',
                'price' => 0.00,
                'billing_cycle' => 'monthly',
                'product_limit' => 5,
                'order_limit' => 10,
                'allow_cod' => false,
                'features' => [
                    'Basic product listings',
                    'Online payment only',
                    'Standard support',
                    'Basic analytics'
                ],
                'is_active' => true,
            ],
            [
                'name' => 'Premium',
                'description' => 'Advanced marketplace features for serious vendors',
                'price' => 15000.00, // RWF
                'billing_cycle' => 'monthly',
                'product_limit' => 50,
                'order_limit' => 200,
                'allow_cod' => true,
                'features' => [
                    'Unlimited product listings',
                    'Cash on Delivery enabled',
                    'Priority support',
                    'Advanced analytics',
                    'Featured product placement',
                    'Custom shipping options'
                ],
                'is_active' => true,
            ],
            [
                'name' => 'Enterprise',
                'description' => 'Complete marketplace solution for large vendors',
                'price' => 45000.00, // RWF
                'billing_cycle' => 'monthly',
                'product_limit' => null, // unlimited
                'order_limit' => null, // unlimited
                'allow_cod' => true,
                'features' => [
                    'Unlimited everything',
                    'All payment methods',
                    'Dedicated account manager',
                    'Custom integrations',
                    'White-label options',
                    'Bulk operations',
                    'API access'
                ],
                'is_active' => true,
            ]
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(
                ['name' => $plan['name']],
                $plan
            );
        }
    }
}
