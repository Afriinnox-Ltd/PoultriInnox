@extends('emails.marketplace.layout')

@section('content')
    <h2 style="color: #1a2e0f; font-size: 20px; margin: 0 0 20px; font-weight: 700;">
        {{ $subject }}
    </h2>

    <p>Hello <strong>{{ $notifiable->name }}</strong>,</p>
    <p>You have received a new message from the Agriinnox marketplace admin:</p>

    <div class="divider"></div>

    <div class="rich-content">
        {!! $message !!}
    </div>

    <div class="divider"></div>

    <div style="text-align: center; margin: 28px 0;">
        <a href="{{ config('app.url') }}/marketplace/vendor/dashboard" class="button">
            Go to Dashboard
        </a>
    </div>

    <p style="color: #6b7280; font-size: 13px;">
        If you have questions about this message, please contact us at
        <a href="mailto:support@agriinnox.com" style="color: #39512A;">support@agriinnox.com</a>
    </p>
@endsection
