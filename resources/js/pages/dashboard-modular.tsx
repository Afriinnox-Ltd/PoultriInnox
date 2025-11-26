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
  ArrowRight,
  Settings,
  ShoppingCart,
  Heart,
  DollarSign
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

interface Module {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  config: any;
}

interface DashboardProps {
  enabledModules: Module[];
  // BatchIncubator specific data (only present if module is enabled)
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

const getModuleIcon = (iconName: string) => {
  const icons = {
    'package': Package,
    'shopping-cart': ShoppingCart,
    'heart': Heart,
    'dollar-sign': DollarSign,
    'trending-up': TrendingUp,
  };

  return icons[iconName as keyof typeof icons] || Settings;
};

export default function Dashboard({
  enabledModules,
  batchStats,
  incubatorStats,
  recentBatches,
  incubatorOverview,
  alerts,
  upcomingSchedules
}: DashboardProps) {

  // Check if BatchIncubator module is enabled
  const hasBatchIncubator = enabledModules.some(m => m.slug === 'batch-incubator');

  const utilizationRate = incubatorStats && incubatorStats.total_capacity > 0
    ? Math.round((incubatorStats.current_utilization / incubatorStats.total_capacity) * 100)
    : 0;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="space-y-6 p-6">
        {/* Welcome Section */}
        <div className="flex lg:flex-row flex-col gap-4 lg:items-center justify-between">
          <div>
                      <h1 className="text-3xl font-bold tracking-tight">Agriinnox Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive Livestock  management system with modular functionality
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/modules">
              <Settings className="h-4 w-4 mr-2" />
              Manage Modules
            </Link>
          </Button>
        </div>

        {/* No Modules Active */}
        {enabledModules.length === 0 && (
          <Card className="border-emerald-200 bg-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-emerald-600" />
                              Welcome to Agriinnox
              </CardTitle>
              <CardDescription>
                Get started by activating modules for your Livestock management needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Agriinnox is a modular system that lets you choose which features you need.
                  Start by activating modules that match your Livestock operation requirements.
                </p>

                <div className="flex gap-4">
                  <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                    <Link href="/modules">
                      <Plus className="h-4 w-4 mr-2" />
                      Activate Modules
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/modules">
                      View All Modules
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Modules Overview */}
        {enabledModules.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Active Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enabledModules.map((module) => {
                const IconComponent = getModuleIcon(module.icon);

                return (
                  <Card key={module.id} className="border-emerald-200 bg-emerald-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <IconComponent className="h-5 w-5 text-emerald-600" />
                        {module.name}
                        <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs">
                          Active
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {module.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        {module.slug === 'batch-incubator' && (
                          <>
                            <Button asChild size="sm" className="flex-1">
                              <Link href="/batch-incubator/batches">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Link>
                            </Button>
                            <Button asChild variant="outline" size="sm" className="flex-1">
                              <Link href="/batch-incubator/batches/create">
                                <Plus className="h-3 w-3 mr-1" />
                                Create
                              </Link>
                            </Button>
                          </>
                        )}
                        {module.slug !== 'batch-incubator' && (
                          <Button variant="outline" size="sm" disabled className="flex-1">
                            Coming Soon
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* BatchIncubator Module Dashboard */}
        {hasBatchIncubator && batchStats && (
          <>
            {/* Statistics Overview */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Batch Incubator Overview</h2>
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
                    Manage your livestock from incubation to production
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
            {(alerts || upcomingSchedules) && (
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
                      {alerts && alerts.length > 0 ? (
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
                      {upcomingSchedules && upcomingSchedules.length > 0 ? (
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
            )}
          </>
        )}

        {/* Add Module Suggestion */}
        {enabledModules.length > 0 && (
          <Card className="border-emerald-200 bg-emerald-50">
            <CardHeader>
              <CardTitle>Expand Your System</CardTitle>
              <CardDescription>
                Discover more modules to enhance your livestock management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Explore additional modules like Feed Management, Health Tracking, and Financial Management to get the most out of Agriinnox.
                </p>
                <Button asChild variant="outline">
                  <Link href="/modules">
                    View All Modules
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
