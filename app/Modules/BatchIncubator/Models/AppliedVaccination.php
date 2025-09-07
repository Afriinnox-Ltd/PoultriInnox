<?php

namespace App\Modules\BatchIncubator\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class AppliedVaccination extends Model
{
    use HasFactory;

    protected $fillable = [
        'batch_id',
        'vaccination_protocol_id',
        'vaccinated_at',
        'bird_age_days_at_vaccination',
        'birds_vaccinated',
        'doses_used',
        'administration_method',
        'batch_number',
        'is_primary_vaccination',
        'is_booster',
        'primary_vaccination_id',
        'next_booster_due',
        'immunity_expires',
        'temperature_celsius',
        'humidity_percentage',
        'environmental_notes',
        'status',
        'reactions_observed',
        'birds_with_reactions',
        'effectiveness_rating',
        'efficacy_assessment_date',
        'cost',
        'supplier_batch',
        'vaccine_expiry_date',
        'administered_by',
        'supervised_by',
        'administration_notes',
    ];

    protected $casts = [
        'vaccinated_at' => 'datetime',
        'next_booster_due' => 'datetime',
        'immunity_expires' => 'datetime',
        'efficacy_assessment_date' => 'datetime',
        'vaccine_expiry_date' => 'date',
        'doses_used' => 'decimal:3',
        'temperature_celsius' => 'decimal:1',
        'humidity_percentage' => 'decimal:1',
        'effectiveness_rating' => 'decimal:1',
        'cost' => 'decimal:2',
        'is_primary_vaccination' => 'boolean',
        'is_booster' => 'boolean',
    ];

    /**
     * Get the batch this vaccination was applied to
     */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }

    /**
     * Get the vaccination protocol used
     */
    public function vaccinationProtocol(): BelongsTo
    {
        return $this->belongsTo(VaccinationProtocol::class);
    }

    /**
     * Alias for vaccination protocol (for generic protocol loading)
     */
    public function protocol(): BelongsTo
    {
        return $this->belongsTo(VaccinationProtocol::class, 'vaccination_protocol_id');
    }

    /**
     * Get the primary vaccination (if this is a booster)
     */
    public function primaryVaccination(): BelongsTo
    {
        return $this->belongsTo(AppliedVaccination::class, 'primary_vaccination_id');
    }

    /**
     * Get the user who administered the vaccination
     */
    public function administeredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'administered_by');
    }

    /**
     * Get the user who supervised the vaccination
     */
    public function supervisedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supervised_by');
    }

    /**
     * Scope for specific batch
     */
    public function scopeForBatch($query, $batchId)
    {
        return $query->where('batch_id', $batchId);
    }

    /**
     * Scope for primary vaccinations only
     */
    public function scopePrimary($query)
    {
        return $query->where('is_primary_vaccination', true);
    }

    /**
     * Scope for booster vaccinations only
     */
    public function scopeBoosters($query)
    {
        return $query->where('is_booster', true);
    }

    /**
     * Scope for vaccinations due for booster
     */
    public function scopeBoosterDue($query)
    {
        return $query->where('next_booster_due', '<=', now());
    }

    /**
     * Scope for expired immunity
     */
    public function scopeImmunityExpired($query)
    {
        return $query->where('immunity_expires', '<=', now());
    }

    /**
     * Check if immunity has expired
     */
    public function hasImmunityExpired(): bool
    {
        return $this->immunity_expires && $this->immunity_expires <= now();
    }

    /**
     * Check if booster is due
     */
    public function isBoosterDue(): bool
    {
        return $this->next_booster_due && $this->next_booster_due <= now();
    }

    /**
     * Get days until booster is due
     */
    public function daysUntilBooster(): int
    {
        if (!$this->next_booster_due) {
            return 0;
        }

        $days = now()->diffInDays($this->next_booster_due, false);
        return max(0, $days);
    }

    /**
     * Get days until immunity expires
     */
    public function daysUntilImmunityExpires(): int
    {
        if (!$this->immunity_expires) {
            return 999; // Assume long-lasting immunity
        }

        $days = now()->diffInDays($this->immunity_expires, false);
        return max(0, $days);
    }

    /**
     * Check if vaccination was effective
     */
    public function wasEffective(): bool
    {
        return $this->effectiveness_rating && $this->effectiveness_rating >= 8;
    }

    /**
     * Check if there were adverse reactions
     */
    public function hadAdverseReactions(): bool
    {
        return $this->birds_with_reactions > 0;
    }

    /**
     * Get reaction rate percentage
     */
    public function getReactionRate(): float
    {
        if ($this->birds_vaccinated == 0) {
            return 0;
        }

        return round(($this->birds_with_reactions / $this->birds_vaccinated) * 100, 2);
    }
}
