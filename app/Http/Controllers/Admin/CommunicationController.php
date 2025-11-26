<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\AdminBroadcastMessage;
use App\Models\AdminMessage;
use App\Models\AdminMessageRecipient;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class CommunicationController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'search' => 'nullable|string|max:100',
            'filter_type' => 'nullable|in:all,role,individual',
        ]);

        $query = AdminMessage::with('sender:id,name,email')
            ->withCount('messageRecipients')
            ->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                  ->orWhereHas('sender', fn($s) => $s->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('filter_type')) {
            $query->where('recipient_type', $request->filter_type);
        }

        $messages = $query->paginate(20)->withQueryString();

        $roles = Role::select('id', 'name', 'slug')->orderBy('name')->get();

        $userCount = User::count();

        return Inertia::render('Admin/Communication/Index', [
            'messages' => $messages,
            'roles' => $roles,
            'userCount' => $userCount,
            'filters' => [
                'search' => $request->search ?? '',
                'filter_type' => $request->filter_type ?? '',
            ],
        ]);
    }

    public function show(AdminMessage $adminMessage)
    {
        $adminMessage->load([
            'sender:id,name,email',
            'messageRecipients.user:id,name,email',
        ]);

        return Inertia::render('Admin/Communication/Show', [
            'message' => $adminMessage,
        ]);
    }

    public function getRecipientPreview(Request $request)
    {
        $request->validate([
            'recipient_type' => 'required|in:all,role,individual',
            'recipient_roles' => 'nullable|array',
            'recipient_roles.*' => 'string',
            'recipient_user_ids' => 'nullable|array',
            'recipient_user_ids.*' => 'integer|exists:users,id',
        ]);

        $query = User::select('id', 'name', 'email', 'role');

        switch ($request->recipient_type) {
            case 'all':
                break;
            case 'role':
                $roles = $request->recipient_roles ?? [];
                $this->applyGroupFilter($query, $roles);
                break;
            case 'individual':
                $ids = $request->recipient_user_ids ?? [];
                $query->whereIn('id', $ids);
                break;
        }

        $total = (clone $query)->count();
        $users = $query->limit(50)->get();

        return response()->json([
            'users' => $users,
            'total' => $total,
        ]);
    }

    public function searchUsers(Request $request)
    {
        $request->validate([
            'search' => 'required|string|min:2|max:100',
        ]);

        $users = User::select('id', 'name', 'email', 'role')
            ->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('email', 'like', '%' . $request->search . '%');
            })
            ->limit(20)
            ->get();

        return response()->json($users);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'recipient_type' => 'required|in:all,role,individual',
            'recipient_roles' => 'required_if:recipient_type,role|nullable|array|min:1',
            'recipient_roles.*' => 'string',
            'recipient_user_ids' => 'required_if:recipient_type,individual|nullable|array|min:1',
            'recipient_user_ids.*' => 'integer|exists:users,id',
            'send_email' => 'boolean',
        ]);

        // Resolve recipients
        $recipientQuery = User::select('id', 'name', 'email');

        switch ($validated['recipient_type']) {
            case 'all':
                break;
            case 'role':
                $roles = $validated['recipient_roles'] ?? [];
                $this->applyGroupFilter($recipientQuery, $roles);
                break;
            case 'individual':
                $ids = $validated['recipient_user_ids'] ?? [];
                $recipientQuery->whereIn('id', $ids);
                break;
        }

        $recipients = $recipientQuery->get();

        if ($recipients->isEmpty()) {
            return back()->withErrors(['recipient_type' => 'No recipients found for the selected criteria.']);
        }

        $adminMessage = AdminMessage::create([
            'sender_id' => auth()->id(),
            'subject' => $validated['subject'],
            'body' => $validated['body'],
            'recipient_type' => $validated['recipient_type'],
            'recipient_roles' => $validated['recipient_roles'] ?? null,
            'recipient_user_ids' => $validated['recipient_user_ids'] ?? null,
            'total_recipients' => $recipients->count(),
            'sent_at' => now(),
        ]);

        // Record each recipient
        $recipientRows = $recipients->map(fn($user) => [
            'admin_message_id' => $adminMessage->id,
            'user_id' => $user->id,
            'email_sent' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ])->toArray();

        AdminMessageRecipient::insert($recipientRows);

        // Send emails if requested
        if ($request->boolean('send_email', true)) {
            foreach ($recipients as $user) {
                try {
                    Mail::to($user->email)->send(new AdminBroadcastMessage($adminMessage, $user));

                    AdminMessageRecipient::where('admin_message_id', $adminMessage->id)
                        ->where('user_id', $user->id)
                        ->update(['email_sent' => true, 'email_sent_at' => now()]);
                } catch (\Exception $e) {
                    // Log but continue sending to others
                    \Log::error('Failed to queue admin message email', [
                        'message_id' => $adminMessage->id,
                        'user_id' => $user->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        }

        return redirect()->route('admin.communication.index')
            ->with('success', "Message sent to {$recipients->count()} recipient(s) successfully.");
    }

    private function applyGroupFilter($query, array $groups): void
    {
        $specialSlugs = [
            'verified-vendors', 'unverified-vendors', 'non-vendor-users',
            'all-partners', 'active-partners', 'verified-partners',
        ];
        $realRoles = array_values(array_filter($groups, fn($r) => !in_array($r, $specialSlugs)));
        $specialGroups = array_values(array_filter($groups, fn($r) => in_array($r, $specialSlugs)));

        $query->where(function ($q) use ($realRoles, $specialGroups) {
            if (!empty($realRoles)) {
                $q->whereIn('role', $realRoles);
            }
            foreach ($specialGroups as $group) {
                switch ($group) {
                    case 'verified-vendors':
                        $q->orWhereHas('vendor', fn($v) => $v->where('is_verified', true));
                        break;
                    case 'unverified-vendors':
                        $q->orWhereHas('vendor', fn($v) => $v->where('is_verified', false));
                        break;
                    case 'non-vendor-users':
                        $q->orWhereDoesntHave('vendor');
                        break;
                    case 'all-partners':
                        $q->orWhereHas('partnerProfile');
                        break;
                    case 'active-partners':
                        $q->orWhereHas('partnerProfile', fn($p) => $p->where('is_active', true));
                        break;
                    case 'verified-partners':
                        $q->orWhereHas('partnerProfile', fn($p) => $p->where('is_verified', true));
                        break;
                }
            }
        });
    }

    public function destroy(AdminMessage $adminMessage)
    {
        $adminMessage->delete();

        return back()->with('success', 'Message deleted successfully.');
    }
}
