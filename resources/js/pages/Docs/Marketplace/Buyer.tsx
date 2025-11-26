import React from 'react';
import { Head } from '@inertiajs/react';
import GuestLayout from '@/layouts/guest-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Search,
    ShoppingCart,
    CreditCard,
    Package,
    Star,
    CheckCircle2,
    ArrowRight
} from 'lucide-react';

const steps = [
    {
        title: 'Find Products',
        description: 'Use the search bar or category filters to find exactly what you need for your farm.',
        icon: Search,
        items: [
            'Browse by category (Equipment, Feed, Supplements, etc.)',
            'Filter by price range or vendor',
            'Check product ratings and reviews from other farmers'
        ],
        image: '/images/docs/buyer_search.png',
        caption: 'Browsing the marketplace for agricultural supplies.'
    },
    {
        title: 'Add to Cart',
        description: 'Collect all your items in the shopping cart before proceeding to checkout.',
        icon: ShoppingCart,
        items: [
            'Adjust quantities for each item',
            'Remove items you no longer want',
            'View total estimated cost (RWF)'
        ]
    },
    {
        title: 'Secure Checkout',
        description: 'Provide your delivery details and choose a payment method.',
        icon: CreditCard,
        items: [
            'Enter accurate delivery address',
            'Choose your preferred payment method',
            'Review order summary before final payment'
        ],
        image: '/images/docs/buyer_checkout.png',
        caption: 'Reviewing your order and completing payment.'
    },
    {
        title: 'Track Your Order',
        description: 'Stay updated on your order status from fulfillment to delivery.',
        icon: Package,
        items: [
            'View order history in your account',
            'Receive email notifications for status updates',
            'Confirm delivery once you receive your items'
        ]
    },
    {
        title: 'Rate & Review',
        description: 'Help other farmers by sharing your experience with products and vendors.',
        icon: Star,
        items: [
            'Leave a star rating',
            'Write a detailed review of the product',
            'Help the community grow by providing honest feedback'
        ]
    }
];

export default function BuyerDocs() {
    return (
        <GuestLayout>
            <Head title="Buyer Guide - Marketplace" />

            <div className="max-w-7xl mx-auto p-6 space-y-8 pt-36">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2 text-emerald-700">Buyer Guide</h1>
                    <p className="text-xl text-muted-foreground">
                        Welcome to the Agriinox Marketplace! Follow these steps to start shopping for your livestock needs.
                    </p>
                </div>

                <div className="space-y-6">
                    {steps.map((step, index) => (
                        <Card key={index} className="relative overflow-hidden">
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <div className="bg-emerald-100 p-3 rounded-full">
                                    <step.icon className="h-6 w-6 text-emerald-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl flex items-center">
                                        <span className="text-emerald-100 mr-2 font-mono">0{index + 1}</span>
                                        {step.title}
                                    </CardTitle>
                                    <CardDescription className="text-base mt-1">
                                        {step.description}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="grid gap-2 ml-14">
                                    {step.items.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                {step.image && (
                                    <div className="mt-6 ml-14 space-y-2">
                                        <div className="rounded-lg border border-gray-100 overflow-hidden bg-gray-50">
                                            <img
                                                src={step.image}
                                                alt={step.caption}
                                                className="w-full h-auto object-cover max-h-[300px]"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground italic flex items-center gap-1.5">
                                            <ArrowRight className="h-3 w-3" />
                                            {step.caption}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="bg-emerald-900 text-white border-none">
                    <CardHeader>
                        <CardTitle>Ready to get started?</CardTitle>
                        <CardDescription className="text-emerald-100">
                            Head over to the Marketplace and find the best equipment for your farm today.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <button
                            onClick={() => window.location.href = '/marketplace'}
                            className="bg-white text-emerald-900 px-6 py-2 rounded-md font-semibold flex items-center hover:bg-emerald-50 transition-colors"
                        >
                            Go to Marketplace
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </button>
                    </CardContent>
                </Card>
            </div>
        </GuestLayout>
    );
}
