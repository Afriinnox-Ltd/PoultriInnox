<?php

namespace App\Modules\BatchIncubator\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\BatchIncubator\Models\Batch;
use App\Modules\BatchIncubator\Models\Incubator;
use App\Modules\BatchIncubator\Enums\BatchStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BatchController extends Controller
{
    /**
     * Display a listing of batches
     */
    public function index()
    {
        $batches = Batch::with(['incubator', 'manager'])
            ->latest()
            ->get()
            ->map(function ($batch) {
                return [
                    'id' => $batch->id,
                    'batch_code' => $batch->batch_code,
                    'name' => $batch->name,
                    'breed' => $batch->breed,
                    'status' => [
                        'value' => $batch->status->value,
                        'label' => $batch->status->label(),
                        'color' => $batch->status->color(),
                    ],
                    'current_count' => $batch->current_count,
                    'initial_count' => $batch->initial_count,
                    'mortality_rate' => $batch->mortality_rate,
                    'avg_daily_production' => $batch->avg_daily_production,
                    'incubator' => $batch->incubator ? [
                        'id' => $batch->incubator->id,
                        'name' => $batch->incubator->name,
                        'status' => $batch->incubator->status->label(),
                    ] : null,
                    'manager' => [
                        'id' => $batch->manager->id,
                        'name' => $batch->manager->name,
                    ],
                    'start_date' => $batch->start_date?->format('Y-m-d'),
                    'hatch_date' => $batch->hatch_date?->format('Y-m-d'),
                    'expected_completion_date' => $batch->expected_completion_date?->format('Y-m-d'),
                    'age_days' => $batch->age_days,
                    'survival_rate' => $batch->survival_rate,
                    'total_cost' => $batch->total_cost,
                    'profit_loss' => $batch->profit_loss,
                ];
            });

        $stats = [
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
        ];

        return Inertia::render('modules/batch-incubator/batches/index', [
            'batches' => $batches,
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for creating a new batch
     */
    public function create()
    {
        $incubators = Incubator::whereIn('status', ['idle', 'running'])->get(['id', 'name', 'capacity', 'current_load', 'status']);

        return Inertia::render('modules/batch-incubator/batches/create', [
            'incubators' => $incubators,
            'statuses' => array_map(function ($status) {
                return [
                    'value' => $status->value,
                    'label' => $status->label(),
                ];
            }, BatchStatus::cases()),
        ]);
    }

    /**
     * Store a newly created batch
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'breed' => 'required|string|max:100',
            'initial_count' => 'required|integer|min:1',
            'status' => 'required|in:' . implode(',', array_map(fn($s) => $s->value, BatchStatus::cases())),
            'incubator_id' => 'nullable|exists:incubators,id',
            'start_date' => 'nullable|date',
            'expected_completion_date' => 'nullable|date|after:start_date',
            'initial_weight' => 'nullable|numeric|min:0',
            'initial_cost' => 'nullable|numeric|min:0',
        ]);

        // Generate batch code
        $validated['batch_code'] = 'BTH-' . now()->format('Ymd') . '-' . strtoupper(substr(uniqid(), -4));
        $validated['current_count'] = $validated['initial_count'];
        $validated['current_weight'] = $validated['initial_weight'] ?? null;
        $validated['manager_id'] = Auth::id();

        if ($validated['status'] === BatchStatus::INCUBATING->value && $validated['start_date']) {
            $validated['hatch_date'] = now()->parse($validated['start_date'])->addDays(21);
        }

        $batch = Batch::create($validated);

        return redirect()->route('batch-incubator.batches.show', $batch)
            ->with('success', 'Batch created successfully!');
    }

    /**
     * Display the specified batch
     */
    public function show(Batch $batch)
    {
        $batch->load(['incubator', 'manager', 'events.user', 'schedules.assignedUser']);

        return Inertia::render('modules/batch-incubator/batches/show', [
            'batch' => [
                'id' => $batch->id,
                'batch_code' => $batch->batch_code,
                'name' => $batch->name,
                'description' => $batch->description,
                'breed' => $batch->breed,
                'status' => [
                    'value' => $batch->status->value,
                    'label' => $batch->status->label(),
                    'color' => $batch->status->color(),
                ],
                'initial_count' => $batch->initial_count,
                'current_count' => $batch->current_count,
                'initial_weight' => $batch->initial_weight,
                'current_weight' => $batch->current_weight,
                'mortality_count' => $batch->mortality_count,
                'mortality_rate' => $batch->mortality_rate,
                'cull_count' => $batch->cull_count,
                'total_eggs_produced' => $batch->total_eggs_produced,
                'avg_daily_production' => $batch->avg_daily_production,
                'avg_temperature' => $batch->avg_temperature,
                'avg_humidity' => $batch->avg_humidity,
                'start_date' => $batch->start_date?->format('Y-m-d'),
                'hatch_date' => $batch->hatch_date?->format('Y-m-d'),
                'expected_completion_date' => $batch->expected_completion_date?->format('Y-m-d'),
                'incubator_assigned_at' => $batch->incubator_assigned_at?->format('Y-m-d H:i'),
                'initial_cost' => $batch->initial_cost,
                'feed_cost' => $batch->feed_cost,
                'medication_cost' => $batch->medication_cost,
                'other_costs' => $batch->other_costs,
                'revenue' => $batch->revenue,
                'total_cost' => $batch->total_cost,
                'profit_loss' => $batch->profit_loss,
                'age_days' => $batch->age_days,
                'survival_rate' => $batch->survival_rate,
                'batch_data' => $batch->batch_data,
                'performance_metrics' => $batch->performance_metrics,
                'incubator' => $batch->incubator ? [
                    'id' => $batch->incubator->id,
                    'name' => $batch->incubator->name,
                    'model' => $batch->incubator->model,
                    'status' => [
                        'value' => $batch->incubator->status->value,
                        'label' => $batch->incubator->status->label(),
                    ],
                    'current_temperature' => $batch->incubator->current_temperature,
                    'current_humidity' => $batch->incubator->current_humidity,
                ] : null,
                'manager' => [
                    'id' => $batch->manager->id,
                    'name' => $batch->manager->name,
                    'email' => $batch->manager->email,
                ],
                'events' => $batch->events->map(function ($event) {
                    return [
                        'id' => $event->id,
                        'event_type' => [
                            'value' => $event->event_type->value,
                            'label' => $event->event_type->label(),
                            'color' => $event->event_type->color(),
                        ],
                        'title' => $event->title,
                        'description' => $event->description,
                        'event_date' => $event->event_date->format('Y-m-d'),
                        'event_time' => $event->event_time?->format('H:i'),
                        'duration_minutes' => $event->duration_minutes,
                        'affected_count' => $event->affected_count,
                        'mortality_count' => $event->mortality_count,
                        'feed_type' => $event->feed_type,
                        'feed_amount' => $event->feed_amount,
                        'vaccine_name' => $event->vaccine_name,
                        'user' => [
                            'name' => $event->user->name,
                        ],
                        'event_data' => $event->event_data,
                    ];
                }),
                'schedules' => $batch->schedules->map(function ($schedule) {
                    return [
                        'id' => $schedule->id,
                        'title' => $schedule->title,
                        'description' => $schedule->description,
                        'event_type' => [
                            'value' => $schedule->event_type->value,
                            'label' => $schedule->event_type->label(),
                        ],
                        'status' => [
                            'value' => $schedule->status->value,
                            'label' => $schedule->status->label(),
                        ],
                        'scheduled_date' => $schedule->scheduled_date->format('Y-m-d H:i'),
                        'estimated_duration' => $schedule->estimated_duration,
                        'priority' => $schedule->priority,
                        'is_critical' => $schedule->is_critical,
                        'assigned_user' => $schedule->assignedUser ? [
                            'name' => $schedule->assignedUser->name,
                        ] : null,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Update the specified batch
     */
    public function update(Request $request, Batch $batch)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'current_count' => 'required|integer|min:0',
            'current_weight' => 'nullable|numeric|min:0',
            'mortality_count' => 'nullable|integer|min:0',
            'cull_count' => 'nullable|integer|min:0',
            'feed_cost' => 'nullable|numeric|min:0',
            'medication_cost' => 'nullable|numeric|min:0',
            'other_costs' => 'nullable|numeric|min:0',
            'revenue' => 'nullable|numeric|min:0',
            'avg_daily_production' => 'nullable|numeric|min:0',
        ]);

        // Calculate mortality rate
        if (isset($validated['mortality_count'])) {
            $validated['mortality_rate'] = $batch->initial_count > 0
                ? round(($validated['mortality_count'] / $batch->initial_count) * 100, 2)
                : 0;
        }

        $batch->update($validated);

        return back()->with('success', 'Batch updated successfully!');
    }

    /**
     * Remove the specified batch
     */
    public function destroy(Batch $batch)
    {
        $batch->delete();

        return redirect()->route('batches.index')
            ->with('success', 'Batch deleted successfully!');
    }
}
