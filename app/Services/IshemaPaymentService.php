<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class IshemaPaymentService
{
    protected $apiKey;

    protected $apiUrl;

    protected $callbackUrl;

    protected $currency;

    public function __construct()
    {
        $this->apiKey = config('ishema.api_key');
        $this->apiUrl = config('ishema.api_url');
        $this->callbackUrl = config('ishema.callback_url');
        $this->currency = config('ishema.currency');
    }

    /**
     * Create a new payment transaction
     *
     * @return array
     *
     * @throws Exception
     */
    public function createTransaction(array $data)
    {
        try {
            $payload = [
                'amount' => (int) $data['amount'],
                'callbackUrl' => $data['callbackUrl'] ?? $this->callbackUrl,
                'currency' => $data['currency'] ?? $this->currency,
                'phoneNumber' => $this->formatPhoneNumber($data['phoneNumber']),
                'referenceId' => $data['referenceId'],
                'senderMessage' => $data['senderMessage'] ?? 'Payment for order',
                'transfers' => $data['transfers'] ?? [
                    [
                        'percentage' => (int) config('ishema.transfer_percentage', 100),
                        'phoneNumber' => config('ishema.receiver_phone'),
                        'receiverMessage' => 'Payment received',
                    ],
                ],
            ];

            Log::info('Creating Ishema payment transaction', $payload);

            $response = Http::withHeaders([
                'accept' => 'application/json',
                'Content-Type' => 'application/json',
            ])->post($this->apiUrl.'/transaction?apiKey='.$this->apiKey, $payload);

            if ($response->failed()) {
                Log::error('Ishema payment transaction failed', [
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);
                throw new Exception('Payment transaction failed: '.$response->body());
            }

            $result = $response->json();
            Log::info('Ishema payment transaction created successfully', $result);

            return $result;

        } catch (Exception $e) {
            Log::error('Ishema payment error: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Check transaction status by reference ID
     *
     * @return array
     *
     * @throws Exception
     */
    public function checkTransactionStatus(string $referenceId)
    {
        try {
            $response = Http::withHeaders([
                'accept' => 'application/json',
            ])->get($this->apiUrl.'/transaction/'.$referenceId.'?apiKey='.$this->apiKey);

            if ($response->failed()) {
                Log::error('Failed to check Ishema transaction status', [
                    'referenceId' => $referenceId,
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);
                throw new Exception('Failed to check transaction status');
            }

            return $response->json();

        } catch (Exception $e) {
            Log::error('Ishema status check error: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Format phone number to required format (250XXXXXXXXX)
     *
     * @return string
     */
    protected function formatPhoneNumber(string $phoneNumber)
    {
        // Remove any spaces, dashes, or special characters
        $phoneNumber = preg_replace('/[^0-9]/', '', $phoneNumber);

        // If starts with 0, replace with 250
        if (substr($phoneNumber, 0, 1)== '0') {
            $phoneNumber = '250'.substr($phoneNumber, 1);
        }

        // If doesn't start with 250, add it
        if (substr($phoneNumber, 0, 3) != '250') {
            $phoneNumber = '250'.$phoneNumber;
        }

        return $phoneNumber;
    }

    /**
     * Verify callback authenticity
     *
     * @return bool
     */
    public function verifyCallback(array $callbackData)
    {
        // Add any signature verification logic here if provided by Ishema
        return isset($callbackData['referenceId']) && isset($callbackData['status']);
    }
}
