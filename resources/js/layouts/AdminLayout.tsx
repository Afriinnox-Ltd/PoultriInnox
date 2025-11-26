import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Settings,
    Database,
    Users,
    ShoppingCart,
    BarChart3,
    Menu,
    LogOut,
    Shield,
    DollarSign,
    ChevronRight,
    Crown,
    Package,
    Store,
    ClipboardList,
    LayoutGrid,
    ChevronDownIcon,
    Activity,
    MessageSquare,
    Building2,
} from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import LocaleSwitcher from '@/components/LocaleSwitcher'; 

interface AdminLayoutProps {
    children: React.ReactNode;
}
 
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NavigationItem {
    name: string;
    href: string;
    icon?: React.ComponentType<any>;
    permission?: string | string[];
    subItems?: NavigationItem[];
}

function hasAny(permissions: string[], required: string | string[]): boolean {
    const checks = Array.isArray(required) ? required : [required];
    return checks.some(p => permissions.includes(p));
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { auth } = usePage<{ auth: { user: any; permissions: string[] } }>().props;
    const perms = auth.permissions || [];
    const isAdmin = auth.user?.role === 'admin';

    const can = (permission: string | string[]) => isAdmin || hasAny(perms, permission);

    const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
        marketplace: window.location.pathname.startsWith('/admin/marketplace'),
        subscriptions: window.location.pathname.startsWith('/admin/marketplace/subscription-plans'),
        partners: window.location.pathname.startsWith('/admin/partners'),
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Top-level nav - each item with required permission
    const navigation: NavigationItem[] = [
        { name: 'Dashboard', href: '/admin', icon: BarChart3 },
        { name: 'Feed Templates', href: '/admin/feed-templates', icon: Database, permission: ['view-feed-templates', 'manage-feed-templates'] },
        { name: 'Smart Scheduling', href: '/admin/smart-scheduling', icon: Shield, permission: ['view-protocols', 'manage-protocols'] },
        { name: 'Users', href: '/admin/users', icon: Users, permission: ['view-users', 'create-users', 'edit-users'] },
        { name: 'Roles & Permissions', href: '/admin/roles', icon: Shield, permission: ['manage-roles', 'manage-permissions'] },
        { name: 'Activity Logs', href: '/admin/activity-logs', icon: Activity, permission: ['view-activity-logs'] },
        { name: 'Communication', href: '/admin/communication', icon: MessageSquare },
        { name: 'Modules', href: '/admin/modules', icon: LayoutGrid, permission: ['view-modules', 'manage-modules'] },
    ].filter(item => !item.permission || can(item.permission));

    // Marketplace sub-navigation - filtered by permissions
    const marketplaceNavigation: NavigationItem[] = [
        { name: 'Overview', href: '/admin/marketplace', icon: BarChart3, permission: 'view-marketplace-dashboard' },
        { name: 'Products', href: '/admin/marketplace/products', icon: Package, permission: ['view-products', 'approve-products', 'edit-products'] },
        { name: 'Vendors', href: '/admin/marketplace/vendors', icon: Store, permission: ['view-vendors', 'approve-vendors'] },
        { name: 'Orders', href: '/admin/marketplace/orders', icon: ClipboardList, permission: ['view-orders', 'update-order-status'] },
        { name: 'Categories', href: '/admin/marketplace/categories', icon: LayoutGrid, permission: ['view-categories', 'create-categories', 'edit-categories'] },
        { name: 'Payments', href: '/admin/marketplace/payments', icon: DollarSign, permission: ['view-payments', 'view-financial-analytics', 'manage-vendor-payouts'] },
        {
            name: 'Subscriptions',
            href: '/admin/marketplace/subscriptions',
            icon: Crown,
            permission: ['view-subscriptions', 'create-subscription-plans', 'edit-subscription-plans'],
            subItems: [
                { name: 'Dashboard', href: '/admin/marketplace/subscriptions', permission: 'view-subscriptions' },
                { name: 'Manage Plans', href: '/admin/marketplace/subscription-plans', permission: ['view-subscriptions', 'create-subscription-plans'] },
                { name: 'User Subscriptions', href: '/admin/marketplace/subscription-plans/user-subscriptions', permission: 'assign-user-subscriptions' },
                { name: 'Analytics', href: '/admin/marketplace/subscription-plans/analytics', permission: 'view-subscription-analytics' },
            ].filter(item => !item.permission || can(item.permission)),
        },
        { name: 'Analytics', href: '/admin/marketplace/analytics', icon: BarChart3, permission: 'view-marketplace-analytics' },
        { name: 'Settings', href: '/admin/marketplace/settings', icon: Settings, permission: ['view-marketplace-settings', 'edit-marketplace-settings'] },
    ].filter(item => !item.permission || can(item.permission));

    // Show marketplace section if user has any marketplace-related permission
    const showMarketplace = isAdmin || marketplaceNavigation.length > 0;

    // Partners sub-navigation - filtered by permissions
    const partnerNavigation: NavigationItem[] = [
        { name: 'Applications', href: '/admin/partners/applications',  icon: ClipboardList, permission: ['view-partners', 'approve-partners', 'manage-partners'] },
        { name: 'All Partners',  href: '/admin/partners',              icon: Users,         permission: ['view-partners', 'manage-partners'] },
        { name: 'Orders',        href: '/admin/partners/orders',       icon: Package,       permission: ['view-partner-orders', 'manage-partner-orders', 'manage-partners'] },
        { name: 'Payouts',       href: '/admin/partners/vendor-payouts', icon: DollarSign,  permission: ['view-partner-payouts', 'manage-partner-payouts', 'manage-partners'] },
    ].filter(item => !item.permission || can(item.permission));

    const showPartners = isAdmin || partnerNavigation.length > 0;

    return (
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
                                const Icon = item.icon!;
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
                            {showMarketplace && (
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

                                                if (subItem.subItems && subItem.subItems.length > 0) {
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

                                                const SubIcon = subItem.icon;
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
                                                        {SubIcon && (
                                                            <SubIcon className="mr-3 h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
                                                        )}
                                                        <span className={SubIcon ? '' : 'ml-7'}>
                                                            {subItem.name}
                                                        </span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {showPartners && (
                            <div className="space-y-1">
                                <button
                                    onClick={() => toggleSection('partners')}
                                    className={cn(
                                        'group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md',
                                        window.location.pathname.startsWith('/admin/partners')
                                            ? 'bg-gray-100 text-gray-900'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    )}
                                >
                                    <Building2
                                        className={cn(
                                            'mr-3 h-5 w-5 flex-shrink-0',
                                            window.location.pathname.startsWith('/admin/partners')
                                                ? 'text-gray-500'
                                                : 'text-gray-400 group-hover:text-gray-500'
                                        )}
                                    />
                                    <span className="flex-1 text-left">Partners</span>
                                    <ChevronRight
                                        className={cn(
                                            'ml-auto h-4 w-4 transform transition-transform duration-200',
                                            expandedSections.partners ? 'rotate-90' : ''
                                        )}
                                    />
                                </button>
                                {expandedSections.partners && (
                                    <div className="ml-8 space-y-1">
                                        {partnerNavigation.map((subItem) => {
                                            const SubIcon = subItem.icon;
                                            const isSubActive =
                                                window.location.pathname === subItem.href ||
                                                (subItem.href !== '/admin/partners' && window.location.pathname.startsWith(subItem.href));
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
                                                    {SubIcon && (
                                                        <SubIcon className="mr-3 h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
                                                    )}
                                                    {subItem.name}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            )}
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

                        <div className="flex flex-1 items-end justify-end space-x-4">
                            {/* <LocaleSwitcher /> */}
                            <div className=""> 
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className='flex items-center'>
                                            My account 
                                            <ChevronDownIcon className="ml-1 h-4 w-4" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuGroup>
                                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                            <DropdownMenuItem>
                                                {auth.user?.name
                                                    ? <span className="text-sm font-medium text-gray-700">{auth.user.name}
                                                        ({auth.user.role ? auth.user.role.charAt(0).toUpperCase() + auth.user.role.slice(1) : 'User'})
                                                    </span>
                                                    : <span className="text-sm font-medium text-gray-700">Admin</span>
                                                }
                                            </DropdownMenuItem> 
                                        </DropdownMenuGroup>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem>
                                                <Link
                                                    href="/logout"
                                                    method="post"
                                                    as="button"
                                                    className="flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground"
                                                >
                                                    <LogOut className="h-5 w-5" />
                                                    Log out
                                                </Link></DropdownMenuItem> 
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
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
