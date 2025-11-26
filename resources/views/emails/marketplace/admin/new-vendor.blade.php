@extends('emails.marketplace.layout')

@section('content')
    <h2>🔔 New Vendor Registration</h2>

    <p>Hello Admin,</p>

    <p>A new vendor has registered on Agriinnox Marketplace and is awaiting approval.</p>

    <div class="info-box">
        <p style="margin: 0;"><strong>Vendor Information:</strong></p>
        <p style="margin: 10px 0 0 0;"><strong>Business Name:</strong> {{ $vendor->business_name }}</p>
        <p style="margin: 5px 0 0 0;"><strong>Contact Person:</strong> {{ $vendor->user->name }}</p>
        <p style="margin: 5px 0 0 0;"><strong>Email:</strong> {{ $vendor->business_email }}</p>
        <p style="margin: 5px 0 0 0;"><strong>Phone:</strong> {{ $vendor->business_phone ?? 'Not provided' }}</p>
        <p style="margin: 5px 0 0 0;"><strong>Registration Date:</strong> {{ $vendor->created_at->format('F d, Y h:i A') }}
        </p>
    </div>

    <h3 style="color: #1f2937; margin-top: 30px;">Business Details:</h3>
    <p style="color: #4b5563;">
        <strong>Address:</strong> {{ $vendor->business_address ?? 'Not provided' }}<br>
        <strong>Description:</strong> {{ $vendor->business_description ?? 'Not provided' }}
    </p>

    <a href="{{ config('app.url') }}/admin/marketplace/vendors/{{ $vendor->id }}" class="button">Review Application</a>

    <p style="margin-top: 30px;"><strong>Action Required:</strong></p>
    <ul style="color: #4b5563; line-height: 1.8;">
        <li>Review vendor business information</li>
        <li>Verify business registration documents</li>
        <li>Check compliance with marketplace policies</li>
        <li>Approve or reject the application</li>
    </ul>

    <p style="margin-top: 20px;">Please review this application within 2-3 business days.</p>
    <p><strong>Agriinnox Admin System</strong></p>
@endsection