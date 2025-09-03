<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserModule extends Model
{
    protected $fillable = [
        'user_id',
        'module_id',
        'is_enabled',
        'settings',
        'activated_at',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
        'settings' => 'array',
        'activated_at' => 'datetime',
    ];

    /**
     * Get the user that owns this module assignment
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the module that is assigned
     */
    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }
}
