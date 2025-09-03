<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Schedule extends Model
{
    use HasFactory;

    protected $table = 'batch_schedules';

    protected $fillable = [
        'title',
        'description',
        'scheduled_date',
        'user_id',
        'assigned_to',
        'created_by',
        // Add other fields as needed
    ];

    protected $casts = [
        'scheduled_date' => 'datetime',
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

    // Helper method to get due date (using scheduled_date)
    public function getDueAtAttribute()
    {
        return $this->scheduled_date;
    }
}
