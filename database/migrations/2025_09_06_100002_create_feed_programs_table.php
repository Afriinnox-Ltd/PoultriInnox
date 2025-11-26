<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('feed_programs', function (Blueprint $table) {
            $table->id();

            // Basic information
            $table->string('name')->comment('Program name');
            $table->string('code')->unique()->comment('Unique program code');
            $table->text('description')->comment('Program description');
            $table->string('version')->default('1.0')->comment('Program version');

            // Target specification
            $table->enum('breed_type', ['broiler', 'layer', 'dual_purpose', 'breeder', 'universal'])->comment('Target breed type');
            $table->string('specific_breed', 100)->nullable()->comment('Specific breed if applicable');
            $table->integer('target_batch_size_min')->nullable()->comment('Minimum batch size');
            $table->integer('target_batch_size_max')->nullable()->comment('Maximum batch size');

            // Program data - JSON structure containing weekly feeding schedules
            $table->json('program_data')->comment('Weekly feeding schedule and specifications');
            /*
            Example program_data structure:
            {
                "weeks": {
                    "1": {
                        "feed_type": "starter",
                        "protein_content": 20,
                        "daily_amount_per_bird": 20,
                        "feeding_frequency": 4,
                        "feeding_times": ["06:00", "12:00", "18:00", "22:00"],
                        "notes": "Critical period - monitor closely"
                    },
                    "2-6": {
                        "feed_type": "starter",
                        "protein_content": 18,
                        "daily_amount_per_bird": "progressive_20_to_80",
                        "feeding_frequency": 3,
                        "growth_adjustments": true
                    }
                },
                "transitions": {
                    "starter_to_grower": {
                        "start_week": 7,
                        "transition_days": 3,
                        "mixing_schedule": {
                            "day_1": {"starter": 75, "grower": 25},
                            "day_2": {"starter": 50, "grower": 50},
                            "day_3": {"starter": 25, "grower": 75}
                        }
                    }
                },
                "adjustments": {
                    "weather": {
                        "hot_weather": {"reduction_percentage": 10},
                        "cold_weather": {"increase_percentage": 5}
                    },
                    "mortality_high": {"increase_quality": true},
                    "growth_slow": {"increase_protein": 2}
                }
            }
            */

            // Performance expectations
            $table->decimal('expected_fcr', 4, 2)->nullable()->comment('Expected Feed Conversion Ratio');
            $table->decimal('expected_survival_rate', 5, 2)->nullable()->comment('Expected survival rate percentage');
            $table->integer('total_duration_days')->nullable()->comment('Total program duration in days');
            $table->decimal('estimated_cost_per_bird', 10, 2)->nullable()->comment('Estimated feed cost per bird');

            // Status and metadata
            $table->enum('status', ['draft', 'active', 'archived', 'deprecated'])->default('draft');
            $table->boolean('is_default')->default(false)->comment('Default program for breed type');
            $table->boolean('is_template')->default(false)->comment('Available as template');
            $table->boolean('requires_approval')->default(false)->comment('Requires admin approval');

            // Usage tracking
            $table->integer('usage_count')->default(0)->comment('Number of times used');
            $table->decimal('success_rate', 5, 2)->nullable()->comment('Success rate from historical data');
            $table->json('performance_metrics')->nullable()->comment('Historical performance data');

            // Source and authoring
            $table->enum('source', ['admin_created', 'user_created', 'imported', 'ai_generated'])->default('admin_created');
            $table->string('source_file')->nullable()->comment('Original source file if imported');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();

            // Audit fields
            $table->timestamps();

            // Indexes
            $table->index(['breed_type', 'status']);
            $table->index(['specific_breed']);
            $table->index(['is_default', 'status']);
            $table->index(['created_by']);
            $table->index(['expected_fcr']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feed_programs');
    }
};
