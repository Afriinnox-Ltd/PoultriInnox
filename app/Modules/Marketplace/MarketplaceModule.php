<?php

namespace App\Modules\Marketplace;

/**
 * Marketplace Module
 *
 * This module handles:
 * - E-commerce marketplace functionality
 * - Product catalog and management
 * - Vendor registration and management
 * - Shopping cart and checkout process
 * - Order management and tracking
 * - Product reviews and ratings
 * - Multi-vendor commission system
 *
 * @version 1.0.0
 * @author Poultriinnox System
 */
class MarketplaceModule
{
    public const MODULE_NAME = 'marketplace';
    public const MODULE_VERSION = '1.0.0';

    /**
     * Module configuration
     */
    public static function config(): array
    {
        return [
            'name' => self::MODULE_NAME,
            'version' => self::MODULE_VERSION,
            'description' => 'E-commerce Marketplace Module',
            'models' => [
                'Category',
                'Vendor',
                'Product',
                'ProductImage',
                'ProductReview',
                'ProductVariant',
                'Cart',
                'CartItem',
                'Order',
                'OrderItem',
                'VendorOrder',
                'Shipping',
                'Wishlist',
            ],
            'enums' => [
                'OrderStatus',
                'PaymentStatus',
                'VendorStatus',
                'ProductStatus',
                'ShippingStatus',
            ],
            'traits' => [
                'HasBasicUserAccess',
            ],
            'migrations' => [
                'create_categories_table',
                'create_vendors_table',
                'create_products_table',
                'create_product_images_table',
                'create_product_reviews_table',
                'create_product_variants_table',
                'create_carts_table',
                'create_cart_items_table',
                'create_orders_table',
                'create_order_items_table',
                'create_vendor_orders_table',
                'create_shipping_table',
                'create_wishlists_table',
            ],
            'dependencies' => [
                'users' => 'Required for user relationships',
            ],
            'features' => [
                'product_catalog' => 'Browse and search products with advanced filtering',
                'vendor_management' => 'Vendor registration, verification, and dashboard',
                'shopping_cart' => 'Multi-vendor shopping cart with stock validation',
                'checkout_system' => 'Secure checkout with multiple payment options',
                'order_management' => 'Complete order lifecycle management',
                'review_system' => 'Product reviews and rating system',
                'commission_tracking' => 'Multi-vendor commission and payout system',
                'shipping_integration' => 'Shipping calculation and tracking',
                'wishlist' => 'Save products for later purchase',
                'inventory_management' => 'Stock tracking and notifications',
                'analytics_reporting' => 'Sales analytics and vendor performance',
                'multi_vendor_support' => 'Support for multiple vendors per order',
            ],
        ];
    }

    /**
     * Check if module is enabled
     */
    public static function isEnabled(): bool
    {
        return config('modules.marketplace.enabled', true);
    }

    /**
     * Get module path
     */
    public static function getPath(): string
    {
        return __DIR__;
    }

    /**
     * Get module routes
     */
    public static function getRoutes(): array
    {
        return [
            'web' => [
                'marketplace' => 'Marketplace main page',
                'marketplace/products/{slug}' => 'Product details',
                'marketplace/cart' => 'Shopping cart',
                'marketplace/checkout' => 'Checkout process',
                'marketplace/orders' => 'Order history',
                'marketplace/vendor/register' => 'Vendor registration',
                'marketplace/vendor/dashboard' => 'Vendor dashboard',
            ],
            'api' => [
                'api/marketplace/products' => 'Product API',
                'api/marketplace/cart' => 'Cart API',
                'api/marketplace/orders' => 'Orders API',
            ]
        ];
    }

    /**
     * Get module permissions
     */
    public static function getPermissions(): array
    {
        return [
            'marketplace.view' => 'View marketplace',
            'marketplace.shop' => 'Shop and purchase products',
            'marketplace.vendor.register' => 'Register as vendor',
            'marketplace.vendor.manage' => 'Manage vendor account',
            'marketplace.admin.view' => 'Admin marketplace access',
            'marketplace.admin.manage' => 'Manage marketplace settings',
        ];
    }

    /**
     * Module requirements
     */
    public static function getRequirements(): array
    {
        return [
            'php' => '>=8.1',
            'laravel' => '>=10.0',
            'extensions' => ['gd', 'zip', 'curl'],
            'storage' => 'Writable storage for product images',
            'queue' => 'Queue system for order processing',
        ];
    }

    /**
     * Get module dashboard stats
     */
    public static function getDashboardStats(): array
    {
        if (!self::isEnabled()) {
            return [];
        }

        return [
            'total_products' => \App\Modules\Marketplace\Models\Product::count(),
            'total_vendors' => \App\Modules\Marketplace\Models\Vendor::where('verification_status', 'verified')->count(),
            'total_orders' => \App\Modules\Marketplace\Models\Order::count(),
            'total_revenue' => \App\Modules\Marketplace\Models\Order::where('payment_status', 'paid')->sum('total_amount'),
        ];
    }
}
