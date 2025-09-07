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

    // Marketplace Administration
    Route::prefix('marketplace')->name('marketplace.')->group(function () {
        // Marketplace Dashboard
        Route::get('/', [App\Modules\Marketplace\Controllers\Admin\MarketplaceAdminController::class, 'index'])->name('index');
        Route::get('/statistics', [App\Modules\Marketplace\Controllers\Admin\MarketplaceAdminController::class, 'getStatistics'])->name('statistics');
        Route::get('/analytics', [App\Modules\Marketplace\Controllers\Admin\MarketplaceAdminController::class, 'getAnalytics'])->name('analytics');

        // Category Management
        Route::prefix('categories')->name('categories.')->group(function () {
            Route::get('/', [App\Modules\Marketplace\Controllers\Admin\CategoryAdminController::class, 'index'])->name('index');
            Route::get('/create', [App\Modules\Marketplace\Controllers\Admin\CategoryAdminController::class, 'create'])->name('create');
            Route::post('/', [App\Modules\Marketplace\Controllers\Admin\CategoryAdminController::class, 'store'])->name('store');
            Route::get('/{category}', [App\Modules\Marketplace\Controllers\Admin\CategoryAdminController::class, 'show'])->name('show');
            Route::get('/{category}/edit', [App\Modules\Marketplace\Controllers\Admin\CategoryAdminController::class, 'edit'])->name('edit');
            Route::put('/{category}', [App\Modules\Marketplace\Controllers\Admin\CategoryAdminController::class, 'update'])->name('update');
            Route::delete('/{category}', [App\Modules\Marketplace\Controllers\Admin\CategoryAdminController::class, 'destroy'])->name('destroy');

            // Category Actions
            Route::patch('/{category}/toggle-status', [App\Modules\Marketplace\Controllers\Admin\CategoryAdminController::class, 'toggleStatus'])->name('toggle-status');
            Route::patch('/{category}/toggle-featured', [App\Modules\Marketplace\Controllers\Admin\CategoryAdminController::class, 'toggleFeatured'])->name('toggle-featured');
            Route::post('/sort-order', [App\Modules\Marketplace\Controllers\Admin\CategoryAdminController::class, 'updateSortOrder'])->name('sort-order');
            Route::post('/bulk-action', [App\Modules\Marketplace\Controllers\Admin\CategoryAdminController::class, 'bulkAction'])->name('bulk-action');
        });

        // Vendor Management
        Route::prefix('vendors')->name('vendors.')->group(function () {
            Route::get('/', [App\Modules\Marketplace\Controllers\Admin\VendorAdminController::class, 'index'])->name('index');
            Route::get('/{vendor}', [App\Modules\Marketplace\Controllers\Admin\VendorAdminController::class, 'show'])->name('show');
            Route::get('/statistics', [App\Modules\Marketplace\Controllers\Admin\VendorAdminController::class, 'getStatistics'])->name('statistics');

            // Vendor Actions
            Route::post('/{vendor}/approve', [App\Modules\Marketplace\Controllers\Admin\VendorAdminController::class, 'approve'])->name('approve');
            Route::post('/{vendor}/reject', [App\Modules\Marketplace\Controllers\Admin\VendorAdminController::class, 'reject'])->name('reject');
            Route::post('/{vendor}/suspend', [App\Modules\Marketplace\Controllers\Admin\VendorAdminController::class, 'suspend'])->name('suspend');
            Route::post('/{vendor}/reactivate', [App\Modules\Marketplace\Controllers\Admin\VendorAdminController::class, 'reactivate'])->name('reactivate');
            Route::patch('/{vendor}/toggle-verification', [App\Modules\Marketplace\Controllers\Admin\VendorAdminController::class, 'toggleVerification'])->name('toggle-verification');
            Route::patch('/{vendor}/commission', [App\Modules\Marketplace\Controllers\Admin\VendorAdminController::class, 'updateCommission'])->name('update-commission');
            Route::patch('/{vendor}/notes', [App\Modules\Marketplace\Controllers\Admin\VendorAdminController::class, 'updateNotes'])->name('update-notes');
            Route::post('/bulk-action', [App\Modules\Marketplace\Controllers\Admin\VendorAdminController::class, 'bulkAction'])->name('bulk-action');
        });

        // Product Management
        Route::prefix('products')->name('products.')->group(function () {
            Route::get('/', [App\Modules\Marketplace\Controllers\Admin\ProductAdminController::class, 'index'])->name('index');
            Route::get('/{product}', [App\Modules\Marketplace\Controllers\Admin\ProductAdminController::class, 'show'])->name('show');
            Route::get('/statistics', [App\Modules\Marketplace\Controllers\Admin\ProductAdminController::class, 'getStatistics'])->name('statistics');

            // Product Actions
            Route::post('/{product}/approve', [App\Modules\Marketplace\Controllers\Admin\ProductAdminController::class, 'approve'])->name('approve');
            Route::post('/{product}/reject', [App\Modules\Marketplace\Controllers\Admin\ProductAdminController::class, 'reject'])->name('reject');
            Route::patch('/{product}/toggle-status', [App\Modules\Marketplace\Controllers\Admin\ProductAdminController::class, 'toggleStatus'])->name('toggle-status');
            Route::patch('/{product}/toggle-featured', [App\Modules\Marketplace\Controllers\Admin\ProductAdminController::class, 'toggleFeatured'])->name('toggle-featured');
            Route::patch('/{product}/priority', [App\Modules\Marketplace\Controllers\Admin\ProductAdminController::class, 'updatePriority'])->name('update-priority');
            Route::patch('/{product}/notes', [App\Modules\Marketplace\Controllers\Admin\ProductAdminController::class, 'updateNotes'])->name('update-notes');
            Route::post('/bulk-action', [App\Modules\Marketplace\Controllers\Admin\ProductAdminController::class, 'bulkAction'])->name('bulk-action');
        });

        // Order Management
        Route::prefix('orders')->name('orders.')->group(function () {
            Route::get('/', [App\Modules\Marketplace\Controllers\Admin\OrderAdminController::class, 'index'])->name('index');
            Route::get('/{order}', [App\Modules\Marketplace\Controllers\Admin\OrderAdminController::class, 'show'])->name('show');
            Route::get('/statistics', [App\Modules\Marketplace\Controllers\Admin\OrderAdminController::class, 'getStatistics'])->name('statistics');
            Route::get('/export', [App\Modules\Marketplace\Controllers\Admin\OrderAdminController::class, 'export'])->name('export');

            // Order Actions
            Route::patch('/{order}/status', [App\Modules\Marketplace\Controllers\Admin\OrderAdminController::class, 'updateStatus'])->name('update-status');
            Route::post('/{order}/confirm', [App\Modules\Marketplace\Controllers\Admin\OrderAdminController::class, 'confirmOrder'])->name('confirm');
            Route::post('/{order}/cancel', [App\Modules\Marketplace\Controllers\Admin\OrderAdminController::class, 'cancel'])->name('cancel');
            Route::post('/{order}/refund', [App\Modules\Marketplace\Controllers\Admin\OrderAdminController::class, 'refund'])->name('refund');
            Route::patch('/{order}/notes', [App\Modules\Marketplace\Controllers\Admin\OrderAdminController::class, 'updateNotes'])->name('update-notes');
        });

        // Payment Management
        Route::prefix('payments')->name('payments.')->group(function () {
            Route::get('/', [App\Modules\Marketplace\Controllers\Admin\PaymentController::class, 'index'])->name('index');
            Route::get('/list', [App\Modules\Marketplace\Controllers\Admin\PaymentController::class, 'payments'])->name('list');
            Route::get('/vendor-payouts', [App\Modules\Marketplace\Controllers\Admin\PaymentController::class, 'vendorPayouts'])->name('vendor-payouts');
            Route::post('/{payment}/mark-vendor-paid', [App\Modules\Marketplace\Controllers\Admin\PaymentController::class, 'markVendorPaid'])->name('mark-vendor-paid');
            Route::get('/analytics', [App\Modules\Marketplace\Controllers\Admin\PaymentController::class, 'analytics'])->name('analytics');
            Route::get('/export', [App\Modules\Marketplace\Controllers\Admin\PaymentController::class, 'export'])->name('export');
        });
    });

});
