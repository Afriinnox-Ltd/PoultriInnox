<?php

namespace App\Modules\BatchIncubator\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DismissedRecommendation extends Model
{
    use HasFactory;

    protected $fillable = [
        'batch_id',
        'recommendation_type',
        'recommendation_id',
        'dismissed_by',
        'dismissed_at',
        'reason',
    ];

    protected $casts = [
        'dismissed_at' => 'datetime',
    ];

    /**
     * Get the batch that owns this dismissed recommendation
     */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }

    /**
     * Get the user who dismissed this recommendation
     */
    public function dismissedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dismissed_by');
    }

    /**
     * Scope for specific recommendation type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('recommendation_type', $type);
    }

    /**
     * Scope for recommendations dismissed by a specific user
     */
    public function scopeDismissedBy($query, $userId)
    {
        return $query->where('dismissed_by', $userId);
    }

    /**
     * Scope for recent dismissals
     */
    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('dismissed_at', '>=', now()->subDays($days));
    }
}
