import React from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Package,
  Settings,
  Calendar,
  BarChart3,
  Plus,
  Eye
} from 'lucide-react';

interface QuickNavProps {
  currentPage: 'dashboard' | 'batches' | 'incubators' | 'schedules' | 'reports';
  showCreateAction?: boolean;
  createActionLabel?: string;
  createActionHref?: string;
}

export default function QuickNav({
  currentPage,
  showCreateAction = true,
  createActionLabel,
  createActionHref
}: QuickNavProps) {
  const getCreateAction = () => {
    if (!showCreateAction) return null;

    if (createActionLabel && createActionHref) {
      return (
        <Button asChild size="sm">
          <Link href={createActionHref}>
            <Plus className="h-4 w-4 mr-2" />
            {createActionLabel}
          </Link>
        </Button>
      );
    }

    // Default create actions based on current page
    switch (currentPage) {
      case 'batches':
        return (
          <Button asChild size="sm">
            <Link href="/batch-incubator/batches/create">
              <Plus className="h-4 w-4 mr-2" />
              New Batch
            </Link>
          </Button>
        );
      case 'incubators':
        return (
          <Button asChild size="sm">
            <Link href="/batch-incubator/incubators/create">
              <Plus className="h-4 w-4 mr-2" />
              Add Incubator
            </Link>
          </Button>
        );
      case 'schedules':
        return (
          <Button asChild size="sm">
            <Link href="/batch-incubator/schedules/create">
              <Plus className="h-4 w-4 mr-2" />
              New Schedule
            </Link>
          </Button>
        );
      case 'reports':
        return (
          <Button asChild size="sm">
            <Link href="/batch-incubator/reports/generate">
              <Plus className="h-4 w-4 mr-2" />
              Generate Report
            </Link>
          </Button>
        );
      default:
        return null;
    }
  };

  const navItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      href: '/batch-incubator',
      icon: Activity,
    },
    {
      key: 'batches',
      label: 'Batches',
      href: '/batch-incubator/batches',
      icon: Package,
    },
    {
      key: 'incubators',
      label: 'Incubators',
      href: '/batch-incubator/incubators',
      icon: Settings,
    },
    {
      key: 'schedules',
      label: 'Schedules',
      href: '/batch-incubator/schedules',
      icon: Calendar,
    },
    {
      key: 'reports',
      label: 'Reports',
      href: '/batch-incubator/reports',
      icon: BarChart3,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {navItems
        .filter(item => item.key !== currentPage)
        .map(item => {
          const Icon = item.icon;
          return (
            <Button key={item.key} asChild size="sm" variant="outline">
              <Link href={item.href}>
                <Icon className="h-4 w-4 mr-2" />
                {item.label}
              </Link>
            </Button>
          );
        })}
      {getCreateAction()}
    </div>
  );
}
