<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Marketplace\Controllers\PaymentController;

/*
|--------------------------------------------------------------------------
| Payment Routes
|--------------------------------------------------------------------------
|
| These routes handle the payment processing functionality including
| payment initiation, status tracking, and transaction history.
|
*/

Route::prefix('payment')->name('payment.')->group(function () {
    // Payment page
    Route::get('/{order}', [PaymentController::class, 'show'])->middleware('auth')->name('show');

    // Initiate payment
    Route::post('/{order}/initiate', [PaymentController::class, 'initiatePayment'])->middleware('auth')->name('initiate');

    // Check payment status
    Route::get('/{order}/status', [PaymentController::class, 'checkStatus'])->middleware('auth')->name('status');

    // Payment callback from Ishema (no auth required)
    Route::post('/callback', [PaymentController::class, 'handleCallback'])->name('callback');

    // Legacy routes for backward compatibility
    Route::get('/validate', function () {
        return response()->json([
            'status' => 'success',
            'message' => 'Validation simulation endpoint reached.'
        ]);
    });

    Route::get('/notify', function () {
        return response()->json([
            'status' => 'success',
            'message' => 'Payment notification simulation endpoint reached.'
        ]);
    });

    Route::get('/reversal', function () {
        return response()->json([
            'status' => 'success',
            'message' => 'Payment reversal simulation endpoint reached.'
        ]);
    });
});
