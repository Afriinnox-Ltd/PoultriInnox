<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Module extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'version',
        'config',
        'is_active',
        'is_core',
        'sort_order',
    ];

    protected $casts = [
        'config' => 'array',
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
}
