<?php

namespace App\Modules\BatchIncubator\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\BatchIncubator\Models\MedicationProtocol;
use App\Modules\BatchIncubator\Models\VaccinationProtocol;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProtocolManagementController extends Controller
{
    /**
     * Show protocol management dashboard
     */
    public function index()
    {
        $medications = MedicationProtocol::with('creator')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        $vaccinations = VaccinationProtocol::with('creator')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Admin/SmartScheduling/Index', [
            'medications' => $medications,
            'vaccinations' => $vaccinations,
        ]);
    }

    /**
     * Show create medication protocol form
     */
    public function createMedication()
    {
        return Inertia::render('Admin/SmartScheduling/CreateMedicationProtocol');
    }

    /**
     * Store medication protocol
     */
    public function storeMedication(Request $request)
    {
        $request->validate([
            'medication_name' => 'required|string|max:255',
            'medication_type' => 'required|string|in:antibiotic,vitamin,supplement,vaccine,dewormer,other',
            'target_disease' => 'nullable|string|max:255',
            'target_breeds' => 'nullable|array',
            'age_range_start' => 'required|integer|min:0',
            'age_range_end' => 'required|integer|min:0',
            'dosage_per_kg' => 'required|numeric|min:0',
            'dosage_unit' => 'required|string|max:50',
            'application_method' => 'required|string|in:oral,injection,water,feed,topical',
            'treatment_duration_days' => 'required|integer|min:1',
            'withdrawal_period_days' => 'required|integer|min:0',
            'cost_per_unit' => 'nullable|numeric|min:0',
            'manufacturer' => 'nullable|string|max:255',
            'is_emergency_protocol' => 'boolean',
            'auto_recommend' => 'boolean',
            'description' => 'nullable|string',
            'instructions' => 'nullable|string',
        ]);

        $protocol = MedicationProtocol::create([
            'name' => $request->medication_name, // Use medication_name as the protocol name
            'medication_name' => $request->medication_name,
            'medication_type' => $request->medication_type,
            'description' => $request->description,
            'target_breeds' => $request->target_breeds ?? [],
            'min_age_days' => $request->age_range_start,
            'max_age_days' => $request->age_range_end,
            'active_ingredient' => $request->medication_name, // Default to medication name
            'dosage_per_kg_body_weight' => $request->dosage_per_kg,
            'dosage_unit' => $request->dosage_unit,
            'administration_method' => $request->application_method,
            'treatment_duration_days' => $request->treatment_duration_days,
            'withdrawal_period_days' => $request->withdrawal_period_days,
            'cost_per_unit' => $request->cost_per_unit,
            'supplier' => $request->manufacturer,
            'application_schedule' => [
                'schedule_type' => 'age_based',
                'applications' => [
                    [
                        'age_days' => $request->age_range_start,
                        'purpose' => 'treatment',
                        'dosage_modifier' => 1.0
                    ]
                ]
            ],
            'is_emergency_protocol' => $request->boolean('is_emergency_protocol'),
            'auto_recommend' => $request->boolean('auto_recommend'),
            'created_by' => Auth::id(),
            'status' => 'active',
        ]);

        return redirect()->route('admin.smart-scheduling.index')
            ->with('success', 'Medication protocol created successfully.');
    }

    /**
     * Show create vaccination protocol form
     */
    public function createVaccination()
    {
        return Inertia::render('Admin/SmartScheduling/CreateVaccinationProtocol');
    }

    /**
     * Store vaccination protocol
     */
    public function storeVaccination(Request $request)
    {
        $request->validate([
            'vaccine_name' => 'required|string|max:255',
            'prevents_disease' => 'required|string|max:255',
            'target_breeds' => 'nullable|array',
            'recommended_age_days' => 'required|integer|min:0',
            'administration_method' => 'required|string|in:subcutaneous,intramuscular,intranasal,oral,eye_drop,drinking_water',
            'dosage_amount' => 'required|numeric|min:0',
            'dosage_unit' => 'required|string|max:50',
            'booster_required' => 'boolean',
            'booster_interval_days' => 'nullable|integer|min:1',
            'storage_temperature_min' => 'nullable|integer',
            'storage_temperature_max' => 'nullable|integer',
            'cost_per_dose' => 'nullable|numeric|min:0',
            'manufacturer' => 'nullable|string|max:255',
            'is_mandatory' => 'boolean',
            'auto_recommend' => 'boolean',
            'priority_level' => 'required|string|in:low,medium,high,critical',
            'description' => 'nullable|string',
            'instructions' => 'nullable|string',
        ]);

        $protocol = VaccinationProtocol::create([
            'name' => $request->vaccine_name, // Use vaccine_name as the protocol name
            'vaccine_name' => $request->vaccine_name,
            'vaccine_type' => 'live', // Default type, can be updated later
            'description' => $request->description,
            'target_breeds' => $request->target_breeds ?? [],
            'min_age_days' => $request->recommended_age_days,
            'max_age_days' => $request->recommended_age_days + 365, // Default max age
            'prevents_disease' => $request->prevents_disease,
            'priority_level' => $request->priority_level,
            'is_mandatory' => $request->boolean('is_mandatory'),
            'dosage_per_bird' => $request->dosage_amount,
            'dosage_unit' => $request->dosage_unit,
            'administration_method' => $request->administration_method,
            'vaccination_schedule' => [
                'schedule_type' => 'age_based',
                'vaccinations' => [
                    [
                        'age_days' => $request->recommended_age_days,
                        'is_primary' => true,
                        'description' => 'Primary vaccination'
                    ]
                ]
            ],
            'requires_booster' => $request->boolean('booster_required'),
            'booster_interval_days' => $request->booster_interval_days,
            'storage_requirements' => json_encode([
                'min_temp' => $request->storage_temperature_min,
                'max_temp' => $request->storage_temperature_max
            ]),
            'preparation_instructions' => $request->instructions,
            'cost_per_dose' => $request->cost_per_dose,
            'manufacturer' => $request->manufacturer,
            'auto_recommend' => $request->boolean('auto_recommend'),
            'created_by' => Auth::id(),
            'status' => 'active',
        ]);

        return redirect()->route('admin.smart-scheduling.index')
            ->with('success', 'Vaccination protocol created successfully.');
    }

    /**
     * Show edit medication protocol form
     */
    public function editMedication(MedicationProtocol $medication)
    {
        return Inertia::render('Admin/SmartScheduling/EditMedicationProtocol', [
            'protocol' => $medication,
        ]);
    }

    /**
     * Update medication protocol
     */
    public function updateMedication(Request $request, MedicationProtocol $medication)
    {
        $request->validate([
            'medication_name' => 'required|string|max:255',
            'medication_type' => 'required|string|in:antibiotic,vitamin,supplement,vaccine,dewormer,other',
            'target_disease' => 'nullable|string|max:255',
            'target_breeds' => 'nullable|array',
            'age_range_start' => 'required|integer|min:0',
            'age_range_end' => 'required|integer|min:0',
            'dosage_per_kg' => 'required|numeric|min:0',
            'dosage_unit' => 'required|string|max:50',
            'application_method' => 'required|string|in:oral,injection,water,feed,topical',
            'treatment_duration_days' => 'required|integer|min:1',
            'withdrawal_period_days' => 'required|integer|min:0',
            'cost_per_unit' => 'nullable|numeric|min:0',
            'manufacturer' => 'nullable|string|max:255',
            'is_emergency_protocol' => 'boolean',
            'auto_recommend' => 'boolean',
            'status' => 'required|string|in:active,inactive,archived',
            'description' => 'nullable|string',
            'instructions' => 'nullable|string',
        ]);

        $medication->update($request->all());

        return redirect()->route('batch-incubator.admin.protocols.index')
            ->with('success', 'Medication protocol updated successfully.');
    }

    /**
     * Show edit vaccination protocol form
     */
    public function editVaccination(VaccinationProtocol $vaccination)
    {
        return Inertia::render('Admin/SmartScheduling/EditVaccinationProtocol', [
            'protocol' => $vaccination,
        ]);
    }

    /**
     * Update vaccination protocol
     */
    public function updateVaccination(Request $request, VaccinationProtocol $vaccination)
    {
        $request->validate([
            'vaccine_name' => 'required|string|max:255',
            'prevents_disease' => 'required|string|max:255',
            'target_breeds' => 'nullable|array',
            'age_range_start' => 'required|integer|min:0',
            'age_range_end' => 'required|integer|min:0',
            'doses_per_bird' => 'required|numeric|min:0',
            'administration_method' => 'required|string|in:injection,oral,nasal,eye_drop,drinking_water,spray',
            'immunity_duration_months' => 'required|integer|min:1',
            'requires_booster' => 'boolean',
            'booster_interval_days' => 'nullable|integer|min:1',
            'cost_per_dose' => 'nullable|numeric|min:0',
            'manufacturer' => 'nullable|string|max:255',
            'vaccine_batch_number' => 'nullable|string|max:255',
            'is_mandatory' => 'boolean',
            'auto_recommend' => 'boolean',
            'priority_level' => 'required|string|in:low,medium,high,critical',
            'status' => 'required|string|in:active,inactive,archived',
            'description' => 'nullable|string',
            'instructions' => 'nullable|string',
        ]);

        $vaccination->update($request->all());

        return redirect()->route('batch-incubator.admin.protocols.index')
            ->with('success', 'Vaccination protocol updated successfully.');
    }

    /**
     * Toggle protocol status
     */
    public function toggleStatus(Request $request, string $type, int $id)
    {
        $request->validate([
            'status' => 'required|string|in:active,inactive,archived',
        ]);

        if ($type === 'medication') {
            $protocol = MedicationProtocol::findOrFail($id);
        } else {
            $protocol = VaccinationProtocol::findOrFail($id);
        }

        $protocol->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Protocol status updated successfully.',
        ]);
    }

    /**
     * Delete protocol
     */
    public function destroy(string $type, int $id)
    {
        if ($type === 'medication') {
            $protocol = MedicationProtocol::findOrFail($id);
            $protocol->delete();
            $message = 'Medication protocol deleted successfully.';
        } else {
            $protocol = VaccinationProtocol::findOrFail($id);
            $protocol->delete();
            $message = 'Vaccination protocol deleted successfully.';
        }

        return redirect()->route('batch-incubator.admin.protocols.index')
            ->with('success', $message);
    }

    /**
     * Get protocol statistics
     */
    public function getStatistics()
    {
        $medicationStats = [
            'total' => MedicationProtocol::count(),
            'active' => MedicationProtocol::where('status', 'active')->count(),
            'auto_recommend' => MedicationProtocol::where('auto_recommend', true)->count(),
            'emergency' => MedicationProtocol::where('is_emergency_protocol', true)->count(),
        ];

        $vaccinationStats = [
            'total' => VaccinationProtocol::count(),
            'active' => VaccinationProtocol::where('status', 'active')->count(),
            'mandatory' => VaccinationProtocol::where('is_mandatory', true)->count(),
            'auto_recommend' => VaccinationProtocol::where('auto_recommend', true)->count(),
        ];

        return response()->json([
            'medication_stats' => $medicationStats,
            'vaccination_stats' => $vaccinationStats,
        ]);
    }

    /**
     * Show upload form
     */
    public function showUpload(Request $request)
    {
        $type = $request->route('type');
        
        return Inertia::render('Admin/SmartScheduling/ProtocolUpload', [
            'type' => $type,
        ]);
    }

    /**
     * Process file upload
     */
    public function processUpload(Request $request)
    {
        $type = $request->route('type');
        
        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx,xls|max:10240', // 10MB max
        ]);

        try {
            $file = $request->file('file');
            $path = $file->store('uploads/protocols', 'local');
            $fullPath = storage_path('app/' . $path);

            $result = $this->processProtocolFile($fullPath, $type);

            // Clean up uploaded file
            unlink($fullPath);

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error processing file: ' . $e->getMessage(),
                'errors' => [$e->getMessage()],
            ], 500);
        }
    }

    /**
     * Download template file
     */
    public function downloadTemplate(Request $request)
    {
        $type = $request->route('type');
        
        if ($type === 'medication') {
            $headers = [
                'medication_name',
                'medication_type',
                'dosage',
                'administration_method',
                'target_disease',
                'side_effects',
                'precautions',
                'is_emergency_protocol',
                'auto_recommend',
                'status'
            ];
            
            $sampleData = [
                [
                    'Ampicillin',
                    'antibiotic',
                    '20mg/kg body weight',
                    'oral',
                    'Bacterial infections',
                    'Diarrhea, nausea',
                    'Monitor for allergic reactions',
                    'false',
                    'true',
                    'active'
                ],
                [
                    'Oxytetracycline',
                    'antibiotic',
                    '50mg/kg feed',
                    'feed_additive',
                    'Respiratory infections',
                    'Digestive upset',
                    'Withdraw before slaughter',
                    'false',
                    'true',
                    'active'
                ]
            ];
        } else {
            $headers = [
                'vaccine_name',
                'prevents_disease',
                'administration_method',
                'recommended_age_days',
                'priority_level',
                'is_mandatory',
                'auto_recommend',
                'status',
                'dosage',
                'storage_requirements'
            ];
            
            $sampleData = [
                [
                    'Newcastle Disease Vaccine',
                    'Newcastle Disease',
                    'eye_drop',
                    '7',
                    'high',
                    'true',
                    'true',
                    'active',
                    '1 drop per bird',
                    'Store at 2-8°C'
                ],
                [
                    'Marek\'s Disease Vaccine',
                    'Marek\'s Disease',
                    'subcutaneous',
                    '1',
                    'critical',
                    'true',
                    'true',
                    'active',
                    '0.2ml per chick',
                    'Store at -20°C'
                ]
            ];
        }

        $csv = array_merge([$headers], $sampleData);
        $output = fopen('php://temp', 'w');
        
        foreach ($csv as $row) {
            fputcsv($output, $row);
        }
        
        rewind($output);
        $content = stream_get_contents($output);
        fclose($output);

        $filename = $type . '_protocols_template.csv';
        
        return response($content, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Process the uploaded protocol file
     */
    private function processProtocolFile(string $filePath, string $type)
    {
        $extension = pathinfo($filePath, PATHINFO_EXTENSION);
        
        if ($extension === 'csv') {
            $data = $this->readCsvFile($filePath);
        } else {
            $data = $this->readExcelFile($filePath);
        }

        if (empty($data)) {
            return [
                'success' => false,
                'message' => 'No data found in file',
                'errors' => ['File appears to be empty or invalid'],
            ];
        }

        $headers = array_shift($data); // Remove header row
        $results = [
            'imported_count' => 0,
            'failed_count' => 0,
            'failed_rows' => [],
        ];

        foreach ($data as $rowIndex => $row) {
            $rowNumber = $rowIndex + 2; // +2 because we removed header and 0-indexed
            
            if (empty(array_filter($row))) {
                continue; // Skip empty rows
            }

            try {
                $protocolData = $this->mapRowToProtocol($headers, $row, $type);
                $this->validateProtocolData($protocolData, $type);
                
                if ($type === 'medication') {
                    MedicationProtocol::create($protocolData);
                } else {
                    VaccinationProtocol::create($protocolData);
                }
                
                $results['imported_count']++;
            } catch (\Exception $e) {
                $results['failed_count']++;
                $results['failed_rows'][] = [
                    'row' => $rowNumber,
                    'errors' => [$e->getMessage()],
                    'data' => array_combine($headers, $row),
                ];
            }
        }

        return [
            'success' => $results['imported_count'] > 0,
            'message' => "Import completed. {$results['imported_count']} protocols imported successfully.",
            'imported_count' => $results['imported_count'],
            'failed_count' => $results['failed_count'],
            'failed_rows' => $results['failed_rows'],
        ];
    }

    /**
     * Read CSV file
     */
    private function readCsvFile(string $filePath): array
    {
        $data = [];
        if (($handle = fopen($filePath, 'r')) !== false) {
            while (($row = fgetcsv($handle, 1000, ',')) !== false) {
                $data[] = $row;
            }
            fclose($handle);
        }
        return $data;
    }

    /**
     * Read Excel file
     */
    private function readExcelFile(string $filePath): array
    {
        // For now, return empty array - Excel support would require PhpSpreadsheet
        // This can be implemented later if needed
        return [];
    }

    /**
     * Map CSV row to protocol data
     */
    private function mapRowToProtocol(array $headers, array $row, string $type): array
    {
        $mapped = array_combine($headers, $row);
        
        // Convert string booleans to actual booleans
        foreach ($mapped as $key => $value) {
            if (in_array($key, ['auto_recommend', 'is_emergency_protocol', 'is_mandatory'])) {
                $mapped[$key] = filter_var($value, FILTER_VALIDATE_BOOLEAN);
            }
        }

        // Set default values
        $mapped['status'] = $mapped['status'] ?? 'active';
        $mapped['auto_recommend'] = $mapped['auto_recommend'] ?? false;
        
        if ($type === 'medication') {
            $mapped['is_emergency_protocol'] = $mapped['is_emergency_protocol'] ?? false;
        } else {
            $mapped['is_mandatory'] = $mapped['is_mandatory'] ?? false;
            $mapped['priority_level'] = $mapped['priority_level'] ?? 'medium';
            if (isset($mapped['recommended_age_days'])) {
                $mapped['recommended_age_days'] = (int) $mapped['recommended_age_days'];
            }
        }

        return array_filter($mapped, function($value) {
            return $value !== null && $value !== '';
        });
    }

    /**
     * Validate protocol data
     */
    private function validateProtocolData(array $data, string $type): void
    {
        if ($type === 'medication') {
            $required = ['medication_name', 'medication_type', 'dosage', 'administration_method'];
            $validTypes = ['antibiotic', 'antiviral', 'antifungal', 'antiparasitic', 'vitamin', 'supplement', 'other'];
        } else {
            $required = ['vaccine_name', 'prevents_disease', 'administration_method'];
            $validPriorities = ['low', 'medium', 'high', 'critical'];
        }

        // Check required fields
        foreach ($required as $field) {
            if (empty($data[$field])) {
                throw new \Exception("Required field '{$field}' is missing or empty");
            }
        }

        // Validate specific fields
        if ($type === 'medication' && isset($validTypes) && !in_array($data['medication_type'], $validTypes)) {
            throw new \Exception("Invalid medication type. Must be one of: " . implode(', ', $validTypes));
        }

        if ($type === 'vaccination' && isset($data['priority_level']) && !in_array($data['priority_level'], $validPriorities)) {
            throw new \Exception("Invalid priority level. Must be one of: " . implode(', ', $validPriorities));
        }
    }
}
