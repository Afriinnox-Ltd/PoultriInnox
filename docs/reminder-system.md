# Schedule Reminder System

This documentation covers the comprehensive rem### Frontend Component

**ScheduleReminders.tsx**
- React component for managing reminders
- Privacy-focused user selection via email search
- Add, edit, delete functionality
- Real-time status updates
- Notification method selection

#### Privacy Features
- Email-based user search instead of displaying all users
- Users can only find people by entering their email address
- Autocomplete dropdown shows matching users
- Selected user confirmation before creating remindersystem for managing schedule notifications via email and database.

## Overview

The reminder system provides automated notifications for batch schedules, supporting:
- Email notifications
- Database notifications
- Before-due reminders
- Overdue reminders
- Custom reminder scheduling
- Retry logic for failed notifications
- Automated cleanup

## Components

### Database

**Table: `schedule_reminders`**
- Stores reminder configurations and status
- Tracks notification attempts and failures
- Supports multiple notification methods per reminder

### Models

**ScheduleReminder** (`App\Models\Modules\BatchIncubator\Models\ScheduleReminder`)
- Main model for reminder management
- Includes factory methods for creating different reminder types
- Provides scopes for filtering by status
- Handles retry logic and cleanup

### Notifications

**ScheduleReminderNotification** (`App\Notifications\ScheduleReminderNotification`)
- Laravel notification class
- Supports email and database channels
- Rich email templates with contextual content
- Includes action URLs for quick access

### Commands

1. **SendScheduleReminders** (`reminders:send`)
   - Processes pending reminders
   - Sends notifications via configured channels
   - Handles retry logic for failures
   - Scheduled: Every 5 minutes

2. **CheckOverdueSchedules** (`reminders:check-overdue`)
   - Identifies overdue schedules
   - Creates overdue reminder notifications
   - Scheduled: Hourly

3. **CleanupScheduleReminders** (`reminders:cleanup`)
   - Removes old processed reminders
   - Configurable retention periods
   - Scheduled: Daily

4. **TestReminders** (`reminders:test`)
   - Testing utility for reminder system
   - Create test reminders
   - Send test notifications
   - View system status

### API Endpoints

All endpoints are in the ScheduleController:

```php
GET /api/schedules/{schedule}/reminders
POST /api/schedules/{schedule}/reminders
PUT /api/schedules/{schedule}/reminders/{reminder}
DELETE /api/schedules/{schedule}/reminders/{reminder}
```

### Frontend Component

**ScheduleReminders.tsx**
- React component for managing reminders
- Add, edit, delete reminder functionality
- Real-time status updates
- Notification method selection

## Usage

### Creating Reminders

**Before Due Reminders:**
```php
$reminder = ScheduleReminder::createBeforeDueReminder(
    $schedule,
    $user,
    60, // minutes before due
    ['email', 'database']
);
```

**Overdue Reminders:**
```php
$reminder = ScheduleReminder::createOverdueReminder(
    $schedule,
    $user,
    ['email', 'database']
);
```

**Custom Reminders:**
```php
$reminder = ScheduleReminder::createCustomReminder(
    $schedule,
    $user,
    Carbon::now()->addHours(2), // send at specific time
    ['email'],
    'Custom reminder message'
);
```

### Frontend Usage

```jsx
// In a schedule detail page
<ScheduleReminders 
  schedule={schedule} 
  users={users}
  onReminderChange={handleReminderUpdate}
/>
```

#### User Selection Process
1. **Enter Email**: User types email address to search for recipients
2. **Search Results**: System shows matching users based on email input
3. **User Selection**: Click on a user from the dropdown to select them
4. **Confirmation**: Selected user is displayed with green confirmation
5. **Create Reminder**: Configure reminder settings and create

#### Privacy Benefits
- No user list exposure: Users don't see all available users
- Email verification: Must know the correct email to find users
- Intentional selection: Requires explicit user selection from search results

### Testing the System

```bash
# View current status
php artisan reminders:test --status

# Create test reminders
php artisan reminders:test --create

# Send test reminders immediately
php artisan reminders:test --send

# Manual command execution
php artisan reminders:send
php artisan reminders:check-overdue
php artisan reminders:cleanup
```

## Configuration

### Task Scheduling

The system uses Laravel's task scheduler in `routes/console.php`:

```php
// Send pending reminders every 5 minutes
Schedule::command('reminders:send')->everyFiveMinutes();

// Check for overdue schedules hourly
Schedule::command('reminders:check-overdue')->hourly();

// Clean up old reminders daily
Schedule::command('reminders:cleanup')->daily();
```

### Notification Channels

Configure available notification methods in the reminder creation:

```php
// Email only
['email']

// Database only
['database']

// Both channels
['email', 'database']
```

### Email Configuration

Ensure your Laravel mail configuration is set up in `config/mail.php`:

```php
'default' => env('MAIL_MAILER', 'smtp'),
'mailers' => [
    'smtp' => [
        'transport' => 'smtp',
        'host' => env('MAIL_HOST', 'smtp.mailgun.org'),
        'port' => env('MAIL_PORT', 587),
        // ... other settings
    ],
],
```

## Reminder Types

### Before Due
- Sent a specified number of minutes before the schedule due date
- Helps users prepare for upcoming tasks
- Can be set for multiple time intervals

### Overdue
- Automatically created when schedules pass their due date
- Alerts users to delayed tasks
- Continues until schedule is completed

### Custom
- User-defined send time
- Custom message content
- Flexible scheduling for special notifications

## Status Management

Reminders have the following statuses:
- **pending**: Waiting to be sent
- **sent**: Successfully delivered
- **failed**: Delivery failed (will retry)
- **cancelled**: Manually cancelled

## Error Handling

The system includes comprehensive error handling:
- Failed notifications are retried up to 3 times
- Exponential backoff between retry attempts
- Failed reminders are logged for debugging
- Cleanup process removes old failed reminders

## Monitoring

### Database Notifications
View notifications in the user's notifications table:
```php
$user->notifications()->where('type', 'ScheduleReminderNotification')->get();
```

### Logs
Check Laravel logs for reminder processing:
```bash
tail -f storage/logs/laravel.log | grep -i reminder
```

### Status Dashboard
Use the test command to view system status:
```bash
php artisan reminders:test --status
```

## Maintenance

### Regular Tasks
1. Monitor failed reminders and investigate causes
2. Adjust cleanup retention periods as needed
3. Review email delivery rates
4. Update notification templates as requirements change

### Troubleshooting

**Reminders not sending:**
1. Check task scheduler is running: `php artisan schedule:work`
2. Verify queue workers if using queued notifications
3. Check email configuration and credentials
4. Review logs for error messages

**High failure rates:**
1. Check email server connectivity
2. Verify recipient email addresses
3. Review spam filters and delivery issues
4. Consider adjusting retry logic

## Future Enhancements

Potential improvements to consider:
- SMS notifications via third-party services
- Push notifications for web/mobile apps
- User preference management for notification timing
- Escalation rules for critical overdue tasks
- Analytics and reporting on notification effectiveness
