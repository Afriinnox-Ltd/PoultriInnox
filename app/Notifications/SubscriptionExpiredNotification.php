<?php

namespace App\Notifications;

use App\Modules\Marketplace\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SubscriptionExpiredNotification extends Notification implements ShouldQueue
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
            ->subject('Subscription Expired - '.$this->subscription->plan_name)
            ->greeting('Hello '.$notifiable->name.'!')
            ->line('Your '.$this->subscription->plan_name.' subscription has expired.')
            ->line('**Expired On:** '.$this->subscription->end_date->format('F j, Y'))
            ->line('Your store features may be limited until you renew your subscription.')
            ->line('**Previous Plan:** '.$this->subscription->plan_name)
            ->line('**Price:** RWF '.number_format($this->subscription->price, 0).' per '.$this->subscription->billing_cycle)
            ->action('Renew Subscription', route('marketplace.subscriptions.upgrade'))
            ->line('Thank you for your continued support!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Subscription Expired',
            'message' => 'Your '.$this->subscription->plan_name.' subscription has expired.',
            'subscription_id' => $this->subscription->id,
            'plan_name' => $this->subscription->plan_name,
            'expired_date' => $this->subscription->end_date->format('Y-m-d'),
            'type' => 'subscription_expired',
        ];
    }
}
