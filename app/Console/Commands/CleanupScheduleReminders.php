<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Modules\BatchIncubator\Models\ScheduleReminder;

class CleanupScheduleReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'schedule:cleanup-reminders
                           {--dry-run : Show what would be deleted without actually deleting}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cleanup old schedule reminders (sent and failed reminders)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dryRun = $this->option('dry-run');

        $this->info('Cleaning up old schedule reminders...');

        if ($dryRun) {
            $this->warn('DRY RUN MODE - No records will be deleted');
        }

        // Count what would be deleted
        $oldSentCount = ScheduleReminder::where('status', 'sent')
                                      ->where('sent_at', '<', now()->subDays(30))
                                      ->count();

        $oldFailedCount = ScheduleReminder::where('status', 'failed')
                                        ->where('retry_count', '>=', 3)
                                        ->where('updated_at', '<', now()->subDays(7))
                                        ->count();

        if ($oldSentCount === 0 && $oldFailedCount === 0) {
            $this->info('No old reminders found to cleanup.');
            return Command::SUCCESS;
        }

        $this->info("Found reminders to cleanup:");
        $this->line("• Old sent reminders (>30 days): {$oldSentCount}");
        $this->line("• Old failed reminders (>7 days): {$oldFailedCount}");

        if ($dryRun) {
            $this->info("Total that would be deleted: " . ($oldSentCount + $oldFailedCount));
            return Command::SUCCESS;
        }

        if (!$this->confirm('Do you want to proceed with the cleanup?')) {
            $this->info('Cleanup cancelled.');
            return Command::SUCCESS;
        }

        // Perform cleanup
        $deletedSent = ScheduleReminder::cleanupOldReminders();
        $deletedFailed = ScheduleReminder::cleanupFailedReminders();

        $this->info("\nCleanup completed:");
        $this->info("• Deleted sent reminders: {$deletedSent}");
        $this->info("• Deleted failed reminders: {$deletedFailed}");
        $this->info("• Total deleted: " . ($deletedSent + $deletedFailed));

        return Command::SUCCESS;
    }
}
