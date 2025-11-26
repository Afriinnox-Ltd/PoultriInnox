@extends('emails.marketplace.layout')

@section('content')
    <h2>Subscription Expiring Soon! ⚠️</h2>

    <p>Hello <strong>{{ $subscription->vendor->business_name }}</strong>,</p>

    <p>This is a friendly reminder that your <strong>{{ $subscription->plan->name ?? 'Marketplace' }}</strong> subscription
        will expire in <strong>{{ $daysLeft }} days</strong> (on
        {{ \Carbon\Carbon::parse($subscription->end_date)->format('F d, Y') }}).</p>

    <div class="info-box">
        <p style="margin: 0;"><strong>Subscription Details:</strong></p>
        <p style="margin: 5px 0 0 0;">Current Plan: {{ $subscription->plan->name ?? 'N/A' }}</p>
        <p style="margin: 5px 0 0 0;">Expiration Date:
            {{ \Carbon\Carbon::parse($subscription->end_date)->format('F d, Y') }}</p>
    </div>

    <p>To ensure uninterrupted access to all marketplace features, including product listings and order processing, please
        renew your subscription or upgrade to a higher plan.</p>

    <div style="text-align: center; margin: 30px 0;">
        <a href="{{ config('app.url') }}/marketplace/vendor/subscriptions" class="button">Renew Subscription</a>
    </div>

    <p>If you have already renewed, please ignore this email.</p>

    <p style="margin-top: 20px;">Thank you for being a valued vendor on Agriinnox Marketplace!</p>
    <p><strong>The Agriinnox Team</strong></p>
@endsection