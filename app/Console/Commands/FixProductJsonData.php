<?php

namespace App\Console\Commands;

use App\Modules\Marketplace\Models\Product;
use Illuminate\Console\Command;

class FixProductJsonData extends Command
{
    protected $signature = 'products:fix-json-data';
    protected $description = 'Fix double-encoded JSON data in product tags and payment methods';

    public function handle()
    {
        $products = Product::all();
        $fixedCount = 0;

        foreach ($products as $product) {
            $updated = false;
            
            foreach (['tags', 'payment_methods'] as $field) {
                $value = $product->getRawOriginal($field);
                
                if (is_string($value) && (str_starts_with($value, '"[') || str_starts_with($value, '" {'))) {
                    // It looks like double-encoded JSON (starts with a quote followed by a bracket/brace)
                    // e.g. "[\"tag1\"]"
                    $decoded = json_decode($value);
                    
                    if (is_string($decoded)) {
                        $this->info("Fixing $field for product #{$product->id}");
                        // Update with the correctly decoded array
                        $product->$field = json_decode($decoded, true);
                        $updated = true;
                    }
                }
            }

            if ($updated) {
                $product->save();
                $fixedCount++;
            }
        }

        $this->info("Successfully fixed $fixedCount products.");
        return Command::SUCCESS;
    }
}
