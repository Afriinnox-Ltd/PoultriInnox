<?php

namespace App\Providers;

use App\Models\MarketplaceSetting;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class MarketplaceServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Share public marketplace settings with all Inertia pages
        Inertia::share([
            'marketplaceSettings' => function () {
                return MarketplaceSetting::getPublic();
            },
        ]);
    }
}