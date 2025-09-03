<?php

namespace App\Modules\BatchIncubator\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Modules\BatchIncubator\Enums\ScheduleStatus;
use App\Modules\BatchIncubator\Enums\EventType;
use App\Models\User;

/**
 * BatchSchedule Model
 *
 * Represents scheduled tasks and reminders for batch management
 *
 * @property int $id
 * @property string $title
 * @property string|null $description
 * @property EventType $event_type
 * @property int $batch_id
 * @property int|null $incubator_id
 * @property int|null $assigned_to
 * @property int $created_by
 * @property \Carbon\Carbon $scheduled_date
 * @property string|null $scheduled_time
 * @property int|null $estimated_duration
 * @property \Carbon\Carbon|null $actual_start_time
 * @property \Carbon\Carbon|null $actual_end_time
 * @property bool $is_recurring
 * @property string|null $recurrence_pattern
 * @property array|null $recurrence_config
 * @property \Carbon\Carbon|null $recurrence_end_date
 * @property int|null $parent_schedule_id
 * @property ScheduleStatus $status
 * @property int $progress_percentage
 * @property string|null $completion_notes
 * @property array|null $requirements
 * @property array|null $checklist
 * @property float|null $required_quantity
 * @property string|null $required_unit
 * @property int $priority
 * @property bool $is_critical
 * @property bool $send_reminder
 * @property int $reminder_minutes_before
 * @property array|null $depends_on
 * @property array|null $blocks
 * @property array|null $results
 * @property bool $requires_verification
 * @property int|null $verified_by
 * @property \Carbon\Carbon|null $verified_at
 * @property int|null $completed_event_id
 * @property array|null $attachments
 * @property string|null $notes
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 */
class BatchSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'event_type',
        'batch_id',
        'incubator_id',
        'assigned_to',
        'created_by',
        'scheduled_date',
        'scheduled_time',
        'estimated_duration',
        'actual_start_time',
        'actual_end_time',
        'is_recurring',
        'recurrence_pattern',
        'recurrence_config',
        'recurrence_end_date',
        'parent_schedule_id',
        'status',
        'progress_percentage',
        'completion_notes',
        'requirements',
        'checklist',
        'required_quantity',
        'required_unit',
        'priority',
        'is_critical',
        'send_reminder',
        'reminder_minutes_before',
        'depends_on',
        'blocks',
        'results',
        'requires_verification',
        'verified_by',
        'verified_at',
        'completed_event_id',
        'attachments',
        'notes',
    ];

    protected $casts = [
        'event_type' => EventType::class,
        'status' => ScheduleStatus::class,
        'scheduled_date' => 'datetime',
        'recurrence_end_date' => 'date',
        'actual_start_time' => 'datetime',
        'actual_end_time' => 'datetime',
        'verified_at' => 'datetime',
        'is_recurring' => 'boolean',
        'is_critical' => 'boolean',
        'send_reminder' => 'boolean',
        'requires_verification' => 'boolean',
        'recurrence_config' => 'array',
        'requirements' => 'array',
        'checklist' => 'array',
        'depends_on' => 'array',
        'blocks' => 'array',
        'results' => 'array',
        'attachments' => 'array',
        'required_quantity' => 'decimal:2',
    ];

    /**
     * Get the batch this schedule belongs to
     */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }

    /**
     * Get the incubator this schedule is for
     */
    public function incubator(): BelongsTo
    {
        return $this->belongsTo(Incubator::class);
    }

    /**
     * Get the user assigned to this schedule
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get the user who created this schedule
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who verified this schedule
     */
    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Get the parent schedule for recurring items
     */
    public function parentSchedule(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_schedule_id');
    }

    /**
     * Get child schedules for recurring items
     */
    public function childSchedules(): HasMany
    {
        return $this->hasMany(self::class, 'parent_schedule_id');
    }

    /**
     * Get the completed event
     */
    public function completedEvent(): BelongsTo
    {
        return $this->belongsTo(BatchEvent::class, 'completed_event_id');
    }

    /**
     * Create a feeding schedule
     */
    public static function createFeedingSchedule(
        Batch $batch,
        User $creator,
        \Carbon\Carbon $scheduledDate,
        float $quantity,
        string $feedType,
        bool $isRecurring = false
    ): self {
        return self::create([
            'title' => "Feed {$batch->name}",
            'description' => "Feed {$quantity}kg of {$feedType}",
            'event_type' => EventType::FEEDING,
            'batch_id' => $batch->id,
            'incubator_id' => $batch->incubator_id,
            'created_by' => $creator->id,
            'scheduled_date' => $scheduledDate,
            'required_quantity' => $quantity,
            'required_unit' => 'kg',
            'priority' => 3,
            'is_recurring' => $isRecurring,
            'requirements' => [
                'feed_type' => $feedType,
                'quantity' => $quantity,
                'tools' => ['feed_scoop', 'scale']
            ],
        ]);
    }

    /**
     * Create a vaccination schedule
     */
    public static function createVaccinationSchedule(
        Batch $batch,
        User $creator,
        \Carbon\Carbon $scheduledDate,
        string $vaccineName,
        string $dosage
    ): self {
        return self::create([
            'title' => "Vaccinate {$batch->name}",
            'description' => "Administer {$vaccineName} vaccine",
            'event_type' => EventType::VACCINATION,
            'batch_id' => $batch->id,
            'incubator_id' => $batch->incubator_id,
            'created_by' => $creator->id,
            'scheduled_date' => $scheduledDate,
            'priority' => 2,
            'is_critical' => true,
            'requires_verification' => true,
            'requirements' => [
                'vaccine_name' => $vaccineName,
                'dosage' => $dosage,
                'equipment' => ['syringes', 'needles', 'vaccine_storage']
            ],
        ]);
    }

    /**
     * Create a health check schedule
     */
    public static function createHealthCheckSchedule(
        Batch $batch,
        User $creator,
        \Carbon\Carbon $scheduledDate,
        bool $isRecurring = true
    ): self {
        $schedule = self::create([
            'title' => "Health Check - {$batch->name}",
            'description' => "Routine health inspection and monitoring",
            'event_type' => EventType::HEALTH_CHECK,
            'batch_id' => $batch->id,
            'incubator_id' => $batch->incubator_id,
            'created_by' => $creator->id,
            'scheduled_date' => $scheduledDate,
            'priority' => 1,
            'is_recurring' => $isRecurring,
            'checklist' => [
                'Visual inspection for disease signs',
                'Check feed and water consumption',
                'Monitor behavior patterns',
                'Record temperature and humidity',
                'Check mortality count',
                'Assess overall flock condition'
            ],
        ]);

        if ($isRecurring) {
            $schedule->update([
                'recurrence_pattern' => 'daily',
                'recurrence_config' => ['frequency' => 1],
            ]);
        }

        return $schedule;
    }

    /**
     * Start the scheduled task
     */
    public function start(User $user = null): void
    {
        $this->update([
            'status' => ScheduleStatus::IN_PROGRESS,
            'actual_start_time' => now(),
            'assigned_to' => $user?->id ?? $this->assigned_to,
        ]);
    }

    /**
     * Complete the scheduled task
     */
    public function complete(array $results = [], string $notes = null): BatchEvent
    {
        // Create the corresponding event
        $event = BatchEvent::create([
            'event_type' => $this->event_type,
            'title' => $this->title,
            'description' => $this->description,
            'batch_id' => $this->batch_id,
            'incubator_id' => $this->incubator_id,
            'user_id' => $this->assigned_to ?? $this->created_by,
            'event_date' => now(),
            'event_data' => $results,
            'notes' => $notes,
            'quantity' => $this->required_quantity,
            'unit' => $this->required_unit,
        ]);

        // Update schedule
        $this->update([
            'status' => ScheduleStatus::COMPLETED,
            'actual_end_time' => now(),
            'progress_percentage' => 100,
            'completion_notes' => $notes,
            'results' => $results,
            'completed_event_id' => $event->id,
        ]);

        // Generate next occurrence if recurring
        if ($this->is_recurring && !$this->isRecurrenceEnded()) {
            $this->generateNextOccurrence();
        }

        return $event;
    }

    /**
     * Mark schedule as overdue
     */
    public function markOverdue(): void
    {
        if ($this->status === ScheduleStatus::PENDING && $this->scheduled_date->isPast()) {
            $this->update(['status' => ScheduleStatus::OVERDUE]);
        }
    }

    /**
     * Postpone the schedule
     */
    public function postpone(\Carbon\Carbon $newDate, string $reason = null): void
    {
        $this->update([
            'scheduled_date' => $newDate,
            'status' => ScheduleStatus::POSTPONED,
            'notes' => $this->notes . "\n\nPostponed: " . $reason,
        ]);
    }

    /**
     * Cancel the schedule
     */
    public function cancel(string $reason = null): void
    {
        $this->update([
            'status' => ScheduleStatus::CANCELLED,
            'notes' => $this->notes . "\n\nCancelled: " . $reason,
        ]);
    }

    /**
     * Verify the completed schedule
     */
    public function verify(User $verifier): void
    {
        $this->update([
            'verified_by' => $verifier->id,
            'verified_at' => now(),
        ]);
    }

    /**
     * Check if schedule is overdue
     */
    public function isOverdue(): bool
    {
        return $this->status === ScheduleStatus::PENDING &&
               $this->scheduled_date->isPast();
    }

    /**
     * Check if schedule needs reminder
     */
    public function needsReminder(): bool
    {
        if (!$this->send_reminder || $this->status->isCompleted()) {
            return false;
        }

        $reminderTime = $this->scheduled_date->subMinutes($this->reminder_minutes_before);
        return now()->gte($reminderTime) && now()->lt($this->scheduled_date);
    }

    /**
     * Check if recurrence has ended
     */
    public function isRecurrenceEnded(): bool
    {
        return $this->recurrence_end_date &&
               now()->gt($this->recurrence_end_date);
    }

    /**
     * Generate next occurrence for recurring schedule
     */
    public function generateNextOccurrence(): ?self
    {
        if (!$this->is_recurring || $this->isRecurrenceEnded()) {
            return null;
        }

        $nextDate = $this->calculateNextDate();
        if (!$nextDate) {
            return null;
        }

        return self::create([
            'title' => $this->title,
            'description' => $this->description,
            'event_type' => $this->event_type,
            'batch_id' => $this->batch_id,
            'incubator_id' => $this->incubator_id,
            'assigned_to' => $this->assigned_to,
            'created_by' => $this->created_by,
            'scheduled_date' => $nextDate,
            'scheduled_time' => $this->scheduled_time,
            'estimated_duration' => $this->estimated_duration,
            'is_recurring' => true,
            'recurrence_pattern' => $this->recurrence_pattern,
            'recurrence_config' => $this->recurrence_config,
            'recurrence_end_date' => $this->recurrence_end_date,
            'parent_schedule_id' => $this->parent_schedule_id ?? $this->id,
            'priority' => $this->priority,
            'is_critical' => $this->is_critical,
            'send_reminder' => $this->send_reminder,
            'reminder_minutes_before' => $this->reminder_minutes_before,
            'requirements' => $this->requirements,
            'checklist' => $this->checklist,
            'required_quantity' => $this->required_quantity,
            'required_unit' => $this->required_unit,
            'requires_verification' => $this->requires_verification,
        ]);
    }

    /**
     * Calculate next occurrence date
     */
    private function calculateNextDate(): ?\Carbon\Carbon
    {
        $config = $this->recurrence_config ?? [];
        $frequency = $config['frequency'] ?? 1;

        return match($this->recurrence_pattern) {
            'daily' => $this->scheduled_date->addDays($frequency),
            'weekly' => $this->scheduled_date->addWeeks($frequency),
            'monthly' => $this->scheduled_date->addMonths($frequency),
            default => null
        };
    }

    /**
     * Get time until scheduled
     */
    public function getTimeUntilScheduled(): string
    {
        if ($this->scheduled_date->isPast()) {
            return 'Overdue by ' . $this->scheduled_date->diffForHumans();
        }

        return 'Due ' . $this->scheduled_date->diffForHumans();
    }

    /**
     * Get estimated completion time
     */
    public function getEstimatedCompletionTime(): ?\Carbon\Carbon
    {
        if (!$this->estimated_duration) {
            return null;
        }

        return $this->scheduled_date->addMinutes($this->estimated_duration);
    }

    /**
     * Scope for pending schedules
     */
    public function scopePending($query)
    {
        return $query->where('status', ScheduleStatus::PENDING);
    }

    /**
     * Scope for overdue schedules
     */
    public function scopeOverdue($query)
    {
        return $query->where('status', ScheduleStatus::OVERDUE)
                    ->orWhere(function($q) {
                        $q->where('status', ScheduleStatus::PENDING)
                          ->where('scheduled_date', '<', now());
                    });
    }

    /**
     * Scope for today's schedules
     */
    public function scopeToday($query)
    {
        return $query->whereDate('scheduled_date', today());
    }

    /**
     * Scope for critical schedules
     */
    public function scopeCritical($query)
    {
        return $query->where('is_critical', true);
    }

    /**
     * Scope for recurring schedules
     */
    public function scopeRecurring($query)
    {
        return $query->where('is_recurring', true);
    }
}
