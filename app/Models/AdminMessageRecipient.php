<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminMessageRecipient extends Model
{
    protected $fillable = [
        'admin_message_id',
        'user_id',
        'email_sent',
        'email_sent_at',
    ];

    protected $casts = [
        'email_sent' => 'boolean',
        'email_sent_at' => 'datetime',
    ];

    public function adminMessage(): BelongsTo
    {
        return $this->belongsTo(AdminMessage::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
