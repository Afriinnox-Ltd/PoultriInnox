import React from 'react';
import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/layouts/guest-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Building2,
    Utensils,
    Hotel,
    ChefHat,
    CheckCircle,
    ClipboardList,
    PackageCheck,
    BadgeCheck,
    Phone,
    Mail,
    ArrowRight,
    ShieldCheck,
    Truck,
    HeartHandshake,
} from 'lucide-react';

const partnerTypes = [
    {
        icon: Hotel,
        label: 'Hotels',
        color: 'bg-emerald-50 text-emerald-600',
        desc: 'Stock your kitchen and banquet hall with fresh poultry, eggs and farm supplies delivered on your schedule.',
    },
    {
        icon: Utensils,
        label: 'Restaurants',
        color: 'bg-emerald-50 text-emerald-600',
        desc: 'Source quality chicken and farm products directly from verified local vendors at wholesale prices.',
    },
    {
        icon: ChefHat,
        label: 'Catering Companies',
        color: 'bg-emerald-50 text-emerald-600',
        desc: 'Place bulk custom orders for events, get dedicated account support and flexible delivery windows.',
    },
    {
        icon: Building2,
        label: 'Other Businesses',
        color: 'bg-emerald-50 text-emerald-600',
        desc: 'Supermarkets, food processors or any business that needs a reliable farm-to-door supply chain.',
    },
];

const benefits = [
    {
        icon: ClipboardList,
        title: 'Custom Order Requests',
        desc: 'Describe exactly what you need — quantities, preferred brands, delivery dates — and our team handles the rest.',
    },
    {
        icon: BadgeCheck,
        title: 'Verified Vendors',
        desc: 'Every supplier on our platform is vetted. You get consistent quality with every order.',
    },
    {
        icon: Truck,
        title: 'Tracked Delivery',
        desc: 'Real-time order status updates from confirmation through delivery so you always know where your order is.',
    },
    {
        icon: ShieldCheck,
        title: 'Dedicated Account Manager',
        desc: 'Get a single point of contact who understands your business needs and helps you re-order effortlessly.',
    },
    {
        icon: HeartHandshake,
        title: 'Flexible Payment Terms',
        desc: 'Discuss payment schedules that work for your cash flow, including partial payments and invoicing.',
    },
    {
        icon: PackageCheck,
        title: 'Order History & Invoices',
        desc: 'Full portal access to view past orders, download invoices and track all your transactions in one place.',
    },
];

const steps = [
    {
        step: '01',
        title: 'Register & Apply',
        desc: 'Create an account and complete your partner profile with your business details.',
    },
    {
        step: '02',
        title: 'Get Verified',
        desc: 'Our team reviews your application and verifies your business within 24 hours.',
    },
    {
        step: '03',
        title: 'Place Your First Order',
        desc: 'Browse products or submit a custom order request directly through your partner portal.',
    },
    {
        step: '04',
        title: 'Receive & Pay',
        desc: 'Track your delivery and settle payment through the portal once goods are received.',
    },
];

export default function PublicPartnersPage() {
    return (
        <GuestLayout>
            <Head title="Partner Programme — Agriinnox" />
            

            {/* Hero */}
            <section className="bg-emerald-600 text-white py-16 px-4 ">
                <div className="max-w-4xl mx-auto text-center">
                   
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                        Supply your business with<br className="hidden md:block" /> farm-fresh quality
                    </h1>
                    <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
                        Hotels, restaurants and catering companies partner with Agriinnox to get reliable, quality poultry and farm products at scale — with full order tracking and dedicated support.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/partners/apply">
                            <Button size="lg" className=" cursor-pointer bg-white text-green-800 hover:bg-green-50 font-semibold w-full sm:w-auto">
                                Apply as a Partner <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                        <Link href="/store">
                            <Button size="lg"  className=" cursor-pointer bg-white text-green-800 hover:bg-green-50 font-semibold w-full sm:w-auto">
                                Browse Products
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Who it's for */}
            <section className="py-16 px-4 bg-gray-50">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Who is it for?</h2>
                    <p className="text-gray-500 text-center mb-10">Any food-service business that sources poultry or farm products regularly.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {partnerTypes.map(({ icon: Icon, label, color, desc }) => (
                            <Card key={label} className="hover:shadow-md transition-shadow">
                                <CardContent className="pt-6 pb-5">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-1">{label}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-16 px-4 bg-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Partner Benefits</h2>
                    <p className="text-gray-500 text-center mb-10">Everything you need to keep your kitchen running smoothly.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {benefits.map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                    <Icon className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-16 px-4 bg-gray-50">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">How it works</h2>
                    <p className="text-gray-500 text-center mb-12">From sign-up to first delivery in four simple steps.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {steps.map(({ step, title, desc }) => (
                            <div key={step} className="text-center">
                                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white text-lg font-bold flex items-center justify-center mx-auto mb-3">
                                    {step}
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Already a partner? */}
            <section className="py-12 px-4 bg-white border-t">
                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Already a partner?</h2>
                        <p className="text-gray-500 mb-4">Log in to your partner portal to place or track orders, view invoices and manage your profile.</p>
                        <Link href="/">
                            <Button className="bg-emerald-700 hover:bg-emerald-800 text-white">
                                Go to Partner Portal <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Have questions?</h2>
                        <p className="text-gray-500 mb-4">Our team is ready to help you get set up or answer any questions about the programme.</p>
                        <div className="flex flex-col gap-2 text-sm text-gray-600">
                            <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-emerald-600" /> info@agriinnox.com</span>
                            <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-emerald-600" /> 
                                +250 795 814 403
                            </span>
                        </div>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
