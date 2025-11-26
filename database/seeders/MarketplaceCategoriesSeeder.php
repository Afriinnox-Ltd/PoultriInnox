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
            [
                'name' => 'Equipment, Tools, Machines & Technologies',
                'slug' => 'equipment-tools-machines',
                'description' => 'Farming equipment, tools, and modern technologies',
                'icon' => '🏭',
                'color' => '#607d8b',
                'sort_order' => 1,
                'is_active' => true,
                'children' => []
            ],
            [
                'name' => 'Live Animals',
                'slug' => 'live-animals',
                'description' => 'Livestock for breeding and farming',
                'icon' => '🐄',
                'color' => '#795548',
                'sort_order' => 2,
                'is_active' => true,
                'children' => [
                    ['name' => 'Poultry', 'slug' => 'poultry', 'description' => 'Chickens, ducks, turkeys, and other poultry', 'icon' => 'bird'],
                    ['name' => 'Cattle', 'slug' => 'cattle', 'description' => 'Dairy and beef cattle', 'icon' => 'milk'],
                    ['name' => 'Pigs', 'slug' => 'pigs', 'description' => 'Breeding and meat pigs', 'icon' => 'banknote'],
                    ['name' => 'Goats', 'slug' => 'goats', 'description' => 'Dairy and meat goats', 'icon' => 'mountain'],
                    ['name' => 'Sheep', 'slug' => 'sheep', 'description' => 'Wool and meat sheep', 'icon' => 'cloud'],
                    ['name' => 'Fish (Aquaculture)', 'slug' => 'fish-aquaculture-live', 'description' => 'Fish farming stock', 'icon' => 'fish'],
                    ['name' => 'Bees', 'slug' => 'bees', 'description' => 'Bees and colonies', 'icon' => 'flower'],
                    ['name' => 'Rabbits', 'slug' => 'rabbits', 'description' => 'Breeding rabbits', 'icon' => 'rabbit'],
                ]
            ],
            [
                'name' => 'Meat & Animal Protein',
                'slug' => 'meat-animal-protein',
                'description' => 'Fresh and processed meat products',
                'icon' => '🥩',
                'color' => '#f44336',
                'sort_order' => 3,
                'is_active' => true,
                'children' => [
                    ['name' => 'Beef', 'slug' => 'beef', 'description' => 'Fresh beef products', 'icon' => 'circle-dot'],
                    ['name' => 'Goat Meat', 'slug' => 'goat-meat', 'description' => 'Fresh goat meat', 'icon' => 'circle-dot'],
                    ['name' => 'Mutton', 'slug' => 'mutton', 'description' => 'Sheep meat', 'icon' => 'circle-dot'],
                    ['name' => 'Pork', 'slug' => 'pork', 'description' => 'Fresh pork products', 'icon' => 'circle-dot'],
                    ['name' => 'Poultry Meat', 'slug' => 'poultry-meat', 'description' => 'Chicken, turkey, duck meat', 'icon' => 'circle-dot'],
                    ['name' => 'Fish (Meat)', 'slug' => 'fish-meat', 'description' => 'Fresh, smoked, and dried fish', 'icon' => 'fish'],
                ]
            ],
            [
                'name' => 'Milk & Dairy Products',
                'slug' => 'milk-dairy-products',
                'description' => 'Fresh milk and processed dairy',
                'icon' => '🥛',
                'color' => '#03a9f4',
                'sort_order' => 4,
                'is_active' => true,
                'children' => [
                    ['name' => 'Fresh Milk', 'slug' => 'fresh-milk', 'description' => 'Raw and pasteurized milk', 'icon' => 'droplet'],
                    ['name' => 'Ikivuguto', 'slug' => 'ikivuguto', 'description' => 'Traditional fermented milk', 'icon' => 'wine'],
                    ['name' => 'Yogurt', 'slug' => 'yogurt', 'description' => 'Flavored and plain yogurt', 'icon' => 'cup-soda'],
                    ['name' => 'Cheese', 'slug' => 'cheese', 'description' => 'Various types of cheese', 'icon' => 'circle'],
                    ['name' => 'Butter & Ghee', 'slug' => 'butter-ghee', 'description' => 'Cooking fats and spreads', 'icon' => 'circle'],
                ]
            ],
            [
                'name' => 'Eggs & Poultry Products',
                'slug' => 'eggs-poultry-products',
                'description' => 'Eggs and other poultry by-products',
                'icon' => '🥚',
                'color' => '#fbc02d',
                'sort_order' => 5,
                'is_active' => true,
                'children' => [
                    ['name' => 'Table Eggs', 'slug' => 'table-eggs', 'description' => 'Eggs for consumption', 'icon' => 'egg'],
                    ['name' => 'Fertilized Eggs', 'slug' => 'fertilized-eggs', 'description' => 'Eggs for hatching', 'icon' => 'egg-off'],
                    ['name' => 'Day-old Chicks', 'slug' => 'day-old-chicks', 'description' => 'Chicks for rearing', 'icon' => 'bird'],
                    ['name' => 'Feathers', 'slug' => 'feathers', 'description' => 'Poultry feathers', 'icon' => 'feather'],
                ]
            ],
            [
                'name' => 'Beekeeping Products',
                'slug' => 'beekeeping-products',
                'description' => 'Honey and apiary products',
                'icon' => '🐝',
                'color' => '#ff9800',
                'sort_order' => 6,
                'is_active' => true,
                'children' => [
                    ['name' => 'Honey', 'slug' => 'honey', 'description' => 'Pure and processed honey', 'icon' => 'hexagon'],
                    ['name' => 'Beeswax', 'slug' => 'beeswax', 'description' => 'Natural beeswax', 'icon' => 'circle'],
                    ['name' => 'Propolis', 'slug' => 'propolis', 'description' => 'Bee propolis', 'icon' => 'shield'],
                    ['name' => 'Royal Jelly', 'slug' => 'royal-jelly', 'description' => 'Royal jelly supplements', 'icon' => 'star'],
                    ['name' => 'Beehives', 'slug' => 'beehives', 'description' => 'Housing for bee colonies', 'icon' => 'box'],
                ]
            ],
            [
                'name' => 'Manure & Organic Fertilizers',
                'slug' => 'manure-organic-fertilizers',
                'description' => 'Natural fertilizers for farming',
                'icon' => '🌱',
                'color' => '#4caf50',
                'sort_order' => 7,
                'is_active' => true,
                'children' => [
                    ['name' => 'Cattle Manure', 'slug' => 'cattle-manure', 'description' => 'Organic cattle fertilizer', 'icon' => 'shovel'],
                    ['name' => 'Poultry Manure', 'slug' => 'poultry-manure', 'description' => 'Rich poultry fertilizer', 'icon' => 'shovel'],
                    ['name' => 'Pig & Rabbit Manure', 'slug' => 'pig-rabbit-manure', 'description' => 'Combined organic manure', 'icon' => 'shovel'],
                    ['name' => 'Fish Waste Fertilizer', 'slug' => 'fish-waste-fertilizer', 'description' => 'Aquaponics waste fertilizer', 'icon' => 'droplet'],
                    ['name' => 'Compost', 'slug' => 'compost', 'description' => 'Decomposed organic matter', 'icon' => 'recycle'],
                ]
            ],
            [
                'name' => 'Skins, Hides & By-Products',
                'slug' => 'skins-hides-by-products',
                'description' => 'Animal skins and processing materials',
                'icon' => '🧴',
                'color' => '#8d6e63',
                'sort_order' => 8,
                'is_active' => true,
                'children' => [
                    ['name' => 'Cow Hides', 'slug' => 'cow-hides', 'description' => 'Processed cow hides', 'icon' => 'file'],
                    ['name' => 'Goat & Sheep Skins', 'slug' => 'goat-sheep-skins', 'description' => 'Leather materials', 'icon' => 'file'],
                    ['name' => 'Bones', 'slug' => 'bones', 'description' => 'Animal bones', 'icon' => 'bone'],
                    ['name' => 'Blood Meal', 'slug' => 'blood-meal', 'description' => 'High-nitrogen fertilizer', 'icon' => 'droplet'],
                    ['name' => 'Horns & Hooves', 'slug' => 'horns-hooves', 'description' => 'Keratin-based by-products', 'icon' => 'triangle'],
                ]
            ],
            [
                'name' => 'Aquaculture Supplies',
                'slug' => 'aquaculture-supplies',
                'description' => 'Supplies for fish farming',
                'icon' => '🐟',
                'color' => '#00bcd4',
                'sort_order' => 9,
                'is_active' => true,
                'children' => [
                    ['name' => 'Fingerlings', 'slug' => 'fingerlings', 'description' => 'Young fish for stocking', 'icon' => 'fish'],
                    ['name' => 'Fish Feed', 'slug' => 'fish-feed', 'description' => 'Nutritional feed for fish', 'icon' => 'utensils'],
                    ['name' => 'Fish Farming Equipment', 'slug' => 'fish-farming-equipment', 'description' => 'Tanks, nets, and aerators', 'icon' => 'settings'],
                ]
            ],
            [
                'name' => 'Livestock Inputs & Supplies',
                'slug' => 'livestock-inputs-supplies',
                'description' => 'General supplies for livestock care',
                'icon' => '🧰',
                'color' => '#9c27b0',
                'sort_order' => 10,
                'is_active' => true,
                'children' => [
                    ['name' => 'Animal Feed', 'slug' => 'animal-feed', 'description' => 'General livestock feed', 'icon' => 'utensils'],
                    ['name' => 'Veterinary Drugs', 'slug' => 'veterinary-drugs', 'description' => 'Medicines for animal health', 'icon' => 'pill'],
                    ['name' => 'Supplements', 'slug' => 'livestock-supplements', 'description' => 'Nutritional boosters', 'icon' => 'zap'],
                    ['name' => 'Vaccines', 'slug' => 'vaccines', 'description' => 'Disease prevention vaccines', 'icon' => 'syringe'],
                ]
            ],
            [
                'name' => 'Value-Added Livestock Products',
                'slug' => 'value-added-products',
                'description' => 'Processed and packaged goods',
                'icon' => '🏭',
                'color' => '#3f51b5',
                'sort_order' => 11,
                'is_active' => true,
                'children' => [
                    ['name' => 'Smoked & Dried Meat', 'slug' => 'smoked-dried-meat', 'description' => 'Preserved meat products', 'icon' => 'flame'],
                    ['name' => 'Packaged Dairy', 'slug' => 'packaged-dairy', 'description' => 'Retail-ready dairy', 'icon' => 'milk'],
                    ['name' => 'Packaged Manure', 'slug' => 'packaged-manure', 'description' => 'Bagged fertilizer', 'icon' => 'package'],
                    ['name' => 'Processed Feed', 'slug' => 'processed-feed', 'description' => 'Specialized animal feed', 'icon' => 'wheat'],
                    ['name' => 'Leather Products', 'slug' => 'leather-products', 'description' => 'Finished leather goods', 'icon' => 'briefcase'],
                ]
            ],
            [
                'name' => 'Others',
                'slug' => 'others',
                'description' => 'Other products',
                'icon' => '📦',
                'color' => '#9e9e9e',
                'sort_order' => 12,
                'is_active' => true,
                'children' => []
            ],
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
