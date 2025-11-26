<?php

namespace App\Modules\Marketplace\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Shipping extends Model
{
    use HasFactory;

    protected $table = 'marketplace_shipping';

    protected $fillable = [
        'order_id',
        'recipient_name',
        'phone',
        'email',
        'address',
        'city',
        'state',
        'postal_code',
        'country',
        'latitude',
        'longitude',
        'carrier',
        'service_type',
        'tracking_number',
        'shipping_cost',
        'insurance_cost',
        'weight',
        'length',
        'width',
        'height',
        'status',
        'dispatched_at',
        'estimated_delivery',
        'delivered_at',
        'delivered_to',
        'delivery_notes',
        'special_instructions',
        'signature_required',
        'insurance_required',
        'tracking_history'
    ];

    protected $casts = [
        'shipping_cost' => 'decimal:2',
        'insurance_cost' => 'decimal:2',
        'weight' => 'decimal:2',
        'length' => 'decimal:2',
        'width' => 'decimal:2',
        'height' => 'decimal:2',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'estimated_delivery' => 'datetime',
        'dispatched_at' => 'datetime',
        'delivered_at' => 'datetime',
        'signature_required' => 'boolean',
        'insurance_required' => 'boolean',
        'tracking_history' => 'array'
    ];

    /**
     * Get the order that owns the shipping record.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the formatted shipping address.
     */
    public function getFormattedShippingAddressAttribute(): string
    {
        if (!$this->shipping_address) {
            return '';
        }

        $address = $this->shipping_address;
        $formatted = [];

        if (!empty($address['first_name']) || !empty($address['last_name'])) {
            $formatted[] = trim(($address['first_name'] ?? '') . ' ' . ($address['last_name'] ?? ''));
        }

        if (!empty($address['address_line_1'])) {
            $formatted[] = $address['address_line_1'];
        }

        if (!empty($address['address_line_2'])) {
            $formatted[] = $address['address_line_2'];
        }

        $cityStateZip = [];
        if (!empty($address['city'])) {
            $cityStateZip[] = $address['city'];
        }
        if (!empty($address['state'])) {
            $cityStateZip[] = $address['state'];
        }
        if (!empty($address['postal_code'])) {
            $cityStateZip[] = $address['postal_code'];
        }

        if (!empty($cityStateZip)) {
            $formatted[] = implode(', ', $cityStateZip);
        }

        if (!empty($address['country'])) {
            $formatted[] = $address['country'];
        }

        return implode("\n", $formatted);
    }

    /**
     * Get the formatted billing address.
     */
    public function getFormattedBillingAddressAttribute(): string
    {
        if (!$this->billing_address) {
            return '';
        }

        $address = $this->billing_address;
        $formatted = [];

        if (!empty($address['first_name']) || !empty($address['last_name'])) {
            $formatted[] = trim(($address['first_name'] ?? '') . ' ' . ($address['last_name'] ?? ''));
        }

        if (!empty($address['address_line_1'])) {
            $formatted[] = $address['address_line_1'];
        }

        if (!empty($address['address_line_2'])) {
            $formatted[] = $address['address_line_2'];
        }

        $cityStateZip = [];
        if (!empty($address['city'])) {
            $cityStateZip[] = $address['city'];
        }
        if (!empty($address['state'])) {
            $cityStateZip[] = $address['state'];
        }
        if (!empty($address['postal_code'])) {
            $cityStateZip[] = $address['postal_code'];
        }

        if (!empty($cityStateZip)) {
            $formatted[] = implode(', ', $cityStateZip);
        }

        if (!empty($address['country'])) {
            $formatted[] = $address['country'];
        }

        return implode("\n", $formatted);
    }

    /**
     * Check if the shipment is in transit.
     */
    public function isInTransit(): bool
    {
        return $this->status== 'dispatched' && !$this->delivered_at;
    }

    /**
     * Check if the shipment has been delivered.
     */
    public function isDelivered(): bool
    {
        return $this->status== 'delivered' && $this->delivered_at;
    }

    /**
     * Get the estimated delivery days from now.
     */
    public function getEstimatedDeliveryDaysAttribute(): ?int
    {
        if (!$this->estimated_delivery_date) {
            return null;
        }

        return now()->diffInDays($this->estimated_delivery_date, false);
    }

    /**
     * Mark the shipment as shipped.
     */
    public function markAsShipped(string $trackingNumber = null, string $carrier = null): void
    {
        $this->update([
            'status' => 'dispatched',
            'dispatched_at' => now(),
            'tracking_number' => $trackingNumber,
            'carrier' => $carrier
        ]);
    }

    /**
     * Mark the shipment as delivered.
     */
    public function markAsDelivered(string $deliveryNotes = null): void
    {
        $this->update([
            'status' => 'delivered',
            'delivered_at' => now(),
            'actual_delivery_date' => now()->toDateString(),
            'delivery_notes' => $deliveryNotes
        ]);
    }

    /**
     * Get the shipping status with human-readable labels.
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'pending' => 'Pending Shipment',
            'preparing' => 'Preparing',
            'dispatched' => 'Dispatched',
            'in_transit' => 'In Transit',
            'out_for_delivery' => 'Out for Delivery',
            'delivered' => 'Delivered',
            'failed_delivery' => 'Delivery Failed',
            'returned' => 'Returned',
            'cancelled' => 'Cancelled',
            default => 'Unknown'
        };
    }

    /**
     * Scope for dispatched orders.
     */
    public function scopeDispatched($query)
    {
        return $query->where('status', 'dispatched');
    }

    /**
     * Scope for delivered orders.
     */
    public function scopeDelivered($query)
    {
        return $query->where('status', 'delivered');
    }

    /**
     * Scope for orders with tracking numbers.
     */
    public function scopeWithTracking($query)
    {
        return $query->whereNotNull('tracking_number');
    }
}
