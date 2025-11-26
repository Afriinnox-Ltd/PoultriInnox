<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VendorMessageNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $subject;
    public $message;

    /**
     * Create a new notification instance.
     */
    public function __construct($subject, $message)
    {
        $this->subject = $subject;
        $this->message = $message;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject($this->subject)
                    ->greeting('Hello ' . $notifiable->name . ',')
                    ->line('You have received a new message from the marketplace admin:')
                    ->line('--------------------------------------------------')
                    ->line($this->message)
                    ->line('--------------------------------------------------')
                    ->line('Please do not reply directly to this automated email.')
                    ->action('Go to Dashboard', url('/marketplace/vendor/dashboard'));
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
