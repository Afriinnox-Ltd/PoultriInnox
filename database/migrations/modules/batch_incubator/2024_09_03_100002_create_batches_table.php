<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Modules\BatchIncubator\Enums\BatchStatus;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('batches', function (Blueprint $table) {
            $table->id();
            $table->string('batch_code')->unique()->comment('Unique batch identifier/code');
            $table->string('name')->comment('Human-readable batch name');
            $table->text('description')->nullable()->comment('Batch description and notes');

            // Batch specifications
            $table->string('breed')->nullable()->comment('Chicken breed');
            $table->integer('initial_count')->comment('Initial number of eggs/chicks');
            $table->integer('current_count')->comment('Current live count');
            $table->decimal('initial_weight', 8, 2)->nullable()->comment('Initial total weight in grams');
            $table->decimal('current_weight', 8, 2)->nullable()->comment('Current total weight in grams');

            // Lifecycle tracking
            $table->enum('status', BatchStatus::values())->default(BatchStatus::PLANNED->value);
            $table->date('hatch_date')->nullable()->comment('Expected/actual hatch date');
            $table->date('start_date')->comment('Batch start date');
            $table->date('expected_completion_date')->nullable()->comment('Expected completion/harvest date');
            $table->date('actual_completion_date')->nullable()->comment('Actual completion date');

            // Incubator assignment
            $table->foreignId('incubator_id')->nullable()->constrained('incubators')->onDelete('set null');
            $table->timestamp('incubator_assigned_at')->nullable()->comment('When assigned to incubator');

            // Environmental tracking
            $table->decimal('avg_temperature', 5, 2)->nullable()->comment('Average temperature maintained');
            $table->decimal('avg_humidity', 5, 2)->nullable()->comment('Average humidity maintained');

            // Health and mortality tracking
            $table->integer('mortality_count')->default(0)->comment('Total mortality count');
            $table->decimal('mortality_rate', 5, 2)->default(0)->comment('Mortality rate percentage');
            $table->integer('cull_count')->default(0)->comment('Number of culled birds');

            // Production tracking (for laying hens)
            $table->integer('total_eggs_produced')->default(0)->comment('Total eggs produced by batch');
            $table->decimal('avg_daily_production', 5, 2)->default(0)->comment('Average daily egg production');

            // Financial tracking
            $table->decimal('initial_cost', 10, 2)->default(0)->comment('Initial investment cost');
            $table->decimal('feed_cost', 10, 2)->default(0)->comment('Total feed cost');
            $table->decimal('medication_cost', 10, 2)->default(0)->comment('Total medication cost');
            $table->decimal('other_costs', 10, 2)->default(0)->comment('Other operational costs');
            $table->decimal('revenue', 10, 2)->default(0)->comment('Revenue generated');

            // Metadata
            $table->json('batch_data')->nullable()->comment('Additional batch data as JSON');
            $table->json('performance_metrics')->nullable()->comment('Performance metrics and KPIs');

            // Ownership and management
            $table->foreignId('manager_id')->constrained('users')->onDelete('cascade');
            $table->json('authorized_users')->nullable()->comment('Users with access to this batch');

            // Timestamps
            $table->timestamps();

            // Indexes
            $table->index(['status']);
            $table->index(['manager_id']);
            $table->index(['incubator_id']);
            $table->index(['start_date', 'status']);
            $table->index(['batch_code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('batches');
    }
};
