import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Package,
  Activity,
  TrendingUp,
  Users,
  Thermometer,
  Droplet,
  AlertTriangle,
  Calendar,
  Clock,
  Eye,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Link, Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

// Simple Progress component
const Progress = ({ value, className }: { value: number; className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div
      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Batch Incubator',
        href: '/batch-incubator',
    },
];

interface BatchIncubatorIndexProps {
  batchStats?: {
    total_batches: number;
    active_batches: number;
    total_birds: number;
    daily_production: number;
    average_survival_rate: number;
  };
  incubatorStats?: {
    total_incubators: number;
    active_incubators: number;
    idle_incubators: number;
    total_capacity: number;
    current_utilization: number;
    average_temperature: number;
    average_humidity: number;
  };
  recentBatches?: Array<{
    id: number;
    batch_code: string;
    name: string;
    status: {
      value: string;
      label: string;
      color: string;
    };
    current_count: number;
    age_days: number;
  }>;
  incubatorOverview?: Array<{
    id: number;
    name: string;
    status: {
      value: string;
      label: string;
      color: string;
    };
    utilization: number;
  }>;
  alerts?: Array<{
    type: string;
    title: string;
    message: string;
    priority: string;
    color: string;
    date?: string;
  }>;
  upcomingSchedules?: Array<{
    id: number;
    title: string;
    batch_name: string;
    scheduled_date: string;
    priority: string;
    assigned_to: string;
  }>;
}

export default function BatchIncubatorIndex({
  batchStats,
  incubatorStats,
  recentBatches,
  incubatorOverview,
  alerts,
  upcomingSchedules
}: BatchIncubatorIndexProps) {

  const utilizationRate = incubatorStats && incubatorStats.total_capacity > 0
    ? Math.round((incubatorStats.current_utilization / incubatorStats.total_capacity) * 100)
    : 0;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Batch Incubator - Overview" />
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Batch Incubator Overview</h1>
            <p className="text-muted-foreground">
              Complete poultry batch and incubator management system
            </p>
          </div>
        </div>

        {/* Statistics Overview */}
        {batchStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{batchStats.active_batches}</div>
                <p className="text-xs text-muted-foreground">
                  Total: {batchStats.total_batches} batches
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Birds</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{batchStats.total_birds?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Survival rate: {batchStats.average_survival_rate?.toFixed(1) || 0}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Production</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{batchStats.daily_production || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Eggs per day
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Incubator Utilization</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{utilizationRate}%</div>
                <Progress value={utilizationRate} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {incubatorStats?.active_incubators || 0}/{incubatorStats?.total_incubators || 0} active
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button asChild variant="outline" className="h-auto p-4">
                <Link href="/batch-incubator/batches/create">
                  <div className="text-center">
                    <Plus className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <p className="font-medium">Create New Batch</p>
                    <p className="text-xs text-muted-foreground">Start a new incubation cycle</p>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-auto p-4">
                <Link href="/batch-incubator/incubators/create">
                  <div className="text-center">
                    <Plus className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p className="font-medium">Add Incubator</p>
                    <p className="text-xs text-muted-foreground">Configure new equipment</p>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-auto p-4">
                <Link href="/batch-incubator/batches">
                  <div className="text-center">
                    <Eye className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <p className="font-medium">View All Batches</p>
                    <p className="text-xs text-muted-foreground">Manage existing batches</p>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-auto p-4">
                <Link href="/batch-incubator/incubators">
                  <div className="text-center">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                    <p className="font-medium">Monitor Incubators</p>
                    <p className="text-xs text-muted-foreground">Check equipment status</p>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Module Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Batch Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Batch Management
              </CardTitle>
              <CardDescription>
                Comprehensive batch lifecycle management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Recent Batches</p>
                    <div className="space-y-2 mt-2">
                      {recentBatches && recentBatches.length > 0 ? (
                        recentBatches.slice(0, 3).map((batch) => (
                          <div key={batch.id} className="flex items-center justify-between">
                            <span className="text-muted-foreground">{batch.name}</span>
                            <Badge
                              variant="secondary"
                              className={`bg-${batch.status.color}-100 text-${batch.status.color}-700`}
                            >
                              {batch.status.label}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-2 text-muted-foreground text-sm">
                          No batches found
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">Environment</p>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1">
                          <Thermometer className="h-3 w-3" />
                          <span className="text-sm">{incubatorStats?.average_temperature?.toFixed(1) || 0}°C</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Droplet className="h-3 w-3" />
                          <span className="text-sm">{incubatorStats?.average_humidity?.toFixed(1) || 0}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button asChild size="sm">
                    <Link href="/batch-incubator/batches">
                      <Eye className="h-4 w-4 mr-2" />
                      View All
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/batch-incubator/batches/create">
                      <Plus className="h-4 w-4 mr-2" />
                      New Batch
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Incubator Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Incubator Management
              </CardTitle>
              <CardDescription>
                Monitor and control your incubation equipment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Incubator Status</p>
                    <div className="space-y-2 mt-2">
                      {incubatorOverview && incubatorOverview.length > 0 ? (
                        incubatorOverview.slice(0, 3).map((incubator) => (
                          <div key={incubator.id} className="flex items-center justify-between">
                            <span className="text-muted-foreground">{incubator.name}</span>
                            <Badge
                              variant="secondary"
                              className={`bg-${incubator.status.color}-100 text-${incubator.status.color}-700`}
                            >
                              {incubator.status.label}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-2 text-muted-foreground text-sm">
                          No incubators found
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">Capacity</p>
                      <p className="text-lg font-semibold">{utilizationRate}%</p>
                      <Progress value={utilizationRate} className="mt-1 h-2" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button asChild size="sm">
                    <Link href="/batch-incubator/incubators">
                      <Eye className="h-4 w-4 mr-2" />
                      View All
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/batch-incubator/incubators/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Incubator
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Schedules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule Management
              </CardTitle>
              <CardDescription>
                Plan and track batch operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Manage feeding schedules, maintenance tasks, and important milestones for your batches.
                </p>
                <div className="flex gap-2">
                  <Button asChild size="sm">
                    <Link href="/batch-incubator/schedules">
                      <Calendar className="h-4 w-4 mr-2" />
                      View Schedules
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Reports & Analytics
              </CardTitle>
              <CardDescription>
                Performance analysis and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Generate comprehensive reports on batch performance, incubator efficiency, and production metrics.
                </p>
                <div className="flex gap-2">
                  <Button asChild size="sm">
                    <Link href="/batch-incubator/reports">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Reports
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Alerts */}
        {alerts && alerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                System Alerts
              </CardTitle>
              <CardDescription>
                Important notifications and warnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <div key={index} className={`flex items-start gap-3 p-3 rounded-lg border bg-${alert.color}-50`}>
                    <AlertTriangle
                      className={`h-4 w-4 mt-0.5 text-${alert.color}-600`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">{alert.message}</p>
                      {alert.date && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(alert.date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={alert.priority === 'high' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {alert.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
