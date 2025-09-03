<?php

namespace App\Modules\BatchIncubator\Enums;

/**
 * Incubator Status Enum
 *
 * Represents the operational states of incubator machines
 */
enum IncubatorStatus: string
{
    case OFFLINE = 'offline';
    case IDLE = 'idle';
    case RUNNING = 'running';
    case MAINTENANCE = 'maintenance';
    case ERROR = 'error';

    /**
     * Get human-readable label
     */
    public function label(): string
    {
        return match($this) {
            self::OFFLINE => 'Offline',
            self::IDLE => 'Idle',
            self::RUNNING => 'Running',
            self::MAINTENANCE => 'Maintenance',
            self::ERROR => 'Error',
        };
    }

    /**
     * Get status color for UI
     */
    public function color(): string
    {
        return match($this) {
            self::OFFLINE => 'gray',
            self::IDLE => 'blue',
            self::RUNNING => 'green',
            self::MAINTENANCE => 'yellow',
            self::ERROR => 'red',
        };
    }

    /**
     * Check if incubator is operational
     */
    public function isOperational(): bool
    {
        return in_array($this, [self::IDLE, self::RUNNING]);
    }

    /**
     * Get all statuses as array
     */
    public static function values(): array
    {
        return array_map(fn($case) => $case->value, self::cases());
    }
}
