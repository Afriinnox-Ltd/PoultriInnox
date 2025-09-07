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
        Schema::create('applied_medications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('batch_id')->constrained('batches')->onDelete('cascade');
            $table->foreignId('medication_protocol_id')->constrained('medication_protocols');
            
            // Application details
            $table->datetime('applied_at');
            $table->integer('bird_age_days_at_application');
            $table->integer('birds_treated');
            $table->decimal('actual_dosage_used', 8, 3);
            $table->string('dosage_unit');
            $table->string('administration_method');
            
            // Reason for application
            $table->string('reason')->comment('prevention, treatment, stress_management');
            $table->text('symptoms_observed')->nullable();
            $table->enum('urgency_level', ['routine', 'urgent', 'emergency'])->default('routine');
            
            // Results tracking
            $table->enum('status', ['applied', 'monitoring', 'completed', 'ineffective'])->default('applied');
            $table->text('results_observed')->nullable();
            $table->decimal('effectiveness_rating', 3, 1)->nullable()->comment('1-10 rating');
            $table->integer('birds_recovered')->nullable();
            $table->text('side_effects_noted')->nullable();
            
            // Cost tracking
            $table->decimal('cost', 10, 2)->nullable();
            $table->datetime('withdrawal_period_ends')->nullable();
            
            // Applied by
            $table->foreignId('applied_by')->constrained('users');
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->text('notes')->nullable();
            
            $table->timestamps();
            
            $table->index(['batch_id', 'applied_at']);
            $table->index(['medication_protocol_id', 'status']);
            $table->index(['withdrawal_period_ends']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applied_medications');
    }
};
