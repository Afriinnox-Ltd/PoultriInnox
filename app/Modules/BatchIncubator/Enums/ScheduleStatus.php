<?php

namespace App\Modules\BatchIncubator\Enums;

/**
 * Schedule Status Enum
 *
 * Represents the status of scheduled tasks and reminders
 */
enum ScheduleStatus: string
{
    case PENDING = 'pending';
    case IN_PROGRESS = 'in_progress';
    case COMPLETED = 'completed';
    case OVERDUE = 'overdue';
    case CANCELLED = 'cancelled';
    case POSTPONED = 'postponed';

    /**
     * Get human-readable label
     */
    public function label(): string
    {
        return match($this) {
            self::PENDING => 'Pending',
            self::IN_PROGRESS => 'In Progress',
            self::COMPLETED => 'Completed',
            self::OVERDUE => 'Overdue',
            self::CANCELLED => 'Cancelled',
            self::POSTPONED => 'Postponed',
        };
    }

    /**
     * Get status color for UI
     */
    public function color(): string
    {
        return match($this) {
            self::PENDING => 'blue',
            self::IN_PROGRESS => 'yellow',
            self::COMPLETED => 'green',
            self::OVERDUE => 'red',
            self::CANCELLED => 'gray',
            self::POSTPONED => 'orange',
        };
    }

    /**
     * Check if schedule is active (needs attention)
     */
    public function isActive(): bool
    {
        return in_array($this, [self::PENDING, self::IN_PROGRESS, self::OVERDUE]);
    }

    /**
     * Check if schedule is completed
     */
    public function isCompleted(): bool
    {
        return in_array($this, [self::COMPLETED, self::CANCELLED]);
    }

    /**
     * Get all statuses as array
     */
    public static function values(): array
    {
        return array_map(fn($case) => $case->value, self::cases());
    }
}
