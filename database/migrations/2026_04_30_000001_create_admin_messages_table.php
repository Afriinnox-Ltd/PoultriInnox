<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_messages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sender_id')->index();
            $table->string('subject');
            $table->longText('body'); // HTML content
            $table->enum('recipient_type', ['all', 'role', 'individual'])->default('all');
            $table->json('recipient_roles')->nullable();      // array of role slugs when type=role
            $table->json('recipient_user_ids')->nullable();   // array of user IDs when type=individual
            $table->unsignedInteger('total_recipients')->default(0);
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });

        Schema::create('admin_message_recipients', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('admin_message_id')->index();
            $table->unsignedBigInteger('user_id')->index();
            $table->boolean('email_sent')->default(false);
            $table->timestamp('email_sent_at')->nullable();
            $table->timestamps();

            $table->unique(['admin_message_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_message_recipients');
        Schema::dropIfExists('admin_messages');
    }
};
