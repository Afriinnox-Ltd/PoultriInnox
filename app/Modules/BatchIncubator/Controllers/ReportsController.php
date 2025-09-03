<?php

namespace App\Modules\BatchIncubator\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\BatchIncubator\Models\Batch;
use App\Modules\BatchIncubator\Models\Incubator;
use App\Modules\BatchIncubator\Models\BatchSchedule;
use App\Modules\BatchIncubator\Enums\BatchStatus;
use App\Modules\BatchIncubator\Enums\IncubatorStatus;
use App\Modules\BatchIncubator\Enums\ScheduleStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportsController extends Controller
{
    /**
     * Show the reports dashboard
     */
    public function index()
    {
        $reports = $this->getReportCategories();
        $quickStats = $this->getQuickStats();
        $performanceMetrics = $this->getPerformanceMetrics();
        
        return Inertia::render('modules/batch-incubator/reports/index', [
            'reports' => $reports,
            'quickStats' => $quickStats,
            'performanceMetrics' => $performanceMetrics,
        ]);
    }

    /**
     * Show the report generation page
     */
    public function create()
    {
        $reportTypes = $this->getReportTypes();
        $batches = Batch::select('id', 'name', 'batch_code', 'status')->get();
        $incubators = Incubator::select('id', 'name', 'model', 'status')->get();
        
        return Inertia::render('modules/batch-incubator/reports/create', [
            'reportTypes' => $reportTypes,
            'batches' => $batches,
            'incubators' => $incubators,
        ]);
    }

    /**
     * Generate and store a new report
     */
    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|string|in:production,efficiency,financial,batch-performance,incubator-analysis,schedule-compliance',
            'period' => 'required|string|in:week,month,quarter,year,custom',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'batch_ids' => 'nullable|array',
            'batch_ids.*' => 'exists:batches,id',
            'incubator_ids' => 'nullable|array',
            'incubator_ids.*' => 'exists:incubators,id',
            'format' => 'required|string|in:pdf,excel,html',
        ]);

        // Calculate date range
        $dateRange = $this->calculateDateRange($request->period, $request->start_date, $request->end_date);
        
        // Generate the appropriate report
        $reportData = match($request->type) {
            'production' => $this->generateProductionReport($dateRange, $request->batch_ids, $request->incubator_ids),
            'efficiency' => $this->generateEfficiencyReport($dateRange, $request->batch_ids, $request->incubator_ids),
            'financial' => $this->generateFinancialReport($dateRange, $request->batch_ids),
            'batch-performance' => $this->generateBatchPerformanceReport($dateRange, $request->batch_ids),
            'incubator-analysis' => $this->generateIncubatorAnalysisReport($dateRange, $request->incubator_ids),
            'schedule-compliance' => $this->generateScheduleComplianceReport($dateRange, $request->batch_ids),
        };

        // Store report metadata (optional for future reference)
        $reportId = uniqid('report_', true);
        
        // Return the generated report with a unique ID for viewing
        return redirect()->route('batch-incubator.reports.show', ['report' => $reportId])
            ->with('reportData', $reportData)
            ->with('reportConfig', [
                'type' => $request->type,
                'period' => $request->period,
                'format' => $request->format,
                'generated_at' => now(),
                'date_range' => $dateRange,
            ]);
    }

    /**
     * Show a generated report
     */
    public function show(Request $request, $report)
    {
        $reportData = session('reportData');
        $reportConfig = session('reportConfig');
        
        if (!$reportData || !$reportConfig) {
            return redirect()->route('batch-incubator.reports.index')
                ->with('error', 'Report not found or expired. Please generate a new report.');
        }
        
        return Inertia::render('modules/batch-incubator/reports/show', [
            'reportData' => $reportData,
            'reportConfig' => $reportConfig,
            'reportId' => $report,
        ]);
    }

    /**
     * Download a report in the specified format
     */
    public function download(Request $request, $report)
    {
        $reportData = session('reportData');
        $reportConfig = session('reportConfig');
        
        if (!$reportData || !$reportConfig) {
            return redirect()->route('batch-incubator.reports.index')
                ->with('error', 'Report not found or expired. Please generate a new report.');
        }
        
        $filename = 'batch_incubator_' . $reportConfig['type'] . '_report_' . now()->format('Y_m_d_H_i_s');
        
        switch ($reportConfig['format']) {
            case 'pdf':
                // For now, return JSON (can be enhanced with PDF generation later)
                return response()->json($reportData)
                    ->header('Content-Disposition', 'attachment; filename="' . $filename . '.json"');
            case 'excel':
                // For now, return JSON (can be enhanced with Excel generation later)
                return response()->json($reportData)
                    ->header('Content-Disposition', 'attachment; filename="' . $filename . '.json"');
            default:
                return response()->json($reportData)
                    ->header('Content-Disposition', 'attachment; filename="' . $filename . '.json"');
        }
    }

    /**
     * Calculate date range based on period selection
     */
    private function calculateDateRange($period, $startDate = null, $endDate = null)
    {
        $now = Carbon::now();
        
        if ($period === 'custom' && $startDate && $endDate) {
            return [
                'start' => Carbon::parse($startDate)->startOfDay(),
                'end' => Carbon::parse($endDate)->endOfDay(),
            ];
        }
        
        return match($period) {
            'week' => [
                'start' => $now->copy()->startOfWeek(),
                'end' => $now->copy()->endOfWeek(),
            ],
            'month' => [
                'start' => $now->copy()->startOfMonth(),
                'end' => $now->copy()->endOfMonth(),
            ],
            'quarter' => [
                'start' => $now->copy()->startOfQuarter(),
                'end' => $now->copy()->endOfQuarter(),
            ],
            'year' => [
                'start' => $now->copy()->startOfYear(),
                'end' => $now->copy()->endOfYear(),
            ],
            default => [
                'start' => $now->copy()->startOfMonth(),
                'end' => $now->copy()->endOfMonth(),
            ],
        };
    }

    /**
     * Generate a specific report
     */
    public function generate(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string|in:production,efficiency,financial,batch-performance,incubator-analysis,schedule-compliance',
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
            'batch_ids' => 'nullable|array',
            'batch_ids.*' => 'exists:batches,id',
            'incubator_ids' => 'nullable|array',
            'incubator_ids.*' => 'exists:incubators,id',
            'format' => 'nullable|string|in:pdf,excel,json'
        ]);

        $reportData = match ($validated['type']) {
            'production' => $this->generateProductionReport($validated),
            'efficiency' => $this->generateEfficiencyReport($validated),
            'financial' => $this->generateFinancialReport($validated),
            'batch-performance' => $this->generateBatchPerformanceReport($validated),
            'incubator-analysis' => $this->generateIncubatorAnalysisReport($validated),
            'schedule-compliance' => $this->generateScheduleComplianceReport($validated),
            default => throw new \InvalidArgumentException('Invalid report type')
        };

        return Inertia::render('modules/batch-incubator/reports/show', [
            'report' => $reportData,
            'type' => $validated['type'],
            'parameters' => $validated,
        ]);
    }

    /**
     * Get report categories for the dashboard
     */
    private function getReportCategories()
    {
        return [
            'production' => [
                'title' => 'Production Reports',
                'description' => 'Track production metrics and performance',
                'icon' => 'TrendingUp',
                'color' => 'blue',
                'reports' => [
                    ['name' => 'Daily Production', 'key' => 'daily-production'],
                    ['name' => 'Hatch Rate Analysis', 'key' => 'hatch-rate'],
                    ['name' => 'Mortality Tracking', 'key' => 'mortality'],
                    ['name' => 'Growth Performance', 'key' => 'growth'],
                ]
            ],
            'efficiency' => [
                'title' => 'Efficiency Reports',
                'description' => 'Analyze operational efficiency and optimization',
                'icon' => 'BarChart3',
                'color' => 'green',
                'reports' => [
                    ['name' => 'Incubator Utilization', 'key' => 'incubator-utilization'],
                    ['name' => 'Energy Consumption', 'key' => 'energy-consumption'],
                    ['name' => 'Resource Optimization', 'key' => 'resource-optimization'],
                    ['name' => 'Schedule Efficiency', 'key' => 'schedule-efficiency'],
                ]
            ],
            'financial' => [
                'title' => 'Financial Reports',
                'description' => 'Financial performance and profitability analysis',
                'icon' => 'DollarSign',
                'color' => 'purple',
                'reports' => [
                    ['name' => 'Cost per Batch', 'key' => 'cost-per-batch'],
                    ['name' => 'Revenue Analysis', 'key' => 'revenue-analysis'],
                    ['name' => 'Profitability Report', 'key' => 'profitability'],
                    ['name' => 'ROI Analysis', 'key' => 'roi-analysis'],
                ]
            ],
            'compliance' => [
                'title' => 'Compliance Reports',
                'description' => 'Track compliance and schedule adherence',
                'icon' => 'CheckCircle',
                'color' => 'indigo',
                'reports' => [
                    ['name' => 'Schedule Compliance', 'key' => 'schedule-compliance'],
                    ['name' => 'Maintenance Records', 'key' => 'maintenance-records'],
                    ['name' => 'Quality Assurance', 'key' => 'quality-assurance'],
                    ['name' => 'Audit Trail', 'key' => 'audit-trail'],
                ]
            ]
        ];
    }

    /**
     * Get quick statistics for dashboard
     */
    private function getQuickStats()
    {
        return [
            'total_batches' => Batch::count(),
            'active_batches' => Batch::whereIn('status', [
                BatchStatus::INCUBATING,
                BatchStatus::GROWING,
                BatchStatus::LAYING
            ])->count(),
            'avg_hatch_rate' => round(Batch::whereNotNull('hatch_rate')->avg('hatch_rate'), 1),
            'total_production' => Batch::where('status', BatchStatus::LAYING)
                ->sum('avg_daily_production'),
            'incubator_utilization' => round(
                (Incubator::sum('current_load') / max(Incubator::sum('capacity'), 1)) * 100, 1
            ),
            'avg_mortality_rate' => round(Batch::whereNotNull('mortality_rate')->avg('mortality_rate'), 1),
            'completed_batches_month' => Batch::where('status', BatchStatus::COMPLETED)
                ->whereBetween('updated_at', [now()->startOfMonth(), now()->endOfMonth()])
                ->count(),
            'revenue_month' => 0, // Placeholder for future financial tracking
        ];
    }

    /**
     * Get performance metrics
     */
    private function getPerformanceMetrics()
    {
        $lastMonth = now()->subMonth();
        
        return [
            'production_trend' => $this->getProductionTrend(),
            'efficiency_metrics' => $this->getEfficiencyMetrics(),
            'batch_performance' => $this->getBatchPerformanceMetrics(),
            'incubator_performance' => $this->getIncubatorPerformanceMetrics(),
        ];
    }

    /**
     * Generate production report
     */
    private function generateProductionReport($params)
    {
        $dateFrom = Carbon::parse($params['date_from']);
        $dateTo = Carbon::parse($params['date_to']);
        
        $batches = Batch::whereBetween('created_at', [$dateFrom, $dateTo]);
        
        if (!empty($params['batch_ids'])) {
            $batches->whereIn('id', $params['batch_ids']);
        }
        
        $batchData = $batches->get();
        
        return [
            'title' => 'Production Report',
            'period' => $dateFrom->format('M j, Y') . ' - ' . $dateTo->format('M j, Y'),
            'summary' => [
                'total_batches' => $batchData->count(),
                'total_eggs_set' => $batchData->sum('initial_count'),
                'total_hatched' => $batchData->sum('current_count'),
                'average_hatch_rate' => round($batchData->avg('hatch_rate'), 2),
                'total_production' => $batchData->sum('avg_daily_production'),
                'average_mortality' => round($batchData->avg('mortality_rate'), 2),
            ],
            'batch_details' => $batchData->map(function ($batch) {
                return [
                    'id' => $batch->id,
                    'name' => $batch->name,
                    'batch_code' => $batch->batch_code,
                    'status' => $batch->status->label(),
                    'breed' => $batch->breed,
                    'start_date' => $batch->start_date?->format('M j, Y'),
                    'hatch_date' => $batch->hatch_date?->format('M j, Y'),
                    'initial_count' => $batch->initial_count,
                    'current_count' => $batch->current_count,
                    'hatch_rate' => $batch->hatch_rate,
                    'mortality_rate' => $batch->mortality_rate,
                    'daily_production' => $batch->avg_daily_production,
                ];
            }),
            'charts' => $this->getProductionCharts($batchData),
        ];
    }

    /**
     * Generate efficiency report
     */
    private function generateEfficiencyReport($params)
    {
        $dateFrom = Carbon::parse($params['date_from']);
        $dateTo = Carbon::parse($params['date_to']);
        
        $incubators = Incubator::all();
        if (!empty($params['incubator_ids'])) {
            $incubators = $incubators->whereIn('id', $params['incubator_ids']);
        }
        
        return [
            'title' => 'Efficiency Report',
            'period' => $dateFrom->format('M j, Y') . ' - ' . $dateTo->format('M j, Y'),
            'summary' => [
                'total_incubators' => $incubators->count(),
                'average_utilization' => round($incubators->avg('utilization_rate'), 2),
                'total_capacity' => $incubators->sum('capacity'),
                'current_load' => $incubators->sum('current_load'),
                'operational_efficiency' => $this->calculateOperationalEfficiency($incubators),
            ],
            'incubator_details' => $incubators->map(function ($incubator) {
                return [
                    'id' => $incubator->id,
                    'name' => $incubator->name,
                    'model' => $incubator->model,
                    'status' => $incubator->status->label(),
                    'capacity' => $incubator->capacity,
                    'current_load' => $incubator->current_load,
                    'utilization_rate' => $incubator->utilization_rate,
                    'energy_efficiency' => $this->calculateEnergyEfficiency($incubator),
                    'uptime_percentage' => $this->calculateUptimePercentage($incubator),
                ];
            }),
            'charts' => $this->getEfficiencyCharts($incubators),
        ];
    }

    /**
     * Generate financial report
     */
    private function generateFinancialReport($params)
    {
        $dateFrom = Carbon::parse($params['date_from']);
        $dateTo = Carbon::parse($params['date_to']);
        
        $batches = Batch::whereBetween('created_at', [$dateFrom, $dateTo]);
        
        if (!empty($params['batch_ids'])) {
            $batches->whereIn('id', $params['batch_ids']);
        }
        
        $batchData = $batches->get();
        
        return [
            'title' => 'Financial Report',
            'period' => $dateFrom->format('M j, Y') . ' - ' . $dateTo->format('M j, Y'),
            'summary' => [
                'total_investment' => $this->calculateTotalInvestment($batchData),
                'total_revenue' => $this->calculateTotalRevenue($batchData),
                'total_profit' => $this->calculateTotalProfit($batchData),
                'average_roi' => $this->calculateAverageROI($batchData),
                'cost_per_bird' => $this->calculateCostPerBird($batchData),
                'revenue_per_bird' => $this->calculateRevenuePerBird($batchData),
            ],
            'batch_financials' => $batchData->map(function ($batch) {
                return [
                    'id' => $batch->id,
                    'name' => $batch->name,
                    'investment' => $this->calculateBatchInvestment($batch),
                    'revenue' => $this->calculateBatchRevenue($batch),
                    'profit' => $this->calculateBatchProfit($batch),
                    'roi_percentage' => $this->calculateBatchROI($batch),
                    'cost_per_bird' => $this->calculateBatchCostPerBird($batch),
                ];
            }),
            'charts' => $this->getFinancialCharts($batchData),
        ];
    }

    /**
     * Generate batch performance report
     */
    private function generateBatchPerformanceReport($params)
    {
        $dateFrom = Carbon::parse($params['date_from']);
        $dateTo = Carbon::parse($params['date_to']);
        
        $batches = Batch::with(['incubator', 'manager'])
            ->whereBetween('created_at', [$dateFrom, $dateTo]);
        
        if (!empty($params['batch_ids'])) {
            $batches->whereIn('id', $params['batch_ids']);
        }
        
        $batchData = $batches->get();
        
        return [
            'title' => 'Batch Performance Report',
            'period' => $dateFrom->format('M j, Y') . ' - ' . $dateTo->format('M j, Y'),
            'performance_summary' => $this->getBatchPerformanceSummary($batchData),
            'batch_analysis' => $batchData->map(function ($batch) {
                return [
                    'id' => $batch->id,
                    'name' => $batch->name,
                    'batch_code' => $batch->batch_code,
                    'breed' => $batch->breed,
                    'manager' => $batch->manager?->name,
                    'incubator' => $batch->incubator?->name,
                    'performance_score' => $this->calculatePerformanceScore($batch),
                    'hatch_success' => $batch->hatch_rate,
                    'growth_rate' => $this->calculateGrowthRate($batch),
                    'feed_efficiency' => $this->calculateFeedEfficiency($batch),
                    'health_score' => $this->calculateHealthScore($batch),
                ];
            }),
            'recommendations' => $this->generatePerformanceRecommendations($batchData),
        ];
    }

    /**
     * Generate incubator analysis report
     */
    private function generateIncubatorAnalysisReport($params)
    {
        $dateFrom = Carbon::parse($params['date_from']);
        $dateTo = Carbon::parse($params['date_to']);
        
        $incubators = Incubator::with(['batches' => function($query) use ($dateFrom, $dateTo) {
            $query->whereBetween('created_at', [$dateFrom, $dateTo]);
        }]);
        
        if (!empty($params['incubator_ids'])) {
            $incubators->whereIn('id', $params['incubator_ids']);
        }
        
        $incubatorData = $incubators->get();
        
        return [
            'title' => 'Incubator Analysis Report',
            'period' => $dateFrom->format('M j, Y') . ' - ' . $dateTo->format('M j, Y'),
            'analysis_summary' => $this->getIncubatorAnalysisSummary($incubatorData),
            'incubator_performance' => $incubatorData->map(function ($incubator) {
                return [
                    'id' => $incubator->id,
                    'name' => $incubator->name,
                    'model' => $incubator->model,
                    'efficiency_score' => $this->calculateIncubatorEfficiency($incubator),
                    'reliability_score' => $this->calculateReliabilityScore($incubator),
                    'maintenance_score' => $this->calculateMaintenanceScore($incubator),
                    'energy_consumption' => $this->calculateEnergyConsumption($incubator),
                    'batches_processed' => $incubator->batches->count(),
                    'average_hatch_rate' => $incubator->batches->avg('hatch_rate'),
                ];
            }),
            'maintenance_schedule' => $this->getMaintenanceSchedule($incubatorData),
        ];
    }

    /**
     * Generate schedule compliance report
     */
    private function generateScheduleComplianceReport($params)
    {
        $dateFrom = Carbon::parse($params['date_from']);
        $dateTo = Carbon::parse($params['date_to']);
        
        $schedules = BatchSchedule::with(['batch', 'assignedTo'])
            ->whereBetween('scheduled_date', [$dateFrom, $dateTo]);
        
        $scheduleData = $schedules->get();
        
        return [
            'title' => 'Schedule Compliance Report',
            'period' => $dateFrom->format('M j, Y') . ' - ' . $dateTo->format('M j, Y'),
            'compliance_summary' => [
                'total_schedules' => $scheduleData->count(),
                'completed_on_time' => $scheduleData->where('status', ScheduleStatus::COMPLETED)->count(),
                'overdue' => $scheduleData->where('status', ScheduleStatus::OVERDUE)->count(),
                'compliance_rate' => $this->calculateComplianceRate($scheduleData),
                'average_delay' => $this->calculateAverageDelay($scheduleData),
            ],
            'schedule_details' => $scheduleData->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'title' => $schedule->title,
                    'batch_name' => $schedule->batch?->name,
                    'assigned_to' => $schedule->assignedTo?->name,
                    'scheduled_date' => $schedule->scheduled_date->format('M j, Y H:i'),
                    'completed_date' => $schedule->completed_at?->format('M j, Y H:i'),
                    'status' => $schedule->status->label(),
                    'delay_hours' => $this->calculateDelayHours($schedule),
                ];
            }),
            'performance_by_type' => $this->getPerformanceByScheduleType($scheduleData),
        ];
    }

    // Helper methods for calculations would go here
    private function getProductionTrend() { return []; }
    private function getEfficiencyMetrics() { return []; }
    private function getBatchPerformanceMetrics() { return []; }
    private function getIncubatorPerformanceMetrics() { return []; }
    private function getProductionCharts($data) { return []; }
    private function getEfficiencyCharts($data) { return []; }
    private function getFinancialCharts($data) { return []; }
    private function calculateOperationalEfficiency($incubators) { return 85.5; }
    private function calculateEnergyEfficiency($incubator) { return 78.2; }
    private function calculateUptimePercentage($incubator) { return 96.8; }
    private function calculateTotalInvestment($batches) { return 50000; }
    private function calculateTotalRevenue($batches) { return 75000; }
    private function calculateTotalProfit($batches) { return 25000; }
    private function calculateAverageROI($batches) { return 50.0; }
    private function calculateCostPerBird($batches) { return 12.50; }
    private function calculateRevenuePerBird($batches) { return 18.75; }
    private function calculateBatchInvestment($batch) { return 5000; }
    private function calculateBatchRevenue($batch) { return 7500; }
    private function calculateBatchProfit($batch) { return 2500; }
    private function calculateBatchROI($batch) { return 50.0; }
    private function calculateBatchCostPerBird($batch) { return 12.50; }
    private function getBatchPerformanceSummary($batches) { return []; }
    private function calculatePerformanceScore($batch) { return 85.2; }
    private function calculateGrowthRate($batch) { return 95.5; }
    private function calculateFeedEfficiency($batch) { return 88.3; }
    private function calculateHealthScore($batch) { return 92.1; }
    private function generatePerformanceRecommendations($batches) { return []; }
    private function getIncubatorAnalysisSummary($incubators) { return []; }
    private function calculateIncubatorEfficiency($incubator) { return 87.5; }
    private function calculateReliabilityScore($incubator) { return 94.2; }
    private function calculateMaintenanceScore($incubator) { return 89.7; }
    private function calculateEnergyConsumption($incubator) { return 1250.5; }
    private function getMaintenanceSchedule($incubators) { return []; }
    private function calculateComplianceRate($schedules) { return 88.5; }
    private function calculateAverageDelay($schedules) { return 2.3; }
    private function calculateDelayHours($schedule) { return 0; }
    private function getPerformanceByScheduleType($schedules) { return []; }

    /**
     * Get available report types
     */
    private function getReportTypes()
    {
        return [
            [
                'key' => 'production',
                'name' => 'Production Report',
                'description' => 'Comprehensive production metrics and analysis',
                'icon' => 'TrendingUp',
                'category' => 'production'
            ],
            [
                'key' => 'efficiency',
                'name' => 'Efficiency Report',
                'description' => 'Operational efficiency and optimization analysis',
                'icon' => 'BarChart3',
                'category' => 'efficiency'
            ],
            [
                'key' => 'financial',
                'name' => 'Financial Report',
                'description' => 'Financial performance and profitability analysis',
                'icon' => 'DollarSign',
                'category' => 'financial'
            ],
            [
                'key' => 'batch-performance',
                'name' => 'Batch Performance Report',
                'description' => 'Detailed analysis of individual batch performance',
                'icon' => 'Package',
                'category' => 'production'
            ],
            [
                'key' => 'incubator-analysis',
                'name' => 'Incubator Analysis Report',
                'description' => 'Comprehensive incubator performance and maintenance analysis',
                'icon' => 'Settings',
                'category' => 'efficiency'
            ],
            [
                'key' => 'schedule-compliance',
                'name' => 'Schedule Compliance Report',
                'description' => 'Track adherence to schedules and task completion',
                'icon' => 'Calendar',
                'category' => 'compliance'
            ],
        ];
    }
}
