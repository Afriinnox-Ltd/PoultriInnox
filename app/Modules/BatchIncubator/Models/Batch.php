<?php

namespace App\Modules\BatchIncubator\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Modules\BatchIncubator\Enums\BatchStatus;
use App\Modules\BatchIncubator\Traits\HasBasicUserAccess;
use App\Models\User;

/**
 * Batch Model
 *
 * Represents a group of chickens/eggs being managed together
 *
 * @property int $id
 * @property string $batch_code
 * @property string $name
 * @property string|null $description
 * @property string|null $breed
 * @property int $initial_count
 * @property int $current_count
 * @property float|null $initial_weight
 * @property float|null $current_weight
 * @property BatchStatus $status
 * @property \Carbon\Carbon|null $hatch_date
 * @property \Carbon\Carbon $start_date
 * @property \Carbon\Carbon|null $expected_completion_date
 * @property \Carbon\Carbon|null $actual_completion_date
 * @property int|null $incubator_id
 * @property \Carbon\Carbon|null $incubator_assigned_at
 * @property float|null $avg_temperature
 * @property float|null $avg_humidity
 * @property int $mortality_count
 * @property float $mortality_rate
 * @property int $cull_count
 * @property int $total_eggs_produced
 * @property float $avg_daily_production
 * @property float $initial_cost
 * @property float $feed_cost
 * @property float $medication_cost
 * @property float $other_costs
 * @property float $revenue
 * @property array|null $batch_data
 * @property array|null $performance_metrics
 * @property int $manager_id
 * @property array|null $authorized_users
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 */
class Batch extends Model
{
    use HasFactory, HasBasicUserAccess;

    protected $fillable = [
        'batch_code',
        'name',
        'description',
        'breed',
        'initial_count',
        'current_count',
        'initial_weight',
        'current_weight',
        'status',
        'hatch_date',
        'start_date',
        'expected_completion_date',
        'actual_completion_date',
        'incubator_id',
        'incubator_assigned_at',
        'avg_temperature',
        'avg_humidity',
        'mortality_count',
        'mortality_rate',
        'cull_count',
        'total_eggs_produced',
        'avg_daily_production',
        'initial_cost',
        'feed_cost',
        'medication_cost',
        'other_costs',
        'revenue',
        'batch_data',
        'performance_metrics',
        'manager_id',
        'authorized_users',
    ];

    protected $casts = [
        'status' => BatchStatus::class,
        'hatch_date' => 'date',
        'start_date' => 'date',
        'expected_completion_date' => 'date',
        'actual_completion_date' => 'date',
        'incubator_assigned_at' => 'datetime',
        'initial_weight' => 'decimal:2',
        'current_weight' => 'decimal:2',
        'avg_temperature' => 'decimal:2',
        'avg_humidity' => 'decimal:2',
        'mortality_rate' => 'decimal:2',
        'avg_daily_production' => 'decimal:2',
        'initial_cost' => 'decimal:2',
        'feed_cost' => 'decimal:2',
        'medication_cost' => 'decimal:2',
        'other_costs' => 'decimal:2',
        'revenue' => 'decimal:2',
        'batch_data' => 'array',
        'performance_metrics' => 'array',
        'authorized_users' => 'array',
    ];

    /**
     * The accessors to append to the model's array form.
     */
    protected $appends = [
        'total_cost',
        'profit_loss',
        'survival_rate',
        'age_days',
    ];

    /**
     * Get the manager of the batch
     */
    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    /**
     * Get the assigned incubator
     */
    public function incubator(): BelongsTo
    {
        return $this->belongsTo(Incubator::class);
    }

    /**
     * Get all events for this batch
     */
    public function events(): HasMany
    {
        return $this->hasMany(BatchEvent::class);
    }

    /**
     * Get all schedules for this batch
     */
    public function schedules(): HasMany
    {
        return $this->hasMany(BatchSchedule::class);
    }

    /**
     * Get all feed consumption records for this batch
     */
    public function feedConsumptions(): HasMany
    {
        return $this->hasMany(\App\Modules\FeedManagement\Models\FeedConsumption::class, 'batch_id');
    }

    /**
     * Get all applied medications for this batch
     */
    public function appliedMedications(): HasMany
    {
        return $this->hasMany(AppliedMedication::class);
    }

    /**
     * Get all applied vaccinations for this batch
     */
    public function appliedVaccinations(): HasMany
    {
        return $this->hasMany(AppliedVaccination::class);
    }

    /**
     * Dismissed recommendations for this batch
     */
    public function dismissedRecommendations(): HasMany
    {
        return $this->hasMany(DismissedRecommendation::class);
    }

    /**
     * Scope to get only active batches
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', [
            BatchStatus::INCUBATING,
            BatchStatus::HATCHING,
            BatchStatus::BROODING,
            BatchStatus::GROWING,
            BatchStatus::LAYING
        ]);
    }

    /**
     * Generate unique batch code
     */
    public static function generateBatchCode(): string
    {
        $prefix = 'BTH';
        $timestamp = now()->format('YmdHi');
        $random = strtoupper(substr(md5(uniqid()), 0, 4));

        return "{$prefix}-{$timestamp}-{$random}";
    }

    /**
     * Get batch age in days
     */
    public function getAgeInDays(): int
    {
        return $this->start_date->diffInDays(now());
    }

    /**
     * Calculate total costs
     */
    public function getTotalCosts(): float
    {
        return $this->initial_cost + $this->feed_cost + $this->medication_cost + $this->other_costs;
    }

    /**
     * Get the total cost attribute
     */
    public function getTotalCostAttribute(): float
    {
        return $this->getTotalCosts();
    }

    /**
     * Calculate profit/loss
     */
    public function getProfit(): float
    {
        return $this->revenue - $this->getTotalCosts();
    }

    /**
     * Get the profit/loss attribute
     */
    public function getProfitLossAttribute(): float
    {
        return $this->getProfit();
    }

    /**
     * Get the survival rate attribute
     */
    public function getSurvivalRateAttribute(): float
    {
        if ($this->initial_count== 0) {
            return 0;
        }

        return round((($this->initial_count - ($this->mortality_count ?? 0)) / ($this->initial_count ?? 1)) * 100, 2);
    }

    /**
     * Get the age in days attribute
     */
    public function getAgeDaysAttribute(): int
    {
        if (!$this->start_date) {
            return 0;
        }

        return $this->start_date->diffInDays(now());
    }

    /**
     * Calculate ROI percentage
     */
    public function getROI(): float
    {
        $totalCosts = $this->getTotalCosts();
        if ($totalCosts== 0) {
            return 0;
        }

        return round(($this->getProfit() / $totalCosts) * 100, 2);
    }

    /**
     * Update mortality statistics
     */
    public function recordMortality(int $count, string $cause = null): void
    {
        $this->increment('mortality_count', $count);
        $this->decrement('current_count', $count);

        $this->update([
            'mortality_rate' => $this->calculateMortalityRate()
        ]);
    }

    /**
     * Calculate mortality rate
     */
    private function calculateMortalityRate(): float
    {
        if ($this->initial_count== 0) {
            return 0;
        }

        return round(($this->mortality_count / $this->initial_count) * 100, 2);
    }

    /**
     * Update weight tracking
     */
    public function updateWeight(float $newWeight): void
    {
        $this->update(['current_weight' => $newWeight]);
    }

    /**
     * Calculate average weight per bird
     */
    public function getAverageWeightPerBird(): float
    {
        if ($this->current_count== 0 || !$this->current_weight) {
            return 0;
        }

        return round($this->current_weight / $this->current_count, 2);
    }

    /**
     * Calculate weight gain
     */
    public function getWeightGain(): float
    {
        if (!$this->initial_weight || !$this->current_weight) {
            return 0;
        }

        return round($this->current_weight - $this->initial_weight, 2);
    }

    /**
     * Calculate daily weight gain
     */
    public function getDailyWeightGain(): float
    {
        $ageInDays = $this->getAgeInDays();
        if ($ageInDays== 0) {
            return 0;
        }

        return round($this->getWeightGain() / $ageInDays, 2);
    }

    /**
     * Check if batch is active
     */
    public function isActive(): bool
    {
        return $this->status->isActive();
    }

    /**
     * Move to next lifecycle stage
     */
    public function moveToNextStage(): bool
    {
        $nextStatus = match($this->status) {
            BatchStatus::PLANNED => BatchStatus::INCUBATING,
            BatchStatus::INCUBATING => BatchStatus::HATCHING,
            BatchStatus::HATCHING => BatchStatus::BROODING,
            BatchStatus::BROODING => BatchStatus::GROWING,
            BatchStatus::GROWING => BatchStatus::LAYING,
            default => null
        };

        if ($nextStatus) {
            $this->update(['status' => $nextStatus]);
            return true;
        }

        return false;
    }

    /**
     * Complete the batch
     */
    public function complete(): void
    {
        $this->update([
            'status' => BatchStatus::COMPLETED,
            'actual_completion_date' => now(),
        ]);
    }

    /**
     * Terminate the batch
     */
    public function terminate(): void
    {
        $this->update([
            'status' => BatchStatus::TERMINATED,
            'actual_completion_date' => now(),
        ]);
    }

    /**
     * Get performance score based on various metrics
     */
    public function getPerformanceScore(): float
    {
        $survivalRate = $this->survival_rate;
        $weightGain = $this->getDailyWeightGain();
        $roi = max(0, min(100, $this->getROI())); // Cap ROI at 100% for scoring

        // Weighted score: 40% survival, 30% growth, 30% profitability
        $score = ($survivalRate * 0.4) + ($weightGain * 0.3) + ($roi * 0.3);

        return round(min(100, $score), 2);
    }

    /**
     * Calculate total feed cost from actual consumption records
     */
    public function calculateActualFeedCost(): float
    {
        return $this->feedConsumptions()->sum('total_feed_cost') ?? 0;
    }

    /**
     * Calculate total feed consumed in kg
     */
    public function getTotalFeedConsumed(): float
    {
        return $this->feedConsumptions()->sum('actual_amount') ?? 0;
    }

    /**
     * Calculate average Feed Conversion Ratio (FCR)
     */
    public function getAverageFCR(): float
    {
        $avgFCR = $this->feedConsumptions()
            ->whereNotNull('fcr')
            ->avg('fcr');

        return round($avgFCR ?? 0, 3);
    }

    /**
     * Calculate cumulative Feed Conversion Ratio
     */
    public function getCumulativeFCR(): float
    {
        $totalFeedKg = $this->getTotalFeedConsumed();
        $weightGain = $this->getWeightGain();

        if ($weightGain <= 0) {
            return 0;
        }

        return round($totalFeedKg / $weightGain, 3);
    }

    /**
     * Get feed consumption statistics
     */
    public function getFeedConsumptionStats(): array
    {
        $consumptions = $this->feedConsumptions;

        if ($consumptions->isEmpty()) {
            return [
                'total_feed_consumed_kg' => 0,
                'total_feed_cost' => 0,
                'average_fcr' => 0,
                'cumulative_fcr' => 0,
                'feed_cost_per_bird' => 0,
                'consumption_records_count' => 0,
                'last_feeding_date' => null,
                'feed_efficiency_rating' => 'no_data'
            ];
        }

        $totalCost = $consumptions->sum('total_feed_cost');
        $feedCostPerBird = $this->current_count > 0 ? $totalCost / $this->current_count : 0;
        $avgFCR = $this->getAverageFCR();

        // Determine efficiency rating based on FCR
        $efficiencyRating = match(true) {
            $avgFCR <= 1.6 => 'excellent',
            $avgFCR <= 1.9 => 'very_good',
            $avgFCR <= 2.2 => 'good',
            $avgFCR <= 2.8 => 'acceptable',
            default => 'poor'
        };

        return [
            'total_feed_consumed_kg' => $this->getTotalFeedConsumed(),
            'total_feed_cost' => $totalCost,
            'average_fcr' => $avgFCR,
            'cumulative_fcr' => $this->getCumulativeFCR(),
            'feed_cost_per_bird' => round($feedCostPerBird, 2),
            'consumption_records_count' => $consumptions->count(),
            'last_feeding_date' => $consumptions->max('consumption_date'),
            'feed_efficiency_rating' => $efficiencyRating
        ];
    }

    /**
     * Get feed consumption variance analysis
     */
    public function getFeedVarianceAnalysis(): array
    {
        $consumptions = $this->feedConsumptions()
            ->whereNotNull('variance_percentage')
            ->get();

        if ($consumptions->isEmpty()) {
            return [
                'average_variance_percentage' => 0,
                'over_consumption_days' => 0,
                'under_consumption_days' => 0,
                'perfect_consumption_days' => 0,
                'variance_trend' => 'no_data'
            ];
        }

        $avgVariance = $consumptions->avg('variance_percentage');
        $overDays = $consumptions->where('variance_percentage', '>', 5)->count();
        $underDays = $consumptions->where('variance_percentage', '<', -5)->count();
        $perfectDays = $consumptions->whereBetween('variance_percentage', [-5, 5])->count();

        // Determine trend
        $recent = $consumptions->sortByDesc('consumption_date')->take(7);
        $older = $consumptions->sortByDesc('consumption_date')->slice(7, 7);

        $recentAvg = $recent->avg('variance_percentage');
        $olderAvg = $older->avg('variance_percentage');

        $trend = 'stable';
        if ($recent->count() >= 3 && $older->count() >= 3) {
            if ($recentAvg > $olderAvg + 2) {
                $trend = 'increasing_variance';
            } elseif ($recentAvg < $olderAvg - 2) {
                $trend = 'decreasing_variance';
            }
        }

        return [
            'average_variance_percentage' => round($avgVariance, 2),
            'over_consumption_days' => $overDays,
            'under_consumption_days' => $underDays,
            'perfect_consumption_days' => $perfectDays,
            'variance_trend' => $trend
        ];
    }

    /**
     * Update feed cost from actual consumption records
     */
    public function updateFeedCostFromConsumption(): void
    {
        $actualFeedCost = $this->calculateActualFeedCost();
        $this->update(['feed_cost' => $actualFeedCost]);
    }

    /**
     * Get comprehensive batch statistics including feed data
     */
    public function getComprehensiveStats(): array
    {
        $basicStats = [
            'batch_info' => [
                'id' => $this->id,
                'batch_code' => $this->batch_code,
                'name' => $this->name,
                'breed' => $this->breed,
                'status' => $this->status->value,
                'age_days' => $this->age_days,
                'start_date' => $this->start_date,
            ],
            'population' => [
                'initial_count' => $this->initial_count,
                'current_count' => $this->current_count,
                'mortality_count' => $this->mortality_count,
                'survival_rate' => $this->survival_rate,
                'mortality_rate' => $this->mortality_rate,
            ],
            'growth' => [
                'initial_weight' => $this->initial_weight,
                'current_weight' => $this->current_weight,
                'weight_gain' => $this->getWeightGain(),
                'daily_weight_gain' => $this->getDailyWeightGain(),
                'average_weight_per_bird' => $this->getAverageWeightPerBird(),
            ],
            'financial' => [
                'initial_cost' => $this->initial_cost,
                'feed_cost' => $this->feed_cost,
                'medication_cost' => $this->medication_cost,
                'other_costs' => $this->other_costs,
                'total_costs' => $this->total_cost,
                'revenue' => $this->revenue,
                'profit_loss' => $this->profit_loss,
                'roi_percentage' => $this->getROI(),
            ],
            'performance' => [
                'performance_score' => $this->getPerformanceScore(),
            ]
        ];

        // Add feed consumption statistics
        $basicStats['feed_consumption'] = $this->getFeedConsumptionStats();
        $basicStats['feed_variance'] = $this->getFeedVarianceAnalysis();

        return $basicStats;
    }
}
