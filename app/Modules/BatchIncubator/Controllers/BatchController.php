<?php

namespace App\Modules\BatchIncubator\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\BatchIncubator\Models\Batch;
use App\Modules\BatchIncubator\Models\Incubator;
use App\Modules\BatchIncubator\Enums\BatchStatus;
use App\Modules\BatchIncubator\Enums\EventType;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BatchController extends Controller
{
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
