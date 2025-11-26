@extends('emails.marketplace.layout')

@section('content')
    <h2>🎉 Congratulations! Your Vendor Application is Approved</h2>

    <p>Hello <strong>{{ $vendor->business_name }}</strong>,</p>

    <p>Great news! Your vendor application has been <strong>approved</strong>. Welcome to the Agriinnox Marketplace vendor
        community!</p>

    <div class="info-box">
        <p style="margin: 0;"><strong>✅ Account Status: APPROVED</strong></p>
        <p style="margin: 5px 0 0 0;">Approval Date: {{ now()->format('F d, Y') }}</p>
        <p style="margin: 5px 0 0 0;">Vendor ID: #{{ $vendor->id }}</p>
    </div>

    <h3 style="color: #1f2937; margin-top: 30px;">Get Started with Your Vendor Dashboard</h3>

    <p><strong>Here's what you can do now:</strong></p>
    <ul style="color: #4b5563; line-height: 1.8;">
        <li><strong>Add Products:</strong> List your Livestock equipment and supplies</li>
        <li><strong>Manage Inventory:</strong> Track stock levels and update pricing</li>
        <li><strong>Process Orders:</strong> Receive and fulfill customer orders</li>
        <li><strong>Track Payments:</strong> Monitor your sales and earnings</li>
    </ul>

    <a href="{{ config('app.url') }}/marketplace/vendor/products/create" class="button">Add Your First Product</a>

    <div class="divider"></div>

    <h3 style="color: #1f2937;">Important Next Steps:</h3>
    <ol style="color: #4b5563; line-height: 1.8;">
        <li>Complete your vendor profile with business details</li>
        <li>Upload high-quality product images</li>
        <li>Set competitive pricing</li>
        <li>Review our <a href="{{ config('app.url') }}/vendor-guidelines" style="color: #10b981;">Vendor Guidelines</a>
        </li>
    </ol>

    <p><strong>Need help getting started?</strong></p>
    <p>Check out our <a href="{{ config('app.url') }}/vendor-guide" style="color: #10b981;">Vendor Success Guide</a> or
        contact us at <a href="mailto:vendors@agriinnox.com" style="color: #10b981;">vendors@agriinnox.com</a></p>

    <p style="margin-top: 30px;">We're excited to have you on board!</p>
    <p><strong>The Agriinnox Team</strong></p>
@endsection