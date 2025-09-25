 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; 
import { Progress } from '@/components/ui/progress';
import {
    Calculator, 
    Info, 
    AlertTriangle
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { 
    MarketplaceSettings, 
    CommissionCalculation,
    useCommissionCalculations
} from '@/utils/commission';

interface VendorCommissionCalculatorProps {
    amount: number;
    settings: MarketplaceSettings;
    showBreakdown?: boolean;
    showWarnings?: boolean;
    className?: string;
}

export function VendorCommissionCalculator({
    amount,
    settings,
    showBreakdown = true,
    showWarnings = true,
    className = ''
}: VendorCommissionCalculatorProps) {
    const { calculateEarnings, getBreakdown, getTakeRate } = useCommissionCalculations(settings);
    
    const calculation = calculateEarnings(amount);
    const breakdown = getBreakdown(amount);
    const takeRate = getTakeRate();
    
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center text-sm">
                    <Calculator className="h-4 w-4 mr-2" />
                    Commission Calculator
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-900">
                            {formatCurrency(amount)}
                        </div>
                        <div className="text-xs text-blue-600">Order Amount</div>
                    </div>
                    <div className="text-center p-3 bg-emerald-50 rounded-lg">
                        <div className="text-lg font-bold text-emerald-900">
                            {formatCurrency(calculation.vendorEarnings)}
                        </div>
                        <div className="text-xs text-emerald-600">Your Earnings</div>
                    </div>
                </div>
                
                {/* Take Rate */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Your Take Rate</span>
                    <div className="flex items-center gap-2">
                        <Progress 
                            value={takeRate} 
                            className="w-20 h-2" 
                        />
                        <span className="text-sm font-bold text-emerald-600">
                            {takeRate.toFixed(1)}%
                        </span>
                    </div>
                </div>
                
                {/* Fee Breakdown */}
                {showBreakdown && (
                    <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700">Fee Breakdown</div>
                        {breakdown.map((item) => (
                            <div key={item.type} className="flex justify-between items-center text-sm">
                                <span className={`
                                    ${item.type === 'vendor_earnings' ? 'text-emerald-600 font-medium' : 'text-gray-600'}
                                `}>
                                    {item.label}:
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className={`
                                        ${item.type === 'vendor_earnings' ? 'text-emerald-600 font-bold' : 'text-red-600'}
                                    `}>
                                        {item.type === 'vendor_earnings' ? '' : '-'}
                                        {formatCurrency(item.amount)}
                                    </span>
                                    <span className="text-xs text-gray-500 w-12 text-right">
                                        {item.percentage.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Warnings */}
                {showWarnings && (
                    <div className="space-y-2">
                        {settings.commission.default_commission_rate > 15 && (
                            <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg text-xs">
                                <AlertTriangle className="h-3 w-3 text-yellow-600" />
                                <span className="text-yellow-800">
                                    High commission rate may impact competitiveness
                                </span>
                            </div>
                        )}
                        
                        {calculation.vendorEarnings < (settings.payout?.min_payout_amount || 0) && (
                            <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg text-xs">
                                <Info className="h-3 w-3 text-orange-600" />
                                <span className="text-orange-800">
                                    Below minimum payout threshold of {formatCurrency(settings.payout?.min_payout_amount || 0)}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface VendorCommissionSummaryProps {
    calculation: CommissionCalculation;
    className?: string;
}

export function VendorCommissionSummary({ calculation, className = '' }: VendorCommissionSummaryProps) {
    return (
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 text-xs ${className}`}>
            <div className="text-center p-2 bg-red-50 rounded">
                <div className="font-medium text-red-600">-{formatCurrency(calculation.commission)}</div>
                <div className="text-red-500">Commission</div>
            </div>
            <div className="text-center p-2 bg-orange-50 rounded">
                <div className="font-medium text-orange-600">-{formatCurrency(calculation.platformFee)}</div>
                <div className="text-orange-500">Platform Fee</div>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded">
                <div className="font-medium text-purple-600">-{formatCurrency(calculation.transactionFee)}</div>
                <div className="text-purple-500">Transaction Fee</div>
            </div>
            <div className="text-center p-2 bg-emerald-50 rounded">
                <div className="font-medium text-emerald-600">{formatCurrency(calculation.vendorEarnings)}</div>
                <div className="text-emerald-500">You Receive</div>
            </div>
        </div>
    );
}

interface VendorCommissionInfoProps {
    settings?: MarketplaceSettings;
    showDetails?: boolean;
    className?: string;
}

export function VendorCommissionInfo({ 
    settings, 
    showDetails = false,
    className = '' 
}: VendorCommissionInfoProps) {
    const {  formatRate } = useCommissionCalculations(settings);
 
    
    return (
        <div className={`space-y-3 ${className}`}>
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Marketplace Fees</span>
               
            </div>
            
            {showDetails && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="text-center p-2 border rounded">
                        <div className="font-medium">
                            {formatRate(settings?.commission?.default_commission_rate || 5, settings?.commission?.commission_type || 'percentage')}
                        </div>
                        <div className="text-gray-500">Commission</div>
                    </div>
                    <div className="text-center p-2 border rounded">
                        <div className="font-medium">{settings?.fees?.platform_fee_rate || 2}%</div>
                        <div className="text-gray-500">Platform Fee</div>
                    </div>
                    <div className="text-center p-2 border rounded">
                        <div className="font-medium">{settings?.fees?.transaction_fee_rate || 0}%</div>
                        <div className="text-gray-500">Transaction Fee</div>
                    </div>
                </div>
            )}
        </div>
    );
}