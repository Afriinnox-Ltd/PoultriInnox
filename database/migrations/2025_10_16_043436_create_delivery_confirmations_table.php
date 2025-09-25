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
        Schema::create('delivery_confirmations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('marketplace_orders')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // buyer who confirms
            $table->boolean('confirmed')->default(false);
            $table->text('proof_images')->nullable(); // JSON array of image paths
            $table->text('confirmation_notes')->nullable();
            $table->datetime('confirmed_at')->nullable();
            $table->datetime('delivery_requested_at')->nullable(); // when vendor marked as delivered
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_confirmations');
    }
};
