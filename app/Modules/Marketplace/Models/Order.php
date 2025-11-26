<?php

namespace App\Modules\Marketplace\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class Order extends Model
{
    use HasFactory;

    protected $table = 'marketplace_orders';

    protected $fillable = [
        'user_id',
        'vendor_id',
        'order_number',
        'status',
        'admin_confirmed',
        'admin_confirmed_at',
        'admin_confirmed_by',
        'payment_status',
        'shipping_status',
        'subtotal',
        'tax_amount',
        'shipping_amount',
        'discount_amount',
        'total_amount',
        'currency',
        'payment_method',
        'payment_reference',
        'shipping_address',
        'billing_address',
        'notes',
        'shipped_at',
        'delivered_at',
        'cancelled_at',
        'refunded_at',
        'vendor_confirmed',
        'vendor_confirmed_at',
        'vendor_confirmed_by',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'shipping_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'admin_confirmed' => 'boolean',
        'vendor_confirmed' => 'boolean',
        'shipping_address' => 'array',
        'billing_address' => 'array',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'admin_confirmed_at' => 'datetime',
        'vendor_confirmed_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'refunded_at' => 'datetime',
    ];

    /**
     * Get the user that owns the order
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the vendor for this order
     */
    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    /**
     * Get the admin who confirmed this order
     */
    public function adminConfirmedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_confirmed_by');
    }

    /**
     * Get the vendor who confirmed this order
     */
    public function vendorConfirmedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vendor_confirmed_by');
    }

    /**
     * Get all order items
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get all payments for this order
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get the primary payment for this order (latest completed payment)
     */
    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class)->latest();
    }

    /**
     * Get the shipping information for this order
     */
    public function shipping(): HasOne
    {
        return $this->hasOne(Shipping::class);
    }

    /**
     * Get the delivery confirmation for this order
     */
    public function deliveryConfirmation(): HasOne
    {
        return $this->hasOne(DeliveryConfirmation::class);
    }

    /**
     * Scope for specific status
     */
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for pending orders
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for completed orders
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope for cancelled orders
     */
    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    /**
     * Check if order is pending
     */
    public function isPending(): bool
    {
        return $this->status== 'pending';
    }

    /**
     * Check if order is confirmed
     */
    public function isConfirmed(): bool
    {
        return $this->status== 'confirmed';
    }

    /**
     * Check if order is processing
     */
    public function isProcessing(): bool
    {
        return $this->status== 'processing';
    }

    /**
     * Check if order is shipped
     */
    public function isShipped(): bool
    {
        return $this->status== 'shipped';
    }

    /**
     * Check if order is delivered
     */
    public function isDelivered(): bool
    {
        return $this->status== 'delivered';
    }

    /**
     * Check if order is completed
     */
    public function isCompleted(): bool
    {
        return $this->status== 'completed';
    }

    /**
     * Check if order is cancelled
     */
    public function isCancelled(): bool
    {
        return $this->status== 'cancelled';
    }

    /**
     * Check if order is refunded
     */
    public function isRefunded(): bool
    {
        return $this->status== 'refunded';
    }

    /**
     * Check if payment is pending
     */
    public function isPaymentPending(): bool
    {
        return $this->payment_status== 'pending';
    }

    /**
     * Check if payment is completed
     */
    public function isPaymentCompleted(): bool
    {
        return $this->payment_status== 'completed';
    }

    /**
     * Check if payment is failed
     */
    public function isPaymentFailed(): bool
    {
        return $this->payment_status== 'failed';
    }

    /**
     * Get formatted shipping address
     */
    public function getFormattedShippingAddressAttribute(): string
    {
        if (!$this->shipping_address) {
            return '';
        }

        $address = $this->shipping_address;
        $formatted = [];

        if (isset($address['name'])) $formatted[] = $address['name'];
        if (isset($address['address_line_1'])) $formatted[] = $address['address_line_1'];
        if (isset($address['address_line_2']) && $address['address_line_2']) $formatted[] = $address['address_line_2'];
        if (isset($address['city'])) $formatted[] = $address['city'];
        if (isset($address['state'])) $formatted[] = $address['state'];
        if (isset($address['postal_code'])) $formatted[] = $address['postal_code'];
        if (isset($address['country'])) $formatted[] = $address['country'];

        return implode(', ', $formatted);
    }

    /**
     * Get formatted billing address
     */
    public function getFormattedBillingAddressAttribute(): string
    {
        if (!$this->billing_address) {
            return '';
        }

        $address = $this->billing_address;
        $formatted = [];

        if (isset($address['name'])) $formatted[] = $address['name'];
        if (isset($address['address_line_1'])) $formatted[] = $address['address_line_1'];
        if (isset($address['address_line_2']) && $address['address_line_2']) $formatted[] = $address['address_line_2'];
        if (isset($address['city'])) $formatted[] = $address['city'];
        if (isset($address['state'])) $formatted[] = $address['state'];
        if (isset($address['postal_code'])) $formatted[] = $address['postal_code'];
        if (isset($address['country'])) $formatted[] = $address['country'];

        return implode(', ', $formatted);
    }

    /**
     * Calculate total items
     */
    public function getTotalItemsAttribute(): int
    {
        return $this->items->sum('quantity');
    }

    /**
     * Get order status color
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'pending' => 'yellow',
            'confirmed' => 'blue',
            'processing' => 'purple',
            'shipped' => 'indigo',
            'delivered' => 'green',
            'completed' => 'green',
            'cancelled' => 'red',
            'refunded' => 'orange',
            default => 'gray',
        };
    }

    /**
     * Mark order as confirmed
     */
    public function markAsConfirmed(): void
    {
        $this->update(['status' => 'confirmed']);
    }

    /**
     * Mark order as processing
     */
    public function markAsProcessing(): void
    {
        $this->update(['status' => 'processing']);
    }

    /**
     * Mark order as shipped
     */
    public function markAsShipped(): void
    {
        $this->update([
            'status' => 'shipped',
            'shipping_status' => 'shipped',
            'shipped_at' => now(),
        ]);
    }

    /**
     * Mark order as delivered
     */
    public function markAsDelivered(): void
    {
        $this->update([
            'status' => 'delivered',
            'shipping_status' => 'delivered',
            'delivered_at' => now(),
        ]);
    }

    /**
     * Mark order as completed
     */
    public function markAsCompleted(): void
    {
        $this->update(['status' => 'completed']);
    }

    /**
     * Cancel order
     */
    public function cancel(): void
    {
        $this->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);
    }

    /**
     * Check if order is confirmed by admin
     */
    public function isAdminConfirmed(): bool
    {
        return $this->admin_confirmed;
    }

    /**
     * Mark order as confirmed by admin
     */
    public function markAsAdminConfirmed(int $adminUserId): void
    {
        $this->update([
            'admin_confirmed' => true,
            'admin_confirmed_at' => now(),
            'admin_confirmed_by' => $adminUserId,
        ]);
    }

    /**
     * Check if vendor can update this order
     */
    public function canVendorUpdate(): bool
    {
        return $this->admin_confirmed && !in_array($this->status, ['cancelled', 'refunded', 'completed']);
    }

    /**
     * Mark order as delivered and request buyer confirmation
     */
    public function markAsDeliveredWithPayment(): void
    {
        $this->update([
            'status' => 'delivered',
            'shipping_status' => 'delivered',
            'delivered_at' => now(),
            'payment_status' => 'pending_confirmation', // Keep pending until buyer confirms
        ]);

        // Create delivery confirmation request
        $this->createDeliveryConfirmationRequest();

        // Send notification to buyer
        $this->user->notify(new \App\Notifications\DeliveryConfirmationRequestNotification($this));
    }

    /**
     * Update payment record when order is delivered
     */
    private function updatePaymentOnDelivery(): void
    {
        // Find existing payment or create new one
        $payment = $this->payments()->where('type', 'payment')->first();

        if ($payment) {
            // Update existing payment
            $payment->update([
                'status' => 'completed',
                'processed_at' => now(),
                'processed_by' => Auth::id(),
                'net_amount' => $this->total_amount,
                'vendor_amount' => $this->calculateVendorAmount(),
                'commission_amount' => $this->calculateCommissionAmount(),
            ]);
        } else {
            // Create new payment record for cash on delivery
            $this->payments()->create([
                'transaction_id' => 'COD-' . $this->order_number . '-' . now()->timestamp,
                'payment_method' => 'cash_on_delivery',
                'gateway' => 'manual',
                'type' => 'payment',
                'status' => 'completed',
                'amount' => $this->total_amount,
                'currency' => $this->currency ?? 'USD',
                'fees' => 0,
                'net_amount' => $this->total_amount,
                'vendor_amount' => $this->calculateVendorAmount(),
                'commission_amount' => $this->calculateCommissionAmount(),
                'vendor_paid' => false,
                'processed_at' => now(),
                'processed_by' => Auth::id(),
                'notes' => 'Payment confirmed on delivery',
            ]);
        }
    }

    /**
     * Calculate vendor amount (total minus commission and platform fees)
     */
    public function calculateVendorAmount(): float
    {
        // Use helper function that accounts for both commission and platform fees
        $payout = calculate_vendor_payout($this->total_amount);
        return $payout['vendor_amount'];
    }

    /**
     * Calculate commission amount
     */
    public function calculateCommissionAmount(): float
    {
        // Use helper function that properly calculates commission
        $payout = calculate_vendor_payout($this->total_amount);
        return $payout['commission'] + $payout['platform_fee'];
    }

    /**
     * Create delivery confirmation request
     */
    private function createDeliveryConfirmationRequest(): void
    {
        $this->deliveryConfirmation()->create([
            'user_id' => $this->user_id,
            'confirmed' => false,
            'delivery_requested_at' => now(),
        ]);
    }

    /**
     * Confirm delivery by buyer and release payment
     */
    public function confirmDeliveryByBuyer(array $proofImages = [], string $notes = null): void
    {
        // Mark delivery as confirmed
        $deliveryConfirmation = $this->deliveryConfirmation;
        if ($deliveryConfirmation) {
            $deliveryConfirmation->markAsConfirmed($proofImages, $notes);
        }

        // Update payment status and create/update payment record
        $this->update(['payment_status' => 'completed']);
        $this->updatePaymentOnDelivery();

        // Notify vendor about confirmed delivery
        if ($this->vendor && $this->vendor->user) {
            $this->vendor->user->notify(new \App\Notifications\DeliveryConfirmedByBuyerNotification($this));
        }
    }

    /**
     * Check if delivery is confirmed by buyer
     */
    public function isDeliveryConfirmed(): bool
    {
        return $this->deliveryConfirmation && $this->deliveryConfirmation->isConfirmed();
    }

    /**
     * Check if delivery confirmation is pending
     */
    public function isDeliveryConfirmationPending(): bool
    {
        return $this->status== 'delivered' &&
               $this->payment_status== 'pending_confirmation' &&
               !$this->isDeliveryConfirmed();
    }
}
