<?php
namespace App\Models;

use App\Modules\Marketplace\Models\Subscription;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubscriptionPlan extends Model
{
    use HasFactory;

    protected $table = 'marketplace_subscription_plans';

    protected $fillable = [
        'name',
        'price',
        'billing_cycle',
        'duration_days',
        'product_limit',
        'order_limit',
        'allow_cod',
        'featured_badge',
        'description',
        'features',
        'is_active',
    ];

    protected $casts = [
        'features' => 'array',
        'is_active' => 'boolean',
        'allow_cod' => 'boolean',
        'featured_badge' => 'boolean',
    ];

    /**
     * Relationship: Plan has many subscriptions
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class, 'plan_id');
    }

    /**
     * Scope for active plans
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get formatted price
     */
    public function getFormattedPriceAttribute(): string
    {
        return number_format($this->price, 0) . ' RWF';
    }

    /**
     * Get features as array
     */
    public function getFeaturesListAttribute(): array
    {
        return $this->features ?? [];
    }
}
