<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('partner_orders', function (Blueprint $table) {
            // Date by which payment is expected
            $table->date('payment_due_date')->nullable()->after('paid_at');
            // How many days between reminder notifications (e.g. 7 = every 7 days)
            $table->unsignedSmallInteger('payment_reminder_days')->nullable()->after('payment_due_date');
            // Timestamp of the last reminder sent so we know when to send the next one
            $table->timestamp('last_payment_reminder_at')->nullable()->after('payment_reminder_days');
        });
    }

    public function down(): void
    {
        Schema::table('partner_orders', function (Blueprint $table) {
            $table->dropColumn(['payment_due_date', 'payment_reminder_days', 'last_payment_reminder_at']);
        });
    }
};
