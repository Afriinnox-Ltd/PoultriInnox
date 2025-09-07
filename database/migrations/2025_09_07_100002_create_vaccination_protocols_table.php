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
        Schema::create('vaccination_protocols', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('vaccine_name');
            $table->string('vaccine_type')->comment('live, killed, subunit, etc');
            $table->text('description')->nullable();
            
            // Target specifications
            $table->json('target_breeds')->nullable()->comment('Array of breeds this vaccine is for');
            $table->string('bird_type')->default('chicken')->comment('chicken, turkey, duck, etc');
            $table->string('purpose')->nullable()->comment('broiler, layer, breeder');
            $table->integer('min_age_days')->default(0);
            $table->integer('max_age_days')->nullable();
            
            // Disease prevention
            $table->string('prevents_disease')->comment('Newcastle, Gumboro, Fowl Pox, etc');
            $table->enum('priority_level', ['critical', 'high', 'medium', 'low'])->default('medium');
            $table->boolean('is_mandatory')->default(false);
            $table->boolean('is_seasonal')->default(false);
            
            // Vaccination details
            $table->decimal('dosage_per_bird', 8, 3)->comment('Dosage per bird');
            $table->string('dosage_unit')->default('dose')->comment('dose, ml, drops');
            $table->string('administration_method')->comment('water, injection, spray, eye drop');
            $table->string('administration_route')->nullable()->comment('subcutaneous, intramuscular, etc');
            
            // Scheduling
            $table->json('vaccination_schedule')->comment('When to vaccinate during bird lifecycle');
            /*
            Example:
            {
                "schedule_type": "age_based",
                "vaccinations": [
                    {
                        "age_days": 1,
                        "is_primary": true,
                        "description": "Day-old vaccination at hatchery"
                    },
                    {
                        "age_days": 21,
                        "is_booster": true,
                        "description": "First booster vaccination"
                    }
                ]
            }
            */
            
            // Booster requirements
            $table->boolean('requires_booster')->default(false);
            $table->integer('booster_interval_days')->nullable();
            $table->integer('immunity_duration_days')->nullable();
            
            // Safety and storage
            $table->text('storage_requirements')->nullable();
            $table->text('preparation_instructions')->nullable();
            $table->text('contraindications')->nullable();
            $table->text('side_effects')->nullable();
            $table->json('environmental_conditions')->nullable()->comment('Temperature, humidity requirements');
            
            // Cost and supplier info
            $table->decimal('cost_per_dose', 10, 2)->nullable();
            $table->string('manufacturer')->nullable();
            $table->string('supplier')->nullable();
            $table->string('batch_number')->nullable();
            $table->date('manufacture_date')->nullable();
            $table->date('expiry_date')->nullable();
            
            // Effectiveness tracking
            $table->integer('usage_count')->default(0);
            $table->decimal('effectiveness_rate', 5, 2)->nullable();
            $table->json('efficacy_data')->nullable();
            
            // Admin management
            $table->enum('status', ['active', 'inactive', 'discontinued'])->default('active');
            $table->boolean('requires_cold_chain')->default(false);
            $table->boolean('auto_recommend')->default(true);
            $table->integer('stock_alert_threshold')->default(10);
            
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->timestamps();
            
            $table->index(['bird_type', 'purpose']);
            $table->index(['prevents_disease', 'status']);
            $table->index(['min_age_days', 'max_age_days']);
            $table->index(['priority_level', 'is_mandatory']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vaccination_protocols');
    }
};
