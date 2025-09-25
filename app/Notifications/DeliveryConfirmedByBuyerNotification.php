<?php

namespace App\Notifications;

use App\Modules\Marketplace\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DeliveryConfirmedByBuyerNotification extends Notification
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
                    ->subject('Delivery Confirmed - Payment Released - Order #' . $this->order->order_number)
                    ->greeting('Hello ' . $notifiable->name . '!')
                    ->line('Great news! The buyer has confirmed delivery of your order.')
                    ->line('Order Number: ' . $this->order->order_number)
                    ->line('Total Amount: RWF ' . number_format($this->order->total_amount, 2))
                    ->line('Vendor Amount: RWF ' . number_format($this->order->calculateVendorAmount(), 2))
                    ->line('The payment has been released and added to your account.')
                    ->action('View Order', route('marketplace.vendor.orders.show', $this->order->id))
                    ->line('Thank you for providing excellent service!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Delivery Confirmed - Payment Released',
            'message' => 'Order #' . $this->order->order_number . ' delivery confirmed. Payment of RWF ' . number_format($this->order->calculateVendorAmount(), 2) . ' released.',
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'vendor_amount' => $this->order->calculateVendorAmount(),
            'type' => 'delivery_confirmed_payment_released'
        ];
    }
}