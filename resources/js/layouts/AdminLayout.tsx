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
    Shield
} from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: BarChart3 },
        { name: 'Feed Templates', href: '/admin/feed-templates', icon: Database },
        { name: 'Smart Scheduling', href: '/admin/smart-scheduling', icon: Shield },
        { name: 'Users', href: '/admin/users', icon: Users },
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
