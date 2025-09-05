<?php

namespace App\Modules\FeedManagement\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\FeedManagement\Models\FeedType;
use App\Modules\FeedManagement\Models\FeedProgram;
use App\Modules\FeedManagement\Models\FeedSupplier;
use App\Modules\FeedManagement\Models\FeedInventory;
use App\Modules\FeedManagement\Models\FeedConsumption;
use App\Models\Module;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class FeedManagementController extends Controller
{
    /**
     * Display the feed management dashboard
     */
    public function index()
    {
        // Check if BatchIncubator module is available
        $batchIncubatorEnabled = $this->isBatchIncubatorEnabled();

        // Calculate dashboard statistics
        $stats = [
            'total_inventory_value' => FeedInventory::sum(DB::raw('quantity * cost_per_unit')),
            'low_stock_items' => FeedInventory::whereRaw('quantity <= reorder_point')->count(),
            'expiring_soon_count' => FeedInventory::where('expiry_date', '<=', Carbon::now()->addDays(7))->count(),
            'average_fcr' => FeedConsumption::whereNotNull('fcr')->avg('fcr') ?? 0,
            'monthly_consumption' => FeedConsumption::whereMonth('consumption_date', Carbon::now()->month)
                ->whereYear('consumption_date', Carbon::now()->year)
                ->sum('actual_amount'),
            'feed_cost_per_bird' => $this->calculateAverageFeedCostPerBird(),
            'total_feed_types' => FeedType::count(),
            'active_batches' => $batchIncubatorEnabled ? $this->getActiveBatchesCount() : 0,
        ];

        // Get inventory alerts
        $inventory_alerts = $this->getInventoryAlerts();

        // Get active feed programs
        $feed_programs = FeedProgram::where('status', 'active')
            ->select('id', 'name', 'description', 'breed_type', 'specific_breed')
            ->get()
            ->map(function ($program) {
                return [
                    'id' => $program->id,
                    'name' => $program->name,
                    'description' => $program->description,
                    'target_breed' => $program->specific_breed ?: $program->breed_type,
                ];
            });

        // Get available feed types
        $feed_types = FeedType::select('id', 'name', 'category', 'protein_content', 'cost_per_kg')
            ->orderBy('name')
            ->get();

        return Inertia::render('modules/feed-management/index', [
            'stats' => $stats,
            'inventory_alerts' => $inventory_alerts,
            'feed_programs' => $feed_programs,
            'feed_types' => $feed_types,
            'batch_incubator_enabled' => $batchIncubatorEnabled,
        ]);
    }

    /**
     * Calculate feed requirements based on program and parameters
     */
    public function calculateRequirements(Request $request)
    {
        Log::info('Calculate requirements request:', $request->all());

        try {
            $request->validate([
                'program_id' => 'required|exists:feed_programs,id',
                'feed_type_id' => 'required|exists:feed_types,id',
                'bird_count' => 'required|integer|min:1',
                'bird_age_days' => 'required|numeric|min:1',
            ]);

            $program = FeedProgram::findOrFail($request->program_id);
            $feedType = FeedType::findOrFail($request->feed_type_id);

            // Round bird age to nearest integer for calculations
            $birdAgeDays = round($request->bird_age_days);

            Log::info('Found program:', ['program' => $program->toArray()]);
            Log::info('Found feed type:', ['feedType' => $feedType->toArray()]);
            Log::info('Bird age (rounded):', ['birdAge' => $birdAgeDays]);

            // Calculate feed requirement based on age and program data
            $baseConsumptionPerBird = $this->calculateBaseConsumption($birdAgeDays);
            Log::info('Base consumption per bird:', ['baseConsumption' => $baseConsumptionPerBird]);

            // Try to get program-specific multiplier from program_data, default to 1.0
            $programData = $program->program_data ?? [];
            $weekNumber = intval(ceil($birdAgeDays / 7));
            $programMultiplier = 1.0;

            Log::info('Program data analysis:', [
                'weekNumber' => $weekNumber,
                'programData' => $programData,
                'hasWeeksData' => isset($programData['weeks'])
            ]);

            // Look for week-specific data in program_data
            if (isset($programData['weeks'])) {
                $weekData = $programData['weeks'][$weekNumber] ??
                           $programData['weeks']["1-{$weekNumber}"] ??
                           $programData['weeks']['1'] ??
                           null;

                Log::info('Week data found:', ['weekData' => $weekData]);

                if ($weekData && isset($weekData['daily_amount_per_bird'])) {
                    $programAmount = $weekData['daily_amount_per_bird'];
                    if (is_numeric($programAmount)) {
                        $baseConsumptionPerBird = $programAmount;
                        Log::info('Updated base consumption from program:', ['newAmount' => $baseConsumptionPerBird]);
                    }
                }
            }

            $dailyRequirementPerBird = $baseConsumptionPerBird * $programMultiplier;
            $dailyRequirement = $dailyRequirementPerBird * $request->bird_count / 1000; // Convert to kg

            $requirements = [
                [
                    'feed_type_id' => $feedType->id,
                    'feed_type_name' => $feedType->name,
                    'daily_requirement' => $dailyRequirement,
                    'weekly_requirement' => $dailyRequirement * 7,
                    'monthly_requirement' => $dailyRequirement * 30,
                    'estimated_cost' => $dailyRequirement * 30 * $feedType->cost_per_kg,
                ]
            ];

            Log::info('Final requirements:', ['requirements' => $requirements]);

            return response()->json(['requirements' => $requirements]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error:', ['errors' => $e->errors()]);
            return response()->json(['error' => 'Validation failed', 'details' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('General error in calculateRequirements:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Server error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get active feed programs for API
     */
    public function getPrograms()
    {
        $programs = FeedProgram::where('status', 'active')
            ->select('id', 'name', 'description', 'breed_type', 'specific_breed')
            ->get()
            ->map(function ($program) {
                return [
                    'id' => $program->id,
                    'name' => $program->name,
                    'description' => $program->description,
                    'target_breed' => $program->specific_breed ?: $program->breed_type,
                ];
            });

        return response()->json($programs);
    }

    /**
     * Get available feed types for API
     */
    public function getFeedTypes()
    {
        $feedTypes = FeedType::select('id', 'name', 'category', 'protein_content', 'cost_per_kg')
            ->orderBy('name')
            ->get();

        return response()->json($feedTypes);
    }

    /**
     * Calculate base feed consumption based on bird age
     */
    private function calculateBaseConsumption($ageDays)
    {
        // Basic algorithm - this should be enhanced based on actual poultry science
        if ($ageDays <= 7) {
            return 15; // grams per day
        } elseif ($ageDays <= 14) {
            return 30;
        } elseif ($ageDays <= 21) {
            return 50;
        } elseif ($ageDays <= 35) {
            return 80;
        } else {
            return 120;
        }
    }

    /**
     * Calculate average feed cost per bird
     */
    private function calculateAverageFeedCostPerBird()
    {
        $monthlyConsumption = FeedConsumption::whereMonth('consumption_date', Carbon::now()->month)
            ->whereYear('consumption_date', Carbon::now()->year);

        $totalCost = $monthlyConsumption->sum('total_feed_cost');
        $totalBirds = $monthlyConsumption->sum('bird_count');

        return $totalBirds > 0 ? $totalCost / $totalBirds : 0;
    }

    /**
     * Get inventory alerts
     */
    private function getInventoryAlerts()
    {
        $alerts = collect();

        // Low stock alerts
        $lowStock = FeedInventory::with('feedType')
            ->whereRaw('quantity <= reorder_point')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'feed_type_name' => $item->feedType->name,
                    'quantity' => $item->quantity,
                    'alert_type' => 'low_stock',
                ];
            });

        // Expiring soon alerts
        $expiringSoon = FeedInventory::with('feedType')
            ->where('expiry_date', '>', Carbon::now())
            ->where('expiry_date', '<=', Carbon::now()->addDays(7))
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'feed_type_name' => $item->feedType->name,
                    'quantity' => $item->quantity,
                    'alert_type' => 'expiring_soon',
                    'expiry_date' => $item->expiry_date,
                    'days_until_expiry' => Carbon::parse($item->expiry_date)->diffInDays(Carbon::now()),
                ];
            });

        // Expired alerts
        $expired = FeedInventory::with('feedType')
            ->where('expiry_date', '<=', Carbon::now())
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'feed_type_name' => $item->feedType->name,
                    'quantity' => $item->quantity,
                    'alert_type' => 'expired',
                    'expiry_date' => $item->expiry_date,
                ];
            });

        return $alerts->concat($lowStock)->concat($expiringSoon)->concat($expired)->take(10);
    }

    /**
     * Check if BatchIncubator module is enabled
     */
    private function isBatchIncubatorEnabled(): bool
    {
        return Module::isActiveByCode(Module::BATCH_INCUBATOR);
    }

    /**
     * Get active batches count if BatchIncubator module is available
     */
    private function getActiveBatchesCount(): int
    {
        try {
            if (class_exists('App\Modules\BatchIncubator\Models\Batch')) {
                $batchClass = 'App\Modules\BatchIncubator\Models\Batch';
                return $batchClass::where('status', 'active')->count();
            }
        } catch (\Exception $e) {
            // Module not available or class doesn't exist
        }

        return 0;
    }

    /**
     * Get incubator data for feed requirement calculator
     */
    public function getIncubatorData()
    {
        if (!$this->isBatchIncubatorEnabled()) {
            return response()->json(['message' => 'BatchIncubator module not available'], 404);
        }

        try {
            $incubatorData = [];

            if (class_exists('App\Modules\BatchIncubator\Models\Incubator') &&
                class_exists('App\Modules\BatchIncubator\Models\Batch')) {

                $incubatorClass = 'App\Modules\BatchIncubator\Models\Incubator';
                $batchClass = 'App\Modules\BatchIncubator\Models\Batch';

                $incubators = $incubatorClass::with(['currentBatch' => function($query) {
                    $query->select('id', 'incubator_id', 'name', 'current_count', 'breed', 'start_date', 'status');
                }])
                ->where('owner_id', Auth::id()) // Only get incubators owned by current user
                ->whereIn('status', ['running', 'idle'])  // Use correct enum values
                ->select('id', 'name', 'capacity', 'current_load', 'location', 'status')
                ->get()
                ->map(function ($incubator) {
                    $batchData = $incubator->currentBatch;
                    $ageInDays = 0;

                    if ($batchData && $batchData->start_date) {
                        $ageInDays = \Carbon\Carbon::parse($batchData->start_date)->diffInDays(now());
                    }

                    return [
                        'id' => $incubator->id,
                        'name' => $incubator->name,
                        'location' => $incubator->location,
                        'capacity' => $incubator->capacity,
                        'current_load' => $incubator->current_load,
                        'batch' => $batchData ? [
                            'id' => $batchData->id,
                            'name' => $batchData->name,
                            'current_count' => $batchData->current_count,
                            'breed' => $batchData->breed,
                            'age_in_days' => $ageInDays,
                            'status' => $batchData->status,
                        ] : null,
                    ];
                });

                $incubatorData = $incubators->toArray();
            }

            return response()->json([
                'incubators' => $incubatorData,
                'available' => true
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching incubator data: ' . $e->getMessage(),
                'available' => false
            ], 500);
        }
    }
}
