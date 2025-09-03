import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Package,
  Settings,
  Calendar,
  Activity,
  Eye,
  ChevronRight
} from 'lucide-react';

interface ConnectionCardProps {
  title: string;
  description: string;
  connections: Array<{
    label: string;
    value: string | number;
    href?: string;
    badge?: {
      text: string;
      variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    };
  }>;
  actionLabel?: string;
  actionHref?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export default function ConnectionCard({
  title,
  description,
  connections,
  actionLabel = "View Details",
  actionHref,
  icon: Icon = Activity
}: ConnectionCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {connections.map((connection, index) => (
          <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{connection.label}:</span>
              {connection.href ? (
                <Link
                  href={connection.href}
                  className="text-sm font-medium hover:underline text-blue-600"
                >
                  {connection.value}
                </Link>
              ) : (
                <span className="text-sm font-medium">{connection.value}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {connection.badge && (
                <Badge variant={connection.badge.variant || 'secondary'}>
                  {connection.badge.text}
                </Badge>
              )}
              {connection.href && (
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
          </div>
        ))}

        {actionHref && (
          <div className="pt-2">
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href={actionHref}>
                <Eye className="h-3 w-3 mr-2" />
                {actionLabel}
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface QuickConnectionsProps {
  entityType: 'batch' | 'incubator' | 'schedule';
  entityId: number;
  entityName: string;
  connections?: {
    batches?: Array<{ id: number; name: string; status: string; }>;
    incubators?: Array<{ id: number; name: string; status: string; }>;
    schedules?: Array<{ id: number; title: string; status: string; date: string; }>;
    reports?: Array<{ id: number; name: string; type: string; generated: string; }>;
  };
}

export function QuickConnections({
  entityType,
  entityId,
  entityName,
  connections = {}
}: QuickConnectionsProps) {
  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'batch': return Package;
      case 'incubator': return Settings;
      case 'schedule': return Calendar;
      default: return Activity;
    }
  };

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'operational':
        return 'default';
      case 'pending':
      case 'scheduled':
        return 'secondary';
      case 'error':
      case 'failed':
      case 'maintenance':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Related Batches */}
      {connections.batches && connections.batches.length > 0 && (
        <ConnectionCard
          title="Related Batches"
          description="Batches connected to this entity"
          icon={Package}
          connections={connections.batches.map(batch => ({
            label: "Batch",
            value: batch.name,
            href: `/batch-incubator/batches/${batch.id}`,
            badge: {
              text: batch.status,
              variant: getStatusVariant(batch.status)
            }
          }))}
          actionHref="/batch-incubator/batches"
          actionLabel="View All Batches"
        />
      )}

      {/* Related Incubators */}
      {connections.incubators && connections.incubators.length > 0 && (
        <ConnectionCard
          title="Related Incubators"
          description="Incubators connected to this entity"
          icon={Settings}
          connections={connections.incubators.map(incubator => ({
            label: "Incubator",
            value: incubator.name,
            href: `/batch-incubator/incubators/${incubator.id}`,
            badge: {
              text: incubator.status,
              variant: getStatusVariant(incubator.status)
            }
          }))}
          actionHref="/batch-incubator/incubators"
          actionLabel="View All Incubators"
        />
      )}

      {/* Related Schedules */}
      {connections.schedules && connections.schedules.length > 0 && (
        <ConnectionCard
          title="Related Schedules"
          description="Schedules connected to this entity"
          icon={Calendar}
          connections={connections.schedules.map(schedule => ({
            label: "Schedule",
            value: schedule.title,
            href: `/batch-incubator/schedules/${schedule.id}`,
            badge: {
              text: schedule.status,
              variant: getStatusVariant(schedule.status)
            }
          }))}
          actionHref="/batch-incubator/schedules"
          actionLabel="View All Schedules"
        />
      )}
    </div>
  );
}
