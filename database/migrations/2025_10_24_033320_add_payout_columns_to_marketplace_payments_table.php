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
            // Payout request columns
            $table->boolean('payout_requested')->default(false)->after('vendor_paid_at');
            $table->timestamp('payout_requested_at')->nullable()->after('payout_requested');
            $table->foreignId('payout_requested_by')->nullable()->constrained('users')->after('payout_requested_at');
            
            // Payout processing columns
            $table->boolean('payout_processing')->default(false)->after('payout_requested_by');
            $table->timestamp('payout_processing_at')->nullable()->after('payout_processing');
            $table->foreignId('payout_processing_by')->nullable()->constrained('users')->after('payout_processing_at');
            
            // Payout batch tracking
            $table->string('payout_batch_id')->nullable()->after('payout_processing_by');
            $table->text('payout_notes')->nullable()->after('payout_batch_id');
            
            // Add indexes for payout queries
            $table->index(['payout_requested', 'vendor_paid']);
            $table->index(['payout_processing', 'vendor_paid']);
            $table->index('payout_batch_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('marketplace_payments', function (Blueprint $table) {
            $table->dropForeign(['payout_requested_by']);
            $table->dropForeign(['payout_processing_by']);
            $table->dropIndex(['payout_requested', 'vendor_paid']);
            $table->dropIndex(['payout_processing', 'vendor_paid']);
            $table->dropIndex('payout_batch_id');
            $table->dropColumn([
                'payout_requested', 'payout_requested_at', 'payout_requested_by',
                'payout_processing', 'payout_processing_at', 'payout_processing_by',
                'payout_batch_id', 'payout_notes'
            ]);
        });
    }
};
