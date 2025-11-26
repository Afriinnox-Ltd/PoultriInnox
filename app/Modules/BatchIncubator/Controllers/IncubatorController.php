<?php

namespace App\Modules\BatchIncubator\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\BatchIncubator\Models\Incubator;
use App\Modules\BatchIncubator\Models\Batch;
use App\Modules\BatchIncubator\Enums\IncubatorStatus;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class IncubatorController extends Controller
{
    /**
     * Display a listing of incubators
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $perPage = $request->get('per_page', 15); // Default 15 items per page
        $search = $request->get('search');
        $status = $request->get('status');

        $query = Incubator::with(['currentBatches', 'owner'])
            ->accessibleBy($user); // Apply access control

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('model', 'like', "%{$search}%")
                  ->orWhere('serial_number', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        // Apply status filter
        if ($status) {
            $query->where('status', $status);
        }

        $incubators = $query->latest()
            ->paginate($perPage);

        // Transform the paginated data
        $incubators->getCollection()->transform(function ($incubator) use ($user) {
            // Determine device online status based on last sensor update
            $sensorsData = $incubator->sensors_data ?? [];
            $lastUpdate = $sensorsData['last_update'] ?? null;
            $isDeviceOnline = false;

            if ($lastUpdate) {
                $lastUpdateTime = \Carbon\Carbon::parse($lastUpdate);
                $minutesSinceUpdate = now()->diffInMinutes($lastUpdateTime);
                $isDeviceOnline = $minutesSinceUpdate < 5; // Online if updated within 5 minutes
            }

            // Update incubator status to reflect actual device state
            $actualStatus = $incubator->status;
            if ($incubator->serial_number && !$isDeviceOnline) {
                // Device should be online but isn't - mark as offline/maintenance
                $actualStatus = IncubatorStatus::OFFLINE;
            }

            return [
                'id' => $incubator->id,
                'name' => $incubator->name,
                'model' => $incubator->model,
                'serial_number' => $incubator->serial_number,
                'status' => [
                    'value' => $actualStatus->value,
                    'label' => $actualStatus->label(),
                    'color' => $actualStatus->color(),
                ],
                'device_online' => $isDeviceOnline,
                'last_update' => $lastUpdate ? \Carbon\Carbon::parse($lastUpdate)->diffForHumans() : null,
                'capacity' => $incubator->capacity,
                'current_load' => $incubator->current_load,
                'utilization_rate' => $incubator->getUtilizationPercentage(),
                'target_temperature' => $incubator->target_temperature,
                'target_humidity' => $incubator->target_humidity,
                'current_temperature' => $incubator->current_temperature,
                'current_humidity' => $incubator->current_humidity,
                'location' => $incubator->location,
                'last_maintenance' => $incubator->last_maintenance?->format('Y-m-d'),
                'next_maintenance' => $incubator->next_maintenance?->format('Y-m-d'),
                'maintenance_due' => $incubator->isMaintenanceDue(),
                'current_batches' => $incubator->currentBatches->map(function ($batch) {
                    return [
                        'id' => $batch->id,
                        'batch_code' => $batch->batch_code,
                        'name' => $batch->name,
                        'status' => $batch->status->label(),
                        'created_at' => $batch?->created_at?->format('Y-m-d'),
                        'current_count' => $batch->current_count,
                    ];
                }),
                'owner' => [
                    'name' => $incubator->owner->name,
                ],
                // User access info
                'can_edit' => $incubator->userHasAccess($user) || $user->isAdmin(),
                'is_owner' => $incubator->owner_id== $user->id,
            ];
        });

        // Calculate stats only for accessible incubators
        $accessibleIncubators = Incubator::accessibleBy($user)->get();

        $stats = [
            'total_incubators' => $accessibleIncubators->count(),
            'running_incubators' => $accessibleIncubators->where('status', IncubatorStatus::RUNNING)->count(),
            'idle_incubators' => $accessibleIncubators->where('status', IncubatorStatus::IDLE)->count(),
            'maintenance_due' => $accessibleIncubators->filter(function ($incubator) {
                return $incubator->next_maintenance && $incubator->next_maintenance <= now()->addDays(7);
            })->count(),
            'total_capacity' => $accessibleIncubators->sum('capacity'),
            'current_utilization' => $accessibleIncubators->sum('current_load'),
        ];

        return Inertia::render('modules/batch-incubator/incubators/index', [
            'incubators' => $incubators,
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
            }, IncubatorStatus::cases()),
        ]);
    }

    /**
     * Show the form for creating a new incubator
     */
    public function create()
    {
        return Inertia::render('modules/batch-incubator/incubators/create', [
            'statuses' => array_map(function ($status) {
                return [
                    'value' => $status->value,
                    'label' => $status->label(),
                ];
            }, IncubatorStatus::cases()),
        ]);
    }

    /**
     * Store a newly created incubator
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'serial_number' => 'required|string|max:255|unique:incubators,serial_number',
            'description' => 'nullable|string',
            'capacity' => 'required|integer|min:1',
            'current_load' => 'nullable|integer|min:0',
            'target_temperature' => 'nullable|numeric|between:30,45',
            'target_humidity' => 'nullable|numeric|between:0,100',
            'current_temperature' => 'nullable|numeric|between:0,50',
            'current_humidity' => 'nullable|numeric|between:0,100',
            'location' => 'nullable|string|max:255',
            ]);

        $validated['current_load'] = $validated['current_load'] ?? 0;
        $validated['owner_id'] = Auth::id();
        $validated['authorized_users'] = [Auth::id()];

        // Set comprehensive default settings
        $validated['settings'] = [
            'auto_turn' => true,
            'turn_interval' => 2,
            'alarm_enabled' => true,
            'backup_power' => true,
            'temp_alert_threshold' => 1.0,
            'humidity_alert_threshold' => 3.0,
            'rfid_enabled' => false,
            'auto_lock' => false,
            'lock_timeout' => 10,
            'data_logging' => true,
            'logging_interval' => 5,
            'email_alerts' => false,
            'sms_alerts' => false,
            'remote_monitoring' => false,
            'auto_temp_control' => true,
            'auto_humidity_control' => true,
            'emergency_shutdown' => true,
            'ventilation_cycle' => 30,
            'calibration_interval' => 30,
        ];

        // Initialize sensor data
        $validated['sensors_data'] = [
            'last_reading' => now()->toISOString(),
        ];

        $validated['access_control'] = [
            'keypad_code' => str_pad(random_int(1000, 9999), 4, '0', STR_PAD_LEFT),
            'rfid_enabled' => false,
        ];

        $incubator = Incubator::create($validated);

        return redirect()->route('batch-incubator.incubators.index')
            ->with('success', 'Incubator created successfully!');
    }

    /**
     * Display the specified incubator
     */
    public function show(Incubator $incubator)
    {
        $user = Auth::user();

        // Check if user has access to this incubator
        if (!$incubator->userHasAccess($user) && !$user->isAdmin()) {
            abort(403, 'You do not have permission to view this incubator.');
        }

        $incubator->load(['currentBatches.manager', 'owner']);

        // Get all users for access management (only if user is owner)
        $availableUsers = [];
        if ($incubator->owner_id== Auth::id()) {
            $availableUsers = User::select('id', 'name', 'email')
                ->where('id', '!=', $incubator->owner_id)
                ->orderBy('name')
                ->get();
        }

        return Inertia::render('modules/batch-incubator/incubators/show', [
            'incubator' => [
                'id' => $incubator->id,
                'name' => $incubator->name,
                'model' => $incubator->model,
                'serial_number' => $incubator->serial_number,
                'description' => $incubator->description,
                'status' => [
                    'value' => $incubator->status->value,
                    'label' => $incubator->status->label(),
                    'color' => $incubator->status->color(),
                ],
                'capacity' => $incubator->capacity,
                'current_load' => $incubator->current_load,
                'utilization_rate' => $incubator->getUtilizationPercentage(),
                'target_temperature' => $incubator->target_temperature,
                'target_humidity' => $incubator->target_humidity,
                'current_temperature' => $incubator->current_temperature,
                'current_humidity' => $incubator->current_humidity,
                'location' => $incubator->location,
                'settings' => $incubator->settings,
                'sensors_data' => $incubator->sensors_data,
                'access_control' => $incubator->access_control,
                'last_maintenance' => $incubator->last_maintenance?->format('Y-m-d'),
                'next_maintenance' => $incubator->next_maintenance?->format('Y-m-d'),
                'maintenance_notes' => $incubator->maintenance_notes,
                'maintenance_due' => $incubator->isMaintenanceDue(),
                'current_batches' => $incubator->currentBatches->map(function ($batch) {
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
                        'start_date' => $batch->start_date?->format('Y-m-d'),
                        'hatch_date' => $batch->hatch_date?->format('Y-m-d'),
                        'created_at' => $batch->created_at->toISOString(),
                        'age_days' => $batch->age_days,
                        'manager' => [
                            'name' => $batch->manager->name,
                        ],
                    ];
                }),
                'authorized_users' => $incubator->authorized_users,
                'authorized_users_details' => User::select('id', 'name', 'email')
                    ->whereIn('id', $incubator->authorized_users ?? [])
                    ->get(),
                'owner' => [
                    'id' => $incubator->owner->id,
                    'name' => $incubator->owner->name,
                ],
                // User permissions
                'can_edit' => $incubator->userHasAccess($user) || $user->isAdmin(),
                'is_owner' => $incubator->owner_id== $user->id,
                'can_manage_access' => $incubator->owner_id== $user->id || $user->isAdmin(),
            ],
            'availableUsers' => $availableUsers,
        ]);
    }

    /**
     * Update user access for the incubator
     */
    public function updateAccess(Request $request, Incubator $incubator)
    {
        $validated = $request->validate([
            'authorized_users' => 'nullable|array',
            'authorized_users.*' => 'integer|exists:users,id',
            'access_control' => 'nullable|array',
            'access_control.keypad_code' => 'nullable|string|size:4',
            'access_control.rfid_enabled' => 'nullable|boolean',
        ]);


        try {

            // Only owner can modify access
            if ($incubator->owner_id != Auth::id()) {
                return back()->withErrors(['error' => 'Only the owner can modify access settings.']);
            }

            // Debug logging
            Log::info('UpdateAccess called', [
                'incubator_id' => $incubator->id,
                'current_authorized_users' => $incubator->authorized_users,
                'incoming_authorized_users' => $validated['authorized_users'] ?? null,
                'owner_id' => $incubator->owner_id,
            ]);

            $updateData = [];

            if (isset($validated['authorized_users'])) {
                // Always include owner in authorized users
                $authorizedUsers = array_unique(array_merge([$incubator->owner_id], $validated['authorized_users']));
                $updateData['authorized_users'] = $authorizedUsers;

                Log::info('Final authorized users', ['authorized_users' => $authorizedUsers]);
            }

            if (isset($validated['access_control'])) {
                $updateData['access_control'] = array_merge($incubator->access_control ?? [], $validated['access_control']);
            }

            if (!empty($updateData)) {
                $incubator->update($updateData);
            }

            return back()->with('success', 'Access settings updated successfully!');
        } catch (\Throwable $th) {
            return back()->withErrors(['error' => 'Failed to update access settings. Please try again.']);
        }
    }

    /**
     * Search for a user by email for access management
     */
    public function searchUser(Request $request, Incubator $incubator)
    {

        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        if ($incubator->owner_id != Auth::id()) {
            return back()->withErrors(['error' => 'Only the owner can search for users.']);
        }

        $user = User::select('id', 'name', 'email')
            ->where('email', $validated['email'])
            ->where('id', '!=', $incubator->owner_id)
            ->first();

        if ($user) {
            return back()->with([
                'searchUser' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
                'success' => 'User found successfully!'
            ]);
        } else {
            return back()->withErrors(['email' => 'User not found with this email address.']);
        }
    }

    /**
     * Search for a user by email and automatically grant access
     */
    public function searchAndGrantAccess(Request $request, Incubator $incubator)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        // Only owner can add users
        if ($incubator->owner_id != Auth::id()) {
            return back()->withErrors(['error' => 'Only the owner can add users.']);
        }

        $user = User::select('id', 'name', 'email')
            ->where('email', $validated['email'])
            ->where('id', '!=', $incubator->owner_id)
            ->first();

        if (!$user) {
            return back()->withErrors(['email' => 'User not found with this email address.']);
        }

        // Check if user is already authorized
        $currentAuthorizedUsers = $incubator->authorized_users ?? [];
        if (in_array($user->id, $currentAuthorizedUsers)) {
            return back()->withErrors(['email' => 'User already has access to this incubator.']);
        }

        try {
            // Add user to authorized users
            $newAuthorizedUsers = array_unique(array_merge($currentAuthorizedUsers, [$user->id]));

            Log::info('Adding user to incubator access', [
                'incubator_id' => $incubator->id,
                'user_id' => $user->id,
                'user_email' => $user->email,
                'previous_users' => $currentAuthorizedUsers,
                'new_users' => $newAuthorizedUsers,
            ]);

            $incubator->update([
                'authorized_users' => $newAuthorizedUsers
            ]);

            return back()->with([
                'success' => "Access granted to {$user->name} ({$user->email}) successfully!"
            ]);

        } catch (\Throwable $th) {
            Log::error('Failed to grant access', [
                'error' => $th->getMessage(),
                'incubator_id' => $incubator->id,
                'user_id' => $user->id,
            ]);

            return back()->withErrors(['error' => 'Failed to grant access. Please try again.']);
        }
    }

    /**
     * Revoke access for a specific user
     */
    public function revokeAccess(Request $request, Incubator $incubator, User $user)
    {
        // Only owner can revoke access
        if ($incubator->owner_id != Auth::id()) {
            return back()->withErrors(['error' => 'Only the owner can revoke access.']);
        }

        // Cannot revoke access from owner
        if ($user->id== $incubator->owner_id) {
            return back()->withErrors(['error' => 'Cannot revoke access from the owner.']);
        }

        $currentAuthorizedUsers = $incubator->authorized_users ?? [];

        // Check if user actually has access
        if (!in_array($user->id, $currentAuthorizedUsers)) {
            return back()->withErrors(['error' => 'User does not have access to this incubator.']);
        }

        try {
            // Remove user from authorized users
            $newAuthorizedUsers = array_filter($currentAuthorizedUsers, function($userId) use ($user) {
                return $userId != $user->id;
            });

            Log::info('Revoking user access from incubator', [
                'incubator_id' => $incubator->id,
                'user_id' => $user->id,
                'user_email' => $user->email,
                'previous_users' => $currentAuthorizedUsers,
                'new_users' => array_values($newAuthorizedUsers),
            ]);

            $incubator->update([
                'authorized_users' => array_values($newAuthorizedUsers)
            ]);

            return back()->with([
                'success' => "Access revoked from {$user->name} ({$user->email}) successfully!"
            ]);

        } catch (\Throwable $th) {
            Log::error('Failed to revoke access', [
                'error' => $th->getMessage(),
                'incubator_id' => $incubator->id,
                'user_id' => $user->id,
            ]);

            return back()->withErrors(['error' => 'Failed to revoke access. Please try again.']);
        }
    }

    /**
     * Update the specified incubator
     */
    public function update(Request $request, Incubator $incubator)
    {
        $user = Auth::user();

        // Check if user has access to this incubator
        if (!$incubator->userHasAccess($user) && !$user->isAdmin()) {
            abort(403, 'You do not have permission to update this incubator.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'current_load' => 'required|integer|min:0|max:' . $incubator->capacity,
            'target_temperature' => 'nullable|numeric|between:30,45',
            'target_humidity' => 'nullable|numeric|between:0,100',
            'current_temperature' => 'nullable|numeric|between:0,50',
            'current_humidity' => 'nullable|numeric|between:0,100',
            'location' => 'nullable|string|max:255',
            'maintenance_notes' => 'nullable|string',
            'settings' => 'nullable|array',
            'settings.auto_turn' => 'nullable|boolean',
            'settings.turn_interval' => 'nullable|integer|min:1|max:24',
            'settings.alarm_enabled' => 'nullable|boolean',
            'settings.backup_power' => 'nullable|boolean',
            'settings.temp_alert_threshold' => 'nullable|numeric|min:0.1|max:5',
            'settings.humidity_alert_threshold' => 'nullable|numeric|min:1|max:10',
            'settings.rfid_enabled' => 'nullable|boolean',
            'settings.auto_lock' => 'nullable|boolean',
            'settings.lock_timeout' => 'nullable|integer|min:1|max:60',
            'settings.data_logging' => 'nullable|boolean',
            'settings.logging_interval' => 'nullable|integer|min:1|max:60',
            'settings.email_alerts' => 'nullable|boolean',
            'settings.sms_alerts' => 'nullable|boolean',
            'settings.remote_monitoring' => 'nullable|boolean',
            'settings.auto_temp_control' => 'nullable|boolean',
            'settings.auto_humidity_control' => 'nullable|boolean',
            'settings.emergency_shutdown' => 'nullable|boolean',
            'settings.ventilation_cycle' => 'nullable|integer|min:5|max:120',
            'settings.calibration_interval' => 'nullable|integer|min:1|max:365',
        ]);

        // Merge existing settings with new ones
        if (isset($validated['settings'])) {
            $validated['settings'] = array_merge($incubator->settings ?? [], $validated['settings']);
        }

        $incubator->update($validated);

        return back()->with('success', 'Incubator updated successfully!');
    }

    /**
     * Update incubator status
     */
    public function updateStatus(Request $request, Incubator $incubator)
    {
        $user = Auth::user();

        // Check if user has access to this incubator
        if (!$incubator->userHasAccess($user) && !$user->isAdmin()) {
            abort(403, 'You do not have permission to update this incubator status.');
        }

        $validated = $request->validate([
            'status' => 'required|in:' . implode(',', array_map(fn($s) => $s->value, IncubatorStatus::cases())),
        ]);

        $incubator->update($validated);

        return back()->with('success', 'Incubator status updated successfully!');
    }

    /**
     * Record maintenance
     */
    public function recordMaintenance(Request $request, Incubator $incubator)
    {
        $user = Auth::user();

        // Check if user has access to this incubator
        if (!$incubator->userHasAccess($user) && !$user->isAdmin()) {
            abort(403, 'You do not have permission to record maintenance for this incubator.');
        }

        $validated = $request->validate([
            'maintenance_notes' => 'required|string',
            'next_maintenance_days' => 'required|integer|min:1|max:365',
        ]);

        $incubator->update([
            'last_maintenance' => now(),
            'next_maintenance' => now()->addDays($validated['next_maintenance_days']),
            'maintenance_notes' => $validated['maintenance_notes'],
        ]);

        return back()->with('success', 'Maintenance recorded successfully!');
    }

    /**
     * Remove the specified incubator
     */
    public function destroy(Incubator $incubator)
    {
        $user = Auth::user();

        // Check if user has access to delete this incubator (only owner or admin)
        if (!$user->isAdmin() && $incubator->owner_id != $user->id) {
            abort(403, 'You do not have permission to delete this incubator.');
        }

        if ($incubator->currentBatches()->exists()) {
            return back()->withErrors(['error' => 'Cannot delete incubator with active batches.']);
        }

        $incubator->delete();

        return redirect()->route('batch-incubator.incubators.index')
            ->with('success', 'Incubator deleted successfully!');
    }
}
