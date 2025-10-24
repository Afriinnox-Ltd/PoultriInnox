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
        Schema::table('marketplace_payments', function (Blueprint $table) {
            // Check if subscription_id column exists
            if (!Schema::hasColumn('marketplace_payments', 'subscription_id')) {
                $table->foreignId('subscription_id')->nullable()->after('order_id')->constrained('marketplace_subscriptions')->onDelete('cascade');
            }

            // Make order_id nullable since payments can be for subscriptions too
            $table->foreignId('order_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('marketplace_payments', function (Blueprint $table) {
            $table->dropForeign(['subscription_id']);
            $table->dropColumn('subscription_id');
            $table->foreignId('order_id')->nullable(false)->change();
        });
    }
};
