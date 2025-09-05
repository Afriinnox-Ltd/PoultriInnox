<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$modules = \App\Models\Module::all(['id', 'name', 'code', 'is_active']);

echo "Modules in database:\n";
foreach ($modules as $module) {
    echo "ID: {$module->id}, Name: {$module->name}, Code: {$module->code}, Active: " . ($module->is_active ? 'Yes' : 'No') . "\n";
}

echo "\nTesting new helper methods:\n";
echo "Is Batch Incubator active? " . (\App\Models\Module::isActiveByCode(\App\Models\Module::BATCH_INCUBATOR) ? 'Yes' : 'No') . "\n";
echo "Is Feed Management active? " . (\App\Models\Module::isActiveByCode(\App\Models\Module::FEED_MANAGEMENT) ? 'Yes' : 'No') . "\n";

$batchIncubator = \App\Models\Module::getByCode(\App\Models\Module::BATCH_INCUBATOR);
echo "Batch Incubator module found: " . ($batchIncubator ? $batchIncubator->name : 'Not found') . "\n";

$feedManagement = \App\Models\Module::getByCode(\App\Models\Module::FEED_MANAGEMENT);
echo "Feed Management module found: " . ($feedManagement ? $feedManagement->name : 'Not found') . "\n";
