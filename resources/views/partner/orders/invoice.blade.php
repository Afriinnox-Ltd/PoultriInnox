<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Invoice {{ $order->order_number }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #1a1a1a; background: #fff; }

        .page { padding: 40px; }

        /* Header */
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 3px solid #2d3d1f; padding-bottom: 20px; }
        .brand-name { font-size: 22px; font-weight: 700; color: #2d3d1f; letter-spacing: 1px; }
        .brand-tagline { font-size: 10px; color: #6b7280; margin-top: 2px; }
        .invoice-title { text-align: right; }
        .invoice-title h1 { font-size: 26px; font-weight: 800; color: #111827; letter-spacing: 2px; }
        .invoice-title .order-num { font-size: 13px; color: #6b7280; margin-top: 4px; }
        .invoice-title .status-badge { display: inline-block; margin-top: 6px; padding: 2px 10px; border-radius: 4px; background: #dcfce7; color: #2d3d1f; font-weight: 700; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; }

        /* Parties */
        .parties { display: flex; justify-content: space-between; margin-bottom: 28px; gap: 20px; }
        .party-box { flex: 1; }
        .party-label { font-size: 9px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
        .party-name { font-size: 14px; font-weight: 700; color: #111827; }
        .party-detail { font-size: 11px; color: #4b5563; margin-top: 2px; }

        /* Meta info */
        .meta-grid { display: flex; gap: 24px; margin-bottom: 28px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 14px 18px; }
        .meta-item { flex: 1; }
        .meta-key { font-size: 9px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; }
        .meta-val { font-size: 12px; color: #111827; margin-top: 3px; font-weight: 600; }

        /* Items table */
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        thead tr { background: #2d3d1f; color: #fff; }
        thead th { padding: 9px 12px; text-align: left; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
        thead th.right { text-align: right; }
        tbody tr { border-bottom: 1px solid #e5e7eb; }
        tbody tr:nth-child(even) { background: #f9fafb; }
        tbody td { padding: 9px 12px; font-size: 12px; }
        tbody td.right { text-align: right; }
        tbody td.muted { color: #6b7280; font-size: 10px; }
        tfoot tr { background: #f0fdf4; }
        tfoot td { padding: 10px 12px; font-weight: 700; font-size: 13px; }
        tfoot td.right { text-align: right; color: #2d3d1f; }

        /* Notes */
        .notes-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 10px 14px; border-radius: 4px; margin-bottom: 24px; font-size: 11px; color: #1e40af; }
        .notes-label { font-weight: 700; margin-bottom: 3px; }

        /* Footer */
        .footer { margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 14px; display: flex; justify-content: space-between; align-items: flex-end; }
        .footer-note { font-size: 10px; color: #9ca3af; }
        .footer-brand { font-size: 11px; font-weight: 700; color: #2d3d1f; }
        .delivered-stamp { text-align: center; margin: 8px 0; }
        .delivered-stamp span { display: inline-block; border: 2px solid #2d3d1f; color: #2d3d1f; font-size: 11px; font-weight: 800; padding: 4px 16px; border-radius: 4px; letter-spacing: 2px; text-transform: uppercase; transform: rotate(-2deg); }
    </style>
</head>
<body>
<div class="page">

    <!-- Header -->
    <div class="header">
        <div>
            <div class="brand-name">Agriinnox</div>
            <div class="brand-tagline">Buy & Sell Farm Products</div>
        </div>
        <div class="invoice-title">
            <h1>INVOICE</h1>
            <div class="order-num"># {{ $order->order_number }}</div>
            <div class="status-badge">{{ ucfirst($order->status) }}</div>
        </div>
    </div>

    <!-- Parties -->
    <div class="parties">
        <div class="party-box">
            <div class="party-label">Billed To</div>
            <div class="party-name">{{ $order->partner->business_name }}</div>
            @if($order->partner->contact_person)
                <div class="party-detail">{{ $order->partner->contact_person }}</div>
            @endif
            @if($order->partner->phone)
                <div class="party-detail">{{ $order->partner->phone }}</div>
            @endif
            @if($order->partner->address)
                <div class="party-detail">{{ $order->partner->address }}{{ $order->partner->city ? ', ' . $order->partner->city : '' }}</div>
            @endif
            @if($order->partner->country)
                <div class="party-detail">{{ $order->partner->country }}</div>
            @endif
        </div>

        <div class="party-box" style="text-align:right;">
            <div class="party-label">From</div>
            <div class="party-name">Agriinnox</div>
            <div class="party-detail">info@agriinnox.com</div>
            <div class="party-detail">Kigali, Rwanda</div>
        </div>
    </div>

    <!-- Meta -->
    <div class="meta-grid">
        <div class="meta-item">
            <div class="meta-key">Invoice Date</div>
            <div class="meta-val">{{ now()->format('d M Y') }}</div>
        </div>
        <div class="meta-item">
            <div class="meta-key">Order Placed</div>
            <div class="meta-val">{{ $order->created_at->format('d M Y') }}</div>
        </div>
        @if($order->delivered_at)
        <div class="meta-item">
            <div class="meta-key">Delivered On</div>
            <div class="meta-val">{{ $order->delivered_at->format('d M Y') }}</div>
        </div>
        @endif
        <div class="meta-item">
            <div class="meta-key">Payment Status</div>
            <div class="meta-val">{{ ucfirst($order->payment_status) }}</div>
        </div>
        @if($order->delivery_address)
        <div class="meta-item">
            <div class="meta-key">Delivery Address</div>
            <div class="meta-val">{{ $order->delivery_address }}</div>
        </div>
        @endif
    </div>

    <!-- Items table -->
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Item</th>
                <th class="right">Qty</th>
                <th>Unit</th>
                <th class="right">Unit Price ({{ $order->currency }})</th>
                <th class="right">Total ({{ $order->currency }})</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $i => $item)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td>
                    {{ $item->product_name }}
                    @if($item->description)
                        <br><span class="muted">{{ $item->description }}</span>
                    @endif
                    @if($item->vendor)
                        <br><span class="muted">Vendor: {{ $item->vendor->business_name }}</span>
                    @endif
                </td>
                <td class="right">{{ number_format((float)$item->quantity, 2) }}</td>
                <td>{{ $item->unit }}</td>
                <td class="right">
                    @if($item->unit_price)
                        {{ number_format((float)$item->unit_price, 2) }}
                    @else
                        —
                    @endif
                </td>
                <td class="right">
                    @if($item->total_price)
                        {{ number_format((float)$item->total_price, 2) }}
                    @else
                        —
                    @endif
                </td>
            </tr>
            @endforeach
        </tbody>
        @if($order->total_amount)
        <tfoot>
            <tr>
                <td colspan="5" class="right">Total</td>
                <td class="right">{{ $order->currency }} {{ number_format((float)$order->total_amount, 2) }}</td>
            </tr>
        </tfoot>
        @endif
    </table>

    @if($order->admin_notes)
    <div class="notes-box">
        <div class="notes-label">Note from Agriinnox</div>
        {{ $order->admin_notes }}
    </div>
    @endif

    @if($order->partner_notes)
    <div class="notes-box" style="background:#fefce8; border-color:#eab308; color:#713f12;">
        <div class="notes-label">Partner Notes</div>
        {{ $order->partner_notes }}
    </div>
    @endif

    @if($order->status === 'delivered')
    <div class="delivered-stamp">
        <span>&#10003; Delivered</span>
    </div>
    @endif

    <!-- Footer -->
    <div class="footer">
        <div class="footer-note">Thank you for your business. This is a computer-generated invoice.</div>
        <div class="footer-brand">Agriinnox</div>
    </div>

</div>
</body>
</html>
