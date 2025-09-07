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
                'category' => 'starter-feed',
                'name' => 'Premium Chick Starter Feed',
                'description' => 'High-quality starter feed formulated for chicks 0-6 weeks old. Contains essential nutrients for optimal growth and development.',
                'price' => 45.00,
                'compare_price' => 50.00,
                'stock_quantity' => 500,
                'tags' => ['starter', 'chicks', 'premium', 'nutrition']
            ],
            [
                'category' => 'layer-feed',
                'name' => 'Layer Mash Complete Feed',
                'description' => 'Balanced nutrition for laying hens. Formulated to maximize egg production and shell quality.',
                'price' => 42.00,
                'stock_quantity' => 300,
                'tags' => ['layer', 'eggs', 'hens', 'production']
            ],
            [
                'category' => 'broiler-feed',
                'name' => 'Broiler Finisher Feed',
                'description' => 'High-energy feed for broiler chickens in finishing stage. Promotes rapid weight gain.',
                'price' => 40.00,
                'stock_quantity' => 250,
                'tags' => ['broiler', 'finisher', 'meat', 'growth']
            ],

            // Health Products
            [
                'category' => 'vaccines',
                'name' => 'Newcastle Disease Vaccine',
                'description' => 'Live attenuated vaccine for protection against Newcastle Disease in poultry.',
                'price' => 15.00,
                'stock_quantity' => 100,
                'tags' => ['vaccine', 'newcastle', 'prevention', 'health']
            ],
            [
                'category' => 'antibiotics',
                'name' => 'Broad Spectrum Antibiotic',
                'description' => 'Effective treatment for bacterial infections in poultry. Veterinary prescription required.',
                'price' => 25.00,
                'stock_quantity' => 75,
                'tags' => ['antibiotic', 'treatment', 'bacterial', 'prescription']
            ],
            [
                'category' => 'probiotics',
                'name' => 'Poultry Probiotic Supplement',
                'description' => 'Natural probiotic supplement to improve gut health and immunity.',
                'price' => 18.00,
                'stock_quantity' => 150,
                'tags' => ['probiotic', 'gut-health', 'immunity', 'natural']
            ],

            // Equipment
            [
                'category' => 'incubators',
                'name' => 'Digital Egg Incubator 48 Eggs',
                'description' => 'Fully automatic digital incubator with temperature and humidity control. Capacity: 48 eggs.',
                'price' => 150.00,
                'compare_price' => 180.00,
                'stock_quantity' => 25,
                'tags' => ['incubator', 'digital', 'automatic', 'eggs']
            ],
            [
                'category' => 'feeders',
                'name' => 'Automatic Hanging Feeder',
                'description' => 'Durable plastic hanging feeder with adjustable flow control. Suitable for all poultry types.',
                'price' => 12.00,
                'stock_quantity' => 200,
                'tags' => ['feeder', 'automatic', 'hanging', 'plastic']
            ],
            [
                'category' => 'waterers',
                'name' => 'Nipple Water System',
                'description' => 'Professional nipple watering system for clean and efficient water supply.',
                'price' => 35.00,
                'stock_quantity' => 80,
                'tags' => ['waterer', 'nipple', 'clean', 'efficient']
            ],

            // Live Birds
            [
                'category' => 'day-old-chicks',
                'name' => 'Ross 308 Broiler Chicks',
                'description' => 'High-quality Ross 308 day-old broiler chicks. Fast growth and excellent feed conversion.',
                'price' => 1.50,
                'stock_quantity' => 1000,
                'tags' => ['chicks', 'ross308', 'broiler', 'fast-growth']
            ],
            [
                'category' => 'day-old-chicks',
                'name' => 'ISA Brown Layer Chicks',
                'description' => 'Premium ISA Brown day-old chicks. Excellent egg production and hardiness.',
                'price' => 2.00,
                'stock_quantity' => 800,
                'tags' => ['chicks', 'isa-brown', 'layer', 'eggs']
            ],

            // Technology
            [
                'category' => 'environmental-controls',
                'name' => 'Smart Climate Controller',
                'description' => 'Advanced climate control system with smartphone monitoring and alerts.',
                'price' => 200.00,
                'stock_quantity' => 15,
                'tags' => ['climate', 'smart', 'controller', 'monitoring']
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
                'currency' => 'KES',
                'stock_quantity' => $productData['stock_quantity'],
                'low_stock_threshold' => 10,
                'manage_stock' => true,
                'in_stock' => true,
                'weight' => fake()->randomFloat(2, 0.1, 50),
                'status' => 'active',
                'visibility' => 'public',
                'featured' => fake()->boolean(20),
                'images' => [
                    'https://placehold.co/600x400?text=' . urlencode($productData['name']),
                    'https://placehold.co/600x400?text=' . urlencode($productData['name'] . ' - Detail'),
                ],
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
