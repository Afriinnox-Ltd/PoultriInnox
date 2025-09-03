<?php

namespace App\Modules\BatchIncubator\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Modules\BatchIncubator\Enums\EventType;
use App\Models\User;

/**
 * BatchEvent Model
 *
 * Represents events that occur during batch management
 *
 * @property int $id
 * @property EventType $event_type
 * @property string $title
 * @property string|null $description
 * @property int $batch_id
 * @property int|null $incubator_id
 * @property int $user_id
 * @property \Carbon\Carbon $event_date
 * @property string|null $event_time
 * @property int|null $duration_minutes
 * @property array|null $event_data
 * @property array|null $before_measurements
 * @property array|null $after_measurements
 * @property int|null $affected_count
 * @property float|null $quantity
 * @property string|null $unit
 * @property float|null $temperature
 * @property float|null $humidity
 * @property int $mortality_count
 * @property string|null $mortality_cause
 * @property string|null $health_notes
 * @property string|null $feed_type
 * @property float|null $feed_amount
 * @property string|null $vaccine_name
 * @property string|null $medication_name
 * @property string|null $dosage
 * @property string|null $administration_method
 * @property array|null $attachments
 * @property string|null $notes
 * @property bool $is_critical
 * @property bool $requires_followup
 * @property \Carbon\Carbon|null $followup_date
 * @property int|null $verified_by
 * @property \Carbon\Carbon|null $verified_at
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 */
class BatchEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_type',
        'title',
        'description',
        'batch_id',
        'incubator_id',
        'user_id',
        'event_date',
        'event_time',
        'duration_minutes',
        'event_data',
        'before_measurements',
        'after_measurements',
        'affected_count',
        'quantity',
        'unit',
        'temperature',
        'humidity',
        'mortality_count',
        'mortality_cause',
        'health_notes',
        'feed_type',
        'feed_amount',
        'vaccine_name',
        'medication_name',
        'dosage',
        'administration_method',
        'attachments',
        'notes',
        'is_critical',
        'requires_followup',
        'followup_date',
        'verified_by',
        'verified_at',
    ];

    protected $casts = [
        'event_type' => EventType::class,
        'event_date' => 'datetime',
        'event_data' => 'array',
        'before_measurements' => 'array',
        'after_measurements' => 'array',
        'attachments' => 'array',
        'quantity' => 'decimal:2',
        'temperature' => 'decimal:2',
        'humidity' => 'decimal:2',
        'feed_amount' => 'decimal:2',
        'is_critical' => 'boolean',
        'requires_followup' => 'boolean',
        'followup_date' => 'datetime',
        'verified_at' => 'datetime',
    ];

    /**
     * Get the batch this event belongs to
     */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }

    /**
     * Get the incubator this event is related to
     */
    public function incubator(): BelongsTo
    {
        return $this->belongsTo(Incubator::class);
    }

    /**
     * Get the user who recorded this event
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user who verified this event
     */
    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Create a feeding event
     */
    public static function createFeedingEvent(
        Batch $batch,
        User $user,
        float $amount,
        string $feedType,
        array $additionalData = []
    ): self {
        return self::create([
            'event_type' => EventType::FEEDING,
            'title' => "Feeding - {$feedType}",
            'batch_id' => $batch->id,
            'incubator_id' => $batch->incubator_id,
            'user_id' => $user->id,
            'event_date' => now(),
            'feed_type' => $feedType,
            'feed_amount' => $amount,
            'quantity' => $amount,
            'unit' => 'kg',
            'event_data' => $additionalData,
        ]);
    }

    /**
     * Create a vaccination event
     */
    public static function createVaccinationEvent(
        Batch $batch,
        User $user,
        string $vaccineName,
        string $dosage,
        string $method,
        int $affectedCount = null
    ): self {
        return self::create([
            'event_type' => EventType::VACCINATION,
            'title' => "Vaccination - {$vaccineName}",
            'batch_id' => $batch->id,
            'incubator_id' => $batch->incubator_id,
            'user_id' => $user->id,
            'event_date' => now(),
            'vaccine_name' => $vaccineName,
            'dosage' => $dosage,
            'administration_method' => $method,
            'affected_count' => $affectedCount ?? $batch->current_count,
            'is_critical' => true,
        ]);
    }

    /**
     * Create a mortality event
     */
    public static function createMortalityEvent(
        Batch $batch,
        User $user,
        int $count,
        string $cause = null,
        string $notes = null
    ): self {
        $event = self::create([
            'event_type' => EventType::MORTALITY,
            'title' => "Mortality - {$count} birds",
            'batch_id' => $batch->id,
            'incubator_id' => $batch->incubator_id,
            'user_id' => $user->id,
            'event_date' => now(),
            'mortality_count' => $count,
            'mortality_cause' => $cause,
            'affected_count' => $count,
            'notes' => $notes,
            'is_critical' => true,
            'requires_followup' => $count > ($batch->current_count * 0.05), // If mortality > 5%
        ]);

        // Update batch mortality statistics
        $batch->recordMortality($count, $cause);

        return $event;
    }

    /**
     * Create a health check event
     */
    public static function createHealthCheckEvent(
        Batch $batch,
        User $user,
        array $healthData,
        string $notes = null
    ): self {
        return self::create([
            'event_type' => EventType::HEALTH_CHECK,
            'title' => 'Health Check',
            'batch_id' => $batch->id,
            'incubator_id' => $batch->incubator_id,
            'user_id' => $user->id,
            'event_date' => now(),
            'health_notes' => $notes,
            'event_data' => $healthData,
            'affected_count' => $batch->current_count,
        ]);
    }

    /**
     * Create a weighing event
     */
    public static function createWeighingEvent(
        Batch $batch,
        User $user,
        float $totalWeight,
        array $measurements = []
    ): self {
        $event = self::create([
            'event_type' => EventType::WEIGHING,
            'title' => 'Batch Weighing',
            'batch_id' => $batch->id,
            'incubator_id' => $batch->incubator_id,
            'user_id' => $user->id,
            'event_date' => now(),
            'quantity' => $totalWeight,
            'unit' => 'kg',
            'event_data' => $measurements,
            'affected_count' => $batch->current_count,
        ]);

        // Update batch weight
        $batch->updateWeight($totalWeight);

        return $event;
    }

    /**
     * Create an environmental change event
     */
    public static function createEnvironmentalEvent(
        Batch $batch,
        User $user,
        EventType $eventType,
        float $newValue,
        float $oldValue = null
    ): self {
        $eventTitle = match($eventType) {
            EventType::TEMPERATURE_CHANGE => 'Temperature Adjustment',
            EventType::HUMIDITY_CHANGE => 'Humidity Adjustment',
            default => 'Environmental Change'
        };

        return self::create([
            'event_type' => $eventType,
            'title' => $eventTitle,
            'batch_id' => $batch->id,
            'incubator_id' => $batch->incubator_id,
            'user_id' => $user->id,
            'event_date' => now(),
            'temperature' => $eventType === EventType::TEMPERATURE_CHANGE ? $newValue : null,
            'humidity' => $eventType === EventType::HUMIDITY_CHANGE ? $newValue : null,
            'before_measurements' => $oldValue ? [$eventType->value => $oldValue] : null,
            'after_measurements' => [$eventType->value => $newValue],
        ]);
    }

    /**
     * Mark event as verified
     */
    public function verify(User $verifier): void
    {
        $this->update([
            'verified_by' => $verifier->id,
            'verified_at' => now(),
        ]);
    }

    /**
     * Check if event is verified
     */
    public function isVerified(): bool
    {
        return $this->verified_at !== null;
    }

    /**
     * Check if event needs follow-up
     */
    public function needsFollowup(): bool
    {
        return $this->requires_followup && !$this->followup_date?->isPast();
    }

    /**
     * Get event priority based on type and criticality
     */
    public function getPriority(): int
    {
        if ($this->is_critical) {
            return 1;
        }

        return $this->event_type->priority();
    }

    /**
     * Get event color for UI
     */
    public function getColor(): string
    {
        if ($this->is_critical) {
            return 'red';
        }

        return $this->event_type->color();
    }

    /**
     * Scope for critical events
     */
    public function scopeCritical($query)
    {
        return $query->where('is_critical', true);
    }

    /**
     * Scope for events requiring follow-up
     */
    public function scopeRequiringFollowup($query)
    {
        return $query->where('requires_followup', true)
                    ->whereNull('verified_at');
    }

    /**
     * Scope for recent events
     */
    public function scopeRecent($query, int $days = 7)
    {
        return $query->where('event_date', '>=', now()->subDays($days));
    }

    /**
     * Scope for events by type
     */
    public function scopeOfType($query, EventType $type)
    {
        return $query->where('event_type', $type);
    }
}
