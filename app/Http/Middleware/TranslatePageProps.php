<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class TranslatePageProps
{
    /**
     * Keys that should never be translated (IDs, dates, currency codes, etc.)
     */
    private array $skipKeys = [
        'id', 'created_at', 'updated_at', 'deleted_at', 'confirmed_at', 'shipped_at',
        'delivered_at', 'paid_at', 'cancelled_at', 'payment_due_date', 'last_payment_reminder_at',
        'email', 'password', 'token', 'api_key', 'slug', 'url', 'image_path', 'image', 'path',
        'status', 'payment_status', 'currency', 'price', 'total_amount', 'unit_price', 'total_price',
        'vendor_payout', 'stock_quantity', 'quantity', 'order_number', 'tracking_number',
        'delivery_tracking_number', 'phone', 'locale', 'timezone', 'role', 'type',
        'partner_type', 'vendor_type', 'category_id', 'vendor_id', 'product_id', 'user_id',
        'page', 'per_page', 'total', 'last_page', 'current_page', 'from', 'to',
        'component', 'version', 'url', 'asset', 'csrf_token', 'links', 'meta',
    ];

    /**
     * Values matching these patterns are never translated.
     */
    private array $skipPatterns = [
        '/^\d+(\.\d+)?$/',     // pure numbers
        '/^[A-Z]{2,4}$/',      // currency codes / short codes e.g. RWF, USD
        '/^\d{4}-\d{2}-\d{2}/', // date strings
        '/^https?:\/\//',      // URLs
        '/^\//',               // paths
        '/^#[0-9a-fA-F]{3,6}$/', // hex colors
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $locale = session('locale', config('app.locale', 'en'));

        // Only translate Inertia JSON responses when locale is not English
        if ($locale === 'en' || !$request->header('X-Inertia')) {
            return $response;
        }

        $apiKey = config('services.google_translate.key');
        if (!$apiKey) {
            return $response;
        }

        try {
            $content = json_decode($response->getContent(), true);
            if (!isset($content['props'])) {
                return $response;
            }

            $content['props'] = $this->translateArray($content['props'], $locale, $apiKey);
            $response->setContent(json_encode($content));
        } catch (\Throwable $e) {
            Log::warning('TranslatePageProps: ' . $e->getMessage());
        }

        return $response;
    }

    private function translateArray(array $data, string $locale, string $apiKey): array
    {
        $strings = [];
        $paths   = [];
        $this->extract($data, $strings, $paths, '');

        if (empty($strings)) {
            return $data;
        }

        $translated = $this->callGoogleApi($strings, $locale, $apiKey);

        foreach ($paths as $i => $path) {
            data_set($data, $path, $translated[$i] ?? $strings[$i]);
        }

        return $data;
    }

    private function extract(array $data, array &$strings, array &$paths, string $prefix): void
    {
        foreach ($data as $key => $value) {
            $path = $prefix ? "{$prefix}.{$key}" : (string) $key;

            if (in_array($key, $this->skipKeys, true)) {
                continue;
            }

            if (is_string($value)) {
                $trimmed = trim($value);
                if (strlen($trimmed) < 2 || is_numeric($trimmed)) {
                    continue;
                }
                foreach ($this->skipPatterns as $pattern) {
                    if (preg_match($pattern, $trimmed)) {
                        continue 2;
                    }
                }
                $strings[] = $trimmed;
                $paths[]   = $path;
            } elseif (is_array($value)) {
                $this->extract($value, $strings, $paths, $path);
            }
        }
    }

    private function callGoogleApi(array $texts, string $locale, string $apiKey): array
    {
        // Cache translations for 30 days to minimise API costs
        $cacheKey = 'translate_' . $locale . '_' . md5(implode('|||', $texts));

        return Cache::remember($cacheKey, now()->addDays(30), function () use ($texts, $locale, $apiKey) {
            // Google Translation API accepts up to 128 strings per request
            $chunks = array_chunk($texts, 100);
            $result = [];

            foreach ($chunks as $chunk) {
                $response = Http::get('https://translation.googleapis.com/language/translate/v2', [
                    'key'    => $apiKey,
                    'source' => 'en',
                    'target' => $locale,
                    'format' => 'text',
                    'q'      => $chunk,
                ]);

                $translations = $response->json('data.translations') ?? [];
                foreach ($translations as $t) {
                    $result[] = html_entity_decode($t['translatedText'] ?? '', ENT_QUOTES, 'UTF-8');
                }
            }

            return $result;
        });
    }
}
