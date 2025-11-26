<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('marketplace_shipping', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('marketplace_orders')->onDelete('cascade');

            // Shipping address
            $table->string('recipient_name');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address');
            $table->string('city', 80);
            $table->string('state', 80)->nullable();
            $table->string('postal_code')->nullable();
            $table->string('country', 80);
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();

            // Shipping details
            $table->string('carrier')->nullable(); // DHL, UPS, local delivery, etc.
            $table->string('service_type')->nullable(); // standard, express, overnight
            $table->string('tracking_number')->nullable();
            $table->decimal('shipping_cost', 10, 2);
            $table->decimal('insurance_cost', 10, 2)->default(0);

            // Weight and dimensions
            $table->decimal('weight', 8, 2)->nullable(); // in kg
            $table->decimal('length', 8, 2)->nullable(); // in cm
            $table->decimal('width', 8, 2)->nullable(); // in cm
            $table->decimal('height', 8, 2)->nullable(); // in cm

            // Status tracking
            $table->enum('status', [
                'pending',
                'preparing',
                'dispatched',
                'in_transit',
                'out_for_delivery',
                'delivered',
                'failed_delivery',
                'returned',
                'cancelled'
            ])->default('pending');

            // Timestamps for tracking
            $table->timestamp('dispatched_at')->nullable();
            $table->timestamp('estimated_delivery')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->string('delivered_to')->nullable(); // Person who received
            $table->text('delivery_notes')->nullable();

            // Special instructions
            $table->text('special_instructions')->nullable();
            $table->boolean('signature_required')->default(false);
            $table->boolean('insurance_required')->default(false);

            // Tracking history
            $table->json('tracking_history')->nullable(); // Store status updates

            $table->timestamps();

            $table->index(['order_id', 'status']);
            $table->index('tracking_number');
            $table->index(['city', 'state', 'country']);
            $table->index('delivered_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marketplace_shipping');
    }
};
