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
        Schema::table('batch_events', function (Blueprint $table) {
            // Cost tracking fields for different event types
            $table->decimal('feed_cost', 10, 2)->nullable()->comment('Cost of feed used in this event');
            $table->decimal('medication_cost', 10, 2)->nullable()->comment('Cost of medication used');
            $table->decimal('vaccination_cost', 10, 2)->nullable()->comment('Cost of vaccination');
            $table->decimal('other_cost', 10, 2)->nullable()->comment('Other costs associated with this event');
            $table->decimal('total_event_cost', 10, 2)->nullable()->comment('Total cost for this event');

            // Add index for cost-related queries
            $table->index(['event_type', 'feed_cost']);
            $table->index(['event_type', 'medication_cost']);
            $table->index(['event_type', 'vaccination_cost']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('batch_events', function (Blueprint $table) {
            $table->dropIndex(['event_type', 'feed_cost']);
            $table->dropIndex(['event_type', 'medication_cost']);
            $table->dropIndex(['event_type', 'vaccination_cost']);

            $table->dropColumn([
                'feed_cost',
                'medication_cost',
                'vaccination_cost',
                'other_cost',
                'total_event_cost'
            ]);
        });
    }
};
