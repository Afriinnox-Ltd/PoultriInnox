<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VendorPayoutRequestConfirmationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $payoutAmount;
    protected $paymentsCount;
    protected $currencySymbol;
    protected $businessName;
    protected $processingDays;

    /**
     * Create a new notification instance.
     */
    public function __construct(float $payoutAmount, int $paymentsCount, string $currencySymbol, string $businessName, int $processingDays)
    {
        $this->payoutAmount = $payoutAmount;
        $this->paymentsCount = $paymentsCount;
        $this->currencySymbol = $currencySymbol;
        $this->businessName = $businessName;
        $this->processingDays = $processingDays;
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
            ->subject('Payout Request Received - ' . $this->businessName)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Your payout request has been successfully submitted and is now under review.')
            ->line('')
            ->line('**Request Details:**')
            ->line('Business: ' . $this->businessName)
            ->line('Amount: ' . $this->currencySymbol . ' ' . number_format($this->payoutAmount, 2))
            ->line('Number of Orders: ' . $this->paymentsCount)
            ->line('Submitted: ' . now()->format('F j, Y \a\t g:i A'))
            ->line('')
            ->line('**Next Steps:**')
            ->line('• Our admin team will review your request')
            ->line('• Processing typically takes ' . $this->processingDays . ' business days')
            ->line('• You will receive an email confirmation when payment is processed')
            ->line('• You can track the status in your vendor dashboard')
            ->action('View Payouts Dashboard', route('marketplace.vendor.payments.index'))
            ->line('Thank you for your business with us!')
            ->line('')
            ->line('If you have any questions about your payout, please contact our support team.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Payout Request Submitted',
            'message' => 'Your payout request for ' . $this->currencySymbol . ' ' . number_format($this->payoutAmount, 2) . ' has been submitted for review.',
            'payout_amount' => $this->payoutAmount,
            'payments_count' => $this->paymentsCount,
            'currency_symbol' => $this->currencySymbol,
            'business_name' => $this->businessName,
            'processing_days' => $this->processingDays,
            'type' => 'payout_request_confirmation',
            'submitted_at' => now()->toISOString(),
        ];
    }
}
