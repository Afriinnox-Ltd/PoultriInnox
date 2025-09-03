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
