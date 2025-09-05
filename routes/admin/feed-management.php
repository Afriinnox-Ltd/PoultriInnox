<?php

use App\Http\Controllers\Admin\FeedManagement\FeedTypeController;
use App\Http\Controllers\Admin\FeedManagement\FeedProgramController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Feed Management Admin Routes
|--------------------------------------------------------------------------
|
| Routes for managing feed types, programs, and related administrative
| tasks in the feed management system.
|
*/

Route::prefix('feed-management')->name('feed-management.')->group(function () {

    // Feed Types Management
    Route::prefix('feed-types')->name('feed-types.')->group(function () {
        Route::get('/', [FeedTypeController::class, 'index'])->name('index');
        Route::get('/create', [FeedTypeController::class, 'create'])->name('create');
        Route::post('/', [FeedTypeController::class, 'store'])->name('store');
        Route::get('/{feedType}', [FeedTypeController::class, 'show'])->name('show');
        Route::get('/{feedType}/edit', [FeedTypeController::class, 'edit'])->name('edit');
        Route::put('/{feedType}', [FeedTypeController::class, 'update'])->name('update');
        Route::delete('/{feedType}', [FeedTypeController::class, 'destroy'])->name('destroy');

        // Bulk operations
        Route::post('/bulk-import', [FeedTypeController::class, 'bulkImport'])->name('bulk-import');
        Route::get('/export-template', [FeedTypeController::class, 'exportTemplate'])->name('export-template');
        Route::post('/bulk-update', [FeedTypeController::class, 'bulkUpdate'])->name('bulk-update');

        // Analytics and reports
        Route::get('/{feedType}/analytics', [FeedTypeController::class, 'analytics'])->name('analytics');
        Route::get('/{feedType}/consumption-history', [FeedTypeController::class, 'consumptionHistory'])->name('consumption-history');
        Route::get('/{feedType}/inventory-status', [FeedTypeController::class, 'inventoryStatus'])->name('inventory-status');

        // Nutritional analysis
        Route::post('/{feedType}/validate-nutrition', [FeedTypeController::class, 'validateNutrition'])->name('validate-nutrition');
        Route::get('/nutrition-requirements/{category}', [FeedTypeController::class, 'getNutritionRequirements'])->name('nutrition-requirements');
    });

    // Feed Programs Management
    Route::prefix('feed-programs')->name('feed-programs.')->group(function () {
        Route::get('/', [FeedProgramController::class, 'index'])->name('index');
        Route::get('/create', [FeedProgramController::class, 'create'])->name('create');
        Route::post('/', [FeedProgramController::class, 'store'])->name('store');
        Route::get('/{feedProgram}', [FeedProgramController::class, 'show'])->name('show');
        Route::get('/{feedProgram}/edit', [FeedProgramController::class, 'edit'])->name('edit');
        Route::put('/{feedProgram}', [FeedProgramController::class, 'update'])->name('update');
        Route::delete('/{feedProgram}', [FeedProgramController::class, 'destroy'])->name('destroy');

        // Program generation and templates
        Route::post('/generate-for-batch', [FeedProgramController::class, 'generateForBatch'])->name('generate-for-batch');
        Route::get('/templates/{birdType}', [FeedProgramController::class, 'getTemplates'])->name('templates');
        Route::post('/clone/{feedProgram}', [FeedProgramController::class, 'clone'])->name('clone');

        // Performance tracking
        Route::get('/{feedProgram}/performance', [FeedProgramController::class, 'performance'])->name('performance');
        Route::get('/{feedProgram}/schedules', [FeedProgramController::class, 'associatedSchedules'])->name('schedules');

        // Bulk operations
        Route::post('/bulk-import', [FeedProgramController::class, 'bulkImport'])->name('bulk-import');
        Route::get('/export-template', [FeedProgramController::class, 'exportTemplate'])->name('export-template');

        // Age recommendations
        Route::get('/age-recommendations/{ageDays}', [FeedProgramController::class, 'getAgeRecommendations'])->name('age-recommendations');
        Route::post('/{feedProgram}/validate', [FeedProgramController::class, 'validateProgram'])->name('validate');
    });

    // Quick access routes
    Route::get('/dashboard-data', [FeedTypeController::class, 'dashboardData'])->name('dashboard-data');
    Route::get('/quick-stats', [FeedProgramController::class, 'quickStats'])->name('quick-stats');
    Route::get('/alerts', [FeedTypeController::class, 'getAlerts'])->name('alerts');
});
