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
        Schema::table('batch_schedules', function (Blueprint $table) {
            // Feed-related fields for feeding schedules
            $table->foreignId('feed_type_id')->nullable()->constrained('feed_types')->onDelete('set null')->comment('Feed type for feeding schedules');
            $table->foreignId('feed_program_id')->nullable()->constrained('feed_programs')->onDelete('set null')->comment('Source feed program');
            $table->decimal('actual_quantity', 10, 2)->nullable()->comment('Actual feed amount used (for feeding schedules)');
            $table->decimal('feed_cost', 10, 2)->nullable()->comment('Cost of feed for this schedule');
            $table->json('feed_data')->nullable()->comment('Feed-specific data and measurements');
            /*
            Example feed_data structure:
            {
                "mixing_instructions": {
                    "starter_percentage": 75,
                    "grower_percentage": 25
                },
                "feeding_method": "automatic_feeder",
                "feeder_locations": ["A1", "A2", "B1"],
                "quality_check": true,
                "consumption_rate": "normal",
                "bird_behavior": "good_appetite",
                "waste_percentage": 2.5,
                "environmental_conditions": {
                    "temperature": 24.5,
                    "humidity": 65.0,
                    "weather": "normal"
                }
            }
            */
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        try {
            Schema::table('batch_schedules', function (Blueprint $table) {
                $table->dropForeign(['feed_type_id']);
                $table->dropForeign(['feed_program_id']);
                $table->dropColumn([
                    'feed_type_id',
                    'feed_program_id',
                    'actual_quantity',
                    'feed_cost',
                    'feed_data'
                ]);
            });
        } catch (\Illuminate\Database\QueryException $e) {
            if (!str_contains($e->getMessage(), "Can't DROP FOREIGN KEY")) {
                throw $e;
            }
        }
    }
};
