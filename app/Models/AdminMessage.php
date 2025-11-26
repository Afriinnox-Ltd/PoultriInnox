<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class AdminMessage extends Model
{
    protected $fillable = [
        'sender_id',
        'subject',
        'body',
        'recipient_type',
        'recipient_roles',
        'recipient_user_ids',
        'total_recipients',
        'sent_at',
    ];

    protected $casts = [
        'recipient_roles' => 'array',
        'recipient_user_ids' => 'array',
        'sent_at' => 'datetime',
    ];

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function messageRecipients(): HasMany
    {
        return $this->hasMany(AdminMessageRecipient::class);
    }

    public function recipients(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'admin_message_recipients')
            ->withPivot('email_sent', 'email_sent_at')
            ->withTimestamps();
    }
}
