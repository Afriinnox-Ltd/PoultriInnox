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
        Schema::table('marketplace_vendors', function (Blueprint $table) {
            // Add missing business fields 
            $table->string('business_registration_number')->nullable()->after('business_name');
            $table->text('business_description')->nullable()->after('business_type');
            $table->string('business_address')->nullable()->after('business_description');
            $table->string('business_phone')->nullable()->after('business_address');
            $table->string('business_email')->nullable()->after('business_phone');
            $table->string('business_website')->nullable()->after('business_email');

            // Add banking fields
            $table->string('bank_name')->nullable()->after('payment_details');
            $table->string('bank_account_number')->nullable()->after('bank_name');
            $table->string('bank_account_name')->nullable()->after('bank_account_number');
            $table->string('bank_branch')->nullable()->after('bank_account_name');

            // Add additional fields
            $table->string('tax_number')->nullable()->after('tax_id');
            $table->integer('years_in_business')->nullable()->after('tax_number');
            $table->text('specializations')->nullable()->after('years_in_business');
            $table->string('slug')->unique()->nullable()->after('specializations');
            $table->string('status')->default('pending')->after('slug');
            $table->text('rejection_reason')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('marketplace_vendors', function (Blueprint $table) {
            $table->dropColumn([
                'business_registration_number',
                'business_description',
                'business_address',
                'business_phone',
                'business_email',
                'business_website',
                'bank_name',
                'bank_account_number',
                'bank_account_name',
                'bank_branch',
                'tax_number',
                'years_in_business',
                'specializations',
                'slug',
                'status',
                'rejection_reason'
            ]);
        });
    }
};
