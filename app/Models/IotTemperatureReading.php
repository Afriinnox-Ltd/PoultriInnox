<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Modules\BatchIncubator\Models\Incubator;

class IotTemperatureReading extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_id',
        'incubator_id',
        'temperature',
        'temp1',
        'temp2',
        'temp3',
        'temp4',
        'cycle_day',
        'total_days',
    ];

    protected $casts = [
        'temperature' => 'decimal:2',
        'temp1' => 'decimal:2',
        'temp2' => 'decimal:2',
        'temp3' => 'decimal:2',
        'temp4' => 'decimal:2',
        'cycle_day' => 'integer',
        'total_days' => 'integer',
    ];

    /**
     * Get the incubator associated with the reading
     */
    public function incubator(): BelongsTo
    {
        return $this->belongsTo(Incubator::class);
    }

    /**
     * Scope to get readings for a specific device
     */
    public function scopeForDevice($query, string $deviceId)
    {
        return $query->where('device_id', $deviceId);
    }

    /**
     * Scope to get readings within date range
     */
    public function scopeWithinDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Scope to get recent readings
     */
    public function scopeRecent($query, int $hours = 24)
    {
        return $query->where('created_at', '>=', now()->subHours($hours));
    }
}
