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
        Schema::create('marketplace_subscription_plans', function (Blueprint $table) {
              $table->id();
            $table->string('name'); // e.g. Free, Premium, Enterprise
            $table->decimal('price', 10, 2)->default(0);
            $table->enum('billing_cycle', ['monthly', 'yearly'])->default('monthly');
            $table->integer('duration_days')->nullable(); // optional: how long the plan lasts

            $table->integer('product_limit')->nullable();
            $table->integer('order_limit')->nullable();
            $table->boolean('allow_cod')->default(false);
            $table->boolean('featured_badge')->default(false);

            $table->text('description')->nullable();
            $table->json('features')->nullable(); // flexible features storage
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marketplace_subscription_plans');
    }
};
