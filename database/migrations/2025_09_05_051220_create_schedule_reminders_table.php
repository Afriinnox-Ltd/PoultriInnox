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
        Schema::create('schedule_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('schedule_id')->constrained('batch_schedules')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('reminder_type', ['before_due', 'overdue', 'custom'])->default('before_due');
            $table->integer('minutes_before')->nullable(); // For before_due reminders
            $table->datetime('reminder_time'); // Calculated time when reminder should be sent
            $table->enum('notification_method', ['email', 'database', 'both'])->default('both');
            $table->enum('status', ['pending', 'sent', 'failed', 'cancelled'])->default('pending');
            $table->text('custom_message')->nullable();
            $table->json('notification_data')->nullable(); // Store notification IDs and metadata
            $table->timestamp('sent_at')->nullable();
            $table->text('error_message')->nullable(); // For failed notifications
            $table->integer('retry_count')->default(0);
            $table->timestamp('next_retry_at')->nullable();
            $table->timestamps();

            // Indexes for better performance
            $table->index(['status', 'reminder_time']);
            $table->index(['schedule_id', 'user_id']);
            $table->index(['reminder_time', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedule_reminders');
    }
};
