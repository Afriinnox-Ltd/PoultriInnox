<?php

namespace App\Traits;

use App\Models\ActivityLog;

trait LogsActivity
{
    public static function bootLogsActivity(): void
    {
        static::created(function ($model) {
            ActivityLog::log(
                'created',
                class_basename($model) . ' created',
                $model,
                null,
                $model->getLogAttributes(),
            );
        });

        static::updated(function ($model) {
            $changes = $model->getChanges();
            unset($changes['updated_at']);

            if (empty($changes)) {
                return;
            }

            $old = array_intersect_key($model->getOriginal(), $changes);

            // Remove sensitive fields
            $sensitiveFields = ['password', 'remember_token'];
            foreach ($sensitiveFields as $field) {
                if (isset($changes[$field])) {
                    $changes[$field] = '***';
                }
                if (isset($old[$field])) {
                    $old[$field] = '***';
                }
            }

            ActivityLog::log(
                'updated',
                class_basename($model) . ' updated',
                $model,
                $old,
                $changes,
            );
        });

        static::deleted(function ($model) {
            ActivityLog::log(
                'deleted',
                class_basename($model) . ' deleted',
                $model,
                $model->getLogAttributes(),
                null,
            );
        });
    }

    public function getLogAttributes(): array
    {
        $attributes = $this->attributesToArray();

        // Remove sensitive fields
        $sensitiveFields = ['password', 'remember_token'];
        foreach ($sensitiveFields as $field) {
            unset($attributes[$field]);
        }

        return $attributes;
    }
}
