<?php

use App\Http\Controllers\Admin\FeedManagement\FeedConsumptionController;
use App\Http\Controllers\Admin\FeedManagement\FeedAnalyticsController;
use App\Http\Controllers\Admin\FeedManagement\FeedUploadController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Feed Analytics & Data Management Routes
|--------------------------------------------------------------------------
|
| Routes for feed consumption tracking, analytics, reporting,
| and data upload functionality.
|
*/

Route::prefix('feed-management')->name('feed-management.')->group(function () {

    // Feed Consumption Tracking
    Route::prefix('consumption')->name('consumption.')->group(function () {
        Route::get('/', [FeedConsumptionController::class, 'index'])->name('index');
        Route::get('/create', [FeedConsumptionController::class, 'create'])->name('create');
        Route::post('/', [FeedConsumptionController::class, 'store'])->name('store');
        Route::get('/{feedConsumption}', [FeedConsumptionController::class, 'show'])->name('show');
        Route::get('/{feedConsumption}/edit', [FeedConsumptionController::class, 'edit'])->name('edit');
        Route::put('/{feedConsumption}', [FeedConsumptionController::class, 'update'])->name('update');
        Route::delete('/{feedConsumption}', [FeedConsumptionController::class, 'destroy'])->name('destroy');

        // Consumption processing
        Route::post('/process-schedule/{scheduleId}', [FeedConsumptionController::class, 'processScheduleConsumption'])->name('process-schedule');
        Route::post('/{feedConsumption}/verify', [FeedConsumptionController::class, 'verify'])->name('verify');
        Route::post('/{feedConsumption}/adjust', [FeedConsumptionController::class, 'adjust'])->name('adjust');

        // Bulk operations
        Route::post('/bulk-import', [FeedConsumptionController::class, 'bulkImport'])->name('bulk-import');
        Route::post('/bulk-verify', [FeedConsumptionController::class, 'bulkVerify'])->name('bulk-verify');
        Route::get('/export-template', [FeedConsumptionController::class, 'exportTemplate'])->name('export-template');

        // Batch-specific consumption
        Route::get('/by-batch/{batchId}', [FeedConsumptionController::class, 'byBatch'])->name('by-batch');
        Route::get('/batch-summary/{batchId}', [FeedConsumptionController::class, 'batchSummary'])->name('batch-summary');
        Route::get('/batch-trends/{batchId}', [FeedConsumptionController::class, 'batchTrends'])->name('batch-trends');

        // Efficiency analysis
        Route::get('/efficiency-report', [FeedConsumptionController::class, 'efficiencyReport'])->name('efficiency-report');
        Route::get('/conversion-analysis', [FeedConsumptionController::class, 'conversionAnalysis'])->name('conversion-analysis');
        Route::get('/waste-analysis', [FeedConsumptionController::class, 'wasteAnalysis'])->name('waste-analysis');

        // Unverified records
        Route::get('/unverified', [FeedConsumptionController::class, 'unverified'])->name('unverified');
        Route::get('/high-waste', [FeedConsumptionController::class, 'highWaste'])->name('high-waste');
        Route::get('/poor-conversion', [FeedConsumptionController::class, 'poorConversion'])->name('poor-conversion');
    });

    // Feed Analytics & Reporting
    Route::prefix('analytics')->name('analytics.')->group(function () {
        // Dashboard data
        Route::get('/dashboard', [FeedAnalyticsController::class, 'dashboard'])->name('dashboard');
        Route::get('/overview', [FeedAnalyticsController::class, 'overview'])->name('overview');
        Route::get('/kpi-summary', [FeedAnalyticsController::class, 'kpiSummary'])->name('kpi-summary');

        // Feed performance analytics
        Route::get('/feed-performance', [FeedAnalyticsController::class, 'feedPerformance'])->name('feed-performance');
        Route::get('/feed-comparison', [FeedAnalyticsController::class, 'feedComparison'])->name('feed-comparison');
        Route::get('/feed-efficiency-trends', [FeedAnalyticsController::class, 'feedEfficiencyTrends'])->name('feed-efficiency-trends');

        // Cost analytics
        Route::get('/cost-analysis', [FeedAnalyticsController::class, 'costAnalysis'])->name('cost-analysis');
        Route::get('/cost-per-kg', [FeedAnalyticsController::class, 'costPerKg'])->name('cost-per-kg');
        Route::get('/cost-trends', [FeedAnalyticsController::class, 'costTrends'])->name('cost-trends');
        Route::get('/roi-analysis', [FeedAnalyticsController::class, 'roiAnalysis'])->name('roi-analysis');

        // Inventory analytics
        Route::get('/inventory-analytics', [FeedAnalyticsController::class, 'inventoryAnalytics'])->name('inventory-analytics');
        Route::get('/turnover-analysis', [FeedAnalyticsController::class, 'turnoverAnalysis'])->name('turnover-analysis');
        Route::get('/waste-analytics', [FeedAnalyticsController::class, 'wasteAnalytics'])->name('waste-analytics');

        // Supplier analytics
        Route::get('/supplier-performance', [FeedAnalyticsController::class, 'supplierPerformance'])->name('supplier-performance');
        Route::get('/delivery-analytics', [FeedAnalyticsController::class, 'deliveryAnalytics'])->name('delivery-analytics');
        Route::get('/supplier-cost-comparison', [FeedAnalyticsController::class, 'supplierCostComparison'])->name('supplier-cost-comparison');

        // Predictive analytics
        Route::get('/consumption-forecast', [FeedAnalyticsController::class, 'consumptionForecast'])->name('consumption-forecast');
        Route::get('/reorder-predictions', [FeedAnalyticsController::class, 'reorderPredictions'])->name('reorder-predictions');
        Route::get('/demand-planning', [FeedAnalyticsController::class, 'demandPlanning'])->name('demand-planning');

        // Custom reports
        Route::post('/custom-report', [FeedAnalyticsController::class, 'customReport'])->name('custom-report');
        Route::get('/report-templates', [FeedAnalyticsController::class, 'reportTemplates'])->name('report-templates');
        Route::post('/save-report-template', [FeedAnalyticsController::class, 'saveReportTemplate'])->name('save-report-template');

        // Export capabilities
        Route::post('/export-excel', [FeedAnalyticsController::class, 'exportExcel'])->name('export-excel');
        Route::post('/export-pdf', [FeedAnalyticsController::class, 'exportPDF'])->name('export-pdf');
        Route::get('/scheduled-reports', [FeedAnalyticsController::class, 'scheduledReports'])->name('scheduled-reports');
    });

    // Data Upload & Import Management
    Route::prefix('uploads')->name('uploads.')->group(function () {
        // Feed types upload
        Route::get('/feed-types', [FeedUploadController::class, 'feedTypesUploadForm'])->name('feed-types.form');
        Route::post('/feed-types', [FeedUploadController::class, 'uploadFeedTypes'])->name('feed-types.upload');
        Route::get('/feed-types/template', [FeedUploadController::class, 'feedTypesTemplate'])->name('feed-types.template');
        Route::post('/feed-types/validate', [FeedUploadController::class, 'validateFeedTypesData'])->name('feed-types.validate');

        // Feed programs upload
        Route::get('/feed-programs', [FeedUploadController::class, 'feedProgramsUploadForm'])->name('feed-programs.form');
        Route::post('/feed-programs', [FeedUploadController::class, 'uploadFeedPrograms'])->name('feed-programs.upload');
        Route::get('/feed-programs/template', [FeedUploadController::class, 'feedProgramsTemplate'])->name('feed-programs.template');
        Route::post('/feed-programs/validate', [FeedUploadController::class, 'validateFeedProgramsData'])->name('feed-programs.validate');

        // Inventory upload
        Route::get('/inventory', [FeedUploadController::class, 'inventoryUploadForm'])->name('inventory.form');
        Route::post('/inventory', [FeedUploadController::class, 'uploadInventory'])->name('inventory.upload');
        Route::get('/inventory/template', [FeedUploadController::class, 'inventoryTemplate'])->name('inventory.template');
        Route::post('/inventory/validate', [FeedUploadController::class, 'validateInventoryData'])->name('inventory.validate');

        // Suppliers upload
        Route::get('/suppliers', [FeedUploadController::class, 'suppliersUploadForm'])->name('suppliers.form');
        Route::post('/suppliers', [FeedUploadController::class, 'uploadSuppliers'])->name('suppliers.upload');
        Route::get('/suppliers/template', [FeedUploadController::class, 'suppliersTemplate'])->name('suppliers.template');
        Route::post('/suppliers/validate', [FeedUploadController::class, 'validateSuppliersData'])->name('suppliers.validate');

        // Consumption data upload
        Route::get('/consumption', [FeedUploadController::class, 'consumptionUploadForm'])->name('consumption.form');
        Route::post('/consumption', [FeedUploadController::class, 'uploadConsumption'])->name('consumption.upload');
        Route::get('/consumption/template', [FeedUploadController::class, 'consumptionTemplate'])->name('consumption.template');
        Route::post('/consumption/validate', [FeedUploadController::class, 'validateConsumptionData'])->name('consumption.validate');

        // Upload history and management
        Route::get('/history', [FeedUploadController::class, 'uploadHistory'])->name('history');
        Route::get('/history/{uploadId}', [FeedUploadController::class, 'uploadDetails'])->name('history.details');
        Route::post('/rollback/{uploadId}', [FeedUploadController::class, 'rollbackUpload'])->name('rollback');

        // Batch processing
        Route::get('/batch-status/{batchId}', [FeedUploadController::class, 'batchStatus'])->name('batch-status');
        Route::post('/batch-cancel/{batchId}', [FeedUploadController::class, 'cancelBatch'])->name('batch-cancel');

        // Error handling
        Route::get('/errors/{uploadId}', [FeedUploadController::class, 'uploadErrors'])->name('errors');
        Route::post('/fix-errors/{uploadId}', [FeedUploadController::class, 'fixUploadErrors'])->name('fix-errors');
        Route::get('/error-summary', [FeedUploadController::class, 'errorSummary'])->name('error-summary');
    });

    // Quick actions and utilities
    Route::get('/quick-actions', [FeedAnalyticsController::class, 'quickActions'])->name('quick-actions');
    Route::get('/system-health', [FeedAnalyticsController::class, 'systemHealth'])->name('system-health');
    Route::get('/data-quality-check', [FeedUploadController::class, 'dataQualityCheck'])->name('data-quality-check');
});
