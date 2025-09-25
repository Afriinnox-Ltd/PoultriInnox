<?php

namespace App\Notifications;

use App\Modules\Marketplace\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewOrderReceivedNotification extends Notification
{
    use Queueable;

    protected $order;

    /**
     * Create a new notification instance.
     */
    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $itemCount = $this->order->items->count();
        $customerName = $this->order->user->name;

        return (new MailMessage)
                    ->subject('New Order Received - #' . $this->order->order_number)
                    ->greeting('Hello!')
                    ->line('You have received a new order from ' . $customerName . '.')
                    ->line('Order Number: ' . $this->order->order_number)
                    ->line('Items: ' . $itemCount . ' item(s)')
                    ->line('Total Amount: RWF ' . number_format($this->order->total_amount, 2))
                    ->line('Payment Status: ' . ucfirst($this->order->payment_status))
                    ->action('View Order Details', route('marketplace.vendor.orders.show', $this->order))
                    ->line('Please process this order promptly!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'New Order Received',
            'message' => 'You have received a new order #' . $this->order->order_number . ' from ' . $this->order->user->name,
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'customer_name' => $this->order->user->name,
            'amount' => $this->order->total_amount,
            'payment_status' => $this->order->payment_status,
            'type' => 'new_order'
        ];
    }
}