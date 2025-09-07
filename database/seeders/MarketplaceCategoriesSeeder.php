<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Modules\Marketplace\Models\Category;

class MarketplaceCategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            // Main Categories
            [
                'name' => 'Feed & Nutrition',
                'slug' => 'feed-nutrition',
                'description' => 'Complete range of poultry feed and nutritional supplements',
                'parent_id' => null,
                'icon' => 'utensils',
                'sort_order' => 1,
                'is_active' => true,

            ],
            [
                'name' => 'Health & Medications',
                'slug' => 'health-medications',
                'description' => 'Veterinary medicines and health products for poultry',
                'parent_id' => null,
                'icon' => 'pill',
                'sort_order' => 2,
                'is_active' => true,

            ],
            [
                'name' => 'Equipment & Supplies',
                'slug' => 'equipment-supplies',
                'description' => 'Essential equipment and supplies for poultry farming',
                'parent_id' => null,
                'icon' => 'cog',
                'sort_order' => 3,
                'is_active' => true,

            ],
            [
                'name' => 'Live Birds',
                'slug' => 'live-birds',
                'description' => 'Day-old chicks and mature birds for breeding',
                'parent_id' => null,
                'icon' => 'bird',
                'sort_order' => 4,
                'is_active' => true,

            ],
            [
                'name' => 'Monitoring & Technology',
                'slug' => 'monitoring-technology',
                'description' => 'Modern technology for poultry farm management',
                'parent_id' => null,
                'icon' => 'monitor',
                'sort_order' => 5,
                'is_active' => true,

            ]
        ];

        foreach ($categories as $categoryData) {
            $children = $categoryData['children'] ?? [];
            unset($categoryData['children']);

            $category = Category::updateOrCreate(
                ['slug' => $categoryData['slug']],
                $categoryData
            );

            foreach ($children as $childData) {
                $childData['parent_id'] = $category->id;
                $childData['is_active'] = true;
                $childData['sort_order'] = 1;
                Category::updateOrCreate(
                    ['slug' => $childData['slug']],
                    $childData
                );
            }
        }
    }
}
