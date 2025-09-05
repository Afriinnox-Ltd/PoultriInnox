<?php

namespace App\Modules\FeedManagement;

/**
 * Feed Management Module
 *
 * This module handles:
 * - Feed inventory tracking and management
 * - Feed program creation and management (admin feature)
 * - Automatic feeding schedule generation based on batch data
 * - Feed consumption tracking and FCR calculations
 * - Supplier management and procurement
 * - Cost analysis and optimization
 *
 * @version 1.0.0
 * @author PoultriInnox System
 * @requires BatchIncubatorModule
 */
class FeedManagementModule
{
    public const MODULE_NAME = 'feed_management';
    public const MODULE_VERSION = '1.0.0';

    /**
     * Module configuration
     */
    public static function config(): array
    {
        return [
            'name' => self::MODULE_NAME,
            'version' => self::MODULE_VERSION,
            'description' => 'Feed Management and Optimization Module',
            'models' => [
                'FeedType',
                'FeedProgram',
                'FeedInventory',
                'FeedConsumption',
                'FeedSupplier',
                'FeedPurchaseOrder',
            ],
            'enums' => [
                'FeedCategory',
                'FeedStatus',
                'ProgramStatus',
                'InventoryStatus',
                'SupplierStatus',
            ],
            'traits' => [
                'HasFeedCalculations',
                'HasInventoryTracking',
            ],
            'migrations' => [
                'create_feed_types_table',
                'create_feed_programs_table',
                'create_feed_inventory_table',
                'create_feed_consumption_table',
                'create_feed_suppliers_table',
                'create_feed_purchase_orders_table',
            ],
            'dependencies' => [
                'batch_incubator' => 'Required for batch data and schedule integration',
                'users' => 'Required for user relationships and access control',
            ],
            'features' => [
                'feed_inventory_management' => 'Track feed stock levels with FIFO and expiry tracking',
                'admin_program_management' => 'Admin interface for feed program creation and templates',
                'ai_program_suggestions' => 'Intelligent feed program suggestions based on batch data',
                'automatic_schedule_generation' => 'Auto-generate feeding schedules from programs',
                'consumption_tracking' => 'Track actual feed consumption and calculate FCR',
                'supplier_management' => 'Manage feed suppliers and procurement',
                'cost_optimization' => 'Analyze costs and provide optimization recommendations',
                'excel_template_support' => 'Upload and download Excel templates for feed programs',
                'batch_integration' => 'Deep integration with batch lifecycle and schedules',
            ],
        ];
    }

    /**
     * Check if module is enabled
     */
    public static function isEnabled(): bool
    {
        return config('modules.feed_management.enabled', true);
    }

    /**
     * Check if dependencies are satisfied
     */
    public static function dependenciesSatisfied(): array
    {
        $dependencies = [];

        // Check if BatchIncubator module is available
        if (!class_exists('\App\Modules\BatchIncubator\BatchIncubatorModule')) {
            $dependencies[] = 'BatchIncubator module is required but not found';
        }

        return $dependencies;
    }

    /**
     * Get module path
     */
    public static function getPath(): string
    {
        return __DIR__;
    }

    /**
     * Module initialization
     */
    public static function boot(): void
    {
        // Register module service providers if needed
        // Set up event listeners
        // Configure module-specific settings
    }
}
