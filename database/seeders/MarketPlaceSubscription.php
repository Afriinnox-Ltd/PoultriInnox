<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MarketPlaceSubscription extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('marketplace_subscriptions')->insert([
    [
        'vendor_id' => 1,
        'plan_name' => 'Free',
        'price' => 0,
        'allow_cod' => false,
        'is_active' => true,
        'start_date' => now(),
        'end_date' => now()->addYear(),
    ],
    [
        'vendor_id' => 2,
        'plan_name' => 'Premium',
        'price' => 25.00,
        'allow_cod' => true,
        'is_active' => true,
        'start_date' => now(),
        'end_date' => now()->addMonth(),
    ],
]);

    }
}
