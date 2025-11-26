<?php

use App\Http\Controllers\Partner\PartnerApplicationController;
use App\Http\Controllers\Partner\PartnerOrderController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Partner Portal Routes
|--------------------------------------------------------------------------
|
| Routes for hotel, restaurant, and catering partners to place
| custom orders and track their delivery and payment status.
|
*/

// Public: application form
Route::get('/partners/apply', [PartnerApplicationController::class, 'create'])->name('partners.apply');
Route::post('/partners/apply', [PartnerApplicationController::class, 'store'])->name('partners.apply.store');

Route::middleware(['auth'])->prefix('partner')->name('partners.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [PartnerOrderController::class, 'dashboard'])->name('dashboard');

    // Orders
    Route::get('/orders', [PartnerOrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/create', [PartnerOrderController::class, 'create'])->name('orders.create');
    Route::post('/orders', [PartnerOrderController::class, 'store'])->name('orders.store');
    Route::get('/orders/{order}', [PartnerOrderController::class, 'show'])->name('orders.show');
    Route::get('/orders/{order}/invoice', [PartnerOrderController::class, 'downloadInvoice'])->name('orders.invoice');

    // Profile
    Route::get('/profile', [PartnerOrderController::class, 'profileEdit'])->name('profile');
    Route::put('/profile', [PartnerOrderController::class, 'profileUpdate'])->name('profile.update');
});
