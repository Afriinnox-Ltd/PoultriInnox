<?php

namespace App\Modules\FeedManagement\Models;

use App\Models\User;
use App\Models\Schedule;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeedConsumption extends Model
{
    use HasFactory;

    protected $fillable = [
        'feed_inventory_id',
        'feed_type_id',
        'batch_id',
        'schedule_id',
        'quantity_kg',
        'cost_per_kg',
        'total_cost',
        'consumption_date',
        'consumption_time',
        'bird_count',
        'bird_age_days',
        'consumption_method',
        'weather_conditions',
        'consumption_data',
        'actual_waste_kg',
        'feed_conversion_actual',
        'notes',
        'recorded_by',
        'verified_by',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'consumption_date' => 'date',
        'consumption_time' => 'datetime',
        'quantity_kg' => 'decimal:2',
        'cost_per_kg' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'actual_waste_kg' => 'decimal:2',
        'feed_conversion_actual' => 'decimal:3',
        'consumption_data' => 'array',
        'weather_conditions' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    /**
     * Feed inventory record for this consumption
     */
    public function feedInventory(): BelongsTo
    {
        return $this->belongsTo(FeedInventory::class);
    }

    /**
     * Feed type for this consumption
     */
    public function feedType(): BelongsTo
    {
        return $this->belongsTo(FeedType::class);
    }

    /**
     * Batch that consumed this feed
     */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(\App\Modules\BatchIncubator\Models\Batch::class, 'batch_id');
    }

    /**
     * Schedule that triggered this consumption
     */
    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }

    /**
     * User who recorded this consumption
     */
    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    /**
     * User who verified this consumption
     */
    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * User who created this record
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * User who last updated this record
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Calculate feed per bird
     */
    public function getFeedPerBird(): float
    {
        return $this->bird_count > 0 ? $this->quantity_kg / $this->bird_count : 0;
    }

    /**
     * Calculate feed per bird in grams
     */
    public function getFeedPerBirdGrams(): float
    {
        return $this->getFeedPerBird() * 1000;
    }

    /**
     * Calculate actual waste percentage
     */
    public function getWastePercentage(): float
    {
        return $this->quantity_kg > 0 ? ($this->actual_waste_kg / $this->quantity_kg) * 100 : 0;
    }

    /**
     * Calculate effective consumption (excluding waste)
     */
    public function getEffectiveConsumption(): float
    {
        return $this->quantity_kg - ($this->actual_waste_kg ?? 0);
    }

    /**
     * Calculate cost efficiency per bird
     */
    public function getCostPerBird(): float
    {
        return $this->bird_count > 0 ? $this->total_cost / $this->bird_count : 0;
    }

    /**
     * Get feed conversion efficiency rating
     */
    public function getFeedConversionRating(): string
    {
        if (!$this->feed_conversion_actual) {
            return 'not_calculated';
        }

        $expectedFcr = $this->feedType->feed_conversion_ratio ?? 2.0;
        $variance = (($this->feed_conversion_actual - $expectedFcr) / $expectedFcr) * 100;

        if ($variance <= -10) return 'excellent';
        if ($variance <= -5) return 'very_good';
        if ($variance <= 5) return 'good';
        if ($variance <= 15) return 'acceptable';
        return 'poor';
    }

    /**
     * Get consumption efficiency metrics
     */
    public function getEfficiencyMetrics(): array
    {
        return [
            'feed_per_bird_kg' => $this->getFeedPerBird(),
            'feed_per_bird_grams' => $this->getFeedPerBirdGrams(),
            'waste_percentage' => $this->getWastePercentage(),
            'effective_consumption_kg' => $this->getEffectiveConsumption(),
            'cost_per_bird' => $this->getCostPerBird(),
            'feed_conversion_actual' => $this->feed_conversion_actual,
            'feed_conversion_rating' => $this->getFeedConversionRating(),
            'consumption_per_day_kg' => $this->quantity_kg, // Daily consumption for this record
        ];
    }

    /**
     * Get environmental impact data
     */
    public function getEnvironmentalData(): array
    {
        $weatherConditions = $this->weather_conditions ?? [];
        $consumptionData = $this->consumption_data ?? [];

        return [
            'temperature' => $weatherConditions['temperature'] ?? null,
            'humidity' => $weatherConditions['humidity'] ?? null,
            'weather_condition' => $weatherConditions['condition'] ?? null,
            'feeding_behavior' => $consumptionData['bird_behavior'] ?? null,
            'appetite_level' => $consumptionData['appetite_level'] ?? null,
            'feeding_duration_minutes' => $consumptionData['feeding_duration'] ?? null,
            'feeder_utilization' => $consumptionData['feeder_utilization'] ?? null
        ];
    }

    /**
     * Check if consumption was within expected range
     */
    public function isWithinExpectedRange(): bool
    {
        if (!$this->bird_count || !$this->bird_age_days) {
            return true; // Cannot validate without data
        }

        $expectedDaily = $this->feedType->consumption_rate_per_bird_grams ?? 50;
        $actualPerBird = $this->getFeedPerBirdGrams();

        // Allow 20% variance
        $tolerance = 0.2;
        $lowerBound = $expectedDaily * (1 - $tolerance);
        $upperBound = $expectedDaily * (1 + $tolerance);

        return $actualPerBird >= $lowerBound && $actualPerBird <= $upperBound;
    }

    /**
     * Get consumption analysis
     */
    public function getConsumptionAnalysis(): array
    {
        $analysis = [
            'within_expected_range' => $this->isWithinExpectedRange(),
            'efficiency_metrics' => $this->getEfficiencyMetrics(),
            'environmental_data' => $this->getEnvironmentalData(),
            'quality_indicators' => []
        ];

        // Add quality indicators
        if ($this->getWastePercentage() > 10) {
            $analysis['quality_indicators'][] = 'high_waste';
        }

        if ($this->feed_conversion_actual && $this->feed_conversion_actual > 2.5) {
            $analysis['quality_indicators'][] = 'poor_conversion';
        }

        $envData = $this->getEnvironmentalData();
        if (isset($envData['appetite_level']) && $envData['appetite_level'] === 'poor') {
            $analysis['quality_indicators'][] = 'poor_appetite';
        }

        return $analysis;
    }

    /**
     * Verify consumption record
     */
    public function verify(int $verifiedBy, ?string $notes = null): bool
    {
        $this->verified_by = $verifiedBy;
        $this->notes = $notes ? ($this->notes . "\nVerified: " . $notes) : $this->notes;

        return $this->save();
    }

    /**
     * Get batch performance impact
     */
    public function getBatchPerformanceImpact(): array
    {
        if (!$this->batch) {
            return [];
        }

        // Get other consumptions for the same batch around this date
        $relatedConsumptions = self::where('batch_id', $this->batch_id)
            ->where('consumption_date', '>=', $this->consumption_date->subDays(3))
            ->where('consumption_date', '<=', $this->consumption_date->addDays(3))
            ->get();

        $avgFeedConversion = $relatedConsumptions->avg('feed_conversion_actual');
        $avgWaste = $relatedConsumptions->avg('actual_waste_kg');
        $totalCost = $relatedConsumptions->sum('total_cost');

        return [
            'related_consumptions_count' => $relatedConsumptions->count(),
            'average_feed_conversion' => $avgFeedConversion,
            'average_waste_kg' => $avgWaste,
            'total_feed_cost' => $totalCost,
            'performance_trend' => $this->calculatePerformanceTrend($relatedConsumptions)
        ];
    }

    /**
     * Calculate performance trend
     */
    private function calculatePerformanceTrend($consumptions): string
    {
        if ($consumptions->count() < 2) {
            return 'insufficient_data';
        }

        $sorted = $consumptions->sortBy('consumption_date');
        $first = $sorted->first();
        $last = $sorted->last();

        if (!$first->feed_conversion_actual || !$last->feed_conversion_actual) {
            return 'no_conversion_data';
        }

        $improvement = (($first->feed_conversion_actual - $last->feed_conversion_actual) / $first->feed_conversion_actual) * 100;

        if ($improvement > 5) return 'improving';
        if ($improvement < -5) return 'declining';
        return 'stable';
    }

    /**
     * Scope for consumption by date range
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('consumption_date', [$startDate, $endDate]);
    }

    /**
     * Scope for consumption by batch
     */
    public function scopeForBatch($query, $batchId)
    {
        return $query->where('batch_id', $batchId);
    }

    /**
     * Scope for consumption by feed type
     */
    public function scopeForFeedType($query, $feedTypeId)
    {
        return $query->where('feed_type_id', $feedTypeId);
    }

    /**
     * Scope for verified consumption records
     */
    public function scopeVerified($query)
    {
        return $query->whereNotNull('verified_by');
    }

    /**
     * Scope for unverified consumption records
     */
    public function scopeUnverified($query)
    {
        return $query->whereNull('verified_by');
    }

    /**
     * Scope for high waste consumption
     */
    public function scopeHighWaste($query, float $wasteThreshold = 10.0)
    {
        return $query->whereRaw('(actual_waste_kg / quantity_kg) * 100 > ?', [$wasteThreshold]);
    }

    /**
     * Scope for poor feed conversion
     */
    public function scopePoorConversion($query, float $conversionThreshold = 2.5)
    {
        return $query->where('feed_conversion_actual', '>', $conversionThreshold);
    }
}
