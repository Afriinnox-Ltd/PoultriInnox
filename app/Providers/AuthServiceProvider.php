<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Modules\Marketplace\Models\Product;
use App\Modules\Marketplace\Models\Category;
use App\Modules\Marketplace\Models\Vendor;
use App\Modules\Marketplace\Models\Order;
use App\Modules\Marketplace\Policies\ProductPolicy;
use App\Modules\Marketplace\Policies\CategoryPolicy;
use App\Modules\Marketplace\Policies\VendorPolicy;
use App\Modules\Marketplace\Policies\OrderPolicy;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Product::class => ProductPolicy::class,
        Category::class => CategoryPolicy::class,
        Vendor::class => VendorPolicy::class,
        Order::class => OrderPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}
