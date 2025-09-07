import React from 'react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Settings,
    Database,
    Users,
    ShoppingCart,
    BarChart3,
    Menu,
    Bell,
    LogOut,
    Shield,
    DollarSign,
    ChevronRight
} from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
        marketplace: window.location.pathname.startsWith('/admin/marketplace')
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: BarChart3 },
        { name: 'Feed Templates', href: '/admin/feed-templates', icon: Database },
        { name: 'Smart Scheduling', href: '/admin/smart-scheduling', icon: Shield },
        { name: 'Users', href: '/admin/users', icon: Users },
    ];

    const marketplaceNavigation = [
        { name: 'Overview', href: '/admin/marketplace' },
        { name: 'Products', href: '/admin/marketplace/products' },
        { name: 'Vendors', href: '/admin/marketplace/vendors' },
        { name: 'Orders', href: '/admin/marketplace/orders' },
        { name: 'Categories', href: '/admin/marketplace/categories' },
        { name: 'Payments', href: '/admin/marketplace/payments' },
        { name: 'Analytics', href: '/admin/marketplace/analytics' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
                <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
                    {/* Logo */}
                    <div className="flex h-16 flex-shrink-0 items-center px-4 border-b border-gray-200">
                        <h1 className="text-xl font-bold text-gray-900">PoultriInnox Admin</h1>
                    </div>

                    {/* Navigation */}
                    <div className="flex flex-1 flex-col overflow-y-auto">
                        <nav className="flex-1 space-y-1 px-2 py-4">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const isActive = window.location.pathname === item.href;

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                                            isActive
                                                ? 'bg-gray-100 text-gray-900'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                'mr-3 h-5 w-5 flex-shrink-0',
                                                isActive
                                                    ? 'text-gray-500'
                                                    : 'text-gray-400 group-hover:text-gray-500'
                                            )}
                                        />
                                        {item.name}
                                    </Link>
                                );
                            })}

                            {/* Marketplace Section */}
                            <div className="space-y-1">
                                <button
                                    onClick={() => toggleSection('marketplace')}
                                    className={cn(
                                        'group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md',
                                        window.location.pathname.startsWith('/admin/marketplace')
                                            ? 'bg-gray-100 text-gray-900'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    )}
                                >
                                    <ShoppingCart
                                        className={cn(
                                            'mr-3 h-5 w-5 flex-shrink-0',
                                            window.location.pathname.startsWith('/admin/marketplace')
                                                ? 'text-gray-500'
                                                : 'text-gray-400 group-hover:text-gray-500'
                                        )}
                                    />
                                    <span className="flex-1 text-left">Marketplace</span>
                                    <ChevronRight
                                        className={cn(
                                            'ml-auto h-4 w-4 transform transition-transform duration-200',
                                            expandedSections.marketplace ? 'rotate-90' : ''
                                        )}
                                    />
                                </button>

                                {expandedSections.marketplace && (
                                    <div className="ml-8 space-y-1">
                                        {marketplaceNavigation.map((subItem) => {
                                            const isSubActive = window.location.pathname === subItem.href ||
                                                (subItem.href !== '/admin/marketplace' && window.location.pathname.startsWith(subItem.href));

                                            return (
                                                <Link
                                                    key={subItem.name}
                                                    href={subItem.href}
                                                    className={cn(
                                                        'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                                                        isSubActive
                                                            ? 'bg-gray-100 text-gray-900'
                                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                    )}
                                                >
                                                    {subItem.name === 'Payments' && (
                                                        <DollarSign className="mr-3 h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
                                                    )}
                                                    <span className={subItem.name === 'Payments' ? '' : 'ml-7'}>
                                                        {subItem.name}
                                                    </span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </nav>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="md:pl-64">
                {/* Top navigation */}
                <div className="sticky top-0 z-10 bg-white shadow">
                    <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-6 w-6" />
                        </Button>

                        <div className="flex items-center space-x-4">
                            <Link href="/logout" method="post" as="button">
                                <Button variant="ghost" size="icon">
                                    <LogOut className="h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="flex-1">
                    <div className="py-6">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>

            <Toaster position="top-right" richColors />
        </div>
    );
}
