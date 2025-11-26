

import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    User,
    Building,
    MapPin,
    Globe,
    Phone,
    Mail,
    CreditCard,
    FileText,
    Camera,
    Save,
    ArrowLeft,
    Shield,
    AlertCircle,
    CheckCircle,
    Clock,
    DollarSign,
    TrendingUp,
    Info,
    Calculator
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { MarketplaceSettings } from '@/types/marketplace';
import { formatCurrency } from '@/utils/formatters';

interface PendingPageProps {
    marketplaceSettings: MarketplaceSettings;
    vendor?: {
        id: number;
        business_name: string;
        status: string;
        submitted_at: string;
    };
}

export default function Pending({ marketplaceSettings, vendor }: PendingPageProps) {

 
    const calculateSampleEarnings = (salePrice: number) => {
        const commissionRate = marketplaceSettings?.commission?.rate || 10;
        const platformFee = marketplaceSettings?.platform_fees?.listing_fee || 0;
        const processingFee = marketplaceSettings?.platform_fees?.processing_fee || 0;

        const commission = (salePrice * commissionRate) / 100;
        const totalFees = commission + platformFee + processingFee;
        const netEarnings = salePrice - totalFees;

        return { commission, totalFees, netEarnings };
    };

    return (
        <AppLayout>
            <Head title="Vendor Application Pending" />

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Status Alert */}
                    {/* Status Alert */}
                    {vendor?.status === 'changes_requested' ? (
                        <Alert className="mb-8 border-amber-200 bg-amber-50" variant="default">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-amber-900">
                                <div className="flex flex-col">
                                    <span className="font-semibold text-lg">Changes Requested</span>
                                    <span className="mt-2">We have reviewed your application and some changes are required before we can approve it.</span>
                                    <span className="mt-1 font-medium">Please check your email for detailed feedback on what needs to be updated.</span>
                                    <div className="mt-4">
                                        <Button
                                            variant="outline"
                                            className="bg-white border-amber-200 hover:bg-amber-100 hover:text-amber-900"
                                            onClick={() => window.location.href = '/marketplace/vendor/register'}
                                        >
                                            Update Application
                                        </Button>
                                    </div>
                                </div>
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Alert className="mb-8" variant="default">
                            <Clock className="h-4 w-4" />
                            <AlertDescription>
                                <div className="flex flex-col">
                                    <span className="font-semibold">Application Under Review</span>
                                    <span className="mt-1">Your vendor application is currently being reviewed. This process typically takes 2-3 business days.</span>
                                    <span className="mt-1">You will receive an email notification once your application has been reviewed.</span>
                                    {vendor?.submitted_at && (
                                        <span className="mt-2 text-sm text-gray-600">
                                            Submitted: {new Date(vendor.submitted_at).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* What to Expect Section */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Commission Structure Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-emerald-600" />
                                    Commission Structure
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-gray-50 border p-4 rounded-lg">
                                    <h4 className="font-semibold text-emerald-900  mb-2">How You'll Earn</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Commission Rate:</span>
                                            <span className="font-medium">{marketplaceSettings?.commission?.rate || 10}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Listing Fee:</span>
                                            <span className="font-medium">{formatCurrency(marketplaceSettings?.platform_fees?.listing_fee || 0)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Processing Fee:</span>
                                            <span className="font-medium">{formatCurrency(marketplaceSettings?.platform_fees?.processing_fee || 0)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Sample Earnings Calculator */}
                                <div className="bg-gray-50 border p-4 rounded-lg">
                                    <h4 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                                        <Calculator className="h-4 w-4" />
                                        Sample Earnings
                                    </h4>
                                    {[1000, 5000, 10000].map((price) => {
                                        const earnings = calculateSampleEarnings(price);
                                        return (
                                            <div key={price} className="bg-white p-3 rounded border mb-2 last:mb-0">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-medium">Sale Price: {formatCurrency(price)}</span>
                                                    <Badge variant="default">
                                                        You Earn: {formatCurrency(earnings.netEarnings)}
                                                    </Badge>
                                                </div>
                                                <div className="text-xs text-gray-600 flex justify-between">
                                                    <span>Commission: {formatCurrency(earnings.commission)}</span>
                                                    <span>Total Fees: {formatCurrency(earnings.totalFees)}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Platform Features */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                                    Platform Features
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium">Product Management</p>
                                            <p className="text-sm text-gray-600">Easy-to-use dashboard for managing your products</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium">Order Processing</p>
                                            <p className="text-sm text-gray-600">Streamlined order management and fulfillment</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium">Analytics Dashboard</p>
                                            <p className="text-sm text-gray-600">Track your sales, revenue, and performance</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium">Payment Processing</p>
                                            <p className="text-sm text-gray-600">Secure and reliable payment handling</p>
                                        </div>
                                    </div>

                                    {marketplaceSettings?.payment?.cod_enabled && (
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                                            <div>
                                                <p className="font-medium">Cash on Delivery</p>
                                                <p className="text-sm text-gray-600">Accept COD payments from customers</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Next Steps */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Info className="h-5 w-5 text-emerald-600" />
                                What Happens Next?
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="text-emerald-600 font-bold">1</span>
                                    </div>
                                    <h4 className="font-semibold mb-2">Review Process</h4>
                                    <p className="text-sm text-gray-600">Our team reviews your application and business information</p>
                                </div>

                                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="text-emerald-600 font-bold">2</span>
                                    </div>
                                    <h4 className="font-semibold mb-2">Approval</h4>
                                    <p className="text-sm text-gray-600">You'll receive an email confirmation once approved</p>
                                </div>

                                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="text-emerald-600 font-bold">3</span>
                                    </div>
                                    <h4 className="font-semibold mb-2">Start Selling</h4>
                                    <p className="text-sm text-gray-600">Access your vendor dashboard and add your first product</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Support */}
                    <Card className="mt-6">
                        <CardContent className="p-6">
                            <div className="text-center">
                                <h4 className="font-semibold mb-2">Questions about your application?</h4>
                                <p className="text-gray-600 mb-4">
                                    Our support team is here to help you through the vendor onboarding process.
                                </p>
                                <Button variant="outline">
                                    <a href='mailto:info@afriinnox.com' className='flex'>
                                        <Mail className="h-4 w-4 mr-2" />
                                        Contact Support (info@afriinnox.com)

                                    </a>

                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

