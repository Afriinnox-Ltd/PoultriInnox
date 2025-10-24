<?php

namespace App\Console\Commands;

use App\Modules\Marketplace\Models\Vendor;
use App\Notifications\VendorSuspensionNotification;
use Illuminate\Console\Command;

class TestVendorSuspensionNotification extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:vendor-suspension-notification {vendor_id}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test vendor suspension notification email';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $vendorId = $this->argument('vendor_id');
        
        $vendor = Vendor::with('user')->find($vendorId);
        
        if (!$vendor) {
            $this->error('Vendor not found with ID: ' . $vendorId);
            return;
        }
        
        if (!$vendor->user) {
            $this->error('Vendor does not have an associated user account');
            return;
        }
        
        $testReason = 'This is a test suspension notification. Your account was suspended for testing email functionality.';
        
        $this->info('Sending test suspension notification to: ' . $vendor->user->email);
        $this->info('Vendor: ' . $vendor->business_name);
        
        $vendor->user->notify(new VendorSuspensionNotification($vendor, $testReason));
        
        $this->info('✅ Test notification sent successfully!');
        $this->info('Check your mail logs or email inbox to verify the notification was sent.');
    }
}