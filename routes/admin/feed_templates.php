<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\FeedTemplateController;

/*
|--------------------------------------------------------------------------
| Admin Feed Template Routes
|--------------------------------------------------------------------------
| Routes for system administrators to upload and manage feed templates,
| starter programs, and default feed data that users can select from
*/

Route::prefix('admin/feed-templates')->name('admin.feed-templates.')->group(function () {

    // Feed Type Templates Management
    Route::get('/', [FeedTemplateController::class, 'index'])->name('index');
    Route::get('/feed-types', [FeedTemplateController::class, 'feedTypes'])->name('feed-types');
    Route::post('/feed-types/upload', [FeedTemplateController::class, 'uploadFeedTypes'])->name('feed-types.upload');
    Route::post('/feed-types/bulk-create', [FeedTemplateController::class, 'bulkCreateFeedTypes'])->name('feed-types.bulk-create');
    Route::delete('/feed-types/{id}', [FeedTemplateController::class, 'deleteFeedType'])->name('feed-types.delete');

    // Feed Program Templates
    Route::get('/programs', [FeedTemplateController::class, 'feedPrograms'])->name('programs');
    Route::post('/programs/upload', [FeedTemplateController::class, 'uploadFeedPrograms'])->name('programs.upload');
    Route::post('/programs/generate-starter-templates', [FeedTemplateController::class, 'generateStarterTemplates'])->name('programs.generate-starter');
    Route::delete('/programs/{id}', [FeedTemplateController::class, 'deleteFeedProgram'])->name('programs.delete');

    // Supplier Templates
    Route::get('/suppliers', [FeedTemplateController::class, 'suppliers'])->name('suppliers');
    Route::post('/suppliers/upload', [FeedTemplateController::class, 'uploadSuppliers'])->name('suppliers.upload');
    Route::post('/suppliers/create-sample', [FeedTemplateController::class, 'createSampleSuppliers'])->name('suppliers.create-sample');

    // Nutritional Standards & Guidelines
    Route::get('/nutritional-standards', [FeedTemplateController::class, 'nutritionalStandards'])->name('nutritional-standards');
    Route::post('/nutritional-standards/upload', [FeedTemplateController::class, 'uploadNutritionalStandards'])->name('nutritional-standards.upload');
    Route::post('/nutritional-standards/reset-defaults', [FeedTemplateController::class, 'resetNutritionalDefaults'])->name('nutritional-standards.reset-defaults');

    // Starter Data Sets
    Route::get('/starter-data', [FeedTemplateController::class, 'starterData'])->name('starter-data');
    Route::post('/starter-data/create-complete-set', [FeedTemplateController::class, 'createCompleteStarterSet'])->name('starter-data.create-complete');
    Route::post('/starter-data/import-region-specific', [FeedTemplateController::class, 'importRegionSpecific'])->name('starter-data.import-region');

    // Template Downloads (for users to see expected formats)
    Route::get('/downloads/feed-types-template', [FeedTemplateController::class, 'downloadFeedTypesTemplate'])->name('downloads.feed-types-template');
    Route::get('/downloads/feed-programs-template', [FeedTemplateController::class, 'downloadFeedProgramsTemplate'])->name('downloads.feed-programs-template');
    Route::get('/downloads/suppliers-template', [FeedTemplateController::class, 'downloadSuppliersTemplate'])->name('downloads.suppliers-template');

    // Validation & Preview
    Route::post('/validate-upload', [FeedTemplateController::class, 'validateUpload'])->name('validate-upload');
    Route::post('/preview-import', [FeedTemplateController::class, 'previewImport'])->name('preview-import');

    // Bulk Operations
    Route::post('/bulk-activate', [FeedTemplateController::class, 'bulkActivate'])->name('bulk-activate');
    Route::post('/bulk-deactivate', [FeedTemplateController::class, 'bulkDeactivate'])->name('bulk-deactivate');
    Route::delete('/bulk-delete', [FeedTemplateController::class, 'bulkDelete'])->name('bulk-delete');

});

// Admin System Data Management
Route::prefix('admin/system-data')->name('admin.system-data.')->group(function () {

    // Global Settings for Feed Management
    Route::get('/settings', [FeedTemplateController::class, 'systemSettings'])->name('settings');
    Route::post('/settings/update', [FeedTemplateController::class, 'updateSystemSettings'])->name('settings.update');

    // Default Values Management
    Route::get('/defaults', [FeedTemplateController::class, 'systemDefaults'])->name('defaults');
    Route::post('/defaults/feeding-schedules', [FeedTemplateController::class, 'updateDefaultFeedingSchedules'])->name('defaults.feeding-schedules');
    Route::post('/defaults/nutritional-requirements', [FeedTemplateController::class, 'updateDefaultNutritionalRequirements'])->name('defaults.nutritional-requirements');
    Route::post('/defaults/consumption-rates', [FeedTemplateController::class, 'updateDefaultConsumptionRates'])->name('defaults.consumption-rates');

    // Regional Adaptations
    Route::get('/regional', [FeedTemplateController::class, 'regionalSettings'])->name('regional');
    Route::post('/regional/create', [FeedTemplateController::class, 'createRegionalProfile'])->name('regional.create');
    Route::put('/regional/{id}', [FeedTemplateController::class, 'updateRegionalProfile'])->name('regional.update');

});
