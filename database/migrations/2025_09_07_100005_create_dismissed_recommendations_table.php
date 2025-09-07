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
        Schema::create('dismissed_recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('batch_id')->constrained()->onDelete('cascade');
            $table->string('recommendation_type'); // medication, vaccination, feed
            $table->string('recommendation_id'); // identifier for the specific recommendation
            $table->foreignId('dismissed_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('dismissed_at');
            $table->text('reason'); // Why was this recommendation dismissed
            $table->timestamps();

            $table->index(['batch_id', 'recommendation_type']);
            $table->index('dismissed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dismissed_recommendations');
    }
};
