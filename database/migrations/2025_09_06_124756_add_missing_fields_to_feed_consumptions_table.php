<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('feed_consumptions', function (Blueprint $table) {
            // Add fields that the frontend expects but are missing from original migration
            $table->decimal('feeding_efficiency', 5, 2)->default(100)->after('waste_percentage');
            $table->decimal('quality_score', 5, 2)->nullable()->after('feeding_efficiency');
            $table->text('notes')->nullable()->after('quality_score');

            // Rename some fields to match frontend expectations
            $table->renameColumn('observations', 'old_observations');
        });

        // Update notes from observations for existing records
        DB::statement('UPDATE feed_consumptions SET notes = old_observations WHERE old_observations IS NOT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('feed_consumptions', function (Blueprint $table) {
            $table->dropColumn(['feeding_efficiency', 'quality_score', 'notes']);
            $table->renameColumn('old_observations', 'observations');
        });
    }
};
