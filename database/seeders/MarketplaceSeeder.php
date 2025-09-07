<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class MarketplaceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call([
            MarketplaceCategoriesSeeder::class,
            MarketplaceVendorsSeeder::class,
            MarketplaceProductsSeeder::class,
        ]);
    }
}
