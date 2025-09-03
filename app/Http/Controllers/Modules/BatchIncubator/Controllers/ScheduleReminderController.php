<?php

namespace App\Http\Controllers\Modules\BatchIncubator\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\BatchIncubator\Models\ScheduleReminder;
use App\Modules\BatchIncubator\Models\BatchSchedule;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Carbon\Carbon;

class ScheduleReminderController extends Controller
{
    /**
     * Display a listing of reminders for a specific schedule.
     */
    public function index(Request $request, $scheduleId)
    {
        $schedule = BatchSchedule::findOrFail($scheduleId);

        $reminders = ScheduleReminder::with('user')
            ->where('schedule_id', $scheduleId)
            ->orderBy('reminder_time', 'asc')
            ->get();

        if ($request->wantsJson()) {
            return response()->json($reminders);
        }

        return Inertia::render('ScheduleReminders', [
            'reminders' => $reminders,
            'schedule' => $schedule,
        ]);
    }

    /**
     * Store a newly created reminder.
     */
    public function store(Request $request, $scheduleId)
    {
        $schedule = BatchSchedule::findOrFail($scheduleId);

        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'reminder_type' => 'required|in:before_due,custom',
            'minutes_before' => 'required_if:reminder_type,before_due|integer|min:1',
            'custom_reminder_time' => 'required_if:reminder_type,custom|date|after:now',
            'notification_method' => 'required|in:email,database,both',
            'custom_message' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->with('error', 'Validation failed');
        }

        $user = User::findOrFail($request->user_id);

        // Calculate reminder time
        $reminderTime = null;
        if ($request->reminder_type === 'before_due') {
            if (!$schedule->scheduled_date) {
                return back()->with('error', 'Schedule must have a scheduled date for before_due reminders');
            }
            $reminderTime = Carbon::parse($schedule->scheduled_date)->subMinutes($request->minutes_before);
        } else {
            $reminderTime = Carbon::parse($request->custom_reminder_time);
        }

        // Check if reminder time is in the past
        if ($reminderTime->isPast()) {
            return back()->with('error', 'Reminder time cannot be in the past');
        }

        $reminder = ScheduleReminder::create([
            'schedule_id' => $scheduleId,
            'user_id' => $request->user_id,
            'reminder_type' => $request->reminder_type,
            'minutes_before' => $request->reminder_type === 'before_due' ? $request->minutes_before : null,
            'reminder_time' => $reminderTime,
            'notification_method' => $request->notification_method,
            'status' => 'pending',
            'custom_message' => $request->custom_message,
        ]);

        $reminders = ScheduleReminder::with('user')
            ->where('schedule_id', $scheduleId)
            ->orderBy('reminder_time', 'asc')
            ->get();

        return back()->with([
            'reminders' => $reminders,
            'message' => 'Reminder created successfully',
        ]);
    }

    /**
     * Cancel a reminder.
     */
    public function cancel(Request $request, $scheduleId, $reminderId)
    {
        $reminder = ScheduleReminder::where('schedule_id', $scheduleId)
            ->where('id', $reminderId)
            ->firstOrFail();

        if ($reminder->status !== 'pending') {
            return back()->with('error', 'Only pending reminders can be cancelled');
        }

        $reminder->update(['status' => 'cancelled']);

        $reminders = ScheduleReminder::with('user')
            ->where('schedule_id', $scheduleId)
            ->orderBy('reminder_time', 'asc')
            ->get();

        return back()->with([
            'reminders' => $reminders,
            'message' => 'Reminder cancelled successfully',
        ]);
    }

    /**
     * Remove a reminder.
     */
    public function destroy(Request $request, $scheduleId, $reminderId)
    {
        $reminder = ScheduleReminder::where('schedule_id', $scheduleId)
            ->where('id', $reminderId)
            ->firstOrFail();

        if ($reminder->status === 'sent') {
            return back()->with('error', 'Cannot delete reminders that have already been sent');
        }

        $reminder->delete();

        $reminders = ScheduleReminder::with('user')
            ->where('schedule_id', $scheduleId)
            ->orderBy('reminder_time', 'asc')
            ->get();

        return back()->with([
            'reminders' => $reminders,
            'message' => 'Reminder deleted successfully',
        ]);
    }
}
