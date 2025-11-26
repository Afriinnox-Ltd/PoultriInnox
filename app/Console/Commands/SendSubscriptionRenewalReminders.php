<?php

namespace App\Console\Commands;

use App\Modules\Marketplace\Models\Subscription;
use App\Notifications\SubscriptionRenewalReminderNotification;
use App\Mail\Marketplace\SubscriptionExpiring;
use Illuminate\Support\Facades\Mail;
use Illuminate\Console\Command;
use Carbon\Carbon;

class SendSubscriptionRenewalReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscriptions:send-renewal-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send renewal reminders for subscriptions expiring soon';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for subscriptions needing renewal reminders...');

        // Send reminders at 7 days, 3 days, and 1 day before expiry
        $reminderDays = [7, 3, 1];
        $totalSent = 0;

        foreach ($reminderDays as $days) {
            $targetDate = Carbon::now()->addDays($days)->startOfDay();

            $subscriptions = Subscription::where('is_active', true)
                ->whereDate('end_date', $targetDate)
                ->with('vendor.user')
                ->get();

            foreach ($subscriptions as $subscription) {
                try {
                    $user = $subscription->vendor->user;

                    // Only send reminder if auto-renew is disabled
                    // or if it's the final reminder (1 day)
                    if (!$subscription->auto_renew || $days== 1) {
                        $user->notify(new SubscriptionRenewalReminderNotification($subscription, $days));
                        
                        // Send professional email
                        try {
                            Mail::to($user->email)->send(new SubscriptionExpiring($subscription, $days));
                        } catch (\Exception $e) {
                            $this->error("✗ Failed to send email to {$user->email}: {$e->getMessage()}");
                        }

                        $totalSent++;

                        $this->line("✓ Reminder sent to {$user->email} - {$subscription->plan_name} expires in {$days} day(s)");
                    }
                } catch (\Exception $e) {
                    $this->error("✗ Failed to send reminder for subscription #{$subscription->id}: {$e->getMessage()}");
                }
            }
        }

        $this->info("Total reminders sent: {$totalSent}");

        return Command::SUCCESS;
    }
}
