<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Modules\BatchIncubator\Models\ScheduleReminder;
use App\Modules\BatchIncubator\Models\BatchSchedule;

class ScheduleReminderNotification extends Notification 
{
    use Queueable;

    public function __construct(
        private ScheduleReminder $reminder,
        private BatchSchedule $schedule
    ) {
        $this->onQueue('notifications');
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $channels = [];

        if (in_array($this->reminder->notification_method, ['email', 'both'])) {
            $channels[] = 'mail';
        }

        if (in_array($this->reminder->notification_method, ['database', 'both'])) {
            $channels[] = 'database';
        }

        return $channels;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $subject = $this->getSubject();
        $message = $this->getMessage();
        $actionUrl = route('batch-incubator.schedules.show', $this->schedule->id);

        $mailMessage = (new MailMessage)
            ->subject($subject)
            ->greeting("Hello {$notifiable->name},")
            ->line($message);

        if ($this->reminder->custom_message) {
            $mailMessage->line($this->reminder->custom_message);
        }

        $mailMessage->line('**Schedule Details:**')
                   ->line("• **Title:** {$this->schedule->title}")
                   ->line("• **Batch:** {$this->schedule->batch->name}")
                   ->line("• **Scheduled:** {$this->schedule->getScheduledDateTime()->format('l, F j, Y \a\t g:i A')}")
                   ->line("• **Event Type:** {$this->schedule->event_type->label}");

        if ($this->schedule->description) {
            $mailMessage->line("• **Description:** {$this->schedule->description}");
        }

        if ($this->schedule->required_quantity && $this->schedule->required_unit) {
            $mailMessage->line("• **Required:** {$this->schedule->required_quantity} {$this->schedule->required_unit}");
        }

        if ($this->schedule->notes) {
            $mailMessage->line("• **Notes:** {$this->schedule->notes}");
        }

        $mailMessage->action('View Schedule', $actionUrl)
                   ->line('Thank you for using Agriinnox!')
                   ->salutation('Best regards, The Agriinnox Team');

        return $mailMessage;
    }

    /**
     * Get the database representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'reminder_id' => $this->reminder->id,
            'schedule_id' => $this->schedule->id,
            'title' => $this->getSubject(),
            'message' => $this->getMessage(),
            'custom_message' => $this->reminder->custom_message,
            'schedule_title' => $this->schedule->title,
            'batch_name' => $this->schedule->batch->name,
            'scheduled_datetime' => $this->schedule->getScheduledDateTime()->toISOString(),
            'event_type' => $this->schedule->event_type->label,
            'reminder_type' => $this->reminder->reminder_type,
            'action_url' => route('batch-incubator.schedules.show', $this->schedule->id),
            'priority' => $this->schedule->is_critical ? 'high' : 'normal',
            'icon' => $this->getIcon(),
        ];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return $this->toDatabase($notifiable);
    }

    private function getSubject(): string
    {
        return match ($this->reminder->reminder_type) {
            'before_due' => "Upcoming Schedule: {$this->schedule->title}",
            'overdue' => "Overdue Schedule: {$this->schedule->title}",
            'custom' => "Schedule Reminder: {$this->schedule->title}",
        };
    }

    private function getMessage(): string
    {
        $scheduledTime = $this->schedule->getScheduledDateTime();

        return match ($this->reminder->reminder_type) {
            'before_due' => "You have a scheduled task '{$this->schedule->title}' for batch '{$this->schedule->batch->name}' due on {$scheduledTime->format('l, F j, Y \a\t g:i A')}.",
            'overdue' => "The scheduled task '{$this->schedule->title}' for batch '{$this->schedule->batch->name}' was due on {$scheduledTime->format('l, F j, Y \a\t g:i A')} and is now overdue.",
            'custom' => "This is a reminder for your scheduled task '{$this->schedule->title}' for batch '{$this->schedule->batch->name}'.",
        };
    }

    private function getIcon(): string
    {
        return match ($this->reminder->reminder_type) {
            'before_due' => 'clock',
            'overdue' => 'alert-triangle',
            'custom' => 'bell',
        };
    }
}
