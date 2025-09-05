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
        Schema::create('feed_purchase_orders', function (Blueprint $table) {
            $table->id();

            // Order identification
            $table->string('order_number')->unique()->comment('Unique purchase order number');
            $table->foreignId('supplier_id')->constrained('feed_suppliers')->onDelete('cascade');

            // Order details
            $table->date('order_date')->comment('Date when order was placed');
            $table->date('expected_delivery_date')->nullable()->comment('Expected delivery date');
            $table->date('actual_delivery_date')->nullable()->comment('Actual delivery date');
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal')->comment('Order priority');

            // Order items - JSON structure for multiple feed types
            $table->json('order_items')->comment('Feed types and quantities ordered');
            /*
            Example order_items structure:
            [
                {
                    "feed_type_id": 1,
                    "feed_type_name": "Starter Feed 20%",
                    "quantity": 1000,
                    "unit_price": 0.45,
                    "total_price": 450.00,
                    "unit_of_measure": "kg"
                },
                {
                    "feed_type_id": 2,
                    "feed_type_name": "Grower Feed 18%",
                    "quantity": 2000,
                    "unit_price": 0.42,
                    "total_price": 840.00,
                    "unit_of_measure": "kg"
                }
            ]
            */

            // Financial information
            $table->decimal('subtotal', 12, 2)->comment('Subtotal before taxes and fees');
            $table->decimal('tax_amount', 10, 2)->default(0)->comment('Tax amount');
            $table->decimal('shipping_cost', 10, 2)->default(0)->comment('Shipping cost');
            $table->decimal('other_fees', 10, 2)->default(0)->comment('Other fees');
            $table->decimal('discount_amount', 10, 2)->default(0)->comment('Discount amount');
            $table->decimal('total_amount', 12, 2)->comment('Total order amount');
            $table->string('currency', 3)->default('USD')->comment('Currency code');

            // Payment information
            $table->enum('payment_terms', ['cash', 'net_15', 'net_30', 'net_45', 'net_60', 'cod'])->default('net_30');
            $table->enum('payment_status', ['pending', 'partial', 'paid', 'overdue'])->default('pending');
            $table->date('payment_due_date')->nullable()->comment('Payment due date');
            $table->date('payment_date')->nullable()->comment('Actual payment date');
            $table->string('payment_reference')->nullable()->comment('Payment reference number');

            // Delivery information
            $table->text('delivery_address')->comment('Delivery address');
            $table->string('delivery_contact')->nullable()->comment('Delivery contact person');
            $table->string('delivery_phone')->nullable()->comment('Delivery contact phone');
            $table->text('delivery_instructions')->nullable()->comment('Special delivery instructions');
            $table->enum('delivery_method', ['pickup', 'delivery', 'freight', 'courier'])->default('delivery');

            // Status tracking
            $table->enum('status', ['draft', 'pending', 'approved', 'ordered', 'partially_received', 'received', 'cancelled', 'disputed'])->default('draft');
            $table->text('status_notes')->nullable()->comment('Status change notes');
            $table->json('status_history')->nullable()->comment('History of status changes');

            // Quality and receiving
            $table->boolean('quality_check_required')->default(true)->comment('Requires quality check on receipt');
            $table->json('quality_requirements')->nullable()->comment('Quality requirements and specifications');
            $table->text('receiving_notes')->nullable()->comment('Notes from receiving process');
            $table->decimal('received_percentage', 5, 2)->default(0)->comment('Percentage of order received');

            // Document references
            $table->string('supplier_invoice_number')->nullable()->comment('Supplier invoice number');
            $table->string('supplier_order_reference')->nullable()->comment('Supplier order reference');
            $table->json('attachments')->nullable()->comment('File attachments (quotes, contracts, etc.)');

            // Emergency and special orders
            $table->boolean('is_emergency_order')->default(false)->comment('Emergency order flag');
            $table->text('emergency_justification')->nullable()->comment('Justification for emergency order');
            $table->boolean('requires_approval')->default(false)->comment('Requires management approval');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable()->comment('Approval timestamp');

            // Audit fields
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            // Indexes
            $table->index(['supplier_id', 'status']);
            $table->index(['order_date']);
            $table->index(['expected_delivery_date']);
            $table->index(['status']);
            $table->index(['payment_status']);
            $table->index(['created_by']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feed_purchase_orders');
    }
};
