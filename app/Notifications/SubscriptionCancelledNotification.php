<?php

namespace App\Notifications;

use App\Modules\Marketplace\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SubscriptionCancelledNotification extends Notification 
{
    use Queueable;

    protected $subscription;

    /**
     * Create a new notification instance.
     */
    public function __construct(Subscription $subscription)
    {
        $this->subscription = $subscription;
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
            ->subject('Subscription Cancelled - ' . $this->subscription->plan_name)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Your ' . $this->subscription->plan_name . ' subscription has been cancelled.')
            ->line('**Plan:** ' . $this->subscription->plan_name)
            ->line('**Access Until:** ' . $this->subscription->end_date->format('F j, Y'))
            ->line('You will continue to have access to your current plan features until the end of your billing period.')
            ->line('After that date, your store will be moved to a free plan (if available) or have limited features.')
            ->line('You can reactivate your subscription at any time before it expires.')
            ->action('Reactivate Subscription', route('marketplace.subscriptions.index'))
            ->line('We\'re sorry to see you go. If you have any feedback, we\'d love to hear from you!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Subscription Cancelled',
            'message' => 'Your ' . $this->subscription->plan_name . ' subscription has been cancelled. Access until ' . $this->subscription->end_date->format('M j, Y') . '.',
            'subscription_id' => $this->subscription->id,
            'plan_name' => $this->subscription->plan_name,
            'access_until' => $this->subscription->end_date->format('Y-m-d'),
            'type' => 'subscription_cancelled'
        ];
    }
}
