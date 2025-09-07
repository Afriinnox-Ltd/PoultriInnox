<?php

namespace App\Modules\BatchIncubator\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;

class VaccinationProtocol extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'vaccine_name',
        'vaccine_type',
        'description',
        'target_breeds',
        'bird_type',
        'purpose',
        'min_age_days',
        'max_age_days',
        'prevents_disease',
        'priority_level',
        'is_mandatory',
        'is_seasonal',
        'dosage_per_bird',
        'dosage_unit',
        'administration_method',
        'administration_route',
        'vaccination_schedule',
        'requires_booster',
        'booster_interval_days',
        'immunity_duration_days',
        'storage_requirements',
        'preparation_instructions',
        'contraindications',
        'side_effects',
        'environmental_conditions',
        'cost_per_dose',
        'manufacturer',
        'supplier',
        'batch_number',
        'manufacture_date',
        'expiry_date',
        'usage_count',
        'effectiveness_rate',
        'efficacy_data',
        'status',
        'requires_cold_chain',
        'auto_recommend',
        'stock_alert_threshold',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'target_breeds' => 'array',
        'vaccination_schedule' => 'array',
        'contraindications' => 'array',
        'side_effects' => 'array',
        'storage_requirements' => 'array',
        'environmental_conditions' => 'array',
        'efficacy_data' => 'array',
        'manufacture_date' => 'date',
        'expiry_date' => 'date',
        'dosage_per_bird' => 'decimal:3',
        'cost_per_dose' => 'decimal:2',
        'effectiveness_rate' => 'decimal:2',
        'is_mandatory' => 'boolean',
        'is_seasonal' => 'boolean',
        'requires_booster' => 'boolean',
        'requires_cold_chain' => 'boolean',
        'auto_recommend' => 'boolean',
    ];

    /**
     * Get the user who created this protocol
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this protocol
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get applied vaccinations using this protocol
     */
    public function appliedVaccinations(): HasMany
    {
        return $this->hasMany(AppliedVaccination::class);
    }

    /**
     * Scope for active protocols
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for auto-recommendable protocols
     */
    public function scopeAutoRecommend($query)
    {
        return $query->where('auto_recommend', true)->where('status', 'active');
    }

    /**
     * Scope for mandatory vaccinations
     */
    public function scopeMandatory($query)
    {
        return $query->where('is_mandatory', true);
    }

    /**
     * Scope for critical priority vaccinations
     */
    public function scopeCritical($query)
    {
        return $query->where('priority_level', 'critical');
    }

    /**
     * Scope for specific bird type
     */
    public function scopeForBirdType($query, string $birdType)
    {
        return $query->where(function($q) use ($birdType) {
            $q->where('bird_type', $birdType)
              ->orWhere('bird_type', 'all');
        });
    }

    /**
     * Scope for specific purpose
     */
    public function scopeForPurpose($query, string $purpose)
    {
        return $query->where('purpose', $purpose);
    }

    /**
     * Scope for age range
     */
    public function scopeForAge($query, int $ageDays)
    {
        return $query->where('min_age_days', '<=', $ageDays)
                    ->where(function($q) use ($ageDays) {
                        $q->whereNull('max_age_days')
                          ->orWhere('max_age_days', '>=', $ageDays);
                    });
    }

    /**
     * Check if protocol applies to specific batch
     */
    public function appliesTo(Batch $batch): bool
    {
        // Check bird type - protocol must be for 'all' or any chicken-related type
        $validBirdTypes = ['all', 'chicken', 'broiler', 'layer', 'dual_purpose'];
        if (!in_array($this->bird_type, $validBirdTypes)) {
            return false;
        }

        // Check purpose
        if ($this->purpose && $this->purpose !== $batch->purpose) {
            return false;
        }

        // Check age range
        $batchAge = $batch->age_days;
        if ($batchAge < $this->min_age_days) {
            return false;
        }

        if ($this->max_age_days && $batchAge > $this->max_age_days) {
            return false;
        }

        // Check breed compatibility
        if ($this->target_breeds) {
            $batchBreedType = $this->getBirdTypeFromBreed($batch->breed);
            $targetBreeds = $this->target_breeds;

            // Check if batch breed matches any target breed or if 'all' is specified
            $breedMatch = in_array($batch->breed, $targetBreeds) ||
                         in_array('all', $targetBreeds) ||
                         in_array($batchBreedType, $targetBreeds);

            if (!$breedMatch) {
                return false;
            }
        }

        return true;
    }

    /**
     * Map specific breed names to general bird types
     */
    private function getBirdTypeFromBreed(string $breed): string
    {
        $breedMap = [
            // Broiler breeds
            'Ross 308' => 'broiler',
            'Cobb 500' => 'broiler',
            'Hubbard' => 'broiler',

            // Layer breeds
            'Leghorn' => 'layer',
            'Rhode Island Red' => 'layer',
            'ISA Brown' => 'layer',

            // Dual purpose
            'Plymouth Rock' => 'dual_purpose',
            'New Hampshire' => 'dual_purpose',
        ];

        return $breedMap[$breed] ?? 'chicken'; // Default to chicken if breed not found
    }

    /**
     * Calculate doses needed for batch
     */
    public function calculateDosesNeeded(Batch $batch): array
    {
        $totalDoses = $this->dosage_per_bird * $batch->current_count;
        $totalCost = $this->cost_per_dose ? $totalDoses * $this->cost_per_dose : 0;

        return [
            'total_doses' => $totalDoses,
            'per_bird_dose' => $this->dosage_per_bird,
            'unit' => $this->dosage_unit,
            'total_cost' => round($totalCost, 2),
            'administration_method' => $this->administration_method,
        ];
    }

    /**
     * Get vaccination schedule for specific batch age
     */
    public function getScheduleForAge(int $ageDays): ?array
    {
        if (!$this->vaccination_schedule || !isset($this->vaccination_schedule['vaccinations'])) {
            return null;
        }

        foreach ($this->vaccination_schedule['vaccinations'] as $vaccination) {
            if ($vaccination['age_days'] == $ageDays) {
                return $vaccination;
            }
        }

        return null;
    }

    /**
     * Check if batch has received this vaccination
     */
    public function hasBeenAppliedTo(Batch $batch): bool
    {
        return $this->appliedVaccinations()
            ->where('batch_id', $batch->id)
            ->exists();
    }

    /**
     * Get last vaccination date for batch
     */
    public function getLastVaccinationDate(Batch $batch): ?string
    {
        $lastVaccination = $this->appliedVaccinations()
            ->where('batch_id', $batch->id)
            ->orderBy('vaccinated_at', 'desc')
            ->first();

        return $lastVaccination ? $lastVaccination->vaccinated_at->format('Y-m-d') : null;
    }

    /**
     * Check if booster is due for batch
     */
    public function isBoosterDue(Batch $batch): bool
    {
        if (!$this->requires_booster || !$this->booster_interval_days) {
            return false;
        }

        $lastVaccination = $this->appliedVaccinations()
            ->where('batch_id', $batch->id)
            ->where('is_primary_vaccination', true)
            ->orderBy('vaccinated_at', 'desc')
            ->first();

        if (!$lastVaccination) {
            return false;
        }

        $boosterDue = $lastVaccination->vaccinated_at->addDays($this->booster_interval_days);
        return now() >= $boosterDue;
    }

    /**
     * Get effectiveness statistics
     */
    public function getEffectivenessStats(): array
    {
        $vaccinations = $this->appliedVaccinations()
            ->whereNotNull('effectiveness_rating')
            ->get();

        if ($vaccinations->isEmpty()) {
            return [
                'total_vaccinations' => 0,
                'average_effectiveness' => null,
                'success_rate' => null,
            ];
        }

        return [
            'total_vaccinations' => $vaccinations->count(),
            'average_effectiveness' => round($vaccinations->avg('effectiveness_rating'), 1),
            'success_rate' => round($vaccinations->where('effectiveness_rating', '>=', 8)->count() / $vaccinations->count() * 100, 1),
        ];
    }

    /**
     * Check if vaccine is expired
     */
    public function isExpired(): bool
    {
        return $this->expiry_date && $this->expiry_date < now();
    }

    /**
     * Check if vaccine is expiring soon (within 30 days)
     */
    public function isExpiringSoon(): bool
    {
        return $this->expiry_date && $this->expiry_date <= now()->addDays(30);
    }
}
