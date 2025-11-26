<?php

namespace App\Notifications;

use App\Modules\Marketplace\Models\Vendor;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VendorSuspensionNotification extends Notification 
{
    use Queueable;

    protected $vendor;
    protected $reason;

    /**
     * Create a new notification instance.
     */
    public function __construct(Vendor $vendor, string $reason)
    {
        $this->vendor = $vendor;
        $this->reason = $reason;
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
            ->subject('Account Suspension - ' . $this->vendor->business_name)
            ->greeting('Dear ' . ($this->vendor->contact_person ?: $this->vendor->business_name) . ',')
            ->line('We regret to inform you that your vendor account has been suspended.')
            ->line('')
            ->line('**Business Details:**')
            ->line('- Business Name: ' . $this->vendor->business_name)
            ->line('- Business Email: ' . $this->vendor->business_email)
            ->line('- Suspension Date: ' . $this->vendor->suspended_at?->format('F j, Y g:i A'))
            ->line('')
            ->line('**Reason for Suspension:**')
            ->line($this->reason)
            ->line('')
            ->line('**What this means:**')
            ->line('• Your products have been temporarily deactivated')
            ->line('• You cannot receive new orders')
            ->line('• Your store front is no longer visible to customers')
            ->line('• Your account verification status has been revoked')
            ->line('')
            ->line('**Next Steps:**')
            ->line('If you believe this suspension was made in error or would like to address the issues mentioned above, please contact our support team immediately.')
            ->line('')
            ->line('We appreciate your understanding and look forward to resolving this matter promptly.')
            ->action('Contact Support', config('app.url') . '/contact-support')
            ->line('')
            ->line('Best regards,')
            ->line('The ' . config('app.name') . ' Team')
            ->salutation('');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'vendor_id' => $this->vendor->id,
            'business_name' => $this->vendor->business_name,
            'reason' => $this->reason,
            'suspended_at' => $this->vendor->suspended_at,
        ];
    }
}