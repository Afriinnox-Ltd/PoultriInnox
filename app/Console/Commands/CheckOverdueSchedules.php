<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Modules\BatchIncubator\Models\BatchSchedule;
use App\Models\Modules\BatchIncubator\Models\ScheduleReminder;
use App\Modules\BatchIncubator\Enums\ScheduleStatus;

class CheckOverdueSchedules extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'schedule:check-overdue
                           {--create-reminders : Create overdue reminders for overdue schedules}
                           {--dry-run : Show what would be done without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for overdue schedules and optionally create overdue reminders';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $createReminders = $this->option('create-reminders');
        $dryRun = $this->option('dry-run');

        $this->info('Checking for overdue schedules...');

        if ($dryRun) {
            $this->warn('DRY RUN MODE - No changes will be made');
        }

        // Find schedules that are overdue
        $overdueSchedules = BatchSchedule::where('status', ScheduleStatus::PENDING)
            ->where(function ($query) {
                $query->whereRaw("DATETIME(scheduled_date, COALESCE(scheduled_time, '00:00:00')) < ?", [now()]);
            })
            ->with(['batch', 'assignedTo'])
            ->get();

        if ($overdueSchedules->isEmpty()) {
            $this->info('No overdue schedules found.');
            return Command::SUCCESS;
        }

        $this->info("Found {$overdueSchedules->count()} overdue schedules:");

        foreach ($overdueSchedules as $schedule) {
            $scheduledDateTime = $schedule->getScheduledDateTime();
            $overdueDuration = $scheduledDateTime->diffForHumans();

            $this->line("• {$schedule->title} (Batch: {$schedule->batch->name}) - Due {$overdueDuration}");

            if ($createReminders) {
                // Check if an overdue reminder already exists
                $existingReminder = ScheduleReminder::where('schedule_id', $schedule->id)
                    ->where('reminder_type', 'overdue')
                    ->where('status', '!=', 'cancelled')
                    ->first();

                if ($existingReminder) {
                    $this->line("  → Overdue reminder already exists");
                    continue;
                }

                if ($dryRun) {
                    $this->line("  → Would create overdue reminder");
                    continue;
                }

                // Create overdue reminder for assigned user or default users
                $usersToNotify = [];

                if ($schedule->assigned_to) {
                    $usersToNotify[] = $schedule->assignedTo;
                } else {
                    // If no specific user assigned, notify batch managers or admin users
                    // This could be configurable in the future
                    $usersToNotify = \App\Models\User::where('role', 'admin')
                        ->orWhere('role', 'manager')
                        ->get();
                }

                foreach ($usersToNotify as $user) {
                    try {
                        ScheduleReminder::createOverdueReminder($schedule, $user);
                        $this->line("  → Created overdue reminder for {$user->name}");
                    } catch (\Exception $e) {
                        $this->error("  → Failed to create reminder for {$user->name}: {$e->getMessage()}");
                    }
                }
            }
        }

        if ($createReminders && !$dryRun) {
            $this->info("\nOverdue reminders created. Run 'php artisan schedule:send-reminders' to send them.");
        }

        return Command::SUCCESS;
    }
}
