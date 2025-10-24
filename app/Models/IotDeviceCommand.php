<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Modules\BatchIncubator\Models\Incubator;

class IotDeviceCommand extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_id',
        'command',
        'value',
        'executed',
        'executed_at',
        'incubator_id',
    ];

    protected $casts = [
        'executed' => 'boolean',
        'executed_at' => 'datetime',
    ];

    /**
     * Get the incubator associated with this command
     */
    public function incubator(): BelongsTo
    {
        return $this->belongsTo(Incubator::class);
    }

    /**
     * Scope for pending commands
     */
    public function scopePending($query)
    {
        return $query->where('executed', false);
    }

    /**
     * Scope for executed commands
     */
    public function scopeExecuted($query)
    {
        return $query->where('executed', true);
    }

    /**
     * Mark command as executed
     */
    public function markAsExecuted(): void
    {
        $this->update([
            'executed' => true,
            'executed_at' => now(),
        ]);
    }
}
