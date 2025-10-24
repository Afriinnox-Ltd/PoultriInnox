<?php

namespace App\Modules\BatchIncubator\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\BatchIncubator\Models\Batch;
use App\Modules\BatchIncubator\Models\Incubator;
use App\Modules\BatchIncubator\Enums\BatchStatus;
use App\Modules\BatchIncubator\Enums\EventType;
use App\Models\User;
use App\Services\MqttService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class BatchController extends Controller
{
    protected MqttService $mqttService;

    public function __construct(MqttService $mqttService)
    {
        $this->mqttService = $mqttService;
    }
    /**
     * Display a listing of batches
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $perPage = $request->get('per_page', 15); // Default 15 items per page
        $search = $request->get('search');
        $status = $request->get('status');

        $query = Batch::with(['incubator', 'manager'])
            ->accessibleBy($user); // Apply access control

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('batch_code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('breed', 'like', "%{$search}%");
            });
        }

        // Apply status filter
        if ($status) {
            $query->where('status', $status);
        }

        $batches = $query->latest()
            ->paginate($perPage);

        // Transform the paginated data
        $batches->getCollection()->transform(function ($batch) use ($user) {
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

                // Basic feed statistics
                'total_feed_consumed' => $batch->getTotalFeedConsumed(),
                'average_fcr' => $batch->getAverageFCR(),
                'actual_feed_cost' => $batch->calculateActualFeedCost(),
                'feed_consumption_count' => $batch->feedConsumptions()->count(),

                // User access info
                'can_edit' => $batch->userHasAccess($user) || $user->isAdmin(),
                'is_owner' => $batch->manager_id === $user->id,
            ];
        });

        // Calculate stats only for accessible batches
        $accessibleBatchesQuery = Batch::accessibleBy($user);

        $stats = [
            'total_batches' => $accessibleBatchesQuery->count(),
            'active_batches' => $accessibleBatchesQuery->whereIn('status', [
                BatchStatus::INCUBATING,
                BatchStatus::GROWING,
                BatchStatus::LAYING
            ])->count(),
            'total_birds' => $accessibleBatchesQuery->whereIn('status', [
                BatchStatus::GROWING,
                BatchStatus::LAYING
            ])->sum('current_count'),
            'daily_production' => $accessibleBatchesQuery->where('status', BatchStatus::LAYING)
                ->sum('avg_daily_production'),
        ];

        return Inertia::render('modules/batch-incubator/batches/index', [
            'batches' => $batches,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'per_page' => $perPage,
            ],
            'statuses' => array_map(function ($status) {
                return [
                    'value' => $status->value,
                    'label' => $status->label(),
                ];
            }, BatchStatus::cases()),
        ]);
    }

    /**
     * Show the form for creating a new batch
     */
    public function create()
    {
        $user = Auth::user();

        // Only show incubators that the user has access to
        $incubators = Incubator::whereIn('status', ['idle', 'running'])
            ->accessibleBy($user)
            ->get(['id', 'name', 'capacity', 'current_load', 'status']);

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

        // Check if trying to create a brooding batch in an incubator that already has one
        if ($validated['status'] === BatchStatus::BROODING->value && !empty($validated['incubator_id'])) {
            $existingBroodingBatch = Batch::where('incubator_id', $validated['incubator_id'])
                ->where('status', BatchStatus::BROODING->value)
                ->where('id', '!=', $request->route('batch')) // Exclude current batch if editing
                ->first();

            if ($existingBroodingBatch) {
                return back()
                    ->withInput()
                    ->withErrors([
                        'incubator_id' => 'This incubator already has an active brooding batch (' .
                            $existingBroodingBatch->batch_code . '). Please complete or move the existing batch first.'
                    ]);
            }
        }

        // Generate batch code
        $validated['batch_code'] = 'BTH-' . now()->format('Ymd') . '-' . strtoupper(substr(uniqid(), -4));
        $validated['current_count'] = $validated['initial_count'];
        $validated['current_weight'] = $validated['initial_weight'] ?? null;
        $validated['manager_id'] = Auth::id();

        if ($validated['status'] === BatchStatus::INCUBATING->value && $validated['start_date']) {
            $validated['hatch_date'] = now()->parse($validated['start_date'])->addDays(21);
        }

        $batch = Batch::create($validated);

        // If batch is assigned to an incubator with a device, sync to device
        if ($batch->incubator_id) {
            $this->syncBatchToDevice($batch);
        }

        return redirect()->route('batch-incubator.batches.show', $batch)
            ->with('success', 'Batch created successfully!');
    }

    /**
     * Sync batch data to IoT device via MQTT
     */
    protected function syncBatchToDevice(Batch $batch)
    {
        try {
            $incubator = $batch->incubator;

            // Check if incubator exists
            if (!$incubator) {
                Log::warning('MQTT: Cannot sync batch to device - No incubator assigned', [
                    'batch_id' => $batch->id,
                ]);
                return;
            }

            // Check if incubator has a device serial number
            if (!$incubator->serial_number) {
                Log::warning('MQTT: Cannot sync batch to device - Incubator has no device serial number', [
                    'batch_id' => $batch->id,
                    'incubator_id' => $incubator->id,
                    'incubator_name' => $incubator->name,
                ]);
                return;
            }

            $deviceId = $incubator->serial_number;

            // Check if device is online (has recent sensor data)
            $sensorsData = $incubator->sensors_data ?? [];
            $isOnline = $sensorsData['online'] ?? false;
            $lastUpdate = $sensorsData['last_update'] ?? null;

            if (!$isOnline && $lastUpdate) {
                $lastUpdateTime = \Carbon\Carbon::parse($lastUpdate);
                $minutesSinceUpdate = now()->diffInMinutes($lastUpdateTime);

                if ($minutesSinceUpdate > 5) {
                    Log::warning('MQTT: Device appears offline - Last update was {minutes} minutes ago', [
                        'batch_id' => $batch->id,
                        'device_id' => $deviceId,
                        'minutes' => $minutesSinceUpdate,
                        'last_update' => $lastUpdate,
                    ]);
                    // Continue anyway - device might come online and receive the message
                }
            }

            // Calculate total_days from start_date to expected_completion_date
            $totalDays = 30; // Default
            if ($batch->start_date && $batch->expected_completion_date) {
                $totalDays = $batch->start_date->diffInDays($batch->expected_completion_date);
            }

            // Calculate cycle_day from start_date to now
            $cycleDay = $batch->age_days;

            // Send total_days to device using device-specific topic
            $topic = str_replace('{device_id}', $deviceId, config('mqtt.topics.total_days'));
            $published = $this->mqttService->publish(
                $topic,
                (string) $totalDays
            );

            if ($published) {
                Log::info('MQTT: Successfully synced new batch to device', [
                    'batch_id' => $batch->id,
                    'device_id' => $deviceId,
                    'cycle_day' => $cycleDay,
                    'total_days' => $totalDays,
                    'start_date' => $batch->start_date->toDateString(),
                    'expected_completion_date' => $batch->expected_completion_date ? $batch->expected_completion_date->toDateString() : null,
                    'device_online' => $isOnline,
                ]);
            } else {
                Log::error('MQTT: Failed to publish message to device', [
                    'batch_id' => $batch->id,
                    'device_id' => $deviceId,
                    'topic' => config('mqtt.topics.total_days'),
                ]);
            }

        } catch (\Throwable $e) {
            Log::error('MQTT: Exception while syncing batch to device', [
                'batch_id' => $batch->id,
                'incubator_id' => $batch->incubator_id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    /**
     * Display the specified batch
     */
    public function show(Batch $batch)
    {
        $user = Auth::user();

        // Check if user has access to this batch
        if (!$batch->userHasAccess($user) && !$user->isAdmin()) {
            abort(403, 'You do not have permission to view this batch.');
        }

        $batch->load(['incubator', 'manager', 'events.user', 'schedules.assignedUser', 'feedConsumptions.feedType']);

        // Get comprehensive statistics including feed consumption data
        $comprehensiveStats = $batch->getComprehensiveStats();
        $feedStats = $batch->getFeedConsumptionStats();
        $feedVariance = $batch->getFeedVarianceAnalysis();

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
                        'event_time' => $event->event_time,
                        'duration_minutes' => $event->duration_minutes,
                        'affected_count' => $event->affected_count,
                        'mortality_count' => $event->mortality_count,
                        'feed_type' => $event->feed_type,
                        'feed_amount' => $event->feed_amount,
                        'vaccine_name' => $event->vaccine_name,
                        'medication_name' => $event->medication_name,
                        'dosage' => $event->dosage,
                        'feed_cost' => $event->feed_cost,
                        'medication_cost' => $event->medication_cost,
                        'vaccination_cost' => $event->vaccination_cost,
                        'other_cost' => $event->other_cost,
                        'total_event_cost' => $event->total_event_cost,
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

                // Feed consumption statistics
                'feed_statistics' => $feedStats,
                'feed_variance' => $feedVariance,
                'comprehensive_stats' => $comprehensiveStats,

                // Recent feed consumption records (last 10)
                'recent_feed_consumptions' => $batch->feedConsumptions()
                    ->with(['feedType', 'feedInventory'])
                    ->latest('consumption_date')
                    ->take(10)
                    ->get()
                    ->map(function ($consumption) {
                        return [
                            'id' => $consumption->id,
                            'consumption_date' => $consumption->consumption_date->format('Y-m-d'),
                            'feed_type' => $consumption->feedType->name ?? 'N/A',
                            'planned_amount' => $consumption->planned_amount,
                            'actual_amount' => $consumption->actual_amount,
                            'variance_percentage' => $consumption->variance_percentage,
                            'fcr' => $consumption->fcr,
                            'total_feed_cost' => $consumption->total_feed_cost,
                            'bird_count' => $consumption->bird_count,
                        ];
                    }),

                // User permissions
                'can_edit' => $batch->userHasAccess($user) || $user->isAdmin(),
                'is_owner' => $batch->manager_id === $user->id,
                'can_delete' => ($batch->manager_id === $user->id) || $user->isAdmin(),
            ],
        ]);
    }

    /**
     * Update the specified batch
     */
    public function update(Request $request, Batch $batch)
    {
        $user = Auth::user();

        // Check if user has access to this batch
        if (!$batch->userHasAccess($user) && !$user->isAdmin()) {
            abort(403, 'You do not have permission to update this batch.');
        }

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
            'authorized_users' => 'nullable|array',
            'authorized_users.*' => 'exists:users,id',
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
     * Update brooding start date
     */
    public function updateStartDate(Request $request, Batch $batch)
    {
        $user = Auth::user();

        // Check if user has access to this batch
        if (!$batch->userHasAccess($user) && !$user->isAdmin()) {
            abort(403, 'You do not have permission to update this batch.');
        }

        // Verify this is an active/brooding batch
        if ($batch->status->value !== 'brooding') {
            return back()->withErrors(['error' => 'Only brooding batches can have their start date updated.']);
        }

        $validated = $request->validate([
            'start_date' => 'required|date',
        ]);

        $oldStartDate = $batch->start_date;
        $batch->update([
            'start_date' => $validated['start_date'],
        ]);

        // Mark this as a manual update to prevent device override
        // Use 2 minutes to give device time to receive and process the new total_days
        Cache::put("batch:{$batch->id}:last_start_date_update", now(), 180);

        // Refresh the batch to get updated attributes
        $batch->refresh();

        // Calculate total days based on expected completion date
        $totalDays = 21; // Default
        if ($batch->expected_completion_date) {
            $startDate = \Carbon\Carbon::parse($batch->start_date);
            $completionDate = \Carbon\Carbon::parse($batch->expected_completion_date);
            $totalDays = $startDate->diffInDays($completionDate);
        } elseif ($batch->incubator && isset($batch->incubator->sensors_data['total_days'])) {
            $totalDays = $batch->incubator->sensors_data['total_days'];
            // Update expected completion date based on total_days
            $batch->update([
                'expected_completion_date' => \Carbon\Carbon::parse($validated['start_date'])->addDays($totalDays),
            ]);
        }

        // Sync with IoT device if linked and this is the active batch
        if ($batch->incubator && $batch->incubator->serial_number) {
            // Verify this is the current active batch in the incubator
            $activeBatch = Batch::where('incubator_id', $batch->incubator->id)
                ->where('status', 'brooding')
                ->first();

            if ($activeBatch && $activeBatch->id === $batch->id) {
                try {
                    $deviceId = $batch->incubator->serial_number;

                    // Connect to MQTT broker
                    if (!$this->mqttService->connect()) {
                        Log::warning('Failed to connect to MQTT broker for start date sync');
                    } else {
                        // Send updated total_days to device
                        $published = $this->mqttService->publishControlCommand($deviceId, 'total_days', $totalDays);

                        // Update incubator sensors_data
                        $sensorsData = $batch->incubator->sensors_data ?? [];
                        $sensorsData['total_days'] = $totalDays;
                        $batch->incubator->update(['sensors_data' => $sensorsData]);

                        if ($published) {
                            Log::info('Synced start date to IoT device', [
                                'batch_id' => $batch->id,
                                'device_id' => $deviceId,
                                'new_start_date' => $validated['start_date'],
                                'total_days' => $totalDays,
                                'current_age_days' => $batch->age_days,
                            ]);
                        } else {
                            Log::warning('Failed to publish start date to device', [
                                'batch_id' => $batch->id,
                                'device_id' => $deviceId,
                            ]);
                        }

                        // Disconnect after publishing
                        $this->mqttService->disconnect();
                    }
                } catch (\Throwable $e) {
                    Log::warning('Failed to sync start date to IoT device', [
                        'batch_id' => $batch->id,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                    ]);
                }
            }
        }

        // Log the change as an event
        $batch->events()->create([
            'event_type' => EventType::STATUS_CHANGE,
            'title' => 'Brooding start date updated',
            'description' => "Start date changed from {$oldStartDate?->format('Y-m-d')} to {$batch->start_date->format('Y-m-d')}",
            'event_date' => now(),
            'user_id' => Auth::id(),
            'event_data' => [
                'old_start_date' => $oldStartDate?->format('Y-m-d'),
                'new_start_date' => $batch->start_date->format('Y-m-d'),
                'current_age_days' => $batch->age_days,
            ],
        ]);

        return back()->with('success', 'Brooding start date updated successfully!');
    }

    /**
     * Update total incubation days (which automatically calculates expected completion date)
     */
    public function updateTotalIncubationDays(Request $request, Batch $batch)
    {
        $user = Auth::user();

        // Check if user has access to this batch
        if (!$batch->userHasAccess($user) && !$user->isAdmin()) {
            abort(403, 'You do not have permission to update this batch.');
        }

        // Verify this is an active/brooding batch
        if ($batch->status->value !== 'brooding') {
            return back()->withErrors(['error' => 'Only brooding batches can have their total incubation days updated.']);
        }

        $validated = $request->validate([
            'total_days' => 'required|integer|min:1|max:365',
        ]);

        $oldTotalDays = null;
        if ($batch->incubator && isset($batch->incubator->sensors_data['total_days'])) {
            $oldTotalDays = $batch->incubator->sensors_data['total_days'];
        }

        $totalDays = $validated['total_days'];

        // Calculate new expected completion date based on start date + total days
        $newExpectedDate = \Carbon\Carbon::parse($batch->start_date)->addDays($totalDays);
        $oldDate = $batch->expected_completion_date;

        $batch->update([
            'expected_completion_date' => $newExpectedDate,
        ]);

        // Mark this as a manual update to prevent device override
        // Store both timestamp and expected total_days to verify device received it
        Cache::put("batch:{$batch->id}:last_completion_date_update", now(), 180);
        Cache::put("batch:{$batch->id}:expected_total_days", $totalDays, 180);

        // Refresh the batch to get updated attributes
        $batch->refresh();

        // Sync with IoT device if linked and this is the active batch
        if ($batch->incubator && $batch->incubator->serial_number) {
            // Verify this is the current active batch in the incubator
            $activeBatch = Batch::where('incubator_id', $batch->incubator->id)
                ->where('status', 'brooding')
                ->first();

            if ($activeBatch && $activeBatch->id === $batch->id) {
                try {
                    $deviceId = $batch->incubator->serial_number;

                    // Connect to MQTT broker
                    if (!$this->mqttService->connect()) {
                        Log::warning('Failed to connect to MQTT broker for expected date sync');
                    } else {
                        // Send updated total_days to device
                        $published = $this->mqttService->publishControlCommand($deviceId, 'total_days', $totalDays);

                        // Update incubator sensors_data
                        $sensorsData = $batch->incubator->sensors_data ?? [];
                        $sensorsData['total_days'] = $totalDays;
                        $batch->incubator->update(['sensors_data' => $sensorsData]);

                        if ($published) {
                            Log::info('Synced total incubation days to IoT device', [
                                'batch_id' => $batch->id,
                                'device_id' => $deviceId,
                                'total_days' => $totalDays,
                                'old_total_days' => $oldTotalDays,
                                'new_expected_completion_date' => $newExpectedDate->format('Y-m-d'),
                                'old_expected_completion_date' => $oldDate?->format('Y-m-d'),
                                'current_age_days' => $batch->age_days,
                            ]);
                        } else {
                            Log::warning('Failed to publish expected date to device', [
                                'batch_id' => $batch->id,
                                'device_id' => $deviceId,
                            ]);
                        }

                        // Disconnect after publishing
                        $this->mqttService->disconnect();
                    }
                } catch (\Throwable $e) {
                    Log::warning('Failed to sync expected completion date to IoT device', [
                        'batch_id' => $batch->id,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                    ]);
                }
            }
        }

        // Log the change as an event
        $batch->events()->create([
            'event_type' => EventType::STATUS_CHANGE,
            'title' => 'Total incubation days updated',
            'description' => "Total incubation days changed from {$oldTotalDays} to {$totalDays} days. Expected completion date is now {$batch->expected_completion_date->format('Y-m-d')}",
            'event_date' => now(),
            'user_id' => Auth::id(),
            'event_data' => [
                'old_total_days' => $oldTotalDays,
                'new_total_days' => $totalDays,
                'old_expected_completion_date' => $oldDate?->format('Y-m-d'),
                'new_expected_completion_date' => $batch->expected_completion_date->format('Y-m-d'),
                'days_remaining' => $batch->days_remaining,
            ],
        ]);

        return back()->with('success', 'Total incubation days updated successfully! Expected completion date is now ' . $batch->expected_completion_date->format('M d, Y'));
    }

    /**
     * Update batch status
     */
    public function updateStatus(Request $request, Batch $batch)
    {
        $user = Auth::user();

        // Check if user has access to this batch
        if (!$batch->userHasAccess($user) && !$user->isAdmin()) {
            abort(403, 'You do not have permission to update this batch status.');
        }

        $validated = $request->validate([
            'status' => 'required|in:' . implode(',', array_map(fn($s) => $s->value, BatchStatus::cases())),
        ]);

        // Check if trying to change to brooding status in an incubator that already has a brooding batch
        if ($validated['status'] === BatchStatus::BROODING->value && $batch->incubator_id) {
            $existingBroodingBatch = Batch::where('incubator_id', $batch->incubator_id)
                ->where('status', BatchStatus::BROODING->value)
                ->where('id', '!=', $batch->id)
                ->first();

            if ($existingBroodingBatch) {
                return back()
                    ->withErrors([
                        'status' => 'This incubator already has an active brooding batch (' .
                            $existingBroodingBatch->batch_code . '). Please complete or move the existing batch first.'
                    ]);
            }
        }

        // Update status with any necessary side effects
        $oldStatus = $batch->status;
        $batch->update($validated);

        // Log status change as an event
        if ($oldStatus !== $batch->status) {
            $batch->events()->create([
                'event_type' => EventType::STATUS_CHANGE,
                'title' => "Status changed from {$oldStatus->label()} to {$batch->status->label()}",
                'description' => "Batch status was updated via dashboard",
                'event_date' => now(),
                'user_id' => Auth::id(),
                'event_data' => [
                    'old_status' => $oldStatus->value,
                    'new_status' => $batch->status->value,
                ],
            ]);
        }

        return back()->with('success', 'Batch status updated successfully!');
    }

    /**
     * Add event to batch
     */
    public function addEvent(Request $request, Batch $batch)
    {
        $user = Auth::user();

        // Check if user has access to this batch
        if (!$batch->userHasAccess($user) && !$user->isAdmin()) {
            abort(403, 'You do not have permission to add events to this batch.');
        }

        $validated = $request->validate([
            'event_type' => 'required|string',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'event_date' => 'required|date',
            'affected_count' => 'nullable|integer|min:0',
            'mortality_count' => 'nullable|integer|min:0',
            'feed_amount' => 'nullable|numeric|min:0',
            'feed_cost' => 'nullable|numeric|min:0',
            'medication_cost' => 'nullable|numeric|min:0',
            'vaccination_cost' => 'nullable|numeric|min:0',
            'other_cost' => 'nullable|numeric|min:0',
            'vaccine_name' => 'nullable|string|max:255',
            'medication_name' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $validated['user_id'] = Auth::id();
        $validated['event_time'] = now()->format('H:i:s');
        $validated['batch_id'] = $batch->id;

        // Ensure required fields have default values to prevent constraint violations
        $validated['mortality_count'] = $validated['mortality_count'] ?? 0;
        $validated['affected_count'] = $validated['affected_count'] ?? 0;
        $validated['feed_amount'] = $validated['feed_amount'] ?? 0;
        $validated['is_critical'] = false;
        $validated['requires_followup'] = false;

        // Update batch counts if mortality is recorded
        if ($validated['mortality_count'] > 0) {
            $newCount = max(0, $batch->current_count - $validated['mortality_count']);
            $batch->update([
                'current_count' => $newCount,
                'mortality_count' => $batch->mortality_count + $validated['mortality_count'],
            ]);
        }

        // Update batch costs based on event type
        $batchUpdates = [];

        if (!empty($validated['feed_cost'])) {
            $batchUpdates['feed_cost'] = $batch->feed_cost + $validated['feed_cost'];
        }

        if (!empty($validated['medication_cost'])) {
            $batchUpdates['medication_cost'] = $batch->medication_cost + $validated['medication_cost'];
        }

        if (!empty($validated['vaccination_cost']) || !empty($validated['other_cost'])) {
            $additionalCost = ($validated['vaccination_cost'] ?? 0) + ($validated['other_cost'] ?? 0);
            $batchUpdates['other_costs'] = $batch->other_costs + $additionalCost;
        }

        if (!empty($batchUpdates)) {
            $batch->update($batchUpdates);
        }

        $batch->events()->create($validated);

        return back()->with('success', 'Event recorded successfully! Batch costs have been updated.');
    }

    public function destroy(Batch $batch)
    {
        $user = Auth::user();

        // Check if user has access to delete this batch (only owner or admin)
        if (!$user->isAdmin() && $batch->manager_id !== $user->id) {
            abort(403, 'You do not have permission to delete this batch.');
        }

        // Check if batch has related data that would prevent deletion
        $hasEvents = $batch->events()->count() > 0;
        $hasCurrentCount = $batch->current_count > 0;
        $hasFinancialData = $batch->feed_cost > 0 || $batch->medication_cost > 0 || $batch->other_costs > 0 || $batch->revenue > 0;
        $isNotPlanned = $batch->status->value !== 'planned';

        if ($hasEvents || $hasCurrentCount || $hasFinancialData || $isNotPlanned) {
            $reasons = [];
            if ($hasEvents) $reasons[] = 'has recorded events';
            if ($hasCurrentCount) $reasons[] = 'has current bird count';
            if ($hasFinancialData) $reasons[] = 'has financial data';
            if ($isNotPlanned) $reasons[] = 'is not in planned status';

            $reasonText = implode(', ', $reasons);
            return back()->withErrors([
                'delete' => "Cannot delete batch because it {$reasonText}. Only empty planned batches can be deleted."
            ]);
        }

        $batchName = $batch->name;
        $batch->delete();

        return redirect()->route('batch-incubator.batches.index')
            ->with('success', "Batch '{$batchName}' deleted successfully!");
    }

    /**
     * Update user access for the batch
     */
    public function updateAccess(Request $request, Batch $batch)
    {
        $user = Auth::user();

        // Only owner or admin can modify access
        if (!$user->isAdmin() && $batch->manager_id !== $user->id) {
            abort(403, 'You do not have permission to modify access settings for this batch.');
        }

        $validated = $request->validate([
            'authorized_users' => 'nullable|array',
            'authorized_users.*' => 'integer|exists:users,id',
        ]);

        if (isset($validated['authorized_users'])) {
            // Always include owner in authorized users
            $authorizedUsers = array_unique(array_merge([$batch->manager_id], $validated['authorized_users']));
            $batch->update(['authorized_users' => $authorizedUsers]);
        }

        return back()->with('success', 'Access settings updated successfully!');
    }

    /**
     * Grant access to a user via email
     */
    public function grantAccess(Request $request, Batch $batch)
    {
        $user = Auth::user();

        // Only owner or admin can grant access
        if (!$user->isAdmin() && $batch->manager_id !== $user->id) {
            abort(403, 'You do not have permission to grant access to this batch.');
        }

        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $targetUser = User::where('email', $validated['email'])
            ->where('id', '!=', $batch->manager_id)
            ->first();

        if (!$targetUser) {
            return back()->withErrors(['email' => 'User not found with this email address.']);
        }

        $currentAuthorizedUsers = $batch->authorized_users ?? [];
        if (in_array($targetUser->id, $currentAuthorizedUsers)) {
            return back()->withErrors(['email' => 'User already has access to this batch.']);
        }

        $newAuthorizedUsers = array_unique(array_merge($currentAuthorizedUsers, [$targetUser->id]));
        $batch->update(['authorized_users' => $newAuthorizedUsers]);

        return back()->with('success', "Access granted to {$targetUser->name} ({$targetUser->email}) successfully!");
    }

    /**
     * Revoke access from a user
     */
    public function revokeAccess(Request $request, Batch $batch, User $targetUser)
    {
        $user = Auth::user();

        // Only owner or admin can revoke access
        if (!$user->isAdmin() && $batch->manager_id !== $user->id) {
            abort(403, 'You do not have permission to revoke access from this batch.');
        }

        // Cannot revoke access from owner
        if ($targetUser->id === $batch->manager_id) {
            return back()->withErrors(['error' => 'Cannot revoke access from the batch owner.']);
        }

        $currentAuthorizedUsers = $batch->authorized_users ?? [];
        if (!in_array($targetUser->id, $currentAuthorizedUsers)) {
            return back()->withErrors(['error' => 'User does not have access to this batch.']);
        }

        $newAuthorizedUsers = array_filter($currentAuthorizedUsers, function($userId) use ($targetUser) {
            return $userId !== $targetUser->id;
        });

        $batch->update(['authorized_users' => array_values($newAuthorizedUsers)]);

        return back()->with('success', "Access revoked from {$targetUser->name} ({$targetUser->email}) successfully!");
    }
}
