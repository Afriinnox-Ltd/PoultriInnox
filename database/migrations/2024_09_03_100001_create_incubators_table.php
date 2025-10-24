<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Modules\BatchIncubator\Enums\IncubatorStatus;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('incubators', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('Incubator machine name/identifier');
            $table->string('model')->nullable()->comment('Incubator model/brand');
            $table->string('serial_number')->unique()->nullable()->comment('Machine serial number');
            $table->text('description')->nullable()->comment('Additional details about the incubator');

            // Capacity and specifications
            $table->integer('capacity')->comment('Maximum egg capacity');
            $table->integer('current_load')->default(0)->comment('Current number of eggs');

            // Environmental settings
            $table->decimal('target_temperature', 5, 2)->nullable()->comment('Target temperature in Celsius');
            $table->decimal('target_humidity', 5, 2)->nullable()->comment('Target humidity percentage');
            $table->decimal('current_temperature', 5, 2)->nullable()->comment('Current temperature reading');
            $table->decimal('current_humidity', 5, 2)->nullable()->comment('Current humidity reading');

            // Status and operational data
            $table->enum('status', IncubatorStatus::values())->default(IncubatorStatus::RUNNING->value);
            $table->json('settings')->nullable()->comment('Additional machine settings as JSON');
            $table->json('sensors_data')->nullable()->comment('Latest sensor readings');

            // Location and access control
            $table->string('location')->nullable()->comment('Physical location of the incubator');
            $table->json('access_control')->nullable()->comment('User access permissions');

            // Maintenance tracking
            $table->timestamp('last_maintenance')->nullable()->comment('Last maintenance date');
            $table->timestamp('next_maintenance')->nullable()->comment('Next scheduled maintenance');
            $table->text('maintenance_notes')->nullable()->comment('Maintenance history and notes');

            // Ownership and management
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->json('authorized_users')->nullable()->comment('Users with access to this incubator');

            // Timestamps
            $table->timestamps();

            // Indexes
            $table->index(['status']);
            $table->index(['owner_id']);
            $table->index(['capacity', 'current_load']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('incubators');
    }
};
