<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Modules Configuration
    |--------------------------------------------------------------------------
    |
    | Here you can configure which modules are enabled and their settings.
    |
    */

    'batch_incubator' => [
        'enabled' => env('MODULE_BATCH_INCUBATOR_ENABLED', true),
        'namespace' => 'App\\Modules\\BatchIncubator',
        'path' => app_path('Modules/BatchIncubator'),
        'routes' => [
            'web' => 'routes/batch-incubator.php',
            'api' => 'routes/api-batch-incubator.php',
        ],
        'views' => 'batch-incubator',
        'migrations' => 'database/migrations/batch_incubator',
    ],

    'feed_management' => [
        'enabled' => env('MODULE_FEED_MANAGEMENT_ENABLED', true),
        'namespace' => 'App\\Modules\\FeedManagement',
        'path' => app_path('Modules/FeedManagement'),
        'routes' => [
            'web' => 'routes/feed-management.php',
            'api' => 'routes/api-feed-management.php',
        ],
        'views' => 'feed-management',
        'migrations' => 'database/migrations/feed_management',
        'dependencies' => ['batch_incubator'],
    ],

    'marketplace' => [
        'enabled' => env('MODULE_MARKETPLACE_ENABLED', true),
        'namespace' => 'App\\Modules\\Marketplace',
        'path' => app_path('Modules/Marketplace'),
        'routes' => [
            'web' => 'routes/marketplace.php',
            'api' => 'routes/api-marketplace.php',
        ],
        'views' => 'marketplace',
        'migrations' => 'database/migrations/marketplace',
        'config' => [
            'commission_rate' => env('MARKETPLACE_COMMISSION_RATE', 5.0),
            'auto_approve_vendors' => env('MARKETPLACE_AUTO_APPROVE_VENDORS', false),
            'max_product_images' => env('MARKETPLACE_MAX_PRODUCT_IMAGES', 10),
            'allowed_image_types' => ['jpg', 'jpeg', 'png', 'webp'],
            'max_image_size' => env('MARKETPLACE_MAX_IMAGE_SIZE', 5120), // KB
            'currency' => env('MARKETPLACE_CURRENCY', 'USD'),
            'currency_symbol' => env('MARKETPLACE_CURRENCY_SYMBOL', '$'),
            'tax_rate' => env('MARKETPLACE_TAX_RATE', 8.25),
            'free_shipping_threshold' => env('MARKETPLACE_FREE_SHIPPING_THRESHOLD', 100),
            'payment_methods' => [
                'credit_card' => env('MARKETPLACE_PAYMENT_CREDIT_CARD', true),
                'paypal' => env('MARKETPLACE_PAYMENT_PAYPAL', true),
                'bank_transfer' => env('MARKETPLACE_PAYMENT_BANK_TRANSFER', true),
                'cash_on_delivery' => env('MARKETPLACE_PAYMENT_COD', true),
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Global Module Settings
    |--------------------------------------------------------------------------
    */

    'auto_discovery' => env('MODULES_AUTO_DISCOVERY', true),
    'cache_enabled' => env('MODULES_CACHE_ENABLED', true),
    'cache_key' => 'modules_cache',
    'cache_lifetime' => env('MODULES_CACHE_LIFETIME', 86400), // 24 hours

    /*
    |--------------------------------------------------------------------------
    | Module Paths
    |--------------------------------------------------------------------------
    */

    'paths' => [
        'modules' => app_path('Modules'),
        'assets' => public_path('modules'),
        'migrations' => database_path('migrations'),
        'lang' => resource_path('lang/modules'),
        'views' => resource_path('views/modules'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Module Stubs
    |--------------------------------------------------------------------------
    */

    'stubs' => [
        'enabled' => true,
        'path' => base_path('stubs/modules'),
        'files' => [
            'module' => 'module.stub',
            'controller' => 'controller.stub',
            'model' => 'model.stub',
            'migration' => 'migration.stub',
            'seeder' => 'seeder.stub',
            'factory' => 'factory.stub',
            'middleware' => 'middleware.stub',
            'request' => 'request.stub',
            'resource' => 'resource.stub',
            'test' => 'test.stub',
            'views/index' => 'view.stub',
            'views/create' => 'view.stub',
            'views/edit' => 'view.stub',
            'views/show' => 'view.stub',
        ],
    ],
];
