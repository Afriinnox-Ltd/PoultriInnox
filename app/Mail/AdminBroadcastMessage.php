<?php

namespace App\Mail;

use App\Models\AdminMessage;
use App\Models\User;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class AdminBroadcastMessage extends Mailable
{

    public function __construct(
        public AdminMessage $adminMessage,
        public User $recipient,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->adminMessage->subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admin.broadcast-message',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
