<?php

namespace Tests\Feature\Mail;

use App\Mail\Marketplace\WelcomeEmail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class WelcomeEmailTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function welcome_email_can_be_rendered()
    {
        $user = User::factory()->create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
        ]);

        $mailable = new WelcomeEmail($user);

        $mailable->assertSeeInHtml('Welcome to Agriinnox Marketplace!');
        $mailable->assertSeeInHtml($user->name);
        $mailable->assertSeeInHtml($user->email);
        $mailable->assertSeeInHtml('Start Shopping');
    }

    /** @test */
    public function welcome_email_has_correct_subject()
    {
        $user = User::factory()->create();

        $mailable = new WelcomeEmail($user);

        $this->assertEquals('Welcome to Agriinnox Marketplace!', $mailable->envelope()->subject);
    }

    /** @test */
    public function welcome_email_contains_user_data()
    {
        $user = User::factory()->create([
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
        ]);

        $mailable = new WelcomeEmail($user);

        $this->assertEquals($user, $mailable->user);
    }

    /** @test */
    public function welcome_email_can_be_sent()
    {
        Mail::fake();

        $user = User::factory()->create();

        Mail::to($user->email)->send(new WelcomeEmail($user));

        Mail::assertSent(WelcomeEmail::class, function ($mail) use ($user) {
            return $mail->user->id === $user->id;
        });
    }

    /** @test */
    public function welcome_email_includes_call_to_action_links()
    {
        $user = User::factory()->create();

        $mailable = new WelcomeEmail($user);

        $mailable->assertSeeInHtml('/store');
        $mailable->assertSeeInHtml('Browse Products');
        $mailable->assertSeeInHtml('Become a Vendor');
    }
}
