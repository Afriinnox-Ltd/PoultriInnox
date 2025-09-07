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
        Schema::create('medication_protocols', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('medication_name');
            $table->string('medication_type')->comment('antibiotic, vitamin, probiotic, etc');
            $table->text('description')->nullable();
            
            // Target specifications
            $table->json('target_breeds')->nullable()->comment('Array of breeds this medication is for');
            $table->string('bird_type')->default('chicken')->comment('chicken, turkey, duck, etc');
            $table->string('purpose')->nullable()->comment('broiler, layer, breeder');
            $table->integer('min_age_days')->default(0)->comment('Minimum age to apply medication');
            $table->integer('max_age_days')->nullable()->comment('Maximum age to apply medication');
            
            // Medication details
            $table->string('active_ingredient');
            $table->decimal('dosage_per_kg_body_weight', 8, 3)->nullable()->comment('Dosage per kg of body weight');
            $table->decimal('dosage_per_bird', 8, 3)->nullable()->comment('Fixed dosage per bird');
            $table->string('dosage_unit')->default('ml')->comment('ml, mg, g, tablets');
            $table->string('administration_method')->comment('water, feed, injection, oral');
            $table->integer('treatment_duration_days')->default(1);
            
            // Scheduling
            $table->json('application_schedule')->comment('When to apply during bird lifecycle');
            /*
            Example:
            {
                "schedule_type": "age_based",
                "applications": [
                    {"age_days": 1, "purpose": "prevention", "dosage_modifier": 1.0},
                    {"age_days": 21, "purpose": "booster", "dosage_modifier": 1.2}
                ]
            }
            OR
            {
                "schedule_type": "event_based",
                "triggers": ["stress", "disease_outbreak", "transport"]
            }
            */
            
            // Safety and restrictions
            $table->integer('withdrawal_period_days')->default(0)->comment('Days before slaughter/egg consumption');
            $table->json('contraindications')->nullable()->comment('When not to use this medication');
            $table->text('precautions')->nullable();
            $table->text('side_effects')->nullable();
            
            // Cost and supplier info
            $table->decimal('cost_per_unit', 10, 2)->nullable();
            $table->string('supplier')->nullable();
            $table->string('batch_number')->nullable();
            $table->date('expiry_date')->nullable();
            
            // Usage tracking
            $table->integer('usage_count')->default(0);
            $table->decimal('success_rate', 5, 2)->nullable()->comment('Success rate from historical data');
            $table->json('effectiveness_data')->nullable();
            
            // Admin management
            $table->enum('status', ['active', 'inactive', 'discontinued'])->default('active');
            $table->boolean('requires_prescription')->default(false);
            $table->boolean('is_emergency_protocol')->default(false);
            $table->boolean('auto_recommend')->default(true);
            
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->timestamps();
            
            $table->index(['bird_type', 'purpose']);
            $table->index(['medication_type', 'status']);
            $table->index(['min_age_days', 'max_age_days']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medication_protocols');
    }
};
