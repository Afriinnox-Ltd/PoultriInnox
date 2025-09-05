<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class FeedType extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'category',
        'description',
        'nutritional_data',
        'is_active',
        'price_per_kg',
        'manufacturer',
        'sku',
        'storage_requirements',
        'minimum_age_days',
        'maximum_age_days',
        'consumption_rate_per_bird_grams',
        'bulk_density_kg_per_cubic_meter',
        'shelf_life_days',
        'feed_conversion_ratio',
        'protein_percentage',
        'energy_kcal_per_kg',
        'fiber_percentage',
        'fat_percentage',
        'calcium_percentage',
        'phosphorus_percentage',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'nutritional_data' => 'array',
        'storage_requirements' => 'array',
        'is_active' => 'boolean',
        'price_per_kg' => 'decimal:2',
        'consumption_rate_per_bird_grams' => 'decimal:2',
        'bulk_density_kg_per_cubic_meter' => 'decimal:2',
        'feed_conversion_ratio' => 'decimal:3',
        'protein_percentage' => 'decimal:2',
        'energy_kcal_per_kg' => 'decimal:2',
        'fiber_percentage' => 'decimal:2',
        'fat_percentage' => 'decimal:2',
        'calcium_percentage' => 'decimal:2',
        'phosphorus_percentage' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
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
