<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('marketplace_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained('marketplace_vendors')->onDelete('cascade');
            $table->foreignId('category_id')->constrained('marketplace_categories');
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description');
            $table->text('short_description')->nullable();
            $table->string('sku')->unique();

            // Pricing
            $table->decimal('price', 10, 2);
            $table->decimal('compare_price', 10, 2)->nullable(); // Original price for discounts
            $table->decimal('cost_price', 10, 2)->nullable(); // Vendor's cost

            // Inventory
            $table->integer('stock_quantity')->default(0);
            $table->integer('minimum_stock')->default(0);
            $table->boolean('track_inventory')->default(true);
            $table->boolean('allow_backorders')->default(false);

            // Product specifications
            $table->decimal('weight', 8, 2)->nullable(); // in kg
            $table->json('dimensions')->nullable(); // length, width, height
            $table->string('unit_of_measure')->default('piece'); // kg, liter, piece, etc.
            $table->integer('minimum_order_quantity')->default(1);

            // Poultry-specific fields
            $table->json('suitable_for_breeds')->nullable(); // Array of breed types
            $table->json('suitable_for_ages')->nullable(); // Age ranges
            $table->string('product_type')->nullable(); // feed, medication, equipment, etc.
            $table->json('nutritional_info')->nullable(); // For feed products
            $table->json('active_ingredients')->nullable(); // For medications

            // SEO and marketing
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->json('tags')->nullable();

            // Status and visibility
            $table->enum('status', ['draft', 'active', 'inactive', 'out_of_stock'])->default('draft');
            $table->boolean('is_featured')->default(false);
            $table->boolean('requires_prescription')->default(false); // For medications
            $table->timestamp('available_from')->nullable();
            $table->timestamp('available_until')->nullable();

            // Ratings and stats
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('total_reviews')->default(0);
            $table->integer('total_sales')->default(0);
            $table->integer('view_count')->default(0);

            // Shipping
            $table->boolean('requires_shipping')->default(true);
            $table->decimal('shipping_weight', 8, 2)->nullable();
            $table->boolean('free_shipping')->default(false);
            $table->decimal('shipping_cost', 8, 2)->nullable();

            $table->timestamps();

            $table->index(['vendor_id', 'status']);
            $table->index(['category_id', 'status']);
            $table->index(['status', 'is_featured']);
            $table->index('rating');
            $table->index('product_type');
            // Note: SQLite doesn't support fulltext indexing, will implement search differently
            $table->index('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marketplace_products');
    }
};
