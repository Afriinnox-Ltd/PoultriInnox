<?php

namespace App\Modules\BatchIncubator\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\User;

class UserReminderPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'notification_methods',
        'default_minutes_before',
        'auto_create_before_due',
        'auto_create_overdue',
        'overdue_reminder_frequency',
        'max_overdue_reminders',
        'weekend_reminders',
        'quiet_hours_start',
        'quiet_hours_end',
        'preferred_reminder_types',
    ];

    protected $casts = [
        'notification_methods' => 'array',
        'auto_create_before_due' => 'boolean',
        'auto_create_overdue' => 'boolean',
        'weekend_reminders' => 'boolean',
        'quiet_hours_start' => 'datetime:H:i',
        'quiet_hours_end' => 'datetime:H:i',
        'preferred_reminder_types' => 'array',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Helper methods
    public function getNotificationMethodsAsString(): string
    {
        return implode(', ', $this->notification_methods);
    }

    public function hasEmailNotifications(): bool
    {
        return in_array('email', $this->notification_methods);
    }

    public function hasDatabaseNotifications(): bool
    {
        return in_array('database', $this->notification_methods);
    }

    public function shouldCreateBeforeDueReminders(): bool
    {
        return $this->auto_create_before_due &&
               in_array('before_due', $this->preferred_reminder_types);
    }

    public function shouldCreateOverdueReminders(): bool
    {
        return $this->auto_create_overdue &&
               in_array('overdue', $this->preferred_reminder_types);
    }

    public function isInQuietHours(\DateTimeInterface $dateTime = null): bool
    {
        if (!$this->quiet_hours_start || !$this->quiet_hours_end) {
            return false;
        }

        $time = $dateTime ? $dateTime->format('H:i') : now()->format('H:i');
        return $time >= $this->quiet_hours_start->format('H:i') &&
               $time <= $this->quiet_hours_end->format('H:i');
    }

    public function shouldSendOnWeekends(): bool
    {
        return $this->weekend_reminders;
    }

    // Static methods
    public static function getDefaultPreferences(): array
    {
        return [
            'notification_methods' => ['email'],
            'default_minutes_before' => 30,
            'auto_create_before_due' => true,
            'auto_create_overdue' => true,
            'overdue_reminder_frequency' => 60,
            'max_overdue_reminders' => 5,
            'weekend_reminders' => false,
            'preferred_reminder_types' => ['before_due', 'overdue'],
        ];
    }

    public static function createForUser(User $user, array $preferences = []): self
    {
        $defaults = self::getDefaultPreferences();
        $data = array_merge($defaults, $preferences, ['user_id' => $user->id]);

        return self::create($data);
    }

    public static function getForUser(User $user): self
    {
        return self::firstOrCreate(
            ['user_id' => $user->id],
            self::getDefaultPreferences()
        );
    }
}
