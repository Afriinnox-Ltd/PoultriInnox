<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Your Partner Account is Ready</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f5; margin: 0; padding: 0; }
        .wrap { max-width: 600px; margin: 40px auto; background: #fff;  overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
        .header { background: #2d3d1f; padding: 32px 40px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 22px; }
        .header p { color: #2d3d1f; margin: 6px 0 0; font-size: 14px; }
        .body { padding: 32px 40px; color: #374151; font-size: 15px; line-height: 1.6; }
        .creds { background: #f0fdf4; border: 1px solid #2d3d1f;   padding: 16px 20px; margin: 20px 0; }
        .creds p { margin: 4px 0; }
        .creds strong { color: #2d3d1f; }
        .btn { display: inline-block; background: #2d3d1f; color: #fff; text-decoration: none; padding: 12px 28px;   font-weight: bold; margin: 20px 0; }
        .footer { background: #f9fafb; padding: 20px 40px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
<div class="wrap">
    <div class="header">
        <h1>Welcome to the Partner Programme!</h1>
        <p>Your application has been approved</p>
    </div>
    <div class="body">
        <p>Hi <strong>{{ $application->contact_person }}</strong>,</p>
        <p>
            Congratulations! Your partner application for <strong>{{ $application->business_name }}</strong> has been approved.
            We have created a partner account for you. Use the credentials below to log in and start placing orders.
        </p>

        <div class="creds">
            <p><strong>Email:</strong> {{ $application->email }}</p>
            <p><strong>Temporary Password:</strong> {{ $temporaryPassword }}</p>
        </div>

        <p>Please change your password after your first login.</p>

        <a href="{{ $loginUrl }}" class="btn">Log in to Partner Portal</a>

        <p>From your portal you can:</p>
        <ul>
            <li>Place custom orders and track their status</li>
            <li>View and update your business profile</li>
            <li>Download invoices and track payments</li>
        </ul>

        <p>If you have any questions, reply to this email or contact us at <a href="mailto:info@agriinnox.com">info@agriinnox.com</a>.</p>

        <p>Welcome aboard,<br><strong>The Agriinnox Team</strong></p>
    </div>
    <div class="footer">
        &copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
    </div>
</div>
</body>
</html>
