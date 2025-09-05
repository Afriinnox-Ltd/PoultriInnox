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
        Schema::create('feed_types', function (Blueprint $table) {
            $table->id();

            // Basic information
            $table->string('name')->comment('Feed type name');
            $table->string('code')->unique()->comment('Unique code for feed type');
            $table->text('description')->nullable()->comment('Detailed description');
            $table->enum('category', ['starter', 'grower', 'layer', 'finisher', 'breeder', 'specialist'])->comment('Feed category');

            // Nutritional information
            $table->decimal('protein_content', 5, 2)->comment('Protein percentage');
            $table->decimal('energy_content', 8, 2)->nullable()->comment('Energy content (kcal/kg)');
            $table->decimal('calcium_content', 5, 2)->nullable()->comment('Calcium percentage');
            $table->decimal('phosphorus_content', 5, 2)->nullable()->comment('Phosphorus percentage');
            $table->decimal('fiber_content', 5, 2)->nullable()->comment('Fiber percentage');
            $table->decimal('fat_content', 5, 2)->nullable()->comment('Fat percentage');
            $table->json('additional_nutrients')->nullable()->comment('Other nutrients and additives');

            // Pricing and sourcing
            $table->decimal('cost_per_kg', 10, 2)->comment('Cost per kilogram');
            $table->string('currency', 3)->default('USD')->comment('Currency code');
            $table->decimal('minimum_order_quantity', 10, 2)->nullable()->comment('Minimum order quantity');
            $table->string('unit_of_measure')->default('kg')->comment('Unit of measurement');

            // Target usage
            $table->string('target_breed')->nullable()->comment('Target poultry breed');
            $table->integer('target_age_start')->nullable()->comment('Starting age in days');
            $table->integer('target_age_end')->nullable()->comment('Ending age in days');
            $table->text('usage_instructions')->nullable()->comment('Feeding instructions');

            // Quality and safety
            $table->integer('shelf_life_days')->default(90)->comment('Shelf life in days');
            $table->json('quality_standards')->nullable()->comment('Quality certifications and standards');
            $table->text('storage_requirements')->nullable()->comment('Storage requirements');

            // Status and metadata
            $table->enum('status', ['active', 'inactive', 'discontinued'])->default('active');
            $table->boolean('requires_prescription')->default(false)->comment('Requires veterinary prescription');
            $table->boolean('is_organic')->default(false)->comment('Organic certification');
            $table->boolean('is_medicated')->default(false)->comment('Contains medication');

            // Audit fields
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            // Indexes
            $table->index(['category', 'status']);
            $table->index(['target_breed']);
            $table->index(['protein_content']);
            $table->index(['created_by']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feed_types');
    }
};
