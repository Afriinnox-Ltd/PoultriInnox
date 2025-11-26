@extends('emails.marketplace.layout')

@section('content')
    <h2>Welcome to Agriinnox Marketplace! 🎉</h2>

    <p>Hello <strong>{{ $user->name }}</strong>,</p>

    <p>Thank you for joining Agriinnox Marketplace, Rwanda's premier platform for Livestock equipment and supplies!</p>

    <div class="info-box">
        <p style="margin: 0;"><strong>Your account is now active!</strong></p>
        <p style="margin: 5px 0 0 0;">Email: {{ $user->email }}</p>
    </div>

    <h3 style="color: #1f2937; margin-top: 30px;">What's Next?</h3>

    <p><strong>🛒 Browse Products</strong><br>
        Explore our wide range of quality livestock equipment, feed, and supplies from verified vendors.</p>

    <p><strong>🏪 Become a Vendor</strong><br>
        Have products to sell? Register as a vendor and reach thousands of livestock farmers across Rwanda.</p>

    <p><strong>📦 Track Orders</strong><br>
        Manage your orders, track shipments, and communicate with vendors all in one place.</p>

    <a href="{{ config('app.url') }}/store" class="button">Start Shopping</a>

    <div class="divider"></div>

    <p><strong>Need Help Getting Started?</strong></p>
    <p>Visit our <a href="{{ config('app.url') }}/help" style="color: #10b981;">Help Center</a> or contact our support team
        at <a href="mailto:support@agriinnox.com" style="color: #10b981;">support@agriinnox.com</a></p>

    <p style="margin-top: 30px;">Happy shopping!</p>
    <p><strong>The Agriinnox Team</strong></p>
@endsection