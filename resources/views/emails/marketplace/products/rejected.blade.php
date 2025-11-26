@extends('emails.marketplace.layout')

@section('content')
    <h2 style="color: #ef4444;">Action Required: Product Update</h2>

    <p>Hello <strong>{{ $product->vendor->business_name }}</strong>,</p>

    <p>Thank you for submitting your product <strong>"{{ $product->name }}"</strong> for review. Our team has reviewed your
        submission and determined that some updates are required before it can be listed on the marketplace.</p>

    <div class="info-box" style="border-left-color: #ef4444;">
        <p style="margin: 0;"><strong>Reason for rejection/Feedback:</strong></p>
        <p style="margin: 10px 0 0 0; color: #4b5563; font-style: italic;">
            "{{ $reason ?? 'No specific reason provided. Please review our product listing guidelines and ensure all required information is accurate.' }}"
        </p>
    </div>

    <p>You can edit your product details and resubmit it for review through your vendor dashboard.</p>

    <div style="text-align: center; margin: 30px 0;">
        <a href="{{ config('app.url') }}/marketplace/vendor/products/{{ $product->id }}/edit" class="button">Edit
            Product</a>
    </div>

    <p>If you have any questions regarding this feedback, please reply to this email or contact support.</p>

    <p style="margin-top: 20px;">We look forward to seeing your updated product!</p>
    <p><strong>The Agriinnox Team</strong></p>
@endsection