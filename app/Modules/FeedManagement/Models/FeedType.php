<?php

namespace App\Modules\FeedManagement\Models;

use App\Models\User;
use App\Models\Schedule;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeedType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'category',
        'protein_content',
        'energy_content',
        'calcium_content',
        'phosphorus_content',
        'fiber_content',
        'fat_content',
        'additional_nutrients',
        'cost_per_kg',
        'currency',
        'minimum_order_quantity',
        'unit_of_measure',
        'target_breed',
        'target_age_start',
        'target_age_end',
        'usage_instructions',
        'shelf_life_days',
        'quality_standards',
        'storage_requirements',
        'status',
        'requires_prescription',
        'is_organic',
        'is_medicated',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'additional_nutrients' => 'array',
        'quality_standards' => 'array',
        'cost_per_kg' => 'decimal:2',
        'protein_content' => 'decimal:2',
        'energy_content' => 'decimal:2',
        'calcium_content' => 'decimal:2',
        'phosphorus_content' => 'decimal:2',
        'fiber_content' => 'decimal:2',
        'fat_content' => 'decimal:2',
        'minimum_order_quantity' => 'decimal:2',
        'requires_prescription' => 'boolean',
        'is_organic' => 'boolean',
        'is_medicated' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Feed programs that use this feed type
     */
    public function feedPrograms(): HasMany
    {
        return $this->hasMany(FeedProgram::class);
    }

    /**
     * Inventory records for this feed type
     */
    public function inventory(): HasMany
    {
        return $this->hasMany(FeedInventory::class);
    }

    /**
     * Consumption records for this feed type
     */
    public function consumption(): HasMany
    {
        return $this->hasMany(FeedConsumption::class);
    }

    /**
     * Purchase orders for this feed type
     */
    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(FeedPurchaseOrder::class);
    }

    /**
     * Batch schedules using this feed type
     */
    public function batchSchedules(): HasMany
    {
        return $this->hasMany(Schedule::class, 'feed_type_id');
    }

    /**
     * User who created this feed type
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * User who last updated this feed type
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Check if feed type is suitable for given bird age
     */
    public function isSuitableForAge(int $ageDays): bool
    {
        return $ageDays >= $this->minimum_age_days &&
               $ageDays <= $this->maximum_age_days;
    }

    /**
     * Calculate daily feed requirement for given number of birds
     */
    public function calculateDailyRequirement(int $birdCount): float
    {
        return ($this->consumption_rate_per_bird_grams * $birdCount) / 1000; // Convert to kg
    }

    /**
     * Get current inventory level
     */
    public function getCurrentInventory(): float
    {
        return $this->inventory()
            ->where('status', 'in_stock')
            ->sum('current_quantity');
    }

    /**
     * Check if inventory is low
     */
    public function isInventoryLow(): bool
    {
        $current = $this->getCurrentInventory();
        $reorderLevel = $this->inventory()
            ->where('status', 'in_stock')
            ->avg('reorder_level') ?? 0;

        return $current <= $reorderLevel;
    }

    /**
     * Get feed efficiency metrics
     */
    public function getEfficiencyMetrics(): array
    {
        $consumptions = $this->consumption()
            ->with('batch')
            ->where('created_at', '>=', now()->subMonths(3))
            ->get();

        $totalFeed = $consumptions->sum('quantity_kg');
        $totalBirds = $consumptions->sum(function ($consumption) {
            return $consumption->batch?->current_bird_count ?? 0;
        });

        return [
            'total_feed_consumed_kg' => $totalFeed,
            'total_birds_fed' => $totalBirds,
            'average_feed_per_bird_kg' => $totalBirds > 0 ? $totalFeed / $totalBirds : 0,
            'feed_conversion_efficiency' => $this->feed_conversion_ratio,
            'cost_per_kg_produced' => $this->price_per_kg * $this->feed_conversion_ratio
        ];
    }

    /**
     * Get nutritional analysis
     */
    public function getNutritionalAnalysis(): array
    {
        return [
            'energy_density' => $this->energy_kcal_per_kg,
            'protein_content' => $this->protein_percentage,
            'digestibility_index' => 100 - $this->fiber_percentage, // Simplified calculation
            'mineral_balance' => [
                'calcium' => $this->calcium_percentage,
                'phosphorus' => $this->phosphorus_percentage,
                'ca_p_ratio' => $this->phosphorus_percentage > 0 ?
                    $this->calcium_percentage / $this->phosphorus_percentage : 0
            ],
            'fat_content' => $this->fat_percentage,
            'fiber_content' => $this->fiber_percentage
        ];
    }

    /**
     * Scope for active feed types
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for feed types suitable for age range
     */
    public function scopeForAge($query, int $ageDays)
    {
        return $query->where('minimum_age_days', '<=', $ageDays)
                    ->where('maximum_age_days', '>=', $ageDays);
    }

    /**
     * Scope for feed types by category
     */
    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope for low inventory feed types
     */
    public function scopeLowInventory($query)
    {
        return $query->whereHas('inventory', function ($q) {
            $q->whereRaw('current_quantity <= reorder_level')
              ->where('status', 'in_stock');
        });
    }
}
