<?php

namespace App\Modules\BatchIncubator\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\BatchIncubator\Models\Batch;
use App\Modules\BatchIncubator\Models\Incubator;
use App\Modules\BatchIncubator\Models\BatchSchedule;
use App\Modules\BatchIncubator\Enums\BatchStatus;
use App\Modules\BatchIncubator\Enums\IncubatorStatus;
use App\Modules\BatchIncubator\Enums\ScheduleStatus;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Show the dashboard with BatchIncubator statistics
     */
    public function index()
    {
        // Get batch statistics
        $batchStats = [
            'total_batches' => Batch::count(),
            'active_batches' => Batch::whereIn('status', [
                BatchStatus::INCUBATING,
                BatchStatus::GROWING,
                BatchStatus::LAYING
            ])->count(),
            'total_birds' => Batch::whereIn('status', [
                BatchStatus::GROWING,
                BatchStatus::LAYING
            ])->sum('current_count'),
            'daily_production' => Batch::where('status', BatchStatus::LAYING)
                ->sum('avg_daily_production'),
            'average_survival_rate' => Batch::whereNotNull('mortality_rate')
                ->avg(DB::raw('(100 - mortality_rate)')),
        ];

        // Get incubator statistics
        $incubatorStats = [
            'total_incubators' => Incubator::count(),
            'active_incubators' => Incubator::where('status', IncubatorStatus::RUNNING)->count(),
            'idle_incubators' => Incubator::where('status', IncubatorStatus::IDLE)->count(),
            'total_capacity' => Incubator::sum('capacity'),
            'current_utilization' => Incubator::sum('current_load'),
            'average_temperature' => Incubator::whereNotNull('current_temperature')->avg('current_temperature'),
            'average_humidity' => Incubator::whereNotNull('current_humidity')->avg('current_humidity'),
        ];

        // Get recent batches for overview
        $recentBatches = Batch::with(['incubator', 'manager'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($batch) {
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
                    'age_days' => $batch->age_days,
                ];
            });

        // Get incubator status overview
        $incubatorOverview = Incubator::get(['id', 'name', 'status', 'current_load', 'capacity'])
            ->map(function ($incubator) {
                return [
                    'id' => $incubator->id,
                    'name' => $incubator->name,
                    'status' => [
                        'value' => $incubator->status->value,
                        'label' => $incubator->status->label(),
                        'color' => $incubator->status->color(),
                    ],
                    'utilization' => $incubator->utilization_rate,
                ];
            });

        // Get upcoming alerts and notifications
        $alerts = collect();

        // Maintenance due alerts
        $maintenanceDue = Incubator::whereDate('next_maintenance', '<=', now()->addDays(7))
            ->get(['id', 'name', 'next_maintenance'])
            ->map(function ($incubator) {
                return [
                    'type' => 'maintenance',
                    'title' => 'Maintenance Due',
                    'message' => "{$incubator->name} requires maintenance",
                    'date' => $incubator->next_maintenance,
                    'priority' => 'medium',
                    'color' => 'amber',
                ];
            });

        // Hatch date approaching alerts
        $hatchingSoon = Batch::where('status', BatchStatus::INCUBATING)
            ->whereDate('hatch_date', '<=', now()->addDays(10))
            ->get(['id', 'name', 'hatch_date'])
            ->map(function ($batch) {
                return [
                    'type' => 'hatching',
                    'title' => 'Hatch Date Approaching',
                    'message' => "{$batch->name} expected to hatch soon",
                    'date' => $batch->hatch_date,
                    'priority' => 'high',
                    'color' => 'blue',
                ];
            });

        // High mortality alerts
        $highMortality = Batch::where('mortality_rate', '>', 5)
            ->whereIn('status', [BatchStatus::GROWING, BatchStatus::LAYING])
            ->get(['id', 'name', 'mortality_rate'])
            ->map(function ($batch) {
                return [
                    'type' => 'mortality',
                    'title' => 'High Mortality Rate',
                    'message' => "{$batch->name} has {$batch->mortality_rate}% mortality",
                    'priority' => 'high',
                    'color' => 'red',
                ];
            });

        $alerts = $alerts->concat($maintenanceDue)
                        ->concat($hatchingSoon)
                        ->concat($highMortality)
                        ->sortByDesc('priority')
                        ->take(5);

        // Get upcoming schedules
        $upcomingSchedules = BatchSchedule::with(['batch', 'assignedTo'])
            ->where('status', ScheduleStatus::PENDING)
            ->whereDate('scheduled_date', '>=', now())
            ->whereDate('scheduled_date', '<=', now()->addDays(7))
            ->orderBy('scheduled_date')
            ->limit(5)
            ->get()
            ->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'title' => $schedule->title,
                    'batch_name' => $schedule->batch->name,
                    'scheduled_date' => $schedule->scheduled_date->format('M j, Y H:i'),
                    'priority' => $schedule->priority,
                    'assigned_to' => $schedule->assignedTo?->name ?? 'Unassigned',
                ];
            });

        return Inertia::render('dashboard', [
            'batchStats' => $batchStats,
            'incubatorStats' => $incubatorStats,
            'recentBatches' => $recentBatches,
            'incubatorOverview' => $incubatorOverview,
            'alerts' => $alerts,
            'upcomingSchedules' => $upcomingSchedules,
        ]);
    }
}
