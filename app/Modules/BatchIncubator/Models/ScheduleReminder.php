<?php

namespace App\Modules\BatchIncubator\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\User;

class ScheduleReminder extends Model
{
    use HasFactory;

    protected $fillable = [
        'schedule_id',
        'user_id',
        'reminder_type',
        'minutes_before',
        'reminder_time',
        'sent_at',
        'status',
        'notification_method',
        'overdue_count',
        'custom_message',
        'notes',
    ];

    protected $casts = [
        'reminder_time' => 'datetime',
        'sent_at' => 'datetime',
        'overdue_count' => 'integer',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(BatchSchedule::class, 'schedule_id');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending')
                    ->where('reminder_time', '<=', now());
    }

    public function scopeForNotification($query)
    {
        return $query->where('status', 'pending')
                    ->where('reminder_time', '<=', now());
    }

    // Helper methods
    public function isOverdue(): bool
    {
        return $this->reminder_type === 'overdue' && $this->status !== 'sent';
    }

    public function markAsSent(): void
    {
        $this->status = 'sent';
        $this->sent_at = now();
        $this->save();
    }

    public function markAsFailed(string $errorMessage = null): void
    {
        $this->status = 'failed';
        if ($errorMessage) {
            $this->notes = $errorMessage;
        }
        $this->save();
    }

    public function incrementOverdueCount(): void
    {
        $this->overdue_count++;
        $this->save();
    }

    // Static methods for cleanup
    public static function cleanupOldReminders(): int
    {
        return self::where('status', 'sent')
                  ->where('sent_at', '<', now()->subDays(30))
                  ->delete();
    }

    public static function cleanupFailedReminders(): int
    {
        return self::where('status', 'failed')
                  ->where('overdue_count', '>=', 3)
                  ->where('updated_at', '<', now()->subDays(7))
                  ->delete();
    }

    // Static factory methods
    public static function createForSchedule(
        BatchSchedule $schedule,
        User $user,
        int $minutesBefore,
        string $notificationMethod = 'both'
    ): self {
        $reminderTime = $schedule->scheduled_date->subMinutes($minutesBefore);

        return self::create([
            'schedule_id' => $schedule->id,
            'user_id' => $user->id,
            'reminder_type' => 'before_due',
            'minutes_before' => $minutesBefore,
            'reminder_time' => $reminderTime,
            'notification_method' => $notificationMethod,
            'status' => 'pending',
        ]);
    }

    public static function createCustomReminder(
        BatchSchedule $schedule,
        User $user,
        \Carbon\Carbon $reminderTime,
        ?string $customMessage = null,
        string $notificationMethod = 'both'
    ): self {
        return self::create([
            'schedule_id' => $schedule->id,
            'user_id' => $user->id,
            'reminder_type' => 'custom',
            'reminder_time' => $reminderTime,
            'custom_message' => $customMessage,
            'notification_method' => $notificationMethod,
            'status' => 'pending',
        ]);
    }

    public function cancel(): void
    {
        $this->status = 'cancelled';
        $this->save();
    }
}
