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
        Schema::table('marketplace_orders', function (Blueprint $table) {
            // Vendor confirmation columns
            $table->boolean('vendor_confirmed')->default(false)->after('delivered_at');
            $table->timestamp('vendor_confirmed_at')->nullable()->after('vendor_confirmed');
            $table->foreignId('vendor_confirmed_by')->nullable()->constrained('users')->after('vendor_confirmed_at');
            
            // Add index for vendor confirmation
            $table->index(['vendor_id', 'vendor_confirmed']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('marketplace_orders', function (Blueprint $table) {
            $table->dropForeign(['vendor_confirmed_by']);
            $table->dropIndex(['vendor_id', 'vendor_confirmed']);
            $table->dropColumn(['vendor_confirmed', 'vendor_confirmed_at', 'vendor_confirmed_by']);
        });
    }
};
