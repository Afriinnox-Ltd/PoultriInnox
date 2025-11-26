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
    Route::get('/', [App\Http\Controllers\Admin\AdminDashboardController::class, 'index'])->name('dashboard');

    // Feed Templates Management (for system owners to upload starter data)
    Route::prefix('feed-templates')->name('feed-templates.')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\FeedTemplateController::class, 'index'])
            ->middleware('permission:view-feed-templates')
            ->name('index');

        // Upload routes (require manage permission)
        Route::post('/upload-feed-types', [App\Http\Controllers\Admin\FeedTemplateController::class, 'uploadFeedTypes'])->middleware('permission:manage-feed-templates')->name('upload-feed-types');
        Route::post('/upload-feed-programs', [App\Http\Controllers\Admin\FeedTemplateController::class, 'uploadFeedPrograms'])->middleware('permission:manage-feed-templates')->name('upload-feed-programs');
        Route::post('/upload-suppliers', [App\Http\Controllers\Admin\FeedTemplateController::class, 'uploadSuppliers'])->middleware('permission:manage-feed-templates')->name('upload-suppliers');

        // Download template routes
        Route::get('/download-feed-types', [App\Http\Controllers\Admin\FeedTemplateController::class, 'downloadFeedTypesTemplate'])->middleware('permission:view-feed-templates')->name('download-feed-types');
        Route::get('/download-feed-programs', [App\Http\Controllers\Admin\FeedTemplateController::class, 'downloadFeedProgramsTemplate'])->middleware('permission:view-feed-templates')->name('download-feed-programs');
        Route::get('/download-suppliers', [App\Http\Controllers\Admin\FeedTemplateController::class, 'downloadSuppliersTemplate'])->middleware('permission:view-feed-templates')->name('download-suppliers');

        // Delete routes
        Route::delete('/feed-types/{id}', [App\Http\Controllers\Admin\FeedTemplateController::class, 'deleteFeedType'])->middleware('permission:manage-feed-templates')->name('delete-feed-type');
        Route::delete('/feed-programs/{id}', [App\Http\Controllers\Admin\FeedTemplateController::class, 'deleteFeedProgram'])->middleware('permission:manage-feed-templates')->name('delete-feed-program');
        Route::delete('/suppliers/{id}', [App\Http\Controllers\Admin\FeedTemplateController::class, 'deleteSupplier'])->middleware('permission:manage-feed-templates')->name('delete-supplier');

        // Update routes
        Route::put('/feed-types/{id}', [App\Http\Controllers\Admin\FeedTemplateController::class, 'updateFeedType'])->middleware('permission:manage-feed-templates')->name('update-feed-type');
        Route::put('/feed-programs/{id}', [App\Http\Controllers\Admin\FeedTemplateController::class, 'updateFeedProgram'])->middleware('permission:manage-feed-templates')->name('update-feed-program');
        Route::put('/suppliers/{id}', [App\Http\Controllers\Admin\FeedTemplateController::class, 'updateSupplier'])->middleware('permission:manage-feed-templates')->name('update-supplier');

        // Bulk operations
        Route::post('/bulk-delete', [App\Http\Controllers\Admin\FeedTemplateController::class, 'bulkDelete'])->middleware('permission:manage-feed-templates')->name('bulk-delete');
    });

    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\UserController::class, 'index'])
            ->middleware('permission:view-users')
            ->name('index');
        Route::get('/create', [App\Http\Controllers\Admin\UserController::class, 'create'])
            ->middleware('permission:create-users')
            ->name('create');
        Route::post('/', [App\Http\Controllers\Admin\UserController::class, 'store'])
            ->middleware('permission:create-users')
            ->name('store');
        Route::get('/{user}/edit', [App\Http\Controllers\Admin\UserController::class, 'edit'])
            ->middleware('permission:edit-users')
            ->name('edit');
        Route::put('/{user}', [App\Http\Controllers\Admin\UserController::class, 'update'])
            ->middleware('permission:edit-users')
            ->name('update');
        Route::delete('/{user}', [App\Http\Controllers\Admin\UserController::class, 'destroy'])
            ->middleware('permission:delete-users')
            ->name('destroy');
        Route::post('/bulk-delete', [App\Http\Controllers\Admin\UserController::class, 'bulkDelete'])
            ->middleware('permission:delete-users')
            ->name('bulk-delete');
    });

    // Roles & Permissions Management
    Route::prefix('roles')->name('roles.')->middleware('permission:manage-roles')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\RolePermissionController::class, 'index'])->name('index');
        Route::post('/', [App\Http\Controllers\Admin\RolePermissionController::class, 'storeRole'])->name('store');
        Route::put('/{role}', [App\Http\Controllers\Admin\RolePermissionController::class, 'updateRole'])->name('update');
        Route::delete('/{role}', [App\Http\Controllers\Admin\RolePermissionController::class, 'destroyRole'])->name('destroy');
        Route::put('/{role}/permissions', [App\Http\Controllers\Admin\RolePermissionController::class, 'syncPermissions'])->name('sync-permissions');
    });

    Route::prefix('permissions')->name('permissions.')->middleware('permission:manage-roles')->group(function () {
        Route::post('/', [App\Http\Controllers\Admin\RolePermissionController::class, 'storePermission'])->name('store');
        Route::delete('/{permission}', [App\Http\Controllers\Admin\RolePermissionController::class, 'destroyPermission'])->name('destroy');
    });

    // User Module Management
    Route::prefix('user-modules')->name('user-modules.')->middleware('permission:manage-user-modules')->group(function () {
        Route::post('/enable', [App\Http\Controllers\Admin\UserModuleController::class, 'enableModule'])->name('enable');
        Route::post('/disable', [App\Http\Controllers\Admin\UserModuleController::class, 'disableModule'])->name('disable');
        Route::post('/bulk-manage', [App\Http\Controllers\Admin\UserModuleController::class, 'bulkManageModules'])->name('bulk-manage');
        Route::get('/user/{user}/modules', [App\Http\Controllers\Admin\UserModuleController::class, 'getUserModules'])->name('user-modules');
    });

    // Module Management
    Route::prefix('modules')->name('modules.')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\ModuleController::class, 'index'])
            ->middleware('permission:view-modules')
            ->name('index');
        Route::patch('/{module}/toggle-status', [App\Http\Controllers\Admin\ModuleController::class, 'toggleStatus'])
            ->middleware('permission:manage-modules')
            ->name('toggle-status');
        Route::put('/{module}', [App\Http\Controllers\Admin\ModuleController::class, 'update'])
            ->middleware('permission:manage-modules')
            ->name('update');
        Route::get('/statistics', [App\Http\Controllers\Admin\ModuleController::class, 'statistics'])
            ->middleware('permission:view-modules')
            ->name('statistics');
    });

    // Protocol Management (Smart Scheduling Admin)
    Route::prefix('smart-scheduling')->name('smart-scheduling.')->group(function () {
        Route::get('/', function () {
            return app(\App\Modules\BatchIncubator\Controllers\Admin\ProtocolManagementController::class)->index();
        })->middleware('permission:view-protocols')->name('index');

        // Statistics
        Route::get('/statistics', [App\Modules\BatchIncubator\Controllers\Admin\ProtocolManagementController::class, 'getStatistics'])
            ->middleware('permission:view-protocols')
            ->name('statistics');

        // Protocol Management
        Route::prefix('protocols')->name('protocols.')->group(function () {
            // Medication Protocol Management
            Route::prefix('medication')->name('medication.')->middleware('permission:manage-protocols')->group(function () {
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
            Route::prefix('vaccination')->name('vaccination.')->middleware('permission:manage-protocols')->group(function () {
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
            Route::patch('{type}/{id}/status', [App\Modules\BatchIncubator\Controllers\Admin\ProtocolManagementController::class, 'toggleStatus'])
                ->middleware('permission:manage-protocols')
                ->name('toggle-status');
        });
    });

    // Activity Logs
    Route::prefix('activity-logs')->name('activity-logs.')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\ActivityLogController::class, 'index'])
            ->middleware('permission:view-activity-logs')
            ->name('index');
        Route::get('/{activityLog}', [App\Http\Controllers\Admin\ActivityLogController::class, 'show'])
            ->middleware('permission:view-activity-logs')
            ->name('show');
        Route::delete('/cleanup', [App\Http\Controllers\Admin\ActivityLogController::class, 'destroy'])
            ->middleware('permission:manage-activity-logs')
            ->name('destroy');
    });

    // Communication Center
    Route::prefix('communication')->name('communication.')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\CommunicationController::class, 'index'])->name('index');
        Route::post('/', [App\Http\Controllers\Admin\CommunicationController::class, 'store'])->name('store');
        Route::get('/search-users', [App\Http\Controllers\Admin\CommunicationController::class, 'searchUsers'])->name('search-users');
        Route::post('/recipient-preview', [App\Http\Controllers\Admin\CommunicationController::class, 'getRecipientPreview'])->name('recipient-preview');
        Route::get('/{adminMessage}', [App\Http\Controllers\Admin\CommunicationController::class, 'show'])->name('show');
        Route::delete('/{adminMessage}', [App\Http\Controllers\Admin\CommunicationController::class, 'destroy'])->name('destroy');
    });

    // Marketplace Administration
    Route::prefix('marketplace')->name('marketplace.')->group(function () {
        // Marketplace Dashboard - any marketplace permission gets access
        Route::get('/', [App\Modules\Marketplace\Controllers\Admin\MarketplaceAdminController::class, 'index'])
            ->middleware('permission:view-marketplace-dashboard')
            ->name('index');
        Route::get('/statistics', [App\Modules\Marketplace\Controllers\Admin\MarketplaceAdminController::class, 'getStatistics'])
            ->middleware('permission:view-marketplace-dashboard')
            ->name('statistics');
        Route::get('/analytics', [App\Modules\Marketplace\Controllers\Admin\MarketplaceAdminController::class, 'getAnalytics'])
            ->middleware('permission:view-marketplace-analytics')
            ->name('analytics');

        // Category Management
        Route::prefix('categories')->name('categories.')->group(function () {
            Route::get('/', [App\Modules\Marketplace\Controllers\Admin\CategoryAdminController::class, 'index'])
                ->middleware('permission:view-categories')
                ->name('index');
            Route::get('/create', [App\Modules\Marketplace\Controllers\Admin\CategoryAdminController::class, 'create'])
                ->middleware('permission:create-categories')
                ->name('create');
            Route::post('/', [App\Modules\Marketplace\Controllers\Admin\CategoryAdminController::class, 'store'])
                ->middleware('permission:create-categories')
                ->name('store');
            Route::get('/{category}', [App\Modules\Marketplace\Controllers\Admin\CategoryAdminController::class, 'show'])
                ->middleware('permission:view-categories')
                ->name('show');
            Route::get('/{category}/edit', [App\Modules\Marketplace\Controllers\Admin\CategoryAdminController::class, 'edit'])
                ->middleware('permission:edit-categories')
                ->name('edit');
            Route::put('/{category}', [App\Modules\Marketplace\Controllers\Admin\CategoryAdminController::class, 'update'])
                ->middleware('permission:edit-categories')
                ->name('update');
            Route::delete('/{category}', [App\Modules\Marketplace\Controllers\Admin\CategoryAdminController::class, 'destroy'])
                ->middleware('permission:delete-categories')
                ->name('destroy');

            // Category Actions
            Route::patch('/{category}/toggle-status', [App\Modules\Marketplace\Controllers\Admin\CategoryAdminController::class, 'toggleStatus'])
                ->middleware('permission:edit-categories')
                ->name('toggle-status');
            Route::patch('/{category}/toggle-featured', [App\Modules\Marketplace\Controllers\Admin\CategoryAdminController::class, 'toggleFeatured'])
                ->middleware('permission:edit-categories')
                ->name('toggle-featured');
            Route::post('/sort-order', [App\Modules\Marketplace\Controllers\Admin\CategoryAdminController::class, 'updateSortOrder'])
                ->middleware('permission:edit-categories')
                ->name('sort-order');
            Route::post('/bulk-action', [App\Modules\Marketplace\Controllers\Admin\CategoryAdminController::class, 'bulkAction'])
                ->middleware('permission:edit-categories')
                ->name('bulk-action');
        });

        // Vendor Management
        Route::prefix('vendors')->name('vendors.')->group(function () {
            Route::get('/', [App\Modules\Marketplace\Controllers\Admin\VendorAdminController::class, 'index'])
                ->middleware('permission:view-vendors')
                ->name('index');
            Route::get('/create', [App\Modules\Marketplace\Controllers\Admin\VendorAdminController::class, 'create'])
                ->middleware('permission:create-vendors')
                ->name('create');
            Route::post('/', [App\Modules\Marketplace\Controllers\Admin\VendorAdminController::class, 'store'])
                ->middleware('permission:create-vendors')
                ->name('store');
            Route::get('/statistics', [App\Modules\Marketplace\Controllers\Admin\VendorAdminController::class, 'getStatistics'])
                ->middleware('permission:view-vendors')
                ->name('statistics');
            Route::get('/{vendor}', [App\Modules\Marketplace\Controllers\Admin\VendorAdminController::class, 'show'])
                ->middleware('permission:view-vendors')
                ->name('show');
            Route::get('/{vendor}/edit', [App\Modules\Marketplace\Controllers\Admin\VendorAdminController::class, 'edit'])
                ->middleware('permission:edit-vendor-details')
                ->name('edit');
            Route::put('/{vendor}', [App\Modules\Marketplace\Controllers\Admin\VendorAdminController::class, 'update'])
                ->middleware('permission:edit-vendor-details')
                ->name('update');
            Route::delete('/{vendor}', [App\Modules\Marketplace\Controllers\Admin\VendorAdminController::class, 'destroy'])
                ->middleware('permission:edit-vendor-details')
                ->name('destroy');

            // Vendor approval actions
            Route::post('/{vendor}/approve', [App\Modules\Marketplace\Controllers\Admin\VendorAdminController::class, 'approve'])
                ->middleware('permission:approve-vendors')
                ->name('approve');
            Route::post('/{vendor}/reject', [App\Modules\Marketplace\Controllers\Admin\VendorAdminController::class, 'reject'])
                ->middleware('permission:approve-vendors')
                ->name('reject');

            // Vendor suspension actions
            Route::post('/{vendor}/suspend', [App\Modules\Marketplace\Controllers\Admin\VendorAdminController::class, 'suspend'])
                ->middleware('permission:suspend-vendors')
                ->name('suspend');
            Route::post('/{vendor}/reactivate', [App\Modules\Marketplace\Controllers\Admin\VendorAdminController::class, 'reactivate'])
                ->middleware('permission:suspend-vendors')
                ->name('reactivate');

            // Vendor detail editing
            Route::patch('/{vendor}/toggle-verification', [App\Modules\Marketplace\Controllers\Admin\VendorAdminController::class, 'toggleVerification'])
                ->middleware('permission:edit-vendor-details')
                ->name('toggle-verification');
            Route::patch('/{vendor}/commission', [App\Modules\Marketplace\Controllers\Admin\VendorAdminController::class, 'updateCommission'])
                ->middleware('permission:edit-vendor-details')
                ->name('update-commission');
            Route::patch('/{vendor}/notes', [App\Modules\Marketplace\Controllers\Admin\VendorAdminController::class, 'updateNotes'])
                ->middleware('permission:edit-vendor-details')
                ->name('update-notes');

            // Vendor communication
            Route::post('/{vendor}/message', [App\Modules\Marketplace\Controllers\Admin\VendorAdminController::class, 'sendMessage'])
                ->middleware('permission:message-vendors')
                ->name('message');
            Route::post('/{vendor}/request-changes', [App\Modules\Marketplace\Controllers\Admin\VendorAdminController::class, 'requestChanges'])
                ->middleware('permission:message-vendors')
                ->name('request-changes');
            Route::post('/bulk-action', [App\Modules\Marketplace\Controllers\Admin\VendorAdminController::class, 'bulkAction'])
                ->middleware('permission:approve-vendors')
                ->name('bulk-action');
        });

        // Product Management
        Route::prefix('products')->name('products.')->group(function () {
            Route::get('/', [App\Modules\Marketplace\Controllers\Admin\ProductAdminController::class, 'index'])
                ->middleware('permission:view-products')
                ->name('index');
            Route::get('/create', [App\Modules\Marketplace\Controllers\Admin\ProductAdminController::class, 'create'])
                ->middleware('permission:create-products')
                ->name('create');
            Route::post('/', [App\Modules\Marketplace\Controllers\Admin\ProductAdminController::class, 'store'])
                ->middleware('permission:create-products')
                ->name('store');
            Route::get('/statistics', [App\Modules\Marketplace\Controllers\Admin\ProductAdminController::class, 'getStatistics'])
                ->middleware('permission:view-products')
                ->name('statistics');
            Route::get('/{product}', [App\Modules\Marketplace\Controllers\Admin\ProductAdminController::class, 'show'])
                ->middleware('permission:view-products')
                ->name('show');
            Route::get('/{product}/edit', [App\Modules\Marketplace\Controllers\Admin\ProductAdminController::class, 'edit'])
                ->middleware('permission:edit-products')
                ->name('edit');
            Route::put('/{product}', [App\Modules\Marketplace\Controllers\Admin\ProductAdminController::class, 'update'])
                ->middleware('permission:edit-products')
                ->name('update');
            Route::delete('/{product}', [App\Modules\Marketplace\Controllers\Admin\ProductAdminController::class, 'destroy'])
                ->middleware('permission:delete-products')
                ->name('destroy');

            // Product approval actions
            Route::post('/{product}/approve', [App\Modules\Marketplace\Controllers\Admin\ProductAdminController::class, 'approve'])
                ->middleware('permission:approve-products')
                ->name('approve');
            Route::post('/{product}/reject', [App\Modules\Marketplace\Controllers\Admin\ProductAdminController::class, 'reject'])
                ->middleware('permission:approve-products')
                ->name('reject');

            // Product editing actions
            Route::patch('/{product}/toggle-status', [App\Modules\Marketplace\Controllers\Admin\ProductAdminController::class, 'toggleStatus'])
                ->middleware('permission:edit-products')
                ->name('toggle-status');
            Route::patch('/{product}/toggle-featured', [App\Modules\Marketplace\Controllers\Admin\ProductAdminController::class, 'toggleFeatured'])
                ->middleware('permission:edit-products')
                ->name('toggle-featured');
            Route::patch('/{product}/priority', [App\Modules\Marketplace\Controllers\Admin\ProductAdminController::class, 'updatePriority'])
                ->middleware('permission:edit-products')
                ->name('update-priority');
            Route::patch('/{product}/notes', [App\Modules\Marketplace\Controllers\Admin\ProductAdminController::class, 'updateNotes'])
                ->middleware('permission:edit-products')
                ->name('update-notes');
            Route::post('/bulk-action', [App\Modules\Marketplace\Controllers\Admin\ProductAdminController::class, 'bulkAction'])
                ->middleware('permission:edit-products')
                ->name('bulk-action');
        });

        // Order Management
        Route::prefix('orders')->name('orders.')->group(function () {
            Route::get('/', [App\Modules\Marketplace\Controllers\Admin\OrderAdminController::class, 'index'])
                ->middleware('permission:view-orders')
                ->name('index');
            Route::get('/{order}', [App\Modules\Marketplace\Controllers\Admin\OrderAdminController::class, 'show'])
                ->middleware('permission:view-orders')
                ->name('show');
            Route::get('/statistics', [App\Modules\Marketplace\Controllers\Admin\OrderAdminController::class, 'getStatistics'])
                ->middleware('permission:view-orders')
                ->name('statistics');
            Route::get('/export', [App\Modules\Marketplace\Controllers\Admin\OrderAdminController::class, 'export'])
                ->middleware('permission:export-orders')
                ->name('export');

            // Order status actions
            Route::patch('/{order}/status', [App\Modules\Marketplace\Controllers\Admin\OrderAdminController::class, 'updateStatus'])
                ->middleware('permission:update-order-status')
                ->name('update-status');
            Route::post('/{order}/confirm', [App\Modules\Marketplace\Controllers\Admin\OrderAdminController::class, 'confirmOrder'])
                ->middleware('permission:update-order-status')
                ->name('confirm');
            Route::post('/{order}/cancel', [App\Modules\Marketplace\Controllers\Admin\OrderAdminController::class, 'cancel'])
                ->middleware('permission:cancel-orders')
                ->name('cancel');
            Route::post('/{order}/refund', [App\Modules\Marketplace\Controllers\Admin\OrderAdminController::class, 'refund'])
                ->middleware('permission:refund-orders')
                ->name('refund');
            Route::patch('/{order}/notes', [App\Modules\Marketplace\Controllers\Admin\OrderAdminController::class, 'updateNotes'])
                ->middleware('permission:update-order-status')
                ->name('update-notes');
        });

        // Payment Management
        Route::prefix('payments')->name('payments.')->group(function () {
            Route::get('/', [App\Modules\Marketplace\Controllers\Admin\PaymentController::class, 'index'])
                ->middleware('permission:view-payments')
                ->name('index');
            Route::get('/list', [App\Modules\Marketplace\Controllers\Admin\PaymentController::class, 'payments'])
                ->middleware('permission:view-payments')
                ->name('list');
            Route::get('/vendor-payouts', [App\Modules\Marketplace\Controllers\Admin\PaymentController::class, 'vendorPayouts'])
                ->middleware('permission:manage-vendor-payouts')
                ->name('vendor-payouts');
            Route::post('/{payment}/mark-vendor-paid', [App\Modules\Marketplace\Controllers\Admin\PaymentController::class, 'markVendorPaid'])
                ->middleware('permission:manage-vendor-payouts')
                ->name('mark-vendor-paid');
            Route::post('/batch-process-payouts', [App\Modules\Marketplace\Controllers\Admin\PaymentController::class, 'batchProcessPayouts'])
                ->middleware('permission:manage-vendor-payouts')
                ->name('batch-process-payouts');
            Route::get('/analytics', [App\Modules\Marketplace\Controllers\Admin\PaymentController::class, 'analytics'])
                ->middleware('permission:view-financial-analytics')
                ->name('analytics');
            Route::get('/export', [App\Modules\Marketplace\Controllers\Admin\PaymentController::class, 'export'])
                ->middleware('permission:export-financial-data')
                ->name('export');
        });

        // Subscription Management Dashboard
        Route::get('/subscriptions', [App\Modules\Marketplace\Controllers\Admin\SubscriptionPlanAdminController::class, 'dashboard'])
            ->middleware('permission:view-subscriptions')
            ->name('subscriptions.dashboard');

        // Subscription Plan Management
        Route::prefix('subscription-plans')->name('subscription-plans.')->group(function () {
            Route::get('/', [App\Modules\Marketplace\Controllers\Admin\SubscriptionPlanAdminController::class, 'index'])
                ->middleware('permission:view-subscriptions')
                ->name('index');
            Route::get('/create', [App\Modules\Marketplace\Controllers\Admin\SubscriptionPlanAdminController::class, 'create'])
                ->middleware('permission:create-subscription-plans')
                ->name('create');
            Route::post('/', [App\Modules\Marketplace\Controllers\Admin\SubscriptionPlanAdminController::class, 'store'])
                ->middleware('permission:create-subscription-plans')
                ->name('store');
            Route::get('/{subscriptionPlan}/edit', [App\Modules\Marketplace\Controllers\Admin\SubscriptionPlanAdminController::class, 'edit'])
                ->middleware('permission:edit-subscription-plans')
                ->name('edit');
            Route::put('/{subscriptionPlan}', [App\Modules\Marketplace\Controllers\Admin\SubscriptionPlanAdminController::class, 'update'])
                ->middleware('permission:edit-subscription-plans')
                ->name('update');
            Route::delete('/{subscriptionPlan}', [App\Modules\Marketplace\Controllers\Admin\SubscriptionPlanAdminController::class, 'destroy'])
                ->middleware('permission:delete-subscription-plans')
                ->name('destroy');
            Route::patch('/{subscriptionPlan}/toggle-status', [App\Modules\Marketplace\Controllers\Admin\SubscriptionPlanAdminController::class, 'toggleStatus'])
                ->middleware('permission:edit-subscription-plans')
                ->name('toggle-status');

            // User subscription management
            Route::get('/user-subscriptions', [App\Modules\Marketplace\Controllers\Admin\SubscriptionPlanAdminController::class, 'userSubscriptions'])
                ->middleware('permission:assign-user-subscriptions')
                ->name('user-subscriptions');
            Route::post('/assign-plan', [App\Modules\Marketplace\Controllers\Admin\SubscriptionPlanAdminController::class, 'assignPlan'])
                ->middleware('permission:assign-user-subscriptions')
                ->name('assign-plan');
            Route::delete('/subscriptions/{subscription}', [App\Modules\Marketplace\Controllers\Admin\SubscriptionPlanAdminController::class, 'removeUserSubscription'])
                ->middleware('permission:assign-user-subscriptions')
                ->name('remove-subscription');

            // Analytics
            Route::get('/analytics', [App\Modules\Marketplace\Controllers\Admin\SubscriptionPlanAdminController::class, 'analytics'])
                ->middleware('permission:view-subscription-analytics')
                ->name('analytics');
        });

        // Settings Management
        Route::prefix('settings')->name('settings.')->group(function () {
            Route::get('/', [App\Modules\Marketplace\Controllers\Admin\SettingsAdminController::class, 'index'])
                ->middleware('permission:view-marketplace-settings')
                ->name('index');
            Route::put('/', [App\Modules\Marketplace\Controllers\Admin\SettingsAdminController::class, 'update'])
                ->middleware('permission:edit-marketplace-settings')
                ->name('update');
            Route::put('/{key}', [App\Modules\Marketplace\Controllers\Admin\SettingsAdminController::class, 'updateSingle'])
                ->middleware('permission:edit-marketplace-settings')
                ->name('update-single');
            Route::post('/reset', [App\Modules\Marketplace\Controllers\Admin\SettingsAdminController::class, 'reset'])
                ->middleware('permission:reset-marketplace-settings')
                ->name('reset');
            Route::get('/export', [App\Modules\Marketplace\Controllers\Admin\SettingsAdminController::class, 'export'])
                ->middleware('permission:view-marketplace-settings')
                ->name('export');
            Route::post('/import', [App\Modules\Marketplace\Controllers\Admin\SettingsAdminController::class, 'import'])
                ->middleware('permission:edit-marketplace-settings')
                ->name('import');
            Route::get('/api', [App\Modules\Marketplace\Controllers\Admin\SettingsAdminController::class, 'getSettings'])
                ->middleware('permission:view-marketplace-settings')
                ->name('api');
        });
    });

    // Partners Administration
    Route::prefix('partners')->name('partners.')->group(function () {
        Route::get('/', [App\Http\Controllers\Admin\PartnerAdminController::class, 'partnersIndex'])->name('index');
        Route::get('/vendor-payouts', [App\Http\Controllers\Admin\PartnerAdminController::class, 'vendorPayoutSummary'])->name('vendor-payouts');

        // Applications
        Route::prefix('applications')->name('applications.')->group(function () {
            Route::get('/', [App\Http\Controllers\Partner\PartnerApplicationController::class, 'index'])->name('index');
            Route::get('/{application}', [App\Http\Controllers\Partner\PartnerApplicationController::class, 'show'])->name('show');
            Route::post('/{application}/approve', [App\Http\Controllers\Partner\PartnerApplicationController::class, 'approve'])->name('approve');
            Route::post('/{application}/reject', [App\Http\Controllers\Partner\PartnerApplicationController::class, 'reject'])->name('reject');
        });

        Route::prefix('orders')->name('orders.')->group(function () {
            Route::get('/', [App\Http\Controllers\Admin\PartnerAdminController::class, 'ordersIndex'])->name('index');
            Route::get('/{order}', [App\Http\Controllers\Admin\PartnerAdminController::class, 'orderShow'])->name('show');
            Route::patch('/{order}/status', [App\Http\Controllers\Admin\PartnerAdminController::class, 'orderUpdateStatus'])->name('update-status');
            Route::patch('/{order}/payment', [App\Http\Controllers\Admin\PartnerAdminController::class, 'orderUpdatePayment'])->name('update-payment');
            Route::put('/{order}/items', [App\Http\Controllers\Admin\PartnerAdminController::class, 'orderUpdateItems'])->name('update-items');
            Route::patch('/{order}/items/{item}/vendor-paid', [App\Http\Controllers\Admin\PartnerAdminController::class, 'markVendorPaid'])->name('item-vendor-paid');
            Route::put('/{order}/items/{item}/allocations', [App\Http\Controllers\Admin\PartnerAdminController::class, 'orderUpdateItemAllocations'])->name('item-allocations');
            Route::patch('/{order}/allocations/{allocation}/vendor-paid', [App\Http\Controllers\Admin\PartnerAdminController::class, 'markAllocationVendorPaid'])->name('allocation-vendor-paid');
        });

        Route::get('/{partner}', [App\Http\Controllers\Admin\PartnerAdminController::class, 'partnerShow'])->name('show');
        Route::patch('/{partner}/verify', [App\Http\Controllers\Admin\PartnerAdminController::class, 'partnerVerify'])->name('verify');
        Route::patch('/{partner}/toggle-active', [App\Http\Controllers\Admin\PartnerAdminController::class, 'partnerToggleActive'])->name('toggle-active');
    });

});
