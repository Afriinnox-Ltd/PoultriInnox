<?php

namespace App\Modules\BatchIncubator\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\BatchIncubator\Models\BatchSchedule;
use App\Modules\BatchIncubator\Models\Batch;
use App\Modules\BatchIncubator\Models\Incubator;
use App\Modules\BatchIncubator\Models\ScheduleReminder;
use App\Modules\BatchIncubator\Enums\ScheduleStatus;
use App\Modules\BatchIncubator\Enums\EventType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    /**
     * Display a listing of schedules
     */
    public function index(Request $request)
    {
        $query = BatchSchedule::with(['batch', 'incubator', 'assignedTo', 'createdBy'])
            ->orderBy('scheduled_date', 'asc');

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by batch
        if ($request->has('batch_id') && $request->batch_id) {
            $query->where('batch_id', $request->batch_id);
        }

        // Filter by date range
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('scheduled_date', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('scheduled_date', '<=', $request->date_to);
        }

        // Filter by event type
        if ($request->has('event_type') && $request->event_type !== 'all') {
            $query->where('event_type', $request->event_type);
        }

        $schedules = $query->paginate(15)->withQueryString();

        // Get filter options
        $batches = Batch::select('id', 'name')->orderBy('name')->get();
        $statuses = collect(ScheduleStatus::cases())->map(fn($status) => [
            'value' => $status->value,
            'label' => $status->label()
        ]);
        $eventTypes = collect(EventType::cases())->map(fn($type) => [
            'value' => $type->value,
            'label' => $type->label()
        ]);

        // Get dashboard stats
        $stats = [
            'total' => BatchSchedule::count(),
            'pending' => BatchSchedule::where('status', ScheduleStatus::PENDING)->count(),
            'overdue' => BatchSchedule::overdue()->count(),
            'today' => BatchSchedule::today()->count(),
            'critical' => BatchSchedule::critical()->where('status', ScheduleStatus::PENDING)->count(),
        ];

        return Inertia::render('modules/batch-incubator/schedules/index', [
            'schedules' => $schedules,
            'batches' => $batches,
            'statuses' => $statuses,
            'eventTypes' => $eventTypes,
            'stats' => $stats,
            'filters' => $request->only(['status', 'batch_id', 'date_from', 'date_to', 'event_type'])
        ]);
    }

    /**
     * Show the form for creating a new schedule
     */
    public function create()
    {
        $batches = Batch::with('incubator')
            ->select('id', 'name', 'batch_code', 'breed', 'incubator_id', 'status')
            ->orderBy('name')
            ->get();

        $incubators = Incubator::select('id', 'name', 'status')
            ->orderBy('name')
            ->get();

        $users = \App\Models\User::select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        $eventTypes = collect(EventType::cases())->map(fn($type) => [
            'value' => $type->value,
            'label' => $type->label()
        ]);

        return Inertia::render('modules/batch-incubator/schedules/create', [
            'batches' => $batches,
            'incubators' => $incubators,
            'users' => $users,
            'eventTypes' => $eventTypes,
        ]);
    }

    /**
     * Store a newly created schedule
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'event_type' => 'required|in:' . implode(',', EventType::values()),
            'batch_id' => 'required|exists:batches,id',
            'assigned_to' => 'nullable|exists:users,id',
            'scheduled_date' => 'required|date',
            'scheduled_time' => 'nullable|date_format:H:i',
            'estimated_duration' => 'nullable|integer|min:1',
            'is_recurring' => 'boolean',
            'recurrence_pattern' => 'nullable|in:daily,weekly,monthly',
            'recurrence_end_date' => 'nullable|date|after:scheduled_date',
            'priority' => 'integer|between:1,5',
            'is_critical' => 'boolean',
            'send_reminder' => 'boolean',
            'reminder_minutes_before' => 'nullable|integer|min:5',
            'required_quantity' => 'nullable|numeric|min:0',
            'required_unit' => 'nullable|string|max:50',
            'requirements' => 'nullable|array',
            'checklist' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);

        $validated['created_by'] = Auth::id();
        $validated['status'] = ScheduleStatus::PENDING;

        // Set batch's incubator if not specified
        $batch = Batch::find($validated['batch_id']);
        if ($batch->incubator_id) {
            $validated['incubator_id'] = $batch->incubator_id;
        }

        // Set recurrence config if recurring
        if ($validated['is_recurring'] && $validated['recurrence_pattern']) {
            $validated['recurrence_config'] = ['frequency' => 1];
        }

        $schedule = BatchSchedule::create($validated);

        return redirect()->route('batch-incubator.schedules.index')
            ->with('success', 'Schedule created successfully!');
    }

    /**
     * Display the specified schedule
     */
    public function show(BatchSchedule $schedule)
    {
        $schedule->load(['batch', 'incubator', 'assignedTo', 'createdBy', 'verifiedBy', 'completedEvent']);

        $users = \App\Models\User::select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return Inertia::render('modules/batch-incubator/schedules/show', [
            'schedule' => $schedule,
            'users' => $users,
        ]);
    }

    /**
     * Show the form for editing the specified schedule
     */
    public function edit(BatchSchedule $schedule)
    {
        $batches = Batch::with('incubator')
            ->select('id', 'name', 'batch_code', 'breed', 'incubator_id', 'status')
            ->orderBy('name')
            ->get();

        $incubators = Incubator::select('id', 'name', 'status')
            ->orderBy('name')
            ->get();

        $users = \App\Models\User::select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        $eventTypes = collect(EventType::cases())->map(fn($type) => [
            'value' => $type->value,
            'label' => $type->label()
        ]);

        return Inertia::render('modules/batch-incubator/schedules/edit', [
            'schedule' => [
                ...$schedule->toArray(),
                'event_type' => $schedule->event_type->value,
                'status' => $schedule->status->value,
            ],
            'batches' => $batches,
            'incubators' => $incubators,
            'users' => $users,
            'eventTypes' => $eventTypes,
        ]);
    }

    /**
     * Update the specified schedule
     */
    public function update(Request $request, BatchSchedule $schedule)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'event_type' => 'required|in:' . implode(',', EventType::values()),
            'batch_id' => 'required|exists:batches,id',
            'assigned_to' => 'nullable|exists:users,id',
            'scheduled_date' => 'required|date',
            'scheduled_time' => 'nullable|date_format:H:i',
            'estimated_duration' => 'nullable|integer|min:1',
            'priority' => 'integer|between:1,5',
            'is_critical' => 'boolean',
            'send_reminder' => 'boolean',
            'reminder_minutes_before' => 'nullable|integer|min:5',
            'required_quantity' => 'nullable|numeric|min:0',
            'required_unit' => 'nullable|string|max:50',
            'requirements' => 'nullable|array',
            'checklist' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);

        $schedule->update($validated);

        return redirect()->route('batch-incubator.schedules.show', $schedule)
            ->with('success', 'Schedule updated successfully!');
    }

    /**
     * Remove the specified schedule
     */
    public function destroy(BatchSchedule $schedule)
    {
        // Only allow deletion if not started
        if ($schedule->status->isActive() && $schedule->status !== ScheduleStatus::PENDING) {
            return back()->withErrors(['delete' => 'Cannot delete a schedule that is in progress or completed.']);
        }

        $scheduleName = $schedule->title;
        $schedule->delete();

        return redirect()->route('batch-incubator.schedules.index')
            ->with('success', "Schedule '{$scheduleName}' deleted successfully!");
    }

    /**
     * Start a schedule
     */
    public function start(BatchSchedule $schedule)
    {
        if ($schedule->status !== ScheduleStatus::PENDING) {
            return back()->withErrors(['status' => 'Can only start pending schedules.']);
        }

        $schedule->start(Auth::user());

        return back()->with('success', 'Schedule started successfully!');
    }

    /**
     * Complete a schedule
     */
    public function complete(Request $request, BatchSchedule $schedule)
    {
        $validated = $request->validate([
            'completion_notes' => 'nullable|string',
            'results' => 'nullable|array',
            'actual_quantity' => 'nullable|numeric|min:0',
        ]);

        if (!in_array($schedule->status, [ScheduleStatus::PENDING, ScheduleStatus::IN_PROGRESS])) {
            return back()->withErrors(['status' => 'Can only complete pending or in-progress schedules.']);
        }

        $results = $validated['results'] ?? [];
        if (isset($validated['actual_quantity'])) {
            $results['actual_quantity'] = $validated['actual_quantity'];
        }

        $event = $schedule->complete($results, $validated['completion_notes']);

        return back()->with('success', 'Schedule completed and event recorded successfully!');
    }

    /**
     * Postpone a schedule
     */
    public function postpone(Request $request, BatchSchedule $schedule)
    {
        $validated = $request->validate([
            'new_date' => 'required|date|after:now',
            'reason' => 'required|string|max:255',
        ]);

        if ($schedule->status !== ScheduleStatus::PENDING) {
            return back()->withErrors(['status' => 'Can only postpone pending schedules.']);
        }

        $schedule->postpone(Carbon::parse($validated['new_date']), $validated['reason']);

        return back()->with('success', 'Schedule postponed successfully!');
    }

    /**
     * Cancel a schedule
     */
    public function cancel(Request $request, BatchSchedule $schedule)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:255',
        ]);

        if ($schedule->status->isCompleted()) {
            return back()->withErrors(['status' => 'Cannot cancel completed schedules.']);
        }

        $schedule->cancel($validated['reason']);

        return back()->with('success', 'Schedule cancelled successfully!');
    }

    /**
     * Get schedules for calendar view
     */
    public function calendar(Request $request)
    {
        $startDate = $request->get('start', now()->startOfMonth());
        $endDate = $request->get('end', now()->endOfMonth());

        $schedules = BatchSchedule::with(['batch', 'assignedTo'])
            ->whereBetween('scheduled_date', [$startDate, $endDate])
            ->get()
            ->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'title' => $schedule->title,
                    'start' => $schedule->scheduled_date->format('Y-m-d'),
                    'end' => $schedule->scheduled_date->format('Y-m-d'),
                    'color' => $schedule->status->color(),
                    'extendedProps' => [
                        'batch_name' => $schedule->batch->name,
                        'status' => $schedule->status->label(),
                        'event_type' => $schedule->event_type->label(),
                        'is_critical' => $schedule->is_critical,
                        'assigned_to' => $schedule->assignedTo?->name,
                    ]
                ];
            });

        return response()->json($schedules);
    }

    /**
     * Get reminders for a schedule
     */
    public function reminders(BatchSchedule $schedule)
    {
        $reminders = $schedule->reminders()
            ->with('user')
            ->orderBy('reminder_time')
            ->get()
            ->map(function ($reminder) {
                return [
                    'id' => $reminder->id,
                    'reminder_type' => $reminder->reminder_type,
                    'minutes_before' => $reminder->minutes_before,
                    'reminder_time' => $reminder->reminder_time->toISOString(),
                    'notification_method' => $reminder->notification_method,
                    'status' => $reminder->status,
                    'custom_message' => $reminder->custom_message,
                    'user' => [
                        'id' => $reminder->user->id,
                        'name' => $reminder->user->name,
                        'email' => $reminder->user->email,
                    ],
                    'sent_at' => $reminder->sent_at?->toISOString(),
                    'error_message' => $reminder->error_message,
                ];
            });

        return response()->json($reminders);
    }

    /**
     * Store a new reminder for a schedule
     */
    public function storeReminder(Request $request, BatchSchedule $schedule)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'reminder_type' => 'required|in:before_due,custom',
            'minutes_before' => 'required_if:reminder_type,before_due|integer|min:1|max:10080', // Max 7 days
            'custom_reminder_time' => 'required_if:reminder_type,custom|date|after:now',
            'notification_method' => 'required|in:email,database,both',
            'custom_message' => 'nullable|string|max:500',
        ]);

        try {
            $user = \App\Models\User::findOrFail($validated['user_id']);

            if ($validated['reminder_type'] === 'before_due') {
                $reminder = ScheduleReminder::createForSchedule(
                    $schedule,
                    $user,
                    $validated['minutes_before'],
                    $validated['notification_method']
                );
            } else {
                $reminder = ScheduleReminder::createCustomReminder(
                    $schedule,
                    $user,
                    Carbon::parse($validated['custom_reminder_time']),
                    $validated['custom_message'] ?? null,
                    $validated['notification_method']
                );
            }

            if ($validated['custom_message']) {
                $reminder->update(['custom_message' => $validated['custom_message']]);
            }

            return response()->json([
                'message' => 'Reminder created successfully',
                'reminder' => $reminder->load('user'),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create reminder',
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Update a reminder
     */
    public function updateReminder(Request $request, BatchSchedule $schedule, $reminderId)
    {
        $reminder = ScheduleReminder::where('id', $reminderId)
            ->where('schedule_id', $schedule->id)
            ->firstOrFail();

        if ($reminder->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending reminders can be updated',
            ], 422);
        }

        $validated = $request->validate([
            'notification_method' => 'sometimes|in:email,database,both',
            'custom_message' => 'nullable|string|max:500',
        ]);

        $reminder->update($validated);

        return response()->json([
            'message' => 'Reminder updated successfully',
            'reminder' => $reminder->load('user'),
        ]);
    }

    /**
     * Delete a reminder
     */
    public function deleteReminder(BatchSchedule $schedule, $reminderId)
    {
        $reminder = ScheduleReminder::where('id', $reminderId)
            ->where('schedule_id', $schedule->id)
            ->firstOrFail();

        if ($reminder->status === 'sent') {
            return response()->json([
                'message' => 'Cannot delete sent reminders',
            ], 422);
        }

        $reminder->delete();

        return response()->json([
            'message' => 'Reminder deleted successfully',
        ]);
    }

    /**
     * Cancel a reminder
     */
    public function cancelReminder(BatchSchedule $schedule, $reminderId)
    {
        $reminder = ScheduleReminder::where('id', $reminderId)
            ->where('schedule_id', $schedule->id)
            ->firstOrFail();

        if ($reminder->status === 'sent') {
            return response()->json([
                'message' => 'Cannot cancel sent reminders',
            ], 422);
        }

        $reminder->cancel();

        return response()->json([
            'message' => 'Reminder cancelled successfully',
            'reminder' => $reminder->load('user'),
        ]);
    }
}
