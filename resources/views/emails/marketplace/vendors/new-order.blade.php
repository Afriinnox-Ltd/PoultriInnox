@extends('emails.marketplace.layout')

@section('content')
    <h2>🔔 New Order Received! #{{ $order->order_number }}</h2>

    <p>Hello <strong>{{ $order->vendor->business_name }}</strong>,</p>

    <p>Great news! You've received a new order on Agriinnox Marketplace.</p>

    <div class="info-box">
        <p style="margin: 0;"><strong>Order Information:</strong></p>
        <p style="margin: 5px 0 0 0;">Order Number: <strong>#{{ $order->order_number }}</strong></p>
        <p style="margin: 5px 0 0 0;">Order Date: {{ $order->created_at->format('F d, Y h:i A') }}</p>
        <p style="margin: 5px 0 0 0;">Customer: {{ $order->user->name }}</p>
    </div>

    <h3 style="color: #1f2937; margin-top: 30px;">Order Items:</h3>

    <table>
        <thead>
            <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Quantity</th>
                <th>Price</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $item)
                <tr>
                    <td>{{ $item->product_name }}</td>
                    <td>{{ optional($item->product)->sku ?? 'N/A' }}</td>
                    <td>{{ $item->quantity }} {{ optional($item->product)->unit_of_measure ?? 'units' }}</td>
                    <td>RWF {{ number_format($item->price * $item->quantity, 0) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div style="text-align: right; margin-top: 20px;">
        <p style="margin: 15px 0 0 0; font-size: 18px; color: #10b981;"><strong>Order Total:</strong> RWF
            {{ number_format($order->total_amount, 0) }}
        </p>
    </div>

    <div class="divider"></div>

    <h3 style="color: #1f2937;">Shipping Details:</h3>
    <p style="color: #4b5563;">
        <strong>{{ $order->user->name }}</strong><br>
        {{ $order->shipping_address }}<br>
        {{ $order->shipping_city }}, {{ $order->shipping_state }}<br>
        Phone: {{ $order->shipping_phone }}
    </p>

    <a href="{{ config('app.url') }}/marketplace/vendor/orders/{{ $order->id }}" class="button">View Order Details</a>

    <p style="margin-top: 30px;"><strong>Action Required:</strong></p>
    <ul style="color: #4b5563; line-height: 1.8;">
        <li>Review the order details</li>
        <li>Confirm product availability</li>
        <li>Prepare items for shipment</li>
        <li>Update order status once shipped</li>
    </ul>

    <p style="margin-top: 20px;">Process this order promptly to maintain your vendor rating!</p>
    <p><strong>The Agriinnox Team</strong></p>
@endsection