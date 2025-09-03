<?php

namespace App\Console\Commands;

use App\Modules\BatchIncubator\Models\BatchSchedule;
use App\Modules\BatchIncubator\Models\ScheduleReminder;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;

class TestReminders extends Command
{
    protected $signature = 'reminders:test
                          {--create : Create test reminders}
                          {--send : Send test reminders immediately}
                          {--status : Show reminder status}';

    protected $description = 'Test the reminder system functionality';

    public function handle()
    {
        if ($this->option('create')) {
            $this->createTestReminders();
        }

        if ($this->option('send')) {
            $this->sendTestReminders();
        }

        if ($this->option('status')) {
            $this->showReminderStatus();
        }

        if (!$this->option('create') && !$this->option('send') && !$this->option('status')) {
            $this->info('Reminder System Test Options:');
            $this->info('  --create   Create test reminders');
            $this->info('  --send     Send test reminders immediately');
            $this->info('  --status   Show current reminder status');
        }
    }

    private function createTestReminders()
    {
        $this->info('Creating test reminders...');

        // Get first user and schedule
        $user = User::first();
        $schedule = BatchSchedule::first();

        if (!$user || !$schedule) {
            $this->error('No users or schedules found. Please create some test data first.');
            return;
        }

        // Create a test reminder for immediate sending
        $reminder = ScheduleReminder::createForSchedule(
            $schedule,
            $user,
            1, // 1 minute before (for immediate testing)
            'both'
        );

        $this->info("Created test reminder ID: {$reminder->id}");
        $this->info("Schedule: {$schedule->title}");
        $this->info("User: {$user->name}");
        $this->info("Scheduled for: {$reminder->reminder_time}");
    }

    private function sendTestReminders()
    {
        $this->info('Sending test reminders...');

        $pendingCount = ScheduleReminder::pending()->count();
        $this->info("Found {$pendingCount} pending reminders");

        if ($pendingCount > 0) {
            $this->call('schedule:send-reminders');
            $this->info('Test reminders sent!');
        } else {
            $this->info('No pending reminders to send.');
        }
    }

    private function showReminderStatus()
    {
        $this->info('Reminder Status Summary:');

        $total = ScheduleReminder::count();
        $pending = ScheduleReminder::pending()->count();
        $sent = ScheduleReminder::where('status', 'sent')->count();
        $failed = ScheduleReminder::where('status', 'failed')->count();

        $this->table(
            ['Status', 'Count'],
            [
                ['Total', $total],
                ['Pending', $pending],
                ['Sent', $sent],
                ['Failed', $failed],
            ]
        );

        if ($pending > 0) {
            $this->info("\nPending Reminders:");
            $pendingReminders = ScheduleReminder::with(['schedule', 'user'])
                ->pending()
                ->orderBy('reminder_time')
                ->take(5)
                ->get();

            $this->table(
                ['ID', 'Type', 'Schedule', 'User', 'Reminder Time', 'Method'],
                $pendingReminders->map(function ($reminder) {
                    return [
                        $reminder->id,
                        $reminder->reminder_type,
                        $reminder->schedule->title ?? 'N/A',
                        $reminder->user->name ?? 'N/A',
                        $reminder->reminder_time->format('Y-m-d H:i:s'),
                        $reminder->notification_method,
                    ];
                })->toArray()
            );
        }
    }
}
