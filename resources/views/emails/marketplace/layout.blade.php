<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subject ?? 'Agriinnox Marketplace' }}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f4f4;
            color: #333333;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }

        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 30px 20px;
            text-align: center;
        }

        .header h1 {
            margin: 0;
            color: #ffffff;
            font-size: 24px;
            font-weight: 600;
        }

        .content {
            padding: 40px 30px;
        }

        .content h2 {
            color: #1f2937;
            font-size: 20px;
            margin-top: 0;
            margin-bottom: 20px;
        }

        .content p {
            line-height: 1.6;
            margin-bottom: 15px;
            color: #4b5563;
        }

        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #10b981;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
        }

        .button:hover {
            background-color: #059669;
        }

        .info-box {
            background-color: #f3f4f6;
            border-left: 4px solid #10b981;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
        }

        .footer {
            background-color: #1f2937;
            color: #9ca3af;
            padding: 30px;
            text-align: center;
            font-size: 14px;
        }

        .footer a {
            color: #10b981;
            text-decoration: none;
        }

        .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 30px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        table th {
            background-color: #f9fafb;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
        }

        table td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            color: #4b5563;
        }
    </style>
</head>

<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1>🐔 Agriinnox Marketplace</h1>
        </div>

        <!-- Content -->
        <div class="content">
            @yield('content')
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>Agriinnox Ltd</strong></p>
            <p>Kigali, Kimisagara | Rwanda</p>
            <p>
                <a href="{{ config('app.url') }}">Visit Website</a> |
                <a href="{{ config('app.url') }}/help">Help Center</a> |
                <a href="{{ config('app.url') }}/contact">Contact Us</a>
            </p>
            <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">
                You received this email because you are a member of Agriinnox Marketplace.<br>
                © {{ date('Y') }} Agriinnox Ltd. All rights reserved.
            </p>
        </div>
    </div>
</body>

</html>