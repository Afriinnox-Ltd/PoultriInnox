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
        Schema::create('iot_alerts', function (Blueprint $table) {
            $table->id();
            $table->string('device_id')->index();
            $table->string('alert_type')->comment('HIGH_TEMP, LOW_TEMP, OFFLINE, etc.');
            $table->text('message');
            $table->enum('severity', ['info', 'warning', 'critical'])->default('warning');
            $table->boolean('resolved')->default(false)->index();
            $table->timestamp('resolved_at')->nullable();
            $table->foreignId('incubator_id')->nullable()->constrained('incubators')->onDelete('cascade');
            $table->timestamps();

            $table->index(['device_id', 'resolved']);
            $table->index(['created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('iot_alerts');
    }
};
