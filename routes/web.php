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
use App\Modules\BatchIncubator\Controllers\SmartSchedulingController;
use App\Modules\BatchIncubator\Controllers\Admin\ProtocolManagementController;
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
    Route::prefix('batch-incubator')->name('batch-incubator.')
        ->middleware(['module.dependencies:batch-incubator'])
        ->group(function () {
            // Overview/Dashboard
            Route::get('/', [BatchIncubatorController::class, 'index'])->name('index');

            // Batch routes
            Route::resource('batches', BatchController::class);
            Route::put('batches/{batch}/status', [BatchController::class, 'updateStatus'])
                ->name('batches.status');
            Route::post('batches/{batch}/events', [BatchController::class, 'addEvent'])
                ->name('batches.events.store');
            Route::put('batches/{batch}/access', [BatchController::class, 'updateAccess'])
                ->name('batches.access');
            Route::post('batches/{batch}/grant-access', [BatchController::class, 'grantAccess'])
                ->name('batches.grant-access');
            Route::delete('batches/{batch}/revoke-access/{user}', [BatchController::class, 'revokeAccess'])
                ->name('batches.revoke-access');

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

            // Smart Scheduling Routes
            Route::prefix('smart-scheduling')->name('smart-scheduling.')->group(function () {
                Route::get('overview', [SmartSchedulingController::class, 'getSchedulingOverview'])->name('overview');
                Route::get('batches/{batch}/recommendations', [SmartSchedulingController::class, 'showRecommendations'])->name('recommendations');
                Route::get('batches/{batch}/recommendations-by-type', [SmartSchedulingController::class, 'getRecommendationsByEventType'])->name('recommendations-by-type');
                Route::get('batches/{batch}/feed-recommendations', [SmartSchedulingController::class, 'getFeedRecommendations'])->name('feed-recommendations');
                Route::get('batches/{batch}/medication-recommendations', [SmartSchedulingController::class, 'getMedicationRecommendations'])->name('medication-recommendations');
                Route::get('batches/{batch}/vaccination-recommendations', [SmartSchedulingController::class, 'getVaccinationRecommendations'])->name('vaccination-recommendations');
                Route::get('batches/{batch}/health-dashboard', [SmartSchedulingController::class, 'getHealthDashboard'])->name('health-dashboard');
                Route::get('batches/{batch}/report', [SmartSchedulingController::class, 'generateBatchReport'])->name('batch-report');

                // Accept recommendations
                Route::post('batches/{batch}/accept-medication', [SmartSchedulingController::class, 'acceptMedicationRecommendation'])->name('accept-medication');
                Route::post('batches/{batch}/accept-vaccination', [SmartSchedulingController::class, 'acceptVaccinationRecommendation'])->name('accept-vaccination');

                // Dismiss recommendations
                Route::post('batches/{batch}/dismiss-recommendation', [SmartSchedulingController::class, 'dismissRecommendation'])->name('dismiss-recommendation');
            });

            // Admin Protocol Management Routes
            Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
                Route::prefix('protocols')->name('protocols.')->group(function () {
                    Route::get('/', [ProtocolManagementController::class, 'index'])->name('index');
                    Route::get('statistics', [ProtocolManagementController::class, 'getStatistics'])->name('statistics');

                    // Medication protocol routes
                    Route::get('medication/create', [ProtocolManagementController::class, 'createMedication'])->name('medication.create');
                    Route::post('medication', [ProtocolManagementController::class, 'storeMedication'])->name('medication.store');
                    Route::get('medication/{medication}/edit', [ProtocolManagementController::class, 'editMedication'])->name('medication.edit');
                    Route::put('medication/{medication}', [ProtocolManagementController::class, 'updateMedication'])->name('medication.update');
                    Route::delete('medication/{medication}', [ProtocolManagementController::class, 'destroy'])->name('medication.destroy')->defaults('type', 'medication');

                    // Vaccination protocol routes
                    Route::get('vaccination/create', [ProtocolManagementController::class, 'createVaccination'])->name('vaccination.create');
                    Route::post('vaccination', [ProtocolManagementController::class, 'storeVaccination'])->name('vaccination.store');
                    Route::get('vaccination/{vaccination}/edit', [ProtocolManagementController::class, 'editVaccination'])->name('vaccination.edit');
                    Route::put('vaccination/{vaccination}', [ProtocolManagementController::class, 'updateVaccination'])->name('vaccination.update');
                    Route::delete('vaccination/{vaccination}', [ProtocolManagementController::class, 'destroy'])->name('vaccination.destroy')->defaults('type', 'vaccination');

                    // Toggle status routes
                    Route::patch('{type}/{id}/status', [ProtocolManagementController::class, 'toggleStatus'])->name('toggle-status');
                });
            });
        });

    // Feed Management Module Routes
    require __DIR__ . '/feed-management.php';
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/admin.php';
