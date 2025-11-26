<?php

namespace App\Notifications;

use App\Modules\Marketplace\Models\Vendor;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VendorPayoutRequestNotification extends Notification 
{
    use Queueable;

    protected $vendor;
    protected $payoutAmount;
    protected $paymentsCount;
    protected $currencySymbol;

    /**
     * Create a new notification instance.
     */
    public function __construct(Vendor $vendor, float $payoutAmount, int $paymentsCount, string $currencySymbol = 'RWF')
    {
        $this->vendor = $vendor;
        $this->payoutAmount = $payoutAmount;
        $this->paymentsCount = $paymentsCount;
        $this->currencySymbol = $currencySymbol;
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
            ->subject('New Vendor Payout Request - ' . $this->vendor->business_name)
            ->greeting('Hello Admin!')
            ->line('A vendor has requested a payout that requires your approval.')
            ->line('**Vendor Details:**')
            ->line('Business: ' . $this->vendor->business_name)
            ->line('Contact: ' . $this->vendor->user->name . ' (' . $this->vendor->user->email . ')')
            ->line('Phone: ' . ($this->vendor->phone ?? 'Not provided'))
            ->line('')
            ->line('**Payout Details:**')
            ->line('Amount: ' . $this->currencySymbol . ' ' . number_format($this->payoutAmount, 2))
            ->line('Number of Orders: ' . $this->paymentsCount)
            ->line('Requested: ' . now()->format('F j, Y \a\t g:i A'))
            ->action('Review Payout Request', route('admin.marketplace.payments.vendor-payouts'))
            ->line('Please review and process this payout request at your earliest convenience.')
            ->line('Thank you!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'New Vendor Payout Request',
            'message' => $this->vendor->business_name . ' has requested a payout of ' . $this->currencySymbol . ' ' . number_format($this->payoutAmount, 2),
            'vendor_id' => $this->vendor->id,
            'vendor_name' => $this->vendor->business_name,
            'payout_amount' => $this->payoutAmount,
            'payments_count' => $this->paymentsCount,
            'currency_symbol' => $this->currencySymbol,
            'type' => 'vendor_payout_request',
            'requested_at' => now()->toISOString(),
        ];
    }
}
