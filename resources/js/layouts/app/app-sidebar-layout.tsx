import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { ModularAppSidebar } from '@/components/modular-app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface PageProps {
    enabledModules?: Array<{
        id: number;
        name: string;
        slug: string;
        description: string;
        icon: string;
        config: any;
    }>;
    [key: string]: any;
}

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { props } = usePage<PageProps>();

    return (
        <AppShell variant="sidebar">
            <ModularAppSidebar enabledModules={props.enabledModules || []} />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
