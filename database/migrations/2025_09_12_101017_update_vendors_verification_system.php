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
        // Add the new boolean is_verified field only if it doesn't exist
        if (!Schema::hasColumn('marketplace_vendors', 'is_verified')) {
            Schema::table('marketplace_vendors', function (Blueprint $table) {
                $table->boolean('is_verified')->default(false)->after('status');
            });
        }

        // Migrate existing verification_status data to is_verified
        if (Schema::hasColumn('marketplace_vendors', 'verification_status')) {
            DB::table('marketplace_vendors')->where('verification_status', 'verified')->update(['is_verified' => true]);

            // Drop any indexes that might reference verification_status
            try {
                Schema::table('marketplace_vendors', function (Blueprint $table) {
                    $table->dropIndex(['verification_status', 'is_active']); // Drop the composite index
                });
            } catch (\Exception $e) {}

            // Remove the old verification_status enum field
            Schema::table('marketplace_vendors', function (Blueprint $table) {
                $table->dropColumn('verification_status');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Add back the verification_status enum field only if it doesn't exist
        if (!Schema::hasColumn('marketplace_vendors', 'verification_status')) {
            Schema::table('marketplace_vendors', function (Blueprint $table) {
                $table->enum('verification_status', ['pending', 'verified', 'rejected'])->default('pending')->after('status');
            });
        }

        // Migrate is_verified data back to verification_status
        if (Schema::hasColumn('marketplace_vendors', 'is_verified')) {
            DB::table('marketplace_vendors')->where('is_verified', true)->update(['verification_status' => 'verified']);
            DB::table('marketplace_vendors')->where('is_verified', false)->update(['verification_status' => 'pending']);

            // Remove the is_verified field
            Schema::table('marketplace_vendors', function (Blueprint $table) {
                $table->dropColumn('is_verified');
            });
        }
    }
};
