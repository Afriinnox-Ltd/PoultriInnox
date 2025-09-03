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
        if ($this->initial_count === 0) {
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

        return now()->diffInDays($this->start_date);
    }

    /**
     * Calculate ROI percentage
     */
    public function getROI(): float
    {
        $totalCosts = $this->getTotalCosts();
        if ($totalCosts === 0) {
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
        if ($this->initial_count === 0) {
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
        if ($this->current_count === 0 || !$this->current_weight) {
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
        if ($ageInDays === 0) {
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
}
