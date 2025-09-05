<?php

namespace App\Modules\FeedManagement\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeedSupplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'contact_person',
        'email',
        'phone',
        'website',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        'tax_id',
        'registration_number',
        'supplier_type',
        'certifications',
        'quality_rating',
        'quality_notes',
        'delivery_rating',
        'price_competitiveness',
        'total_orders',
        'average_delivery_days',
        'payment_terms_days',
        'minimum_order_value',
        'delivery_areas',
        'special_terms',
        'status',
        'is_preferred',
        'emergency_supplier',
        'priority_order',
        'bank_name',
        'account_number',
        'routing_number',
        'payment_method',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'certifications' => 'array',
        'delivery_areas' => 'array',
        'is_preferred' => 'boolean',
        'emergency_supplier' => 'boolean',
        'quality_rating' => 'decimal:2',
        'delivery_rating' => 'decimal:2',
        'price_competitiveness' => 'decimal:2',
        'average_delivery_days' => 'decimal:2',
        'minimum_order_value' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Purchase orders from this supplier
     */
    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(FeedPurchaseOrder::class);
    }

    /**
     * User who created this supplier record
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * User who last updated this supplier record
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get complete address string
     */
    public function getFullAddressAttribute(): string
    {
        $parts = array_filter([
            $this->address,
            $this->city,
            $this->state,
            $this->postal_code,
            $this->country
        ]);

        return implode(', ', $parts);
    }

    /**
     * Get supplier performance metrics
     */
    public function getPerformanceMetrics(): array
    {
        $orders = $this->purchaseOrders()
            ->where('created_at', '>=', now()->subMonths(12))
            ->get();

        $completedOrders = $orders->where('status', 'delivered');
        $totalOrders = $orders->count();

        $onTimeDeliveries = $completedOrders->filter(function ($order) {
            return $order->delivered_at && $order->expected_delivery_date &&
                   $order->delivered_at->lte($order->expected_delivery_date);
        })->count();

        $avgDeliveryTime = $completedOrders->avg(function ($order) {
            if ($order->delivered_at && $order->order_date) {
                return $order->order_date->diffInDays($order->delivered_at);
            }
            return null;
        });

        $totalValue = $orders->sum('total_amount');
        $avgOrderValue = $totalOrders > 0 ? $totalValue / $totalOrders : 0;

        return [
            'total_orders' => $totalOrders,
            'completed_orders' => $completedOrders->count(),
            'completion_rate' => $totalOrders > 0 ? ($completedOrders->count() / $totalOrders) * 100 : 0,
            'on_time_delivery_rate' => $completedOrders->count() > 0 ?
                ($onTimeDeliveries / $completedOrders->count()) * 100 : 0,
            'average_delivery_time_days' => $avgDeliveryTime ?? $this->delivery_time_days,
            'total_purchase_value' => $totalValue,
            'average_order_value' => $avgOrderValue,
            'current_rating' => $this->rating,
            'payment_reliability' => $this->calculatePaymentReliability()
        ];
    }

    /**
     * Calculate payment reliability score
     */
    public function calculatePaymentReliability(): float
    {
        $orders = $this->purchaseOrders()
            ->whereNotNull('payment_due_date')
            ->where('status', '!=', 'cancelled')
            ->where('created_at', '>=', now()->subMonths(12))
            ->get();

        if ($orders->isEmpty()) {
            return 100.0; // Default to perfect score if no payment history
        }

        $onTimePayments = $orders->filter(function ($order) {
            return $order->payment_status === 'paid' &&
                   $order->paid_at &&
                   $order->payment_due_date &&
                   $order->paid_at->lte($order->payment_due_date);
        })->count();

        return ($onTimePayments / $orders->count()) * 100;
    }

    /**
     * Get outstanding orders
     */
    public function getOutstandingOrders()
    {
        return $this->purchaseOrders()
            ->whereIn('status', ['pending', 'confirmed', 'shipped'])
            ->orderBy('expected_delivery_date')
            ->get();
    }

    /**
     * Calculate current credit utilization
     */
    public function getCurrentCreditUtilization(): float
    {
        $outstandingAmount = $this->getOutstandingOrders()->sum('total_amount');
        return $this->credit_limit > 0 ? ($outstandingAmount / $this->credit_limit) * 100 : 0;
    }

    /**
     * Check if new order amount is within credit limit
     */
    public function canPlaceOrder(float $orderAmount): bool
    {
        if ($this->credit_limit <= 0) {
            return true; // No credit limit set
        }

        $currentUtilization = $this->getCurrentCreditUtilization();
        $newUtilization = (($this->getOutstandingOrders()->sum('total_amount') + $orderAmount) / $this->credit_limit) * 100;

        return $newUtilization <= 100;
    }

    /**
     * Get available credit amount
     */
    public function getAvailableCredit(): float
    {
        if ($this->credit_limit <= 0) {
            return 0;
        }

        $outstandingAmount = $this->getOutstandingOrders()->sum('total_amount');
        return max(0, $this->credit_limit - $outstandingAmount);
    }

    /**
     * Update supplier rating based on performance
     */
    public function updateRating(): float
    {
        $metrics = $this->getPerformanceMetrics();

        // Calculate weighted rating
        $deliveryScore = $metrics['on_time_delivery_rate'] / 100 * 0.4; // 40% weight
        $completionScore = $metrics['completion_rate'] / 100 * 0.3; // 30% weight
        $paymentScore = $metrics['payment_reliability'] / 100 * 0.2; // 20% weight
        $priceScore = 0.8; // 10% weight - simplified, could be based on price competitiveness

        $newRating = ($deliveryScore + $completionScore + $paymentScore + ($priceScore * 0.1)) * 5;

        $this->update(['rating' => round($newRating, 2)]);

        return $this->rating;
    }

    /**
     * Get supplier quality certifications
     */
    public function getCertifications(): array
    {
        return $this->supplier_data['certifications'] ?? [];
    }

    /**
     * Get supplier specializations
     */
    public function getSpecializations(): array
    {
        return $this->supplier_data['specializations'] ?? [];
    }

    /**
     * Get contact information array
     */
    public function getContactInfo(): array
    {
        return [
            'contact_person' => $this->contact_person,
            'email' => $this->email,
            'phone' => $this->phone,
            'full_address' => $this->full_address
        ];
    }

    /**
     * Scope for active suppliers
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for preferred suppliers
     */
    public function scopePreferred($query)
    {
        return $query->where('preferred_supplier', true);
    }

    /**
     * Scope for suppliers with good ratings
     */
    public function scopeWellRated($query, float $minRating = 4.0)
    {
        return $query->where('rating', '>=', $minRating);
    }

    /**
     * Scope for suppliers by location
     */
    public function scopeInLocation($query, string $city = null, string $state = null, string $country = null)
    {
        return $query->when($city, function ($q) use ($city) {
                return $q->where('city', 'like', "%{$city}%");
            })
            ->when($state, function ($q) use ($state) {
                return $q->where('state', 'like', "%{$state}%");
            })
            ->when($country, function ($q) use ($country) {
                return $q->where('country', 'like', "%{$country}%");
            });
    }

    /**
     * Scope for suppliers with available credit
     */
    public function scopeWithAvailableCredit($query, float $requiredAmount = 0)
    {
        return $query->where(function ($q) use ($requiredAmount) {
            $q->where('credit_limit', '<=', 0) // No credit limit
              ->orWhereRaw('credit_limit - COALESCE((SELECT SUM(total_amount) FROM feed_purchase_orders WHERE feed_supplier_id = feed_suppliers.id AND status IN (?, ?, ?)), 0) >= ?',
                          ['pending', 'confirmed', 'shipped', $requiredAmount]);
        });
    }
}
