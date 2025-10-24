<?php

namespace App\Services;

use App\Models\MarketplaceSetting;

class MarketplaceSettingsService
{
    protected $settings;

    public function __construct()
    {
         \App\Models\MarketplaceSetting::clearCache();
        $this->settings = MarketplaceSetting::getAllGrouped();

    }

    /**
     * Get a specific setting value by group and key
     */
    public function getSetting(string $group, string $key, $default = null)
    {
        if (!isset($this->settings[$group])) {
            return $default;
        }

        foreach ($this->settings[$group] as $setting) {
            // Handle both array and object formats
            $settingKey = is_array($setting) ? $setting['key'] : $setting->key;
            $settingValue = is_array($setting) ? $setting['value'] : $setting->value;

            if ($settingKey === $key) {
                return $settingValue;
            }
        }

        return $default;
    }

    /**
     * Get all settings formatted for frontend use
     */
    public function getFormattedSettings(): array
    {
        return [
            'commission' => [
                'default_commission_rate' => (float) $this->getSetting('commission', 'default_commission_rate'),
                'commission_type' => $this->getSetting('commission', 'commission_type'),
                'min_commission_amount' => (float) $this->getSetting('commission', 'min_commission_amount', 0), // Keep fallback as this might not exist
                'max_commission_amount' => (float) $this->getSetting('commission', 'max_commission_amount', 1000), // Keep fallback as this might not exist
            ],
            'fees' => [
                'platform_fee_rate' => (float) $this->getSetting('platform', 'platform_fee_amount'), // Using platform_fee_amount from actual data
                'transaction_fee_rate' => (float) $this->getSetting('platform', 'transaction_fee_rate', 0), // Keep fallback as this might not exist
                'withdrawal_fee' => (float) $this->getSetting('platform', 'withdrawal_fee', 0), // Keep fallback as this might not exist
                'platform_fee_enabled' => (bool) $this->getSetting('platform', 'platform_fee_enabled'),
            ],
            'tax' => [
                'tax_rate' => (float) $this->getSetting('tax', 'tax_rate'),
                'tax_enabled' => (bool) $this->getSetting('tax', 'tax_enabled'),
                'tax_inclusive' => (bool) $this->getSetting('tax', 'tax_inclusive'),
            ],
            'general' => [
                'currency' => $this->getSetting('general', 'currency'),
                'currency_symbol' => $this->getSetting('general', 'currency_symbol'),
                'platform_name' => $this->getSetting('general', 'platform_name', 'Agriinnox'), // Keep fallback as this might not exist
                'auto_approve_vendors' => (bool) $this->getSetting('general', 'auto_approve_vendors'),
                'auto_approve_products' => (bool) $this->getSetting('general', 'auto_approve_products'),
            ],
            'payout' => [
                'min_payout_amount' => (float) $this->getSetting('payment', 'minimum_payout_amount'), // Using correct key from actual data
                'payment_hold_days' => (int) $this->getSetting('payment', 'payment_hold_days'),
                'payout_schedule' => $this->getSetting('payment', 'payout_schedule', 'weekly'), // Keep fallback as this might not exist
                'auto_payout_enabled' => (bool) $this->getSetting('payment', 'auto_payout_enabled'),
            ],
            'orders' => [
                'auto_complete_days' => (int) $this->getSetting('orders', 'order_auto_complete_days'),
                'allow_cancellation' => (bool) $this->getSetting('orders', 'allow_order_cancellation'),
                'cancellation_window_hours' => (int) $this->getSetting('orders', 'cancellation_window_hours'),
            ],
            'shipping' => [
                'default_cost' => (float) $this->getSetting('shipping', 'default_shipping_cost'),
                'free_shipping_threshold' => (float) $this->getSetting('shipping', 'free_shipping_threshold'),
            ],
        ];
    }

    /**
     * Get commission-specific settings
     */
    public function getCommissionSettings(): array
    {
        return [
            'default_commission_rate' => (float) $this->getSetting('commission', 'default_commission_rate'),
            'commission_type' => $this->getSetting('commission', 'commission_type'),
            'min_commission_amount' => (float) $this->getSetting('commission', 'min_commission_amount', 0), // Keep fallback as this might not exist
            'max_commission_amount' => (float) $this->getSetting('commission', 'max_commission_amount', 1000), // Keep fallback as this might not exist
        ];
    }

    /**
     * Get payment and payout specific settings
     */
    public function getPaymentSettings(): array
    {
        return [
            'min_payout_amount' => (float) $this->getSetting('payment', 'minimum_payout_amount'),
            'payment_hold_days' => (int) $this->getSetting('payment', 'payment_hold_days'),
            'payout_schedule' => $this->getSetting('payment', 'payout_schedule', 'weekly'),
            'auto_payout_enabled' => (bool) $this->getSetting('payment', 'auto_payout_enabled'),
        ];
    }

    /**
     * Get fee-specific settings
     */
    public function getFeeSettings(): array
    {
        return [
            'platform_fee_rate' => (float) $this->getSetting('platform', 'platform_fee_amount'),
            'transaction_fee_rate' => (float) $this->getSetting('platform', 'transaction_fee_rate', 0),
            'withdrawal_fee' => (float) $this->getSetting('platform', 'withdrawal_fee', 0),
            'platform_fee_enabled' => (bool) $this->getSetting('platform', 'platform_fee_enabled'),
        ];
    }

    /**
     * Calculate vendor earnings from order amount
     */
    public function calculateVendorEarnings(float $orderAmount): array
    {
        $commissionSettings = $this->getCommissionSettings();
        $feeSettings = $this->getFeeSettings();

        $commission = 0;
        if ($commissionSettings['commission_type'] === 'fixed') {
            $commission = $commissionSettings['default_commission_rate'];
        } else {
            $commission = ($orderAmount * $commissionSettings['default_commission_rate']) / 100;
        }

        $platformFee = ($orderAmount * $feeSettings['platform_fee_rate']) / 100;
        $transactionFee = ($orderAmount * $feeSettings['transaction_fee_rate']) / 100;

        $totalFees = $commission + $platformFee + $transactionFee;
        $vendorEarnings = $orderAmount - $totalFees;

        return [
            'order_amount' => $orderAmount,
            'commission' => $commission,
            'platform_fee' => $platformFee,
            'transaction_fee' => $transactionFee,
            'total_fees' => $totalFees,
            'vendor_earnings' => max(0, $vendorEarnings), // Ensure non-negative
            'commission_rate' => $commissionSettings['default_commission_rate'],
            'commission_type' => $commissionSettings['commission_type'],
        ];
    }

    /**
     * Refresh settings cache
     */
    public function refreshSettings(): void
    {
        MarketplaceSetting::clearCache();
        $this->settings = MarketplaceSetting::getAllGrouped();
    }

    /**
     * Get currency symbol
     */
    public function getCurrencySymbol(): string
    {
        return $this->getSetting('general', 'currency_symbol');
    }

    /**
     * Get currency code
     */
    public function getCurrency(): string
    {
        return $this->getSetting('general', 'currency');
    }

    /**
     * Check if platform fees are enabled
     */
    public function isPlatformFeeEnabled(): bool
    {
        return (bool) $this->getSetting('platform', 'platform_fee_enabled');
    }

    /**
     * Check if auto payout is enabled
     */
    public function isAutoPayoutEnabled(): bool
    {
        return (bool) $this->getSetting('payment', 'auto_payout_enabled');
    }
}
