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
        Schema::table('modules', function (Blueprint $table) {
            $table->string('code', 50)->nullable()->after('slug')->comment('Unique code for referencing module programmatically');
        });

        // Update existing modules with their codes
        DB::table('modules')->where('name', 'Batch Incubator')->update(['code' => 'batch_incubator']);
        DB::table('modules')->where('name', 'Feed Management')->update(['code' => 'feed_management']);

        // Add unique constraint and make non-nullable
        Schema::table('modules', function (Blueprint $table) {
            $table->string('code', 50)->nullable(false)->unique()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('modules', function (Blueprint $table) {
            $table->dropColumn('code');
        });
    }
};
