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

Route::prefix('admin')->middleware(['auth'])->name('admin.')->group(function () {

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

});
