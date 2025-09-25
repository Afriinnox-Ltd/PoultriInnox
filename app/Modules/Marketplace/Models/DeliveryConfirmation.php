<?php

namespace App\Modules\Marketplace\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class DeliveryConfirmation extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'user_id',
        'confirmed',
        'proof_images',
        'confirmation_notes',
        'confirmed_at',
        'delivery_requested_at',
    ];

    protected $casts = [
        'confirmed' => 'boolean',
        'proof_images' => 'array',
        'confirmed_at' => 'datetime',
        'delivery_requested_at' => 'datetime',
    ];

    /**
     * Get the order that owns the delivery confirmation
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the user (buyer) who confirms delivery
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if delivery is confirmed
     */
    public function isConfirmed(): bool
    {
        return $this->confirmed;
    }

    /**
     * Mark as confirmed
     */
    public function markAsConfirmed(array $proofImages = [], string $notes = null): void
    {
        $this->update([
            'confirmed' => true,
            'proof_images' => $proofImages,
            'confirmation_notes' => $notes,
            'confirmed_at' => now(),
        ]);
    }

    /**
     * Get formatted proof images URLs
     */
    public function getProofImagesUrlsAttribute(): array
    {
        if (!$this->proof_images) {
            return [];
        }

        return array_map(function ($image) {
            return asset('storage/' . $image);
        }, $this->proof_images);
    }
}