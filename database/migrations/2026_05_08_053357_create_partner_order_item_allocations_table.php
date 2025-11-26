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
        Schema::dropIfExists('partner_order_item_allocations');

        Schema::create('partner_order_item_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_order_item_id')->constrained('partner_order_items')->cascadeOnDelete();
            $table->unsignedBigInteger('vendor_id')->index();
            $table->unsignedBigInteger('product_id')->nullable()->index(); // specific product listing the vendor will supply
            $table->decimal('quantity', 10, 2);
            $table->decimal('unit_price', 10, 2)->nullable();
            $table->decimal('vendor_payout', 10, 2)->nullable();
            $table->boolean('vendor_paid')->default(false);
            $table->timestamp('vendor_paid_at')->nullable();
            $table->string('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('partner_order_item_allocations');
    }
};
