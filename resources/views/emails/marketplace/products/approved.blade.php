@extends('emails.marketplace.layout')

@section('content')
    <h2>Product Approved! 🎉</h2>

    <p>Hello <strong>{{ $product->vendor->business_name }}</strong>,</p>

    <p>Great news! Your product <strong>"{{ $product->name }}"</strong> has been reviewed and approved by our
        administrators.</p>

    <div class="info-box">
        <p style="margin: 0;"><strong>Product Details:</strong></p>
        <p style="margin: 5px 0 0 0;">Name: {{ $product->name }}</p>
        <p style="margin: 5px 0 0 0;">Price: RWF {{ number_format($product->price, 0) }}</p>
        <p style="margin: 5px 0 0 0;">Status: <strong>ACTIVE</strong></p>
    </div>

    <p>Your product is now visible to customers in the marketplace and is ready for purchase.</p>

    <div style="text-align: center; margin: 30px 0;">
        <a href="{{ config('app.url') }}/marketplace/products/{{ $product->id }}" class="button">View Product Page</a>
    </div>

    <p>Thank you for contributing to the Agriinnox Marketplace!</p>
    <p><strong>The Agriinnox Team</strong></p>
@endsection