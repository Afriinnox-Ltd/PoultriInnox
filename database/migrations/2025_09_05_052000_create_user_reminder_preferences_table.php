<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_reminder_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->json('notification_methods')->nullable(); // Will set default in model
            $table->integer('default_minutes_before')->default(30); // Default 30 minutes before
            $table->boolean('auto_create_before_due')->default(true);
            $table->boolean('auto_create_overdue')->default(true);
            $table->integer('overdue_reminder_frequency')->default(60); // Minutes between overdue reminders
            $table->integer('max_overdue_reminders')->default(5); // Max overdue reminders to send
            $table->boolean('weekend_reminders')->default(false); // Send reminders on weekends
            $table->time('quiet_hours_start')->nullable(); // Don't send reminders during quiet hours
            $table->time('quiet_hours_end')->nullable();
            $table->json('preferred_reminder_types')->nullable(); // Will set default in model
            $table->timestamps();

            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_reminder_preferences');
    }
};
