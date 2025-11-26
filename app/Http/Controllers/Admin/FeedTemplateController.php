<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\FeedManagement\Models\FeedType;
use App\Modules\FeedManagement\Models\FeedProgram;
use App\Modules\FeedManagement\Models\FeedSupplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class FeedTemplateController extends Controller
{
    /**
     * Show the admin feed template management interface
     */
    public function index()
    {
        $feedTypes = FeedType::with('creator')->latest()->get();
        $feedPrograms = FeedProgram::with('creator')->latest()->get();
        $suppliers = FeedSupplier::with('creator')->latest()->get();

        return Inertia::render('Admin/FeedTemplates/Index', [
            'feedTypesCount' => FeedType::count(),
            'feedProgramsCount' => FeedProgram::count(),
            'suppliersCount' => FeedSupplier::count(),
            'feedTypes' => $feedTypes,
            'feedPrograms' => $feedPrograms,
            'suppliers' => $suppliers,
            'lastUpload' => $this->getLastUploadInfo(),
            'statistics' => $this->getDetailedStatistics()
        ]);
    }

    /**
     * Get detailed statistics for dashboard
     */
    private function getDetailedStatistics()
    {
        return [
            'feedTypes' => [
                'total' => FeedType::count(),
                'byCategory' => FeedType::groupBy('category')
                    ->selectRaw('category, count(*) as count')
                    ->pluck('count', 'category'),
                'recentlyAdded' => FeedType::where('created_at', '>=', now()->subDays(7))->count(),
                'averageCost' => FeedType::avg('cost_per_kg')
            ],
            'feedPrograms' => [
                'total' => FeedProgram::count(),
                'byDuration' => FeedProgram::selectRaw('
                    CASE
                        WHEN total_duration_days <= 42 THEN "Short (≤42 days)"
                        WHEN total_duration_days <= 84 THEN "Medium (43-84 days)"
                        ELSE "Long (>84 days)"
                    END as duration_range,
                    count(*) as count
                ')
                ->groupBy('duration_range')
                ->pluck('count', 'duration_range'),
                'recentlyAdded' => FeedProgram::where('created_at', '>=', now()->subDays(7))->count()
            ],
            'suppliers' => [
                'total' => FeedSupplier::count(),
                'averageRating' => FeedSupplier::avg('quality_rating'),
                'withCertifications' => FeedSupplier::whereNotNull('certifications')->count(),
                'recentlyAdded' => FeedSupplier::where('created_at', '>=', now()->subDays(7))->count()
            ]
        ];
    }

    /**
     * Get last upload information
     */
    private function getLastUploadInfo()
    {
        $lastType = FeedType::latest()->first();
        $lastProgram = FeedProgram::latest()->first();
        $lastSupplier = FeedSupplier::latest()->first();

        $lastUpload = collect([$lastType, $lastProgram, $lastSupplier])
            ->filter()
            ->sortByDesc('created_at')
            ->first();

        return $lastUpload ? [
            'date' => $lastUpload->created_at->format('Y-m-d H:i:s'),
            'type' => class_basename($lastUpload)
        ] : null;
    }

    /**
     * Delete feed type
     */
    public function deleteFeedType($id)
    {
        try {
            $feedType = FeedType::findOrFail($id);
            $feedType->delete();

            return redirect()->back()->with('success', 'Feed type deleted successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete feed type: ' . $e->getMessage());
        }
    }

    /**
     * Delete feed program
     */
    public function deleteFeedProgram($id)
    {
        try {
            $feedProgram = FeedProgram::findOrFail($id);
            $feedProgram->delete();

            return redirect()->back()->with('success', 'Feed program deleted successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete feed program: ' . $e->getMessage());
        }
    }

    /**
     * Delete supplier
     */
    public function deleteSupplier($id)
    {
        try {
            $supplier = FeedSupplier::findOrFail($id);
            $supplier->delete();

            return redirect()->back()->with('success', 'Supplier deleted successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete supplier: ' . $e->getMessage());
        }
    }

    /**
     * Update feed type
     */
    public function updateFeedType(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|in:starter,grower,layer,finisher,breeder,specialist',
            'protein_content' => 'required|numeric|min:0|max:100',
            'energy_content' => 'nullable|numeric|min:0',
            'cost_per_kg' => 'required|numeric|min:0',
            'description' => 'nullable|string'
        ]);

        try {
            $feedType = FeedType::findOrFail($id);
            $feedType->update($request->all());

            return redirect()->back()->with('success', 'Feed type updated successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update feed type: ' . $e->getMessage());
        }
    }

    /**
     * Update feed program
     */
    public function updateFeedProgram(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'total_duration_days' => 'required|integer|min:1',
            'breed_type' => 'required|string|in:broiler,layer,dual_purpose,breeder,universal',
            'estimated_cost_per_bird' => 'required|numeric|min:0',
            'description' => 'nullable|string'
        ]);

        try {
            $feedProgram = FeedProgram::findOrFail($id);
            $feedProgram->update($request->all());

            return redirect()->back()->with('success', 'Feed program updated successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update feed program: ' . $e->getMessage());
        }
    }

    /**
     * Update supplier
     */
    public function updateSupplier(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'supplier_type' => 'required|string|in:manufacturer,distributor,retailer,cooperative',
            'quality_rating' => 'nullable|numeric|min:0|max:5'
        ]);

        try {
            $supplier = FeedSupplier::findOrFail($id);
            $supplier->update($request->all());

            return redirect()->back()->with('success', 'Supplier updated successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update supplier: ' . $e->getMessage());
        }
    }

    /**
     * Bulk delete items
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'type' => 'required|in:feed_types,feed_programs,suppliers',
            'ids' => 'required|array',
            'ids.*' => 'required|integer'
        ]);

        try {
            $deleted = 0;

            switch ($request->type) {
                case 'feed_types':
                    $deleted = FeedType::whereIn('id', $request->ids)->delete();
                    break;
                case 'feed_programs':
                    $deleted = FeedProgram::whereIn('id', $request->ids)->delete();
                    break;
                case 'suppliers':
                    $deleted = FeedSupplier::whereIn('id', $request->ids)->delete();
                    break;
            }

            return redirect()->back()->with('success', "Successfully deleted {$deleted} items");
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete items: ' . $e->getMessage());
        }
    }

    /**
     * Upload feed types from CSV
     */
    public function uploadFeedTypes(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048'
        ]);

        try {
            $file = $request->file('file');

            // Read file content directly from memory without storing to disk
            $csvContent = file_get_contents($file->getPathname());
            $lines = explode("\n", $csvContent);

            $headers = str_getcsv(trim($lines[0]));

            Log::info('CSV Headers:', $headers);

            $imported = 0;
            $errors = [];

            for ($i = 1; $i < count($lines); $i++) {
                $line = trim($lines[$i]);
                if (empty($line)) continue;

                $row = str_getcsv($line);

                if (count($row) != count($headers)) {
                    $errors[] = "Line " . ($i + 1) . ": Column count mismatch";
                    continue;
                }

                $data = array_combine($headers, $row);

                Log::info('Processing row:', $data);

                if ($feedType = $this->createFeedTypeFromRow($data)) {
                    $imported++;
                }
            }

            if ($imported > 0) {
                return redirect()->back()->with('success', "Successfully imported {$imported} feed types");
            } else {
                return redirect()->back()->with('error', 'No valid records found to import. Errors: ' . implode(', ', $errors));
            }

        } catch (\Exception $e) {
            Log::error('Feed types upload error:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return redirect()->back()->with('error', 'Upload failed: ' . $e->getMessage());
        }
    }

    /**
     * Upload feed programs from CSV
     */
    public function uploadFeedPrograms(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048'
        ]);

        try {
            $file = $request->file('file');

            // Read file content directly from memory without storing to disk
            $csvContent = file_get_contents($file->getPathname());
            $lines = explode("\n", $csvContent);

            $headers = str_getcsv(trim($lines[0]));

            $imported = 0;
            $errors = [];

            for ($i = 1; $i < count($lines); $i++) {
                $line = trim($lines[$i]);
                if (empty($line)) continue;

                $row = str_getcsv($line);

                if (count($row) != count($headers)) {
                    $errors[] = "Line " . ($i + 1) . ": Column count mismatch. Expected " . count($headers) . ", got " . count($row);
                    continue;
                }

                $data = array_combine($headers, $row);

                Log::info('Processing feed program row:', $data);

                if ($feedProgram = $this->createFeedProgramFromRow($data)) {
                    $imported++;
                } else {
                    $errors[] = "Line " . ($i + 1) . ": Failed to create feed program";
                }
            }

            if ($imported > 0) {
                return redirect()->back()->with('success', "Successfully imported {$imported} feed programs");
            } else {
                return redirect()->back()->with('error', 'No valid records found to import. Errors: ' . implode(', ', $errors));
            }

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Upload failed: ' . $e->getMessage());
        }
    }

    /**
     * Upload suppliers from CSV
     */
    public function uploadSuppliers(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048'
        ]);

        try {
            $file = $request->file('file');

            // Read file content directly from memory without storing to disk
            $csvContent = file_get_contents($file->getPathname());
            $lines = explode("\n", $csvContent);

            $headers = str_getcsv(trim($lines[0]));

            $imported = 0;
            $errors = [];

            for ($i = 1; $i < count($lines); $i++) {
                $line = trim($lines[$i]);
                if (empty($line)) continue;

                $row = str_getcsv($line);

                if (count($row) != count($headers)) {
                    $errors[] = "Line " . ($i + 1) . ": Column count mismatch. Expected " . count($headers) . ", got " . count($row);
                    continue;
                }

                $data = array_combine($headers, $row);

                Log::info('Processing supplier row:', $data);

                if ($supplier = $this->createSupplierFromRow($data)) {
                    $imported++;
                } else {
                    $errors[] = "Line " . ($i + 1) . ": Failed to create supplier";
                }
            }

            if ($imported > 0) {
                return redirect()->back()->with('success', "Successfully imported {$imported} suppliers");
            } else {
                return redirect()->back()->with('error', 'No valid records found to import. Errors: ' . implode(', ', $errors));
            }

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Upload failed: ' . $e->getMessage());
        }
    }

    /**
     * Download templates
     */
    public function downloadTemplates(Request $request)
    {
        $type = $request->query('type');

        switch ($type) {
            case 'feed_types':
                return $this->downloadFeedTypesTemplate();
            case 'feed_programs':
                return $this->downloadFeedProgramsTemplate();
            case 'suppliers':
                return $this->downloadSuppliersTemplate();
            default:
                return redirect()->back()->with('error', 'Invalid template type');
        }
    }

    /**
     * Create feed type from CSV row
     */
    private function createFeedTypeFromRow(array $row): ?FeedType
    {
        try {
            Log::info('Creating feed type from row:', $row);

            $feedType = FeedType::create([
                'name' => $row['Name'] ?? $row['name'] ?? null,
                'code' => $row['Code'] ?? $row['code'] ?? 'FT-' . uniqid(),
                'category' => strtolower($row['Category'] ?? $row['category'] ?? 'starter'),
                'protein_content' => (float)($row['Protein Content %'] ?? $row['protein_content'] ?? $row['Protein Min %'] ?? 0),
                'energy_content' => (float)($row['Energy (ME) kcal/kg'] ?? $row['energy_content'] ?? $row['energy_me'] ?? 0),
                'cost_per_kg' => (float)($row['Cost per kg'] ?? $row['cost_per_kg'] ?? 0),
                'description' => $row['Description'] ?? $row['description'] ?? null,
                'target_age_start' => (int)($row['Target Age Start (days)'] ?? $row['target_age_start'] ?? 0),
                'target_age_end' => (int)($row['Target Age End (days)'] ?? $row['target_age_end'] ?? 42),
                'usage_instructions' => $row['Usage Instructions'] ?? $row['usage_instructions'] ?? null,
                'created_by' => Auth::id()
            ]);

            Log::info('Feed type created successfully:', ['id' => $feedType->id, 'name' => $feedType->name]);

            return $feedType;
        } catch (\Exception $e) {
            Log::error('Error creating feed type:', [
                'error' => $e->getMessage(),
                'row' => $row,
                'trace' => $e->getTraceAsString()
            ]);
            return null;
        }
    }

    /**
     * Create feed program from CSV row
     */
    private function createFeedProgramFromRow(array $row): ?FeedProgram
    {
        try {
            $feedingTimes = isset($row['Feeding Times']) ?
                explode(',', $row['Feeding Times']) :
                ['06:00', '18:00'];

            // Create basic program data structure
            $programData = [
                'weeks' => [
                    '1-6' => [
                        'feed_type' => 'starter',
                        'feeding_times' => $feedingTimes,
                        'notes' => $row['Description'] ?? 'Auto-generated program'
                    ]
                ]
            ];

            return FeedProgram::create([
                'name' => $row['Name'] ?? $row['name'] ?? null,
                'code' => $row['Code'] ?? $row['code'] ?? 'FP-' . uniqid(),
                'description' => $row['Description'] ?? $row['description'] ?? null,
                'breed_type' => $row['Breed Type'] ?? $row['breed_type'] ?? 'broiler',
                'total_duration_days' => (int)($row['Duration (days)'] ?? $row['total_duration_days'] ?? $row['duration_days'] ?? 42),
                'estimated_cost_per_bird' => (float)($row['Estimated Cost per Bird'] ?? $row['estimated_cost_per_bird'] ?? $row['estimated_cost'] ?? 0),
                'program_data' => $programData,
                'status' => 'active',
                'source' => 'imported',
                'created_by' => Auth::id()
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating feed program:', ['error' => $e->getMessage(), 'row' => $row]);
            return null;
        }
    }

    /**
     * Create supplier from CSV row
     */
    private function createSupplierFromRow(array $row): ?FeedSupplier
    {
        try {
            return FeedSupplier::create([
                'name' => $row['Name'] ?? $row['name'] ?? null,
                'code' => $row['Code'] ?? $row['code'] ?? 'SUP-' . uniqid(),
                'contact_person' => $row['Contact Person'] ?? $row['contact_person'] ?? null,
                'email' => $row['Email'] ?? $row['email'] ?? null,
                'phone' => $row['Phone'] ?? $row['phone'] ?? null,
                'address' => $row['Address'] ?? $row['location'] ?? $row['address'] ?? null,
                'supplier_type' => $row['Type'] ?? $row['supplier_type'] ?? 'distributor',
                'quality_rating' => isset($row['Rating']) ? (float)$row['Rating'] : 0,
                'certifications' => isset($row['Certifications']) ? explode(',', $row['Certifications']) : null,
                'status' => 'active',
                'created_by' => Auth::id()
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating supplier:', ['error' => $e->getMessage(), 'row' => $row]);
            return null;
        }
    }

    /**
     * Parse feeding times string into array
     */
    private function parseFeedingTimes(string $timesString): array
    {
        $times = explode(',', $timesString);
        return array_map('trim', $times);
    }

    /**
     * Download feed types template
     */
    public function downloadFeedTypesTemplate()
    {
        $headers = [
            'Name',
            'Code',
            'Category',
            'Protein Content %',
            'Energy (ME) kcal/kg',
            'Cost per kg',
            'Target Age Start (days)',
            'Target Age End (days)',
            'Description',
            'Usage Instructions'
        ];

        $sampleData = [
            [
                'Starter Feed Premium',
                'ST-PREM-001',
                'starter',
                '21.5',
                '3000',
                '1.25',
                '0',
                '42',
                'High protein feed for chicks 0-6 weeks',
                'Feed 4 times daily, ensure fresh water access'
            ],
            [
                'Grower Feed Standard',
                'GR-STD-001',
                'grower',
                '18.0',
                '3100',
                '1.15',
                '43',
                '120',
                'Balanced nutrition for growing chickens',
                'Feed 3 times daily, monitor growth rate'
            ],
            [
                'Finisher Feed Economy',
                'FN-ECO-001',
                'finisher',
                '16.5',
                '3200',
                '1.05',
                '121',
                '180',
                'Cost-effective feed for final growth stage',
                'Feed 2-3 times daily, reduce quantity before processing'
            ]
        ];

        return $this->generateCsvTemplate('feed_types_template.csv', $headers, $sampleData);
    }

    /**
     * Download feed programs template
     */
    public function downloadFeedProgramsTemplate()
    {
        $headers = [
            'Name',
            'Code',
            'Description',
            'Breed Type',
            'Duration (days)',
            'Estimated Cost per Bird',
            'Feeding Times'
        ];

        $sampleData = [
            [
                'Broiler Fast Growth Program',
                'BFG-001',
                'Intensive program for commercial broilers',
                'broiler',
                '42',
                '3.50',
                '06:00,12:00,18:00'
            ],
            [
                'Layer Pullet Program',
                'LP-001',
                'Development program for future laying hens',
                'layer',
                '120',
                '8.75',
                '07:00,19:00'
            ],
            [
                'Free Range Program',
                'FR-001',
                'Natural growth program for free-range chickens',
                'dual_purpose',
                '84',
                '5.25',
                '08:00,16:00'
            ]
        ];

        return $this->generateCsvTemplate('feed_programs_template.csv', $headers, $sampleData);
    }

    /**
     * Download suppliers template
     */
    public function downloadSuppliersTemplate()
    {
        $headers = [
            'Name',
            'Code',
            'Contact Person',
            'Email',
            'Phone',
            'Address',
            'Type',
            'Rating',
            'Certifications'
        ];

        $sampleData = [
            [
                'Purina Animal Nutrition',
                'PUR-001',
                'John Smith',
                'john@purina.com',
                '+1-555-0123',
                'St. Louis, MO, USA',
                'manufacturer',
                '4.8',
                'ISO 9001,HACCP,GMP'
            ],
            [
                'Cargill Animal Nutrition',
                'CAR-001',
                'Sarah Johnson',
                'sarah@cargill.com',
                '+1-555-0456',
                'Minneapolis, MN, USA',
                'manufacturer',
                '4.7',
                'ISO 22000,SQF,Organic Certified'
            ],
            [
                'Local Feed Co-op',
                'LFC-001',
                'Mike Wilson',
                'mike@localfeed.com',
                '+1-555-0789',
                'Rural County, State, USA',
                'cooperative',
                '4.2',
                'Local Organic Certification'
            ]
        ];

        return $this->generateCsvTemplate('suppliers_template.csv', $headers, $sampleData);
    }

    /**
     * Generate CSV template file
     */
    private function generateCsvTemplate(string $filename, array $headers, array $sampleData)
    {
        $output = fopen('php://temp', 'w');

        // Write headers
        fputcsv($output, $headers);

        // Write sample data
        foreach ($sampleData as $row) {
            fputcsv($output, $row);
        }

        rewind($output);
        $csvContent = stream_get_contents($output);
        fclose($output);

        return response($csvContent, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
}
