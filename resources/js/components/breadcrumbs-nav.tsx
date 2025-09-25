import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
    title: string;
    href?: string;
    icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
    showHome?: boolean;
    homeHref?: string;
}

export function Breadcrumbs({ 
    items, 
    className = '', 
    showHome = true,
    homeHref = '/marketplace/vendor/dashboard'
}: BreadcrumbsProps) {
    return (
        <nav className={cn('flex items-center space-x-2 text-sm text-gray-600', className)}>
            {showHome && (
                <>
                    <Link 
                        href={homeHref}
                        className="flex items-center hover:text-gray-900 transition-colors"
                    >
                        <Home className="h-4 w-4" />
                    </Link>
                    {items.length > 0 && (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                </>
            )}
            
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {item.href ? (
                        <Link 
                            href={item.href} 
                            className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                        >
                            {item.icon && <item.icon className="h-4 w-4" />}
                            {item.title}
                        </Link>
                    ) : (
                        <span className="flex items-center gap-1 text-gray-900 font-medium">
                            {item.icon && <item.icon className="h-4 w-4" />}
                            {item.title}
                        </span>
                    )}
                    
                    {index < items.length - 1 && (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
}

// Quick navigation component for common actions
export function QuickNavigation({ className = '' }: { className?: string }) {
    const quickLinks = [
        {
            title: 'Dashboard',
            href: '/marketplace/vendor/dashboard',
            icon: Home,
        },
        {
            title: 'Products',
            href: '/marketplace/vendor/products',
        },
        {
            title: 'Orders',
            href: '/marketplace/vendor/orders',
        },
        {
            title: 'Analytics',
            href: '/marketplace/vendor/analytics',
        },
    ];

    return (
        <div className={cn('flex items-center space-x-4 text-sm', className)}>
            {quickLinks.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                    {link.title}
                </Link>
            ))}
        </div>
    );
}