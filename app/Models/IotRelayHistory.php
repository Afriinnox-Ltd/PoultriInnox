<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Modules\BatchIncubator\Models\Incubator;

class IotRelayHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_id',
        'incubator_id',
        'state',
        'mode',
        'temperature_at_switch',
    ];

    protected $casts = [
        'temperature_at_switch' => 'decimal:2',
    ];

    /**
     * Get the incubator associated with the relay history
     */
    public function incubator(): BelongsTo
    {
        return $this->belongsTo(Incubator::class);
    }

    /**
     * Scope to get relay history for a specific device
     */
    public function scopeForDevice($query, string $deviceId)
    {
        return $query->where('device_id', $deviceId);
    }

    /**
     * Scope to get ON state records
     */
    public function scopeOn($query)
    {
        return $query->where('state', 'ON');
    }

    /**
     * Scope to get today's records
     */
    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    /**
     * Calculate runtime in minutes for today
     */
    public static function getRuntimeToday(string $deviceId): int
    {
        return static::forDevice($deviceId)
            ->on()
            ->today()
            ->count();
    }
}
