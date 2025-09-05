<?php

use Illuminate\Support\Facades\Route;
use App\Modules\FeedManagement\Controllers\FeedManagementController;
use App\Modules\FeedManagement\Controllers\FeedInventoryController;
use App\Modules\FeedManagement\Controllers\FeedConsumptionController;

/*
|--------------------------------------------------------------------------
| Feed Management Routes
|--------------------------------------------------------------------------
|
| These routes handle the feed management functionality including
| inventory tracking, consumption recording, and feed analytics.
|
*/

Route::prefix('feed-management')->name('feed-management.')->middleware(['auth', 'module.dependencies:feed-management'])->group(function () {

    // Main dashboard
    Route::get('/', [FeedManagementController::class, 'index'])->name('index');

    // API routes for data fetching
    Route::get('/api/programs', [FeedManagementController::class, 'getPrograms'])->name('api.programs');
    Route::get('/api/feed-types', [FeedManagementController::class, 'getFeedTypes'])->name('api.feed-types');
    Route::get('/api/incubator-data', [FeedManagementController::class, 'getIncubatorData'])->name('api.incubator-data');
    Route::post('/api/calculate-requirements', [FeedManagementController::class, 'calculateRequirements'])->name('api.calculate-requirements');

    // Feed Inventory Management
    Route::prefix('inventory')->name('inventory.')->group(function () {
        Route::get('/', [FeedInventoryController::class, 'index'])->name('index');
        Route::post('/', [FeedInventoryController::class, 'store'])->name('store');
        Route::put('/{feedInventory}', [FeedInventoryController::class, 'update'])->name('update');
        Route::delete('/{feedInventory}', [FeedInventoryController::class, 'destroy'])->name('destroy');
        Route::post('/{feedInventory}/adjust-stock', [FeedInventoryController::class, 'adjustStock'])->name('adjust-stock');

        // API routes
        Route::get('/api/low-stock-alerts', [FeedInventoryController::class, 'lowStockAlerts'])->name('api.low-stock');
        Route::get('/api/expiring-items', [FeedInventoryController::class, 'expiringItems'])->name('api.expiring');
        Route::get('/api/batch-numbers', [FeedInventoryController::class, 'getBatchNumbers'])->name('api.batch-numbers');
    });

    // Feed Consumption Tracking
    Route::prefix('consumption')->name('consumption.')->group(function () {
        Route::get('/', [FeedConsumptionController::class, 'index'])->name('index');
        Route::post('/', [FeedConsumptionController::class, 'store'])->name('store');
        Route::put('/{feedConsumption}', [FeedConsumptionController::class, 'update'])->name('update');
        Route::delete('/{feedConsumption}', [FeedConsumptionController::class, 'destroy'])->name('destroy');

        // Analytics
        Route::get('/api/analytics', [FeedConsumptionController::class, 'analytics'])->name('api.analytics');
    });

});
