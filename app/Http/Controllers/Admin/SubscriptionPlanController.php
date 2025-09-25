<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan as ModelsSubscriptionPlan;
use App\Modules\Marketplace\Models\SubscriptionPlan;
use Illuminate\Http\Request;

class SubscriptionPlanController extends Controller
{
    public function index()
    {
        $plans = ModelsSubscriptionPlan::latest()->get();
        return view('admin.plans.index', compact('plans'));
    }

    public function create()
    {
        return view('admin.plans.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'billing_cycle' => 'required|in:monthly,yearly',
            'duration_days' => 'nullable|integer|min:1',
            'allow_cod' => 'boolean',
            'features' => 'nullable|array',
        ]);

        ModelsSubscriptionPlan::create($validated);
        return redirect()->route('admin.plans.index')->with('success', 'Plan created successfully!');
    }

    // Add edit(), update(), destroy() as needed
}
