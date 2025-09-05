<?php

namespace App\Modules\FeedManagement\Services;

use App\Modules\FeedManagement\Models\FeedType;
use App\Modules\FeedManagement\Models\FeedProgram;
use App\Modules\FeedManagement\Models\FeedInventory;
use App\Modules\FeedManagement\Models\FeedConsumption;
use App\Modules\FeedManagement\Models\FeedPurchaseOrder;
use App\Models\Schedule;
use App\Modules\FeedManagement\Constants\FeedConstants;
use App\Modules\FeedManagement\Enums\FeedCategory;
use App\Modules\FeedManagement\Enums\InventoryStatus;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class FeedManagementService
{
    /**
     * Get feed recommendations for a batch based on age and requirements
     */
    public function getFeedRecommendationsForBatch(string $batchId, int $birdAgeDays, int $birdCount): array
    {
        // Get appropriate feed types for the age
        $suitableFeedTypes = FeedType::active()
            ->forAge($birdAgeDays)
            ->with(['inventory' => function ($query) {
                $query->active();
            }])
            ->get();

        $recommendations = [];

        foreach ($suitableFeedTypes as $feedType) {
            $dailyRequirement = $feedType->calculateDailyRequirement($birdCount);
            $availableInventory = $feedType->getCurrentInventory();
            $daysOfStock = $availableInventory > 0 ? $availableInventory / $dailyRequirement : 0;

            $recommendations[] = [
                'feed_type' => $feedType,
                'daily_requirement_kg' => $dailyRequirement,
                'available_stock_kg' => $availableInventory,
                'days_of_stock' => round($daysOfStock, 1),
                'suitable' => $daysOfStock >= 1, // At least 1 day of stock
                'cost_per_day' => $dailyRequirement * $feedType->price_per_kg,
                'nutritional_suitability' => $this->calculateNutritionalSuitability($feedType, $birdAgeDays)
            ];
        }

        // Sort by suitability and availability
        usort($recommendations, function ($a, $b) {
            if ($a['suitable'] !== $b['suitable']) {
                return $b['suitable'] - $a['suitable']; // Suitable feeds first
            }
            return $b['days_of_stock'] <=> $a['days_of_stock']; // More stock first
        });

        return $recommendations;
    }

    /**
     * Create feed schedule for a batch
     */
    public function createFeedScheduleForBatch(string $batchId, int $feedTypeId, int $feedProgramId, Carbon $scheduleDate, array $options = []): Schedule
    {
        $feedType = FeedType::findOrFail($feedTypeId);
        $feedProgram = FeedProgram::findOrFail($feedProgramId);

        // Get batch information (you'll need to implement this based on your BatchIncubator module)
        $batchInfo = $this->getBatchInfo($batchId);
        $birdCount = $batchInfo['bird_count'] ?? 0;
        $birdAge = $batchInfo['bird_age_days'] ?? 0;

        // Calculate quantities
        $recommendedQuantity = $feedProgram->calculateDailyRequirement($birdCount);
        $feedingSchedule = $feedProgram->getDailyFeedingSchedule();

        // Create the schedule entry
        $schedule = Schedule::create([
            'batch_id' => $batchId,
            'task_type' => 'feeding',
            'title' => "Feed with {$feedType->name}",
            'description' => "Daily feeding schedule using {$feedProgram->name}",
            'scheduled_date' => $scheduleDate->toDateString(),
            'scheduled_time' => $feedingSchedule[0]['time'] ?? '08:00',
            'priority' => $options['priority'] ?? 'normal',
            'estimated_duration' => $options['duration'] ?? 30, // 30 minutes default
            'assigned_to' => $options['assigned_to'] ?? null,
            'status' => 'pending',

            // Feed-related fields
            'feed_type_id' => $feedTypeId,
            'feed_program_id' => $feedProgramId,
            'planned_quantity' => $recommendedQuantity,
            'feed_data' => [
                'feeding_schedule' => $feedingSchedule,
                'bird_count' => $birdCount,
                'bird_age_days' => $birdAge,
                'feed_conversion_target' => $feedProgram->feed_conversion_target,
                'cost_estimate' => $recommendedQuantity * $feedType->price_per_kg,
                'special_instructions' => $feedProgram->special_instructions
            ]
        ]);

        // Reserve inventory if requested
        if ($options['reserve_inventory'] ?? false) {
            $this->reserveInventoryForSchedule($schedule);
        }

        return $schedule;
    }

    /**
     * Process feed consumption and update inventory
     */
    public function processFeedConsumption(int $scheduleId, float $actualQuantityUsed, array $consumptionData = []): FeedConsumption
    {
        $schedule = Schedule::findOrFail($scheduleId);

        if (!$schedule->feed_type_id) {
            throw new \Exception('Schedule is not a feeding schedule');
        }

        $feedType = $schedule->feedType;

        // Find the best inventory to consume from (FIFO)
        $inventory = $this->findBestInventoryForConsumption($schedule->feed_type_id, $actualQuantityUsed);

        if (!$inventory) {
            throw new \Exception('No suitable inventory available for consumption');
        }

        // Consume from inventory
        $consumed = $inventory->consume($actualQuantityUsed, $schedule->batch_id, $consumptionData);

        if (!$consumed) {
            throw new \Exception('Failed to consume inventory - insufficient stock');
        }

        // Update schedule with actual consumption
        $schedule->update([
            'actual_quantity' => $actualQuantityUsed,
            'feed_cost' => $actualQuantityUsed * $inventory->cost_per_unit,
            'completed_at' => now(),
            'status' => 'completed',
            'feed_data' => array_merge($schedule->feed_data ?? [], [
                'actual_consumption' => $actualQuantityUsed,
                'inventory_used' => $inventory->batch_number,
                'consumption_efficiency' => $this->calculateConsumptionEfficiency($schedule, $actualQuantityUsed),
                'waste_percentage' => $consumptionData['waste_percentage'] ?? 0
            ])
        ]);

        // Get the consumption record that was created
        $consumption = FeedConsumption::where('feed_inventory_id', $inventory->id)
            ->where('schedule_id', $scheduleId)
            ->latest()
            ->first();

        // Check for low inventory alerts
        $this->checkInventoryAlerts($inventory);

        return $consumption;
    }

    /**
     * Generate feed program for a batch based on age and requirements
     */
    public function generateFeedProgramForBatch(string $batchId, array $requirements = []): FeedProgram
    {
        $batchInfo = $this->getBatchInfo($batchId);
        $birdType = $requirements['bird_type'] ?? 'broiler';
        $startAge = $batchInfo['bird_age_days'] ?? 0;
        $endAge = $requirements['end_age'] ?? 49; // Default broiler cycle

        // Determine feed category based on age
        $category = $this->determineFeedCategory($startAge, $birdType);

        // Get nutritional requirements
        $nutritionalReqs = FeedConstants::getNutritionalRequirements($category);

        // Find suitable feed type
        $feedType = FeedType::active()
            ->byCategory($category)
            ->forAge($startAge)
            ->first();

        if (!$feedType) {
            throw new \Exception("No suitable feed type found for {$category} category");
        }

        // Calculate feeding parameters
        $dailyQuantity = $this->calculateDailyQuantity($startAge, $birdType);
        $feedingFrequency = FeedConstants::DEFAULT_FEEDING_FREQUENCY[$category] ?? 3;
        $feedingTimes = FeedConstants::getFeedingTimes($feedingFrequency);

        // Create feed program
        $feedProgram = FeedProgram::create([
            'name' => "Auto-generated program for Batch {$batchId}",
            'description' => "Automatically generated feeding program based on batch requirements",
            'feed_type_id' => $feedType->id,
            'target_bird_type' => $birdType,
            'start_age_days' => $startAge,
            'end_age_days' => $endAge,
            'daily_quantity_per_bird_grams' => $dailyQuantity,
            'feeding_frequency' => $feedingFrequency,
            'feeding_times' => $feedingTimes,
            'special_instructions' => $this->generateSpecialInstructions($category, $startAge),
            'program_data' => [
                'auto_generated' => true,
                'batch_id' => $batchId,
                'nutritional_requirements' => $nutritionalReqs,
                'generation_date' => now()->toISOString()
            ],
            'is_active' => true,
            'cost_per_bird_per_day' => ($dailyQuantity / 1000) * $feedType->price_per_kg,
            'expected_weight_gain_grams_per_day' => $this->calculateExpectedWeightGain($category, $startAge),
            'feed_conversion_target' => $feedType->feed_conversion_ratio ?? FeedConstants::DEFAULT_FEED_CONVERSION_RATIO,
            'created_by' => Auth::id()
        ]);

        return $feedProgram;
    }

    /**
     * Get feed analytics for a batch or date range
     */
    public function getFeedAnalytics(array $filters = []): array
    {
        $query = FeedConsumption::query()
            ->with(['feedType', 'batch', 'feedInventory'])
            ->verified();

        // Apply filters
        if (isset($filters['batch_id'])) {
            $query->forBatch($filters['batch_id']);
        }

        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $query->inDateRange($filters['start_date'], $filters['end_date']);
        }

        if (isset($filters['feed_type_id'])) {
            $query->forFeedType($filters['feed_type_id']);
        }

        $consumptions = $query->get();

        return [
            'total_consumption_kg' => $consumptions->sum('quantity_kg'),
            'total_cost' => $consumptions->sum('total_cost'),
            'average_feed_conversion' => $consumptions->avg('feed_conversion_actual'),
            'average_waste_percentage' => $consumptions->avg(function ($consumption) {
                return $consumption->getWastePercentage();
            }),
            'feed_efficiency_rating' => $this->calculateFeedEfficiencyRating($consumptions),
            'cost_per_kg_produced' => $this->calculateCostPerKgProduced($consumptions),
            'daily_averages' => $this->calculateDailyAverages($consumptions),
            'trend_analysis' => $this->analyzeTrends($consumptions),
            'recommendations' => $this->generateAnalyticsRecommendations($consumptions)
        ];
    }

    /**
     * Get low inventory alerts
     */
    public function getLowInventoryAlerts(): Collection
    {
        return FeedInventory::lowStock()
            ->with(['feedType', 'supplier'])
            ->get()
            ->map(function ($inventory) {
                return [
                    'inventory' => $inventory,
                    'alert_level' => $this->calculateAlertLevel($inventory),
                    'recommended_order_quantity' => $this->calculateRecommendedOrderQuantity($inventory),
                    'estimated_cost' => $this->estimateReorderCost($inventory),
                    'days_until_stockout' => $inventory->getEstimatedDaysUntilStockOut()
                ];
            });
    }

    /**
     * Calculate nutritional suitability score
     */
    private function calculateNutritionalSuitability(FeedType $feedType, int $birdAgeDays): float
    {
        $category = $this->determineFeedCategory($birdAgeDays, 'broiler');
        $requirements = FeedConstants::getNutritionalRequirements($category);

        $score = 0;
        $maxScore = 4; // protein, energy, calcium, phosphorus

        // Check protein
        if ($feedType->protein_percentage >= $requirements['protein']['min'] &&
            $feedType->protein_percentage <= $requirements['protein']['max']) {
            $score++;
        }

        // Check energy
        if ($feedType->energy_kcal_per_kg >= $requirements['energy']['min'] &&
            $feedType->energy_kcal_per_kg <= $requirements['energy']['max']) {
            $score++;
        }

        // Check calcium
        if ($feedType->calcium_percentage >= $requirements['calcium']['min'] &&
            $feedType->calcium_percentage <= $requirements['calcium']['max']) {
            $score++;
        }

        // Check phosphorus
        if ($feedType->phosphorus_percentage >= $requirements['phosphorus']['min'] &&
            $feedType->phosphorus_percentage <= $requirements['phosphorus']['max']) {
            $score++;
        }

        return ($score / $maxScore) * 100;
    }

    /**
     * Determine feed category based on age and bird type
     */
    private function determineFeedCategory(int $ageDays, string $birdType = 'broiler'): string
    {
        if ($birdType === 'layer') {
            return $ageDays >= 140 ? FeedCategory::LAYER : FeedCategory::GROWER;
        }

        if ($ageDays <= 21) return FeedCategory::STARTER;
        if ($ageDays <= 42) return FeedCategory::GROWER;
        return FeedCategory::FINISHER;
    }

    /**
     * Calculate daily quantity based on age and bird type
     */
    private function calculateDailyQuantity(int $ageDays, string $birdType): float
    {
        $baseConsumption = 50; // Base consumption in grams
        $multiplier = FeedConstants::getConsumptionMultiplier($ageDays);

        // Adjust for bird type
        $typeMultiplier = match($birdType) {
            'layer' => 1.1,
            'breeder' => 1.15,
            'turkey' => 1.5,
            default => 1.0
        };

        return $baseConsumption * $multiplier * $typeMultiplier;
    }

    /**
     * Calculate expected weight gain
     */
    private function calculateExpectedWeightGain(string $category, int $ageDays): float
    {
        return match($category) {
            FeedCategory::STARTER => 15 + ($ageDays * 0.5),
            FeedCategory::GROWER => 25 + (($ageDays - 21) * 0.8),
            FeedCategory::FINISHER => 35 + (($ageDays - 42) * 0.6),
            default => 20
        };
    }

    /**
     * Generate special instructions based on category and age
     */
    private function generateSpecialInstructions(string $category, int $ageDays): array
    {
        $instructions = [];

        if ($ageDays <= 7) {
            $instructions[] = "Monitor birds closely during first week";
            $instructions[] = "Ensure easy access to feed and water";
            $instructions[] = "Check feeding frequency every 2 hours";
        }

        if ($category === FeedCategory::STARTER) {
            $instructions[] = "Use crumbled feed for easy consumption";
            $instructions[] = "Maintain consistent feeding times";
        }

        if ($category === FeedCategory::FINISHER) {
            $instructions[] = "Monitor for optimal weight gain";
            $instructions[] = "Reduce feeding frequency as birds mature";
        }

        return $instructions;
    }

    /**
     * Find best inventory for consumption (FIFO)
     */
    private function findBestInventoryForConsumption(int $feedTypeId, float $requiredQuantity): ?FeedInventory
    {
        return FeedInventory::where('feed_type_id', $feedTypeId)
            ->where('status', 'available')
            ->whereRaw('(quantity - reserved_quantity) >= ?', [$requiredQuantity])
            ->orderBy('expiry_date')
            ->orderBy('received_date')
            ->first();
    }

    /**
     * Reserve inventory for a schedule
     */
    private function reserveInventoryForSchedule(Schedule $schedule): bool
    {
        $inventory = $this->findBestInventoryForConsumption(
            $schedule->feed_type_id,
            $schedule->planned_quantity
        );

        if ($inventory) {
            return $inventory->reserveQuantity($schedule->planned_quantity);
        }

        return false;
    }

    /**
     * Calculate consumption efficiency
     */
    private function calculateConsumptionEfficiency(Schedule $schedule, float $actualQuantity): float
    {
        $plannedQuantity = $schedule->planned_quantity ?? 0;

        if ($plannedQuantity <= 0) {
            return 0;
        }

        $efficiency = ($plannedQuantity / $actualQuantity) * 100;
        return min(100, max(0, $efficiency)); // Clamp between 0 and 100
    }

    /**
     * Check inventory alerts
     */
    private function checkInventoryAlerts(FeedInventory $inventory): void
    {
        // Check low stock
        if ($inventory->isLowStock() && !$inventory->low_stock_alert_sent) {
            // Send low stock alert (implement notification logic)
            $inventory->update(['low_stock_alert_sent' => true]);
        }

        // Check expiry
        if ($inventory->isExpiringSoon(FeedConstants::EXPIRY_WARNING_DAYS) && !$inventory->expiry_alert_sent) {
            // Send expiry alert (implement notification logic)
            $inventory->update(['expiry_alert_sent' => true]);
        }
    }

    /**
     * Get batch info (implement based on BatchIncubator module)
     */
    private function getBatchInfo(string $batchId): array
    {
        // This should integrate with your BatchIncubator module
        // For now, return mock data
        return [
            'bird_count' => 1000,
            'bird_age_days' => 14,
            'breed' => 'broiler',
            'hatch_date' => now()->subDays(14)
        ];
    }

    /**
     * Calculate alert level
     */
    private function calculateAlertLevel(FeedInventory $inventory): string
    {
        $daysUntilStockout = $inventory->getEstimatedDaysUntilStockOut();

        if ($daysUntilStockout === null) return 'unknown';
        if ($daysUntilStockout <= 1) return 'critical';
        if ($daysUntilStockout <= 3) return 'high';
        if ($daysUntilStockout <= 7) return 'medium';
        return 'low';
    }

    /**
     * Calculate recommended order quantity
     */
    private function calculateRecommendedOrderQuantity(FeedInventory $inventory): float
    {
        $dailyConsumption = $inventory->getConsumptionRate();
        $leadTimeDays = $inventory->supplier->delivery_time_days ?? 7;

        return FeedConstants::calculateReorderQuantity($dailyConsumption, $leadTimeDays * 2);
    }

    /**
     * Estimate reorder cost
     */
    private function estimateReorderCost(FeedInventory $inventory): float
    {
        $quantity = $this->calculateRecommendedOrderQuantity($inventory);
        $unitPrice = $inventory->feedType->price_per_kg;

        return $quantity * $unitPrice;
    }

    /**
     * Calculate feed efficiency rating
     */
    private function calculateFeedEfficiencyRating(Collection $consumptions): string
    {
        $avgFCR = $consumptions->avg('feed_conversion_actual');
        return FeedConstants::getFCRRating($avgFCR ?? 2.0);
    }

    /**
     * Calculate cost per kg produced
     */
    private function calculateCostPerKgProduced(Collection $consumptions): float
    {
        $totalCost = $consumptions->sum('total_cost');
        $totalFeed = $consumptions->sum('quantity_kg');
        $avgFCR = $consumptions->avg('feed_conversion_actual') ?? 2.0;

        if ($totalFeed <= 0 || $avgFCR <= 0) return 0;

        $totalMeatProduced = $totalFeed / $avgFCR;
        return $totalMeatProduced > 0 ? $totalCost / $totalMeatProduced : 0;
    }

    /**
     * Calculate daily averages
     */
    private function calculateDailyAverages(Collection $consumptions): array
    {
        $dailyData = $consumptions->groupBy(function ($consumption) {
            return $consumption->consumption_date;
        });

        return $dailyData->map(function ($dayConsumptions) {
            return [
                'total_consumption' => $dayConsumptions->sum('quantity_kg'),
                'total_cost' => $dayConsumptions->sum('total_cost'),
                'average_fcr' => $dayConsumptions->avg('feed_conversion_actual'),
                'record_count' => $dayConsumptions->count()
            ];
        })->toArray();
    }

    /**
     * Analyze trends
     */
    private function analyzeTrends(Collection $consumptions): array
    {
        if ($consumptions->count() < 2) {
            return ['insufficient_data' => true];
        }

        $sorted = $consumptions->sortBy('consumption_date');
        $first = $sorted->first();
        $last = $sorted->last();

        $fcrTrend = $this->calculateTrend($first->feed_conversion_actual, $last->feed_conversion_actual);
        $costTrend = $this->calculateTrend($first->total_cost, $last->total_cost);

        return [
            'fcr_trend' => $fcrTrend,
            'cost_trend' => $costTrend,
            'period_days' => $first->consumption_date->diffInDays($last->consumption_date),
            'improvement_rate' => $fcrTrend['percentage']
        ];
    }

    /**
     * Calculate trend percentage
     */
    private function calculateTrend($firstValue, $lastValue): array
    {
        if ($firstValue <= 0) {
            return ['direction' => 'unknown', 'percentage' => 0];
        }

        $change = (($lastValue - $firstValue) / $firstValue) * 100;

        return [
            'direction' => $change > 0 ? 'increasing' : ($change < 0 ? 'decreasing' : 'stable'),
            'percentage' => abs($change)
        ];
    }

    /**
     * Generate analytics recommendations
     */
    private function generateAnalyticsRecommendations(Collection $consumptions): array
    {
        $recommendations = [];

        $avgFCR = $consumptions->avg('feed_conversion_actual');
        $avgWaste = $consumptions->avg(function ($c) { return $c->getWastePercentage(); });

        if ($avgFCR > 2.2) {
            $recommendations[] = [
                'type' => 'efficiency',
                'message' => 'Feed conversion ratio is above target. Consider reviewing feed quality or feeding practices.',
                'priority' => 'high'
            ];
        }

        if ($avgWaste > 10) {
            $recommendations[] = [
                'type' => 'waste',
                'message' => 'Feed waste percentage is high. Review feeding methods and storage practices.',
                'priority' => 'medium'
            ];
        }

        $poorConsumptions = $consumptions->filter(function ($c) {
            return $c->getFeedConversionRating() === 'poor';
        });

        if ($poorConsumptions->count() > $consumptions->count() * 0.3) {
            $recommendations[] = [
                'type' => 'quality',
                'message' => 'High number of poor feed conversion records. Consider feed quality assessment.',
                'priority' => 'high'
            ];
        }

        return $recommendations;
    }
}
