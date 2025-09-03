<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Modules\BatchIncubator\Models\ScheduleReminder;
use App\Notifications\ScheduleReminderNotification;
use Illuminate\Support\Facades\Log;

class SendScheduleReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'schedule:send-reminders
                           {--limit=50 : Maximum number of reminders to process}
                           {--dry-run : Show what would be sent without actually sending}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send pending schedule reminders via email and database notifications';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $limit = (int) $this->option('limit');
        $dryRun = $this->option('dry-run');

        $this->info('Processing schedule reminders...');

        if ($dryRun) {
            $this->warn('DRY RUN MODE - No notifications will be sent');
        }

        // Get pending reminders that are due
        $reminders = ScheduleReminder::with(['schedule.batch', 'user'])
            ->forNotification()
            ->limit($limit)
            ->get();

        if ($reminders->isEmpty()) {
            $this->info('No pending reminders found.');
            return Command::SUCCESS;
        }

        $this->info("Found {$reminders->count()} reminders to process.");

        $sent = 0;
        $failed = 0;

        foreach ($reminders as $reminder) {
            try {
                if ($dryRun) {
                    $this->line("Would send: {$reminder->schedule->title} to {$reminder->user->name}");
                    continue;
                }

                // Send the notification
                $reminder->user->notify(new ScheduleReminderNotification($reminder, $reminder->schedule));

                // Mark as sent
                $reminder->markAsSent();
                $sent++;

                $this->line("✓ Sent reminder for '{$reminder->schedule->title}' to {$reminder->user->name}");

            } catch (\Exception $e) {
                $errorMessage = "Failed to send reminder for schedule '{$reminder->schedule->title}' to user '{$reminder->user->name}': " . $e->getMessage();

                Log::error($errorMessage, [
                    'reminder_id' => $reminder->id,
                    'schedule_id' => $reminder->schedule_id,
                    'user_id' => $reminder->user_id,
                    'exception' => $e,
                ]);

                if (!$dryRun) {
                    $reminder->markAsFailed($e->getMessage());
                }

                $failed++;
                $this->error("✗ {$errorMessage}");
            }
        }

        if (!$dryRun) {
            $this->info("\nSummary:");
            $this->info("• Sent: {$sent}");
            $this->info("• Failed: {$failed}");

            if ($failed > 0) {
                $this->warn("Failed reminders will be retried automatically.");
            }
        }

        return Command::SUCCESS;
    }
}
