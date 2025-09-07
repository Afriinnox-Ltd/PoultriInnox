<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Modules\Marketplace\Models\Order;
use App\Modules\Marketplace\Models\Payment;

class TestPaymentTracking extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:payment-tracking';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the payment tracking system functionality';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing payment tracking system...');
        $this->newLine();

        try {
            // Find an existing order to test with
            $order = Order::first();

            if (!$order) {
                $this->error('No orders found to test with');
                return 1;
            }

            $this->info("✅ Found test order: {$order->order_number}");
            $this->info("Order total: \${$order->total_amount}");
            $this->info("Current status: {$order->status}");
            $this->info("Payment status: {$order->payment_status}");
            $this->newLine();

            // Test the payment tracking methods without modifying the order
            $this->info('Testing Payment model revenue tracking methods...');

            $totalRevenue = Payment::getTotalRevenue();
            $totalCommission = Payment::getTotalCommission();
            $pendingPayouts = Payment::getPendingVendorPayouts();
            $completedPayouts = Payment::getCompletedVendorPayouts();

            $this->info("✅ Total Revenue: \${$totalRevenue}");
            $this->info("✅ Total Commission: \${$totalCommission}");
            $this->info("✅ Pending Vendor Payouts: \${$pendingPayouts}");
            $this->info("✅ Completed Vendor Payouts: \${$completedPayouts}");
            $this->newLine();

            // Test revenue stats
            $revenueStats = Payment::getRevenueStats('month');
            $this->info('✅ Monthly Revenue Stats:');
            $this->info("  - Revenue: \${$revenueStats['total_revenue']}");
            $this->info("  - Commission: \${$revenueStats['total_commission']}");
            $this->info("  - Vendor Amount: \${$revenueStats['total_vendor_amount']}");
            $this->info("  - Payment Count: {$revenueStats['payment_count']}");
            $this->newLine();

            // Test monthly trend
            $monthlyTrend = Payment::getMonthlyRevenueTrend();
            $this->info('✅ Monthly Revenue Trend (last 3 months):');
            foreach (array_slice($monthlyTrend, -3) as $month) {
                $this->info("  - {$month['month']}: \${$month['revenue']} ({$month['transactions']} transactions)");
            }
            $this->newLine();

            // Test payment method stats
            $paymentMethodStats = Payment::getPaymentMethodStats();
            $this->info('✅ Payment Method Stats:');
            if (count($paymentMethodStats) > 0) {
                foreach ($paymentMethodStats as $method) {
                    $this->info("  - {$method['payment_method']}: \${$method['total_amount']} ({$method['transaction_count']} transactions)");
                }
            } else {
                $this->info("  - No payment methods found");
            }
            $this->newLine();

            // Test recent payments
            $recentPayments = Payment::getRecentPayments(3);
            $this->info('✅ Recent Payments (last 3):');
            if ($recentPayments->count() > 0) {
                foreach ($recentPayments as $recentPayment) {
                    $this->info("  - {$recentPayment->transaction_id}: \${$recentPayment->net_amount} ({$recentPayment->status})");
                }
            } else {
                $this->info("  - No payments found");
            }
            $this->newLine();

            // Test if we can create a payment record
            $this->info('Testing payment creation on delivery...');

            // Find an order that doesn't have a payment yet, or create a test scenario
            $testOrder = Order::whereDoesntHave('payments')->first();

            if ($testOrder) {
                $this->info("Found order without payment: {$testOrder->order_number}");

                // Test the markAsDeliveredWithPayment method
                $originalStatus = $testOrder->status;
                $originalPaymentStatus = $testOrder->payment_status;

                $testOrder->markAsDeliveredWithPayment();
                $testOrder->refresh();

                $this->info("✅ Order status updated: {$originalStatus} → {$testOrder->status}");
                $this->info("✅ Payment status updated: {$originalPaymentStatus} → {$testOrder->payment_status}");

                // Check if payment was created
                $payment = $testOrder->payments()->where('type', 'payment')->first();

                if ($payment) {
                    $this->info('✅ Payment record created:');
                    $this->info("  - Transaction ID: {$payment->transaction_id}");
                    $this->info("  - Amount: \${$payment->amount}");
                    $this->info("  - Net Amount: \${$payment->net_amount}");
                    $this->info("  - Commission: \${$payment->commission_amount}");
                    $this->info("  - Vendor Amount: \${$payment->vendor_amount}");
                    $this->info("  - Status: {$payment->status}");
                    $this->info("  - Method: {$payment->payment_method}");
                } else {
                    $this->error('❌ Payment record was not created');
                }
            } else {
                $this->info('All orders already have payment records');
            }

            $this->newLine();
            $this->info('🎉 Payment tracking system test completed!');

        } catch (\Exception $e) {
            $this->error('Error: ' . $e->getMessage());
            $this->error('Stack trace:');
            $this->error($e->getTraceAsString());
            return 1;
        }

        return 0;
    }
}
