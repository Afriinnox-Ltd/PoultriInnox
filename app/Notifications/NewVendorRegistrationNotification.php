<?php

namespace App\Notifications;

use App\Modules\Marketplace\Models\Vendor;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewVendorRegistrationNotification extends Notification 
{
    use Queueable;

    protected $vendor;

    /**
     * Create a new notification instance.
     */
    public function __construct(Vendor $vendor)
    {
        $this->vendor = $vendor;
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
            ->subject('New Vendor Registration - ' . $this->vendor->business_name)
            ->greeting('Hello Admin,')
            ->line('A new vendor has registered on the marketplace.')
            ->line('Business Details:')
            ->line('- Business Name: ' . $this->vendor->business_name)
            ->line('- Business Type: ' . $this->vendor->business_type)
            ->line('- Email: ' . $this->vendor->business_email)
            ->line('- Phone: ' . $this->vendor->business_phone)
            ->action('Review Vendor Application', route('admin.vendor.review', $this->vendor->id))
            ->line('Please review the application and take appropriate action.')
            ->line('Thank you for using our application!');
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
            'business_email' => $this->vendor->business_email,
        ];
    }
}
