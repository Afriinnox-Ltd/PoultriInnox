<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Modules\BatchIncubator\Models\Batch;
use App\Modules\BatchIncubator\Models\Incubator;
use App\Modules\BatchIncubator\Models\BatchSchedule;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class BatchIncubatorController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Batch Statistics - only accessible batches
        $batches = Batch::active()->accessibleBy($user)->get();
        $allBatches = Batch::accessibleBy($user)->get();

        // Calculate average survival rate from mortality rate
        $avgSurvivalRate = 0;
        if ($batches->isNotEmpty()) {
            $avgMortalityRate = $batches->avg(function($batch) {
                return $batch->initial_count > 0
                    ? (($batch->mortality_count / $batch->initial_count) * 100)
                    : 0;
            });
            $avgSurvivalRate = 100 - $avgMortalityRate;
        }

        $batchStats = [
            'total_batches' => $allBatches->count(),
            'active_batches' => $batches->count(),
            'total_birds' => $batches->sum('current_count'),
            'daily_production' => $batches->sum('avg_daily_production'),
            'average_survival_rate' => round($avgSurvivalRate, 1),
        ];

        // Incubator Statistics - only accessible incubators
        $incubators = Incubator::accessibleBy($user)->get();
        $activeIncubators = $incubators->filter(function ($incubator) {
            return isset($incubator->status) && $incubator->status->isOperational();
        });

        $incubatorStats = [
            'total_incubators' => $incubators->count(),
            'active_incubators' => $activeIncubators->count(),
            'idle_incubators' => $incubators->filter(function ($incubator) {
                return isset($incubator->status) && $incubator->status->value== 'idle';
            })->count(),
            'total_capacity' => $incubators->sum('capacity'),
            'current_utilization' => $incubators->sum('current_load'),
            'average_temperature' => $activeIncubators->isNotEmpty()
                ? round($activeIncubators->avg('current_temperature'), 1)
                : 0,
            'average_humidity' => $activeIncubators->isNotEmpty()
                ? round($activeIncubators->avg('current_humidity'), 1)
                : 0,
        ];

        // Recent Batches - only accessible
        $recentBatches = Batch::accessibleBy($user)
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($batch) {
                $ageDays = $batch->start_date ? now()->diffInDays($batch->start_date) : 0;

                return [
                    'id' => $batch->id,
                    'batch_code' => $batch->batch_code,
                    'name' => $batch->name,
                    'status' => [
                        'value' => $batch->status->value,
                        'label' => $batch->status->label(),
                        'color' => $batch->status->color(),
                    ],
                    'current_count' => $batch->current_count,
                    'age_days' => $ageDays,
                ];
            });

        // Incubator Overview
        $incubatorOverview = $incubators->map(function ($incubator) {
            $utilization = isset($incubator->capacity) && $incubator->capacity > 0
                ? round(($incubator->current_load / $incubator->capacity) * 100)
                : 0;

            return [
                'id' => $incubator->id,
                'name' => $incubator->name,
                'status' => [
                    'value' => $incubator->status->value,
                    'label' => $incubator->status->label(),
                    'color' => $incubator->status->color(),
                ],
                'utilization' => $utilization,
            ];
        });

        // System Alerts
        $alerts = $this->generateSystemAlerts($batches, $incubators);

        // Upcoming Schedules - only for accessible batches
        $upcomingSchedules = BatchSchedule::with(['batch', 'assignedTo'])
            ->whereHas('batch', function($query) use ($user) {
                $query->accessibleBy($user);
            })
            ->where('scheduled_date', '>=', Carbon::today())
            ->where('status', '!=', 'completed')
            ->orderBy('scheduled_date')
            ->limit(10)
            ->get()
            ->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'title' => $schedule->title,
                    'batch_name' => $schedule->batch->name ?? 'Unknown Batch',
                    'scheduled_date' => $schedule->scheduled_date->format('M d, Y'),
                    'priority' => $schedule->priority ?? 'medium',
                    'assigned_to' => $schedule->assignedTo->name ?? 'Unassigned',
                ];
            });

        return Inertia::render('modules/batch-incubator/index', [
            'batchStats' => $batchStats,
            'incubatorStats' => $incubatorStats,
            'recentBatches' => $recentBatches,
            'incubatorOverview' => $incubatorOverview,
            'alerts' => $alerts,
            'upcomingSchedules' => $upcomingSchedules,
        ]);
    }

    private function generateSystemAlerts($batches, $incubators)
    {
        $alerts = [];

        // High mortality rate alerts
        foreach ($batches as $batch) {
            if (isset($batch->mortality_rate) && $batch->mortality_rate > 10) {
                $alerts[] = [
                    'type' => 'mortality',
                    'title' => 'High Mortality Rate',
                    'message' => "Batch {$batch->name} has {$batch->mortality_rate}% mortality rate",
                    'priority' => 'high',
                    'color' => 'red',
                    'date' => Carbon::now()->format('M d, Y H:i'),
                ];
            }
        }

        // Temperature alerts
        foreach ($incubators as $incubator) {
            if (isset($incubator->current_temperature) &&
                $incubator->current_temperature &&
                ($incubator->current_temperature < 35 || $incubator->current_temperature > 42)) {
                $alerts[] = [
                    'type' => 'temperature',
                    'title' => 'Temperature Alert',
                    'message' => "Incubator {$incubator->name} temperature is {$incubator->current_temperature}°C",
                    'priority' => 'high',
                    'color' => 'red',
                    'date' => Carbon::now()->format('M d, Y H:i'),
                ];
            }
        }

        // Overdue schedules
        $overdueCount = BatchSchedule::where('scheduled_date', '<', Carbon::today())
            ->where('status', '!=', 'completed')
            ->count();

        if ($overdueCount > 0) {
            $alerts[] = [
                'type' => 'schedule',
                'title' => 'Overdue Tasks',
                'message' => "{$overdueCount} scheduled tasks are overdue",
                'priority' => 'medium',
                'color' => 'yellow',
                'date' => Carbon::now()->format('M d, Y H:i'),
            ];
        }

        // Low utilization warning
        $lowUtilizationIncubators = $incubators->filter(function ($incubator) {
            return isset($incubator->capacity) &&
                   isset($incubator->current_load) &&
                   $incubator->capacity > 0 &&
                   (($incubator->current_load / $incubator->capacity) * 100) < 20 &&
                   isset($incubator->status) &&
                   $incubator->status->value== 'running';
        });

        if ($lowUtilizationIncubators->count() > 0) {
            $alerts[] = [
                'type' => 'utilization',
                'title' => 'Low Utilization',
                'message' => "{$lowUtilizationIncubators->count()} incubators have low utilization rates",
                'priority' => 'low',
                'color' => 'blue',
                'date' => Carbon::now()->format('M d, Y H:i'),
            ];
        }

        return $alerts;
    }
}
