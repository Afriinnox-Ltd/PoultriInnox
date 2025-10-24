<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Modules\BatchIncubator\Models\Incubator;

class IotAlert extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_id',
        'alert_type',
        'message',
        'severity',
        'resolved',
        'resolved_at',
        'incubator_id',
    ];

    protected $casts = [
        'resolved' => 'boolean',
        'resolved_at' => 'datetime',
    ];

    /**
     * Get the incubator associated with the alert
     */
    public function incubator(): BelongsTo
    {
        return $this->belongsTo(Incubator::class);
    }

    /**
     * Scope to get only unresolved alerts
     */
    public function scopeUnresolved($query)
    {
        return $query->where('resolved', false);
    }

    /**
     * Scope to get alerts by severity
     */
    public function scopeBySeverity($query, string $severity)
    {
        return $query->where('severity', $severity);
    }

    /**
     * Scope to get recent alerts
     */
    public function scopeRecent($query, int $hours = 24)
    {
        return $query->where('created_at', '>=', now()->subHours($hours));
    }

    /**
     * Mark alert as resolved
     */
    public function markAsResolved(): bool
    {
        return $this->update([
            'resolved' => true,
            'resolved_at' => now(),
        ]);
    }
}
