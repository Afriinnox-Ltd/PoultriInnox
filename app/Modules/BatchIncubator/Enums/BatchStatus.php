<?php

namespace App\Modules\BatchIncubator\Enums;

/**
 * Batch Status Enum
 *
 * Represents the lifecycle stages of a chicken batch
 */
enum BatchStatus: string
{
    case PLANNED = 'planned';
    case INCUBATING = 'incubating';
    case HATCHING = 'hatching';
    case BROODING = 'brooding';
    case GROWING = 'growing';
    case LAYING = 'laying';
    case COMPLETED = 'completed';
    case TERMINATED = 'terminated';

    /**
     * Get human-readable label
     */
    public function label(): string
    {
        return match($this) {
            self::PLANNED => 'Planned',
            self::INCUBATING => 'Incubating',
            self::HATCHING => 'Hatching',
            self::BROODING => 'Brooding',
            self::GROWING => 'Growing',
            self::LAYING => 'Laying',
            self::COMPLETED => 'Completed',
            self::TERMINATED => 'Terminated',
        };
    }

    /**
     * Get status color for UI
     */
    public function color(): string
    {
        return match($this) {
            self::PLANNED => 'blue',
            self::INCUBATING => 'yellow',
            self::HATCHING => 'orange',
            self::BROODING => 'purple',
            self::GROWING => 'green',
            self::LAYING => 'emerald',
            self::COMPLETED => 'gray',
            self::TERMINATED => 'red',
        };
    }

    /**
     * Check if status is active (not completed or terminated)
     */
    public function isActive(): bool
    {
        return !in_array($this, [self::COMPLETED, self::TERMINATED]);
    }

    /**
     * Get all statuses as array
     */
    public static function values(): array
    {
        return array_map(fn($case) => $case->value, self::cases());
    }
}
