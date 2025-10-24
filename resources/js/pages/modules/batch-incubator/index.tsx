import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link, router } from '@inertiajs/react';
import {
  Package,
  Activity,
  TrendingUp,
  Users,
  AlertTriangle,
  Calendar,
  Clock,
  Eye,
  Plus,
  Settings,
  BarChart3,
  CheckCircle,
  XCircle,
  PauseCircle,
  Target,
  Zap,
  RefreshCw,
  Heart,
  Info,
  Utensils,
  Brain
} from 'lucide-react';
import { Head } from '@inertiajs/react';
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

// Helper function for status colors
const getStatusColor = (status: string | { value: string } | undefined) => {
  const statusValue = typeof status === 'object' ? status?.value : status;
  switch (statusValue) {
    case 'active':
    case 'completed':
      return 'bg-emerald-100 text-emerald-800';
    case 'inactive':
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'error':
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

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

  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  const utilizationRate = incubatorStats && incubatorStats.total_capacity > 0
    ? Math.round((incubatorStats.current_utilization / incubatorStats.total_capacity) * 100)
    : 0;

  const survivalRate = batchStats?.average_survival_rate || 0;
  const totalBirds = batchStats?.total_birds || 0;
  const dailyProduction = batchStats?.daily_production || 0;
  const activeBatches = batchStats?.active_batches || 0;
  const totalBatches = batchStats?.total_batches || 0;
  const activeIncubators = incubatorStats?.active_incubators || 0;
  const totalIncubators = incubatorStats?.total_incubators || 0;

  const handleRefresh = () => {
    setRefreshing(true);
    router.get(window.location.pathname, {}, {
      preserveState: true,
      preserveScroll: true,
      only: ['batchStats', 'incubatorStats', 'recentBatches', 'incubatorOverview', 'alerts', 'upcomingSchedules'],
      onFinish: () => setRefreshing(false)
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'running':
      case 'incubating':
      case 'growing':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'idle':
      case 'planned':
        return <PauseCircle className="h-4 w-4 text-yellow-600" />;
      case 'maintenance':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Batch Incubator - Overview" />
      <div className="space-y-6 p-6">
        {/* Header with Action Buttons */}
        <div className="flex items-center flex-wrap gap-3 justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Batch Incubator Management</h1>
            <p className="text-muted-foreground">
              Complete poultry batch and incubator management system
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button asChild size="sm">
              <Link href="/batch-incubator/schedules/create">
                <Plus className="h-4 w-4 mr-2" />
                Quick Schedule
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/batch-incubator/smart-scheduling/overview">
                <Brain className="h-4 w-4 mr-2" />
                Smart Insights
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/batch-incubator/reports">
                <BarChart3 className="h-4 w-4 mr-2" />
                Reports
              </Link>
            </Button>
          </div>
        </div>

        {/* Critical Alerts Banner */}
        {alerts && alerts.filter(alert => alert.priority === 'high').length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Critical Issues Detected:</strong> {alerts.filter(alert => alert.priority === 'high').length} high-priority alerts require immediate attention.
              <Link href="#alerts" className="ml-2 underline">View Details</Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Navigation Tabs */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Performance Indicators */}
            {batchStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="relative overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{activeBatches}</div>
                    <p className="text-xs text-muted-foreground">
                      Total: {totalBatches} batches
                    </p>
                    <div className="absolute bottom-0 right-0 p-2">
                      <Button asChild size="sm" variant="ghost">
                        <Link href="/batch-incubator/batches">
                          <Eye className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Birds</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalBirds.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      Survival rate: {survivalRate.toFixed(1)}%
                    </p>
                    <div className="absolute bottom-0 right-0 p-2">
                      <Button asChild size="sm" variant="ghost">
                        <Link href="/batch-incubator/reports">
                          <BarChart3 className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Daily Production</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Math.round(dailyProduction)}</div>
                    <p className="text-xs text-muted-foreground">
                      Eggs per day
                    </p>
                    <div className="absolute bottom-0 right-0 p-2">
                      <Button asChild size="sm" variant="ghost">
                        <Link href="/batch-incubator/reports">
                          <Target className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Incubator Utilization</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{utilizationRate}%</div>
                    <Progress value={utilizationRate} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {activeIncubators}/{totalIncubators} active
                    </p>
                    <div className="absolute bottom-0 right-0 p-2">
                      <Button asChild size="sm" variant="ghost">
                        <Link href="/batch-incubator/incubators">
                          <Zap className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <Link href="/batch-incubator/batches" className="block">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Package className="h-5 w-5 text-emerald-600" />
                      Manage Batches
                    </CardTitle>
                    <CardDescription>
                      View and manage all your poultry batches
                    </CardDescription>
                  </CardHeader>
                </Link>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <Link href="/batch-incubator/incubators" className="block">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Activity className="h-5 w-5 text-blue-600" />
                      Manage Incubators
                    </CardTitle>
                    <CardDescription>
                      Monitor and control your incubators
                    </CardDescription>
                  </CardHeader>
                </Link>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <Link href="/batch-incubator/schedules" className="block">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      View Schedules
                    </CardTitle>
                    <CardDescription>
                      Manage tasks and maintenance schedules
                    </CardDescription>
                  </CardHeader>
                </Link>
              </Card>
            </div>


          </TabsContent>

          {/* Operations Tab */}
          <TabsContent value="operations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Batch Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Recent Batches
                  </CardTitle>
                  <CardDescription>
                    Latest batch activities and status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentBatches && recentBatches.length > 0 ? (
                    <div className="space-y-3">
                      {recentBatches.slice(0, 5).map((batch) => (
                        <div key={batch.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{batch.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {batch.current_count} birds • {batch.batch_code}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getStatusColor(batch.status?.value)}`}>
                              {typeof batch.status === 'object' ? batch.status.label : batch.status}
                            </Badge>
                            <Button asChild size="sm" variant="ghost" title="View Details">
                              <Link href={`/batch-incubator/batches/${batch.id}`}>
                                <Eye className="h-3 w-3" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/batch-incubator/batches">
                          View All Batches
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No batches found</p>
                      <Button asChild className="mt-4">
                        <Link href="/batch-incubator/batches/create">
                          Create First Batch
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Incubator Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Incubator Status
                  </CardTitle>
                  <CardDescription>
                    Equipment monitoring and alerts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {incubatorOverview && incubatorOverview.length > 0 ? (
                    <div className="space-y-3">
                      {incubatorOverview.slice(0, 5).map((incubator) => (
                        <div key={incubator.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{incubator.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {incubator.utilization}% utilization • Standard Model
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getStatusColor(incubator.status?.value)}`}>
                              {typeof incubator.status === 'object' ? incubator.status.label : incubator.status}
                            </Badge>
                            <Button asChild size="sm" variant="ghost">
                              <Link href={`/batch-incubator/incubators/${incubator.id}`}>
                                <Eye className="h-3 w-3" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/batch-incubator/incubators">
                          View All Incubators
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No incubators found</p>
                      <Button asChild className="mt-4">
                        <Link href="/batch-incubator/incubators/create">
                          Add First Incubator
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Alerts */}
              <Card id="alerts">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    System Alerts
                  </CardTitle>
                  <CardDescription>
                    Critical issues and notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {alerts && alerts.length > 0 ? (
                    <div className="space-y-3">
                      {alerts.slice(0, 5).map((alert, index) => (
                        <div key={index} className={`p-3 border rounded-lg ${
                          alert.priority === 'high' ? 'border-red-200 bg-red-50' :
                          alert.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                          'border-emerald-200 bg-emerald-50'
                        }`}>
                          <div className="flex items-start gap-3">
                            {alert.priority === 'high' && <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />}
                            {alert.priority === 'medium' && <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />}
                            {alert.priority === 'low' && <Info className="h-4 w-4 text-emerald-600 mt-0.5" />}
                            <div>
                              <p className="font-medium text-sm">{alert.title}</p>
                              <p className="text-xs text-muted-foreground">{alert.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">{alert.date}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {alerts.length > 5 && (
                        <p className="text-sm text-muted-foreground text-center">
                          And {alerts.length - 5} more alerts...
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto text-emerald-500 mb-4" />
                      <p className="text-muted-foreground">All systems operating normally</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>
                    Key performance indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Survival Rate</span>
                        <span>{survivalRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={survivalRate} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Capacity Utilization</span>
                        <span>{utilizationRate}%</span>
                      </div>
                      <Progress value={utilizationRate} className="h-2" />
                    </div>

                    <Button asChild variant="outline" className="w-full mt-4">
                      <Link href="/batch-incubator/reports">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Detailed Reports
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Schedules Tab */}
          <TabsContent value="schedules" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Schedules */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Schedules
                  </CardTitle>
                  <CardDescription>
                    Tasks and events requiring attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingSchedules && upcomingSchedules.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingSchedules.slice(0, 5).map((schedule) => (
                        <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{schedule.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {schedule.batch_name} • {schedule.scheduled_date}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getStatusColor(schedule.priority)}`}>
                              {schedule.priority}
                            </Badge>
                            <Button asChild size="sm" variant="ghost">
                              <Link href={`/batch-incubator/schedules/${schedule.id}`}>
                                <Eye className="h-3 w-3" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/batch-incubator/schedules">
                          View All Schedules
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No upcoming schedules</p>
                      <Button asChild className="mt-4">
                        <Link href="/batch-incubator/schedules/create">
                          Create First Schedule
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Schedule Management Tools */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Schedule Management
                  </CardTitle>
                  <CardDescription>
                    Tools for managing your schedules
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <Button asChild className="w-full">
                        <Link href="/batch-incubator/schedules/create">
                          <Plus className="h-4 w-4 mr-2" />
                          Create New Schedule
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/batch-incubator/schedules">
                          <Calendar className="h-4 w-4 mr-2" />
                          View All Schedules
                        </Link>
                      </Button>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3 text-sm">Quick Templates</h4>
                      <div className="space-y-2">
                        <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                          <Link href="/batch-incubator/schedules/create?template=feeding">
                            <Utensils className="h-4 w-4 mr-2" />
                            Feeding Schedule
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                          <Link href="/batch-incubator/schedules/create?template=maintenance">
                            <Settings className="h-4 w-4 mr-2" />
                            Maintenance Task
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                          <Link href="/batch-incubator/schedules/create?template=health">
                            <Heart className="h-4 w-4 mr-2" />
                            Health Check
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
