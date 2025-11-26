<?php

namespace Tests\Feature\Mail;

use App\Mail\Marketplace\Admin\NewVendorRegistration;
use App\Mail\Marketplace\VendorApplicationReceived;
use App\Mail\Marketplace\VendorApproved;
use App\Mail\Marketplace\VendorRejected;
use App\Models\User;
use App\Modules\Marketplace\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class VendorEmailsTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function vendor_application_received_email_can_be_rendered()
    {
        $user = User::factory()->create();
        $vendor = Vendor::factory()->create([
            'user_id' => $user->id,
            'business_name' => 'Test Poultry Supplies',
            'business_email' => 'vendor@example.com',
            'status' => 'pending',
        ]);

        $mailable = new VendorApplicationReceived($vendor);

        $mailable->assertSeeInHtml('Vendor Application Received');
        $mailable->assertSeeInHtml($vendor->business_name);
        $mailable->assertSeeInHtml($vendor->business_email);
        $mailable->assertSeeInHtml('2-3 business days');
    }

    /** @test */
    public function vendor_application_received_has_correct_subject()
    {
        $vendor = Vendor::factory()->create();

        $mailable = new VendorApplicationReceived($vendor);

        $this->assertEquals('Vendor Application Received - Agriinnox Marketplace', $mailable->envelope()->subject);
    }

    /** @test */
    public function vendor_approved_email_can_be_rendered()
    {
        $vendor = Vendor::factory()->create([
            'business_name' => 'Approved Vendor Co',
            'status' => 'approved',
        ]);

        $mailable = new VendorApproved($vendor);

        $mailable->assertSeeInHtml('Congratulations!');
        $mailable->assertSeeInHtml('approved');
        $mailable->assertSeeInHtml($vendor->business_name);
        $mailable->assertSeeInHtml('Add Your First Product');
    }

    /** @test */
    public function vendor_approved_has_correct_subject()
    {
        $vendor = Vendor::factory()->create();

        $mailable = new VendorApproved($vendor);

        $this->assertStringContainsString('Approved', $mailable->envelope()->subject);
    }

    /** @test */
    public function vendor_rejected_email_can_be_rendered()
    {
        $vendor = Vendor::factory()->create([
            'business_name' => 'Rejected Vendor',
            'status' => 'rejected',
        ]);

        $reason = 'Incomplete business documentation';
        $mailable = new VendorRejected($vendor, $reason);

        $mailable->assertSeeInHtml($vendor->business_name);
        $mailable->assertSeeInHtml($reason);
        $mailable->assertSeeInHtml('unable to approve');
    }

    /** @test */
    public function vendor_rejected_can_be_sent_without_reason()
    {
        $vendor = Vendor::factory()->create();

        $mailable = new VendorRejected($vendor);

        $this->assertNull($mailable->reason);
        $mailable->assertSeeInHtml('Vendor Application Status Update');
    }

    /** @test */
    public function new_vendor_registration_admin_email_can_be_rendered()
    {
        $user = User::factory()->create(['name' => 'Vendor Owner']);
        $vendor = Vendor::factory()->create([
            'user_id' => $user->id,
            'business_name' => 'New Business Ltd',
            'business_email' => 'business@example.com',
            'business_phone' => '+250788123456',
        ]);

        $mailable = new NewVendorRegistration($vendor);

        $mailable->assertSeeInHtml('New Vendor Registration');
        $mailable->assertSeeInHtml($vendor->business_name);
        $mailable->assertSeeInHtml($vendor->business_email);
        $mailable->assertSeeInHtml('Review Application');
    }

    /** @test */
    public function new_vendor_registration_has_correct_subject()
    {
        $vendor = Vendor::factory()->create();

        $mailable = new NewVendorRegistration($vendor);

        $this->assertStringContainsString('New Vendor Registration', $mailable->envelope()->subject);
        $this->assertStringContainsString('Action Required', $mailable->envelope()->subject);
    }

    /** @test */
    public function vendor_emails_can_be_sent()
    {
        Mail::fake();

        $vendor = Vendor::factory()->create();

        // Test sending application received email
        Mail::to($vendor->business_email)->send(new VendorApplicationReceived($vendor));
        Mail::assertSent(VendorApplicationReceived::class);

        // Test sending approved email
        Mail::to($vendor->business_email)->send(new VendorApproved($vendor));
        Mail::assertSent(VendorApproved::class);

        // Test sending rejected email
        Mail::to($vendor->business_email)->send(new VendorRejected($vendor, 'Test reason'));
        Mail::assertSent(VendorRejected::class);

        // Test sending admin notification
        Mail::to('admin@agriinnox.com')->send(new NewVendorRegistration($vendor));
        Mail::assertSent(NewVendorRegistration::class);
    }
}
