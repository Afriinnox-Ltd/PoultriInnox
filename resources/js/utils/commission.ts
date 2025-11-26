/**
 * Commission and fee calculation utilities for marketplace
 */

export interface MarketplaceSettings {
    commission: {
        default_commission_rate: number;
        commission_type: 'percentage' | 'fixed';
        min_commission_amount?: number;
        max_commission_amount?: number;
    };
    fees: {
        platform_fee_rate: number;
        transaction_fee_rate: number;
        withdrawal_fee?: number;
    };
    tax: {
        tax_rate: number;
        tax_inclusive: boolean;
    };
    payout?: {
        min_payout_amount: number;
        payout_schedule: string;
        auto_payout_enabled: boolean;
    };
}

export interface CommissionCalculation {
    orderAmount: number;
    commission: number;
    platformFee: number;
    transactionFee: number;
    totalFees: number;
    vendorEarnings: number;
    commissionRate: number;
    commissionType: string;
    taxAmount?: number;
    netVendorEarnings?: number;
}

/**
 * Calculate commission based on marketplace settings
 */
export function calculateCommission(
    amount: number, 
    settings: MarketplaceSettings['commission']
): number {
    if (!settings) {
        return amount * 0.05; // Default 5% commission
    }
    
    let commission = 0;
    
    if (settings.commission_type === 'fixed') {
        commission = settings.default_commission_rate || 0;
    } else {
        commission = (amount * (settings.default_commission_rate || 5)) / 100;
    }
    
    // Apply min/max limits if configured
    if (settings.min_commission_amount && commission < settings.min_commission_amount) {
        commission = settings.min_commission_amount;
    }
    if (settings.max_commission_amount && commission > settings.max_commission_amount) {
        commission = settings.max_commission_amount;
    }
    
    return commission;
}

/**
 * Calculate platform fee
 */
export function calculatePlatformFee(
    amount: number, 
    feeRate: number
): number {
    return (amount * feeRate) / 100;
}

/**
 * Calculate transaction fee
 */
export function calculateTransactionFee(
    amount: number, 
    feeRate: number
): number {
    return (amount * feeRate) / 100;
}

/**
 * Calculate tax amount
 */
export function calculateTax(
    amount: number, 
    taxSettings: MarketplaceSettings['tax']
): number {
    if (taxSettings.tax_inclusive) {
        // Tax is included in the amount
        return (amount * taxSettings.tax_rate) / (100 + taxSettings.tax_rate);
    } else {
        // Tax is added on top
        return (amount * taxSettings.tax_rate) / 100;
    }
}

/**
 * Calculate vendor earnings after all fees and commissions
 */
export function calculateVendorEarnings(
    orderAmount: number, 
    settings: MarketplaceSettings
): CommissionCalculation {
    if (!settings) {
        // Fallback calculation if settings not available
        const commission = orderAmount * 0.05; // 5% default
        const platformFee = orderAmount * 0.02; // 2% default
        const totalFees = commission + platformFee;
        
        return {
            orderAmount,
            commission,
            platformFee,
            transactionFee: 0,
            totalFees,
            vendorEarnings: orderAmount - totalFees,
            commissionRate: 5,
            commissionType: 'percentage'
        };
    }
    
    const commission = calculateCommission(orderAmount, settings.commission);
    const platformFee = calculatePlatformFee(orderAmount, settings.fees?.platform_fee_rate || 0);
    const transactionFee = calculateTransactionFee(orderAmount, settings.fees?.transaction_fee_rate || 0);
    
    const totalFees = commission + platformFee + transactionFee;
    const vendorEarnings = orderAmount - totalFees;
    
    // Calculate tax if needed
    const taxAmount = settings.tax ? calculateTax(orderAmount, settings.tax) : 0;
    const netVendorEarnings = vendorEarnings - (settings.tax?.tax_inclusive ? 0 : taxAmount);
    
    return {
        orderAmount,
        commission,
        platformFee,
        transactionFee,
        totalFees,
        vendorEarnings,
        commissionRate: settings.commission?.default_commission_rate || 5,
        commissionType: settings.commission?.commission_type || 'percentage',
        taxAmount,
        netVendorEarnings
    };
}

/**
 * Calculate vendor take rate as a percentage
 */
export function calculateVendorTakeRate(settings: MarketplaceSettings): number {
    
    if (!settings?.commission) {
        return 95; // Default 95% take rate if settings not available
    }
    
    const totalFeePercentage = 
        (settings.commission.default_commission_rate || 0) + 
        (settings.fees?.platform_fee_rate || 0) + 
        (settings.fees?.transaction_fee_rate || 0);
    
    return 100 - totalFeePercentage;
}

/**
 * Format commission rate for display
 */
export function formatCommissionRate(
    rate: number, 
    type: 'percentage' | 'fixed',
    currency = 'RWF'
): string {
    if (type === 'fixed') {
        return new Intl.NumberFormat('rw-RW', {
            style: 'currency',
            currency: currency
        }).format(rate);
    } else {
        return `${rate}%`;
    }
}

/**
 * Get commission breakdown for display
 */
export function getCommissionBreakdown(
    orderAmount: number,
    settings: MarketplaceSettings
): {
    label: string;
    amount: number;
    percentage: number;
    type: 'commission' | 'platform_fee' | 'transaction_fee' | 'vendor_earnings';
}[] {
    const calculation = calculateVendorEarnings(orderAmount, settings);
    
    return [
        {
            label: 'Commission',
            amount: calculation.commission,
            percentage: (calculation.commission / orderAmount) * 100,
            type: 'commission'
        },
        {
            label: 'Platform Fee',
            amount: calculation.platformFee,
            percentage: (calculation.platformFee / orderAmount) * 100,
            type: 'platform_fee'
        },
        {
            label: 'Transaction Fee',
            amount: calculation.transactionFee,
            percentage: (calculation.transactionFee / orderAmount) * 100,
            type: 'transaction_fee'
        },
        {
            label: 'Vendor Earnings',
            amount: calculation.vendorEarnings,
            percentage: (calculation.vendorEarnings / orderAmount) * 100,
            type: 'vendor_earnings'
        }
    ];
}

/**
 * Check if order meets minimum payout threshold
 */
export function meetsPayoutThreshold(
    amount: number,
    settings: MarketplaceSettings
): boolean {
    if (!settings.payout?.min_payout_amount) return true;
    return amount >= settings.payout.min_payout_amount;
}

/**
 * Calculate estimated payout date based on schedule
 */
export function calculatePayoutDate(
    orderDate: Date,
    schedule: string
): Date {
    const payoutDate = new Date(orderDate);
    
    switch (schedule.toLowerCase()) {
        case 'daily':
            payoutDate.setDate(payoutDate.getDate() + 1);
            break;
        case 'weekly':
            payoutDate.setDate(payoutDate.getDate() + 7);
            break;
        case 'bi-weekly':
            payoutDate.setDate(payoutDate.getDate() + 14);
            break;
        case 'monthly':
            payoutDate.setMonth(payoutDate.getMonth() + 1);
            break;
        default:
            // Default to weekly
            payoutDate.setDate(payoutDate.getDate() + 7);
    }
    
    return payoutDate;
}

/**
 * React hook for commission calculations
 */
export function useCommissionCalculations(settings: MarketplaceSettings | undefined) {
    const calculateEarnings = (orderAmount: number) => 
        calculateVendorEarnings(orderAmount, settings || {} as MarketplaceSettings);
    
    const getBreakdown = (orderAmount: number) => 
        getCommissionBreakdown(orderAmount, settings || {} as MarketplaceSettings);
    
    const getTakeRate = () => 
        calculateVendorTakeRate(settings || {} as MarketplaceSettings);
    
    const formatRate = (rate: number, type: 'percentage' | 'fixed') => 
        formatCommissionRate(rate, type);
    
    const checkPayoutThreshold = (amount: number) => 
        meetsPayoutThreshold(amount, settings || {} as MarketplaceSettings);
    
    const getPayoutDate = (orderDate: Date) => 
        calculatePayoutDate(orderDate, settings?.payout?.payout_schedule || 'weekly');
    
    return {
        calculateEarnings,
        getBreakdown,
        getTakeRate,
        formatRate,
        checkPayoutThreshold,
        getPayoutDate,
        settings
    };
}