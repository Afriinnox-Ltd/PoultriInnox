<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>{{ $subject ?? config('app.name', 'Agriinnox') }}</title>
    <style type="text/css">
        /* Reset */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
        body { margin: 0 !important; padding: 0 !important; background-color: #eef2eb; }

        /* Typography helpers used by child templates */
        h2 {
            color: #1a2e0f;
            font-size: 22px;
            font-weight: 700;
            margin: 0 0 20px 0;
            line-height: 1.3;
        }
        h3 {
            color: #1a2e0f;
            font-size: 16px;
            font-weight: 600;
            margin: 28px 0 10px 0;
        }
        p {
            color: #374151;
            font-size: 15px;
            line-height: 1.7;
            margin: 0 0 14px 0;
        }
        ul, ol {
            color: #374151;
            font-size: 15px;
            line-height: 1.8;
            margin: 10px 0 16px 0;
            padding-left: 24px;
        }
        a { color: #39512A; }

        /* Info box */
        .info-box {
            background-color: #f0f7ea;
            border-left: 4px solid #39512A;
            padding: 16px 20px;
            margin: 22px 0;
            border-radius: 6px;
        }
        .info-box p { margin: 0; color: #1a2e0f; font-size: 14px; }
        .info-box p + p { margin-top: 6px; }

        /* Alert box variants */
        .info-box.danger {
            background-color: #fef2f2;
            border-left-color: #ef4444;
        }
        .info-box.danger p { color: #991b1b; }
        .info-box.warning {
            background-color: #fffbeb;
            border-left-color: #f59e0b;
        }
        .info-box.warning p { color: #92400e; }

        /* CTA Button */
        .button {
            display: inline-block;
            padding: 13px 32px;
            background-color: #39512A;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 15px;
            letter-spacing: 0.2px;
            margin: 20px 0;
            border: none;
        }
        .button.danger { background-color: #dc2626; }
        .button.warning { background-color: #d97706; }

        /* Divider */
        .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 28px 0;
            border: none;
        }

        /* Data table */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
            font-size: 14px;
        }
        .data-table th {
            background-color: #f0f7ea;
            padding: 11px 14px;
            text-align: left;
            font-weight: 600;
            color: #1a2e0f;
            border-bottom: 2px solid #c7deb8;
        }
        .data-table td {
            padding: 11px 14px;
            border-bottom: 1px solid #e5e7eb;
            color: #374151;
            vertical-align: top;
        }
        .data-table tr:last-child td { border-bottom: none; }

        /* Badge */
        .badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            background-color: #dcfce7;
            color: #166534;
        }
        .badge.orange { background-color: #ffedd5; color: #9a3412; }
        .badge.red { background-color: #fee2e2; color: #991b1b; }
        .badge.gray { background-color: #f3f4f6; color: #374151; }

        /* Stat block */
        .stat-block {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 16px 20px;
            text-align: center;
            display: inline-block;
        }

        /* Rich text content from editor */
        .rich-content p { color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 12px 0; }
        .rich-content h1, .rich-content h2, .rich-content h3 { color: #1a2e0f; }
        .rich-content ul, .rich-content ol { color: #374151; font-size: 15px; line-height: 1.8; }
        .rich-content a { color: #39512A; }
        .rich-content strong { color: #1a2e0f; }

        @media only screen and (max-width: 620px) {
            .email-card { width: 100% !important; border-radius: 0 !important; }
            .email-card td.body-cell { padding: 28px 20px !important; }
            .email-card td.footer-cell { padding: 24px 20px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #eef2eb; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">

    <!-- Outer wrapper -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
           style="background-color: #eef2eb; padding: 48px 20px;">
        <tr>
            <td align="center" valign="top">

                <!-- Email Card -->
                <table class="email-card" width="600" cellpadding="0" cellspacing="0" border="0" role="presentation"
                       style="max-width: 600px; width: 100%; background-color: #ffffff; 
                              overflow: hidden; ">

                    <!-- ═══════════ HEADER ═══════════ -->
                    <tr>
                        <td style="background: linear-gradient(150deg, #1e3311 0%, #2d4a1e 40%, #39512A 100%); padding: 0;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                                <tr>
                                    <td align="center" style="padding: 36px 40px 28px;">
                                        <!-- Logo circle -->
                                        <!-- <div style="display: inline-block; background: rgba(255,255,255,0.15);
                                                    border-radius: 50%; width: 64px; height: 64px;
                                                    line-height: 64px; text-align: center; font-size: 30px;
                                                    margin-bottom: 14px;">🐔</div> -->
                                        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;
                                                   letter-spacing: -0.3px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                            Agriinnox
                                        </h1>
                                        <p style="margin: 5px 0 0; color: rgba(255,255,255,0.65); font-size: 12px;
                                                  letter-spacing: 2px; text-transform: uppercase; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                            Marketplace Platform
                                        </p>
                                    </td>
                                </tr>
                                <!-- Accent stripe -->
                                <tr>
                                    <td style="height: 4px; background: linear-gradient(90deg, #8bc34a 0%, #39512A 50%, #1b5e20 100%);"></td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- ═══════════ BODY ═══════════ -->
                    <tr>
                        <td class="body-cell" style="padding: 40px 44px 36px; background-color: #ffffff;">
                            @yield('content')
                        </td>
                    </tr>

                    <!-- ═══════════ FOOTER ═══════════ -->
                    <tr>
                        <td class="footer-cell"
                            style="background-color: #1a2e0f; padding: 30px 44px; text-align: center;">
                            <p style="margin: 0 0 6px; color: #ffffff; font-size: 14px; font-weight: 600;
                                      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                               AFRIINNOX Ltd
                            </p>
                            <p style="margin: 0 0 14px; color: rgba(255,255,255,0.5); font-size: 13px;
                                      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                Kigali, Kimisagara &bull; Rwanda
                            </p>
                            <p style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                <a href="{{ config('app.url') }}"
                                   style="color: #8bc34a; text-decoration: none; font-size: 13px; margin: 0 8px;">
                                    Visit Website
                                </a>
                                <span style="color: rgba(255,255,255,0.25);">|</span>
                                <a href="{{ config('app.url') }}/help"
                                   style="color: #8bc34a; text-decoration: none; font-size: 13px; margin: 0 8px;">
                                    Help Center
                                </a>
                                <span style="color: rgba(255,255,255,0.25);">|</span>
                                <a href="mailto:support@agriinnox.com"
                                   style="color: #8bc34a; text-decoration: none; font-size: 13px; margin: 0 8px;">
                                    Contact Us
                                </a>
                            </p>
                        </td>
                    </tr>

                </table>
                <!-- END Email Card -->

                <!-- Copyright note below card -->
                <table width="600" cellpadding="0" cellspacing="0" border="0" role="presentation"
                       style="max-width: 600px; width: 100%; margin-top: 18px;">
                    <tr>
                        <td style="text-align: center; padding: 0 20px 20px;">
                            <p style="color: #6b7280; font-size: 12px; margin: 0; line-height: 1.6;
                                      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                You received this email as a registered member of Agriinnox Marketplace.<br>
                                &copy; {{ date('Y') }} AFRIINNOX Ltd. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>

</body>
</html>