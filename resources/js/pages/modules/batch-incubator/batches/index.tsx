import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import {
  Plus,
  Eye,
  Edit,
  Calendar,
  Users,
  TrendingUp,
  AlertTriangle,
  Activity,
  Egg
} from 'lucide-react';

interface Batch {
  id: number;
  batch_code: string;
  name: string;
  breed: string;
  status: {
    value: string;
    label: string;
    color: string;
  };
  current_count: number;
  initial_count: number;
  mortality_rate: number;
  avg_daily_production: number;
  incubator?: {
    id: number;
    name: string;
    status: string;
  };
  manager: {
    id: number;
    name: string;
  };
  start_date?: string;
  hatch_date?: string;
  expected_completion_date?: string;
  age_days?: number;
  survival_rate: number;
  total_cost: number;
  profit_loss: number;
}

interface Stats {
  total_batches: number;
  active_batches: number;
  total_birds: number;
  daily_production: number;
}

interface Props {
  batches: Batch[];
  stats: Stats;
}

const statusColors = {
  planned: 'bg-gray-100 text-gray-800',
  incubating: 'bg-green-100 text-green-800',
  growing: 'bg-green-100 text-green-800',
  laying: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-purple-100 text-purple-800',
};

export default function BatchesIndex({ batches, stats }: Props) {
  return (
    <AppLayout>
      <Head title="Batch Management" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Batch Management</h1>
            <p className="text-muted-foreground">
              Monitor and manage your poultry batches throughout their lifecycle
            </p>
          </div>
          <Link href="/batches/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Batch
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_batches}</div>
              <p className="text-xs text-muted-foreground">
                {stats.active_batches} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Birds</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_birds.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all active batches
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Production</CardTitle>
              <Egg className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.daily_production}</div>
              <p className="text-xs text-muted-foreground">
                Eggs per day
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {batches.length > 0 ? Math.round(batches.reduce((acc, batch) => acc + batch.survival_rate, 0) / batches.length) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Avg survival rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Batches Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Batches</CardTitle>
            <CardDescription>
              Manage and monitor your poultry batch operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {batches.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">No batches</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Get started by creating your first batch.
                  </p>
                  <div className="mt-6">
                    <Link href="/batches/create">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Batch
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {batches.map((batch) => (
                    <Card key={batch.id} className="hover:shadow-md shadow-none transition-shadow">
                      <CardContent className="">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center space-x-4">
                              <div>
                                <h3 className="font-semibold text-lg">{batch.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {batch.batch_code} • {batch.breed}
                                </p>
                              </div>
                              <Badge
                                className={statusColors[batch.status.value as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}
                              >
                                {batch.status.label}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
                              <div>
                                <p className="text-xs text-muted-foreground">Current Count</p>
                                <p className="font-medium">{batch.current_count.toLocaleString()}</p>
                              </div>

                              <div>
                                <p className="text-xs text-muted-foreground">Survival Rate</p>
                                <p className="font-medium">{batch.survival_rate}%</p>
                              </div>

                              {batch.avg_daily_production > 0 && (
                                <div>
                                  <p className="text-xs text-muted-foreground">Daily Production</p>
                                  <p className="font-medium">{batch.avg_daily_production} eggs</p>
                                </div>
                              )}

                              {batch.age_days !== undefined && (
                                <div>
                                  <p className="text-xs text-muted-foreground">Age</p>
                                  <p className="font-medium">{batch.age_days} days</p>
                                </div>
                              )}

                              <div>
                                <p className="text-xs text-muted-foreground">Manager</p>
                                <p className="font-medium text-xs">{batch.manager.name}</p>
                              </div>

                              {batch.incubator && (
                                <div>
                                  <p className="text-xs text-muted-foreground">Incubator</p>
                                  <p className="font-medium text-xs">{batch.incubator.name}</p>
                                </div>
                              )}
                            </div>

                            {batch.mortality_rate > 5 && (
                              <div className="flex items-center space-x-2 mt-2">
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                <span className="text-sm text-amber-600">
                                  High mortality rate: {batch.mortality_rate}%
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <Link href={`/batches/${batch.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/batches/${batch.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
