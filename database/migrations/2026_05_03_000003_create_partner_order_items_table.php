<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('partner_order_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('partner_order_id')->index();
            $table->unsignedBigInteger('product_id')->nullable()->index();
            $table->unsignedBigInteger('vendor_id')->nullable()->index();
            $table->string('product_name');
            $table->text('description')->nullable();
            $table->decimal('quantity', 10, 2)->default(1);
            $table->string('unit', 30)->default('pieces');
            $table->decimal('unit_price', 12, 2)->nullable();
            $table->decimal('total_price', 12, 2)->nullable();
            $table->decimal('vendor_payout', 12, 2)->nullable();
            $table->boolean('vendor_paid')->default(false);
            $table->timestamp('vendor_paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partner_order_items');
    }
};
