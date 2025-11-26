@extends('emails.marketplace.layout')

@section('content')
    <h2>Vendor Application Status Update</h2>

    <p>Hello <strong>{{ $vendor->business_name }}</strong>,</p>

    <p>Thank you for your interest in becoming a vendor on Agriinnox Marketplace.</p>

    <p>After careful review of your application, we regret to inform you that we are unable to approve your vendor account
        at this time.</p>

    @if(isset($reason) && $reason)
        <div class="info-box">
            <p style="margin: 0;"><strong>Reason for Rejection:</strong></p>
            <p style="margin: 10px 0 0 0;">{{ $reason }}</p>
        </div>
    @endif

    <h3 style="color: #1f2937; margin-top: 30px;">What You Can Do:</h3>

    <ul style="color: #4b5563; line-height: 1.8;">
        <li><strong>Review Requirements:</strong> Check our <a href="{{ config('app.url') }}/vendor-requirements"
                style="color: #10b981;">vendor requirements</a> to ensure you meet all criteria</li>
        <li><strong>Improve Your Application:</strong> Address the concerns mentioned above</li>
        <li><strong>Reapply:</strong> You're welcome to submit a new application once you've addressed the issues</li>
    </ul>

    <div class="divider"></div>

    <p><strong>Have questions or need clarification?</strong></p>
    <p>Our vendor support team is here to help. Contact us at <a href="mailto:vendors@agriinnox.com"
            style="color: #10b981;">vendors@agriinnox.com</a> and we'll be happy to provide guidance.</p>

    <p style="margin-top: 30px;">Thank you for your understanding.</p>
    <p><strong>The Agriinnox Vendor Team</strong></p>
@endsection