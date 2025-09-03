<?php

namespace App\Http\Controllers;

use App\Modules\BatchIncubator\Models\Batch;
use App\Modules\BatchIncubator\Models\Incubator;
use App\Modules\BatchIncubator\Models\BatchEvent;
use App\Modules\BatchIncubator\Models\BatchSchedule;
use App\Modules\BatchIncubator\Enums\BatchStatus;
use App\Modules\BatchIncubator\Enums\IncubatorStatus;
use App\Modules\BatchIncubator\Enums\EventType;
use App\Modules\BatchIncubator\Enums\ScheduleStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BatchIncubatorController extends Controller
{
    /**
     * Module overview/index page - Main landing page for BatchIncubator module
     */
    public function index()
    {
        // Batch statistics
        $batchStats = [
            'total_batches' => Batch::count(),
            'active_batches' => Batch::whereIn('status', [
                BatchStatus::INCUBATING,
                BatchStatus::GROWING,
                BatchStatus::LAYING
            ])->count(),
            'total_birds' => Batch::sum('current_count'),
            'daily_production' => Batch::sum('avg_daily_production'),
            'average_survival_rate' => Batch::avg('survival_rate') ?? 0,
        ];

        // Incubator statistics
        $incubatorStats = [
            'total_incubators' => Incubator::count(),
            'active_incubators' => Incubator::where('status', IncubatorStatus::RUNNING)->count(),
            'idle_incubators' => Incubator::where('status', IncubatorStatus::IDLE)->count(),
            'total_capacity' => Incubator::sum('capacity'),
            'current_utilization' => Incubator::sum('current_load'),
            'average_temperature' => Incubator::avg('current_temperature') ?? 0,
            'average_humidity' => Incubator::avg('current_humidity') ?? 0,
        ];

        // Recent batches with status formatting
        $recentBatches = Batch::with(['manager', 'incubator'])
            ->orderBy('created_at', 'desc')
            ->take(5)
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
                    'age_days' => $batch->age_days ?? 0,
                ];
            });

        // Incubator overview
        $incubatorOverview = Incubator::with('owner')
            ->take(5)
            ->get()
            ->map(function ($incubator) {
                return [
                    'id' => $incubator->id,
                    'name' => $incubator->name,
                    'status' => [
                        'value' => $incubator->status->value,
                        'label' => $incubator->status->label(),
                        'color' => $incubator->status->color(),
                    ],
                    'utilization' => $incubator->capacity > 0
                        ? round(($incubator->current_load / $incubator->capacity) * 100)
                        : 0,
                ];
            });

        // System alerts (sample data for now)
        $alerts = [
            [
                'type' => 'temperature',
                'title' => 'Temperature Alert',
                'message' => 'Incubator #3 temperature is below optimal range',
                'priority' => 'high',
                'color' => 'red',
                'date' => now()->toDateString(),
            ],
            [
                'type' => 'maintenance',
                'title' => 'Maintenance Due',
                'message' => 'Weekly cleaning scheduled for Incubator #1',
                'priority' => 'medium',
                'color' => 'yellow',
                'date' => now()->addDays(2)->toDateString(),
            ],
        ];

        // Upcoming schedules
        $upcomingSchedules = BatchSchedule::with(['batch', 'assignedTo'])
            ->where('status', ScheduleStatus::PENDING)
            ->where('scheduled_date', '>=', now())
            ->orderBy('scheduled_date')
            ->take(5)
            ->get()
            ->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'title' => $schedule->title,
                    'batch_name' => $schedule->batch->name ?? 'Unknown Batch',
                    'scheduled_date' => $schedule->scheduled_date->format('M j, Y'),
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

    /**
     * Dashboard - Overview of all batches and incubators
     */
    public function dashboard()
    {
        $stats = [
            'total_batches' => Batch::count(),
            'active_batches' => Batch::whereIn('status', [
                BatchStatus::INCUBATING,
                BatchStatus::GROWING,
                BatchStatus::LAYING
            ])->count(),
            'total_incubators' => Incubator::count(),
            'running_incubators' => Incubator::where('status', IncubatorStatus::RUNNING)->count(),
            'total_birds' => Batch::sum('current_count'),
            'daily_egg_production' => Batch::sum('avg_daily_production'),
            'pending_schedules' => BatchSchedule::where('status', ScheduleStatus::PENDING)->count(),
            'recent_events' => BatchEvent::count(),
        ];

        $recentBatches = Batch::with(['manager', 'incubator'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        $activeIncubators = Incubator::with('owner')
            ->where('status', IncubatorStatus::RUNNING)
            ->get();

        $upcomingSchedules = BatchSchedule::with(['batch', 'assignedTo'])
            ->where('status', ScheduleStatus::PENDING)
            ->where('scheduled_date', '>=', now())
            ->orderBy('scheduled_date')
            ->take(10)
            ->get();

        $recentEvents = BatchEvent::with(['batch', 'user'])
            ->orderBy('event_date', 'desc')
            ->take(10)
            ->get();

        return Inertia::render('BatchIncubator/Dashboard', [
            'stats' => $stats,
            'recentBatches' => $recentBatches,
            'activeIncubators' => $activeIncubators,
            'upcomingSchedules' => $upcomingSchedules,
            'recentEvents' => $recentEvents,
        ]);
    }

    /**
     * Batches listing page
     */
    public function batches(Request $request)
    {
        $query = Batch::with(['manager', 'incubator'])
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('batch_code', 'like', "%{$search}%")
                      ->orWhere('breed', 'like', "%{$search}%");
                });
            });

        $batches = $query->orderBy('created_at', 'desc')->paginate(12);

        return Inertia::render('BatchIncubator/Batches/Index', [
            'batches' => $batches,
            'filters' => $request->only(['status', 'search']),
            'statuses' => BatchStatus::cases(),
        ]);
    }

    /**
     * Single batch details page
     */
    public function batch(Batch $batch)
    {
        $batch->load([
            'manager',
            'incubator',
            'events' => function ($query) {
                $query->with('user')->orderBy('event_date', 'desc')->take(20);
            },
            'schedules' => function ($query) {
                $query->with('assignedTo')
                    ->where('status', ScheduleStatus::PENDING)
                    ->orderBy('scheduled_date');
            }
        ]);

        return Inertia::render('BatchIncubator/Batches/Show', [
            'batch' => $batch,
        ]);
    }

    /**
     * Incubators listing page
     */
    public function incubators(Request $request)
    {
        $query = Incubator::with(['owner'])
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('model', 'like', "%{$search}%")
                      ->orWhere('serial_number', 'like', "%{$search}%");
                });
            });

        $incubators = $query->orderBy('name')->paginate(12);

        return Inertia::render('BatchIncubator/Incubators/Index', [
            'incubators' => $incubators,
            'filters' => $request->only(['status', 'search']),
            'statuses' => IncubatorStatus::cases(),
        ]);
    }

    /**
     * Single incubator details page
     */
    public function incubator(Incubator $incubator)
    {
        $incubator->load([
            'owner',
            'batches' => function ($query) {
                $query->with('manager')->orderBy('created_at', 'desc')->take(10);
            }
        ]);

        return Inertia::render('BatchIncubator/Incubators/Show', [
            'incubator' => $incubator,
        ]);
    }

    /**
     * Events listing page
     */
    public function events(Request $request)
    {
        $query = BatchEvent::with(['batch', 'user'])
            ->when($request->type, function ($query, $type) {
                $query->where('event_type', $type);
            })
            ->when($request->batch_id, function ($query, $batchId) {
                $query->where('batch_id', $batchId);
            })
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            });

        $events = $query->orderBy('event_date', 'desc')->paginate(20);

        $batches = Batch::select('id', 'name', 'batch_code')->get();

        return Inertia::render('BatchIncubator/Events/Index', [
            'events' => $events,
            'batches' => $batches,
            'filters' => $request->only(['type', 'batch_id', 'search']),
            'eventTypes' => EventType::cases(),
        ]);
    }

    /**
     * Schedules listing page
     */
    public function schedules(Request $request)
    {
        $query = BatchSchedule::with(['batch', 'assignedTo', 'createdBy'])
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->type, function ($query, $type) {
                $query->where('event_type', $type);
            })
            ->when($request->batch_id, function ($query, $batchId) {
                $query->where('batch_id', $batchId);
            })
            ->when($request->assigned_to, function ($query, $userId) {
                $query->where('assigned_to', $userId);
            });

        $schedules = $query->orderBy('scheduled_date')->paginate(20);

        $batches = Batch::select('id', 'name', 'batch_code')->get();

        return Inertia::render('BatchIncubator/Schedules/Index', [
            'schedules' => $schedules,
            'batches' => $batches,
            'filters' => $request->only(['status', 'type', 'batch_id', 'assigned_to']),
            'statuses' => ScheduleStatus::cases(),
            'eventTypes' => EventType::cases(),
        ]);
    }
}
