<?php

namespace App\Modules\BatchIncubator\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\BatchIncubator\Models\Batch;
use App\Modules\BatchIncubator\Models\MedicationProtocol;
use App\Modules\BatchIncubator\Models\VaccinationProtocol;
use App\Modules\BatchIncubator\Services\SmartSchedulingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SmartSchedulingController extends Controller
{
    protected SmartSchedulingService $schedulingService;

    public function __construct(SmartSchedulingService $schedulingService)
    {
        $this->schedulingService = $schedulingService;
    }

    /**
     * Show smart recommendations for a specific batch
     */
    public function showRecommendations(Request $request, Batch $batch)
    {
        try {
            // Check access to batch
            if (!$batch->userHasAccess(Auth::user())) {
                abort(403, 'Unauthorized access to batch.');
            }


            $recommendations = $this->schedulingService->getRecommendationsForBatch($batch);
            return Inertia::render('modules/batch-incubator/SmartRecommendations', [
                'batch' => $batch->load(['incubator', 'appliedMedications.protocol', 'appliedVaccinations.protocol']),
                'recommendations' => $recommendations,
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Error fetching recommendations: ' . $th->getMessage());
        }


    }

    /**
     * Get feed recommendations for batch
     */
    public function getFeedRecommendations(Request $request, Batch $batch)
    {
        if (!$batch->userHasAccess(Auth::user())) {
            abort(403, 'Unauthorized access to batch.');
        }

        $recommendations = $this->schedulingService->getFeedRecommendations($batch);

        return response()->json([
            'success' => true,
            'recommendations' => $recommendations,
        ]);
    }

    /**
     * Get medication recommendations for batch
     */
    public function getMedicationRecommendations(Request $request, Batch $batch)
    {
        if (!$batch->userHasAccess(Auth::user())) {
            abort(403, 'Unauthorized access to batch.');
        }

        $recommendations = $this->schedulingService->getMedicationRecommendations($batch);

        return response()->json([
            'success' => true,
            'recommendations' => $recommendations,
        ]);
    }

    /**
     * Get vaccination recommendations for batch
     */
    public function getVaccinationRecommendations(Request $request, Batch $batch)
    {
        if (!$batch->userHasAccess(Auth::user())) {
            abort(403, 'Unauthorized access to batch.');
        }

        $recommendations = $this->schedulingService->getVaccinationRecommendations($batch);

        return response()->json([
            'success' => true,
            'recommendations' => $recommendations,
        ]);
    }

    /**
     * Accept a medication recommendation and apply it to batch
     */
    public function acceptMedicationRecommendation(Request $request, Batch $batch)
    {
        if (!$batch->userHasAccess(Auth::user())) {
            abort(403, 'Unauthorized access to batch.');
        }

        $request->validate([
            'protocol_id' => 'required|exists:medication_protocols,id',
            'notes' => 'nullable|string|max:1000',
            'scheduled_date' => 'nullable|date|after_or_equal:today',
        ]);

        $protocol = MedicationProtocol::findOrFail($request->protocol_id);
        $dosageInfo = $protocol->calculateDosage($batch);

        $appliedMedication = $batch->appliedMedications()->create([
            'medication_protocol_id' => $protocol->id,
            'applied_by' => Auth::id(),
            'applied_at' => $request->scheduled_date ? $request->scheduled_date : now(),
            'dosage_amount' => $dosageInfo['dosage_per_bird'],
            'dosage_unit' => $dosageInfo['unit'],
            'total_dosage' => $dosageInfo['total_dosage'],
            'bird_count_at_application' => $batch->current_count,
            'application_method' => $protocol->application_method,
            'notes' => $request->notes,
            'cost' => $dosageInfo['estimated_cost'] ?? null,
        ]);

        return  redirect()->back()->with('success', 'Medication recommendation accepted and scheduled.');
    }

    /**
     * Accept a vaccination recommendation and apply it to batch
     */
    public function acceptVaccinationRecommendation(Request $request, Batch $batch)
    {
        if (!$batch->userHasAccess(Auth::user())) {
            abort(403, 'Unauthorized access to batch.');
        }

        $request->validate([
            'protocol_id' => 'required|exists:vaccination_protocols,id',
            'notes' => 'nullable|string|max:1000',
            'scheduled_date' => 'nullable|date|after_or_equal:today',
        ]);

        $protocol = VaccinationProtocol::findOrFail($request->protocol_id);
        $doseInfo = $protocol->calculateDosesNeeded($batch);

        $appliedVaccination = $batch->appliedVaccinations()->create([
            'vaccination_protocol_id' => $protocol->id,
            'vaccinated_at' => $request->scheduled_date ? $request->scheduled_date : now(),
            'bird_age_days_at_vaccination' => $batch->age_days,
            'birds_vaccinated' => $batch->current_count,
            'doses_used' => $doseInfo['total_doses'],
            'administration_method' => $protocol->administration_method,
            'administered_by' => Auth::id(), // Add the missing field
            'batch_number' => $protocol->vaccine_batch_number ?? 'TBD',
            'immunity_expires' => now()->addMonths($protocol->immunity_duration_months ?? 12),
            'notes' => $request->notes,
            'cost' => $doseInfo['estimated_cost'] ?? null,
        ]);

        return  redirect()->back()->with('success', 'Vaccination recommendation accepted and scheduled.');
    }

    /**
     * Get health dashboard with alerts and insights
     */
    public function getHealthDashboard(Request $request, Batch $batch)
    {
        if (!$batch->userHasAccess(Auth::user())) {
            abort(403, 'Unauthorized access to batch.');
        }

        $alerts = $this->schedulingService->getHealthAlerts($batch);
        $insights = $this->schedulingService->getPerformanceInsights($batch);

        return response()->json([
            'success' => true,
            'health_alerts' => $alerts,
            'performance_insights' => $insights,
            'batch_summary' => [
                'age_days' => $batch->age_days,
                'current_bird_count' => $batch->current_count,
                'mortality_rate' => $batch->mortality_rate,
                'average_weight' => $batch->getAverageWeightPerBird(),
                'feed_conversion_ratio' => $batch->getAverageFCR(),
            ],
        ]);
    }

    /**
     * Generate comprehensive batch report with recommendations
     */
    public function generateBatchReport(Request $request, Batch $batch)
    {
        if (!$batch->userHasAccess(Auth::user())) {
            abort(403, 'Unauthorized access to batch.');
        }

        $recommendations = $this->schedulingService->getRecommendationsForBatch($batch);

        // Get historical data for trends
        $historicalData = [
            'weight_progression' => $batch->getWeightProgression(),
            'mortality_trend' => $batch->getMortalityTrend(),
            'feed_consumption_trend' => $batch->getFeedConsumptionTrend(),
            'medication_history' => $batch->appliedMedications()->with('protocol')->get(),
            'vaccination_history' => $batch->appliedVaccinations()->with('protocol')->get(),
        ];

        return response()->json([
            'success' => true,
            'batch_info' => $batch,
            'recommendations' => $recommendations,
            'historical_data' => $historicalData,
            'report_generated_at' => now()->toISOString(),
        ]);
    }

    /**
     * Dismiss a recommendation (mark as not applicable)
     */
    public function dismissRecommendation(Request $request, Batch $batch)
    {
        if (!$batch->userHasAccess(Auth::user())) {
            abort(403, 'Unauthorized access to batch.');
        }

        $request->validate([
            'recommendation_type' => 'required|in:medication,vaccination,feed',
            'recommendation_id' => 'required|string',
            'reason' => 'required|string|max:500',
        ]);

        // Log the dismissal for future reference
        $batch->dismissedRecommendations()->create([
            'recommendation_type' => $request->recommendation_type,
            'recommendation_id' => $request->recommendation_id,
            'dismissed_by' => Auth::id(),
            'dismissed_at' => now(),
            'reason' => $request->reason,
        ]);
        return  redirect()->back()->with('success', 'Vaccination recommendation dismissed successfully.');
    }

    /**
     * Get recommendations based on event type for schedule creation
     */
    public function getRecommendationsByEventType(Request $request, Batch $batch)
    {
        if (!$batch->userHasAccess(Auth::user())) {
            abort(403, 'Unauthorized access to batch.');
        }

        $request->validate([
            'event_type' => 'required|in:feeding,vaccination,medication',
        ]);

        $eventType = $request->event_type;
        $recommendations = [];

        switch ($eventType) {
            case 'feeding':
                $recommendations = $this->schedulingService->getFeedRecommendations($batch);
                break;
            case 'vaccination':
                $recommendations = $this->schedulingService->getVaccinationRecommendations($batch);
                break;
            case 'medication':
                $recommendations = $this->schedulingService->getMedicationRecommendations($batch);
                break;
        }

        return response()->json([
            'success' => true,
            'event_type' => $eventType,
            'recommendations' => $recommendations,
            'batch_info' => [
                'id' => $batch->id,
                'name' => $batch->name,
                'age_days' => $batch->age_days,
                'breed' => $batch->breed,
                'current_count' => $batch->current_count,
            ],
        ]);
    }

    /**
     * Get smart scheduling overview for multiple batches
     */
    public function getSchedulingOverview(Request $request)
    {
        $user = Auth::user();

        // Get accessible batches
        $batches = Batch::accessibleBy($user)
            ->active()
            ->with(['incubator', 'appliedMedications.protocol', 'appliedVaccinations.protocol'])
            ->get();

        $overview = [];
        $totalAlerts = 0;

        foreach ($batches as $batch) {
            $alerts = $this->schedulingService->getHealthAlerts($batch);
            $highPriorityRecommendations = collect($this->schedulingService->getMedicationRecommendations($batch))
                ->where('urgency_level', 'high')
                ->count();

            $overview[] = [
                'batch' => $batch,
                'alert_count' => count($alerts),
                'high_priority_recommendations' => $highPriorityRecommendations,
                'next_vaccination_due' => $this->getNextVaccinationDue($batch),
                'performance_status' => $this->getBatchPerformanceStatus($batch),
            ];

            $totalAlerts += count($alerts);
        }

        return response()->json([
            'success' => true,
            'batches_overview' => $overview,
            'summary' => [
                'total_batches' => count($batches),
                'total_alerts' => $totalAlerts,
                'batches_needing_attention' => collect($overview)->where('alert_count', '>', 0)->count(),
            ],
        ]);
    }

    /**
     * Get next vaccination due for batch
     */
    private function getNextVaccinationDue(Batch $batch): ?array
    {
        $protocols = VaccinationProtocol::active()
            ->where('is_mandatory', true)
            ->get();

        $nextDue = null;
        $minDays = PHP_INT_MAX;

        foreach ($protocols as $protocol) {
            if ($protocol->appliesTo($batch) && !$protocol->hasBeenAppliedTo($batch)) {
                $schedule = $protocol->getScheduleForAge($batch->age_days);
                if ($schedule && $schedule['age_days'] - $batch->age_days < $minDays) {
                    $minDays = $schedule['age_days'] - $batch->age_days;
                    $nextDue = [
                        'vaccine_name' => $protocol->vaccine_name,
                        'days_until_due' => $minDays,
                        'is_overdue' => $minDays < 0,
                    ];
                }
            }
        }

        return $nextDue;
    }

    /**
     * Get batch performance status
     */
    private function getBatchPerformanceStatus(Batch $batch): string
    {
        $insights = $this->schedulingService->getPerformanceInsights($batch);

        $poorPerformance = collect($insights)->where('assessment', 'Poor')->count();
        $excellentPerformance = collect($insights)->where('assessment', 'Excellent')->count();

        if ($poorPerformance > 0) {
            return 'poor';
        } elseif ($excellentPerformance > 0) {
            return 'excellent';
        } else {
            return 'good';
        }
    }
}
