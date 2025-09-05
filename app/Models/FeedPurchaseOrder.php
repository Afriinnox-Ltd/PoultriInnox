<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class FeedPurchaseOrder extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'order_number',
        'feed_type_id',
        'feed_supplier_id',
        'quantity_ordered',
        'quantity_received',
        'unit_price',
        'total_amount',
        'discount_amount',
        'tax_amount',
        'final_amount',
        'order_date',
        'expected_delivery_date',
        'delivered_at',
        'payment_due_date',
        'paid_at',
        'status',
        'payment_status',
        'delivery_status',
        'priority',
        'order_data',
        'delivery_address',
        'special_instructions',
        'quality_requirements',
        'payment_method',
        'invoice_number',
        'tracking_number',
        'notes',
        'created_by',
        'updated_by',
        'approved_by',
        'received_by'
    ];

    protected $casts = [
        'order_date' => 'date',
        'expected_delivery_date' => 'date',
        'delivered_at' => 'datetime',
        'payment_due_date' => 'date',
        'paid_at' => 'datetime',
        'quantity_ordered' => 'decimal:2',
        'quantity_received' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'final_amount' => 'decimal:2',
        'order_data' => 'array',
        'quality_requirements' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    /**
     * Feed type for this order
     */
    public function feedType(): BelongsTo
    {
        return $this->belongsTo(FeedType::class);
    }

    /**
     * Supplier for this order
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(FeedSupplier::class, 'feed_supplier_id');
    }

    /**
     * User who created this order
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * User who last updated this order
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * User who approved this order
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * User who received this order
     */
    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    /**
     * Inventory items created from this order
     */
    public function inventoryItems(): HasMany
    {
        return $this->hasMany(FeedInventory::class, 'purchase_order_id');
    }

    /**
     * Generate unique order number
     */
    public static function generateOrderNumber(): string
    {
        $prefix = 'PO';
        $date = now()->format('Ymd');
        $sequence = self::whereDate('created_at', today())->count() + 1;

        return sprintf('%s-%s-%04d', $prefix, $date, $sequence);
    }

    /**
     * Calculate order summary
     */
    public function getOrderSummary(): array
    {
        return [
            'subtotal' => $this->total_amount,
            'discount' => $this->discount_amount ?? 0,
            'tax' => $this->tax_amount ?? 0,
            'final_total' => $this->final_amount,
            'savings' => $this->discount_amount ?? 0,
            'tax_rate' => $this->total_amount > 0 ? (($this->tax_amount ?? 0) / $this->total_amount) * 100 : 0
        ];
    }

    /**
     * Check if order is overdue for delivery
     */
    public function isOverdue(): bool
    {
        return $this->expected_delivery_date &&
               $this->expected_delivery_date->isPast() &&
               !in_array($this->status, ['delivered', 'cancelled']);
    }

    /**
     * Check if payment is overdue
     */
    public function isPaymentOverdue(): bool
    {
        return $this->payment_due_date &&
               $this->payment_due_date->isPast() &&
               $this->payment_status !== 'paid';
    }

    /**
     * Get delivery performance
     */
    public function getDeliveryPerformance(): array
    {
        if (!$this->delivered_at || !$this->expected_delivery_date) {
            return [
                'delivered_on_time' => null,
                'days_early_late' => null,
                'performance_rating' => 'pending'
            ];
        }

        $daysDifference = $this->expected_delivery_date->diffInDays($this->delivered_at, false);
        $onTime = $daysDifference <= 0;

        return [
            'delivered_on_time' => $onTime,
            'days_early_late' => $daysDifference,
            'performance_rating' => $this->getPerformanceRating($daysDifference)
        ];
    }

    /**
     * Get performance rating based on delivery timing
     */
    private function getPerformanceRating(int $daysDifference): string
    {
        if ($daysDifference <= -2) return 'excellent'; // 2+ days early
        if ($daysDifference <= 0) return 'good'; // On time or 1 day early
        if ($daysDifference <= 2) return 'acceptable'; // 1-2 days late
        if ($daysDifference <= 7) return 'poor'; // 3-7 days late
        return 'very_poor'; // More than 7 days late
    }

    /**
     * Calculate quantity variance
     */
    public function getQuantityVariance(): array
    {
        $variance = $this->quantity_received - $this->quantity_ordered;
        $variancePercentage = $this->quantity_ordered > 0 ?
            ($variance / $this->quantity_ordered) * 100 : 0;

        return [
            'ordered' => $this->quantity_ordered,
            'received' => $this->quantity_received ?? 0,
            'variance_kg' => $variance,
            'variance_percentage' => $variancePercentage,
            'complete_delivery' => abs($variancePercentage) <= 5 // 5% tolerance
        ];
    }

    /**
     * Update order status based on conditions
     */
    public function updateOrderStatus(): string
    {
        $oldStatus = $this->status;

        if ($this->status === 'cancelled') {
            return $this->status; // Don't change cancelled orders
        }

        if ($this->delivered_at && $this->quantity_received > 0) {
            $this->status = 'delivered';
            $this->delivery_status = 'completed';
        } elseif ($this->tracking_number && $this->status === 'confirmed') {
            $this->status = 'shipped';
            $this->delivery_status = 'in_transit';
        }

        if ($this->paid_at) {
            $this->payment_status = 'paid';
        } elseif ($this->isPaymentOverdue()) {
            $this->payment_status = 'overdue';
        }

        if ($oldStatus !== $this->status) {
            $this->save();
        }

        return $this->status;
    }

    /**
     * Approve order
     */
    public function approve(int $approvedBy): bool
    {
        if ($this->status !== 'pending') {
            return false;
        }

        $this->status = 'confirmed';
        $this->approved_by = $approvedBy;

        return $this->save();
    }

    /**
     * Cancel order
     */
    public function cancel(string $reason = null): bool
    {
        if (in_array($this->status, ['delivered', 'cancelled'])) {
            return false;
        }

        $this->status = 'cancelled';
        $this->notes = $this->notes . "\nCancelled: " . ($reason ?? 'No reason provided');

        return $this->save();
    }

    /**
     * Mark as received
     */
    public function markReceived(float $quantityReceived, int $receivedBy, array $qualityNotes = []): bool
    {
        if ($this->status === 'cancelled') {
            return false;
        }

        $this->quantity_received = $quantityReceived;
        $this->delivered_at = now();
        $this->received_by = $receivedBy;
        $this->status = 'delivered';
        $this->delivery_status = 'completed';

        if (!empty($qualityNotes)) {
            $this->order_data = array_merge($this->order_data ?? [], [
                'quality_inspection' => $qualityNotes
            ]);
        }

        $saved = $this->save();

        if ($saved) {
            // Create inventory record
            $this->createInventoryRecord($qualityNotes);
        }

        return $saved;
    }

    /**
     * Create inventory record from received order
     */
    private function createInventoryRecord(array $qualityNotes = []): FeedInventory
    {
        $expiryDate = now()->addDays($this->feedType->shelf_life_days ?? 365);

        return FeedInventory::create([
            'feed_type_id' => $this->feed_type_id,
            'batch_number' => $this->generateInventoryBatchNumber(),
            'supplier_batch_reference' => $this->order_data['supplier_batch'] ?? null,
            'received_date' => $this->delivered_at->toDateString(),
            'expiry_date' => $expiryDate,
            'initial_quantity' => $this->quantity_received,
            'current_quantity' => $this->quantity_received,
            'available_quantity' => $this->quantity_received,
            'cost_per_kg' => $this->unit_price,
            'total_cost' => $this->quantity_received * $this->unit_price,
            'status' => 'in_stock',
            'location' => $this->order_data['storage_location'] ?? 'default',
            'storage_conditions' => $this->feedType->storage_requirements ?? [],
            'quality_grade' => $qualityNotes['grade'] ?? 'A',
            'inventory_data' => [
                'purchase_order_id' => $this->id,
                'supplier_id' => $this->feed_supplier_id,
                'quality_inspection' => $qualityNotes
            ],
            'reorder_level' => $this->calculateReorderLevel(),
            'reorder_quantity' => $this->quantity_ordered, // Use same quantity for reorder
            'next_quality_check' => now()->addDays(30),
            'created_by' => $this->received_by
        ]);
    }

    /**
     * Generate inventory batch number
     */
    private function generateInventoryBatchNumber(): string
    {
        $date = now()->format('Ymd');
        $feedCode = strtoupper(substr($this->feedType->name, 0, 3));
        $sequence = FeedInventory::whereDate('created_at', today())->count() + 1;

        return sprintf('INV-%s-%s-%03d', $date, $feedCode, $sequence);
    }

    /**
     * Calculate reorder level based on consumption patterns
     */
    private function calculateReorderLevel(): float
    {
        // Get average daily consumption for this feed type
        $avgDailyConsumption = FeedConsumption::where('feed_type_id', $this->feed_type_id)
            ->where('consumption_date', '>=', now()->subDays(30))
            ->avg('quantity_kg') ?? 10; // Default 10kg if no history

        // Safety stock for lead time + buffer
        $leadTimeDays = $this->supplier->delivery_time_days ?? 7;
        $bufferDays = 3; // Extra safety buffer

        return $avgDailyConsumption * ($leadTimeDays + $bufferDays);
    }

    /**
     * Get order tracking information
     */
    public function getTrackingInfo(): array
    {
        return [
            'order_number' => $this->order_number,
            'tracking_number' => $this->tracking_number,
            'status' => $this->status,
            'delivery_status' => $this->delivery_status,
            'payment_status' => $this->payment_status,
            'order_date' => $this->order_date,
            'expected_delivery' => $this->expected_delivery_date,
            'actual_delivery' => $this->delivered_at,
            'is_overdue' => $this->isOverdue(),
            'supplier' => $this->supplier->name ?? 'Unknown',
            'quantity_summary' => $this->getQuantityVariance()
        ];
    }

    /**
     * Scope for orders by status
     */
    public function scopeWithStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for overdue orders
     */
    public function scopeOverdue($query)
    {
        return $query->where('expected_delivery_date', '<', now())
                    ->whereNotIn('status', ['delivered', 'cancelled']);
    }

    /**
     * Scope for orders by date range
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('order_date', [$startDate, $endDate]);
    }

    /**
     * Scope for orders by supplier
     */
    public function scopeForSupplier($query, $supplierId)
    {
        return $query->where('feed_supplier_id', $supplierId);
    }

    /**
     * Scope for orders by feed type
     */
    public function scopeForFeedType($query, $feedTypeId)
    {
        return $query->where('feed_type_id', $feedTypeId);
    }

    /**
     * Scope for pending approval
     */
    public function scopePendingApproval($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for active orders (not cancelled or delivered)
     */
    public function scopeActive($query)
    {
        return $query->whereNotIn('status', ['cancelled', 'delivered']);
    }
}
