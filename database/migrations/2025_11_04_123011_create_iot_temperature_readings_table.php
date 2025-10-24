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
        Schema::create('iot_temperature_readings', function (Blueprint $table) {
            $table->id();
            $table->string('device_id')->index();
            $table->foreignId('incubator_id')->nullable()->constrained('incubators')->onDelete('cascade');
            $table->decimal('temperature', 5, 2)->comment('Temperature reading in Celsius');
            $table->decimal('temp1', 5, 2)->nullable()->comment('Sensor 1 temperature');
            $table->decimal('temp2', 5, 2)->nullable()->comment('Sensor 2 temperature');
            $table->decimal('temp3', 5, 2)->nullable()->comment('Sensor 3 temperature');
            $table->decimal('temp4', 5, 2)->nullable()->comment('Sensor 4 temperature');
            $table->integer('cycle_day')->default(0)->comment('Current day in brooding cycle');
            $table->integer('total_days')->default(21)->comment('Total days in cycle');
            $table->timestamps();

            $table->index(['device_id', 'created_at']);
            $table->index(['incubator_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('iot_temperature_readings');
    }
};
