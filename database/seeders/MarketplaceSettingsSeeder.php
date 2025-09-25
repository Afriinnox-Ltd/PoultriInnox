<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MarketplaceSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // Tax Settings
            [
                'key' => 'tax_rate',
                'value' => '8.25',
                'type' => 'number',
                'group' => 'tax',
                'label' => 'Default Tax Rate (%)',
                'description' => 'Default tax rate applied to orders',
                'is_public' => true,
                'validation_rules' => json_encode(['required', 'numeric', 'min:0', 'max:100']),
                'sort_order' => 1,
            ],
            [
                'key' => 'tax_enabled',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'tax',
                'label' => 'Enable Tax Calculation',
                'description' => 'Whether to calculate and apply taxes to orders',
                'is_public' => true,
                'sort_order' => 2,
            ],
            [
                'key' => 'tax_inclusive',
                'value' => 'false',
                'type' => 'boolean',
                'group' => 'tax',
                'label' => 'Tax Inclusive Pricing',
                'description' => 'Whether product prices include tax',
                'is_public' => true,
                'sort_order' => 3,
            ],
            
            // Commission Settings
            [
                'key' => 'default_commission_rate',
                'value' => '5.0',
                'type' => 'number',
                'group' => 'commission',
                'label' => 'Default Commission Rate (%)',
                'description' => 'Default commission rate for new vendors',
                'is_public' => false,
                'validation_rules' => json_encode(['required', 'numeric', 'min:0', 'max:50']),
                'sort_order' => 1,
            ],
            [
                'key' => 'commission_type',
                'value' => 'percentage',
                'type' => 'select',
                'group' => 'commission',
                'label' => 'Commission Type',
                'description' => 'How commission is calculated',
                'is_public' => false,
                'options' => json_encode(['percentage' => 'Percentage', 'fixed' => 'Fixed Amount']),
                'sort_order' => 2,
            ],
            
            // Platform Fees
            [
                'key' => 'platform_fee_enabled',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'platform',
                'label' => 'Enable Platform Fee',
                'description' => 'Whether to charge a platform fee on orders',
                'is_public' => false,
                'sort_order' => 1,
            ],
            [
                'key' => 'platform_fee_amount',
                'value' => '2.0',
                'type' => 'number',
                'group' => 'platform',
                'label' => 'Platform Fee (%)',
                'description' => 'Platform fee charged on each order',
                'is_public' => false,
                'validation_rules' => json_encode(['required', 'numeric', 'min:0', 'max:10']),
                'sort_order' => 2,
            ],
            
            // Payment Settings
            [
                'key' => 'payment_hold_days',
                'value' => '7',
                'type' => 'number',
                'group' => 'payment',
                'label' => 'Payment Hold Days',
                'description' => 'Days to hold payment before releasing to vendors',
                'is_public' => false,
                'validation_rules' => json_encode(['required', 'integer', 'min:0', 'max:30']),
                'sort_order' => 1,
            ],
            [
                'key' => 'auto_payout_enabled',
                'value' => 'false',
                'type' => 'boolean',
                'group' => 'payment',
                'label' => 'Auto Payout',
                'description' => 'Automatically pay vendors after hold period',
                'is_public' => false,
                'sort_order' => 2,
            ],
            [
                'key' => 'minimum_payout_amount',
                'value' => '50.00',
                'type' => 'number',
                'group' => 'payment',
                'label' => 'Minimum Payout Amount',
                'description' => 'Minimum amount required for vendor payout',
                'is_public' => false,
                'validation_rules' => json_encode(['required', 'numeric', 'min:0']),
                'sort_order' => 3,
            ],
            
            // Shipping Settings
            [
                'key' => 'free_shipping_threshold',
                'value' => '100.00',
                'type' => 'number',
                'group' => 'shipping',
                'label' => 'Free Shipping Threshold',
                'description' => 'Order amount for free shipping',
                'is_public' => true,
                'validation_rules' => json_encode(['required', 'numeric', 'min:0']),
                'sort_order' => 1,
            ],
            [
                'key' => 'default_shipping_cost',
                'value' => '10.00',
                'type' => 'number',
                'group' => 'shipping',
                'label' => 'Default Shipping Cost',
                'description' => 'Default shipping cost for orders',
                'is_public' => true,
                'validation_rules' => json_encode(['required', 'numeric', 'min:0']),
                'sort_order' => 2,
            ],
            
            // General Settings
            [
                'key' => 'currency',
                'value' => 'RWF',
                'type' => 'select',
                'group' => 'general',
                'label' => 'Currency',
                'description' => 'Default marketplace currency',
                'is_public' => true,
                'options' => json_encode(['RWF'=>'Rwandan Franc','USD' => 'US Dollar', 'EUR' => 'Euro', 'GBP' => 'British Pound', 'CAD' => 'Canadian Dollar']),
                'sort_order' => 1,
            ],
            [
                'key' => 'currency_symbol',
                'value' => 'R₣',
                'type' => 'string',
                'group' => 'general',
                'label' => 'Currency Symbol',
                'description' => 'Currency symbol to display',
                'is_public' => true,
                'sort_order' => 2,
            ],
            [
                'key' => 'auto_approve_vendors',
                'value' => 'false',
                'type' => 'boolean',
                'group' => 'general',
                'label' => 'Auto Approve Vendors',
                'description' => 'Automatically approve new vendor registrations',
                'is_public' => false,
                'sort_order' => 3,
            ],
            [
                'key' => 'auto_approve_products',
                'value' => 'false',
                'type' => 'boolean',
                'group' => 'general',
                'label' => 'Auto Approve Products',
                'description' => 'Automatically approve new product submissions',
                'is_public' => false,
                'sort_order' => 4,
            ],
            
            // Order Settings
            [
                'key' => 'order_auto_complete_days',
                'value' => '7',
                'type' => 'number',
                'group' => 'orders',
                'label' => 'Auto Complete Orders (Days)',
                'description' => 'Days after delivery to auto-complete orders',
                'is_public' => false,
                'validation_rules' => json_encode(['required', 'integer', 'min:1', 'max:30']),
                'sort_order' => 1,
            ],
            [
                'key' => 'allow_order_cancellation',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'orders',
                'label' => 'Allow Order Cancellation',
                'description' => 'Allow customers to cancel orders',
                'is_public' => true,
                'sort_order' => 2,
            ],
            [
                'key' => 'cancellation_window_hours',
                'value' => '24',
                'type' => 'number',
                'group' => 'orders',
                'label' => 'Cancellation Window (Hours)',
                'description' => 'Hours after order placement to allow cancellation',
                'is_public' => true,
                'validation_rules' => json_encode(['required', 'integer', 'min:1', 'max:168']),
                'sort_order' => 3,
            ],
        ];

        foreach ($settings as $setting) {
            DB::table('marketplace_settings')->updateOrInsert(
                ['key' => $setting['key']],
                array_merge($setting, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}
