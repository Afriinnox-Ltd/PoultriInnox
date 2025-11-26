<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PartnerOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'partner_id',
        'order_number',
        'description',
        'status',
        'payment_status',
        'total_amount',
        'currency',
        'delivery_address',
        'requested_delivery_date',
        'partner_notes',
        'admin_notes',
        'delivery_tracking_number',
        'confirmed_at',
        'shipped_at',
        'delivered_at',
        'paid_at',
        'cancelled_at',
        'payment_due_date',
        'payment_reminder_days',
        'last_payment_reminder_at',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'requested_delivery_date' => 'date',
        'confirmed_at' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'paid_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'payment_due_date' => 'date',
        'payment_reminder_days' => 'integer',
        'last_payment_reminder_at' => 'datetime',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (self $order) {
            if (empty($order->order_number)) {
                $order->order_number = 'PO-' . strtoupper(uniqid());
            }
        });
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(PartnerProfile::class, 'partner_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PartnerOrderItem::class);
    }

    public function isEditable(): bool
    {
        return in_array($this->status, ['pending', 'reviewing']);
    }
}
