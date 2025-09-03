<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\BatchIncubatorController;
use App\Modules\BatchIncubator\Controllers\BatchController;
use App\Modules\BatchIncubator\Controllers\IncubatorController;
use App\Modules\BatchIncubator\Controllers\ScheduleController;
use App\Modules\BatchIncubator\Controllers\ReportsController;
use App\Http\Controllers\Modules\BatchIncubator\Controllers\ScheduleReminderController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Module management routes
    Route::prefix('modules')->name('modules.')->group(function () {
        Route::get('/', [ModuleController::class, 'index'])->name('index');
        Route::post('{module}/activate', [ModuleController::class, 'activate'])->name('activate');
        Route::post('{module}/deactivate', [ModuleController::class, 'deactivate'])->name('deactivate');
        Route::get('enabled', [ModuleController::class, 'enabled'])->name('enabled');
    });

    // BatchIncubator Module Routes
    Route::prefix('batch-incubator')->name('batch-incubator.')->group(function () {
        // Overview/Dashboard
        Route::get('/', [BatchIncubatorController::class, 'index'])->name('index');

        // Batch routes
        Route::resource('batches', BatchController::class);
        Route::put('batches/{batch}/status', [BatchController::class, 'updateStatus'])
            ->name('batches.status');
        Route::post('batches/{batch}/events', [BatchController::class, 'addEvent'])
            ->name('batches.events.store');

        // Incubator routes
        Route::resource('incubators', IncubatorController::class);
        Route::put('incubators/{incubator}/status', [IncubatorController::class, 'updateStatus'])
            ->name('incubators.status');
        Route::post('incubators/{incubator}/maintenance', [IncubatorController::class, 'recordMaintenance'])
            ->name('incubators.maintenance');
        Route::put('incubators/{incubator}/access', [IncubatorController::class, 'updateAccess'])
            ->name('incubators.access');
        Route::post('incubators/{incubator}/search-user', [IncubatorController::class, 'searchUser'])
            ->name('incubators.search-user');
        Route::post('incubators/{incubator}/grant-access', [IncubatorController::class, 'searchAndGrantAccess'])
            ->name('incubators.grant-access');
        Route::delete('incubators/{incubator}/revoke-access/{user}', [IncubatorController::class, 'revokeAccess'])
            ->name('incubators.revoke-access');

            // Schedule Management Routes
    Route::resource('schedules', ScheduleController::class);
    Route::post('schedules/{schedule}/start', [ScheduleController::class, 'start'])->name('schedules.start');
    Route::post('schedules/{schedule}/complete', [ScheduleController::class, 'complete'])->name('schedules.complete');
    Route::post('schedules/{schedule}/postpone', [ScheduleController::class, 'postpone'])->name('schedules.postpone');
    Route::post('schedules/{schedule}/cancel', [ScheduleController::class, 'cancel'])->name('schedules.cancel');
    Route::get('schedules-calendar', [ScheduleController::class, 'calendar'])->name('schedules.calendar');

    // Schedule Reminder Routes
    Route::get('schedules/{schedule}/reminders', [ScheduleReminderController::class, 'index'])->name('schedules.reminders');
    Route::post('schedules/{schedule}/reminders', [ScheduleReminderController::class, 'store'])->name('schedules.reminders.store');
    Route::delete('schedules/{schedule}/reminders/{reminder}', [ScheduleReminderController::class, 'destroy'])->name('schedules.reminders.delete');
    Route::post('schedules/{schedule}/reminders/{reminder}/cancel', [ScheduleReminderController::class, 'cancel'])->name('schedules.reminders.cancel');

        // Reports routes
        Route::get('reports', [ReportsController::class, 'index'])->name('reports.index');
        Route::get('reports/generate', [ReportsController::class, 'create'])->name('reports.create');
        Route::post('reports/generate', [ReportsController::class, 'store'])->name('reports.store');
        Route::get('reports/{report}', [ReportsController::class, 'show'])->name('reports.show');
        Route::get('reports/{report}/download', [ReportsController::class, 'download'])->name('reports.download');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
