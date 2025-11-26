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
        Schema::dropIfExists('marketplace_product_views');
        Schema::dropIfExists('website_visits');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Re-creating tables if needed (simplified for rollback)
        Schema::create('website_visits', function (Blueprint $table) {
            $table->id();
            $table->string('ip_address', 45);
            $table->text('url');
            $table->string('method', 10);
            $table->text('user_agent')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->text('referer')->nullable();
            $table->integer('duration_ms')->nullable();
            $table->integer('time_on_page_ms')->nullable();
            $table->timestamps();

            $table->index('url');
            $table->index('created_at');
            $table->index('user_id');
        });

        Schema::create('marketplace_product_views', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('viewed_at');
        });
    }
};
