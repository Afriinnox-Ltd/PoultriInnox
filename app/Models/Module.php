<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Module extends Model
{
    use HasFactory;

    // Module codes for easy reference
    public const BATCH_INCUBATOR = 'BATCH_INCUBATOR';
    public const FEED_MANAGEMENT = 'FEED_MANAGEMENT';

    protected $fillable = [
        'name',
        'slug',
        'code',
        'description',
        'icon',
        'version',
        'config',
        'dependencies',
        'is_active',
        'is_core',
        'sort_order',
    ];

    protected $casts = [
        'config' => 'array',
        'dependencies' => 'array',
        'is_active' => 'boolean',
        'is_core' => 'boolean',
    ];

    /**
     * Users who have this module activated
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_modules')
                   ->withPivot('is_enabled', 'settings', 'activated_at')
                   ->withTimestamps();
    }

    /**
     * Get enabled modules for a user
     */
    public static function enabledForUser($userId)
    {
        return static::whereHas('users', function ($query) use ($userId) {
            $query->where('user_id', $userId)
                  ->where('is_enabled', true);
        })->where('is_active', true)->orderBy('sort_order')->get();
    }

    /**
     * Get available modules (not yet activated by user)
     */
    public static function availableForUser($userId)
    {
        return static::whereDoesntHave('users', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })->where('is_active', true)->orderBy('sort_order')->get();
    }

    /**
     * Check if this module's dependencies are satisfied for a user
     */
    public function hasDependenciesSatisfied($userId): bool
    {
        if (empty($this->dependencies)) {
            return true;
        }

        $enabledModuleSlugs = static::enabledForUser($userId)->pluck('slug')->toArray();

        foreach ($this->dependencies as $dependency) {
            if (!in_array($dependency, $enabledModuleSlugs)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get missing dependencies for a user
     */
    public function getMissingDependencies($userId): array
    {
        if (empty($this->dependencies)) {
            return [];
        }

        $enabledModuleSlugs = static::enabledForUser($userId)->pluck('slug')->toArray();
        $missingDependencies = [];

        foreach ($this->dependencies as $dependency) {
            if (!in_array($dependency, $enabledModuleSlugs)) {
                $dependencyModule = static::where('slug', $dependency)->first();
                $missingDependencies[] = [
                    'slug' => $dependency,
                    'name' => $dependencyModule?->name ?? $dependency,
                    'module' => $dependencyModule
                ];
            }
        }

        return $missingDependencies;
    }

    /**
     * Get modules that depend on this module for a user
     */
    public function getDependentModules($userId): array
    {
        $enabledModules = static::enabledForUser($userId);
        $dependentModules = [];

        foreach ($enabledModules as $module) {
            if (in_array($this->slug, $module->dependencies ?? [])) {
                $dependentModules[] = $module;
            }
        }

        return $dependentModules;
    }

    /**
     * Check if this module can be disabled (no dependent modules)
     */
    public function canBeDisabled($userId): bool
    {
        return empty($this->getDependentModules($userId));
    }

    /**
     * Get available modules that satisfy dependencies for a user
     */
    public static function availableWithDependenciesForUser($userId)
    {
        return static::availableForUser($userId)->filter(function ($module) use ($userId) {
            return $module->hasDependenciesSatisfied($userId);
        });
    }

    /**
     * Check if a module is active by code
     */
    public static function isActiveByCode(string $code): bool
    {
        return static::where('code', $code)->where('is_active', true)->exists();
    }

    /**
     * Get module by code
     */
    public static function getByCode(string $code): ?self
    {
        return static::where('code', $code)->first();
    }
}
