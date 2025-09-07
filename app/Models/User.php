<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Modules\BatchIncubator\Models\UserReminderPreference;
use App\Modules\Marketplace\Models\Vendor;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Modules activated by this user
     */
    public function modules(): BelongsToMany
    {
        return $this->belongsToMany(Module::class, 'user_modules')
                   ->withPivot('is_enabled', 'settings', 'activated_at')
                   ->withTimestamps();
    }

    /**
     * Get enabled modules for this user
     */
    public function enabledModules()
    {
        return $this->modules()->wherePivot('is_enabled', true)->orderBy('sort_order');
    }

    /**
     * Check if user has a specific module enabled
     */
    public function hasModule(string $moduleSlug): bool
    {
        return $this->enabledModules()->where('slug', $moduleSlug)->exists();
    }

    /**
     * Check if user has a specific role
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    /**
     * Get user's reminder preferences
     */
    public function reminderPreferences(): HasOne
    {
        return $this->hasOne(UserReminderPreference::class);
    }

    /**
     * Get or create reminder preferences for this user
     */
    public function getReminderPreferences(): UserReminderPreference
    {
        return UserReminderPreference::getForUser($this);
    }

    /**
     * Get the vendor profile for this user
     */
    public function vendor(): HasOne
    {
        return $this->hasOne(Vendor::class);
    }

    /**
     * Check if user is a vendor
     */
    public function isVendor(): bool
    {
        return $this->vendor()->exists();
    }

    /**
     * Check if user is an approved vendor
     */
    public function isApprovedVendor(): bool
    {
        return $this->vendor()->where('verification_status', 'verified')->exists();
    }
}
