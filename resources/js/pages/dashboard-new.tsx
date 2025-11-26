import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  TrendingUp,
  AlertTriangle,
  Users,
  Thermometer,
  Droplet,
  Package,
  Activity,
  Clock,
  PlayCircle,
  Eye,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Link, Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';

// Simple Progress component
const Progress = ({ value, className }: { value: number; className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div
      className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardProps {
  batchStats: {
    total_batches: number;
    active_batches: number;
    total_birds: number;
    daily_production: number;
    average_survival_rate: number;
  };
  incubatorStats: {
    total_incubators: number;
    active_incubators: number;
    idle_incubators: number;
    total_capacity: number;
    current_utilization: number;
    average_temperature: number;
    average_humidity: number;
  };
  recentBatches: Array<{
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
  incubatorOverview: Array<{
    id: number;
    name: string;
    status: {
      value: string;
      label: string;
      color: string;
    };
    utilization: number;
  }>;
  alerts: Array<{
    type: string;
    title: string;
    message: string;
    priority: string;
    color: string;
    date?: string;
  }>;
  upcomingSchedules: Array<{
    id: number;
    title: string;
    batch_name: string;
    scheduled_date: string;
    priority: string;
    assigned_to: string;
  }>;
}

export default function Dashboard({
  batchStats,
  incubatorStats,
  recentBatches,
  incubatorOverview,
  alerts,
  upcomingSchedules
}: DashboardProps) {
  const utilizationRate = incubatorStats?.total_capacity > 0
    ? Math.round((incubatorStats.current_utilization / incubatorStats.total_capacity) * 100)
    : 0;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="space-y-6 p-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">BatchIncubator Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive livestock batch and incubator management
            </p>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{batchStats?.active_batches || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total: {batchStats?.total_batches || 0} batches
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Birds</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{batchStats?.total_birds?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                Survival rate: {batchStats?.average_survival_rate?.toFixed(1) || 0}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Production</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{batchStats?.daily_production || 0}</div>
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

        {/* Module Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Batch Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Batch Management
              </CardTitle>
              <CardDescription>
                Manage your livestock batches from incubation to production
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Recent Batches</p>
                    <div className="space-y-2 mt-2">
                      {recentBatches?.slice(0, 3).map((batch) => (
                        <div key={batch.id} className="flex items-center justify-between">
                          <span className="text-muted-foreground">{batch.name}</span>
                          <Badge
                            variant="secondary"
                            className={`bg-${batch.status.color}-100 text-${batch.status.color}-700`}
                          >
                            {batch.status.label}
                          </Badge>
                        </div>
                      )) || (
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
                      {incubatorOverview?.slice(0, 3).map((incubator) => (
                        <div key={incubator.id} className="flex items-center justify-between">
                          <span className="text-muted-foreground">{incubator.name}</span>
                          <Badge
                            variant="secondary"
                            className={`bg-${incubator.status.color}-100 text-${incubator.status.color}-700`}
                          >
                            {incubator.status.label}
                          </Badge>
                        </div>
                      )) || (
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

        {/* Alerts and Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Alerts */}
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
                {alerts?.length > 0 ? (
                  alerts.map((alert, index) => (
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
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No active alerts</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Schedule
              </CardTitle>
              <CardDescription>
                Tasks and events for the next 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingSchedules?.length > 0 ? (
                  upcomingSchedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-start gap-3 p-3 rounded-lg border bg-gray-50">
                      <Clock className="h-4 w-4 mt-0.5 text-emerald-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{schedule.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {schedule.batch_name} • {schedule.scheduled_date}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Assigned to: {schedule.assigned_to}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {schedule.priority}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No upcoming tasks</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="h-auto p-4">
                <Link href="/batch-incubator/batches/create">
                  <div className="text-center">
                    <Plus className="h-8 w-8 mx-auto mb-2" />
                    <p className="font-medium">Create New Batch</p>
                    <p className="text-xs text-muted-foreground">Start a new incubation cycle</p>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-auto p-4">
                <Link href="/batch-incubator/incubators">
                  <div className="text-center">
                    <PlayCircle className="h-8 w-8 mx-auto mb-2" />
                    <p className="font-medium">Monitor Incubators</p>
                    <p className="text-xs text-muted-foreground">Check equipment status</p>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-auto p-4">
                <Link href="/batch-incubator/batches">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                    <p className="font-medium">View Reports</p>
                    <p className="text-xs text-muted-foreground">Analyze performance data</p>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started with BatchIncubator</CardTitle>
            <CardDescription>
              New to the system? Follow these steps to get up and running
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-100 text-emerald-700 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <p className="font-medium">Set up your incubators</p>
                  <p className="text-sm text-muted-foreground">
                    Add and configure your incubation equipment with capacity and settings
                  </p>
                  <Button asChild variant="link" size="sm" className="p-0 h-auto">
                    <Link href="/batch-incubator/incubators/create">
                      Configure incubators <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-emerald-100 text-emerald-700 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <p className="font-medium">Create your first batch</p>
                  <p className="text-sm text-muted-foreground">
                    Start a new incubation cycle with eggs and assign it to an incubator
                  </p>
                  <Button asChild variant="link" size="sm" className="p-0 h-auto">
                    <Link href="/batch-incubator/batches/create">
                      Create new batch <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-emerald-100 text-emerald-700 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <p className="font-medium">Monitor and track progress</p>
                  <p className="text-sm text-muted-foreground">
                    Use the dashboard to monitor batch progress, incubator status, and production metrics
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
