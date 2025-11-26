<?php

if (!function_exists('marketplace_setting')) {
    /**
     * Get a marketplace setting value
     *
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    function marketplace_setting(string $key, $default = null)
    {
        return \App\Models\MarketplaceSetting::get($key, $default);
    }
}

if (!function_exists('marketplace_settings')) {
    /**
     * Get multiple marketplace settings or all public settings
     *
     * @param array|null $keys
     * @return array
     */
    function marketplace_settings(?array $keys = null): array
    {
        if ($keys== null) {
            return \App\Models\MarketplaceSetting::getPublic();
        }

        $settings = [];
        foreach ($keys as $key) {
            $settings[$key] = \App\Models\MarketplaceSetting::get($key);
        }

        return $settings;
    }
}

if (!function_exists('marketplace_settings_group')) {
    /**
     * Get marketplace settings for a specific group
     *
     * @param string $group
     * @return array
     */
    function marketplace_settings_group(string $group): array
    {
        return \App\Models\MarketplaceSetting::getGroup($group);
    }
}

if (!function_exists('marketplace_tax_rate')) {
    /**
     * Get the marketplace tax rate
     *
     * @return float
     */
    function marketplace_tax_rate(): float
    {
        return (float) marketplace_setting('tax_rate', 0);
    }
}

if (!function_exists('marketplace_commission_rate')) {
    /**
     * Get the default marketplace commission rate
     *
     * @return float
     */
    function marketplace_commission_rate(): float
    {
        return (float) marketplace_setting('default_commission_rate', 5.0);
    }
}

if (!function_exists('marketplace_platform_fee')) {
    /**
     * Get the marketplace platform fee
     *
     * @return float
     */
    function marketplace_platform_fee(): float
    {
        if (!marketplace_setting('platform_fee_enabled', true)) {
            return 0;
        }
        
        return (float) marketplace_setting('platform_fee_amount', 2.0);
    }
}

if (!function_exists('marketplace_currency')) {
    /**
     * Get the marketplace currency
     *
     * @return string
     */
    function marketplace_currency(): string
    {
        return marketplace_setting('currency', 'USD');
    }
}

if (!function_exists('marketplace_currency_symbol')) {
    /**
     * Get the marketplace currency symbol
     *
     * @return string
     */
    function marketplace_currency_symbol(): string
    {
        return marketplace_setting('currency_symbol', '$');
    }
}

if (!function_exists('marketplace_free_shipping_threshold')) {
    /**
     * Get the free shipping threshold
     *
     * @return float
     */
    function marketplace_free_shipping_threshold(): float
    {
        return (float) marketplace_setting('free_shipping_threshold', 100.0);
    }
}

if (!function_exists('marketplace_shipping_cost')) {
    /**
     * Get the default shipping cost
     *
     * @return float
     */
    function marketplace_shipping_cost(): float
    {
        return (float) marketplace_setting('default_shipping_cost', 10.0);
    }
}

if (!function_exists('marketplace_auto_approve_vendors')) {
    /**
     * Check if vendors should be auto-approved
     *
     * @return bool
     */
    function marketplace_auto_approve_vendors(): bool
    {
        return (bool) marketplace_setting('auto_approve_vendors', false);
    }
}

if (!function_exists('marketplace_auto_approve_products')) {
    /**
     * Check if products should be auto-approved
     *
     * @return bool
     */
    function marketplace_auto_approve_products(): bool
    {
        return (bool) marketplace_setting('auto_approve_products', false);
    }
}

if (!function_exists('calculate_order_tax')) {
    /**
     * Calculate tax for an order amount
     *
     * @param float $amount
     * @return float
     */
    function calculate_order_tax(float $amount): float
    {
        if (!marketplace_setting('tax_enabled', true)) {
            return 0;
        }

        $taxRate = marketplace_tax_rate();
        $isInclusive = marketplace_setting('tax_inclusive', false);

        if ($isInclusive) {
            return $amount * ($taxRate / (100 + $taxRate));
        }

        return $amount * ($taxRate / 100);
    }
}

if (!function_exists('calculate_vendor_commission')) {
    /**
     * Calculate vendor commission for an order amount
     *
     * @param float $amount
     * @param float|null $customRate
     * @return float
     */
    function calculate_vendor_commission(float $amount, ?float $customRate = null): float
    {
        $rate = $customRate ?? marketplace_commission_rate();
        $type = marketplace_setting('commission_type', 'percentage');

        if ($type== 'fixed') {
            return $rate;
        }

        return $amount * ($rate / 100);
    }
}

if (!function_exists('calculate_platform_fee')) {
    /**
     * Calculate platform fee for an order amount
     *
     * @param float $amount
     * @return float
     */
    function calculate_platform_fee(float $amount): float
    {
        $fee = marketplace_platform_fee();
        return $amount * ($fee / 100);
    }
}

if (!function_exists('calculate_vendor_payout')) {
    /**
     * Calculate vendor payout after commission and platform fees
     *
     * @param float $orderAmount
     * @param float|null $customCommissionRate
     * @return array
     */
    function calculate_vendor_payout(float $orderAmount, ?float $customCommissionRate = null): array
    {
        $commission = calculate_vendor_commission($orderAmount, $customCommissionRate);
        $platformFee = calculate_platform_fee($orderAmount);
        $vendorAmount = $orderAmount - $commission - $platformFee;

        return [
            'order_amount' => $orderAmount,
            'commission' => $commission,
            'platform_fee' => $platformFee,
            'vendor_amount' => max(0, $vendorAmount), // Ensure non-negative
        ];
    }
}

if (!function_exists('format_marketplace_currency')) {
    /**
     * Format an amount with marketplace currency
     *
     * @param float $amount
     * @param bool $showSymbol
     * @return string
     */
    function format_marketplace_currency(float $amount, bool $showSymbol = true): string
    {
        $symbol = $showSymbol ? marketplace_currency_symbol() : '';
        return $symbol . number_format($amount, 2);
    }
}

if (!function_exists('marketplace_payment_hold_days')) {
    /**
     * Get payment hold days
     *
     * @return int
     */
    function marketplace_payment_hold_days(): int
    {
        return (int) marketplace_setting('payment_hold_days', 7);
    }
}

if (!function_exists('marketplace_minimum_payout')) {
    /**
     * Get minimum payout amount
     *
     * @return float
     */
    function marketplace_minimum_payout(): float
    {
        return (float) marketplace_setting('minimum_payout_amount', 50.0);
    }
}

if (!function_exists('can_cancel_order')) {
    /**
     * Check if an order can be cancelled based on settings
     *
     * @param \Carbon\Carbon $orderDate
     * @return bool
     */
    function can_cancel_order(\Carbon\Carbon $orderDate): bool
    {
        if (!marketplace_setting('allow_order_cancellation', true)) {
            return false;
        }

        $windowHours = (int) marketplace_setting('cancellation_window_hours', 24);
        $cutoffTime = $orderDate->addHours($windowHours);

        return now()->lt($cutoffTime);
    }
}