import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import QuickNav from '@/components/batch-incubator/quick-nav';
import {
  Plus,
  Eye,
  Settings,
  Thermometer,
  Droplets,
  Activity,
  AlertTriangle,
  Wrench,
  Factory
} from 'lucide-react';

interface Incubator {
  id: number;
  name: string;
  model: string;
  serial_number: string;
  status: {
    value: string;
    label: string;
    color: string;
  };
  capacity: number;
  current_load: number;
  utilization_rate: number;
  target_temperature?: number;
  target_humidity?: number;
  current_temperature?: number;
  current_humidity?: number;
  temperature_variance?: number;
  humidity_variance?: number;
  location?: string;
  last_maintenance?: string;
  next_maintenance?: string;
  maintenance_due: boolean;
  current_batches: Array<{
    id: number;
    batch_code: string;
    name: string;
    status: string;
    current_count: number;
  }>;
  owner: {
    name: string;
  };
}

interface Stats {
  total_incubators: number;
  running_incubators: number;
  idle_incubators: number;
  maintenance_due: number;
  total_capacity: number;
  current_utilization: number;
}

interface Props {
  incubators: Incubator[];
  stats: Stats;
}

const statusColors = {
  running: 'bg-green-100 text-green-800',
  idle: 'bg-gray-100 text-gray-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
};

export default function IncubatorsIndex({ incubators, stats }: Props) {
  const utilizationPercentage = stats.total_capacity > 0
    ? Math.round((stats.current_utilization / stats.total_capacity) * 100)
    : 0;

  return (
    <AppLayout>
      <Head title="Incubator Management" />

      <div className="space-y-6">
        {/* Header */}
                {/* Enhanced Header with Quick Actions */}
              <div className="flex flex-col flex-wrap gap-3  md:flex-row md:items-center p-6 md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Incubator Management</h1>
            <p className="text-muted-foreground">
              Monitor and control your incubation equipment with real-time status
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <QuickNav currentPage="incubators" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Incubators</CardTitle>
              <Factory className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_incubators}</div>
              <p className="text-xs text-muted-foreground">
                {stats.running_incubators} running, {stats.idle_incubators} idle
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilization</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{utilizationPercentage}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${utilizationPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.current_utilization} / {stats.total_capacity} capacity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Running</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.running_incubators}</div>
              <p className="text-xs text-muted-foreground">
                Active incubators
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance Due</CardTitle>
              <Wrench className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.maintenance_due}</div>
              <p className="text-xs text-muted-foreground">
                Next 7 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Incubators Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {incubators.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Factory className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No incubators</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Get started by adding your first incubator.
                    </p>
                    <div className="mt-6">
                      <Link href="/batch-incubator/incubators/create">
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Incubator
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            incubators.map((incubator) => (
              <Card key={incubator.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{incubator.name}</CardTitle>
                      <CardDescription>{incubator.model}</CardDescription>
                    </div>
                    <Badge
                      className={statusColors[incubator.status.value as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}
                    >
                      {incubator.status.label}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Capacity */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Capacity</span>
                      <span>{incubator.current_load} / {incubator.capacity}</span>
                    </div>
                  </div>

                  {/* Environmental Conditions */}
                  {(incubator.current_temperature || incubator.current_humidity) && (
                    <div className="grid grid-cols-2 gap-4">
                      {incubator.current_temperature && (
                        <div className="flex items-center space-x-2">
                          <Thermometer className="h-4 w-4 text-red-500" />
                          <div>
                            <p className="text-sm font-medium">{incubator.current_temperature}°C</p>
                            {incubator.target_temperature && (
                              <p className="text-xs text-muted-foreground">
                                Target: {incubator.target_temperature}°C
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {incubator.current_humidity && (
                        <div className="flex items-center space-x-2">
                          <Droplets className="h-4 w-4 text-green-500" />
                          <div>
                            <p className="text-sm font-medium">{incubator.current_humidity}%</p>
                            {incubator.target_humidity && (
                              <p className="text-xs text-muted-foreground">
                                Target: {incubator.target_humidity}%
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Current Batches */}
                  {incubator.current_batches.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Current Batches</h4>
                      <div className="space-y-1">
                        {incubator.current_batches.map((batch) => (
                          <Link
                            key={batch.id}
                            href={`/batch-incubator/batches/${batch.id}`}
                            className="block hover:underline"
                          >
                            <div className="text-xs p-2 bg-muted rounded hover:bg-muted/80 transition-colors">
                              <p className="font-medium">{batch.name}</p>
                              <p className="text-muted-foreground">
                                {batch.batch_code} • {batch.current_count} birds
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Warnings */}
                  <div className="space-y-2">
                    {incubator.maintenance_due && (
                      <div className="flex items-center space-x-2 text-amber-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-xs">Maintenance due</span>
                      </div>
                    )}

                    {incubator.temperature_variance && Math.abs(incubator.temperature_variance) > 1 && (
                      <div className="flex items-center space-x-2 text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-xs">Temperature variance: {incubator.temperature_variance}°C</span>
                      </div>
                    )}

                    {incubator.humidity_variance && Math.abs(incubator.humidity_variance) > 5 && (
                      <div className="flex items-center space-x-2 text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-xs">Humidity variance: {incubator.humidity_variance}%</span>
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  {incubator.location && (
                    <p className="text-xs text-muted-foreground">{incubator.location}</p>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Link href={`/batch-incubator/incubators/${incubator.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
