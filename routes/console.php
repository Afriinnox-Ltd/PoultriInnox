<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule reminder system tasks
Schedule::command('schedule:send-reminders')
    ->everyFiveMinutes()
    ->description('Send pending schedule reminders')
    ->onOneServer()
    ->runInBackground();

Schedule::command('schedule:check-overdue')
    ->hourly()
    ->description('Check for overdue schedules and create overdue reminders')
    ->onOneServer()
    ->runInBackground();

Schedule::command('schedule:cleanup-reminders')
    ->daily()
    ->description('Clean up old processed reminders')
    ->onOneServer()
    ->runInBackground();

// Schedule subscription renewal reminders
Schedule::command('subscriptions:send-renewal-reminders')
    ->daily()
    ->at('09:00')
    ->description('Send renewal reminders for subscriptions expiring soon')
    ->onOneServer()
    ->runInBackground();

// Process expired subscriptions
Schedule::command('subscriptions:process-expired')
    ->daily()
    ->at('00:01')
    ->description('Deactivate expired subscriptions and send notifications')
    ->onOneServer()
    ->runInBackground();

// Check batch completion status (IoT Integration)
Schedule::command('batch:check-completion')
    ->daily()
    ->at('08:00')
    ->description('Check for batches reaching completion date and create alerts')
    ->onOneServer()
    ->runInBackground();

// Also check batch completion every 4 hours during business hours
Schedule::command('batch:check-completion')
    ->dailyAt('12:00')
    ->description('Midday batch completion check')
    ->onOneServer()
    ->runInBackground();

Schedule::command('batch:check-completion')
    ->dailyAt('16:00')
    ->description('Afternoon batch completion check')
    ->onOneServer()
    ->runInBackground();
