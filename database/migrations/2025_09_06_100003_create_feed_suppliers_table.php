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
        Schema::create('feed_suppliers', function (Blueprint $table) {
            $table->id();

            // Basic information
            $table->string('name')->comment('Supplier company name');
            $table->string('code')->unique()->comment('Unique supplier code');
            $table->text('description')->nullable()->comment('Supplier description');

            // Contact information
            $table->string('contact_person')->nullable()->comment('Primary contact person');
            $table->string('email')->nullable()->comment('Contact email');
            $table->string('phone')->nullable()->comment('Contact phone');
            $table->string('website')->nullable()->comment('Company website');

            // Address information
            $table->text('address')->nullable()->comment('Physical address');
            $table->string('city')->nullable()->comment('City');
            $table->string('state')->nullable()->comment('State/Province');
            $table->string('country')->nullable()->comment('Country');
            $table->string('postal_code')->nullable()->comment('Postal/ZIP code');

            // Business information
            $table->string('tax_id')->nullable()->comment('Tax identification number');
            $table->string('registration_number')->nullable()->comment('Business registration number');
            $table->enum('supplier_type', ['manufacturer', 'distributor', 'retailer', 'cooperative'])->comment('Type of supplier');

            // Quality and certifications
            $table->json('certifications')->nullable()->comment('Quality certifications and standards');
            $table->decimal('quality_rating', 3, 2)->default(0)->comment('Quality rating (0-5)');
            $table->text('quality_notes')->nullable()->comment('Quality assessment notes');

            // Performance metrics
            $table->decimal('delivery_rating', 3, 2)->default(0)->comment('Delivery performance rating (0-5)');
            $table->decimal('price_competitiveness', 3, 2)->default(0)->comment('Price competitiveness rating (0-5)');
            $table->integer('total_orders')->default(0)->comment('Total number of orders');
            $table->decimal('average_delivery_days', 5, 2)->nullable()->comment('Average delivery time in days');

            // Terms and conditions
            $table->integer('payment_terms_days')->default(30)->comment('Payment terms in days');
            $table->decimal('minimum_order_value', 10, 2)->nullable()->comment('Minimum order value');
            $table->json('delivery_areas')->nullable()->comment('Areas where supplier delivers');
            $table->text('special_terms')->nullable()->comment('Special terms and conditions');

            // Status and preferences
            $table->enum('status', ['active', 'inactive', 'suspended', 'blacklisted'])->default('active');
            $table->boolean('is_preferred')->default(false)->comment('Preferred supplier flag');
            $table->boolean('emergency_supplier')->default(false)->comment('Can supply in emergencies');
            $table->integer('priority_order')->default(0)->comment('Priority ordering (lower = higher priority)');

            // Financial information
            $table->string('bank_name')->nullable()->comment('Bank name for payments');
            $table->string('account_number')->nullable()->comment('Bank account number');
            $table->string('routing_number')->nullable()->comment('Bank routing number');
            $table->string('payment_method')->nullable()->comment('Preferred payment method');

            // Audit fields
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            // Indexes
            $table->index(['status']);
            $table->index(['supplier_type']);
            $table->index(['is_preferred', 'status']);
            $table->index(['quality_rating']);
            $table->index(['created_by']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feed_suppliers');
    }
};
