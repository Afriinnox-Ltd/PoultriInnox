<?php

namespace App\Modules\FeedManagement\Models;

use App\Models\User;
use App\Models\Schedule;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeedProgram extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'version',
        'breed_type',
        'specific_breed',
        'target_batch_size_min',
        'target_batch_size_max',
        'program_data',
        'expected_fcr',
        'expected_survival_rate',
        'total_duration_days',
        'estimated_cost_per_bird',
        'status',
        'is_default',
        'is_template',
        'requires_approval',
        'usage_count',
        'success_rate',
        'performance_metrics',
        'source',
        'source_file',
        'created_by',
        'approved_by',
        'approved_at'
    ];

    protected $casts = [
        'program_data' => 'array',
        'performance_metrics' => 'array',
        'is_default' => 'boolean',
        'is_template' => 'boolean',
        'requires_approval' => 'boolean',
        'expected_fcr' => 'decimal:2',
        'expected_survival_rate' => 'decimal:2',
        'estimated_cost_per_bird' => 'decimal:2',
        'success_rate' => 'decimal:2',
        'approved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Feed type associated with this program
     */
    public function feedType(): BelongsTo
    {
        return $this->belongsTo(FeedType::class);
    }

    /**
     * Batch schedules using this feed program
     */
    public function batchSchedules(): HasMany
    {
        return $this->hasMany(Schedule::class, 'feed_program_id');
    }

    /**
     * User who created this feed program
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * User who last updated this feed program
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Check if program is suitable for given bird age
     */
    public function isSuitableForAge(int $ageDays): bool
    {
        return $ageDays >= $this->start_age_days &&
               $ageDays <= $this->end_age_days;
    }

    /**
     * Calculate daily feed requirement for given number of birds
     */
    public function calculateDailyRequirement(int $birdCount): float
    {
        return ($this->daily_quantity_per_bird_grams * $birdCount) / 1000; // Convert to kg
    }

    /**
     * Calculate daily cost for given number of birds
     */
    public function calculateDailyCost(int $birdCount): float
    {
        return $this->cost_per_bird_per_day * $birdCount;
    }

    /**
     * Get feeding schedule for a day
     */
    public function getDailyFeedingSchedule(): array
    {
        $totalDaily = $this->daily_quantity_per_bird_grams;
        $frequency = $this->feeding_frequency;
        $times = $this->feeding_times ?? [];

        if (empty($times)) {
            // Generate default feeding times based on frequency
            $times = $this->generateDefaultFeedingTimes($frequency);
        }

        $quantityPerFeeding = $totalDaily / $frequency;

        return array_map(function ($time) use ($quantityPerFeeding) {
            return [
                'time' => $time,
                'quantity_per_bird_grams' => $quantityPerFeeding,
                'instructions' => $this->getInstructionsForTime($time)
            ];
        }, $times);
    }

    /**
     * Generate default feeding times based on frequency
     */
    private function generateDefaultFeedingTimes(int $frequency): array
    {
        $times = [];
        $startHour = 6; // Start at 6 AM
        $endHour = 18; // End at 6 PM
        $interval = ($endHour - $startHour) / ($frequency - 1);

        for ($i = 0; $i < $frequency; $i++) {
            $hour = $startHour + ($i * $interval);
            $times[] = sprintf('%02d:00', (int)$hour);
        }

        return $times;
    }

    /**
     * Get specific instructions for a feeding time
     */
    private function getInstructionsForTime(string $time): array
    {
        $instructions = $this->special_instructions ?? [];

        // Check if there are time-specific instructions
        foreach ($instructions as $instruction) {
            if (isset($instruction['time']) && $instruction['time'] === $time) {
                return $instruction['notes'] ?? [];
            }
        }

        // Return general instructions
        return $instructions['general'] ?? [];
    }

    /**
     * Get program performance metrics
     */
    public function getPerformanceMetrics(): array
    {
        $schedules = $this->batchSchedules()
            ->with('batch')
            ->where('completed_at', '!=', null)
            ->where('created_at', '>=', now()->subMonths(3))
            ->get();

        $totalBirds = $schedules->sum(function ($schedule) {
            return $schedule->batch?->current_bird_count ?? 0;
        });

        $totalFeedUsed = $schedules->whereNotNull('actual_quantity')->sum('actual_quantity');
        $avgFeedConversion = $schedules->whereNotNull('feed_data')->avg(function ($schedule) {
            return $schedule->feed_data['feed_conversion_actual'] ?? null;
        });

        return [
            'total_birds_fed' => $totalBirds,
            'total_feed_consumed_kg' => $totalFeedUsed,
            'average_feed_conversion' => $avgFeedConversion,
            'target_feed_conversion' => $this->feed_conversion_target,
            'feed_conversion_efficiency' => $avgFeedConversion ?
                (($this->feed_conversion_target / $avgFeedConversion) * 100) : 0,
            'cost_efficiency' => $totalBirds > 0 ? $totalFeedUsed * $this->feedType->price_per_kg / $totalBirds : 0,
            'schedules_completed' => $schedules->count()
        ];
    }

    /**
     * Get age-appropriate program recommendations
     */
    public function getAgeRecommendations(int $ageDays): array
    {
        $recommendations = [];

        // Adjust feeding frequency based on age
        if ($ageDays <= 7) {
            $recommendations['feeding_frequency'] = max($this->feeding_frequency, 6);
            $recommendations['special_care'] = ['Monitor closely for first week', 'Ensure water access'];
        } elseif ($ageDays <= 21) {
            $recommendations['feeding_frequency'] = max($this->feeding_frequency, 4);
            $recommendations['special_care'] = ['Growth phase - critical period'];
        } else {
            $recommendations['feeding_frequency'] = $this->feeding_frequency;
            $recommendations['special_care'] = ['Standard feeding protocol'];
        }

        // Adjust quantity based on expected growth
        $growthMultiplier = 1 + (($ageDays - $this->start_age_days) / ($this->end_age_days - $this->start_age_days)) * 0.5;
        $recommendations['adjusted_quantity'] = $this->daily_quantity_per_bird_grams * $growthMultiplier;

        return $recommendations;
    }

    /**
     * Validate program data integrity
     */
    public function validateProgramData(): array
    {
        $errors = [];

        if ($this->start_age_days >= $this->end_age_days) {
            $errors[] = 'Start age must be less than end age';
        }

        if ($this->daily_quantity_per_bird_grams <= 0) {
            $errors[] = 'Daily quantity must be positive';
        }

        if ($this->feeding_frequency <= 0 || $this->feeding_frequency > 24) {
            $errors[] = 'Feeding frequency must be between 1 and 24';
        }

        if (!empty($this->feeding_times) && count($this->feeding_times) !== $this->feeding_frequency) {
            $errors[] = 'Number of feeding times must match feeding frequency';
        }

        return $errors;
    }

    /**
     * Scope for active programs
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for programs suitable for age range
     */
    public function scopeForAge($query, int $ageDays)
    {
        return $query->where('start_age_days', '<=', $ageDays)
                    ->where('end_age_days', '>=', $ageDays);
    }

    /**
     * Scope for programs by bird type
     */
    public function scopeForBirdType($query, string $birdType)
    {
        return $query->where('target_bird_type', $birdType);
    }
}
