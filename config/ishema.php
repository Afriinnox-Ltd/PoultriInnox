<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Ishema Payment API Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Ishema Payment Gateway (MTN MOMO)
    |
    */

    'api_key' => env('ISHEMA_API_KEY', ''),

    'api_url' => env('ISHEMA_API_URL', 'https://api.payment.ishema.rw/api/v3'),

    'callback_url' => env('ISHEMA_CALLBACK_URL', env('APP_URL').'/payment/callback'),

    'currency' => env('ISHEMA_CURRENCY', 'RWF'),

    // Receiver phone number for payment transfers
    'receiver_phone' => env('ISHEMA_RECEIVER_PHONE', '0789211684'),

    // Transfer percentage (100 means all goes to receiver)
    'transfer_percentage' => env('ISHEMA_TRANSFER_PERCENTAGE', 100),
];
