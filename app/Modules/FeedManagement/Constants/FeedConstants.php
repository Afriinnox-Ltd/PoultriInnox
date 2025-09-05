<?php

namespace App\Modules\FeedManagement\Constants;

class FeedConstants
{
    // Feed Conversion Ratios
    public const DEFAULT_FEED_CONVERSION_RATIO = 2.0;
    public const EXCELLENT_FCR_THRESHOLD = 1.6;
    public const GOOD_FCR_THRESHOLD = 1.8;
    public const ACCEPTABLE_FCR_THRESHOLD = 2.2;
    public const POOR_FCR_THRESHOLD = 2.5;

    // Feed Consumption (grams per bird per day)
    public const STARTER_CONSUMPTION_MIN = 10;
    public const STARTER_CONSUMPTION_MAX = 30;
    public const GROWER_CONSUMPTION_MIN = 40;
    public const GROWER_CONSUMPTION_MAX = 80;
    public const FINISHER_CONSUMPTION_MIN = 100;
    public const FINISHER_CONSUMPTION_MAX = 150;
    public const LAYER_CONSUMPTION_MIN = 110;
    public const LAYER_CONSUMPTION_MAX = 130;

    // Age-based consumption multipliers
    public const AGE_CONSUMPTION_MULTIPLIERS = [
        0 => 0.3,   // Day 0-7
        7 => 0.5,   // Week 1
        14 => 0.7,  // Week 2
        21 => 1.0,  // Week 3
        28 => 1.2,  // Week 4
        35 => 1.4,  // Week 5
        42 => 1.6,  // Week 6
        49 => 1.8,  // Week 7+
    ];

    // Nutritional Requirements (percentages)
    public const PROTEIN_REQUIREMENTS = [
        'starter' => ['min' => 20, 'max' => 24],
        'grower' => ['min' => 18, 'max' => 22],
        'finisher' => ['min' => 16, 'max' => 20],
        'layer' => ['min' => 16, 'max' => 18],
        'breeder' => ['min' => 18, 'max' => 20],
    ];

    public const ENERGY_REQUIREMENTS = [
        'starter' => ['min' => 2800, 'max' => 3000], // kcal/kg
        'grower' => ['min' => 3000, 'max' => 3200],
        'finisher' => ['min' => 3100, 'max' => 3300],
        'layer' => ['min' => 2700, 'max' => 2900],
        'breeder' => ['min' => 2800, 'max' => 3000],
    ];

    public const CALCIUM_REQUIREMENTS = [
        'starter' => ['min' => 0.8, 'max' => 1.0],
        'grower' => ['min' => 0.7, 'max' => 0.9],
        'finisher' => ['min' => 0.6, 'max' => 0.8],
        'layer' => ['min' => 3.5, 'max' => 4.5],
        'breeder' => ['min' => 3.0, 'max' => 4.0],
    ];

    public const PHOSPHORUS_REQUIREMENTS = [
        'starter' => ['min' => 0.4, 'max' => 0.5],
        'grower' => ['min' => 0.35, 'max' => 0.45],
        'finisher' => ['min' => 0.3, 'max' => 0.4],
        'layer' => ['min' => 0.35, 'max' => 0.45],
        'breeder' => ['min' => 0.4, 'max' => 0.5],
    ];

    // Feeding Schedules
    public const DEFAULT_FEEDING_FREQUENCY = [
        'starter' => 6,     // 6 times per day
        'grower' => 4,      // 4 times per day
        'finisher' => 3,    // 3 times per day
        'layer' => 2,       // 2 times per day
        'breeder' => 2,     // 2 times per day
    ];

    public const FEEDING_TIMES = [
        6 => ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
        5 => ['06:00', '09:30', '13:00', '16:30', '20:00'],
        4 => ['06:00', '10:00', '14:00', '18:00'],
        3 => ['07:00', '13:00', '19:00'],
        2 => ['07:00', '17:00'],
        1 => ['08:00'],
    ];

    // Storage Requirements
    public const STORAGE_TEMPERATURE_MIN = 15; // Celsius
    public const STORAGE_TEMPERATURE_MAX = 25; // Celsius
    public const STORAGE_HUMIDITY_MIN = 40; // Percentage
    public const STORAGE_HUMIDITY_MAX = 60; // Percentage

    public const STORAGE_CONDITIONS = [
        'temperature' => [
            'min' => self::STORAGE_TEMPERATURE_MIN,
            'max' => self::STORAGE_TEMPERATURE_MAX,
            'unit' => '°C'
        ],
        'humidity' => [
            'min' => self::STORAGE_HUMIDITY_MIN,
            'max' => self::STORAGE_HUMIDITY_MAX,
            'unit' => '%'
        ],
        'ventilation' => 'adequate',
        'pest_control' => 'required',
        'moisture_protection' => 'essential',
    ];

    // Shelf Life (days)
    public const SHELF_LIFE = [
        'starter' => 90,
        'grower' => 120,
        'finisher' => 120,
        'layer' => 180,
        'breeder' => 90,
        'supplement' => 365,
        'medication' => 730,
    ];

    // Quality Thresholds
    public const WASTE_PERCENTAGE_THRESHOLDS = [
        'excellent' => 2,
        'good' => 5,
        'acceptable' => 10,
        'poor' => 15,
    ];

    public const INVENTORY_TURNOVER_THRESHOLDS = [
        'excellent' => 12, // times per year
        'good' => 8,
        'acceptable' => 6,
        'poor' => 4,
    ];

    // Calculation Constants
    public const GRAMS_TO_KG = 1000;
    public const DAYS_PER_WEEK = 7;
    public const WEEKS_PER_MONTH = 4.33;
    public const DAYS_PER_MONTH = 30.4;
    public const DAYS_PER_YEAR = 365.25;

    // Cost Calculation
    public const COST_MARKUP_PERCENTAGE = 15; // Default markup on feed cost
    public const DELIVERY_COST_PER_KG = 0.05; // Default delivery cost
    public const HANDLING_COST_PERCENTAGE = 5; // Handling cost percentage

    // Reorder Calculations
    public const SAFETY_STOCK_DAYS = 7; // Days of safety stock
    public const LEAD_TIME_BUFFER_DAYS = 3; // Extra buffer for lead time
    public const REORDER_QUANTITY_MULTIPLIER = 1.2; // 20% extra for reorder

    // Alert Thresholds
    public const LOW_STOCK_THRESHOLD_DAYS = 7; // Days remaining
    public const EXPIRY_WARNING_DAYS = 14; // Days before expiry
    public const CRITICAL_EXPIRY_DAYS = 3; // Critical expiry warning

    // Performance Benchmarks
    public const DELIVERY_PERFORMANCE_THRESHOLDS = [
        'excellent' => -2, // 2+ days early
        'good' => 0,       // On time
        'acceptable' => 2,  // Up to 2 days late
        'poor' => 7,       // Up to 7 days late
    ];

    public const SUPPLIER_RATING_WEIGHTS = [
        'delivery_performance' => 0.4,
        'completion_rate' => 0.3,
        'payment_reliability' => 0.2,
        'price_competitiveness' => 0.1,
    ];

    // Data Validation
    public const MAX_DAILY_CONSUMPTION_PER_BIRD_GRAMS = 200;
    public const MIN_DAILY_CONSUMPTION_PER_BIRD_GRAMS = 5;
    public const MAX_FEED_CONVERSION_RATIO = 5.0;
    public const MIN_FEED_CONVERSION_RATIO = 1.0;
    public const MAX_FEEDING_FREQUENCY = 12;
    public const MIN_FEEDING_FREQUENCY = 1;

    // File Upload Limits
    public const MAX_UPLOAD_SIZE_MB = 10;
    public const ALLOWED_FILE_TYPES = ['xlsx', 'xls', 'csv'];

    // Reporting Periods
    public const REPORTING_PERIODS = [
        'daily' => 1,
        'weekly' => 7,
        'monthly' => 30,
        'quarterly' => 90,
        'yearly' => 365,
    ];

    /**
     * Get consumption multiplier for given age
     */
    public static function getConsumptionMultiplier(int $ageDays): float
    {
        $multipliers = self::AGE_CONSUMPTION_MULTIPLIERS;

        // Find the appropriate multiplier for the age
        $lastMultiplier = 1.8; // Default for older birds
        foreach ($multipliers as $maxAge => $multiplier) {
            if ($ageDays <= $maxAge) {
                return $multiplier;
            }
            $lastMultiplier = $multiplier;
        }

        return $lastMultiplier;
    }

    /**
     * Get feeding times for given frequency
     */
    public static function getFeedingTimes(int $frequency): array
    {
        return self::FEEDING_TIMES[$frequency] ?? self::generateFeedingTimes($frequency);
    }

    /**
     * Generate feeding times for custom frequency
     */
    private static function generateFeedingTimes(int $frequency): array
    {
        if ($frequency <= 0 || $frequency > 12) {
            return ['08:00']; // Default single feeding
        }

        $times = [];
        $startHour = 6; // 6 AM
        $endHour = 20; // 8 PM
        $interval = ($endHour - $startHour) / max(1, $frequency - 1);

        for ($i = 0; $i < $frequency; $i++) {
            $hour = $startHour + ($i * $interval);
            $times[] = sprintf('%02d:00', min(23, max(0, (int)$hour)));
        }

        return $times;
    }

    /**
     * Get nutritional requirements for feed category
     */
    public static function getNutritionalRequirements(string $category): array
    {
        return [
            'protein' => self::PROTEIN_REQUIREMENTS[$category] ?? ['min' => 16, 'max' => 20],
            'energy' => self::ENERGY_REQUIREMENTS[$category] ?? ['min' => 2800, 'max' => 3000],
            'calcium' => self::CALCIUM_REQUIREMENTS[$category] ?? ['min' => 0.8, 'max' => 1.0],
            'phosphorus' => self::PHOSPHORUS_REQUIREMENTS[$category] ?? ['min' => 0.3, 'max' => 0.5],
        ];
    }

    /**
     * Calculate reorder level
     */
    public static function calculateReorderLevel(float $dailyConsumption, int $leadTimeDays): float
    {
        $safetyStock = $dailyConsumption * self::SAFETY_STOCK_DAYS;
        $leadTimeStock = $dailyConsumption * ($leadTimeDays + self::LEAD_TIME_BUFFER_DAYS);

        return $safetyStock + $leadTimeStock;
    }

    /**
     * Calculate reorder quantity
     */
    public static function calculateReorderQuantity(float $dailyConsumption, int $orderCycleDays): float
    {
        $baseQuantity = $dailyConsumption * $orderCycleDays;
        return $baseQuantity * self::REORDER_QUANTITY_MULTIPLIER;
    }

    /**
     * Get waste percentage rating
     */
    public static function getWasteRating(float $wastePercentage): string
    {
        $thresholds = self::WASTE_PERCENTAGE_THRESHOLDS;

        if ($wastePercentage <= $thresholds['excellent']) return 'excellent';
        if ($wastePercentage <= $thresholds['good']) return 'good';
        if ($wastePercentage <= $thresholds['acceptable']) return 'acceptable';
        return 'poor';
    }

    /**
     * Get feed conversion ratio rating
     */
    public static function getFCRRating(float $fcr): string
    {
        if ($fcr <= self::EXCELLENT_FCR_THRESHOLD) return 'excellent';
        if ($fcr <= self::GOOD_FCR_THRESHOLD) return 'good';
        if ($fcr <= self::ACCEPTABLE_FCR_THRESHOLD) return 'acceptable';
        if ($fcr <= self::POOR_FCR_THRESHOLD) return 'poor';
        return 'very_poor';
    }

    /**
     * Validate nutritional data
     */
    public static function validateNutritionalData(array $data, string $category): array
    {
        $requirements = self::getNutritionalRequirements($category);
        $errors = [];

        foreach ($requirements as $nutrient => $range) {
            $value = $data[$nutrient] ?? null;
            if ($value === null) {
                $errors[] = "Missing {$nutrient} value";
                continue;
            }

            if ($value < $range['min'] || $value > $range['max']) {
                $errors[] = "{$nutrient} value {$value} is outside acceptable range ({$range['min']}-{$range['max']})";
            }
        }

        return $errors;
    }
}
