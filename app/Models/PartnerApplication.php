<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PartnerApplication extends Model
{
    protected $fillable = [
        'business_name',
        'partner_type',
        'contact_person',
        'email',
        'phone',
        'address',
        'city',
        'country',
        'notes',
        'status',
        'admin_notes',
        'rejection_reason',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }
}
