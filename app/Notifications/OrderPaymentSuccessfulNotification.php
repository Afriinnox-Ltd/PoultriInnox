<?php

namespace App\Notifications;

use App\Modules\Marketplace\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderPaymentSuccessfulNotification extends Notification
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
                    ->subject('Payment Successful - Order #' . $this->order->order_number)
                    ->greeting('Hello ' . $notifiable->name . '!')
                    ->line('Your payment has been processed successfully.')
                    ->line('Order Number: ' . $this->order->order_number)
                    ->line('Total Amount: RWF ' . number_format($this->order->total_amount, 2))
                    ->line('Payment Status: Paid')
                    ->action('View Order', route('orders.show', $this->order))
                    ->line('Thank you for your purchase!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Payment Successful',
            'message' => 'Your payment for order #' . $this->order->order_number . ' has been processed successfully.',
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'amount' => $this->order->total_amount,
            'type' => 'payment_success'
        ];
    }
}