<?php

namespace App\Console\Commands;

use App\Mail\Marketplace\SubscriptionExpired;
use App\Modules\Marketplace\Models\Subscription;
use App\Notifications\SubscriptionExpiredNotification;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class ProcessExpiredSubscriptions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscriptions:process-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process expired subscriptions and send notifications';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for expired subscriptions...');

        // Find subscriptions that expired today
        $expiredSubscriptions = Subscription::where('is_active', true)
            ->where('auto_renew', false)
            ->whereDate('end_date', '<', Carbon::now()->startOfDay())
            ->with('vendor.user')
            ->get();

        $totalProcessed = 0;

        /** @var Subscription $subscription */
        foreach ($expiredSubscriptions as $subscription) {
            try {
                // Deactivate the subscription
                $subscription->update([
                    'is_active' => false,
                ]);

                // Send expiration notification
                $user = $subscription->vendor->user;
                $user->notify(new SubscriptionExpiredNotification($subscription));

                // Send professional email
                try {
                    Mail::to($user->email)->send(new SubscriptionExpired($subscription));
                } catch (\Exception $e) {
                    $this->error("✗ Failed to send email to {$user->email}: {$e->getMessage()}");
                }

                $totalProcessed++;
                $this->line("✓ Deactivated subscription #{$subscription->id} - {$subscription->plan_name} for {$user->email}");

            } catch (\Exception $e) {
                $this->error("✗ Failed to process subscription #{$subscription->id}: {$e->getMessage()}");
            }
        }

        $this->info("Total subscriptions processed: {$totalProcessed}");

        return Command::SUCCESS;
    }
}
