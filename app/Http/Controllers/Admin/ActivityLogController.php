<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = ActivityLog::with('user:id,name,email,role')
            ->latest('created_at');

        // Filters
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('entity_type')) {
            $query->where('entity_type', 'like', '%' . $request->entity_type . '%');
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('entity_name', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $logs = $query->paginate(50)->withQueryString();

        // Get unique actions and entity types for filter dropdowns
        $actions = ActivityLog::distinct()->pluck('action')->sort()->values();
        $entityTypes = ActivityLog::distinct()
            ->whereNotNull('entity_type')
            ->pluck('entity_type')
            ->map(fn($type) => class_basename($type))
            ->unique()
            ->sort()
            ->values();

        $users = User::select('id', 'name', 'email')
            ->whereIn('id', ActivityLog::distinct()->whereNotNull('user_id')->pluck('user_id'))
            ->orderBy('name')
            ->get();

        // Stats
        $stats = [
            'total' => ActivityLog::count(),
            'today' => ActivityLog::whereDate('created_at', today())->count(),
            'this_week' => ActivityLog::where('created_at', '>=', now()->startOfWeek())->count(),
            'unique_users' => ActivityLog::distinct()->whereNotNull('user_id')->count('user_id'),
        ];

        return Inertia::render('Admin/ActivityLogs/Index', [
            'logs' => $logs,
            'filters' => $request->only(['user_id', 'action', 'entity_type', 'search', 'date_from', 'date_to']),
            'actions' => $actions,
            'entityTypes' => $entityTypes,
            'users' => $users,
            'stats' => $stats,
        ]);
    }

    public function show(ActivityLog $activityLog)
    {
        $activityLog->load('user:id,name,email,role');

        return Inertia::render('Admin/ActivityLogs/Show', [
            'log' => $activityLog,
        ]);
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'older_than_days' => 'required|integer|min:30',
        ]);

        $date = now()->subDays($request->older_than_days);
        $count = ActivityLog::where('created_at', '<', $date)->delete();

        return redirect()->back()->with('success', "Deleted {$count} activity logs older than {$request->older_than_days} days.");
    }
}
