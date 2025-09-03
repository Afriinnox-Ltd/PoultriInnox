<?php

namespace App\Modules\BatchIncubator\Enums;

/**
 * Event Type Enum
 *
 * Represents different types of events that can occur in batch management
 */
enum EventType: string
{
    case FEEDING = 'feeding';
    case VACCINATION = 'vaccination';
    case HEALTH_CHECK = 'health_check';
    case TEMPERATURE_CHANGE = 'temperature_change';
    case HUMIDITY_CHANGE = 'humidity_change';
    case MORTALITY = 'mortality';
    case TRANSFER = 'transfer';
    case CLEANING = 'cleaning';
    case WEIGHING = 'weighing';
    case MEDICATION = 'medication';
    case OBSERVATION = 'observation';
    case MAINTENANCE = 'maintenance';
    case STATUS_CHANGE = 'status_change';

    /**
     * Get human-readable label
     */
    public function label(): string
    {
        return match($this) {
            self::FEEDING => 'Feeding',
            self::VACCINATION => 'Vaccination',
            self::HEALTH_CHECK => 'Health Check',
            self::TEMPERATURE_CHANGE => 'Temperature Change',
            self::HUMIDITY_CHANGE => 'Humidity Change',
            self::MORTALITY => 'Mortality Record',
            self::TRANSFER => 'Transfer',
            self::CLEANING => 'Cleaning',
            self::WEIGHING => 'Weighing',
            self::MEDICATION => 'Medication',
            self::OBSERVATION => 'Observation',
            self::MAINTENANCE => 'Maintenance',
            self::STATUS_CHANGE => 'Status Change',
        };
    }

    /**
     * Get event priority (1 = highest, 5 = lowest)
     */
    public function priority(): int
    {
        return match($this) {
            self::MORTALITY => 1,
            self::HEALTH_CHECK => 1,
            self::VACCINATION => 2,
            self::MEDICATION => 2,
            self::FEEDING => 3,
            self::TEMPERATURE_CHANGE => 2,
            self::HUMIDITY_CHANGE => 2,
            self::TRANSFER => 3,
            self::WEIGHING => 4,
            self::CLEANING => 4,
            self::MAINTENANCE => 3,
            self::OBSERVATION => 5,
            self::STATUS_CHANGE => 3,
        };
    }

    /**
     * Get event color for UI
     */
    public function color(): string
    {
        return match($this) {
            self::FEEDING => 'green',
            self::VACCINATION => 'blue',
            self::HEALTH_CHECK => 'purple',
            self::TEMPERATURE_CHANGE => 'orange',
            self::HUMIDITY_CHANGE => 'cyan',
            self::MORTALITY => 'red',
            self::TRANSFER => 'indigo',
            self::CLEANING => 'teal',
            self::WEIGHING => 'yellow',
            self::MEDICATION => 'pink',
            self::OBSERVATION => 'gray',
            self::MAINTENANCE => 'amber',
            self::STATUS_CHANGE => 'blue',
        };
    }

    /**
     * Check if event requires immediate attention
     */
    public function isUrgent(): bool
    {
        return in_array($this, [
            self::MORTALITY,
            self::HEALTH_CHECK,
            self::VACCINATION,
            self::MEDICATION
        ]);
    }

    /**
     * Get all event types as array
     */
    public static function values(): array
    {
        return array_map(fn($case) => $case->value, self::cases());
    }
}
