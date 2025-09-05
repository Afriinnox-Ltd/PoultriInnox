<?php

use App\Http\Controllers\Admin\FeedManagement\FeedInventoryController;
use App\Http\Controllers\Admin\FeedManagement\FeedSupplierController;
use App\Http\Controllers\Admin\FeedManagement\FeedPurchaseOrderController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Feed Inventory & Procurement Admin Routes
|--------------------------------------------------------------------------
|
| Routes for managing feed inventory, suppliers, and purchase orders
| in the feed management system.
|
*/

Route::prefix('feed-management')->name('feed-management.')->group(function () {

    // Feed Inventory Management
    Route::prefix('inventory')->name('inventory.')->group(function () {
        Route::get('/', [FeedInventoryController::class, 'index'])->name('index');
        Route::get('/create', [FeedInventoryController::class, 'create'])->name('create');
        Route::post('/', [FeedInventoryController::class, 'store'])->name('store');
        Route::get('/{feedInventory}', [FeedInventoryController::class, 'show'])->name('show');
        Route::get('/{feedInventory}/edit', [FeedInventoryController::class, 'edit'])->name('edit');
        Route::put('/{feedInventory}', [FeedInventoryController::class, 'update'])->name('update');
        Route::delete('/{feedInventory}', [FeedInventoryController::class, 'destroy'])->name('destroy');

        // Inventory operations
        Route::post('/{feedInventory}/receive', [FeedInventoryController::class, 'receiveStock'])->name('receive');
        Route::post('/{feedInventory}/adjust', [FeedInventoryController::class, 'adjustStock'])->name('adjust');
        Route::post('/{feedInventory}/reserve', [FeedInventoryController::class, 'reserveStock'])->name('reserve');
        Route::post('/{feedInventory}/release', [FeedInventoryController::class, 'releaseReserved'])->name('release');
        Route::post('/{feedInventory}/quality-check', [FeedInventoryController::class, 'qualityCheck'])->name('quality-check');

        // Bulk operations
        Route::post('/bulk-receive', [FeedInventoryController::class, 'bulkReceive'])->name('bulk-receive');
        Route::post('/bulk-import', [FeedInventoryController::class, 'bulkImport'])->name('bulk-import');
        Route::get('/export-template', [FeedInventoryController::class, 'exportTemplate'])->name('export-template');
        Route::post('/bulk-adjustment', [FeedInventoryController::class, 'bulkAdjustment'])->name('bulk-adjustment');

        // Reports and analytics
        Route::get('/low-stock', [FeedInventoryController::class, 'lowStock'])->name('low-stock');
        Route::get('/expiring', [FeedInventoryController::class, 'expiring'])->name('expiring');
        Route::get('/expired', [FeedInventoryController::class, 'expired'])->name('expired');
        Route::get('/valuation', [FeedInventoryController::class, 'valuation'])->name('valuation');
        Route::get('/turnover-report', [FeedInventoryController::class, 'turnoverReport'])->name('turnover-report');
        Route::get('/movement-history/{feedInventory}', [FeedInventoryController::class, 'movementHistory'])->name('movement-history');

        // Alerts and notifications
        Route::get('/alerts', [FeedInventoryController::class, 'getAlerts'])->name('alerts');
        Route::post('/send-alert/{type}', [FeedInventoryController::class, 'sendAlert'])->name('send-alert');
        Route::post('/{feedInventory}/mark-alert-sent', [FeedInventoryController::class, 'markAlertSent'])->name('mark-alert-sent');

        // Location and storage
        Route::get('/locations', [FeedInventoryController::class, 'getLocations'])->name('locations');
        Route::get('/by-location/{location}', [FeedInventoryController::class, 'byLocation'])->name('by-location');
        Route::post('/transfer', [FeedInventoryController::class, 'transferLocation'])->name('transfer');
    });

    // Feed Suppliers Management
    Route::prefix('suppliers')->name('suppliers.')->group(function () {
        Route::get('/', [FeedSupplierController::class, 'index'])->name('index');
        Route::get('/create', [FeedSupplierController::class, 'create'])->name('create');
        Route::post('/', [FeedSupplierController::class, 'store'])->name('store');
        Route::get('/{feedSupplier}', [FeedSupplierController::class, 'show'])->name('show');
        Route::get('/{feedSupplier}/edit', [FeedSupplierController::class, 'edit'])->name('edit');
        Route::put('/{feedSupplier}', [FeedSupplierController::class, 'update'])->name('update');
        Route::delete('/{feedSupplier}', [FeedSupplierController::class, 'destroy'])->name('destroy');

        // Supplier management
        Route::post('/{feedSupplier}/update-rating', [FeedSupplierController::class, 'updateRating'])->name('update-rating');
        Route::post('/{feedSupplier}/set-preferred', [FeedSupplierController::class, 'setPreferred'])->name('set-preferred');
        Route::get('/{feedSupplier}/performance', [FeedSupplierController::class, 'performance'])->name('performance');
        Route::get('/{feedSupplier}/credit-status', [FeedSupplierController::class, 'creditStatus'])->name('credit-status');

        // Bulk operations
        Route::post('/bulk-import', [FeedSupplierController::class, 'bulkImport'])->name('bulk-import');
        Route::get('/export-template', [FeedSupplierController::class, 'exportTemplate'])->name('export-template');
        Route::post('/bulk-rating-update', [FeedSupplierController::class, 'bulkRatingUpdate'])->name('bulk-rating-update');

        // Reports
        Route::get('/performance-report', [FeedSupplierController::class, 'performanceReport'])->name('performance-report');
        Route::get('/preferred-suppliers', [FeedSupplierController::class, 'preferredSuppliers'])->name('preferred');
        Route::get('/outstanding-orders', [FeedSupplierController::class, 'outstandingOrders'])->name('outstanding-orders');

        // Contact and communication
        Route::get('/{feedSupplier}/contact-info', [FeedSupplierController::class, 'contactInfo'])->name('contact-info');
        Route::post('/{feedSupplier}/send-message', [FeedSupplierController::class, 'sendMessage'])->name('send-message');
    });

    // Purchase Orders Management
    Route::prefix('purchase-orders')->name('purchase-orders.')->group(function () {
        Route::get('/', [FeedPurchaseOrderController::class, 'index'])->name('index');
        Route::get('/create', [FeedPurchaseOrderController::class, 'create'])->name('create');
        Route::post('/', [FeedPurchaseOrderController::class, 'store'])->name('store');
        Route::get('/{purchaseOrder}', [FeedPurchaseOrderController::class, 'show'])->name('show');
        Route::get('/{purchaseOrder}/edit', [FeedPurchaseOrderController::class, 'edit'])->name('edit');
        Route::put('/{purchaseOrder}', [FeedPurchaseOrderController::class, 'update'])->name('update');
        Route::delete('/{purchaseOrder}', [FeedPurchaseOrderController::class, 'destroy'])->name('destroy');

        // Order workflow
        Route::post('/{purchaseOrder}/confirm', [FeedPurchaseOrderController::class, 'confirm'])->name('confirm');
        Route::post('/{purchaseOrder}/ship', [FeedPurchaseOrderController::class, 'markAsShipped'])->name('ship');
        Route::post('/{purchaseOrder}/deliver', [FeedPurchaseOrderController::class, 'markAsDelivered'])->name('deliver');
        Route::post('/{purchaseOrder}/cancel', [FeedPurchaseOrderController::class, 'cancel'])->name('cancel');
        Route::post('/{purchaseOrder}/receive', [FeedPurchaseOrderController::class, 'receiveOrder'])->name('receive');

        // Payment management
        Route::post('/{purchaseOrder}/mark-paid', [FeedPurchaseOrderController::class, 'markAsPaid'])->name('mark-paid');
        Route::post('/{purchaseOrder}/partial-payment', [FeedPurchaseOrderController::class, 'partialPayment'])->name('partial-payment');
        Route::get('/{purchaseOrder}/payment-history', [FeedPurchaseOrderController::class, 'paymentHistory'])->name('payment-history');

        // Auto-generation
        Route::post('/auto-generate', [FeedPurchaseOrderController::class, 'autoGenerate'])->name('auto-generate');
        Route::get('/reorder-suggestions', [FeedPurchaseOrderController::class, 'reorderSuggestions'])->name('reorder-suggestions');
        Route::post('/create-from-alert', [FeedPurchaseOrderController::class, 'createFromAlert'])->name('create-from-alert');

        // Reports and tracking
        Route::get('/pending', [FeedPurchaseOrderController::class, 'pending'])->name('pending');
        Route::get('/overdue', [FeedPurchaseOrderController::class, 'overdue'])->name('overdue');
        Route::get('/delivery-report', [FeedPurchaseOrderController::class, 'deliveryReport'])->name('delivery-report');
        Route::get('/cost-analysis', [FeedPurchaseOrderController::class, 'costAnalysis'])->name('cost-analysis');

        // Documents
        Route::get('/{purchaseOrder}/generate-pdf', [FeedPurchaseOrderController::class, 'generatePDF'])->name('generate-pdf');
        Route::post('/{purchaseOrder}/upload-document', [FeedPurchaseOrderController::class, 'uploadDocument'])->name('upload-document');
        Route::get('/{purchaseOrder}/documents', [FeedPurchaseOrderController::class, 'getDocuments'])->name('documents');
    });

    // Cross-functional routes
    Route::get('/procurement-dashboard', [FeedInventoryController::class, 'procurementDashboard'])->name('procurement-dashboard');
    Route::get('/inventory-dashboard', [FeedInventoryController::class, 'inventoryDashboard'])->name('inventory-dashboard');
    Route::get('/supplier-dashboard', [FeedSupplierController::class, 'supplierDashboard'])->name('supplier-dashboard');
});
