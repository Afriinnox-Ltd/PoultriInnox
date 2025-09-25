import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { VendorBreadcrumb } from '@/components/vendor-navigation';
import { SubscriptionUpgradeBanner, SubscriptionUsageWidget } from '@/components/subscription-upgrade-navigation';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface VendorLayoutProps {
    children: React.ReactNode;
    title?: string;
    breadcrumbItems?: Array<{
        title: string;
        href?: string;
    }>;
    vendor?: {
        id: number;
        business_name: string;
        status: 'pending' | 'approved' | 'rejected' | 'suspended';
        is_verified: boolean;
        is_active: boolean;
    };
    currentSubscription?: {
        plan_name: string;
        price: number;
        billing_cycle: string;
        start_date: string;
        end_date: string;
        days_remaining: number | null;
        is_active: boolean;
        auto_renew: boolean;
        product_limit: number | null;
        order_limit: number | null;
        allow_cod: boolean;
    } | null;
    subscriptionUsage?: {
        products_used: number;
        products_limit: number | null;
        orders_this_month: number;
        order_limit: number | null;
        usage_percentage: {
            products: number;
            orders: number;
        };
    } | null;
    needsUpgrade?: boolean;
    upgradeReason?: string;
    className?: string;
}

export default function VendorLayout({
    children,
    title = 'Vendor Dashboard',
    breadcrumbItems = [],
    vendor,
    currentSubscription,
    subscriptionUsage,
    needsUpgrade = false,
    upgradeReason,
    className = ''
}: VendorLayoutProps) {
    // Status alerts based on vendor status
    const getStatusAlert = () => {
        if (!vendor) return null;

        switch (vendor.status) {
            case 'pending':
                return (
                    <Alert className="mb-6">
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            Your vendor account is under review. You'll be able to start selling once approved.
                        </AlertDescription>
                    </Alert>
                );
            case 'rejected':
                return (
                    <Alert variant="destructive" className="mb-6">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            Your vendor application was rejected. Please contact support or submit a new application.
                        </AlertDescription>
                    </Alert>
                );
            case 'suspended':
                return (
                    <Alert variant="destructive" className="mb-6">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            Your vendor account has been suspended. Contact support for assistance.
                        </AlertDescription>
                    </Alert>
                );
            default:
                return null;
        }
    };



    return (
        <AppLayout>
            <Head title={title} />
            
            <div className={`min-h-screen bg-gray-50 ${className}`}>
                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Breadcrumbs */}
                    {breadcrumbItems.length > 0 && (
                        <VendorBreadcrumb items={breadcrumbItems} />
                    )}

                    {/* Status Alerts */}
                    {getStatusAlert()}
                    
                    {/* Subscription Upgrade Banner */}
                    <SubscriptionUpgradeBanner
                        currentSubscription={currentSubscription}
                        subscriptionUsage={subscriptionUsage}
                        needsUpgrade={needsUpgrade}
                        upgradeReason={upgradeReason}
                    />

                    {/* Page Content */}
                    {vendor && vendor.status === 'approved' ? (
                        <div className="space-y-6">
                            {children}
                        </div>
                    ) : (
                        <Card className="p-8 text-center">
                            <div className="max-w-md mx-auto">
                                {vendor?.status === 'pending' ? (
                                    <div>
                                        <Info className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            Account Under Review
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            Your vendor application is being reviewed. You'll receive an email once it's approved.
                                        </p>
                                        <div className="bg-gray-50 rounded-lg p-4 text-left">
                                            <p className="text-sm"><strong>Business:</strong> {vendor.business_name}</p>
                                            <p className="text-sm"><strong>Status:</strong> Pending Approval</p>
                                            <p className="text-sm"><strong>Verified:</strong> {vendor.is_verified ? 'Yes' : 'No'}</p>
                                        </div>
                                    </div>
                                ) : vendor?.status === 'rejected' ? (
                                    <div>
                                        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            Application Rejected
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            Unfortunately, your vendor application was not approved. Please contact support for more information.
                                        </p>
                                    </div>
                                ) : vendor?.status === 'suspended' ? (
                                    <div>
                                        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            Account Suspended
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            Your vendor account has been suspended. Please contact support to resolve this issue.
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            Welcome to the Marketplace
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            Start by setting up your vendor profile and adding your first product.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}
                </div>


            </div>
        </AppLayout>
    );
}