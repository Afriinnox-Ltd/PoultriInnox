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
    ChevronRight,
    Crown
} from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';

interface AdminLayoutProps {
    children: React.ReactNode;
}

interface NavigationItem {
    name: string;
    href: string;
    icon?: React.ComponentType<any>;
    hasSubMenu?: boolean;
    subItems?: Array<{
        name: string;
        href: string;
    }>;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
        marketplace: window.location.pathname.startsWith('/admin/marketplace'),
        subscriptions: window.location.pathname.startsWith('/admin/marketplace/subscription-plans')
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
        { name: 'Modules', href: '/admin/modules', icon: Users },
    ];

    const subscriptionSubNavigation = [
        { name: 'Dashboard', href: '/admin/marketplace/subscriptions' },
        { name: 'Manage Plans', href: '/admin/marketplace/subscription-plans' },
        { name: 'User Subscriptions', href: '/admin/marketplace/subscription-plans/user-subscriptions' },
        { name: 'Analytics', href: '/admin/marketplace/subscription-plans/analytics' },
    ];

    const marketplaceNavigation: NavigationItem[] = [
        { name: 'Overview', href: '/admin/marketplace' },
        { name: 'Products', href: '/admin/marketplace/products' },
        { name: 'Vendors', href: '/admin/marketplace/vendors' },
        { name: 'Orders', href: '/admin/marketplace/orders' },
        { name: 'Categories', href: '/admin/marketplace/categories' },
        { name: 'Payments', href: '/admin/marketplace/payments' },
        {
            name: 'Subscriptions',
            href: '/admin/marketplace/subscriptions',
            icon: Crown,
            subItems: subscriptionSubNavigation,
        },
        { name: 'Analytics', href: '/admin/marketplace/analytics' },
        {
            name: 'Settings',
            href: '/admin/marketplace/settings',
            icon: Settings
        },
    ];    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
                <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
                    {/* Logo */}
                    <div className="flex h-16 flex-shrink-0 items-center px-4 border-b border-gray-200">
                        <h1 className="text-xl font-bold text-gray-900">Agriinnox Admin</h1>
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

                                            if (subItem.subItems && subItem.name === 'Subscriptions') {
                                                const SubItemIcon = subItem.icon || Crown;
                                                return (
                                                    <div key={subItem.name} className="space-y-1">
                                                        <button
                                                            onClick={() => toggleSection('subscriptions')}
                                                            className={cn(
                                                                'group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md',
                                                                window.location.pathname.startsWith('/admin/marketplace/subscription')
                                                                    ? 'bg-gray-100 text-gray-900'
                                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                            )}
                                                        >
                                                            <SubItemIcon className="mr-3 h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
                                                            <span className="flex-1 text-left">{subItem.name}</span>
                                                            <ChevronRight
                                                                className={cn(
                                                                    'ml-auto h-3 w-3 transform transition-transform duration-200',
                                                                    expandedSections.subscriptions ? 'rotate-90' : ''
                                                                )}
                                                            />
                                                        </button>

                                                        {expandedSections.subscriptions && (
                                                            <div className="ml-6 space-y-1">
                                                                {subItem.subItems.map((subSubItem) => {
                                                                    const isSubSubActive = window.location.pathname === subSubItem.href;

                                                                    return (
                                                                        <Link
                                                                            key={subSubItem.name}
                                                                            href={subSubItem.href}
                                                                            className={cn(
                                                                                'group flex items-center px-2 py-1 text-xs font-medium rounded-md',
                                                                                isSubSubActive
                                                                                    ? 'bg-gray-100 text-gray-900'
                                                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                                            )}
                                                                        >
                                                                            <span className="ml-7">{subSubItem.name}</span>
                                                                        </Link>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            }

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
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
                            >
                                <LogOut className="h-5 w-5" />
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

            <Toaster position="bottom-right" richColors />
        </div>
    );
}
