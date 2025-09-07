<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Modules\Marketplace\Models\Product;
use App\Modules\Marketplace\Models\ProductImage;
use App\Modules\Marketplace\Models\Category;
use App\Modules\Marketplace\Models\Vendor;

class MarketplaceProductsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = Category::all();
        $vendors = Vendor::all();

        $products = [
            // Feed Products
            [
                'category' => 'feed-nutrition',
                'name' => 'Premium Chick Starter Feed',
                'description' => 'High-quality starter feed formulated for chicks 0-6 weeks old. Contains essential nutrients for optimal growth and development.',
                'price' => 45.00,
                'compare_price' => 50.00,
                'stock_quantity' => 500,
                'tags' => ['starter', 'chicks', 'premium', 'nutrition']
            ],
            [
                'category' => 'feed-nutrition',
                'name' => 'Layer Mash Complete Feed',
                'description' => 'Balanced nutrition for laying hens. Formulated to maximize egg production and shell quality.',
                'price' => 42.00,
                'stock_quantity' => 300,
                'tags' => ['layer', 'eggs', 'hens', 'production']
            ],
            [
                'category' => 'feed-nutrition',
                'name' => 'Broiler Finisher Feed',
                'description' => 'High-energy feed for broiler chickens in finishing stage. Promotes rapid weight gain.',
                'price' => 40.00,
                'stock_quantity' => 250,
                'tags' => ['broiler', 'finisher', 'meat', 'growth']
            ],
            [
                'category' => 'feed-nutrition',
                'name' => 'Organic Poultry Feed',
                'description' => 'Certified organic feed blend for free-range and organic poultry operations.',
                'price' => 55.00,
                'stock_quantity' => 150,
                'tags' => ['organic', 'free-range', 'certified', 'premium']
            ],

            // Health Products
            [
                'category' => 'health-medications',
                'name' => 'Newcastle Disease Vaccine',
                'description' => 'Live attenuated vaccine for protection against Newcastle Disease in poultry.',
                'price' => 15.00,
                'stock_quantity' => 100,
                'tags' => ['vaccine', 'newcastle', 'prevention', 'health']
            ],
            [
                'category' => 'health-medications',
                'name' => 'Broad Spectrum Antibiotic',
                'description' => 'Effective treatment for bacterial infections in poultry. Veterinary prescription required.',
                'price' => 25.00,
                'stock_quantity' => 75,
                'tags' => ['antibiotic', 'treatment', 'bacterial', 'prescription']
            ],
            [
                'category' => 'health-medications',
                'name' => 'Poultry Probiotic Supplement',
                'description' => 'Natural probiotic supplement to improve gut health and immunity.',
                'price' => 18.00,
                'stock_quantity' => 150,
                'tags' => ['probiotic', 'gut-health', 'immunity', 'natural']
            ],
            [
                'category' => 'health-medications',
                'name' => 'Vitamin & Mineral Supplement',
                'description' => 'Complete vitamin and mineral supplement for optimal poultry health and performance.',
                'price' => 22.00,
                'stock_quantity' => 120,
                'tags' => ['vitamins', 'minerals', 'supplement', 'health']
            ],

            // Equipment
            [
                'category' => 'equipment-supplies',
                'name' => 'Digital Egg Incubator 48 Eggs',
                'description' => 'Fully automatic digital incubator with temperature and humidity control. Capacity: 48 eggs.',
                'price' => 150.00,
                'compare_price' => 180.00,
                'stock_quantity' => 25,
                'tags' => ['incubator', 'digital', 'automatic', 'eggs']
            ],
            [
                'category' => 'equipment-supplies',
                'name' => 'Automatic Hanging Feeder',
                'description' => 'Durable plastic hanging feeder with adjustable flow control. Suitable for all poultry types.',
                'price' => 12.00,
                'stock_quantity' => 200,
                'tags' => ['feeder', 'automatic', 'hanging', 'plastic']
            ],
            [
                'category' => 'equipment-supplies',
                'name' => 'Nipple Water System',
                'description' => 'Professional nipple watering system for clean and efficient water supply.',
                'price' => 35.00,
                'stock_quantity' => 80,
                'tags' => ['waterer', 'nipple', 'clean', 'efficient']
            ],
            [
                'category' => 'equipment-supplies',
                'name' => 'Poultry Nesting Boxes',
                'description' => 'Durable metal nesting boxes with easy cleaning design. Set of 6 boxes.',
                'price' => 65.00,
                'stock_quantity' => 40,
                'tags' => ['nesting', 'boxes', 'metal', 'eggs']
            ],
            [
                'category' => 'equipment-supplies',
                'name' => 'Heat Lamp with Bulb',
                'description' => 'Infrared heat lamp with ceramic socket and protective guard. Includes 250W bulb.',
                'price' => 28.00,
                'stock_quantity' => 60,
                'tags' => ['heat', 'lamp', 'infrared', 'warming']
            ],

            // Live Birds
            [
                'category' => 'live-birds',
                'name' => 'Ross 308 Broiler Chicks',
                'description' => 'High-quality Ross 308 day-old broiler chicks. Fast growth and excellent feed conversion.',
                'price' => 1.50,
                'stock_quantity' => 1000,
                'tags' => ['chicks', 'ross308', 'broiler', 'fast-growth']
            ],
            [
                'category' => 'live-birds',
                'name' => 'ISA Brown Layer Chicks',
                'description' => 'Premium ISA Brown day-old chicks. Excellent egg production and hardiness.',
                'price' => 2.00,
                'stock_quantity' => 800,
                'tags' => ['chicks', 'isa-brown', 'layer', 'eggs']
            ],
            [
                'category' => 'live-birds',
                'name' => 'Kuroiler Hybrid Chicks',
                'description' => 'Dual-purpose Kuroiler chicks suitable for both meat and egg production.',
                'price' => 2.50,
                'stock_quantity' => 600,
                'tags' => ['chicks', 'kuroiler', 'dual-purpose', 'hybrid']
            ],
            [
                'category' => 'live-birds',
                'name' => 'Indigenous Chicken Chicks',
                'description' => 'Hardy indigenous chicken chicks adapted to local conditions.',
                'price' => 3.00,
                'stock_quantity' => 400,
                'tags' => ['chicks', 'indigenous', 'hardy', 'local']
            ],

            // Technology
            [
                'category' => 'monitoring-technology',
                'name' => 'Smart Climate Controller',
                'description' => 'Advanced climate control system with smartphone monitoring and alerts.',
                'price' => 200.00,
                'stock_quantity' => 15,
                'tags' => ['climate', 'smart', 'controller', 'monitoring']
            ],
            [
                'category' => 'monitoring-technology',
                'name' => 'Digital Thermometer Hygrometer',
                'description' => 'Wireless digital thermometer and hygrometer with data logging capability.',
                'price' => 45.00,
                'stock_quantity' => 50,
                'tags' => ['thermometer', 'hygrometer', 'digital', 'wireless']
            ],
            [
                'category' => 'monitoring-technology',
                'name' => 'Poultry Farm Management App',
                'description' => 'Comprehensive farm management software with record keeping and analytics.',
                'price' => 25.00,
                'stock_quantity' => 100,
                'tags' => ['software', 'management', 'records', 'analytics']
            ]
        ];

        foreach ($products as $productData) {
            $category = $categories->where('slug', $productData['category'])->first();
            $vendor = $vendors->random();

            if (!$category) continue;

            $product = Product::create([
                'vendor_id' => $vendor->id,
                'category_id' => $category->id,
                'name' => $productData['name'],
                'slug' => Str::slug($productData['name']),
                'description' => $productData['description'],
                'short_description' => Str::limit($productData['description'], 100),
                'sku' => 'SKU' . fake()->unique()->randomNumber(6),
                'price' => $productData['price'],
                'compare_price' => $productData['compare_price'] ?? null,
                'cost_price' => $productData['price'] * 0.7, // 30% markup
                'stock_quantity' => $productData['stock_quantity'],
                'minimum_stock' => 10,
                'track_inventory' => true,
                'weight' => fake()->randomFloat(2, 0.1, 50),
                'status' => 'active',
                'is_featured' => fake()->boolean(20),
                'tags' => $productData['tags'],
                'rating' => fake()->randomFloat(2, 3.0, 5.0),
                'total_reviews' => fake()->numberBetween(5, 50),
                'total_sales' => fake()->numberBetween(10, 200),
                'view_count' => fake()->numberBetween(50, 500),
                'meta_title' => $productData['name'],
                'meta_description' => Str::limit($productData['description'], 160),
            ]);

            // Add some product images
            for ($i = 1; $i <= fake()->numberBetween(1, 3); $i++) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => 'https://placehold.co/600x400?text=' . urlencode($product->name . ' - Image ' . $i),
                    'alt_text' => $product->name . ' - Image ' . $i,
                    'sort_order' => $i,
                    'is_primary' => $i === 1,
                ]);
            }
        }
    }
}
