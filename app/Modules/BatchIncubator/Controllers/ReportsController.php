<?php

namespace App\Modules\BatchIncubator\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Modules\BatchIncubator\Models\Batch;
use App\Modules\BatchIncubator\Models\Incubator;
use App\Modules\BatchIncubator\Enums\BatchStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportsController extends Controller
{
    /**
     * Show the reports dashboard
     */
    public function index()
    {
        $recentReports = Report::where('user_id', Auth::id())
            ->latest()
            ->take(10)
            ->get();

        $quickStats = $this->getQuickStats();

        return Inertia::render('modules/batch-incubator/reports/index', [
            'reports' => $recentReports,
            'quickStats' => $quickStats,
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
            'type' => 'required|string|in:production,efficiency,financial',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'batch_ids' => 'nullable|array',
            'batch_ids.*' => 'integer|exists:batches,id',
            'incubator_ids' => 'nullable|array',
            'incubator_ids.*' => 'integer|exists:incubators,id',
            'format' => 'required|string|in:pdf,excel,json',
        ]);

        try {
            // Calculate date range
            $dateRange = [
                'start' => Carbon::parse($request->start_date)->startOfDay(),
                'end' => Carbon::parse($request->end_date)->endOfDay(),
            ];

            // Generate the appropriate report
            $reportData = match($request->type) {
                'production' => $this->generateProductionReport($dateRange, $request->batch_ids),
                'efficiency' => $this->generateEfficiencyReport($dateRange, $request->incubator_ids),
                'financial' => $this->generateFinancialReport($dateRange, $request->batch_ids),
            };

            // Store the report in database
            $report = Report::create([
                'title' => $reportData['title'],
                'type' => $request->type,
                'parameters' => [
                    'batch_ids' => $request->batch_ids ?? [],
                    'incubator_ids' => $request->incubator_ids ?? [],
                    'start_date' => $request->start_date,
                    'end_date' => $request->end_date,
                    'format' => $request->format,
                ],
                'data' => $reportData,
                'format' => $request->format,
                'period_start' => $dateRange['start'],
                'period_end' => $dateRange['end'],
                'user_id' => Auth::id(),
            ]);

            return redirect()->route('batch-incubator.reports.show', $report->id);

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Failed to generate report: ' . $e->getMessage()]);
        }
    }

    /**
     * Show a generated report
     */
    public function show($reportId)
    {
        $report = Report::where('id', $reportId)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $parameters = $report->parameters;
        $parameters['report_id'] = $report->id;

        return Inertia::render('modules/batch-incubator/reports/show', [
            'report' => $report->data,
            'type' => $report->type,
            'parameters' => $parameters,
        ]);
    }

    /**
     * Download a report in the specified format
     */
    public function download($reportId)
    {
        $report = Report::where('id', $reportId)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $filename = 'batch_incubator_' . $report->type . '_report_' . $report->created_at->format('Y_m_d_H_i_s');

        switch ($report->format) {
            case 'pdf':
                return $this->downloadAsPdf($report, $filename);
            case 'excel':
                return $this->downloadAsExcel($report, $filename);
            default:
                return $this->downloadAsJson($report, $filename);
        }
    }    /**
     * Download report as JSON file
     */
    private function downloadAsJson($report, $filename)
    {
        $jsonContent = json_encode($report->data, JSON_PRETTY_PRINT);

        return response($jsonContent, 200, [
            'Content-Type' => 'application/json',
            'Content-Disposition' => 'attachment; filename="' . $filename . '.json"',
            'Content-Length' => strlen($jsonContent),
        ]);
    }

    /**
     * Download report as PDF (placeholder - can be enhanced with actual PDF generation)
     */
    private function downloadAsPdf($report, $filename)
    {
        // For now, generate a simple text content
        $content = $this->generateReportTextContent($report);

        return response($content, 200, [
            'Content-Type' => 'text/plain',
            'Content-Disposition' => 'attachment; filename="' . $filename . '.txt"',
            'Content-Length' => strlen($content),
        ]);
    }

    /**
     * Download report as Excel (placeholder - can be enhanced with actual Excel generation)
     */
    private function downloadAsExcel($report, $filename)
    {
        // For now, generate CSV content
        $content = $this->generateReportCsvContent($report);

        return response($content, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '.csv"',
            'Content-Length' => strlen($content),
        ]);
    }

    /**
     * Generate text content for report
     */
    private function generateReportTextContent($report)
    {
        $data = $report->data;
        $content = [];

        $content[] = strtoupper($data['title'] ?? 'Report');
        $content[] = str_repeat('=', strlen($data['title'] ?? 'Report'));
        $content[] = '';
        $content[] = 'Period: ' . ($data['period'] ?? 'N/A');
        $content[] = 'Generated: ' . $report->created_at->format('M j, Y H:i:s');
        $content[] = '';

        // Add summary section
        if (isset($data['summary'])) {
            $content[] = 'SUMMARY';
            $content[] = str_repeat('-', 7);
            foreach ($data['summary'] as $key => $value) {
                // Skip raw values in text output
                if (strpos($key, '_raw') !== false) {
                    continue;
                }
                $content[] = ucwords(str_replace('_', ' ', $key)) . ': ' . $value;
            }
            $content[] = '';
        }

        // Add details section
        if (isset($data['batch_details'])) {
            $content[] = 'BATCH DETAILS';
            $content[] = str_repeat('-', 13);
            foreach ($data['batch_details'] as $batch) {
                $content[] = 'Batch: ' . ($batch['name'] ?? 'N/A');
                $content[] = '  Code: ' . ($batch['batch_code'] ?? 'N/A');
                $content[] = '  Status: ' . ($batch['status'] ?? 'N/A');
                $content[] = '  Hatch Rate: ' . ($batch['hatch_rate'] ?? 'N/A') . '%';
                $content[] = '';
            }
        }

        if (isset($data['batch_financials'])) {
            $content[] = 'FINANCIAL DETAILS';
            $content[] = str_repeat('-', 17);
            foreach ($data['batch_financials'] as $batch) {
                $content[] = 'Batch: ' . ($batch['name'] ?? 'N/A');
                $content[] = '  Code: ' . ($batch['batch_code'] ?? 'N/A');
                $content[] = '  Investment: ' . ($batch['investment'] ?? 'N/A');
                $content[] = '  Revenue: ' . ($batch['revenue'] ?? 'N/A');
                $content[] = '  Profit: ' . ($batch['profit'] ?? 'N/A');
                $content[] = '  ROI: ' . ($batch['roi_percentage'] ?? 'N/A');
                $content[] = '';
            }
        }

        if (isset($data['incubator_details'])) {
            $content[] = 'INCUBATOR DETAILS';
            $content[] = str_repeat('-', 17);
            foreach ($data['incubator_details'] as $incubator) {
                $content[] = 'Incubator: ' . ($incubator['name'] ?? 'N/A');
                $content[] = '  Model: ' . ($incubator['model'] ?? 'N/A');
                $content[] = '  Status: ' . ($incubator['status'] ?? 'N/A');
                $content[] = '  Capacity: ' . ($incubator['capacity'] ?? 'N/A');
                $content[] = '  Current Load: ' . ($incubator['current_load'] ?? 'N/A');
                $content[] = '';
            }
        }

        return implode("\n", $content);
    }

    /**
     * Generate CSV content for report
     */
    private function generateReportCsvContent($report)
    {
        $data = $report->data;
        $csv = [];

        // Add header
        $csv[] = '"' . ($data['title'] ?? 'Report') . '"';
        $csv[] = '"Period: ' . ($data['period'] ?? 'N/A') . '"';
        $csv[] = '"Generated: ' . $report->created_at->format('M j, Y H:i:s') . '"';
        $csv[] = '';

        // Add summary as CSV
        if (isset($data['summary'])) {
            $csv[] = '"SUMMARY"';
            $csv[] = '"Metric","Value"';
            foreach ($data['summary'] as $key => $value) {
                // Skip raw values in CSV output
                if (strpos($key, '_raw') !== false) {
                    continue;
                }
                $csv[] = '"' . ucwords(str_replace('_', ' ', $key)) . '","' . $value . '"';
            }
            $csv[] = '';
        }

        // Add batch details as CSV
        if (isset($data['batch_details']) && count($data['batch_details']) > 0) {
            $csv[] = '"BATCH DETAILS"';

            // Get headers from first batch
            $firstBatch = $data['batch_details'][0];
            $headers = array_keys($firstBatch);
            $csv[] = '"' . implode('","', array_map('ucwords', array_map(function($h) { return str_replace('_', ' ', $h); }, $headers))) . '"';

            // Add data rows
            foreach ($data['batch_details'] as $batch) {
                $row = [];
                foreach ($headers as $header) {
                    $row[] = $batch[$header] ?? '';
                }
                $csv[] = '"' . implode('","', $row) . '"';
            }
            $csv[] = '';
        }

        // Add batch financials as CSV
        if (isset($data['batch_financials']) && count($data['batch_financials']) > 0) {
            $csv[] = '"BATCH FINANCIAL DETAILS"';

            // Get headers from first batch financial record, excluding raw values
            $firstBatch = $data['batch_financials'][0];
            $headers = array_filter(array_keys($firstBatch), function($key) {
                return strpos($key, '_raw') === false;
            });
            $csv[] = '"' . implode('","', array_map('ucwords', array_map(function($h) { return str_replace('_', ' ', $h); }, $headers))) . '"';

            // Add data rows
            foreach ($data['batch_financials'] as $batch) {
                $row = [];
                foreach ($headers as $header) {
                    $row[] = $batch[$header] ?? '';
                }
                $csv[] = '"' . implode('","', $row) . '"';
            }
            $csv[] = '';
        }

        // Add incubator details as CSV
        if (isset($data['incubator_details']) && count($data['incubator_details']) > 0) {
            $csv[] = '"INCUBATOR DETAILS"';

            // Get headers from first incubator
            $firstIncubator = $data['incubator_details'][0];
            $headers = array_keys($firstIncubator);
            $csv[] = '"' . implode('","', array_map('ucwords', array_map(function($h) { return str_replace('_', ' ', $h); }, $headers))) . '"';

            // Add data rows
            foreach ($data['incubator_details'] as $incubator) {
                $row = [];
                foreach ($headers as $header) {
                    $row[] = $incubator[$header] ?? '';
                }
                $csv[] = '"' . implode('","', $row) . '"';
            }
        }

        return implode("\n", $csv);
    }

    /**
     * Get quick statistics for dashboard
     */
    private function getQuickStats()
    {
        return [
            'avg_hatch_rate' => round(Batch::whereNotNull('hatch_rate')->avg('hatch_rate') ?? 0, 1),
            'incubator_utilization' => round(
                (Incubator::sum('current_load') / max(Incubator::sum('capacity'), 1)) * 100, 1
            ),
            'active_batches' => Batch::whereIn('status', [
                BatchStatus::INCUBATING,
                BatchStatus::GROWING,
                BatchStatus::LAYING
            ])->count(),
            'avg_mortality_rate' => round(Batch::whereNotNull('mortality_rate')->avg('mortality_rate') ?? 0, 1),
        ];
    }

    /**
     * Generate production report
     */
    private function generateProductionReport($dateRange, $batchIds = null)
    {
        $batches = Batch::whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);

        if (!empty($batchIds)) {
            $batches->whereIn('id', $batchIds);
        }

        $batchData = $batches->get();

        return [
            'title' => 'Production Report',
            'period' => $dateRange['start']->format('M j, Y') . ' - ' . $dateRange['end']->format('M j, Y'),
            'summary' => [
                'total_batches' => $batchData->count(),
                'total_eggs_set' => $batchData->sum('initial_count'),
                'total_hatched' => $batchData->sum('current_count'),
                'average_hatch_rate' => round($batchData->avg('hatch_rate') ?? 0, 2),
                'total_production' => $batchData->sum('avg_daily_production'),
                'average_mortality' => round($batchData->avg('mortality_rate') ?? 0, 2),
            ],
            'batch_details' => $batchData->map(function ($batch) {
                return [
                    'name' => $batch->name,
                    'batch_code' => $batch->batch_code,
                    'status' => $batch->status->label(),
                    'breed' => $batch->breed,
                    'initial_count' => $batch->initial_count,
                    'current_count' => $batch->current_count,
                    'hatch_rate' => $batch->hatch_rate,
                    'mortality_rate' => $batch->mortality_rate,
                ];
            }),
        ];
    }

    /**
     * Generate efficiency report
     */
    private function generateEfficiencyReport($dateRange, $incubatorIds = null)
    {
        $incubators = Incubator::query();
        if (!empty($incubatorIds)) {
            $incubators->whereIn('id', $incubatorIds);
        }

        $incubatorData = $incubators->get();

        return [
            'title' => 'Efficiency Report',
            'period' => $dateRange['start']->format('M j, Y') . ' - ' . $dateRange['end']->format('M j, Y'),
            'summary' => [
                'total_incubators' => $incubatorData->count(),
                'average_utilization' => round($incubatorData->avg('utilization_rate') ?? 0, 2),
                'total_capacity' => $incubatorData->sum('capacity'),
                'current_load' => $incubatorData->sum('current_load'),
            ],
            'incubator_details' => $incubatorData->map(function ($incubator) {
                return [
                    'name' => $incubator->name,
                    'model' => $incubator->model,
                    'status' => $incubator->status->label(),
                    'capacity' => $incubator->capacity,
                    'current_load' => $incubator->current_load,
                    'utilization_rate' => $incubator->utilization_rate,
                ];
            }),
        ];
    }

    /**
     * Format currency value to RWF
     */
    private function formatRWF($amount)
    {
        return 'RWF ' . number_format($amount, 0, '.', ',');
    }

    /**
     * Generate financial report
     */
    private function generateFinancialReport($dateRange, $batchIds = null)
    {
        $batches = Batch::whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);

        if (!empty($batchIds)) {
            $batches->whereIn('id', $batchIds);
        }

        $batchData = $batches->get();

        // Calculate financial metrics (using sample data - replace with actual calculations)
        $totalInvestment = 12500000; // 12.5M RWF
        $totalRevenue = 18750000; // 18.75M RWF
        $totalProfit = $totalRevenue - $totalInvestment;
        $averageROI = $totalInvestment > 0 ? ($totalProfit / $totalInvestment) * 100 : 0;

        return [
            'title' => 'Financial Report',
            'period' => $dateRange['start']->format('M j, Y') . ' - ' . $dateRange['end']->format('M j, Y'),
            'currency' => 'RWF',
            'summary' => [
                'total_investment' => $this->formatRWF($totalInvestment),
                'total_investment_raw' => $totalInvestment,
                'total_revenue' => $this->formatRWF($totalRevenue),
                'total_revenue_raw' => $totalRevenue,
                'total_profit' => $this->formatRWF($totalProfit),
                'total_profit_raw' => $totalProfit,
                'average_roi' => round($averageROI, 2) . '%',
                'average_roi_raw' => round($averageROI, 2),
            ],
            'batch_financials' => $batchData->map(function ($batch) {
                // Sample financial data per batch (replace with actual calculations)
                $investment = 1250000; // 1.25M RWF per batch
                $revenue = 1875000; // 1.875M RWF per batch
                $profit = $revenue - $investment;
                $roi = $investment > 0 ? ($profit / $investment) * 100 : 0;

                return [
                    'name' => $batch->name,
                    'batch_code' => $batch->batch_code,
                    'investment' => $this->formatRWF($investment),
                    'investment_raw' => $investment,
                    'revenue' => $this->formatRWF($revenue),
                    'revenue_raw' => $revenue,
                    'profit' => $this->formatRWF($profit),
                    'profit_raw' => $profit,
                    'roi_percentage' => round($roi, 2) . '%',
                    'roi_raw' => round($roi, 2),
                ];
            }),
        ];
    }

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
        ];
    }
}
