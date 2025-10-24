<?php

use App\Models\MarketplaceSetting;
use App\Models\User;

beforeEach(function () {
    // Seed the settings
    $this->artisan('db:seed', ['--class' => 'MarketplaceSettingsSeeder']);
});

test('admin can view marketplace settings', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    
    $response = $this->actingAs($admin)
        ->get('/admin/marketplace/settings');

    $response->assertStatus(200);
});

test('marketplace setting helper functions work', function () {
    // Test basic setting retrieval
    expect((float) marketplace_setting('default_commission_rate'))->toBe(5.0);
    expect(marketplace_setting('currency'))->toBe('USD');
    expect(marketplace_setting('currency_symbol'))->toBe('$');
    
    // Test with default values
    expect(marketplace_setting('non_existent_key', 'default_value'))->toBe('default_value');
    
    // Test group retrieval
    $taxSettings = marketplace_settings_group('tax');
    expect($taxSettings)->toHaveKey('tax_rate');
    expect($taxSettings)->toHaveKey('tax_enabled');
    
    // Test calculation functions
    expect(marketplace_tax_rate())->toBe(8.25);
    expect(marketplace_commission_rate())->toBe(5.0);
    expect(marketplace_platform_fee())->toBe(2.0);
});

test('calculation functions work correctly', function () {
    // Test tax calculation
    $tax = calculate_order_tax(100.00);
    expect($tax)->toBe(8.25);
    
    // Test commission calculation
    $commission = calculate_vendor_commission(100.00);
    expect($commission)->toBe(5.0);
    
    // Test platform fee calculation
    $platformFee = calculate_platform_fee(100.00);
    expect($platformFee)->toBe(2.0);
    
    // Test vendor payout calculation
    $payout = calculate_vendor_payout(100.00);
    expect($payout['order_amount'])->toBe(100.00);
    expect($payout['commission'])->toBe(5.0);
    expect($payout['platform_fee'])->toBe(2.0);
    expect($payout['vendor_amount'])->toBe(93.0);
});

test('settings can be updated', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    
    $response = $this->actingAs($admin)
        ->put('/admin/marketplace/settings', [
            'settings' => [
                'tax_rate' => '10.0',
                'default_commission_rate' => '7.5',
                'currency' => 'EUR',
            ]
        ]);

    $response->assertRedirect();
    
    // Verify settings were updated
    expect((float) marketplace_setting('tax_rate'))->toBe(10.0);
    expect((float) marketplace_setting('default_commission_rate'))->toBe(7.5);
    expect(marketplace_setting('currency'))->toBe('EUR');
});

test('public settings are accessible', function () {
    $publicSettings = marketplace_settings();
    
    // These should be public
    expect($publicSettings)->toHaveKey('currency');
    expect($publicSettings)->toHaveKey('currency_symbol');
    expect($publicSettings)->toHaveKey('tax_rate');
    
    // These should NOT be public (test may fail if they are public in settings)
    expect($publicSettings)->not()->toHaveKey('default_commission_rate');
    expect($publicSettings)->not()->toHaveKey('platform_fee_amount');
});

test('currency formatting works', function () {
    expect(format_marketplace_currency(123.45))->toBe('$123.45');
    expect(format_marketplace_currency(123.45, false))->toBe('123.45');
});