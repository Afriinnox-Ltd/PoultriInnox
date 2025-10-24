<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Modules\Marketplace\Models\Payment;

class VendorPayoutCompletedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $payment;
    protected $businessName;
    protected $note;

    /**
     * Create a new notification instance.
     */
    public function __construct(Payment $payment, string $businessName, ?string $note = null)
    {
        $this->payment = $payment;
        $this->businessName = $businessName;
        $this->note = $note;
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
            ->subject('Payout Processed - ' . $this->businessName)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Great news! Your payout has been successfully processed and the funds have been transferred to your account.')
            ->line('')
            ->line('**Payout Details:**')
            ->line('Business: ' . $this->businessName)
            ->line('Amount: ' . $this->payment->currency . ' ' . number_format($this->payment->vendor_amount, 2))
            ->line('Order: #' . $this->payment->order->order_number)
            ->line('Transaction ID: ' . $this->payment->transaction_id)
            ->line('Processed Date: ' . now()->format('F j, Y \a\t g:i A'))
            ->line('');

        if ($this->note) {
            $message->line('**Note from Admin:**')
                    ->line($this->note)
                    ->line('');
        }

        $message->line('**Bank Details:**')
                ->line('The payment has been sent to your registered bank account.')
                ->line('Please allow 1-3 business days for the funds to appear in your account.')
                ->line('')
                ->action('View Payment History', route('marketplace.vendor.payments.index'))
                ->line('Thank you for your continued partnership!')
                ->line('')
                ->line('If you have any questions or don\'t receive the funds within 3 business days, please contact our support team.');

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
            'title' => 'Payout Processed',
            'message' => 'Your payout of ' . $this->payment->currency . ' ' . number_format($this->payment->vendor_amount, 2) . ' has been successfully processed.',
            'payment_id' => $this->payment->id,
            'order_number' => $this->payment->order->order_number,
            'transaction_id' => $this->payment->transaction_id,
            'payout_amount' => $this->payment->vendor_amount,
            'currency' => $this->payment->currency,
            'business_name' => $this->businessName,
            'note' => $this->note,
            'type' => 'payout_completed',
            'processed_at' => now()->toISOString(),
        ];
    }
}
