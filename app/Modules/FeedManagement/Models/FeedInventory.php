<?php

namespace App\Modules\FeedManagement\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;

class FeedInventory extends Model
{
    use HasFactory;

    protected $fillable = [
        'feed_type_id',
        'supplier_id',
        'batch_number',
        'internal_code',
        'quantity',
        'original_quantity',
        'reserved_quantity',
        'unit_of_measure',
        'cost_per_unit',
        'total_cost',
        'currency',
        'received_date',
        'production_date',
        'expiry_date',
        'quality_certificates',
        'moisture_content',
        'quality_notes',
        'quality_approved',
        'storage_location',
        'warehouse_section',
        'storage_conditions',
        'temperature_requirement',
        'humidity_requirement',
        'status',
        'status_notes',
        'is_fifo_tracked',
        'reorder_point',
        'low_stock_alert_sent',
        'expiry_alert_sent',
        'purchase_order_number',
        'invoice_number',
        'payment_date',
        'received_by',
        'updated_by'
    ];

    protected $appends = [
        'days_until_expiry',
        'available_quantity'
    ];

    protected $casts = [
        'received_date' => 'date',
        'production_date' => 'date',
        'expiry_date' => 'date',
        'payment_date' => 'date',
        'quantity' => 'decimal:2',
        'original_quantity' => 'decimal:2',
        'reserved_quantity' => 'decimal:2',
        'cost_per_unit' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'moisture_content' => 'decimal:2',
        'temperature_requirement' => 'decimal:2',
        'humidity_requirement' => 'decimal:2',
        'reorder_point' => 'decimal:2',
        'quality_certificates' => 'array',
        'storage_conditions' => 'array',
        'quality_approved' => 'boolean',
        'is_fifo_tracked' => 'boolean',
        'low_stock_alert_sent' => 'boolean',
        'expiry_alert_sent' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    /**
     * Get formatted expiry date
     */
    public function getFormattedExpiryDateAttribute()
    {
        return $this->expiry_date ? $this->expiry_date->format('M d, Y') : null;
    }

    /**
     * Get formatted received date
     */
    public function getFormattedReceivedDateAttribute()
    {
        return $this->received_date ? $this->received_date->format('M d, Y') : null;
    }

    /**
     * Get formatted production date
     */
    public function getFormattedProductionDateAttribute()
    {
        return $this->production_date ? $this->production_date->format('M d, Y') : null;
    }

    /**
     * Get days until expiry accessor
     */
    public function getDaysUntilExpiryAttribute(): ?int
    {
        return $this->getDaysUntilExpiry();
    }

    /**
     * Get available quantity accessor
     */
    public function getAvailableQuantityAttribute(): float
    {
        return $this->getAvailableQuantity();
    }

    /**
     * Feed type for this inventory item
     */
    public function feedType(): BelongsTo
    {
        return $this->belongsTo(FeedType::class);
    }

    /**
     * Supplier for this inventory
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(FeedSupplier::class, 'supplier_id');
    }

    /**
     * Consumption records for this inventory
     */
    public function consumption(): HasMany
    {
        return $this->hasMany(FeedConsumption::class);
    }

    /**
     * User who created this inventory record
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * User who last updated this inventory record
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Check if inventory is expired
     */
    public function isExpired(): bool
    {
        return $this->expiry_date && $this->expiry_date->isPast();
    }

    /**
     * Check if inventory is expiring soon
     */
    public function isExpiringSoon(int $days = 7): bool
    {
        return $this->expiry_date &&
               $this->expiry_date->isBefore(now()->addDays($days));
    }

    /**
     * Check if inventory level is low
     */
    public function isLowStock(): bool
    {
        return $this->getAvailableQuantity() <= ($this->reorder_point ?? 0);
    }

    /**
     * Get available quantity (total - reserved)
     */
    public function getAvailableQuantity(): float
    {
        return max(0, $this->quantity - $this->reserved_quantity);
    }

    /**
     * Get days until expiry
     */
    public function getDaysUntilExpiry(): ?int
    {
        if (!$this->expiry_date) {
            return null;
        }

        return now()->diffInDays($this->expiry_date, false);
    }

    /**
     * Calculate consumption rate (kg per day)
     */
    public function getConsumptionRate(): float
    {
        $consumptions = $this->consumption()
            ->where('consumption_date', '>=', now()->subDays(30))
            ->get();

        if ($consumptions->isEmpty()) {
            return 0;
        }

        $totalConsumed = $consumptions->sum('quantity_kg');
        $daysCovered = $consumptions->first()->consumption_date->diffInDays(
            $consumptions->last()->consumption_date
        ) + 1;

        return $daysCovered > 0 ? $totalConsumed / $daysCovered : 0;
    }

    /**
     * Estimate days until stock runs out
     */
    public function getEstimatedDaysUntilStockOut(): ?int
    {
        $consumptionRate = $this->getConsumptionRate();

        if ($consumptionRate <= 0) {
            return null; // Cannot estimate
        }

        return (int) ceil($this->getAvailableQuantity() / $consumptionRate);
    }

    /**
     * Reserve quantity for planned consumption
     */
    public function reserveQuantity(float $reserveAmount): bool
    {
        if ($reserveAmount > $this->getAvailableQuantity()) {
            return false;
        }

        $this->reserved_quantity += $reserveAmount;
        $this->save();

        return true;
    }

    /**
     * Release reserved quantity
     */
    public function releaseReservedQuantity(float $releaseAmount): bool
    {
        if ($releaseAmount > $this->reserved_quantity) {
            return false;
        }

        $this->reserved_quantity -= $releaseAmount;
        $this->save();

        return true;
    }

    /**
     * Consume inventory quantity
     */
    public function consume(float $consumeAmount, ?string $batchId = null, array $additionalData = []): bool
    {
        if ($consumeAmount > $this->quantity) {
            return false;
        }

        // Update inventory quantities
        $this->quantity -= $consumeAmount;

        // If quantity was reserved, reduce reserved quantity first
        if ($this->reserved_quantity >= $consumeAmount) {
            $this->reserved_quantity -= $consumeAmount;
        } else {
            // Reduce reserved quantity to zero
            $remaining = $consumeAmount - $this->reserved_quantity;
            $this->reserved_quantity = 0;
        }

        // Update status if empty
        if ($this->quantity <= 0) {
            $this->status = 'consumed';
            $this->quantity = 0;
            $this->reserved_quantity = 0;
        }

        $this->save();

        // Create consumption record
        FeedConsumption::create([
            'feed_inventory_id' => $this->id,
            'feed_type_id' => $this->feed_type_id,
            'batch_id' => $batchId,
            'quantity_kg' => $consumeAmount,
            'cost_per_kg' => $this->cost_per_unit,
            'total_cost' => $consumeAmount * $this->cost_per_unit,
            'consumption_date' => now()->toDateString(),
            'consumption_data' => $additionalData,
            'created_by' => Auth::id()
        ]);

        return true;
    }

    /**
     * Get inventory value
     */
    public function getCurrentValue(): float
    {
        return $this->quantity * $this->cost_per_unit;
    }

    /**
     * Get inventory turnover rate
     */
    public function getTurnoverRate(): float
    {
        $totalConsumed = $this->original_quantity - $this->quantity;
        $avgInventory = ($this->original_quantity + $this->quantity) / 2;

        return $avgInventory > 0 ? $totalConsumed / $avgInventory : 0;
    }

    /**
     * Get quality status
     */
    public function getQualityStatus(): array
    {
        $status = [
            'grade' => $this->quality_grade,
            'last_check' => $this->last_quality_check,
            'next_check' => $this->next_quality_check,
            'overdue_check' => $this->next_quality_check && $this->next_quality_check->isPast(),
            'storage_compliance' => $this->checkStorageCompliance()
        ];

        return $status;
    }

    /**
     * Check storage conditions compliance
     */
    public function checkStorageCompliance(): bool
    {
        $required = $this->feedType->storage_requirements ?? [];
        $actual = $this->storage_conditions ?? [];

        // Simplified compliance check
        foreach ($required as $key => $requirement) {
            if (!isset($actual[$key]) || $actual[$key] !== $requirement) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get inventory alerts
     */
    public function getAlerts(): array
    {
        $alerts = [];

        if ($this->isExpired()) {
            $alerts[] = [
                'type' => 'danger',
                'message' => 'Inventory has expired',
                'action' => 'Remove from active stock'
            ];
        } elseif ($this->isExpiringSoon()) {
            $alerts[] = [
                'type' => 'warning',
                'message' => "Expires in {$this->getDaysUntilExpiry()} days",
                'action' => 'Use soon or mark for disposal'
            ];
        }

        if ($this->isLowStock()) {
            $alerts[] = [
                'type' => 'warning',
                'message' => 'Stock level is below reorder point',
                'action' => 'Reorder required'
            ];
        }

        $qualityStatus = $this->getQualityStatus();
        if ($qualityStatus['overdue_check']) {
            $alerts[] = [
                'type' => 'warning',
                'message' => 'Quality check overdue',
                'action' => 'Schedule quality inspection'
            ];
        }

        if (!$qualityStatus['storage_compliance']) {
            $alerts[] = [
                'type' => 'danger',
                'message' => 'Storage conditions not compliant',
                'action' => 'Adjust storage conditions'
            ];
        }

        return $alerts;
    }

    /**
     * Scope for active inventory
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'in_stock');
    }

    /**
     * Scope for low stock items
     */
    public function scopeLowStock($query)
    {
        return $query->whereRaw('available_quantity <= reorder_level');
    }

    /**
     * Scope for expiring items
     */
    public function scopeExpiring($query, int $days = 7)
    {
        return $query->where('expiry_date', '<=', now()->addDays($days))
                    ->where('expiry_date', '>', now());
    }

    /**
     * Scope for expired items
     */
    public function scopeExpired($query)
    {
        return $query->where('expiry_date', '<', now());
    }

    /**
     * Scope by location
     */
    public function scopeAtLocation($query, string $location)
    {
        return $query->where('location', $location);
    }
}
