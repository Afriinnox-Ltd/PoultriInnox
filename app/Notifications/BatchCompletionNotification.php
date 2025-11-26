<?php

namespace App\Notifications;

use App\Modules\BatchIncubator\Models\Batch;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BatchCompletionNotification extends Notification 
{
    use Queueable;

    protected Batch $batch;
    protected string $type; // 'completed', 'ending_soon', 'overdue'

    /**
     * Create a new notification instance.
     */
    public function __construct(Batch $batch, string $type = 'completed')
    {
        $this->batch = $batch;
        $this->type = $type;
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
            ->subject($this->getSubject());

        switch ($this->type) {
            case 'completed':
                $message->line("Batch #{$this->batch->id} has reached its expected completion date!")
                    ->line("**Species:** {$this->batch->species}")
                    ->line("**Quantity:** {$this->batch->quantity} birds")
                    ->line("**Start Date:** {$this->batch->start_date->format('F d, Y')}")
                    ->line("**Completion Date:** {$this->batch->expected_completion_date->format('F d, Y')}")
                    ->line("**Age:** {$this->batch->age_days} days")
                    ->action('View Batch', route('batch-incubator.batches.show', $this->batch->id))
                    ->line('The batch is ready for harvest. Please take necessary actions.');
                break;

            case 'ending_soon':
                $daysRemaining = now()->diffInDays($this->batch->expected_completion_date, false);
                $message->line("Batch #{$this->batch->id} will complete in {$daysRemaining} day(s)!")
                    ->line("**Species:** {$this->batch->species}")
                    ->line("**Quantity:** {$this->batch->quantity} birds")
                    ->line("**Expected Completion:** {$this->batch->expected_completion_date->format('F d, Y')}")
                    ->line("**Current Age:** {$this->batch->age_days} days")
                    ->action('View Batch', route('batch-incubator.batches.show', $this->batch->id))
                    ->line('Please prepare for harvest and ensure all resources are ready.');
                break;

            case 'overdue':
                $overdueDays = abs(now()->diffInDays($this->batch->expected_completion_date, false));
                $message->line("⚠️ Batch #{$this->batch->id} is {$overdueDays} day(s) overdue!")
                    ->line("**Species:** {$this->batch->species}")
                    ->line("**Quantity:** {$this->batch->quantity} birds")
                    ->line("**Expected Completion:** {$this->batch->expected_completion_date->format('F d, Y')}")
                    ->line("**Current Age:** {$this->batch->age_days} days")
                    ->action('View Batch Immediately', route('batch-incubator.batches.show', $this->batch->id))
                    ->error()
                    ->line('This batch has exceeded its expected completion date. Immediate action required!');
                break;
        }

        return $message;
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $daysRemaining = $this->batch->expected_completion_date
            ? now()->diffInDays($this->batch->expected_completion_date, false)
            : null;

        return [
            'batch_id' => $this->batch->id,
            'type' => $this->type,
            'species' => $this->batch->species,
            'quantity' => $this->batch->quantity,
            'age_days' => $this->batch->age_days,
            'start_date' => $this->batch->start_date->toDateString(),
            'expected_completion_date' => $this->batch->expected_completion_date?->toDateString(),
            'days_remaining' => $daysRemaining,
            'incubator_id' => $this->batch->incubator_id,
            'message' => $this->getMessage(),
        ];
    }

    /**
     * Get notification subject
     */
    protected function getSubject(): string
    {
        return match($this->type) {
            'completed' => "🎯 Batch #{$this->batch->id} Completed - Ready for Harvest",
            'ending_soon' => "⏰ Batch #{$this->batch->id} Ending Soon",
            'overdue' => "⚠️ Batch #{$this->batch->id} Overdue - Immediate Action Required",
            default => "Batch #{$this->batch->id} Update",
        };
    }

    /**
     * Get notification message
     */
    protected function getMessage(): string
    {
        return match($this->type) {
            'completed' => "Batch #{$this->batch->id} ({$this->batch->species}) has reached its expected completion date and is ready for harvest.",
            'ending_soon' => "Batch #{$this->batch->id} ({$this->batch->species}) will complete in " . now()->diffInDays($this->batch->expected_completion_date, false) . " day(s).",
            'overdue' => "Batch #{$this->batch->id} ({$this->batch->species}) is " . abs(now()->diffInDays($this->batch->expected_completion_date, false)) . " day(s) overdue!",
            default => "Batch #{$this->batch->id} status update.",
        };
    }
}
