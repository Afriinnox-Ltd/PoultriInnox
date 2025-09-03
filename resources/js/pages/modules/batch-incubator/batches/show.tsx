import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Edit,
  Calendar,
  Users,
  TrendingUp,
  AlertTriangle,
  Activity,
  Egg,
  Thermometer,
  Droplets,
  DollarSign,
  Clock,
  MapPin,
  User
} from 'lucide-react';

interface Batch {
  id: number;
  batch_code: string;
  name: string;
  description?: string;
  breed: string;
  status: {
    value: string;
    label: string;
    color: string;
  };
  initial_count: number;
  current_count: number;
  initial_weight?: number;
  current_weight?: number;
  mortality_count: number;
  mortality_rate: number;
  cull_count: number;
  total_eggs_produced: number;
  avg_daily_production: number;
  avg_temperature?: number;
  avg_humidity?: number;
  start_date?: string;
  hatch_date?: string;
  expected_completion_date?: string;
  incubator_assigned_at?: string;
  initial_cost: number;
  feed_cost: number;
  medication_cost: number;
  other_costs: number;
  revenue: number;
  total_cost: number;
  profit_loss: number;
  age_days?: number;
  survival_rate: number;
  batch_data?: any;
  performance_metrics?: any;
  incubator?: {
    id: number;
    name: string;
    model: string;
    status: {
      value: string;
      label: string;
    };
    current_temperature?: number;
    current_humidity?: number;
  };
  manager: {
    id: number;
    name: string;
    email: string;
  };
  events: any[];
  schedules: any[];
}

interface Props {
  batch: Batch;
}

const statusColors = {
  planned: 'bg-gray-100 text-gray-800',
  incubating: 'bg-green-100 text-green-800',
  growing: 'bg-green-100 text-green-800',
  laying: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-purple-100 text-purple-800',
};

export default function BatchShow({ batch }: Props) {
  return (
    <AppLayout>
      <Head title={`${batch.name} - Batch Details`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/batch-incubator/batches">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Batches
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{batch.name}</h1>
              <p className="text-muted-foreground">
                {batch.batch_code} • {batch.breed}
              </p>
            </div>
            <Badge
              className={statusColors[batch.status.value as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}
            >
              {batch.status.label}
            </Badge>
          </div>
          <Link href={`/batch-incubator/batches/${batch.id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit Batch
            </Button>
          </Link>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Count</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{batch.current_count.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Started with {batch.initial_count.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Survival Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{batch.survival_rate}%</div>
              <p className="text-xs text-muted-foreground">
                {batch.mortality_count} mortalities
              </p>
            </CardContent>
          </Card>

          {batch.avg_daily_production > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Production</CardTitle>
                <Egg className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{batch.avg_daily_production}</div>
                <p className="text-xs text-muted-foreground">
                  {batch.total_eggs_produced.toLocaleString()} total eggs
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit/Loss</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${batch.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${batch.profit_loss.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                ${batch.total_cost.toLocaleString()} total cost
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {batch.mortality_rate > 5 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <div>
                  <h3 className="font-semibold text-amber-800">High Mortality Rate</h3>
                  <p className="text-sm text-amber-700">
                    Current mortality rate of {batch.mortality_rate}% is above normal. Consider reviewing environmental conditions and health protocols.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Core batch details and status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {batch.description && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                    <p className="text-sm">{batch.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Breed</h4>
                    <p className="text-sm font-medium">{batch.breed}</p>
                  </div>

                  {batch.age_days !== undefined && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Age</h4>
                      <p className="text-sm font-medium">{batch.age_days} days</p>
                    </div>
                  )}

                  {batch.start_date && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Start Date</h4>
                      <p className="text-sm font-medium">{new Date(batch.start_date).toLocaleDateString()}</p>
                    </div>
                  )}

                  {batch.hatch_date && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Hatch Date</h4>
                      <p className="text-sm font-medium">{new Date(batch.hatch_date).toLocaleDateString()}</p>
                    </div>
                  )}

                  {batch.expected_completion_date && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Expected Completion</h4>
                      <p className="text-sm font-medium">{new Date(batch.expected_completion_date).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Environmental Conditions */}
            {(batch.avg_temperature || batch.avg_humidity) && (
              <Card>
                <CardHeader>
                  <CardTitle>Environmental Conditions</CardTitle>
                  <CardDescription>Average temperature and humidity readings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {batch.avg_temperature && (
                      <div className="flex items-center space-x-2">
                        <Thermometer className="h-4 w-4 text-red-500" />
                        <div>
                          <p className="text-sm font-medium">{batch.avg_temperature}°C</p>
                          <p className="text-xs text-muted-foreground">Average Temperature</p>
                        </div>
                      </div>
                    )}

                    {batch.avg_humidity && (
                      <div className="flex items-center space-x-2">
                        <Droplets className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">{batch.avg_humidity}%</p>
                          <p className="text-xs text-muted-foreground">Average Humidity</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>Cost breakdown and revenue tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Initial Cost</h4>
                      <p className="text-lg font-medium">${batch.initial_cost.toLocaleString()}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Feed Cost</h4>
                      <p className="text-lg font-medium">${batch.feed_cost.toLocaleString()}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Medication Cost</h4>
                      <p className="text-lg font-medium">${batch.medication_cost.toLocaleString()}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Other Costs</h4>
                      <p className="text-lg font-medium">${batch.other_costs.toLocaleString()}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Total Cost</h4>
                      <p className="text-xl font-bold">${batch.total_cost.toLocaleString()}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Revenue</h4>
                      <p className="text-xl font-bold text-green-600">${batch.revenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Profit/Loss</h4>
                      <p className={`text-xl font-bold ${batch.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${batch.profit_loss.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Incubator */}
            {batch.incubator && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Incubator</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium">{batch.incubator.name}</h4>
                    <p className="text-sm text-muted-foreground">{batch.incubator.model}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <Badge variant="outline">{batch.incubator.status.label}</Badge>
                  </div>

                  {batch.incubator.current_temperature && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Temperature</span>
                      <span className="text-sm font-medium">{batch.incubator.current_temperature}°C</span>
                    </div>
                  )}

                  {batch.incubator.current_humidity && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Humidity</span>
                      <span className="text-sm font-medium">{batch.incubator.current_humidity}%</span>
                    </div>
                  )}

                  <Link href={`/batch-incubator/incubators/${batch.incubator.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      View Incubator
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Manager */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Manager</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <h4 className="font-medium">{batch.manager.name}</h4>
                  <p className="text-sm text-muted-foreground">{batch.manager.email}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Events Recorded</span>
                  <span className="text-sm font-medium">{batch.events.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Scheduled Tasks</span>
                  <span className="text-sm font-medium">{batch.schedules.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Mortality Count</span>
                  <span className="text-sm font-medium">{batch.mortality_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Cull Count</span>
                  <span className="text-sm font-medium">{batch.cull_count}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
