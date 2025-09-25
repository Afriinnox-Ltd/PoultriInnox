import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    LayoutDashboard, 
    Package, 
    ShoppingCart, 
    DollarSign, 
    Settings, 
    BarChart3,
    User,
    Plus,
    Store,
    MessageSquare,
    Crown,
    ArrowUp
} from 'lucide-react';

interface VendorNavigationItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    isActive?: boolean;
}

interface VendorNavigationProps {
    currentPath?: string;
    variant?: 'horizontal' | 'vertical';
    className?: string;
    showLabels?: boolean;
    needsUpgrade?: boolean;
    currentSubscription?: {
        plan_name: string;
        is_active: boolean;
    } | null;
}

export function VendorNavigation({ 
    currentPath, 
    variant = 'horizontal', 
    className = '',
    showLabels = true,
    needsUpgrade = false,
    currentSubscription
}: VendorNavigationProps) {
    const page = usePage();
    const currentUrl = currentPath || page.url;

    const navigationItems: VendorNavigationItem[] = [
        {
            title: 'Dashboard',
            href: '/marketplace/vendor/dashboard',
            icon: LayoutDashboard,
        },
        {
            title: 'Products',
            href: '/marketplace/vendor/products',
            icon: Package,
        },
        {
            title: 'Orders',
            href: '/marketplace/vendor/orders',
            icon: ShoppingCart,
            badge: 3, // This could be dynamic based on pending orders
        },
        {
            title: 'Analytics',
            href: '/marketplace/vendor/analytics',
            icon: BarChart3,
        },
        {
            title: 'Earnings',
            href: '/marketplace/vendor/payments',
            icon: DollarSign,
        },
        {
            title: 'Profile',
            href: '/marketplace/vendor/profile',
            icon: Settings,
        },
        {
            title: 'Subscription',
            href: '/marketplace/vendor/subscription',
            icon: Crown,
        },
    ];

    const quickActionItems = [
        {
            title: 'Add Product',
            href: '/marketplace/vendor/products/create',
            icon: Plus,
        },
        {
            title: 'View Store',
            href: '/marketplace/vendor/store',
            icon: Store,
        },
        {
            title: 'Messages',
            href: '/marketplace/vendor/messages',
            icon: MessageSquare,
            badge: 2,
        },
    ];

    const isActive = (href: string) => {
        if (href === '/marketplace/vendor/dashboard') {
            return currentUrl === href;
        }
        return currentUrl.startsWith(href);
    };

    if (variant === 'vertical') {
        return (
            <nav className={cn('flex flex-col space-y-2 p-4', className)}>
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Vendor Dashboard</h3>
                    <p className="text-sm text-gray-600">Manage your marketplace presence</p>
                </div>

                {/* Main Navigation */}
                <div className="space-y-1">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Main
                    </h4>
                    {navigationItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                isActive(item.href)
                                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {showLabels && (
                                <>
                                    <span className="flex-1">{item.title}</span>
                                    {item.badge && (
                                        <Badge variant="secondary" className="ml-auto">
                                            {item.badge}
                                        </Badge>
                                    )}
                                </>
                            )}
                        </Link>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="space-y-1 mt-6">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Quick Actions
                    </h4>
                    {quickActionItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <item.icon className="h-5 w-5" />
                            {showLabels && (
                                <>
                                    <span className="flex-1">{item.title}</span>
                                    {item.badge && (
                                        <Badge variant="outline" className="ml-auto">
                                            {item.badge}
                                        </Badge>
                                    )}
                                </>
                            )}
                        </Link>
                    ))}
                </div>
            </nav>
        );
    }

    // Horizontal navigation (default)
    return (
        <nav className={cn('flex items-center space-x-1 p-4 bg-white border-b', className)}>
            {/* Logo/Brand */}
            <div className="flex items-center space-x-2 mr-6">
                <Store className="h-6 w-6 text-blue-600" />
                <span className="font-semibold text-gray-900">Vendor Panel</span>
            </div>

            {/* Main Navigation */}
            <div className="flex items-center space-x-1 flex-1">
                {navigationItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                            isActive(item.href)
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-100'
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {showLabels && <span>{item.title}</span>}
                        {item.badge && (
                            <Badge variant="secondary" className="ml-1">
                                {item.badge}
                            </Badge>
                        )}
                        {isActive(item.href) && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                        )}
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2 ml-auto">
                {/* Subscription Status */}
                {currentSubscription && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
                        <Crown className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{currentSubscription.plan_name}</span>
                        {!currentSubscription.is_active && (
                            <Badge variant="destructive" className="text-xs">Inactive</Badge>
                        )}
                    </div>
                )}

                {/* Upgrade Button */}
                {needsUpgrade && (
                    <Button
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        asChild
                    >
                        <Link href="/marketplace/vendor/subscription/upgrade">
                            <ArrowUp className="h-4 w-4 mr-1" />
                            Upgrade
                        </Link>
                    </Button>
                )}

                {quickActionItems.map((item) => (
                    <Button
                        key={item.href}
                        variant="outline"
                        size="sm"
                        asChild
                        className="relative"
                    >
                        <Link href={item.href}>
                            <item.icon className="h-4 w-4" />
                            {showLabels && <span className="ml-2">{item.title}</span>}
                            {item.badge && (
                                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                                    {item.badge}
                                </Badge>
                            )}
                        </Link>
                    </Button>
                ))}
            </div>
        </nav>
    );
}

// Breadcrumb component specifically for vendor pages
interface VendorBreadcrumbProps {
    items: Array<{
        title: string;
        href?: string;
    }>;
}

export function VendorBreadcrumb({ items }: VendorBreadcrumbProps) {
    return (
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Link href="/marketplace/vendor/dashboard" className="hover:text-gray-900">
                Dashboard
            </Link>
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <span className="text-gray-400">/</span>
                    {item.href ? (
                        <Link href={item.href} className="hover:text-gray-900">
                            {item.title}
                        </Link>
                    ) : (
                        <span className="text-gray-900 font-medium">{item.title}</span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
}

// Mobile-friendly bottom navigation for vendor pages
export function VendorMobileNavigation({ currentPath }: { currentPath?: string }) {
    const page = usePage();
    const currentUrl = currentPath || page.url;

    const mobileNavItems = [
        {
            title: 'Dashboard',
            href: '/marketplace/vendor/dashboard',
            icon: LayoutDashboard,
        },
        {
            title: 'Products',
            href: '/marketplace/vendor/products',
            icon: Package,
        },
        {
            title: 'Orders',
            href: '/marketplace/vendor/orders',
            icon: ShoppingCart,
            badge: 3,
        },
        {
            title: 'Analytics',
            href: '/marketplace/vendor/analytics',
            icon: BarChart3,
        },
        {
            title: 'More',
            href: '/marketplace/vendor/profile',
            icon: User,
        },
    ];

    const isActive = (href: string) => {
        if (href === '/marketplace/vendor/dashboard') {
            return currentUrl === href;
        }
        return currentUrl.startsWith(href);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
            <div className="flex items-center justify-around py-2">
                {mobileNavItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-0',
                            isActive(item.href)
                                ? 'text-blue-600'
                                : 'text-gray-600'
                        )}
                    >
                        <div className="relative">
                            <item.icon className="h-5 w-5" />
                            {item.badge && (
                                <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                                    {item.badge}
                                </Badge>
                            )}
                        </div>
                        <span className="text-xs truncate">{item.title}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}