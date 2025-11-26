@extends('emails.marketplace.layout')

@section('content')
    <h2>Subscription Expired</h2>

    <p>Hello <strong>{{ $subscription->vendor->business_name }}</strong>,</p>

    <p>Your <strong>{{ $subscription->plan->name ?? 'Marketplace' }}</strong> subscription has expired on
        {{ \Carbon\Carbon::parse($subscription->end_date)->format('F d, Y') }}.</p>

    <div class="info-box danger">
        <p style="margin: 0;"><strong>What this means:</strong></p>
        <ul style="margin: 10px 0 0 0; color: #4b5563;">
            <li>Your products are no longer visible to customers</li>
            <li>You cannot receive new orders</li>
            <li>Limited access to vendor dashboard features</li>
        </ul>
    </div>

    <p>Don't worry! All your data and product listings have been saved. You can restore full access immediately by renewing
        your subscription.</p>

    <div style="text-align: center; margin: 30px 0;">
        <a href="{{ config('app.url') }}/marketplace/vendor/subscriptions" class="button danger">Restore Full Access</a>
    </div>

    <p>If you need assistance with renewing your subscription, our support team is here to help.</p>

    <p style="margin-top: 20px;">We hope to see you back soon!</p>
    <p><strong>The Agriinnox Team</strong></p>
@endsection