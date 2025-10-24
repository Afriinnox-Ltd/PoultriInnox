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
        Schema::create('iot_device_commands', function (Blueprint $table) {
            $table->id();
            $table->string('device_id')->index();
            $table->string('command');
            $table->text('value')->nullable();
            $table->boolean('executed')->default(false);
            $table->timestamp('executed_at')->nullable();
            $table->foreignId('incubator_id')->nullable()->constrained('incubators')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('iot_device_commands');
    }
};
