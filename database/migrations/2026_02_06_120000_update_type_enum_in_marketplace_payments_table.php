<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Use raw SQL to modify the enum because Doctrine DBAL has issues with ENUMs sometimes
        // and we want to preserve existing data

        // Skip for SQLite (used in testing) as it doesn't support MODIFY COLUMN with ENUM
        if (DB::getDriverName() == 'sqlite') {
            return;
        }

        DB::statement("ALTER TABLE `marketplace_payments` MODIFY COLUMN `type` ENUM('payment', 'refund', 'partial_refund', 'subscription') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to original enum values
        // Note: This might fail if there are 'subscription' values in the table

        // Skip for SQLite (used in testing)
        if (DB::getDriverName() == 'sqlite') {
            return;
        }

        DB::statement("ALTER TABLE `marketplace_payments` MODIFY COLUMN `type` ENUM('payment', 'refund', 'partial_refund') NOT NULL");
    }
};
