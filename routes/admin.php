<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
|
| These routes are for admin functionality and require admin authentication.
| All routes are prefixed with 'admin' and use admin middleware.
|
*/

Route::prefix('admin')->middleware(['auth', 'admin.access'])->name('admin.')->group(function () {

    // Admin Dashboard
    Route::get('/', function () {
        return inertia('Admin/Dashboard');
    })->name('dashboard');

    // Feed Templates Management (for system owners to upload starter data)
    Route::prefix('feed-templates')->name('feed-templates.')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\FeedTemplateController::class, 'index'])->name('index');

        // Upload routes
        Route::post('/upload-feed-types', [App\Http\Controllers\Admin\FeedTemplateController::class, 'uploadFeedTypes'])->name('upload-feed-types');
        Route::post('/upload-feed-programs', [App\Http\Controllers\Admin\FeedTemplateController::class, 'uploadFeedPrograms'])->name('upload-feed-programs');
        Route::post('/upload-suppliers', [App\Http\Controllers\Admin\FeedTemplateController::class, 'uploadSuppliers'])->name('upload-suppliers');

        // Download template routes
        Route::get('/download-feed-types', [App\Http\Controllers\Admin\FeedTemplateController::class, 'downloadFeedTypesTemplate'])->name('download-feed-types');
        Route::get('/download-feed-programs', [App\Http\Controllers\Admin\FeedTemplateController::class, 'downloadFeedProgramsTemplate'])->name('download-feed-programs');
        Route::get('/download-suppliers', [App\Http\Controllers\Admin\FeedTemplateController::class, 'downloadSuppliersTemplate'])->name('download-suppliers');

        // Delete routes
        Route::delete('/feed-types/{id}', [App\Http\Controllers\Admin\FeedTemplateController::class, 'deleteFeedType'])->name('delete-feed-type');
        Route::delete('/feed-programs/{id}', [App\Http\Controllers\Admin\FeedTemplateController::class, 'deleteFeedProgram'])->name('delete-feed-program');
        Route::delete('/suppliers/{id}', [App\Http\Controllers\Admin\FeedTemplateController::class, 'deleteSupplier'])->name('delete-supplier');

        // Update routes
        Route::put('/feed-types/{id}', [App\Http\Controllers\Admin\FeedTemplateController::class, 'updateFeedType'])->name('update-feed-type');
        Route::put('/feed-programs/{id}', [App\Http\Controllers\Admin\FeedTemplateController::class, 'updateFeedProgram'])->name('update-feed-program');
        Route::put('/suppliers/{id}', [App\Http\Controllers\Admin\FeedTemplateController::class, 'updateSupplier'])->name('update-supplier');

        // Bulk operations
        Route::post('/bulk-delete', [App\Http\Controllers\Admin\FeedTemplateController::class, 'bulkDelete'])->name('bulk-delete');
    });

    route::prefix('users')->name('users.')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\UserController::class, 'index'])->name('index');
        Route::get('/create', [App\Http\Controllers\Admin\UserController::class, 'create'])->name('create');
        Route::post('/', [App\Http\Controllers\Admin\UserController::class, 'store'])->name('store');
        Route::get('/{user}/edit', [App\Http\Controllers\Admin\UserController::class, 'edit'])->name('edit');
        Route::put('/{user}', [App\Http\Controllers\Admin\UserController::class, 'update'])->name('update');
        Route::delete('/{user}', [App\Http\Controllers\Admin\UserController::class, 'destroy'])->name('destroy');
        Route::post('/bulk-delete', [App\Http\Controllers\Admin\UserController::class, 'bulkDelete'])->name('bulk-delete');
    });

    // User Module Management (Admin Only)
    Route::prefix('user-modules')->name('user-modules.')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\UserModuleController::class, 'index'])->name('index');
        Route::post('/enable', [App\Http\Controllers\Admin\UserModuleController::class, 'enableModule'])->name('enable');
        Route::post('/disable', [App\Http\Controllers\Admin\UserModuleController::class, 'disableModule'])->name('disable');
        Route::post('/bulk-manage', [App\Http\Controllers\Admin\UserModuleController::class, 'bulkManageModules'])->name('bulk-manage');
        Route::get('/user/{user}/modules', [App\Http\Controllers\Admin\UserModuleController::class, 'getUserModules'])->name('user-modules');
    });

    // Protocol Management (Smart Scheduling Admin)
    Route::prefix('smart-scheduling')->name('smart-scheduling.')->group(function () {
        Route::get('/', function () {
            return app(\App\Modules\BatchIncubator\Controllers\Admin\ProtocolManagementController::class)->index();
        })->name('index');
        
        // Statistics
        Route::get('/statistics', [App\Modules\BatchIncubator\Controllers\Admin\ProtocolManagementController::class, 'getStatistics'])->name('statistics');
        
        // Protocol Management
        Route::prefix('protocols')->name('protocols.')->group(function () {
            // Medication Protocol Management
            Route::prefix('medication')->name('medication.')->group(function () {
                Route::get('/create', [App\Modules\BatchIncubator\Controllers\Admin\ProtocolManagementController::class, 'createMedication'])->name('create');
                Route::post('/', [App\Modules\BatchIncubator\Controllers\Admin\ProtocolManagementController::class, 'storeMedication'])->name('store');
                Route::get('/{medication}/edit', [App\Modules\BatchIncubator\Controllers\Admin\ProtocolManagementController::class, 'editMedication'])->name('edit');
                Route::put('/{medication}', [App\Modules\BatchIncubator\Controllers\Admin\ProtocolManagementController::class, 'updateMedication'])->name('update');
                Route::delete('/{medication}', [App\Modules\BatchIncubator\Controllers\Admin\ProtocolManagementController::class, 'destroy'])->name('destroy')->defaults('type', 'medication');
                
                // Upload routes
                Route::get('/upload', [App\Modules\BatchIncubator\Controllers\Admin\ProtocolManagementController::class, 'showUpload'])->name('upload')->defaults('type', 'medication');
                Route::post('/upload', [App\Modules\BatchIncubator\Controllers\Admin\ProtocolManagementController::class, 'processUpload'])->name('upload.process')->defaults('type', 'medication');
                Route::get('/template', [App\Modules\BatchIncubator\Controllers\Admin\ProtocolManagementController::class, 'downloadTemplate'])->name('template')->defaults('type', 'medication');
            });

            // Vaccination Protocol Management
            Route::prefix('vaccination')->name('vaccination.')->group(function () {
                Route::get('/create', [App\Modules\BatchIncubator\Controllers\Admin\ProtocolManagementController::class, 'createVaccination'])->name('create');
                Route::post('/', [App\Modules\BatchIncubator\Controllers\Admin\ProtocolManagementController::class, 'storeVaccination'])->name('store');
                Route::get('/{vaccination}/edit', [App\Modules\BatchIncubator\Controllers\Admin\ProtocolManagementController::class, 'editVaccination'])->name('edit');
                Route::put('/{vaccination}', [App\Modules\BatchIncubator\Controllers\Admin\ProtocolManagementController::class, 'updateVaccination'])->name('update');
                Route::delete('/{vaccination}', [App\Modules\BatchIncubator\Controllers\Admin\ProtocolManagementController::class, 'destroy'])->name('destroy')->defaults('type', 'vaccination');
                
                // Upload routes
                Route::get('/upload', [App\Modules\BatchIncubator\Controllers\Admin\ProtocolManagementController::class, 'showUpload'])->name('upload')->defaults('type', 'vaccination');
                Route::post('/upload', [App\Modules\BatchIncubator\Controllers\Admin\ProtocolManagementController::class, 'processUpload'])->name('upload.process')->defaults('type', 'vaccination');
                Route::get('/template', [App\Modules\BatchIncubator\Controllers\Admin\ProtocolManagementController::class, 'downloadTemplate'])->name('template')->defaults('type', 'vaccination');
            });

            // Toggle status routes
            Route::patch('{type}/{id}/status', [App\Modules\BatchIncubator\Controllers\Admin\ProtocolManagementController::class, 'toggleStatus'])->name('toggle-status');
        });
    });

});
