@extends('emails.marketplace.layout')

@section('content')
    <h2>{{ $adminMessage->subject }}</h2>

    <p>Hello <strong>{{ $recipient->name }}</strong>,</p>

    <div class="divider"></div>

    <div class="rich-content">
        {!! $adminMessage->body !!}
    </div>

    <div class="divider"></div>

    <div style="text-align: center; margin: 28px 0;">
        <a href="{{ config('app.url') }}/marketplace/vendor/dashboard" class="button">
            Go to Dashboard
        </a>
    </div>

    <p style="color: #6b7280; font-size: 13px;">
        This message was sent to you by the Agriinnox admin team. If you have questions, contact us at
        <a href="mailto:support@agriinnox.com" style="color: #39512A;">support@agriinnox.com</a>
    </p>
@endsection
