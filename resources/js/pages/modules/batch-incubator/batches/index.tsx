import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icon } from '@/components/ui/icon';
import QuickNav from '@/components/batch-incubator/quick-nav';
import { NavigationHelper, navigateToFeedConsumption, navigateToSchedule } from '@/utils/navigation';
import { NavigationLink, QuickNavigation, EntityLink } from '@/components/navigation/NavigationComponents';
import { useState } from 'react';
import {
  Plus,
  Eye,
  Edit,
  Calendar,
  Users,
  TrendingUp,
  AlertTriangle,
  Activity,
  Egg,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight
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
  // Feed consumption data
  total_feed_consumed?: number;
  average_fcr?: number;
  actual_feed_cost?: number;
  feed_consumption_count?: number;
  feed_efficiency_rating?: string;
  // Access control
  can_edit?: boolean;
  is_owner?: boolean;
}

interface Stats {
  total_batches: number;
  active_batches: number;
  total_birds: number;
  daily_production: number;
}

interface PaginatedBatches {
  data: Batch[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

interface Props {
  batches?: PaginatedBatches;
  stats?: Stats;
  filters?: {
    search?: string;
    status?: string;
    per_page?: number;
  };
  statuses?: Array<{
    value: string;
    label: string;
  }>;
}

const statusColors = {
  planned: 'bg-gray-100 text-gray-800',
  incubating: 'bg-emerald-100 text-emerald-800',
  growing: 'bg-emerald-100 text-emerald-800',
  laying: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-purple-100 text-purple-800',
  terminated: 'bg-red-100 text-red-800',
};

const feedEfficiencyColors = {
  excellent: 'bg-emerald-100 text-emerald-800',
  very_good: 'bg-emerald-100 text-emerald-800',
  good: 'bg-blue-100 text-blue-800',
  acceptable: 'bg-yellow-100 text-yellow-800',
  poor: 'bg-red-100 text-red-800',
  no_data: 'bg-gray-100 text-gray-800',
};

export default function BatchesIndex({ batches, stats, filters, statuses }: Props) {
  // Provide fallback data structure if batches is not paginated
  const paginatedBatches = batches || {
    data: [],
    meta: {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
      from: null,
      to: null
    },
    links: {
      first: '',
      last: '',
      prev: null,
      next: null
    }
  };

  const batchStats = stats || {
    total_batches: 0,
    active_batches: 0,
    total_birds: 0,
    daily_production: 0
  };

  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [statusFilter, setStatusFilter] = useState(filters?.status || '');
  const [perPage, setPerPage] = useState(filters?.per_page || paginatedBatches.meta.per_page);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    applyFilters({ search: value });
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    applyFilters({ status: value === 'all' ? '' : value });
  };

  const handlePerPageChange = (value: string) => {
    const newPerPage = parseInt(value);
    setPerPage(newPerPage);
    applyFilters({ per_page: newPerPage });
  };

  const applyFilters = (newFilters: any) => {
    const params = {
      search: searchTerm,
      status: statusFilter,
      per_page: perPage,
      ...newFilters,
      page: 1, // Reset to first page when filtering
    };

    // Remove empty values
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === 'all') {
        delete params[key];
      }
    });

    router.get('/batch-incubator/batches', params, {
      preserveState: true,
      preserveScroll: true,
    });
  };

    const navigateToPage = (url: string) => {
    router.get(url, {}, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  return (
    <AppLayout>
      <Head title="Batch Management" />

      <div className="space-y-6">
        {/* Enhanced Header with Quick Actions */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center flex-wrap p-6 md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Batch Management</h1>
            <p className="text-muted-foreground">
              Monitor and manage your accessible livestock batches with comprehensive tracking
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <QuickNav currentPage="batches" />
          </div>
        </div>

        {/* Search and Filters */}
        <div className="px-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search batches by name, code, breed, or manager..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {(statuses || []).map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {paginatedBatches?.meta?.from || 0} to {paginatedBatches?.meta?.to || 0} of {paginatedBatches?.meta?.total} batches
            </span>
            {(searchTerm || statusFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  applyFilters({ search: '', status: '' });
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{batchStats.total_batches}</div>
              <p className="text-xs text-muted-foreground">
                {batchStats.active_batches} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Birds</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{batchStats.total_birds.toLocaleString()}</div>
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
              <div className="text-2xl font-bold">{batchStats.daily_production.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Eggs per day
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{batchStats.active_batches}</div>
              <p className="text-xs text-muted-foreground">
                Currently producing
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Batches List */}
        <Card className="mx-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Batch Overview</CardTitle>
                <CardDescription>
                  Manage and monitor your accessible livestock batch operations
                </CardDescription>
              </div>
              <Link href="/batch-incubator/batches/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Batch
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paginatedBatches.data.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">
                    No accessible batches found
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    You don't have access to any batches yet, or no batches match your search criteria.
                  </p>
                  <div className="mt-6">
                    <Link href="/batch-incubator/batches/create">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Batch
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {paginatedBatches.data.map((batch) => (
                    <Card key={batch.id} className="hover:shadow-md shadow-none transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center space-x-4">
                              <div>
                                <h3 className="font-semibold text-lg">{batch.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {batch.batch_code} • {batch.breed}
                                  {batch.is_owner && (
                                    <Badge variant="outline" className="ml-2 text-xs">
                                      Owner
                                    </Badge>
                                  )}
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

                              {/* Feed Consumption Data */}
                              {batch.total_feed_consumed && batch.total_feed_consumed > 0 && (
                                <div>
                                  <p className="text-xs text-muted-foreground">Feed Consumed</p>
                                  <p className="font-medium">{Number(batch.total_feed_consumed).toFixed(1)} kg</p>
                                </div>
                              )}

                              {batch.average_fcr && batch.average_fcr > 0 && (
                                <div>
                                  <p className="text-xs text-muted-foreground">FCR</p>
                                  <div className="flex items-center gap-1">
                                    <p className="font-medium">{Number(batch.average_fcr).toFixed(2)}</p>
                                  </div>
                                </div>
                              )}

                              <div>
                                <p className="text-xs text-muted-foreground">Manager</p>
                                <p className="font-medium">{batch.manager.name}</p>
                              </div>

                              {batch.incubator && (
                                <div>
                                  <p className="text-xs text-muted-foreground">Incubator</p>
                                  <p className="font-medium">{batch.incubator.name}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2 ml-4">
                            <Link href={`/batch-incubator/batches/${batch.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Button>
                            </Link>
 

                            <NavigationLink
                              onClick={() => navigateToSchedule(batch.id)}
                              size="sm"
                              variant="button"
                              className="text-xs"
                            >
                              <Calendar className="mr-1 h-3 w-3" />
                              Schedule
                            </NavigationLink>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              {paginatedBatches?.meta?.last_page > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Page {paginatedBatches?.meta?.current_page} of {paginatedBatches?.meta?.last_page}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateToPage(paginatedBatches?.links?.first)}
                      disabled={!paginatedBatches?.links?.prev}
                    >
                      First
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateToPage(paginatedBatches?.links?.prev || '')}
                      disabled={!paginatedBatches?.links?.prev}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateToPage(paginatedBatches?.links?.next || '')}
                      disabled={!paginatedBatches?.links?.next}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateToPage(paginatedBatches?.links?.last)}
                      disabled={!paginatedBatches?.links?.last}
                    >
                      Last
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
