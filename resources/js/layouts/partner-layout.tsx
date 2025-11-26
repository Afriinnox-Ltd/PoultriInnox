import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import WelcomeNav from '@/components/navigation/WelcomeNav';
import Footer from '@/components/marketplace/Footer';
import { Toaster } from '@/components/ui/sonner';
import { type SharedData } from '@/types';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import {
    LayoutDashboard,
    ShoppingBag,
    User,
    LogOut,
    Building2,
    CheckCircle,
} from 'lucide-react';

interface Props {
    children: React.ReactNode;
    profile?: {
        business_name: string;
        partner_type: string;
        is_verified: boolean;
    };
}

const navItems = [
    { href: '/partner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/partner/orders',    label: 'My Orders',  icon: ShoppingBag },
    { href: '/partner/profile',   label: 'Profile',    icon: User },
];

export default function PartnerLayout({ children, profile }: Props) {
    const { auth } = usePage<SharedData>().props;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top nav */}
            <header className="bg-white border-b sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-emerald-600" />
                        <span className="font-bold text-gray-900 text-sm">
                            {profile?.business_name ?? 'Partner Portal'}
                        </span>
                        {profile?.is_verified && (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                <CheckCircle className="w-3 h-3" /> Verified
                            </span>
                        )}
                    </div>
                    <nav className="flex items-center gap-1">
                        {navItems.map(({ href, label, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            >
                                <Icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{label}</span>
                            </Link>
                        ))}
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-1"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </Link>
                    </nav>
                    {/* <LocaleSwitcher /> */}
                </div>
            </header>

            <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
                {children}
            </main>

            <footer className="border-t bg-white py-4 text-center text-xs text-gray-400">
                &copy; {new Date().getFullYear()} Agriinnox — Partner Portal
            </footer>

            <Toaster position="bottom-right" richColors />
        </div>
    );
}
