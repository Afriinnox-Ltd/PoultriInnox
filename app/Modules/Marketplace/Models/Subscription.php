<?php

namespace App\Modules\Marketplace\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Carbon\Carbon;
use App\Models\SubscriptionPlan;
use App\Models\User;

class Subscription extends Model
{
   protected $table = 'marketplace_subscriptions';

    protected $fillable = [
        'vendor_id',
        'plan_id',
        'plan_name',
        'price',
        'billing_cycle',
        'start_date',
        'end_date',
        'is_active',
        'auto_renew',
        'product_limit',
        'order_limit',
        'allow_cod',
        'payment_reference',
        'payment_status',
        'cancelled_at',
        'cancellation_reason',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
        'auto_renew' => 'boolean',
        'allow_cod' => 'boolean',
        'cancelled_at' => 'datetime',
    ];

    /**
     * Each subscription belongs to a vendor
     */
    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    /**
     * Each subscription belongs to a plan
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'plan_id');
    }

    /**
     * Each subscription belongs to a subscription plan (alias for consistency)
     */
    public function subscriptionPlan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'plan_id');
    }

    /**
     * Get the user through the vendor relationship
     */
    public function user(): HasOneThrough
    {
        return $this->hasOneThrough(
            User::class,
            Vendor::class,
            'id', // Foreign key on vendors table
            'id', // Foreign key on users table
            'vendor_id', // Local key on subscriptions table
            'user_id' // Local key on vendors table
        );
    }

    /**
     * Check if the subscription is currently active
     */
    public function isActive(): bool
    {
        return $this->is_active && (!$this->end_date || $this->end_date->isFuture());
    }

    /**
     * Check if subscription allows COD
     */
    public function allowsCOD(): bool
    {
        return $this->allow_cod && $this->isActive();
    }

    /**
     * Calculate remaining days
     */
    public function daysRemaining(): ?int
    {
        return $this->end_date ? Carbon::now()->diffInDays($this->end_date, false) : null;
    }
}
