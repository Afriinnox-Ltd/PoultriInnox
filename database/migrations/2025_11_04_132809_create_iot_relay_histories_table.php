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
        Schema::create('iot_relay_histories', function (Blueprint $table) {
            $table->id();
            $table->string('device_id');
            $table->foreignId('incubator_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('state'); // ON or OFF
            $table->string('mode'); // AUTO or MANUAL
            $table->float('temperature_at_switch')->nullable();
            $table->timestamps();

            $table->index(['device_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('iot_relay_histories');
    }
};
