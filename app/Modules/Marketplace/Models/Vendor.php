<?php

namespace App\Modules\Marketplace\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Traits\LogsActivity;

class Vendor extends Model
{
    use HasFactory, LogsActivity;

    protected $table = 'marketplace_vendors';

    protected $fillable = [
        'user_id',
        'business_name',
        'business_type',
        'description',
        'logo',
        'phone',
        'email',
        'website',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        'latitude',
        'longitude',
        'business_license',
        'tax_id',
        'business_documents',
        'status', // unified status field
        'verification_notes',
        'verified_at',
        'verified_by',
        'is_verified',
        'is_active',
        'rating',
        'total_reviews',
        'total_sales',
        'commission_rate',
        'payment_details',
        // Additional fields from migration
        'business_registration_number',
        'business_description',
        'business_address',
        'business_phone',
        'business_email',
        'business_website',
        'bank_name',
        'bank_account_number',
        'bank_account_name',
        'bank_branch',
        'tax_number',
        'years_in_business',
        'specializations',
        'slug',
        'rejection_reason',
        'social_media',
        'banner_image',
        'additional_info',
    ];

    protected $casts = [
        'business_documents' => 'array',
        'payment_details' => 'array',
        'is_active' => 'boolean',
        'is_verified' => 'boolean',
        'commission_rate' => 'decimal:2',
        'rating' => 'decimal:2',
        'total_sales' => 'integer',
        'total_reviews' => 'integer',
        'years_in_business' => 'integer',
        'verified_at' => 'datetime',
        'verified_by' => 'integer',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    /**
     * Get the user that owns the vendor
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all products for this vendor
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Get all orders for this vendor
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get all reviews for this vendor's products
     */
    public function reviews(): HasManyThrough
    {
        return $this->hasManyThrough(ProductReview::class, Product::class);
    }

    /**
     * Scope for active vendors
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for approved vendors
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope for featured vendors
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_active', true)->orderBy('rating', 'desc');
    }

    /**
     * Check if vendor is approved
     */
    public function isApproved(): bool
    {
        return $this->status== 'approved';
    }

    /**
     * Check if vendor is pending
     */
    public function isPending(): bool
    {
        return $this->status== 'pending';
    }

    /**
     * Check if vendor is rejected
     */
    public function isRejected(): bool
    {
        return $this->status== 'rejected';
    }

    /**
     * Check if vendor is suspended
     */
    public function isSuspended(): bool
    {
        return $this->status== 'suspended';
    }

    /**
     * Get vendor's full address
     */
    public function getFullAddressAttribute(): string
    {
        $address = [];

        if ($this->address) {
            $address[] = $this->address;
        }
        if ($this->city) {
            $address[] = $this->city;
        }
        if ($this->state) {
            $address[] = $this->state;
        }
        if ($this->country) {
            $address[] = $this->country;
        }
        if ($this->postal_code) {
            $address[] = $this->postal_code;
        }

        return implode(', ', $address);
    }

    /**
     * Calculate average rating
     */
    public function calculateAverageRating(): float
    {
        // For now return the stored rating since we don't have reviews table yet
        return $this->rating ?? 0;
    }

    /**
     * Update rating and review count
     */
    public function updateRatingStats(): void
    {
        $this->rating = $this->calculateAverageRating();
        // Will be updated when reviews functionality is added
        $this->save();
    }

    /**
     * Get total commission earned
     */
    public function getTotalCommissionAttribute(): float
    {
        return $this->total_sales * ($this->commission_rate / 100);
    }

    /**
     * Get active products count
     */
    public function getActiveProductsCountAttribute(): int
    {
        return $this->products()->where('status', 'active')->count();
    }

    /**
     * Get vendor's current subscription
     */
    public function subscription(): HasOne
    {
        return $this->hasOne(Subscription::class)->latestOfMany();
    }

    /**
     * Get all subscriptions for this vendor
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Check if vendor has an active premium subscription
     */
    public function hasPremiumSubscription(): bool
    {
        return $this->subscription && $this->subscription->plan_name== 'Premium' && $this->subscription->isActive();
    }

    public function activeSubscription()
{
    return $this->hasOne(Subscription::class)->where('is_active', true)->latestOfMany();
}

public function hasActivePlan($planName)
{
    return $this->activeSubscription && $this->activeSubscription->plan->name== $planName;
}

}
