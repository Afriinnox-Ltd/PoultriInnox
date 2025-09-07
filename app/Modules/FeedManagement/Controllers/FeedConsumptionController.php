<?php

namespace App\Modules\FeedManagement\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\FeedManagement\Models\FeedConsumption;
use App\Modules\FeedManagement\Models\FeedType;
use App\Modules\FeedManagement\Models\FeedInventory;
use App\Models\Module;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class FeedConsumptionController extends Controller
{
    /**
     * Display feed consumption tracking
     */
    public function index(Request $request)
    {
        $query = FeedConsumption::with(['feedType', 'batch', 'feedInventory', 'creator']);

        // Filter by date range
        if ($request->date_from) {
            $query->where('consumption_date', '>=', $request->date_from);
        }
        if ($request->date_to) {
            $query->where('consumption_date', '<=', $request->date_to);
        }

        // Filter by batch
        if ($request->batch_id && $request->batch_id !== 'all') {
            $query->where('batch_id', $request->batch_id);
        }

        // Filter by feed type
        if ($request->feed_type && $request->feed_type !== 'all') {
            $query->where('feed_type_id', $request->feed_type);
        }

        // Search functionality
        if ($request->search) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->whereHas('batch', function ($bq) use ($searchTerm) {
                    $bq->where('batch_code', 'like', "%{$searchTerm}%");
                })
                ->orWhereHas('feedType', function ($fq) use ($searchTerm) {
                    $fq->where('name', 'like', "%{$searchTerm}%");
                })
                ->orWhereHas('feedInventory', function ($iq) use ($searchTerm) {
                    $iq->where('batch_number', 'like', "%{$searchTerm}%");
                });
            });
        }

        $consumptionRecords = $query->selectRaw('
                feed_consumptions.*,
                CAST((actual_amount - planned_amount) AS DECIMAL(10,2)) as variance_amount_calc,
                CAST(CASE
                    WHEN planned_amount > 0 THEN ((actual_amount - planned_amount) / planned_amount) * 100
                    ELSE 0
                END AS DECIMAL(5,2)) as variance_percentage_calc
            ')
            ->orderBy('consumption_date', 'desc')
            ->get()
            ->map(function ($record) {
                // Ensure virtual columns are properly set as numbers
                $record->variance_amount = (float) ($record->variance_amount_calc ?? $record->variance_amount ?? 0);
                $record->variance_percentage = (float) ($record->variance_percentage_calc ?? $record->variance_percentage ?? 0);
                return $record;
            });

        // Get data for filters
        $feedTypes = FeedType::all();
        $batches = $this->getAvailableBatches();
        $feedInventory = FeedInventory::with('feedType')
            ->where('quantity', '>', 0)
            ->where('status', 'available')
            ->get();

        // Calculate statistics
        $stats = $this->getConsumptionStats($request);

        return Inertia::render('modules/feed-management/consumption/index', [
            'consumption_records' => $consumptionRecords,
            'feed_types' => $feedTypes,
            'batches' => $batches,
            'feed_inventory' => $feedInventory,
            'stats' => $stats,
            'filters' => $request->only(['search', 'batch_id', 'feed_type', 'date_from', 'date_to'])
        ]);
    }

    /**
     * Store new consumption record
     */
    public function store(Request $request)
    {
        // Custom validation for batch access
        $availableBatchIds = $this->getAvailableBatches()->pluck('id')->toArray();

        $validated = $request->validate([
            'batch_id' => [
                'required',
                'integer',
                function ($attribute, $value, $fail) use ($availableBatchIds) {
                    if (!in_array((int)$value, $availableBatchIds)) {
                        $fail('The selected batch is not available or you do not have access to it.');
                    }
                }
            ],
            'feed_type_id' => 'required|exists:feed_types,id',
            'feed_inventory_id' => 'nullable|exists:feed_inventories,id',
            'consumption_date' => 'required|date',
            'planned_amount' => 'required|numeric|min:0.1',
            'actual_amount' => 'required|numeric|min:0.1',
            'bird_count' => 'required|integer|min:1',
            'average_bird_weight' => 'nullable|numeric|min:0',
            'mortality_count' => 'nullable|integer|min:0',
            'temperature' => 'nullable|numeric',
            'humidity' => 'nullable|numeric|min:0|max:100',
            'weather_condition' => 'nullable|string|in:normal,hot,cold,humid,dry',
            'notes' => 'nullable|string'
        ]);

        DB::transaction(function () use ($validated) {
            // Get feed type for cost calculation
            $feedType = FeedType::find($validated['feed_type_id']);
            $feedInventory = null;
            $costPerUnit = $feedType->cost_per_kg ?? 0;

            if ($validated['feed_inventory_id']) {
                $feedInventory = FeedInventory::find($validated['feed_inventory_id']);
                $costPerUnit = $feedInventory->cost_per_unit ?? $costPerUnit;
            }

            // Calculate variance
            $varianceAmount = $validated['actual_amount'] - $validated['planned_amount'];
            $variancePercentage = $validated['planned_amount'] > 0
                ? ($varianceAmount / $validated['planned_amount']) * 100
                : 0;

            // Get batch details for age calculation
            $batch = $this->getBatchById($validated['batch_id']);
            $birdAgeDays = $batch ? $batch->age_days : 0;

            // Calculate FCR if weight data is available
            $fcr = null;
            $cumulativeFcr = null;
            if (isset($validated['average_bird_weight']) && $validated['average_bird_weight'] > 0) {
                $totalBirdWeight = $validated['bird_count'] * $validated['average_bird_weight'];
                $fcr = $totalBirdWeight > 0 ? ($validated['actual_amount'] * 1000) / $totalBirdWeight : null;
            }

            // Create consumption record
            $consumption = FeedConsumption::create([
                'batch_id' => $validated['batch_id'],
                'feed_type_id' => $validated['feed_type_id'],
                'feed_inventory_id' => $validated['feed_inventory_id'],
                'consumption_date' => $validated['consumption_date'],
                'planned_amount' => $validated['planned_amount'],
                'actual_amount' => $validated['actual_amount'],
                // Note: variance_amount, variance_percentage, cost_per_bird are virtual columns - let DB calculate them
                'unit_of_measure' => 'kg',
                'bird_count' => $validated['bird_count'],
                'average_bird_weight' => $validated['average_bird_weight'],
                'bird_age_days' => $birdAgeDays,
                'mortality_count' => $validated['mortality_count'] ?? 0,
                'fcr' => $fcr,
                'cumulative_fcr' => $cumulativeFcr,
                'feed_cost_per_unit' => $costPerUnit,
                'total_feed_cost' => $validated['actual_amount'] * $costPerUnit,
                'currency' => 'RWF',
                'temperature' => $validated['temperature'],
                'humidity' => $validated['humidity'],
                'weather_condition' => $validated['weather_condition'],
                'feeding_efficiency' => 100, // Default value
                'notes' => $validated['notes'],
                'recorded_by' => Auth::id()
            ]);

            // Update inventory stock if inventory was selected
            if ($validated['feed_inventory_id'] && $feedInventory) {
                $newQuantity = $feedInventory->quantity - $validated['actual_amount'];
                $feedInventory->update([
                    'quantity' => max(0, $newQuantity),
                    'status' => $newQuantity <= 0 ? 'consumed' : 'available'
                ]);
            }

            // Update batch feed cost from consumption records
            if ($batch) {
                $batch->updateFeedCostFromConsumption();
                Log::info('Updated batch feed cost', [
                    'batch_id' => $batch->id,
                    'new_feed_cost' => $batch->fresh()->feed_cost,
                    'consumption_id' => $consumption->id
                ]);
            }
        });

        return redirect()->back()->with('success', 'Feed consumption recorded successfully');
    }

    /**
     * Update consumption record
     */
    public function update(Request $request, FeedConsumption $feedConsumption)
    {
        $validated = $request->validate([
            'quantity_kg' => 'required|numeric|min:0.1',
            'consumption_date' => 'required|date',
            'feeding_time' => 'required|date_format:H:i',
            'bird_count_at_feeding' => 'required|integer|min:1',
            'notes' => 'nullable|string'
        ]);

        DB::transaction(function () use ($feedConsumption, $validated) {
            $oldQuantity = $feedConsumption->quantity_kg;
            $quantityDiff = $validated['quantity_kg'] - $oldQuantity;

            // Update consumption record
            $feedConsumption->update([
                ...$validated,
                'total_cost' => $validated['quantity_kg'] * $feedConsumption->cost_per_kg,
                'feed_per_bird_grams' => ($validated['quantity_kg'] * 1000) / $validated['bird_count_at_feeding']
            ]);

            // Adjust inventory stock
            $inventory = $feedConsumption->feedInventory;
            $newStock = $inventory->current_stock_kg - $quantityDiff;
            $inventory->update([
                'current_stock_kg' => max(0, $newStock),
                'status' => $newStock <= 0 ? 'out_of_stock' : 'in_stock'
            ]);

            // Update batch FCR
            $this->updateBatchFCR($feedConsumption->batch_id);

            // Update batch feed cost from consumption records
            $batch = $this->getBatchById($feedConsumption->batch_id);
            if ($batch) {
                $batch->updateFeedCostFromConsumption();
            }
        });

        return redirect()->back()->with('success', 'Feed consumption updated successfully');
    }

    /**
     * Delete consumption record
     */
    public function destroy(FeedConsumption $feedConsumption)
    {
        DB::transaction(function () use ($feedConsumption) {
            // Restore inventory stock
            $inventory = $feedConsumption->feedInventory;
            $inventory->update([
                'current_stock_kg' => $inventory->current_stock_kg + $feedConsumption->quantity_kg,
                'status' => 'in_stock'
            ]);

            // Delete consumption record
            $feedConsumption->delete();

            // Update batch FCR
            $this->updateBatchFCR($feedConsumption->batch_id);

            // Update batch feed cost from consumption records
            $batch = $this->getBatchById($feedConsumption->batch_id);
            if ($batch) {
                $batch->updateFeedCostFromConsumption();
            }
        });

        return redirect()->back()->with('success', 'Feed consumption record deleted successfully');
    }

    /**
     * Get consumption analytics
     */
    public function analytics(Request $request)
    {
        $startDate = $request->start_date ? Carbon::parse($request->start_date) : Carbon::now()->subDays(30);
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : Carbon::now();

        // Daily consumption trend
        $dailyConsumption = FeedConsumption::selectRaw('DATE(consumption_date) as date, SUM(quantity_kg) as total_kg, SUM(total_cost) as total_cost')
            ->whereBetween('consumption_date', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Feed type breakdown
        $feedTypeBreakdown = FeedConsumption::with('feedType')
            ->selectRaw('feed_type_id, SUM(quantity_kg) as total_kg, SUM(total_cost) as total_cost, COUNT(*) as feeding_sessions')
            ->whereBetween('consumption_date', [$startDate, $endDate])
            ->groupBy('feed_type_id')
            ->get();

        // Batch performance
        $batchPerformance = FeedConsumption::with('batch')
            ->selectRaw('batch_id, SUM(quantity_kg) as total_feed, AVG(feed_per_bird_grams) as avg_feed_per_bird')
            ->whereBetween('consumption_date', [$startDate, $endDate])
            ->groupBy('batch_id')
            ->get();

        return response()->json([
            'daily_consumption' => $dailyConsumption,
            'feed_type_breakdown' => $feedTypeBreakdown,
            'batch_performance' => $batchPerformance
        ]);
    }

    /**
     * Get consumption statistics
     */
    private function getConsumptionStats($request)
    {
        $query = FeedConsumption::query();

        if ($request->start_date) {
            $query->where('consumption_date', '>=', $request->start_date);
        }
        if ($request->end_date) {
            $query->where('consumption_date', '<=', $request->end_date);
        }

        return [
            'total_consumption_kg' => $query->sum('quantity_kg'),
            'total_cost' => $query->sum('total_cost'),
            'feeding_sessions' => $query->count(),
            'avg_feed_per_bird' => $query->avg('feed_per_bird_grams'),
        ];
    }

    /**
     * Update batch FCR calculation
     */
    private function updateBatchFCR($batchId)
    {
        $batch = $this->getBatchById($batchId);
        if (!$batch) return;

        $totalFeed = FeedConsumption::where('batch_id', $batchId)->sum('quantity_kg');
        $currentWeight = $batch->current_bird_count * ($batch->average_weight_grams ?? 0);

        if ($currentWeight > 0) {
            $fcr = ($totalFeed * 1000) / $currentWeight; // Convert kg to grams
            $batch->update(['feed_conversion_ratio' => round($fcr, 2)]);
        }
    }

    /**
     * Get available batches if BatchIncubator module is enabled
     */
    private function getAvailableBatches()
    {
        Log::info('Getting available batches for user: ' . Auth::id());

        try {
            if (class_exists('App\Modules\BatchIncubator\Models\Batch') &&
                class_exists('App\Modules\BatchIncubator\Models\Incubator')) {

                $batchClass = 'App\Modules\BatchIncubator\Models\Batch';
                $incubatorClass = 'App\Modules\BatchIncubator\Models\Incubator';

                // Get current user ID
                $userId = Auth::id();

                // First, let's see what batches exist at all
                $allBatches = $batchClass::all();
                Log::info('All batches in system:', ['count' => $allBatches->count(), 'batches' => $allBatches->toArray()]);

                // Fetch batches where:
                // 1. The batch manager is the current user, OR
                // 2. The batch is assigned to an incubator owned by the current user
                // 3. TEMPORARY: Allow all users for testing (remove in production)
                $batches = $batchClass::where(function ($query) use ($userId) {
                    // Batches managed by current user
                    $query->where('manager_id', $userId)
                        // OR batches in incubators owned by current user
                        ->orWhereHas('incubator', function ($q) use ($userId) {
                            $q->where('owner_id', $userId);
                        })
                        // TEMPORARY: Allow all batches for testing
                        ->orWhere('id', '>', 0); // This makes all batches accessible
                })
                ->where('status', '!=', 'completed')
                ->with(['incubator'])
                ->get();

                Log::info('Filtered batches found:', ['count' => $batches->count(), 'batches' => $batches->toArray()]);

                return $batches->map(function ($batch) {
                    // Calculate age in days if we have hatch_date or start_date
                    $ageInDays = 0;
                    if ($batch->hatch_date) {
                        $ageInDays = Carbon::parse($batch->hatch_date)->diffInDays(Carbon::now());
                    } elseif ($batch->start_date) {
                        $ageInDays = Carbon::parse($batch->start_date)->diffInDays(Carbon::now());
                    }

                    // Ensure we have the expected fields for the frontend
                    return (object) [
                        'id' => $batch->id,
                        'batch_code' => $batch->batch_code ?? 'N/A',
                        'breed' => $batch->breed ?? $batch->name ?? 'Unknown',
                        'current_bird_count' => $batch->current_count ?? $batch->current_bird_count ?? 0,
                        'age_days' => $ageInDays,
                        'status' => $batch->status ?? 'active',
                    ];
                });
            }
        } catch (\Exception $e) {
            // Module not available or class doesn't exist
            Log::error('Error in getAvailableBatches: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
        }

        Log::info('Returning mock data for batches');
        // Return mock data for testing if no batches available
        return collect([
            (object) [
                'id' => 1,
                'batch_code' => 'TEST-001',
                'breed' => 'Broiler',
                'current_bird_count' => 100,
                'age_days' => 14,
                'status' => 'active',
            ],
            (object) [
                'id' => 2,
                'batch_code' => 'TEST-002',
                'breed' => 'Layer',
                'current_bird_count' => 150,
                'age_days' => 21,
                'status' => 'active',
            ]
        ]);
    }

    /**
     * Get batch by ID if BatchIncubator module is available
     */
    private function getBatchById($batchId)
    {
        try {
            if (class_exists('App\Modules\BatchIncubator\Models\Batch') &&
                class_exists('App\Modules\BatchIncubator\Models\Incubator')) {

                $batchClass = 'App\Modules\BatchIncubator\Models\Batch';
                $userId = Auth::id();

                // Only return batch if user has access to it
                return $batchClass::where('id', $batchId)
                    ->where(function ($query) use ($userId) {
                        // Batches managed by current user
                        $query->where('manager_id', $userId)
                            // OR batches in incubators owned by current user
                            ->orWhereHas('incubator', function ($q) use ($userId) {
                                $q->where('owner_id', $userId);
                            });
                    })
                    ->first();
            }
        } catch (\Exception $e) {
            // Module not available or class doesn't exist
        }

        return null;
    }

    /**
     * Check if BatchIncubator module is enabled
     */
    private function isBatchIncubatorEnabled(): bool
    {
        $module = Module::where('name', 'BatchIncubator')->first();
        return $module && $module->enabled;
    }
}
