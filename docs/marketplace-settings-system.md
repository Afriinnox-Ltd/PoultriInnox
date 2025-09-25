# Marketplace Settings System Documentation

## Overview

The marketplace settings system provides a flexible way to configure various aspects of your marketplace including:

- **Tax Settings**: Tax rates, tax-inclusive pricing, tax calculation
- **Commission Settings**: Default commission rates, commission types
- **Platform Fees**: Platform fee rates and configuration
- **Payment Settings**: Payment hold periods, auto-payout settings, minimum payout amounts
- **Shipping Settings**: Free shipping thresholds, default shipping costs
- **General Settings**: Currency, auto-approval settings
- **Order Settings**: Cancellation policies, auto-completion settings

## Key Features

### 1. Database Storage
Settings are stored in the `marketplace_settings` table with support for:
- Different data types (string, number, boolean, JSON, select)
- Grouping for organization
- Validation rules
- Public/private settings
- Encrypted sensitive settings
- Sorting for UI display

### 2. Helper Functions
Easy-to-use helper functions for accessing settings:

```php
// Get individual settings
$taxRate = marketplace_tax_rate(); // 8.25
$currency = marketplace_currency(); // USD
$symbol = marketplace_currency_symbol(); // $

// Get setting with default
$setting = marketplace_setting('custom_setting', 'default_value');

// Get settings by group
$taxSettings = marketplace_settings_group('tax');

// Get all public settings
$publicSettings = marketplace_settings();

// Calculation helpers
$tax = calculate_order_tax(100.00); // 8.25
$commission = calculate_vendor_commission(100.00); // 5.0
$payout = calculate_vendor_payout(100.00);
// Returns: ['order_amount' => 100.0, 'commission' => 5.0, 'platform_fee' => 2.0, 'vendor_amount' => 93.0]

// Format currency
$formatted = format_marketplace_currency(123.45); // $123.45
```

### 3. Admin Interface
React-based admin interface (`/admin/marketplace/settings`) with:
- Tabbed interface organized by setting groups
- Appropriate form controls for each data type
- Real-time validation
- Export/import functionality
- Bulk reset options
- Settings caching for performance

### 4. Frontend Integration
Public settings automatically shared with all Inertia pages via MarketplaceServiceProvider:

```typescript
// Available in all React components as props
const { marketplaceSettings } = usePage().props;
const currency = marketplaceSettings.currency; // USD
const taxRate = marketplaceSettings.tax_rate; // 8.25
```

## Default Settings

The system comes pre-configured with sensible defaults:

### Tax Settings
- Tax Rate: 8.25%
- Tax Enabled: true
- Tax Inclusive Pricing: false

### Commission Settings
- Default Commission Rate: 5.0%
- Commission Type: percentage

### Platform Fees
- Platform Fee Enabled: true
- Platform Fee Amount: 2.0%

### Payment Settings
- Payment Hold Days: 7
- Auto Payout: false
- Minimum Payout Amount: $50.00

### Shipping Settings
- Free Shipping Threshold: $100.00
- Default Shipping Cost: $10.00

### General Settings
- Currency: USD
- Currency Symbol: $
- Auto Approve Vendors: false
- Auto Approve Products: false

### Order Settings
- Auto Complete Orders: 7 days
- Allow Order Cancellation: true
- Cancellation Window: 24 hours

## Usage Examples

### In Controllers
```php
use App\Models\MarketplaceSetting;

// Get a setting
$taxRate = marketplace_setting('tax_rate');

// Update a setting
MarketplaceSetting::set('tax_rate', '10.0');

// Calculate fees for an order
$orderAmount = 100.00;
$tax = calculate_order_tax($orderAmount);
$commission = calculate_vendor_commission($orderAmount);
$platformFee = calculate_platform_fee($orderAmount);
$vendorPayout = calculate_vendor_payout($orderAmount);
```

### In Blade Templates
```php
<!-- Access settings -->
{{ marketplace_currency_symbol() }}{{ number_format($price, 2) }}

<!-- Check if free shipping applies -->
@if($orderTotal >= marketplace_free_shipping_threshold())
    <span>Free Shipping!</span>
@endif
```

### In React Components
```typescript
import { usePage } from '@inertiajs/react';

function PriceDisplay({ amount }: { amount: number }) {
    const { marketplaceSettings } = usePage().props;
    
    return (
        <span>
            {marketplaceSettings.currency_symbol}{amount.toFixed(2)}
        </span>
    );
}
```

## Administration

### Accessing Settings
1. Navigate to Admin Panel → Marketplace → Settings
2. Use the tabbed interface to configure different setting groups
3. Save changes to apply immediately with cache invalidation

### Import/Export
- Export current settings as JSON for backup
- Import settings from JSON file for restoration or configuration transfer

### Reset Options
- Reset individual setting groups to defaults
- Reset all settings to defaults
- Maintains data integrity with validation

## Performance

- Settings are cached for 1 hour by default
- Cache automatically invalidates when settings are updated
- Public settings cached separately for frontend performance
- Group-based caching for efficient retrieval

## Security

- Sensitive settings can be marked as encrypted
- Non-public settings are not exposed to frontend
- Validation rules enforced on all updates
- Admin-only access to settings management

## Testing

Comprehensive test suite included:
```bash
./vendor/bin/pest tests/Feature/Marketplace/MarketplaceSettingsTest.php
```

Tests cover:
- Helper function functionality
- Calculation accuracy
- Setting updates and validation
- Public/private setting separation
- Currency formatting
- Cache invalidation