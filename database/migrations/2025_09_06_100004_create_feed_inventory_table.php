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
        Schema::create('feed_inventories', function (Blueprint $table) {
            $table->id();

            // Feed and supplier reference
            $table->foreignId('feed_type_id')->constrained('feed_types')->onDelete('cascade');
            $table->foreignId('supplier_id')->nullable()->constrained('feed_suppliers')->onDelete('set null');

            // Batch information
            $table->string('batch_number')->comment('Feed batch/lot number from supplier');
            $table->string('internal_code')->nullable()->comment('Internal tracking code');

            // Quantity information
            $table->decimal('quantity', 10, 2)->comment('Current quantity available');
            $table->decimal('original_quantity', 10, 2)->comment('Original quantity received');
            $table->decimal('reserved_quantity', 10, 2)->default(0)->comment('Quantity reserved for future use');
            $table->string('unit_of_measure')->default('kg')->comment('Unit of measurement');

            // Cost information
            $table->decimal('cost_per_unit', 10, 2)->comment('Cost per unit when purchased');
            $table->decimal('total_cost', 10, 2)->comment('Total cost of this inventory batch');
            $table->string('currency', 3)->default('USD')->comment('Currency code');

            // Dates and expiry
            $table->date('received_date')->comment('Date when feed was received');
            $table->date('production_date')->nullable()->comment('Feed production date');
            $table->date('expiry_date')->comment('Expiry date');
            // Note: days_until_expiry will be calculated in the model for SQLite compatibility

            // Quality information
            $table->json('quality_certificates')->nullable()->comment('Quality test certificates');
            $table->decimal('moisture_content', 5, 2)->nullable()->comment('Moisture content percentage');
            $table->text('quality_notes')->nullable()->comment('Quality inspection notes');
            $table->boolean('quality_approved')->default(true)->comment('Quality approval status');

            // Storage information
            $table->string('storage_location')->comment('Physical storage location');
            $table->string('warehouse_section')->nullable()->comment('Specific warehouse section');
            $table->json('storage_conditions')->nullable()->comment('Storage condition requirements');
            $table->decimal('temperature_requirement', 5, 2)->nullable()->comment('Required storage temperature');
            $table->decimal('humidity_requirement', 5, 2)->nullable()->comment('Required storage humidity');

            // Status and tracking
            $table->enum('status', ['available', 'reserved', 'expired', 'damaged', 'quarantine', 'consumed'])->default('available');
            $table->text('status_notes')->nullable()->comment('Status change notes');
            $table->boolean('is_fifo_tracked')->default(true)->comment('Track with FIFO logic');

            // Alerts and thresholds
            $table->decimal('reorder_point', 10, 2)->nullable()->comment('Quantity threshold for reordering');
            $table->boolean('low_stock_alert_sent')->default(false)->comment('Low stock alert already sent');
            $table->boolean('expiry_alert_sent')->default(false)->comment('Expiry alert already sent');

            // Purchase reference
            $table->string('purchase_order_number')->nullable()->comment('Related purchase order');
            $table->string('invoice_number')->nullable()->comment('Supplier invoice number');
            $table->date('payment_date')->nullable()->comment('Payment date');

            // Audit fields
            $table->foreignId('received_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            // Indexes
            $table->index(['feed_type_id', 'status']);
            $table->index(['expiry_date', 'status']);
            $table->index(['batch_number']);
            $table->index(['storage_location']);
            $table->index(['supplier_id']);
            $table->index(['received_date']);
            $table->index(['quantity', 'reorder_point']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feed_inventories');
    }
};
