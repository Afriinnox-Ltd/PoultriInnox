<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ScheduleReminder extends Model
{
    use HasFactory;

    protected $fillable = [
        'schedule_id',
        'user_id',
        'reminder_type',
        'reminder_time',
        'sent_at',
        'status',
        'notification_method',
        'overdue_count',
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
        return $this->belongsTo(Schedule::class);
    }

    // Scopes
    public function scopeForNotification($query)
    {
        return $query->where('status', 'pending')
                    ->where('reminder_time', '<=', now());
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
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
        $this->error_message = $errorMessage;
        $this->save();
    }

    public function incrementOverdueCount(): void
    {
        $this->overdue_count++;
        $this->save();
    }
}
