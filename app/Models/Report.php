<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'type',
        'parameters',
        'data',
        'format',
        'period_start',
        'period_end',
        'user_id',
    ];

    protected $casts = [
        'parameters' => 'array',
        'data' => 'array',
        'period_start' => 'datetime',
        'period_end' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
