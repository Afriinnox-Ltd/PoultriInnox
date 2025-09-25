<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Marketplace\Controllers\ProductController;
use App\Modules\Marketplace\Controllers\CategoryController;
use App\Modules\Marketplace\Controllers\VendorController;
use App\Modules\Marketplace\Controllers\CartController;
use App\Modules\Marketplace\Controllers\OrderController;
use App\Modules\Marketplace\Controllers\CheckoutController;

/*
|--------------------------------------------------------------------------
| Marketplace Module Routes
|--------------------------------------------------------------------------
|
| These routes handle the marketplace functionality including
| product browsing, vendor management, cart, orders, and payments.
|
*/

// Public marketplace routes (accessible without authentication)
Route::prefix('store')->name('store.')->group(function () {
    Route::get('/', [ProductController::class, 'publicIndex'])->name('index');
    Route::get('/products/{product:slug}', [ProductController::class, 'publicShow'])->name('products.show');
    Route::get('/categories/{category:slug}', [CategoryController::class, 'publicShow'])->name('categories.show');
    Route::get('/vendors/{vendor:slug}', [VendorController::class, 'publicShow'])->name('vendors.show');
});

Route::middleware(['auth'])->group(function () {
    // Cart routes
    Route::prefix('cart')->name('cart.')->group(function () {
        Route::get('/', [CartController::class, 'index'])->name('index');
        Route::post('/add', [CartController::class, 'store'])->name('add');
        Route::put('/update/{cartItem}', [CartController::class, 'update'])->name('update');
        Route::delete('/remove/{cartItem}', [CartController::class, 'destroy'])->name('remove');
        Route::delete('/clear', [CartController::class, 'clear'])->name('clear');
        Route::post('/shipping', [CartController::class, 'calculateShipping'])->name('shipping');
    });

    // Checkout routes
    Route::prefix('checkout')->name('checkout.')->group(function () {
        Route::get('/', [CheckoutController::class, 'index'])->name('index');
        Route::post('/', [CheckoutController::class, 'store'])->name('process');
    });

    // Order routes
    Route::prefix('orders')->name('orders.')->group(function () {
        Route::get('/', [OrderController::class, 'index'])->name('index');
        Route::get('/confirmation', [CheckoutController::class, 'confirmation'])->name('confirmation');
        Route::get('/{order}', [OrderController::class, 'show'])->name('show');
        Route::post('/{order}/cancel', [OrderController::class, 'cancel'])->name('cancel');
        
        // Delivery confirmation routes
        Route::get('/{order}/confirm-delivery', [OrderController::class, 'showDeliveryConfirmation'])->name('confirm-delivery');
        Route::post('/{order}/confirm-delivery', [OrderController::class, 'confirmDelivery'])->name('confirm-delivery.submit');
    });

    // Payment simulation routes
    Route::prefix('payment')->name('payment.')->group(function () {
        Route::get('/simulation/{order}', [CheckoutController::class, 'paymentSimulation'])->name('simulation');
        Route::post('/process/{order}', [CheckoutController::class, 'processPayment'])->name('process');
    });
});

// Authenticated marketplace routes
Route::prefix('marketplace')->name('marketplace.')->middleware(['auth', 'module.dependencies:marketplace'])->group(function () {

    // Main marketplace dashboard/index - using ProductController for product browsing
    // Route::get('/', [ProductController::class, 'index'])->name('index');
    route::get('/',function(){
        return redirect()->route('marketplace.vendor.dashboard');
    })->name('index');

    // Product routes
    Route::prefix('products')->name('products.')->group(function () {
        Route::get('/', [ProductController::class, 'index'])->name('index');
        Route::get('/{product:slug}', [ProductController::class, 'show'])->name('show');

        // Review routes (require authentication)
        Route::middleware('auth')->group(function () {
            Route::post('/{product:slug}/reviews', [App\Modules\Marketplace\Controllers\ReviewController::class, 'store'])->name('reviews.store');
            Route::put('/{product:slug}/reviews/{review}', [App\Modules\Marketplace\Controllers\ReviewController::class, 'update'])->name('reviews.update');
            Route::delete('/{product:slug}/reviews/{review}', [App\Modules\Marketplace\Controllers\ReviewController::class, 'destroy'])->name('reviews.destroy');
            Route::post('/{product:slug}/reviews/{review}/helpful', [App\Modules\Marketplace\Controllers\ReviewController::class, 'toggleHelpful'])->name('reviews.helpful');
        });
    });

    // Category routes
    Route::prefix('categories')->name('categories.')->group(function () {
        Route::get('/', [CategoryController::class, 'index'])->name('index');
        Route::get('/{category:slug}', [CategoryController::class, 'show'])->name('show');
    });



    // Wishlist routes - commenting out until WishlistController is created
    // Route::prefix('wishlist')->name('wishlist.')->group(function () {
    //     Route::get('/', [WishlistController::class, 'index'])->name('index');
    //     Route::post('/add/{product}', [WishlistController::class, 'add'])->name('add');
    //     Route::delete('/remove/{product}', [WishlistController::class, 'remove'])->name('remove');
    // });

    // Vendor routes
    Route::prefix('vendor')->name('vendor.')->group(function () {
        // Vendor registration (open to all authenticated users)
        Route::get('/register', [VendorController::class, 'create'])->name('register');
        Route::post('/register', [VendorController::class, 'store'])->name('register.submit');
        Route::get('/pending', [VendorController::class, 'pending'])->name('pending');

        // Vendor dashboard and management (only for approved vendors)
        Route::middleware(['vendor.approved'])->group(function () {
            Route::get('/dashboard', [VendorController::class, 'dashboard'])->name('dashboard');
            Route::get('/profile', [VendorController::class, 'edit'])->name('profile');
            Route::put('/profile', [VendorController::class, 'update'])->name('profile.update');
            Route::delete('/profile', [VendorController::class, 'destroy'])->name('profile.destroy');

            // Vendor product management
            Route::prefix('products')->name('products.')->group(function () {
                Route::get('/', [ProductController::class, 'vendorProducts'])->name('index');
                Route::get('/create', [ProductController::class, 'create'])->name('create');
                Route::post('/store', [ProductController::class, 'store'])->name('store');
                Route::get('/{product}/edit', [ProductController::class, 'edit'])->name('edit');
                Route::put('/{product}', [ProductController::class, 'update'])->name('update');
                Route::delete('/{product}', [ProductController::class, 'destroy'])->name('destroy');
                Route::patch('/{product}/status', [ProductController::class, 'toggleStatus'])->name('toggle-status');
                Route::post('/{product}/duplicate', [ProductController::class, 'duplicate'])->name('duplicate');
            });

            // Vendor order management
            Route::prefix('orders')->name('orders.')->group(function () {
                Route::get('/', [OrderController::class, 'vendorOrders'])->name('index');
                Route::get('/{order}', [OrderController::class, 'show'])->name('show');
                Route::patch('/{order}/status', [OrderController::class, 'updateStatus'])->name('status');
                Route::post('/{order}/confirm', [OrderController::class, 'confirmOrder'])->name('confirm');
            });

            // Vendor payment management
            Route::prefix('payments')->name('payments.')->group(function () {
                Route::get('/', [App\Modules\Marketplace\Controllers\VendorPaymentController::class, 'index'])->name('index');
                Route::get('/analytics', [App\Modules\Marketplace\Controllers\VendorPaymentController::class, 'analytics'])->name('analytics');
                Route::post('/remind-buyer/{order}', [App\Modules\Marketplace\Controllers\VendorPaymentController::class, 'remindBuyerConfirmation'])->name('remind-buyer');
                Route::post('/request-payout', [App\Modules\Marketplace\Controllers\VendorPaymentController::class, 'requestPayout'])->name('request-payout');
            });

            // Vendor analytics
            Route::get('/analytics', [VendorController::class, 'analytics'])->name('analytics');
        });

        // Public vendor profile (accessible to all)
        Route::get('/{vendor:slug}', [VendorController::class, 'show'])->name('show');
    });

    // Subscription management routes
    Route::prefix('subscriptions')->name('subscriptions.')->group(function () {
        Route::get('/', [App\Modules\Marketplace\Controllers\SubscriptionController::class, 'index'])->name('index');
        Route::get('/upgrade', [App\Modules\Marketplace\Controllers\SubscriptionController::class, 'upgrade'])->name('upgrade');
        Route::get('/plans/{plan}', [App\Modules\Marketplace\Controllers\SubscriptionController::class, 'selectPlan'])->name('select-plan');
        Route::post('/upgrade', [App\Modules\Marketplace\Controllers\SubscriptionController::class, 'processUpgrade'])->name('process-upgrade');
        Route::get('/success/{subscription}', [App\Modules\Marketplace\Controllers\SubscriptionController::class, 'success'])->name('success');
        Route::post('/cancel', [App\Modules\Marketplace\Controllers\SubscriptionController::class, 'cancel'])->name('cancel');
        Route::post('/reactivate', [App\Modules\Marketplace\Controllers\SubscriptionController::class, 'reactivate'])->name('reactivate');
        Route::get('/usage', [App\Modules\Marketplace\Controllers\SubscriptionController::class, 'usage'])->name('usage');
    });

    // Payment routes - commenting out until PaymentController is created
    // Route::prefix('payments')->name('payments.')->group(function () {
    //     Route::post('/process', [PaymentController::class, 'process'])->name('process');
    //     Route::get('/success', [PaymentController::class, 'success'])->name('success');
    //     Route::get('/cancel', [PaymentController::class, 'cancel'])->name('cancel');
    //     Route::post('/webhook', [PaymentController::class, 'webhook'])->name('webhook');
    // });

    // API routes for AJAX requests
    Route::prefix('api')->name('api.')->group(function () {
        Route::get('/search', [ProductController::class, 'search'])->name('search');
        Route::get('/categories', [CategoryController::class, 'api'])->name('categories');
        Route::get('/vendors', [VendorController::class, 'api'])->name('vendors');
        // Route::get('/products/featured', [ProductController::class, 'featured'])->name('products.featured');
        // Route::get('/products/recommendations', [ProductController::class, 'recommendations'])->name('products.recommendations');

        // Cart API
        Route::get('/cart/count', [CartController::class, 'count'])->name('cart.count');
        Route::get('/cart/total', [CartController::class, 'total'])->name('cart.total');
        
        // Subscription API
        Route::get('/subscription/usage', [App\Modules\Marketplace\Controllers\SubscriptionController::class, 'usageApi'])->name('subscription.usage');
    });

});
