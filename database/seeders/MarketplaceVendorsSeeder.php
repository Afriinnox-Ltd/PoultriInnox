<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Modules\Marketplace\Models\Vendor;
use App\Models\User;

class MarketplaceVendorsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create vendor users first
        $vendorUsers = [
            [
                'name' => 'AgriTech Solutions',
                'email' => 'vendor@agritech.com',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Poultry Pro Supplies',
                'email' => 'sales@poultrypro.com',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Farm Equipment Direct',
                'email' => 'info@farmequipment.com',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Veterinary Medicines Co',
                'email' => 'orders@vetmed.com',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Premium Feeds Ltd',
                'email' => 'contact@premiumfeeds.com',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        ];

        foreach ($vendorUsers as $userData) {
            $user = User::create($userData);

            // Create vendor profile
            Vendor::create([
                'user_id' => $user->id,
                'business_name' => $user->name,
                'business_type' => 'supplier',
                'description' => 'Professional supplier of high-quality poultry products and equipment.',
                'address' => fake()->streetAddress(),
                'city' => fake()->city(),
                'state' => fake()->state(),
                'country' => 'Kenya',
                'postal_code' => fake()->postcode(),
                'phone' => fake()->phoneNumber(),
                'email' => $user->email,
                'website' => 'https://' . fake()->domainName(),
                'tax_id' => 'TAX' . fake()->randomNumber(8),
                'business_license' => 'LIC' . fake()->randomNumber(8),
                'verification_status' => 'verified',
                'commission_rate' => fake()->randomFloat(2, 5, 15),
                'is_active' => true,
                // 'featured' => fake()->boolean(30),
                'rating' => fake()->randomFloat(2, 3.5, 5.0),
                'total_reviews' => fake()->numberBetween(10, 150),
                'total_sales' => fake()->randomFloat(2, 1000, 50000),
                // 'joined_at' => fake()->dateTimeBetween('-2 years', 'now'),
            ]);
        }
    }
}
