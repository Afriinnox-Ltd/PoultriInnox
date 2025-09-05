<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Module;

class CheckModules extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'check:modules';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check module status and codes';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking modules in database...');

        $modules = Module::all(['id', 'name', 'code', 'is_active']);

        $this->table(
            ['ID', 'Name', 'Code', 'Active'],
            $modules->map(function ($module) {
                return [
                    $module->id,
                    $module->name,
                    $module->code ?? 'NULL',
                    $module->is_active ? 'Yes' : 'No'
                ];
            })->toArray()
        );

        $this->info('Testing helper methods...');

        $batchIncubatorActive = Module::isActiveByCode(Module::BATCH_INCUBATOR);
        $feedManagementActive = Module::isActiveByCode(Module::FEED_MANAGEMENT);

        $this->info("BATCH_INCUBATOR constant: " . Module::BATCH_INCUBATOR);
        $this->info("FEED_MANAGEMENT constant: " . Module::FEED_MANAGEMENT);
        $this->info("Is Batch Incubator active? " . ($batchIncubatorActive ? 'Yes' : 'No'));
        $this->info("Is Feed Management active? " . ($feedManagementActive ? 'Yes' : 'No'));

        $batchModule = Module::getByCode(Module::BATCH_INCUBATOR);
        $feedModule = Module::getByCode(Module::FEED_MANAGEMENT);

        $this->info("Batch Incubator module found: " . ($batchModule ? $batchModule->name : 'Not found'));
        $this->info("Feed Management module found: " . ($feedModule ? $feedModule->name : 'Not found'));
    }
}
