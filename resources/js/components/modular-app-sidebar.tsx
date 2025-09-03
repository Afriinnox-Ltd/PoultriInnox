import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Folder,
    LayoutGrid,
    Users,
    Thermometer,
    Calendar,
    BarChart3,
    Package,
    Activity,
    Plus,
    Eye,
    Settings,
    ChevronRight,
    ShoppingCart,
    Heart,
    DollarSign,
    TrendingUp,
    HelpCircle
} from 'lucide-react';
import AppLogo from './app-logo';
import { useMemo } from 'react';

interface Module {
    id: number;
    name: string;
    slug: string;
    description: string;
    icon: string;
    config: {
        features?: string[];
        dashboard_widgets?: string[];
        routes?: {
            prefix: string;
            namespace: string;
        };
    };
}

interface ModularAppSidebarProps {
    enabledModules?: Module[];
}

const iconMap = {
    'package': Package,
    'shopping-cart': ShoppingCart,
    'heart': Heart,
    'dollar-sign': DollarSign,
    'trending-up': TrendingUp,
    'activity': Activity,
    'thermometer': Thermometer,
    'users': Users,
    'calendar': Calendar,
    'bar-chart-3': BarChart3,
    'settings': Settings,
};

const footerNavItems: NavItem[] = [

    {
        title: 'Help',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: HelpCircle,
    },
];

export function ModularAppSidebar({ enabledModules = [] }: ModularAppSidebarProps) {
    const page = usePage();

    const moduleNavigation = useMemo(() => {
        return enabledModules.map((module) => {
            const IconComponent = iconMap[module.icon as keyof typeof iconMap] || Package;

            let subItems: NavItem[] = [];

            // Generate navigation based on module slug
            switch (module.slug) {
                case 'batch-incubator':
                    subItems = [
                        {
                            title: 'Overview',
                            href: '/batch-incubator',
                            icon: Eye,
                        },
                        {
                            title: 'Incubators',
                            href: '/batch-incubator/incubators',
                            icon: Thermometer,
                        },
                        {
                            title: 'Add Incubator',
                            href: '/batch-incubator/incubators/create',
                            icon: Plus,
                        },
                        {
                            title: 'Batches',
                            href: '/batch-incubator/batches',
                            icon: Package,
                        },
                        {
                            title: 'Create Batch',
                            href: '/batch-incubator/batches/create',
                            icon: Plus,
                        },
                        {
                            title: 'Schedules',
                            href: '/batch-incubator/schedules',
                            icon: Calendar,
                        },
                        {
                            title: 'Reports',
                            href: '/batch-incubator/reports',
                            icon: BarChart3,
                        },
                    ];
                    break;
                case 'feed-management':
                    subItems = [
                        {
                            title: 'Inventory',
                            href: '/feed-management/inventory',
                            icon: Package,
                        },
                        {
                            title: 'Feeding Schedules',
                            href: '/feed-management/schedules',
                            icon: Calendar,
                        },
                        {
                            title: 'Consumption Tracking',
                            href: '/feed-management/consumption',
                            icon: BarChart3,
                        },
                    ];
                    break;
                case 'health-management':
                    subItems = [
                        {
                            title: 'Health Records',
                            href: '/health-management/records',
                            icon: Heart,
                        },
                        {
                            title: 'Vaccinations',
                            href: '/health-management/vaccinations',
                            icon: Calendar,
                        },
                        {
                            title: 'Treatments',
                            href: '/health-management/treatments',
                            icon: Settings,
                        },
                    ];
                    break;
                case 'financial-management':
                    subItems = [
                        {
                            title: 'Expenses',
                            href: '/financial-management/expenses',
                            icon: DollarSign,
                        },
                        {
                            title: 'Revenue',
                            href: '/financial-management/revenue',
                            icon: TrendingUp,
                        },
                        {
                            title: 'Reports',
                            href: '/financial-management/reports',
                            icon: BarChart3,
                        },
                    ];
                    break;
                case 'sales-management':
                    subItems = [
                        {
                            title: 'Orders',
                            href: '/sales-management/orders',
                            icon: ShoppingCart,
                        },
                        {
                            title: 'Customers',
                            href: '/sales-management/customers',
                            icon: Users,
                        },
                        {
                            title: 'Analytics',
                            href: '/sales-management/analytics',
                            icon: BarChart3,
                        },
                    ];
                    break;
                default:
                    subItems = [
                        {
                            title: 'Overview',
                            href: `/${module.slug}`,
                            icon: Eye,
                        },
                    ];
            }

            return {
                module,
                icon: IconComponent,
                subItems,
            };
        });
    }, [enabledModules]);

    const isModuleActive = (moduleSlug: string) => {
        return page.url.startsWith(`/${moduleSlug}`);
    };

    const isItemActive = (href: string | { url: string }) => {
        if (typeof href === 'string') {
            return page.url === href || page.url.startsWith(href + '/');
        }
        return page.url === href.url || page.url.startsWith(href.url + '/');
    };

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Dashboard */}
                <SidebarGroup>
                    <SidebarGroupLabel>Main</SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={page.url === dashboard().url}
                                tooltip={{ children: 'Dashboard' }}
                            >
                                <Link href={dashboard()} prefetch>
                                    <LayoutGrid />
                                    <span>Dashboard</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={page.url.startsWith('/modules')}
                                tooltip={{ children: 'Modules' }}
                            >
                                <Link href="/modules" prefetch>
                                    <Settings />
                                    <span>Modules</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>

                {/* Module Navigation */}
                {moduleNavigation.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Modules</SidebarGroupLabel>
                        <SidebarMenu>
                            {moduleNavigation.map(({ module, icon: IconComponent, subItems }) => (
                                <Collapsible
                                    key={module.id}
                                    asChild
                                    defaultOpen={isModuleActive(module.slug)}
                                    className="group/collapsible"
                                >
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton
                                                tooltip={{ children: module.name }}
                                                isActive={isModuleActive(module.slug)}
                                            >
                                                <IconComponent />
                                                <span>{module.name}</span>
                                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {subItems.map((subItem) => (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={isItemActive(subItem.href || '')}
                                                        >
                                                            <Link href={subItem.href} prefetch>
                                                                {subItem.icon && <subItem.icon />}
                                                                <span>{subItem.title}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                )}

                {/* No Modules Message */}
                {moduleNavigation.length === 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Get Started</SidebarGroupLabel>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/modules" prefetch>
                                        <Plus />
                                        <span>Activate Modules</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
