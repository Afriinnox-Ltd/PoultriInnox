<?php

namespace App\Notifications;

use App\Models\PartnerOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PartnerOrderReceivedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(protected PartnerOrder $order) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $partner = $this->order->partner;
        $itemCount = $this->order->items->count();

        return (new MailMessage)
            ->subject('New Partner Order Received - #' . $this->order->order_number)
            ->greeting('Hello Admin,')
            ->line('A new custom order has been placed by a partner.')
            ->line('**Partner:** ' . $partner->business_name . ' (' . ucfirst($partner->partner_type) . ')')
            ->line('**Order Number:** ' . $this->order->order_number)
            ->line('**Items:** ' . $itemCount . ' item(s)')
            ->when($this->order->description, fn ($mail) => $mail->line('**Description:** ' . $this->order->description))
            ->when($this->order->requested_delivery_date, fn ($mail) => $mail->line('**Requested Delivery:** ' . $this->order->requested_delivery_date->format('d M Y')))
            ->action('Review Partner Order', route('admin.partners.orders.show', $this->order))
            ->line('Please review and process this order promptly.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'partner_order_received',
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'partner_name' => $this->order->partner->business_name,
            'message' => 'New partner order #' . $this->order->order_number . ' from ' . $this->order->partner->business_name,
        ];
    }
}
