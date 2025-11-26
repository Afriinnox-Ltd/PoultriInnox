<?php

namespace App\Mail\Marketplace;

use App\Modules\Marketplace\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ProductRejected extends Mailable
{
    use Queueable, SerializesModels;

    public $product;
    public $reason;

    /**
     * Create a new message instance.
     */
    public function __construct(Product $product, $reason = null)
    {
        $this->product = $product;
        $this->reason = $reason;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Notification: Update Required for Your Product "' . $this->product->name . '"',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.marketplace.products.rejected',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
