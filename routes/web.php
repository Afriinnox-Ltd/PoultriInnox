<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\BatchIncubatorController;
use App\Modules\BatchIncubator\Controllers\BatchController;
use App\Modules\BatchIncubator\Controllers\IncubatorController;

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

        // Schedule routes
        Route::get('schedules', function () {
            return Inertia::render('modules/batch-incubator/schedules/index', [
                'schedules' => collect([]), // Placeholder for now
            ]);
        })->name('schedules.index');

        // Reports routes
        Route::get('reports', function () {
            return Inertia::render('modules/batch-incubator/reports/index', [
                'reports' => collect([]), // Placeholder for now
            ]);
        })->name('reports.index');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
