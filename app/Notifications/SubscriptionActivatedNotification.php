<?php

namespace App\Notifications;

use App\Modules\Marketplace\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SubscriptionActivatedNotification extends Notification implements ShouldQueue
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
        $message = (new MailMessage)
            ->subject('Subscription Activated - ' . $this->subscription->plan_name)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Your subscription has been activated successfully!')
            ->line('**Plan:** ' . $this->subscription->plan_name);

        if ($this->subscription->price > 0) {
            $message->line('**Amount Paid:** RWF ' . number_format($this->subscription->price, 0));
        }

        $message->line('**Billing Cycle:** ' . ucfirst($this->subscription->billing_cycle))
            ->line('**Start Date:** ' . $this->subscription->start_date->format('F j, Y'))
            ->line('**End Date:** ' . $this->subscription->end_date->format('F j, Y'));

        if ($this->subscription->product_limit) {
            $message->line('**Product Limit:** ' . number_format($this->subscription->product_limit) . ' products');
        }

        if ($this->subscription->order_limit) {
            $message->line('**Order Limit:** ' . number_format($this->subscription->order_limit) . ' orders per month');
        }

        $message->action('View Subscription', route('marketplace.subscriptions.index'))
            ->line('Thank you for subscribing to ' . config('app.name') . '!');

        return $message;
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Subscription Activated',
            'message' => 'Your ' . $this->subscription->plan_name . ' subscription has been activated successfully.',
            'subscription_id' => $this->subscription->id,
            'plan_name' => $this->subscription->plan_name,
            'price' => $this->subscription->price,
            'billing_cycle' => $this->subscription->billing_cycle,
            'type' => 'subscription_activated'
        ];
    }
}
