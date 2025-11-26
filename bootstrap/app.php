<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\ShareEnabledModules;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            \App\Http\Middleware\TrustProxies::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            ShareEnabledModules::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Register custom middleware aliases
        $middleware->alias([
            'module.dependencies' => \App\Http\Middleware\CheckModuleDependencies::class,
            'admin.access' => \App\Http\Middleware\CheckAdminAccess::class,
            'vendor.access' => \App\Http\Middleware\CheckVendorAccess::class,
            'vendor.approved' => \App\Http\Middleware\EnsureVendorIsApproved::class,
            'ensure.vendor.approved' => \App\Http\Middleware\EnsureVendorIsApproved::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
