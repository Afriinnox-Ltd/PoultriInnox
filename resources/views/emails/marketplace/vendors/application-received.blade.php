@extends('emails.marketplace.layout')

@section('content')
    <h2>Vendor Application Received ✅</h2>

    <p>Hello <strong>{{ $vendor->business_name }}</strong>,</p>

    <p>Thank you for applying to become a vendor on Agriinnox Marketplace!</p>

    <div class="info-box">
        <p style="margin: 0;"><strong>Application Details:</strong></p>
        <p style="margin: 5px 0 0 0;">Business Name: {{ $vendor->business_name }}</p>
        <p style="margin: 5px 0 0 0;">Email: {{ $vendor->business_email }}</p>
        <p style="margin: 5px 0 0 0;">Submitted: {{ $vendor->created_at->format('F d, Y') }}</p>
    </div>

    <h3 style="color: #1f2937; margin-top: 30px;">What Happens Next?</h3>

    <p>Our team will review your application within <strong>2-3 business days</strong>. We'll verify your business
        information and documentation to ensure quality standards for our marketplace.</p>

    <p><strong>During the review process, we'll check:</strong></p>
    <ul style="color: #4b5563; line-height: 1.8;">
        <li>Business registration and legitimacy</li>
        <li>Product quality standards</li>
        <li>Compliance with marketplace policies</li>
    </ul>

    <p>You'll receive an email notification once your application has been reviewed.</p>

    <div class="divider"></div>

    <p><strong>Questions about your application?</strong></p>
    <p>Contact our vendor support team at <a href="mailto:vendors@agriinnox.com"
            style="color: #10b981;">vendors@agriinnox.com</a></p>

    <p style="margin-top: 30px;">Best regards,</p>
    <p><strong>The Agriinnox Vendor Team</strong></p>
@endsection