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
        Schema::create('feed_consumptions', function (Blueprint $table) {
            $table->id();

            // Related entities
            $table->foreignId('batch_id')->constrained('batches')->onDelete('cascade');
            $table->foreignId('feed_type_id')->constrained('feed_types')->onDelete('cascade');
            $table->foreignId('feed_inventory_id')->nullable()->constrained('feed_inventory')->onDelete('set null');
            $table->foreignId('schedule_id')->nullable()->constrained('batch_schedules')->onDelete('set null');

            // Consumption data
            $table->date('consumption_date')->comment('Date of feed consumption');
            $table->decimal('planned_amount', 10, 2)->comment('Planned feed amount');
            $table->decimal('actual_amount', 10, 2)->comment('Actual feed amount consumed');
            $table->decimal('variance_amount', 10, 2)->virtualAs('actual_amount - planned_amount')->comment('Variance from planned');
            $table->decimal('variance_percentage', 5, 2)->virtualAs('((actual_amount - planned_amount) / planned_amount) * 100')->comment('Variance percentage');
            $table->string('unit_of_measure')->default('kg')->comment('Unit of measurement');

            // Batch context at time of consumption
            $table->integer('bird_count')->comment('Number of birds at time of consumption');
            $table->decimal('average_bird_weight', 8, 2)->nullable()->comment('Average bird weight (grams)');
            $table->integer('bird_age_days')->comment('Age of birds in days');
            $table->decimal('mortality_count', 8, 2)->default(0)->comment('Mortality since last feeding');

            // Feed Conversion Ratio calculations
            $table->decimal('weight_gain', 10, 2)->nullable()->comment('Weight gain since last measurement (grams)');
            $table->decimal('fcr', 6, 3)->nullable()->comment('Feed Conversion Ratio for this period');
            $table->decimal('cumulative_fcr', 6, 3)->nullable()->comment('Cumulative FCR up to this point');

            // Cost tracking
            $table->decimal('feed_cost_per_unit', 10, 2)->comment('Cost per unit of feed at time of consumption');
            $table->decimal('total_feed_cost', 10, 2)->comment('Total cost of feed consumed');
            $table->decimal('cost_per_bird', 10, 2)->virtualAs('total_feed_cost / bird_count')->comment('Cost per bird for this feeding');
            $table->string('currency', 3)->default('USD')->comment('Currency code');

            // Environmental factors
            $table->decimal('temperature', 5, 2)->nullable()->comment('Average temperature during feeding period');
            $table->decimal('humidity', 5, 2)->nullable()->comment('Average humidity during feeding period');
            $table->enum('weather_condition', ['normal', 'hot', 'cold', 'humid', 'dry'])->nullable()->comment('Weather condition');

            // Feeding details
            $table->time('feeding_time')->nullable()->comment('Time of feeding');
            $table->integer('feeding_duration_minutes')->nullable()->comment('Duration of feeding in minutes');
            $table->enum('feeding_method', ['manual', 'automatic', 'semi_automatic'])->default('manual')->comment('Method of feeding');
            $table->text('feeding_notes')->nullable()->comment('Notes about feeding session');

            // Quality and observation
            $table->enum('feed_acceptance', ['excellent', 'good', 'average', 'poor', 'rejected'])->nullable()->comment('Bird acceptance of feed');
            $table->decimal('waste_percentage', 5, 2)->default(0)->comment('Estimated feed waste percentage');
            $table->text('observations')->nullable()->comment('Behavioral and health observations');
            $table->boolean('issues_reported')->default(false)->comment('Any issues reported during feeding');

            // Record keeping
            $table->enum('recording_method', ['manual', 'automatic', 'estimated'])->default('manual')->comment('How consumption was recorded');
            $table->foreignId('recorded_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('verified_at')->nullable()->comment('When record was verified');

            // Audit fields
            $table->timestamps();

            // Indexes
            $table->index(['batch_id', 'consumption_date']);
            $table->index(['feed_type_id', 'consumption_date']);
            $table->index(['consumption_date']);
            $table->index(['fcr']);
            $table->index(['schedule_id']);
            $table->index(['recorded_by']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feed_consumptions');
    }
};
