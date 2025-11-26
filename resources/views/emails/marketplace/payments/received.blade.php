@extends('emails.marketplace.layout')

@section('content')
    <h2>Payment Received for Order #{{ $order->order_number }} 💰</h2>

    <p>Hello <strong>{{ $order->vendor->business_name }}</strong>,</p>

    <p>Good news! Your customer, <strong>{{ $order->user->name }}</strong>, has successfully completed the payment for order
        <strong>#{{ $order->order_number }}</strong>.</p>

    <div class="info-box">
        <p style="margin: 0;"><strong>Payment Details:</strong></p>
        <p style="margin: 5px 0 0 0;">Order Total: <strong>RWF {{ number_format($order->total_amount, 0) }}</strong></p>
        <p style="margin: 5px 0 0 0;">Your Share (Estimated): RWF
            {{ number_format($order->payments()->latest()->first()->vendor_amount ?? 0, 0) }}</p>
        <p style="margin: 5px 0 0 0;">Payment Status: <strong>PAID</strong></p>
    </div>

    <h3 style="color: #1f2937; margin-top: 30px;">Action Required</h3>
    <p>Please proceed with fulfilling this order as soon as possible. Processing orders promptly helps maintaining a high
        vendor rating!</p>

    <div style="text-align: center; margin: 30px 0;">
        <a href="{{ config('app.url') }}/marketplace/vendor/orders/{{ $order->id }}" class="button">View Order Details</a>
    </div>

    <p>Once you ship the items, remember to update the order status in your dashboard to keep the customer informed.</p>

    <p style="margin-top: 20px;">Happy Selling!</p>
    <p><strong>The Agriinnox Team</strong></p>
@endsection