<?php

namespace App\Notifications;

use App\Modules\Marketplace\Models\Subscription;
use App\Modules\Marketplace\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SubscriptionPaymentSuccessfulNotification extends Notification 
{
    use Queueable;

    protected $subscription;
    protected $payment;

    /**
     * Create a new notification instance.
     */
    public function __construct(Subscription $subscription, Payment $payment)
    {
        $this->subscription = $subscription;
        $this->payment = $payment;
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
            ->subject('Payment Successful - ' . $this->subscription->plan_name)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Your subscription payment has been processed successfully.')
            ->line('**Plan:** ' . $this->subscription->plan_name)
            ->line('**Amount Paid:** RWF ' . number_format($this->payment->amount, 0))
            ->line('**Payment Method:** ' . strtoupper(str_replace('_', ' ', $this->payment->payment_method)))
            ->line('**Transaction ID:** ' . $this->payment->transaction_id)
            ->line('**Payment Date:** ' . $this->payment->created_at->format('F j, Y g:i A'))
            ->line('Your subscription is now active and will renew on ' . $this->subscription->end_date->format('F j, Y') . '.')
            ->action('View Subscription', route('marketplace.subscriptions.index'))
            ->line('Thank you for your payment!');
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
            'message' => 'Your payment of RWF ' . number_format($this->payment->amount, 0) . ' for ' . $this->subscription->plan_name . ' has been processed.',
            'subscription_id' => $this->subscription->id,
            'payment_id' => $this->payment->id,
            'amount' => $this->payment->amount,
            'transaction_id' => $this->payment->transaction_id,
            'type' => 'subscription_payment_success'
        ];
    }
}
