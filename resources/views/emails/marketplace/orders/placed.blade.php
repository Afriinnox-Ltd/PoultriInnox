@extends('emails.marketplace.layout')

@section('content')
    <h2>Order Confirmation #{{ $order->order_number }} ✅</h2>

    <p>Hello <strong>{{ $order->user->name }}</strong>,</p>

    <p>Thank you for your order! We've received your order and it's being processed.</p>

    <div class="info-box">
        <p style="margin: 0;"><strong>Order Details:</strong></p>
        <p style="margin: 5px 0 0 0;">Order Number: <strong>#{{ $order->order_number }}</strong></p>
        <p style="margin: 5px 0 0 0;">Order Date: {{ $order->created_at->format('F d, Y h:i A') }}</p>
        <p style="margin: 5px 0 0 0;">Status: <strong>{{ ucfirst($order->status) }}</strong></p>
    </div>

    <h3 style="color: #1f2937; margin-top: 30px;">Order Items:</h3>

    <table>
        <thead>
            <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $item)
                <tr>
                    <td>{{ $item->product_name }}</td>
                    <td>{{ $item->quantity }} {{ optional($item->product)->unit_of_measure ?? 'units' }}</td>
                    <td>RWF {{ number_format($item->price, 0) }}</td>
                    <td>RWF {{ number_format($item->price * $item->quantity, 0) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div style="text-align: right; margin-top: 20px;">
        <p style="margin: 5px 0;"><strong>Subtotal:</strong> RWF {{ number_format($order->subtotal, 0) }}</p>
        @if($order->tax_amount > 0)
            <p style="margin: 5px 0;"><strong>Tax:</strong> RWF {{ number_format($order->tax_amount, 0) }}</p>
        @endif
        @if($order->shipping_cost > 0)
            <p style="margin: 5px 0;"><strong>Shipping:</strong> RWF {{ number_format($order->shipping_cost, 0) }}</p>
        @endif
        <p style="margin: 15px 0 0 0; font-size: 18px; color: #10b981;"><strong>Total:</strong> RWF
            {{ number_format($order->total_amount, 0) }}
        </p>
    </div>

    <div class="divider"></div>

    <h3 style="color: #1f2937;">Shipping Address:</h3>
    <p style="color: #4b5563;">
        {{ $order->shipping_address }}<br>
        {{ $order->shipping_city }}, {{ $order->shipping_state }}<br>
        Phone: {{ $order->shipping_phone }}
    </p>

    <a href="{{ config('app.url') }}/orders/{{ $order->id }}" class="button">Track Your Order</a>

    <p style="margin-top: 30px;"><strong>What's Next?</strong></p>
    <p>The vendor will process your order and you'll receive updates via email. You can track your order status anytime from
        your account dashboard.</p>

    <p style="margin-top: 20px;">Thank you for shopping with us!</p>
    <p><strong>The Agriinnox Team</strong></p>
@endsection