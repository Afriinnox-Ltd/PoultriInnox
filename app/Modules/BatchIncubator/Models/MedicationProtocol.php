<?php

namespace App\Modules\BatchIncubator\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;

class MedicationProtocol extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'medication_name',
        'medication_type',
        'description',
        'target_breeds',
        'bird_type',
        'purpose',
        'min_age_days',
        'max_age_days',
        'active_ingredient',
        'dosage_per_kg_body_weight',
        'dosage_per_bird',
        'dosage_unit',
        'administration_method',
        'treatment_duration_days',
        'application_schedule',
        'withdrawal_period_days',
        'contraindications',
        'precautions',
        'side_effects',
        'cost_per_unit',
        'supplier',
        'batch_number',
        'expiry_date',
        'usage_count',
        'success_rate',
        'effectiveness_data',
        'status',
        'requires_prescription',
        'is_emergency_protocol',
        'auto_recommend',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'target_breeds' => 'array',
        'application_schedule' => 'array',
        'contraindications' => 'array',
        'side_effects' => 'array',
        'effectiveness_data' => 'array',
        'expiry_date' => 'date',
        'dosage_per_kg_body_weight' => 'decimal:3',
        'dosage_per_bird' => 'decimal:3',
        'cost_per_unit' => 'decimal:2',
        'success_rate' => 'decimal:2',
        'requires_prescription' => 'boolean',
        'is_emergency_protocol' => 'boolean',
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
     * Get applied medications using this protocol
     */
    public function appliedMedications(): HasMany
    {
        return $this->hasMany(AppliedMedication::class);
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
        if ($this->purpose && $this->purpose != $batch->purpose) {
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
     * Calculate dosage for specific batch
     */
    public function calculateDosage(Batch $batch): array
    {
        $totalDosage = 0;
        $perBirdDosage = 0;

        if ($this->dosage_per_bird) {
            $perBirdDosage = $this->dosage_per_bird;
            $totalDosage = $perBirdDosage * $batch->current_count;
        } elseif ($this->dosage_per_kg_body_weight && $batch->current_weight) {
            $totalWeightKg = $batch->current_weight / 1000; // Convert grams to kg
            $totalDosage = $this->dosage_per_kg_body_weight * $totalWeightKg;
            $perBirdDosage = $totalDosage / $batch->current_count;
        }

        return [
            'total_dosage' => round($totalDosage, 3),
            'per_bird_dosage' => round($perBirdDosage, 3),
            'unit' => $this->dosage_unit,
            'administration_method' => $this->administration_method,
            'treatment_duration' => $this->treatment_duration_days,
        ];
    }

    /**
     * Get schedule for specific batch age
     */
    public function getScheduleForAge(int $ageDays): ?array
    {
        if (!$this->application_schedule || !isset($this->application_schedule['applications'])) {
            return null;
        }

        foreach ($this->application_schedule['applications'] as $application) {
            if ($application['age_days'] == $ageDays) {
                return $application;
            }
        }

        return null;
    }

    /**
     * Check if medication is currently within withdrawal period
     */
    public function isInWithdrawalPeriod(Batch $batch): bool
    {
        if ($this->withdrawal_period_days == 0) {
            return false;
        }

        $lastApplication = $this->appliedMedications()
            ->where('batch_id', $batch->id)
            ->orderBy('applied_at', 'desc')
            ->first();

        if (!$lastApplication) {
            return false;
        }

        $withdrawalEnds = $lastApplication->applied_at->addDays($this->withdrawal_period_days);
        return now() < $withdrawalEnds;
    }

    /**
     * Get effectiveness statistics
     */
    public function getEffectivenessStats(): array
    {
        $applications = $this->appliedMedications()
            ->whereNotNull('effectiveness_rating')
            ->get();

        if ($applications->isEmpty()) {
            return [
                'total_applications' => 0,
                'average_effectiveness' => null,
                'success_rate' => null,
            ];
        }

        return [
            'total_applications' => $applications->count(),
            'average_effectiveness' => round($applications->avg('effectiveness_rating'), 1),
            'success_rate' => round($applications->where('effectiveness_rating', '>=', 7)->count() / $applications->count() * 100, 1),
        ];
    }
}
