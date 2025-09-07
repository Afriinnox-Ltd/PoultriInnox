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
        Schema::create('marketplace_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('marketplace_orders')->onDelete('cascade');
            $table->string('transaction_id')->unique(); // Payment gateway transaction ID
            $table->string('payment_method'); // stripe, paypal, mpesa, bank_transfer, etc.
            $table->string('gateway'); // stripe, paypal, safaricom, etc.
            $table->enum('type', ['payment', 'refund', 'partial_refund']);
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded']);

            // Amount details
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('USD');
            $table->decimal('fees', 10, 2)->default(0); // Gateway fees
            $table->decimal('net_amount', 10, 2); // Amount after fees

            // Payment details
            $table->json('gateway_response')->nullable(); // Store gateway response
            $table->string('gateway_reference')->nullable(); // Gateway reference number
            $table->text('notes')->nullable();
            $table->text('failure_reason')->nullable();

            // Vendor payout tracking
            $table->decimal('vendor_amount', 10, 2)->nullable(); // Amount to be paid to vendor
            $table->decimal('commission_amount', 10, 2)->nullable(); // Platform commission
            $table->boolean('vendor_paid')->default(false);
            $table->timestamp('vendor_paid_at')->nullable();

            // Metadata
            $table->json('metadata')->nullable(); // Additional payment data
            $table->timestamp('processed_at')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users');

            $table->timestamps();

            $table->index(['order_id', 'status']);
            $table->index(['payment_method', 'status']);
            $table->index(['vendor_paid', 'vendor_paid_at']);
            $table->index('transaction_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marketplace_payments');
    }
};
