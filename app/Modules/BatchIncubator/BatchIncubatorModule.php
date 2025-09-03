<?php

namespace App\Modules\BatchIncubator;

/**
 * Batch & Incubator Management Module
 *
 * This module handles:
 * - Batch creation, tracking, and lifecycle management
 * - Incubator machine integration and access control
 * - Event logging for feeding, vaccination, and health checks
 * - Scheduling and reminders for batch-related activities
 *
 * @version 1.0.0
 * @author Poultriinnox System
 */
class BatchIncubatorModule
{
    public const MODULE_NAME = 'batch_incubator';
    public const MODULE_VERSION = '1.0.0';

    /**
     * Module configuration
     */
    public static function config(): array
    {
        return [
            'name' => self::MODULE_NAME,
            'version' => self::MODULE_VERSION,
            'description' => 'Batch and Incubator Management Module',
            'models' => [
                'Batch',
                'Incubator',
                'BatchEvent',
                'BatchSchedule',
            ],
            'enums' => [
                'BatchStatus',
                'IncubatorStatus',
                'EventType',
                'ScheduleStatus',
            ],
            'traits' => [
                'HasBasicUserAccess',
            ],
            'migrations' => [
                'create_incubators_table',
                'create_batches_table',
                'create_batch_events_table',
                'create_batch_schedules_table',
            ],
            'dependencies' => [
                'users' => 'Required for user relationships',
            ],
            'features' => [
                'batch_creation_tracking' => 'Create and track chicken batches through lifecycle',
                'incubator_management' => 'Manage incubator machines and assignments',
                'event_logging' => 'Log feeding, vaccination, and health events',
                'scheduling_reminders' => 'Schedule tasks and send reminders',
                'access_control' => 'Basic user access control for resources',
            ],
        ];
    }

    /**
     * Check if module is enabled
     */
    public static function isEnabled(): bool
    {
        return config('modules.batch_incubator.enabled', true);
    }

    /**
     * Get module path
     */
    public static function getPath(): string
    {
        return __DIR__;
    }
}
