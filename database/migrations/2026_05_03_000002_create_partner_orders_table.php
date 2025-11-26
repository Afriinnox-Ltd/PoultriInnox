<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('partner_orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('partner_id')->index();
            $table->string('order_number')->unique();
            $table->text('description')->nullable();
            $table->enum('status', [
                'pending',
                'reviewing',
                'confirmed',
                'processing',
                'shipped',
                'delivered',
                'cancelled',
            ])->default('pending');
            $table->enum('payment_status', ['pending', 'partial', 'paid', 'refunded'])->default('pending');
            $table->decimal('total_amount', 12, 2)->nullable();
            $table->string('currency', 10)->default('RWF');
            $table->text('delivery_address')->nullable();
            $table->date('requested_delivery_date')->nullable();
            $table->text('partner_notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->string('delivery_tracking_number')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partner_orders');
    }
};
