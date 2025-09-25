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
        Schema::create('marketplace_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // Setting key/name
            $table->text('value')->nullable(); // Setting value (JSON for complex data)
            $table->string('type')->default('string'); // string, number, boolean, json, array
            $table->string('group')->default('general'); // general, payment, commission, tax, shipping, etc.
            $table->string('label'); // Human readable label
            $table->text('description')->nullable(); // Description of the setting
            $table->boolean('is_public')->default(false); // Whether setting can be accessed publicly
            $table->boolean('is_encrypted')->default(false); // Whether value should be encrypted
            $table->json('validation_rules')->nullable(); // Validation rules for the setting
            $table->json('options')->nullable(); // For select/radio type settings
            $table->integer('sort_order')->default(0); // For ordering in UI
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marketplace_settings');
    }
};
