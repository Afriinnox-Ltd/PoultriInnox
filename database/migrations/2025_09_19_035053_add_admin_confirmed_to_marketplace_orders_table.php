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
            $table->boolean('admin_confirmed')->default(false)->after('status');
            $table->timestamp('admin_confirmed_at')->nullable()->after('admin_confirmed');
            $table->unsignedBigInteger('admin_confirmed_by')->nullable()->after('admin_confirmed_at');

            $table->foreign('admin_confirmed_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('marketplace_orders', function (Blueprint $table) {
            $table->dropForeign(['admin_confirmed_by']);
            $table->dropColumn(['admin_confirmed', 'admin_confirmed_at', 'admin_confirmed_by']);
        });
    }
};
