<?php

namespace App\Notifications;

use App\Modules\Marketplace\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SubscriptionRenewalReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $subscription;
    protected $daysUntilExpiry;

    /**
     * Create a new notification instance.
     */
    public function __construct(Subscription $subscription, int $daysUntilExpiry)
    {
        $this->subscription = $subscription;
        $this->daysUntilExpiry = $daysUntilExpiry;
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
            ->subject('Subscription Renewal Reminder - ' . $this->subscription->plan_name)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Your ' . $this->subscription->plan_name . ' subscription will expire in ' . $this->daysUntilExpiry . ' day(s).')
            ->line('**Expiry Date:** ' . $this->subscription->end_date->format('F j, Y'))
            ->line('**Current Plan:** ' . $this->subscription->plan_name)
            ->line('**Price:** RWF ' . number_format($this->subscription->price, 0) . ' per ' . $this->subscription->billing_cycle);

        if ($this->subscription->auto_renew) {
            $message->line('✓ Auto-renewal is enabled. Your subscription will automatically renew on the expiry date.');
        } else {
            $message->line('⚠️ Auto-renewal is disabled. Please renew your subscription before it expires to avoid service interruption.')
                ->action('Renew Subscription', route('marketplace.subscriptions.upgrade'));
        }

        $message->line('Thank you for being a valued customer!');

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
            'title' => 'Subscription Renewal Reminder',
            'message' => 'Your ' . $this->subscription->plan_name . ' subscription will expire in ' . $this->daysUntilExpiry . ' day(s).',
            'subscription_id' => $this->subscription->id,
            'plan_name' => $this->subscription->plan_name,
            'days_until_expiry' => $this->daysUntilExpiry,
            'expiry_date' => $this->subscription->end_date->format('Y-m-d'),
            'auto_renew' => $this->subscription->auto_renew,
            'type' => 'subscription_renewal_reminder'
        ];
    }
}
