<?php

namespace App\Http\Controllers\Partner;

use App\Http\Controllers\Controller;
use App\Models\PartnerOrder;
use App\Models\PartnerOrderItem;
use App\Models\PartnerProfile;
use App\Modules\Marketplace\Models\Product;
use App\Notifications\PartnerOrderReceivedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;

class PartnerOrderController extends Controller
{
    private function getOrCreateProfile(): PartnerProfile
    {
        $user = Auth::user();
        return PartnerProfile::firstOrCreate(
            ['user_id' => $user->id],
            ['business_name' => $user->name, 'is_active' => true]
        );
    }

    public function index(Request $request)
    {
        $profile = $this->getOrCreateProfile();

        $query = PartnerOrder::with('items.product')
            ->where('partner_id', $profile->id)
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->paginate(12)->withQueryString();

        return Inertia::render('Partners/Orders/Index', [
            'orders'  => $orders,
            'profile' => $profile,
            'filters' => $request->only('status'),
        ]);
    }

    public function create()
    {
        $products = Product::with(['vendor', 'images'])
            ->where('status', 'active')
            ->select(['id', 'name', 'slug', 'price', 'unit_of_measure', 'vendor_id', 'stock_quantity', 'minimum_order_quantity'])
            ->get();

        return Inertia::render('Partners/Orders/Create', [
            'products' => $products,
            'profile'  => $this->getOrCreateProfile(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'description'             => 'nullable|string|max:2000',
            'delivery_address'        => 'required|string|max:500',
            'requested_delivery_date' => 'nullable|date|after:today',
            'payment_due_date'        => 'nullable|date',
            'payment_reminder_days'   => 'nullable|integer|min:1|max:365',
            'partner_notes'           => 'nullable|string|max:1000',
            'items'                   => 'required|array|min:1',
            'items.*.product_id'      => 'nullable|exists:marketplace_products,id',
            'items.*.product_name'    => 'required|string|max:255',
            'items.*.description'     => 'nullable|string|max:500',
            'items.*.quantity'        => 'required|numeric|min:0.01',
            'items.*.unit'            => 'required|string|max:30',
        ]);

        $profile = $this->getOrCreateProfile();

        DB::transaction(function () use ($validated, $profile) {
            $order = PartnerOrder::create([
                'partner_id'              => $profile->id,
                'description'             => $validated['description'] ?? null,
                'delivery_address'        => $validated['delivery_address'],
                'requested_delivery_date' => $validated['requested_delivery_date'] ?? null,
                'payment_due_date'        => $validated['payment_due_date'] ?? null,
                'payment_reminder_days'   => $validated['payment_reminder_days'] ?? null,
                'partner_notes'           => $validated['partner_notes'] ?? null,
                'status'                  => 'pending',
                'payment_status'          => 'pending',
            ]);

            foreach ($validated['items'] as $item) {
                $order->items()->create([
                    'product_id'   => $item['product_id'] ?? null,
                    'product_name' => $item['product_name'],
                    'description'  => $item['description'] ?? null,
                    'quantity'     => $item['quantity'],
                    'unit'         => $item['unit'],
                ]);
            }

            // Notify all admin users
            $admins = User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                $admin->notify(new PartnerOrderReceivedNotification($order->load('partner', 'items')));
            }
        });

        return redirect()->route('partners.orders.index')
            ->with('success', 'Your order has been submitted. We will review it and get back to you.');
    }

    public function show(PartnerOrder $order)
    {
        $profile = $this->getOrCreateProfile();

        if ($order->partner_id !== $profile->id) {
            abort(403);
        }

        $order->load(['items.product.images', 'items.vendor']);

        return Inertia::render('Partners/Orders/Show', [
            'order'   => $order,
            'profile' => $profile,
        ]);
    }

    public function downloadInvoice(PartnerOrder $order)
    {
        $profile = $this->getOrCreateProfile();

        if ($order->partner_id !== $profile->id) {
            abort(403);
        }

        if ($order->status !== 'delivered') {
            abort(403, 'Invoice is only available for delivered orders.');
        }

        $order->load(['items.vendor', 'partner']);

        $pdf = Pdf::loadView('partner.orders.invoice', ['order' => $order])
            ->setPaper('a4', 'portrait');

        return $pdf->download('invoice-' . $order->order_number . '.pdf');
    }

    public function profileEdit()
    {
        return Inertia::render('Partners/Profile', [
            'profile' => $this->getOrCreateProfile(),
        ]);
    }

    public function profileUpdate(Request $request)
    {
        $validated = $request->validate([
            'business_name' => 'required|string|max:255',
            'partner_type'  => ['required', Rule::in(['hotel', 'restaurant', 'catering', 'other'])],
            'contact_person'=> 'nullable|string|max:255',
            'phone'         => 'nullable|string|max:30',
            'address'       => 'nullable|string|max:500',
            'city'          => 'nullable|string|max:100',
            'country'       => 'nullable|string|max:100',
        ]);

        $profile = $this->getOrCreateProfile();
        $profile->update($validated);

        return back()->with('success', 'Profile updated successfully.');
    }

    public function dashboard()
    {
        $profile = $this->getOrCreateProfile();

        $recent = PartnerOrder::with('items')
            ->where('partner_id', $profile->id)
            ->latest()
            ->take(5)
            ->get();

        $stats = [
            'total'          => PartnerOrder::where('partner_id', $profile->id)->count(),
            'pending'        => PartnerOrder::where('partner_id', $profile->id)->where('status', 'pending')->count(),
            'active'         => PartnerOrder::where('partner_id', $profile->id)->whereIn('status', ['confirmed', 'processing', 'shipped'])->count(),
            'delivered'      => PartnerOrder::where('partner_id', $profile->id)->where('status', 'delivered')->count(),
            'unpaid'         => PartnerOrder::where('partner_id', $profile->id)->where('payment_status', 'pending')->count(),
            'pending_amount' => (float) PartnerOrder::where('partner_id', $profile->id)
                ->whereIn('payment_status', ['pending', 'partial'])
                ->whereNotNull('total_amount')
                ->sum('total_amount'),
            'overdue'        => PartnerOrder::where('partner_id', $profile->id)
                ->whereIn('payment_status', ['pending', 'partial'])
                ->whereNotNull('payment_due_date')
                ->where('payment_due_date', '<', now()->toDateString())
                ->count(),
        ];

        return Inertia::render('Partners/Dashboard', [
            'profile'       => $profile,
            'recentOrders'  => $recent,
            'stats'         => $stats,
        ]);
    }
}
