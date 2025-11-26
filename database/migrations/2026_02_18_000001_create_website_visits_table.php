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
        Schema::create('website_visits', function (Blueprint $table) {
            $table->id();
            $table->string('ip_address', 45)->nullable();
            $table->text('url');
            $table->string('method', 10);
            $table->text('user_agent')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->text('referer')->nullable();
            $table->integer('duration_ms')->nullable()->comment('Server response time in ms'); // Server performance
            $table->integer('time_on_page_ms')->nullable()->comment('User time on page in ms'); // User engagement
            $table->timestamps();

            // Indexes for performance
            $table->index('created_at');
            $table->index('user_id');
            // Indexing text columns usually requires prefix length, but for URL analysis we might need to rely on specific queries or fulltext search engines later.
            // For now, standard indexes on metadata are sufficient.
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('website_visits');
    }
};
