<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;

class MarketplaceSetting extends Model
{
    use HasFactory;

    protected $table = 'marketplace_settings';

    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'label',
        'description',
        'is_public',
        'is_encrypted',
        'validation_rules',
        'options',
        'sort_order',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'is_encrypted' => 'boolean',
        'validation_rules' => 'array',
        'options' => 'array',
        'sort_order' => 'integer',
    ];

    /**
     * Get the setting value with proper type casting
     */
    public function getValueAttribute($value)
    {
        if ($this->is_encrypted && $value) {
            $value = Crypt::decryptString($value);
        }

        return $this->castValue($value);
    }

    /**
     * Set the setting value with encryption if needed
     */
    public function setValueAttribute($value)
    {
        $value = $this->formatValue($value);
        
        if ($this->is_encrypted) {
            $value = Crypt::encryptString($value);
        }

        $this->attributes['value'] = $value;
    }

    /**
     * Cast value to proper type
     */
    protected function castValue($value)
    {
        if ($value === null) {
            return null;
        }

        switch ($this->type) {
            case 'boolean':
                return filter_var($value, FILTER_VALIDATE_BOOLEAN);
            case 'number':
                return is_numeric($value) ? (float) $value : $value;
            case 'integer':
                return is_numeric($value) ? (int) $value : $value;
            case 'json':
            case 'array':
                return is_string($value) ? json_decode($value, true) : $value;
            default:
                return $value;
        }
    }

    /**
     * Format value for storage
     */
    protected function formatValue($value)
    {
        switch ($this->type) {
            case 'boolean':
                return $value ? 'true' : 'false';
            case 'json':
            case 'array':
                return is_array($value) ? json_encode($value) : $value;
            default:
                return (string) $value;
        }
    }

    /**
     * Get setting by key with caching
     */
    public static function get(string $key, $default = null)
    {
        $cacheKey = "marketplace_setting_{$key}";
        
        return Cache::remember($cacheKey, 3600, function () use ($key, $default) {
            $setting = static::where('key', $key)->first();
            return $setting ? $setting->value : $default;
        });
    }

    /**
     * Set setting value
     */
    public static function set(string $key, $value): bool
    {
        $setting = static::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );

        // Clear cache
        Cache::forget("marketplace_setting_{$key}");
        
        return $setting->wasRecentlyCreated || $setting->wasChanged();
    }

    /**
     * Get all settings grouped by group
     */
    public static function getAllGrouped(): array
    {
        $cacheKey = 'marketplace_settings_grouped';
        
        return Cache::remember($cacheKey, 3600, function () {
            return static::orderBy('group')->orderBy('sort_order')->get()->groupBy('group')->toArray();
        });
    }

    /**
     * Get public settings only
     */
    public static function getPublic(): array
    {
        $cacheKey = 'marketplace_settings_public';
        
        return Cache::remember($cacheKey, 3600, function () {
            return static::where('is_public', true)
                ->pluck('value', 'key')
                ->toArray();
        });
    }

    /**
     * Get settings for a specific group
     */
    public static function getGroup(string $group): array
    {
        $cacheKey = "marketplace_settings_group_{$group}";
        
        return Cache::remember($cacheKey, 3600, function () use ($group) {
            return static::where('group', $group)
                ->orderBy('sort_order')
                ->get()
                ->pluck('value', 'key')
                ->toArray();
        });
    }

    /**
     * Clear all settings cache
     */
    public static function clearCache(): void
    {
        $keys = [
            'marketplace_settings_grouped',
            'marketplace_settings_public',
        ];
        
        foreach ($keys as $key) {
            Cache::forget($key);
        }

        // Clear individual setting caches
        $settings = static::all();
        foreach ($settings as $setting) {
            Cache::forget("marketplace_setting_{$setting->key}");
            Cache::forget("marketplace_settings_group_{$setting->group}");
        }
    }

    /**
     * Boot method to clear cache on model events
     */
    protected static function boot()
    {
        parent::boot();

        static::saved(function () {
            static::clearCache();
        });

        static::deleted(function () {
            static::clearCache();
        });
    }
}