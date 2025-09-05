<?php

namespace App\Models;

use App\Modules\FeedManagement\Models\FeedType;
use App\Modules\FeedManagement\Models\FeedProgram;
use App\Modules\FeedManagement\Models\FeedConsumption;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Schedule extends Model
{
    use HasFactory;

    protected $table = 'batch_schedules';

    protected $fillable = [
        'batch_id',
        'task_type',
        'title',
        'description',
        'scheduled_date',
        'scheduled_time',
        'planned_quantity',
        'actual_quantity',
        'status',
        'priority',
        'estimated_duration',
        'completed_at',
        'assigned_to',
        'created_by',
        'feed_type_id',
        'feed_program_id',
        'feed_cost',
        'feed_data'
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'scheduled_time' => 'datetime',
        'completed_at' => 'datetime',
        'planned_quantity' => 'decimal:2',
        'actual_quantity' => 'decimal:2',
        'feed_cost' => 'decimal:2',
        'feed_data' => 'array'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function reminders(): HasMany
    {
        return $this->hasMany(ScheduleReminder::class);
    }

    /**
     * Feed type for feeding schedules
     */
    public function feedType(): BelongsTo
    {
        return $this->belongsTo(FeedType::class, 'feed_type_id');
    }

    /**
     * Feed program for feeding schedules
     */
    public function feedProgram(): BelongsTo
    {
        return $this->belongsTo(FeedProgram::class, 'feed_program_id');
    }

    /**
     * Feed consumption records for this schedule
     */
    public function feedConsumption(): HasMany
    {
        return $this->hasMany(FeedConsumption::class, 'schedule_id');
    }

    /**
     * Check if this is a feeding schedule
     */
    public function isFeedingSchedule(): bool
    {
        return $this->task_type === 'feeding' && !is_null($this->feed_type_id);
    }

    /**
     * Get feed efficiency for completed feeding schedules
     */
    public function getFeedEfficiency(): ?float
    {
        if (!$this->isFeedingSchedule() || !$this->completed_at || !$this->actual_quantity || !$this->planned_quantity) {
            return null;
        }

        return ($this->planned_quantity / $this->actual_quantity) * 100;
    }

    // Helper method to get due date (using scheduled_date)
    public function getDueAtAttribute()
    {
        return $this->scheduled_date;
    }
}
