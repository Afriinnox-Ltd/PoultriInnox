<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Modules\BatchIncubator\Enums\EventType;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, backup the data
        $events = DB::table('batch_events')->get();
        $schedules = DB::table('batch_schedules')->get();

        // Temporarily drop the foreign key constraint from batch_schedules
        try {
            Schema::table('batch_schedules', function (Blueprint $table) {
                $table->dropForeign(['completed_event_id']);
            });
        } catch (\Illuminate\Database\QueryException $e) {
            // If the foreign key doesn't exist, we can continue
            if (!str_contains($e->getMessage(), "Can't DROP FOREIGN KEY")) {
                throw $e;
            }
        }

        // Now we can safely drop the batch_events table
        Schema::dropIfExists('batch_events');

        // Recreate batch_events with updated enum values
        Schema::create('batch_events', function (Blueprint $table) {
            $table->id();

            // Event identification
            $table->enum('event_type', EventType::values())->comment('Type of event');
            $table->string('title')->comment('Event title/summary');
            $table->text('description')->nullable()->comment('Detailed event description');

            // Related entities
            $table->foreignId('batch_id')->constrained('batches')->onDelete('cascade');
            $table->foreignId('incubator_id')->nullable()->constrained('incubators')->onDelete('set null');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade')->comment('User who recorded the event');

            // Event timing
            $table->timestamp('event_date')->comment('When the event occurred');
            $table->time('event_time')->nullable()->comment('Specific time of event');
            $table->integer('duration_minutes')->nullable()->comment('Duration of event in minutes');

            // Event data and measurements
            $table->json('event_data')->nullable()->comment('Event-specific data (measurements, quantities, etc.)');
            $table->json('before_measurements')->nullable()->comment('Measurements before event');
            $table->json('after_measurements')->nullable()->comment('Measurements after event');

            // Quantities and counts
            $table->integer('affected_count')->nullable()->comment('Number of birds affected by event');
            $table->decimal('quantity', 10, 2)->nullable()->comment('Quantity used (feed, medication, etc.)');
            $table->string('unit')->nullable()->comment('Unit of measurement');

            // Environmental data at time of event
            $table->decimal('temperature', 5, 2)->nullable()->comment('Temperature at time of event');
            $table->decimal('humidity', 5, 2)->nullable()->comment('Humidity at time of event');

            // Health and mortality specific
            $table->integer('mortality_count')->default(0)->comment('Number of deaths recorded');
            $table->string('mortality_cause')->nullable()->comment('Cause of mortality');
            $table->text('health_notes')->nullable()->comment('Health observations');

            // Feeding specific
            $table->string('feed_type')->nullable()->comment('Type of feed given');
            $table->decimal('feed_amount', 8, 2)->nullable()->comment('Amount of feed in kg');

            // Vaccination/Medication specific
            $table->string('vaccine_name')->nullable()->comment('Vaccine name');
            $table->string('medication_name')->nullable()->comment('Medication name');
            $table->string('dosage')->nullable()->comment('Dosage administered');
            $table->string('administration_method')->nullable()->comment('How it was administered');

            // Cost tracking fields
            $table->decimal('feed_cost', 10, 2)->nullable()->comment('Cost of feed used in this event');
            $table->decimal('medication_cost', 10, 2)->nullable()->comment('Cost of medication used');
            $table->decimal('vaccination_cost', 10, 2)->nullable()->comment('Cost of vaccination');
            $table->decimal('other_cost', 10, 2)->nullable()->comment('Other costs associated with this event');
            $table->decimal('total_event_cost', 10, 2)->nullable()->comment('Total cost for this event');

            // Documentation
            $table->json('attachments')->nullable()->comment('File attachments (photos, documents)');
            $table->text('notes')->nullable()->comment('Additional notes');

            // Priority and flags
            $table->boolean('is_critical')->default(false)->comment('Critical event flag');
            $table->boolean('requires_followup')->default(false)->comment('Requires follow-up action');
            $table->timestamp('followup_date')->nullable()->comment('Follow-up date if required');

            // Verification and approval
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('verified_at')->nullable()->comment('When event was verified');

            // Timestamps
            $table->timestamps();

            // Indexes
            $table->index(['batch_id', 'event_type']);
            $table->index(['event_date']);
            $table->index(['user_id']);
            $table->index(['incubator_id']);
            $table->index(['is_critical']);
            $table->index(['requires_followup', 'followup_date']);
            $table->index(['event_type', 'feed_cost']);
            $table->index(['event_type', 'medication_cost']);
            $table->index(['event_type', 'vaccination_cost']);
        });

        // Restore the batch_events data
        foreach ($events as $event) {
            DB::table('batch_events')->insert((array) $event);
        }

        // Re-add the foreign key constraint to batch_schedules
        Schema::table('batch_schedules', function (Blueprint $table) {
            $table->foreign('completed_event_id')->references('id')->on('batch_events')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Note: Rolling back this migration is complex as it involves changing enum values
        // In a production environment, you would need to ensure that only the original
        // enum values are present in the data before rolling back

        // For now, we'll leave this as a placeholder since rolling back enum changes
        // requires careful data validation and potentially data migration
        //
        // To properly rollback, you would:
        // 1. Check if any data uses the new enum values
        // 2. If so, either migrate or remove that data
        // 3. Drop foreign key constraint from batch_schedules
        // 4. Recreate batch_events table with original enum values
        // 5. Restore data
        // 6. Re-add foreign key constraint
    }
};
