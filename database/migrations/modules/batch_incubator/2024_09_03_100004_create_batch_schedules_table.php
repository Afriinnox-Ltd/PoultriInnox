<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Modules\BatchIncubator\Enums\ScheduleStatus;
use App\Modules\BatchIncubator\Enums\EventType;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('batch_schedules', function (Blueprint $table) {
            $table->id();

            // Schedule identification
            $table->string('title')->comment('Schedule title/name');
            $table->text('description')->nullable()->comment('Detailed description');
            $table->enum('event_type', EventType::values())->comment('Type of scheduled event');

            // Related entities
            $table->foreignId('batch_id')->constrained('batches')->onDelete('cascade');
            $table->foreignId('incubator_id')->nullable()->constrained('incubators')->onDelete('set null');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null')->comment('User assigned to complete task');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade')->comment('User who created the schedule');

            // Timing
            $table->timestamp('scheduled_date')->comment('When task is scheduled');
            $table->time('scheduled_time')->nullable()->comment('Specific time for task');
            $table->integer('estimated_duration')->nullable()->comment('Estimated duration in minutes');
            $table->timestamp('actual_start_time')->nullable()->comment('When task actually started');
            $table->timestamp('actual_end_time')->nullable()->comment('When task was completed');

            // Recurrence
            $table->boolean('is_recurring')->default(false)->comment('Is this a recurring schedule');
            $table->string('recurrence_pattern')->nullable()->comment('Recurrence pattern (daily, weekly, etc.)');
            $table->json('recurrence_config')->nullable()->comment('Recurrence configuration');
            $table->date('recurrence_end_date')->nullable()->comment('End date for recurrence');
            $table->foreignId('parent_schedule_id')->nullable()->constrained('batch_schedules')->onDelete('set null')->comment('Parent schedule for recurring items');

            // Status and progress
            $table->enum('status', ScheduleStatus::values())->default(ScheduleStatus::PENDING->value);
            $table->integer('progress_percentage')->default(0)->comment('Completion percentage');
            $table->text('completion_notes')->nullable()->comment('Notes on completion');

            // Requirements and specifications
            $table->json('requirements')->nullable()->comment('Task requirements (materials, tools, etc.)');
            $table->json('checklist')->nullable()->comment('Task checklist items');
            $table->decimal('required_quantity', 10, 2)->nullable()->comment('Required quantity for task');
            $table->string('required_unit')->nullable()->comment('Unit for required quantity');

            // Priority and importance
            $table->integer('priority')->default(3)->comment('Priority level (1=highest, 5=lowest)');
            $table->boolean('is_critical')->default(false)->comment('Critical task flag');
            $table->boolean('send_reminder')->default(true)->comment('Send reminder notifications');
            $table->integer('reminder_minutes_before')->default(30)->comment('Minutes before to send reminder');

            // Dependencies
            $table->json('depends_on')->nullable()->comment('Schedule IDs this task depends on');
            $table->json('blocks')->nullable()->comment('Schedule IDs this task blocks');

            // Results and outcomes
            $table->json('results')->nullable()->comment('Task results and measurements');
            $table->boolean('requires_verification')->default(false)->comment('Requires supervisor verification');
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('verified_at')->nullable()->comment('When task was verified');

            // Related event (if completed)
            $table->foreignId('completed_event_id')->nullable()->constrained('batch_events')->onDelete('set null');

            // Documentation
            $table->json('attachments')->nullable()->comment('File attachments');
            $table->text('notes')->nullable()->comment('Additional notes');

            // Timestamps
            $table->timestamps();

            // Indexes
            $table->index(['batch_id', 'status']);
            $table->index(['scheduled_date', 'status']);
            $table->index(['assigned_to']);
            $table->index(['created_by']);
            $table->index(['event_type']);
            $table->index(['is_critical', 'priority']);
            $table->index(['is_recurring', 'parent_schedule_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('batch_schedules');
    }
};
