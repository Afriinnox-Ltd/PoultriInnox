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
        Schema::create('applied_vaccinations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('batch_id')->constrained('batches')->onDelete('cascade');
            $table->foreignId('vaccination_protocol_id')->constrained('vaccination_protocols');
            
            // Vaccination details
            $table->datetime('vaccinated_at');
            $table->integer('bird_age_days_at_vaccination');
            $table->integer('birds_vaccinated');
            $table->decimal('doses_used', 8, 3);
            $table->string('administration_method');
            $table->string('batch_number')->nullable();
            
            // Vaccination context
            $table->boolean('is_primary_vaccination')->default(true);
            $table->boolean('is_booster')->default(false);
            $table->foreignId('primary_vaccination_id')->nullable()->constrained('applied_vaccinations');
            $table->datetime('next_booster_due')->nullable();
            $table->datetime('immunity_expires')->nullable();
            
            // Environmental conditions during vaccination
            $table->decimal('temperature_celsius', 4, 1)->nullable();
            $table->decimal('humidity_percentage', 4, 1)->nullable();
            $table->text('environmental_notes')->nullable();
            
            // Effectiveness tracking
            $table->enum('status', ['administered', 'monitoring', 'effective', 'ineffective', 'reaction'])->default('administered');
            $table->text('reactions_observed')->nullable();
            $table->integer('birds_with_reactions')->default(0);
            $table->decimal('effectiveness_rating', 3, 1)->nullable();
            $table->datetime('efficacy_assessment_date')->nullable();
            
            // Cost tracking
            $table->decimal('cost', 10, 2)->nullable();
            $table->string('supplier_batch')->nullable();
            $table->date('vaccine_expiry_date')->nullable();
            
            // Personnel
            $table->foreignId('administered_by')->constrained('users');
            $table->foreignId('supervised_by')->nullable()->constrained('users');
            $table->text('administration_notes')->nullable();
            
            $table->timestamps();
            
            $table->index(['batch_id', 'vaccinated_at']);
            $table->index(['vaccination_protocol_id', 'status']);
            $table->index(['next_booster_due']);
            $table->index(['immunity_expires']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applied_vaccinations');
    }
};
