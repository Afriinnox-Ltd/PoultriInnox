<?php

namespace App\Modules\Marketplace\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MarketplaceSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class SettingsAdminController extends Controller
{
    /**
     * Display marketplace settings
     */
    public function index()
    {
        $settings = MarketplaceSetting::getAllGrouped();
        
        return Inertia::render('Admin/Marketplace/Settings/Index', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update marketplace settings
     */
    public function update(Request $request)
    {
        $settings = $request->input('settings', []);
        $errors = [];
        $updated = 0;

        foreach ($settings as $key => $value) {
            $setting = MarketplaceSetting::where('key', $key)->first();
            
            if (!$setting) {
                $errors[$key] = ['Setting not found'];
                continue;
            }

            // Validate the setting value
            if ($setting->validation_rules) {
                $validator = Validator::make(
                    [$key => $value],
                    [$key => $setting->validation_rules]
                );

                if ($validator->fails()) {
                    $errors[$key] = $validator->errors()->get($key);
                    continue;
                }
            }

            // Type-specific validation
            $validationError = $this->validateSettingValue($setting, $value);
            if ($validationError) {
                $errors[$key] = [$validationError];
                continue;
            }

            // Update the setting
            $setting->value = $value;
            if ($setting->save()) {
                $updated++;
            }
        }

        if (!empty($errors)) {
            return back()->withErrors($errors)->with('error', 'Some settings could not be updated due to validation errors.');
        }

        return back()->with('success', "{$updated} settings updated successfully.");
    }

    /**
     * Update a single setting
     */
    public function updateSingle(Request $request, string $key)
    {
        $setting = MarketplaceSetting::where('key', $key)->firstOrFail();
        $value = $request->input('value');

        // Validate the setting value
        if ($setting->validation_rules) {
            $validator = Validator::make(
                ['value' => $value],
                ['value' => $setting->validation_rules]
            );

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }
        }

        // Type-specific validation
        $validationError = $this->validateSettingValue($setting, $value);
        if ($validationError) {
            return response()->json([
                'success' => false,
                'message' => $validationError,
            ], 422);
        }

        $setting->value = $value;
        $setting->save();

        return response()->json([
            'success' => true,
            'message' => 'Setting updated successfully',
            'setting' => [
                'key' => $setting->key,
                'value' => $setting->value,
            ],
        ]);
    }

    /**
     * Reset settings to default values
     */
    public function reset(Request $request)
    {
        $group = $request->input('group');
        
        if ($group) {
            // Reset specific group
            $settings = MarketplaceSetting::where('group', $group)->get();
            $message = "Settings for group '{$group}' reset to defaults.";
        } else {
            // Reset all settings
            $settings = MarketplaceSetting::all();
            $message = "All settings reset to defaults.";
        }

        foreach ($settings as $setting) {
            $setting->delete();
        }

        // Re-run seeder to restore defaults
        \Artisan::call('db:seed', ['--class' => 'MarketplaceSettingsSeeder']);

        return back()->with('success', $message);
    }

    /**
     * Export settings as JSON
     */
    public function export()
    {
        $settings = MarketplaceSetting::all(['key', 'value', 'type', 'group'])->toArray();
        
        $filename = 'marketplace_settings_' . now()->format('Y-m-d_H-i-s') . '.json';
        
        return response()->json($settings)
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
    }

    /**
     * Import settings from JSON
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:json|max:1024',
        ]);

        $file = $request->file('file');
        $content = file_get_contents($file->getPathname());
        $settings = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return back()->with('error', 'Invalid JSON file.');
        }

        $imported = 0;
        $errors = [];

        foreach ($settings as $settingData) {
            if (!isset($settingData['key']) || !isset($settingData['value'])) {
                continue;
            }

            $setting = MarketplaceSetting::where('key', $settingData['key'])->first();
            
            if ($setting) {
                $setting->value = $settingData['value'];
                
                if ($setting->save()) {
                    $imported++;
                }
            } else {
                $errors[] = "Setting '{$settingData['key']}' not found";
            }
        }

        $message = "{$imported} settings imported successfully.";
        if (!empty($errors)) {
            $message .= ' Some settings were skipped: ' . implode(', ', $errors);
        }

        return back()->with('success', $message);
    }

    /**
     * Get settings for API/Ajax requests
     */
    public function getSettings(Request $request)
    {
        $group = $request->query('group');
        $keys = $request->query('keys');

        if ($group) {
            $settings = MarketplaceSetting::getGroup($group);
        } elseif ($keys) {
            $keyArray = is_array($keys) ? $keys : explode(',', $keys);
            $settings = [];
            foreach ($keyArray as $key) {
                $settings[$key] = MarketplaceSetting::get($key);
            }
        } else {
            $settings = MarketplaceSetting::getPublic();
        }

        return response()->json(['settings' => $settings]);
    }

    /**
     * Validate setting value based on type
     */
    private function validateSettingValue(MarketplaceSetting $setting, $value): ?string
    {
        switch ($setting->type) {
            case 'boolean':
                if (!in_array($value, ['true', 'false', true, false, 1, 0, '1', '0'])) {
                    return 'Value must be a boolean (true/false)';
                }
                break;

            case 'number':
                if (!is_numeric($value)) {
                    return 'Value must be a valid number';
                }
                break;

            case 'integer':
                if (!is_numeric($value) || (int) $value != $value) {
                    return 'Value must be a valid integer';
                }
                break;

            case 'select':
                if ($setting->options && !array_key_exists($value, $setting->options)) {
                    return 'Value must be one of the allowed options';
                }
                break;

            case 'json':
            case 'array':
                if (is_string($value)) {
                    json_decode($value);
                    if (json_last_error() !== JSON_ERROR_NONE) {
                        return 'Value must be valid JSON';
                    }
                }
                break;
        }

        return null;
    }
}