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
        Schema::table('marketplace_products', function (Blueprint $table) {
            $table->json('payment_methods')->nullable();
            $table->string('shipping_option')->nullable();
            $table->decimal('extra_fee', 10, 2)->nullable();
            $table->string('delivery_time')->nullable();
            $table->text('return_policy')->nullable();
            $table->text('additional_info')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('marketplace_products', function (Blueprint $table) {
            $table->dropColumn(['payment_methods', 'shipping_option', 'extra_fee', 'delivery_time', 'return_policy', 'additional_info']);
        });
    }
};
