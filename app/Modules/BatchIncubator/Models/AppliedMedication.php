<?php

namespace App\Modules\BatchIncubator\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class AppliedMedication extends Model
{
    use HasFactory;

    protected $fillable = [
        'batch_id',
        'medication_protocol_id',
        'applied_at',
        'bird_age_days_at_application',
        'birds_treated',
        'actual_dosage_used',
        'dosage_unit',
        'administration_method',
        'reason',
        'symptoms_observed',
        'urgency_level',
        'status',
        'results_observed',
        'effectiveness_rating',
        'birds_recovered',
        'side_effects_noted',
        'cost',
        'withdrawal_period_ends',
        'applied_by',
        'verified_by',
        'notes',
    ];

    protected $casts = [
        'applied_at' => 'datetime',
        'withdrawal_period_ends' => 'datetime',
        'actual_dosage_used' => 'decimal:3',
        'effectiveness_rating' => 'decimal:1',
        'cost' => 'decimal:2',
    ];

    /**
     * Get the batch this medication was applied to
     */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }

    /**
     * Get the medication protocol used
     */
    public function medicationProtocol(): BelongsTo
    {
        return $this->belongsTo(MedicationProtocol::class);
    }

    /**
     * Get the user who applied the medication
     */
    public function appliedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'applied_by');
    }

    /**
     * Get the user who verified the application
     */
    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Scope for specific batch
     */
    public function scopeForBatch($query, $batchId)
    {
        return $query->where('batch_id', $batchId);
    }

    /**
     * Scope for current withdrawl period
     */
    public function scopeInWithdrawalPeriod($query)
    {
        return $query->where('withdrawal_period_ends', '>', now());
    }

    /**
     * Scope for completed treatments
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Check if medication is still in withdrawal period
     */
    public function isInWithdrawalPeriod(): bool
    {
        return $this->withdrawal_period_ends && $this->withdrawal_period_ends > now();
    }

    /**
     * Get days remaining in withdrawal period
     */
    public function withdrawalDaysRemaining(): int
    {
        if (!$this->isInWithdrawalPeriod()) {
            return 0;
        }

        return $this->withdrawal_period_ends->diffInDays(now());
    }

    /**
     * Check if treatment was effective
     */
    public function wasEffective(): bool
    {
        return $this->effectiveness_rating && $this->effectiveness_rating >= 7;
    }
}
