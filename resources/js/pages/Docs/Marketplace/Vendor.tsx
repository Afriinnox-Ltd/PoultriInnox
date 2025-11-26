import React from 'react';
import { Head } from '@inertiajs/react';
import GuestLayout from '@/layouts/guest-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Store,
    PlusCircle,
    Video,
    ClipboardList,
    Wallet,
    TrendingUp,
    CheckCircle2,
    ArrowRight,
    AlertCircle,
    Package,
    LayoutDashboard,
    BarChart3,
    UserCog,
    CreditCard
} from 'lucide-react';

const sections = [
    {
        title: 'Vendor Dashboard Overview',
        description: 'Your central hub for monitoring store performance and quick actions.',
        icon: LayoutDashboard,
        items: [
            'View real-time stats: Total Products, Total Orders, and Revenue.',
            'Quick access buttons to add products or edit your store profile.',
            'Track your "Take Rate" to understand platform fees and your actual earnings.'
        ],
        image: '/images/docs/vendor_dashboard.png',
        caption: 'The Vendor Dashboard provides a birds-eye view of your entire business.'
    },
    {
        title: 'Product Management',
        description: 'Organize and monitor your entire product catalog in one place.',
        icon: Package,
        items: [
            'Filter products by status: Active, Draft, Pending, or Low Stock.',
            'Search through your inventory by name or category.',
            'View marketplace-wide settings like default commission rates and currency.',
            'Identify which products need restocking at a glance.'
        ],
        image: '/images/docs/vendor_product.png',
        caption: 'Manage your inventory levels and product visibility efficiently.'
    },
    {
        title: 'Create New Product',
        description: 'Step-by-step guide to listing your agricultural equipment.',
        icon: PlusCircle,
        items: [
            'Basic Info: Add clear titles and detailed descriptions using the rich text editor.',
            'Images & Video: Upload high-quality photos and demonstration videos.',
            'Pricing & SEO: Set your price in RWF and optimize for search engines.',
            'Shipping & Details: Specify weight, dimensions, and delivery options.'
        ],
        tip: 'Pro Tip: Products with videos have a 35% higher conversion rate!',
        image: '/images/docs/vendor_product_create.png',
        caption: 'Use this form to create new products for your store.'
    },
    {
        title: 'My Orders',
        description: 'Efficiently process and fulfill customer orders.',
        icon: ClipboardList,
        items: [
            'Filter orders by status: Pending, Processing, Shipped, or Cancelled.',
            'Search for specific orders using order numbers or customer names.',
            'Update shipping status to keep customers informed automatically.',
            'Download order invoices for your own record-keeping.'
        ],
        image: '/images/docs/vendor_orders.png',
        caption: 'Stay on top of your deliveries and customer satisfaction.'
    },
    {
        title: 'Analytics Dashboard',
        description: 'Data-driven insights to help you grow your farm business.',
        icon: BarChart3,
        items: [
            'Visual charts: Track revenue trends and order volume over time.',
            'Product Insights: Identify your top-selling items and underperforming stock.',
            'Earnings Breakdown: See a transparent view of gross revenue vs. platform fees.',
            'Completion Rates: Monitor how many orders are successfully fulfilled.'
        ],
        image: '/images/docs/vendor_analytics.png',
        caption: 'Use detailed analytics to make informed decisions about your inventory.'
    },
    {
        title: 'Payments & Earnings',
        description: 'Manage your finances and request payouts securely.',
        icon: Wallet,
        items: [
            'Real-time Balance: See your current withdrawable earnings.',
            'Payout Requests: Securely request funds once you hit the minimum threshold.',
            'Transaction History: View a detailed log of all sales and commissions.',
            'Tax Management: Monitor tax additions and deductions per transaction.'
        ],
        image: '/images/docs/vendor_earnings.png',
        caption: 'Transparent financial tracking for every sale you make.'
    },
    {
        title: 'Vendor Profile & Settings',
        description: 'Customize your store appearance and business details.',
        icon: UserCog,
        items: [
            'Store Identity: Upload your logo and set a compelling banner image.',
            'Contact Details: Update your business address and phone numbers for delivery.',
            "Financial information: Set up your bank account details and tax information for payouts.",
            "Branding: Update Logo, and banner image.",
            'Store Status: Temporarily close your store for maintenance or holidays.'
        ]
    },
    {
        title: 'Subscription Plans',
        description: 'Scale your business with advanced features and higher limits.',
        icon: CreditCard,
        items: [
            'Manage Plans: View and upgrade your current subscription tier.',
            'Feature Limits: Check your remaining product listing allowance.',
            'Billing History: Access past invoices and manage payment methods.',
            'Unlock Perks: Get access to featured listings and priority support.'
        ], 
        caption: 'Choose the right plan to match your growing business needs.'
    }
];

export default function VendorDocs() {
    return (
        <GuestLayout>
            <Head title="Vendor Guide - Marketplace" />

            <div className="max-w-7xl mx-auto p-6 space-y-8 ">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2 text-emerald-700">Vendor Guide</h1>
                    <p className="text-xl text-muted-foreground">
                        Grow your agribusiness with the Agriinox Marketplace. Here is everything you need to know to succeed as a vendor.
                    </p>
                </div>

                <div className="space-y-6 w-full">
                    {sections.map((section, index) => (
                        <Card key={index} className="relative overflow-hidden  w-full ">
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <div className="bg-emerald-100 p-3 rounded-full">
                                    <section.icon className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">{section.title}</CardTitle>
                                    <CardDescription className="text-base mt-1">
                                        {section.description}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="grid gap-2 ml-14 mb-4">
                                    {section.items.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                {section.tip && (
                                    <div className="ml-14 flex items-center gap-2 text-sm bg-emerald-50 text-emerald-800 p-2 rounded-md border border-emerald-100">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        <span>{section.tip}</span>
                                    </div>
                                )}
                                {section.image && (
                                    <div className="mt-6 ml-14 space-y-2">
                                        <div className="rounded-lg border border-gray-100 overflow-hidden bg-gray-50">
                                            <img
                                                src={section.image}
                                                alt={section.caption}
                                                className="w-full h-auto object-cover max-h-[300px]"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground italic flex items-center gap-1.5">
                                            <ArrowRight className="h-3 w-3" />
                                            {section.caption}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="bg-emerald-500 text-white border-none">
                    <CardHeader>
                        <CardTitle>Ready to start selling?</CardTitle>
                        <CardDescription className="text-emerald-100">
                            Join hundreds of other vendors providing value to the farming community.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <button
                            onClick={() => window.location.href = '/marketplace/vendor/register'}
                            className="bg-white text-emerald-900 px-6 py-2 rounded-md font-semibold flex items-center hover:bg-emerald-50 transition-colors"
                        >
                            Become a Vendor
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </button>
                    </CardContent>
                </Card>
            </div>
        </GuestLayout>
    );
}
