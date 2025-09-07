<?php

namespace App\Modules\BatchIncubator\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\BatchIncubator\Models\MedicationProtocol;
use App\Modules\BatchIncubator\Models\VaccinationProtocol;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProtocolManagementController extends Controller
{
    /**
     * Display admin protocol management dashboard
     */
    public function index()
    {
        // Check if user is admin
        if (!Auth::user()->is_admin) {
            abort(403, 'Admin access required.');
        }

        $medicationProtocols = MedicationProtocol::with('createdBy')
            ->latest()
            ->paginate(15);

        $vaccinationProtocols = VaccinationProtocol::with('createdBy')
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/ProtocolManagement', [
            'medication_protocols' => $medicationProtocols,
            'vaccination_protocols' => $vaccinationProtocols,
        ]);
    }

    /**
     * Show form for creating new medication protocol
     */
    public function createMedication()
    {
        if (!Auth::user()->is_admin) {
            abort(403, 'Admin access required.');
        }

        return Inertia::render('Admin/CreateMedicationProtocol');
    }

    /**
     * Store new medication protocol
     */
    public function storeMedication(Request $request)
    {
        if (!Auth::user()->is_admin) {
            abort(403, 'Admin access required.');
        }

        $validated = $request->validate([
            'medication_name' => 'required|string|max:255',
            'medication_type' => 'required|string|in:antibiotic,vitamin,vaccine,supplement,probiotic,other',
            'active_ingredient' => 'required|string|max:255',
            'manufacturer' => 'nullable|string|max:255',
            'application_method' => 'required|string|in:water,feed,injection,spray,oral',
            'target_bird_types' => 'required|array',
            'target_bird_types.*' => 'string|in:chicken,duck,turkey,goose,quail',
            'age_range_min' => 'required|integer|min:0',
            'age_range_max' => 'required|integer|gt:age_range_min',
            'dosage_per_kg' => 'required|numeric|min:0',
            'dosage_unit' => 'required|string|in:mg,ml,g,tablets,drops',
            'treatment_duration_days' => 'required|integer|min:1|max:30',
            'withdrawal_period_days' => 'required|integer|min:0|max:60',
            'cost_per_unit' => 'nullable|numeric|min:0',
            'target_conditions' => 'required|array',
            'target_conditions.*' => 'string',
            'contraindications' => 'nullable|array',
            'contraindications.*' => 'string',
            'side_effects' => 'nullable|array',
            'side_effects.*' => 'string',
            'storage_requirements' => 'nullable|string|max:500',
            'is_prescription_required' => 'boolean',
            'is_emergency_protocol' => 'boolean',
            'auto_recommend' => 'boolean',
            'effectiveness_rate' => 'nullable|numeric|min:0|max:100',
            'notes' => 'nullable|string|max:1000',
        ]);

        $protocol = MedicationProtocol::create([
            ...$validated,
            'target_bird_types' => json_encode($validated['target_bird_types']),
            'target_conditions' => json_encode($validated['target_conditions']),
            'contraindications' => json_encode($validated['contraindications'] ?? []),
            'side_effects' => json_encode($validated['side_effects'] ?? []),
            'created_by' => Auth::id(),
            'status' => 'active',
        ]);

        return redirect()->route('admin.protocols.index')
            ->with('success', 'Medication protocol created successfully.');
    }

    /**
     * Show form for creating new vaccination protocol
     */
    public function createVaccination()
    {
        if (!Auth::user()->is_admin) {
            abort(403, 'Admin access required.');
        }

        return Inertia::render('Admin/CreateVaccinationProtocol');
    }

    /**
     * Store new vaccination protocol
     */
    public function storeVaccination(Request $request)
    {
        if (!Auth::user()->is_admin) {
            abort(403, 'Admin access required.');
        }

        $validated = $request->validate([
            'vaccine_name' => 'required|string|max:255',
            'prevents_disease' => 'required|string|max:255',
            'manufacturer' => 'nullable|string|max:255',
            'vaccine_type' => 'required|string|in:live,killed,recombinant,subunit',
            'administration_method' => 'required|string|in:subcutaneous,intramuscular,drinking_water,spray,eye_drop,oral',
            'target_bird_types' => 'required|array',
            'target_bird_types.*' => 'string|in:chicken,duck,turkey,goose,quail',
            'age_range_min' => 'required|integer|min:0',
            'age_range_max' => 'required|integer|gt:age_range_min',
            'doses_per_bird' => 'required|numeric|min:0.1',
            'dose_unit' => 'required|string|in:ml,doses,drops',
            'vaccination_schedule' => 'required|array',
            'vaccination_schedule.*.age_days' => 'required|integer|min:0',
            'vaccination_schedule.*.description' => 'required|string',
            'requires_booster' => 'boolean',
            'booster_interval_days' => 'nullable|integer|min:1',
            'immunity_duration_months' => 'nullable|integer|min:1|max:60',
            'cost_per_dose' => 'nullable|numeric|min:0',
            'storage_temperature_min' => 'required|numeric',
            'storage_temperature_max' => 'required|numeric|gt:storage_temperature_min',
            'contraindications' => 'nullable|array',
            'contraindications.*' => 'string',
            'side_effects' => 'nullable|array',
            'side_effects.*' => 'string',
            'is_mandatory' => 'boolean',
            'auto_recommend' => 'boolean',
            'priority_level' => 'required|string|in:low,medium,high,critical',
            'effectiveness_rate' => 'nullable|numeric|min:0|max:100',
            'notes' => 'nullable|string|max:1000',
        ]);

        $protocol = VaccinationProtocol::create([
            ...$validated,
            'target_bird_types' => json_encode($validated['target_bird_types']),
            'vaccination_schedule' => json_encode($validated['vaccination_schedule']),
            'contraindications' => json_encode($validated['contraindications'] ?? []),
            'side_effects' => json_encode($validated['side_effects'] ?? []),
            'created_by' => Auth::id(),
            'status' => 'active',
        ]);

        return redirect()->route('admin.protocols.index')
            ->with('success', 'Vaccination protocol created successfully.');
    }

    /**
     * Show medication protocol details
     */
    public function showMedication(MedicationProtocol $protocol)
    {
        if (!Auth::user()->is_admin) {
            abort(403, 'Admin access required.');
        }

        return Inertia::render('Admin/ShowMedicationProtocol', [
            'protocol' => $protocol->load('createdBy'),
            'usage_stats' => $this->getMedicationUsageStats($protocol),
        ]);
    }

    /**
     * Show vaccination protocol details
     */
    public function showVaccination(VaccinationProtocol $protocol)
    {
        if (!Auth::user()->is_admin) {
            abort(403, 'Admin access required.');
        }

        return Inertia::render('Admin/ShowVaccinationProtocol', [
            'protocol' => $protocol->load('createdBy'),
            'usage_stats' => $this->getVaccinationUsageStats($protocol),
        ]);
    }

    /**
     * Show form for editing medication protocol
     */
    public function editMedication(MedicationProtocol $protocol)
    {
        if (!Auth::user()->is_admin) {
            abort(403, 'Admin access required.');
        }

        return Inertia::render('Admin/EditMedicationProtocol', [
            'protocol' => $protocol,
        ]);
    }

    /**
     * Update medication protocol
     */
    public function updateMedication(Request $request, MedicationProtocol $protocol)
    {
        if (!Auth::user()->is_admin) {
            abort(403, 'Admin access required.');
        }

        $validated = $request->validate([
            'medication_name' => 'required|string|max:255',
            'medication_type' => 'required|string|in:antibiotic,vitamin,vaccine,supplement,probiotic,other',
            'active_ingredient' => 'required|string|max:255',
            'manufacturer' => 'nullable|string|max:255',
            'application_method' => 'required|string|in:water,feed,injection,spray,oral',
            'target_bird_types' => 'required|array',
            'target_bird_types.*' => 'string|in:chicken,duck,turkey,goose,quail',
            'age_range_min' => 'required|integer|min:0',
            'age_range_max' => 'required|integer|gt:age_range_min',
            'dosage_per_kg' => 'required|numeric|min:0',
            'dosage_unit' => 'required|string|in:mg,ml,g,tablets,drops',
            'treatment_duration_days' => 'required|integer|min:1|max:30',
            'withdrawal_period_days' => 'required|integer|min:0|max:60',
            'cost_per_unit' => 'nullable|numeric|min:0',
            'target_conditions' => 'required|array',
            'target_conditions.*' => 'string',
            'contraindications' => 'nullable|array',
            'contraindications.*' => 'string',
            'side_effects' => 'nullable|array',
            'side_effects.*' => 'string',
            'storage_requirements' => 'nullable|string|max:500',
            'is_prescription_required' => 'boolean',
            'is_emergency_protocol' => 'boolean',
            'auto_recommend' => 'boolean',
            'effectiveness_rate' => 'nullable|numeric|min:0|max:100',
            'status' => 'required|string|in:active,inactive,pending_review',
            'notes' => 'nullable|string|max:1000',
        ]);

        $protocol->update([
            ...$validated,
            'target_bird_types' => json_encode($validated['target_bird_types']),
            'target_conditions' => json_encode($validated['target_conditions']),
            'contraindications' => json_encode($validated['contraindications'] ?? []),
            'side_effects' => json_encode($validated['side_effects'] ?? []),
            'updated_by' => Auth::id(),
        ]);

        return redirect()->route('admin.protocols.medication.show', $protocol)
            ->with('success', 'Medication protocol updated successfully.');
    }

    /**
     * Update vaccination protocol
     */
    public function updateVaccination(Request $request, VaccinationProtocol $protocol)
    {
        if (!Auth::user()->is_admin) {
            abort(403, 'Admin access required.');
        }

        $validated = $request->validate([
            'vaccine_name' => 'required|string|max:255',
            'prevents_disease' => 'required|string|max:255',
            'manufacturer' => 'nullable|string|max:255',
            'vaccine_type' => 'required|string|in:live,killed,recombinant,subunit',
            'administration_method' => 'required|string|in:subcutaneous,intramuscular,drinking_water,spray,eye_drop,oral',
            'target_bird_types' => 'required|array',
            'target_bird_types.*' => 'string|in:chicken,duck,turkey,goose,quail',
            'age_range_min' => 'required|integer|min:0',
            'age_range_max' => 'required|integer|gt:age_range_min',
            'doses_per_bird' => 'required|numeric|min:0.1',
            'dose_unit' => 'required|string|in:ml,doses,drops',
            'vaccination_schedule' => 'required|array',
            'vaccination_schedule.*.age_days' => 'required|integer|min:0',
            'vaccination_schedule.*.description' => 'required|string',
            'requires_booster' => 'boolean',
            'booster_interval_days' => 'nullable|integer|min:1',
            'immunity_duration_months' => 'nullable|integer|min:1|max:60',
            'cost_per_dose' => 'nullable|numeric|min:0',
            'storage_temperature_min' => 'required|numeric',
            'storage_temperature_max' => 'required|numeric|gt:storage_temperature_min',
            'contraindications' => 'nullable|array',
            'contraindications.*' => 'string',
            'side_effects' => 'nullable|array',
            'side_effects.*' => 'string',
            'is_mandatory' => 'boolean',
            'auto_recommend' => 'boolean',
            'priority_level' => 'required|string|in:low,medium,high,critical',
            'effectiveness_rate' => 'nullable|numeric|min:0|max:100',
            'status' => 'required|string|in:active,inactive,pending_review',
            'notes' => 'nullable|string|max:1000',
        ]);

        $protocol->update([
            ...$validated,
            'target_bird_types' => json_encode($validated['target_bird_types']),
            'vaccination_schedule' => json_encode($validated['vaccination_schedule']),
            'contraindications' => json_encode($validated['contraindications'] ?? []),
            'side_effects' => json_encode($validated['side_effects'] ?? []),
            'updated_by' => Auth::id(),
        ]);

        return redirect()->route('admin.protocols.vaccination.show', $protocol)
            ->with('success', 'Vaccination protocol updated successfully.');
    }

    /**
     * Delete medication protocol
     */
    public function destroyMedication(MedicationProtocol $protocol)
    {
        if (!Auth::user()->is_admin) {
            abort(403, 'Admin access required.');
        }

        // Check if protocol is in use
        if ($protocol->appliedMedications()->exists()) {
            return redirect()->back()
                ->with('error', 'Cannot delete protocol that has been applied to batches.');
        }

        $protocol->delete();

        return redirect()->route('admin.protocols.index')
            ->with('success', 'Medication protocol deleted successfully.');
    }

    /**
     * Delete vaccination protocol
     */
    public function destroyVaccination(VaccinationProtocol $protocol)
    {
        if (!Auth::user()->is_admin) {
            abort(403, 'Admin access required.');
        }

        // Check if protocol is in use
        if ($protocol->appliedVaccinations()->exists()) {
            return redirect()->back()
                ->with('error', 'Cannot delete protocol that has been applied to batches.');
        }

        $protocol->delete();

        return redirect()->route('admin.protocols.index')
            ->with('success', 'Vaccination protocol deleted successfully.');
    }

    /**
     * Get medication usage statistics
     */
    private function getMedicationUsageStats(MedicationProtocol $protocol): array
    {
        $applications = $protocol->appliedMedications()->with('batch');
        
        return [
            'total_applications' => $applications->count(),
            'total_birds_treated' => $applications->sum('bird_count_at_application'),
            'average_effectiveness' => $applications->avg('effectiveness_rating'),
            'total_cost' => $applications->sum('cost'),
            'recent_applications' => $applications->latest()->take(5)->get(),
        ];
    }

    /**
     * Get vaccination usage statistics
     */
    private function getVaccinationUsageStats(VaccinationProtocol $protocol): array
    {
        $applications = $protocol->appliedVaccinations()->with('batch');
        
        return [
            'total_applications' => $applications->count(),
            'total_birds_vaccinated' => $applications->sum('bird_count_at_vaccination'),
            'average_effectiveness' => $applications->avg('effectiveness_rating'),
            'total_cost' => $applications->sum('cost'),
            'recent_applications' => $applications->latest()->take(5)->get(),
        ];
    }

    /**
     * Toggle protocol status
     */
    public function toggleStatus(Request $request)
    {
        if (!Auth::user()->is_admin) {
            abort(403, 'Admin access required.');
        }

        $request->validate([
            'type' => 'required|in:medication,vaccination',
            'id' => 'required|integer',
            'status' => 'required|in:active,inactive',
        ]);

        if ($request->type === 'medication') {
            $protocol = MedicationProtocol::findOrFail($request->id);
        } else {
            $protocol = VaccinationProtocol::findOrFail($request->id);
        }

        $protocol->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Protocol status updated successfully.',
        ]);
    }
}
