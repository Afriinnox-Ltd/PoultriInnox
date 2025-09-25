<?php

namespace App\Notifications;

use App\Modules\Marketplace\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DeliveryConfirmationRequestNotification extends Notification
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
        return (new MailMessage)
                    ->subject('Please Confirm Your Delivery - Order #' . $this->order->order_number)
                    ->greeting('Hello ' . $notifiable->name . '!')
                    ->line('Your order has been marked as delivered by the vendor.')
                    ->line('Order Number: ' . $this->order->order_number)
                    ->line('Total Amount: RWF ' . number_format($this->order->total_amount, 2))
                    ->line('To release payment to the vendor, please confirm that you have received your package.')
                    ->action('Confirm Delivery', route('orders.confirm-delivery', $this->order->id))
                    ->line('Please provide proof of delivery (photo) when confirming.')
                    ->line('If you have not received your package, please contact us immediately.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Confirm Your Delivery',
            'message' => 'Order #' . $this->order->order_number . ' has been delivered. Please confirm receipt to release payment.',
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'amount' => $this->order->total_amount,
            'type' => 'delivery_confirmation_request'
        ];
    }
}