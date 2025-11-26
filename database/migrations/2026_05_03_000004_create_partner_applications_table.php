<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('partner_applications');

        Schema::create('partner_applications', function (Blueprint $table) {
            $table->id();
            $table->string('business_name');
            $table->enum('partner_type', ['hotel', 'restaurant', 'catering', 'other']);
            $table->string('contact_person');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('country')->nullable()->default('Rwanda');
            $table->text('notes')->nullable();          // applicant's message
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('admin_notes')->nullable();    // internal admin note
            $table->string('rejection_reason')->nullable();
            $table->unsignedBigInteger('reviewed_by')->nullable(); // admin user id
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partner_applications');
    }
};
