<?php

namespace App\Console\Commands;

use App\Models\IotAlert;
use App\Modules\BatchIncubator\Models\Batch;
use App\Notifications\BatchCompletionNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckBatchCompletionCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'batch:check-completion';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for batches reaching their expected completion date and create alerts';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Checking batch completion status...');

        try {
            // Get all active brooding batches with expected completion dates
            $batches = Batch::where('status', 'brooding')
                ->whereNotNull('expected_completion_date')
                ->with(['incubator', 'manager'])
                ->get();

            if ($batches->isEmpty()) {
                $this->info('No active batches with completion dates found.');
                return Command::SUCCESS;
            }

            $this->info("Found {$batches->count()} active batches to check.");

            $completedCount = 0;
            $endingSoonCount = 0;
            $overdueCount = 0;

            foreach ($batches as $batch) {
                $daysRemaining = now()->diffInDays($batch->expected_completion_date, false);
                $deviceId = $batch->incubator?->serial_number;

                // Batch completed (reached end date)
                if ($daysRemaining == 0) {
                    // Check if completion notification was already sent today to avoid duplicates
                    $alreadyNotifiedToday = $batch->events()
                        ->where('event_type', \App\Modules\BatchIncubator\Enums\EventType::STATUS_CHANGE)
                        ->whereJsonContains('event_data->auto_transition', true)
                        ->whereDate('created_at', today())
                        ->exists();

                    if ($alreadyNotifiedToday) {
                        continue; // Skip this batch, already processed today
                    }

                    $this->warn("🎯 Batch #{$batch->id} ({$batch->species}) has reached completion date!");

                    // Automatically transition batch to next stage
                    $oldStatus = $batch->status->value;
                    $newStatus = $this->getNextStage($oldStatus);

                    if ($newStatus) {
                        $batch->update(['status' => $newStatus]);

                        // Log the status change as an event
                        $batch->events()->create([
                            'event_type' => \App\Modules\BatchIncubator\Enums\EventType::STATUS_CHANGE,
                            'title' => 'Automatic stage transition',
                            'description' => "Batch automatically transitioned from {$oldStatus} to {$newStatus} upon completion of incubation period",
                            'event_date' => now(),
                            'user_id' => null, // System generated
                            'event_data' => [
                                'old_status' => $oldStatus,
                                'new_status' => $newStatus,
                                'auto_transition' => true,
                                'completion_date' => $batch->expected_completion_date->format('Y-m-d'),
                            ],
                        ]);

                        $this->info("   → Status updated: {$oldStatus} → {$newStatus}");
                    }

                    if ($deviceId) {
                        $this->createAlert(
                            $deviceId,
                            $batch->incubator->id,
                            'BATCH_COMPLETED',
                            "Batch #{$batch->id} ({$batch->species}) has completed incubation and moved to {$newStatus} stage!",
                            'warning'
                        );
                    }

                    // Notify manager
                    if ($batch->manager) {
                        try {
                            $batch->manager->notify(new BatchCompletionNotification($batch, 'completed'));
                        } catch (\Exception $e) {
                            Log::error('Failed to send batch completion notification', [
                                'batch_id' => $batch->id,
                                'error' => $e->getMessage()
                            ]);
                        }
                    }

                    $completedCount++;
                }
                // Batch ending soon (3 days or less)
                elseif ($daysRemaining > 0 && $daysRemaining <= 3) {
                    // Check if alert was already created today
                    $alertExistsToday = \App\Models\IotAlert::where('device_id', $deviceId)
                        ->where('alert_type', 'BATCH_ENDING_SOON')
                        ->whereDate('created_at', today())
                        ->exists();

                    if ($alertExistsToday) {
                        continue; // Skip, already alerted today
                    }

                    $this->info("⏰ Batch #{$batch->id} ({$batch->species}) will complete in {$daysRemaining} days");

                    if ($deviceId) {
                        $this->createAlert(
                            $deviceId,
                            $batch->incubator->id,
                            'BATCH_ENDING_SOON',
                            "Batch #{$batch->id} ({$batch->species}) will complete in {$daysRemaining} days ({$batch->expected_completion_date->format('Y-m-d')})",
                            'info'
                        );
                    }

                    // Notify manager on day before completion
                    if ($daysRemaining == 1 && $batch->manager) {
                        try {
                            $batch->manager->notify(new BatchCompletionNotification($batch, 'ending_soon'));
                        } catch (\Exception $e) {
                            Log::error('Failed to send batch ending soon notification', [
                                'batch_id' => $batch->id,
                                'error' => $e->getMessage()
                            ]);
                        }
                    }

                    $endingSoonCount++;
                }
                // Batch overdue (past completion date)
                elseif ($daysRemaining < 0) {
                    // Check if overdue alert was already created today
                    $alertExistsToday = \App\Models\IotAlert::where('device_id', $deviceId)
                        ->where('alert_type', 'BATCH_OVERDUE')
                        ->whereDate('created_at', today())
                        ->exists();

                    if ($alertExistsToday) {
                        continue; // Skip, already alerted today
                    }

                    $overdueDays = abs($daysRemaining);
                    $this->error("⚠️ Batch #{$batch->id} ({$batch->species}) is {$overdueDays} days overdue!");

                    if ($deviceId) {
                        $this->createAlert(
                            $deviceId,
                            $batch->incubator->id,
                            'BATCH_OVERDUE',
                            "Batch #{$batch->id} ({$batch->species}) is {$overdueDays} days past expected completion date",
                            'critical'
                        );
                    }

                    // Notify manager about overdue batch
                    if ($batch->manager) {
                        try {
                            $batch->manager->notify(new BatchCompletionNotification($batch, 'overdue'));
                        } catch (\Exception $e) {
                            Log::error('Failed to send batch overdue notification', [
                                'batch_id' => $batch->id,
                                'error' => $e->getMessage()
                            ]);
                        }
                    }

                    $overdueCount++;
                }
            }

            $this->newLine();
            $this->info("✅ Batch completion check complete:");
            $this->table(
                ['Status', 'Count'],
                [
                    ['Completed', $completedCount],
                    ['Ending Soon (≤3 days)', $endingSoonCount],
                    ['Overdue', $overdueCount],
                ]
            );

            Log::info('Batch completion check completed', [
                'total_batches' => $batches->count(),
                'completed' => $completedCount,
                'ending_soon' => $endingSoonCount,
                'overdue' => $overdueCount,
            ]);

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error('Error checking batch completion: ' . $e->getMessage());
            Log::error('Batch completion check failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Command::FAILURE;
        }
    }

    /**
     * Get the next stage based on current batch status
     */
    protected function getNextStage(string $currentStatus): ?string
    {
        return match ($currentStatus) {
            'incubating' => 'hatching',
            'hatching' => 'brooding',
            'brooding' => 'growing',
            'growing' => 'laying',
            'laying' => 'completed',
            default => null, // No automatic transition for planned, completed, or terminated
        };
    }

    /**
     * Create or update an alert
     */
    protected function createAlert(string $deviceId, int $incubatorId, string $alertType, string $message, string $severity): void
    {
        try {
            // Check if similar unresolved alert exists (avoid duplicates in last 24 hours)
            $existingAlert = IotAlert::where('device_id', $deviceId)
                ->where('alert_type', $alertType)
                ->where('resolved', false)
                ->where('created_at', '>', now()->subDay())
                ->first();

            if ($existingAlert) {
                // Update existing alert
                $existingAlert->update([
                    'message' => $message,
                    'updated_at' => now(),
                ]);
                return;
            }

            // Create new alert
            IotAlert::create([
                'device_id' => $deviceId,
                'incubator_id' => $incubatorId,
                'alert_type' => $alertType,
                'message' => $message,
                'severity' => $severity,
            ]);

            Log::info('Batch completion alert created', [
                'device_id' => $deviceId,
                'alert_type' => $alertType,
                'message' => $message,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to create batch completion alert', [
                'device_id' => $deviceId,
                'error' => $e->getMessage()
            ]);
        }
    }
}
