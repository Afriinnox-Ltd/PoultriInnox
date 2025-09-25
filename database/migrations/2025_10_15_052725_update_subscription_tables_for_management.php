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
        // Add missing fields to subscriptions table
        Schema::table('marketplace_subscriptions', function (Blueprint $table) {
            // Check if columns don't exist before adding them
            if (!Schema::hasColumn('marketplace_subscriptions', 'plan_name')) {
                $table->string('plan_name')->nullable();
            }
            if (!Schema::hasColumn('marketplace_subscriptions', 'price')) {
                $table->decimal('price', 10, 2)->nullable();
            }
            if (!Schema::hasColumn('marketplace_subscriptions', 'billing_cycle')) {
                $table->string('billing_cycle')->nullable();
            }
            if (!Schema::hasColumn('marketplace_subscriptions', 'product_limit')) {
                $table->integer('product_limit')->nullable();
            }
            if (!Schema::hasColumn('marketplace_subscriptions', 'order_limit')) {
                $table->integer('order_limit')->nullable();
            }
            if (!Schema::hasColumn('marketplace_subscriptions', 'allow_cod')) {
                $table->boolean('allow_cod')->default(false);
            }
            if (!Schema::hasColumn('marketplace_subscriptions', 'cancelled_at')) {
                $table->timestamp('cancelled_at')->nullable();
            }
            if (!Schema::hasColumn('marketplace_subscriptions', 'cancellation_reason')) {
                $table->text('cancellation_reason')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('marketplace_subscriptions', function (Blueprint $table) {
            $columnsToRemove = [
                'plan_name', 'price', 'billing_cycle', 'product_limit', 
                'order_limit', 'allow_cod', 'cancelled_at', 'cancellation_reason'
            ];
            
            foreach ($columnsToRemove as $column) {
                if (Schema::hasColumn('marketplace_subscriptions', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
