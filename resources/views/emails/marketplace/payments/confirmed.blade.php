@extends('emails.marketplace.layout')

@section('content')
    <h2>Payment Confirmed! ✅</h2>

    <p>Hello <strong>{{ $order->user->name }}</strong>,</p>

    <p>We've successfully processed your payment for order <strong>#{{ $order->order_number }}</strong>. Thank you for your
        purchase!</p>

    <div class="info-box">
        <p style="margin: 0;"><strong>Payment Summary:</strong></p>
        <p style="margin: 5px 0 0 0;">Order Total: <strong>RWF {{ number_format($order->total_amount, 0) }}</strong></p>
        <p style="margin: 5px 0 0 0;">Payment Method: {{ ucfirst(str_replace('_', ' ', $order->payment_method)) }}</p>
        <p style="margin: 5px 0 0 0;">Transaction ID: {{ $order->payments()->latest()->first()->transaction_id ?? 'N/A' }}
        </p>
    </div>

    <h3 style="color: #1f2937; margin-top: 30px;">What's Next?</h3>
    <p>The vendor has been notified and will begin preparing your items for delivery. You will receive another email once
        your order has been shipped.</p>

    <div style="text-align: center; margin: 30px 0;">
        <a href="{{ config('app.url') }}/orders/{{ $order->id }}" class="button">View Order Status</a>
    </div>

    <p>If you have any questions, please don't hesitate to reach out to our support team.</p>

    <p style="margin-top: 20px;">Thank you for choosing Agriinnox Marketplace!</p>
    <p><strong>The Agriinnox Team</strong></p>
@endsection