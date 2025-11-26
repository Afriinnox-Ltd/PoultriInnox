<?php

namespace App\Modules\BatchIncubator\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Modules\BatchIncubator\Enums\IncubatorStatus;
use App\Modules\BatchIncubator\Enums\BatchStatus;
use App\Modules\BatchIncubator\Traits\HasBasicUserAccess;
use App\Models\User;

/**
 * Incubator Model
 *
 * Represents incubator machines used for hatching eggs
 *
 * @property int $id
 * @property string $name
 * @property string|null $model
 * @property string|null $serial_number
 * @property string|null $description
 * @property int $capacity
 * @property int $current_load
 * @property float|null $target_temperature
 * @property float|null $target_humidity
 * @property float|null $current_temperature
 * @property float|null $current_humidity
 * @property IncubatorStatus $status
 * @property array|null $settings
 * @property array|null $sensors_data
 * @property string|null $location
 * @property array|null $access_control
 * @property \Carbon\Carbon|null $last_maintenance
 * @property \Carbon\Carbon|null $next_maintenance
 * @property string|null $maintenance_notes
 * @property int $owner_id
 * @property array|null $authorized_users
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 */
class Incubator extends Model
{
    use HasFactory, HasBasicUserAccess;

    protected $fillable = [
        'name',
        'model',
        'serial_number',
        'description',
        'capacity',
        'current_load',
        'target_temperature',
        'target_humidity',
        'current_temperature',
        'current_humidity',
        'status',
        'settings',
        'sensors_data',
        'location',
        'access_control',
        'last_maintenance',
        'next_maintenance',
        'maintenance_notes',
        'owner_id',
        'authorized_users',
    ];

    protected $casts = [
        'status' => IncubatorStatus::class,
        'settings' => 'array',
        'sensors_data' => 'array',
        'access_control' => 'array',
        'authorized_users' => 'array',
        'last_maintenance' => 'datetime',
        'next_maintenance' => 'datetime',
        'target_temperature' => 'decimal:2',
        'target_humidity' => 'decimal:2',
        'current_temperature' => 'decimal:2',
        'current_humidity' => 'decimal:2',
    ];

    /**
     * Get the owner of the incubator
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Get all batches assigned to this incubator
     */
    public function batches(): HasMany
    {
        return $this->hasMany(Batch::class);
    }

    /**
     * Get current active batches
     */
    public function currentBatches(): HasMany
    {
        return $this->hasMany(Batch::class)
            ->whereIn('status', [
                BatchStatus::INCUBATING,
                BatchStatus::HATCHING,
                BatchStatus::BROODING,
                BatchStatus::GROWING,
                BatchStatus::LAYING
            ]);
    }

    /**
     * Get current active batch (relationship)
     */
    public function currentBatch(): HasOne
    {
        return $this->hasOne(Batch::class)
            ->whereIn('status', [
                BatchStatus::INCUBATING,
                BatchStatus::HATCHING,
                BatchStatus::BROODING,
                BatchStatus::GROWING,
                BatchStatus::LAYING
            ])
            ->latest();
    }

    /**
     * Get events related to this incubator
     */
    public function events(): HasMany
    {
        return $this->hasMany(BatchEvent::class);
    }

    /**
     * Get schedules for this incubator
     */
    public function schedules(): HasMany
    {
        return $this->hasMany(BatchSchedule::class);
    }

    /**
     * Check if incubator is available for assignment
     */
    public function isAvailable(): bool
    {
        return $this->status->isOperational() &&
               $this->current_load < $this->capacity;
    }

    /**
     * Get available capacity
     */
    public function getAvailableCapacity(): int
    {
        return $this->capacity - $this->current_load;
    }

    /**
     * Get utilization percentage
     */
    public function getUtilizationPercentage(): float
    {
        if ($this->capacity== 0) {
            return 0;
        }

        return round(($this->current_load / $this->capacity) * 100, 2);
    }

    /**
     * Check if maintenance is due
     */
    public function isMaintenanceDue(): bool
    {
        return $this->next_maintenance &&
               $this->next_maintenance->isPast();
    }    /**
     * Update sensor readings
     */
    public function updateSensorData(array $sensorData): void
    {
        $this->update([
            'current_temperature' => $sensorData['temperature'] ?? $this->current_temperature,
            'current_humidity' => $sensorData['humidity'] ?? $this->current_humidity,
            'sensors_data' => array_merge($this->sensors_data ?? [], $sensorData),
        ]);
    }

    /**
     * Assign batch to incubator
     */
    public function assignBatch(Batch $batch): bool
    {
        if (!$this->isAvailable()) {
            return false;
        }

        $batch->update([
            'incubator_id' => $this->id,
            'incubator_assigned_at' => now(),
        ]);

        $this->increment('current_load', $batch->current_count);

        return true;
    }

    /**
     * Remove batch from incubator
     */
    public function removeBatch(Batch $batch): void
    {
        $this->decrement('current_load', $batch->current_count);

        $batch->update([
            'incubator_id' => null,
            'incubator_assigned_at' => null,
        ]);
    }

    /**
     * Get environmental efficiency score
     */
    public function getEnvironmentalEfficiency(): float
    {
        if (!$this->target_temperature || !$this->target_humidity) {
            return 0;
        }

        $tempDiff = abs($this->current_temperature - $this->target_temperature);
        $humidityDiff = abs($this->current_humidity - $this->target_humidity);

        $tempScore = max(0, 100 - ($tempDiff * 10));
        $humidityScore = max(0, 100 - ($humidityDiff * 2));

        return round(($tempScore + $humidityScore) / 2, 2);
    }
}
