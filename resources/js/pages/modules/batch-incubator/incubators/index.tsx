import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Factory,
  Eye,
  Plus,
  Activity,
  Thermometer,
  Droplets,
  AlertTriangle,
  Wrench,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import QuickNav from '@/components/batch-incubator/quick-nav';
import { EntityLink } from '@/components/navigation/NavigationComponents';

interface Incubator {
  id: number;
  name: string;
  model: string;
  serial_number: string;
  capacity: number;
  current_load: number;
  status: {
    value: string;
    label: string;
  };
  device_online?: boolean;
  last_update?: string;
  location?: string;
  current_temperature?: number;
  target_temperature?: number;
  current_humidity?: number;
  target_humidity?: number;
  temperature_variance?: number;
  humidity_variance?: number;
  last_maintenance?: string;
  next_maintenance?: string;
  is_maintenance_due?: boolean;
  current_batches: Array<{
    id: number;
    name: string;
    batch_code: string;
    current_count: number;
    hatch_date: string;
  }>;
  user_has_access: boolean;
  access_type: 'owner' | 'authorized' | 'admin' | null;
}

interface Stats {
  total_incubators: number;
  running_incubators: number;
  idle_incubators: number;
  maintenance_due: number;
  total_capacity: number;
  current_utilization: number;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

interface PaginatedIncubators {
  data: Incubator[];
  meta: PaginationMeta;
  links: PaginationLinks;
}

interface Props {
  incubators: PaginatedIncubators;
  stats: Stats;
}

const statusColors = {
  running: 'bg-emerald-100 text-emerald-800',
  idle: 'bg-gray-100 text-gray-800',
  maintenance: 'bg-amber-100 text-amber-800',
  error: 'bg-red-100 text-red-800',
  cleaning: 'bg-blue-100 text-blue-800',
  offline: 'bg-gray-100 text-gray-800'
};

const statuses = [
  { value: 'running', label: 'Running' },
  { value: 'idle', label: 'Idle' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'error', label: 'Error' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'offline', label: 'Offline' }
];

export default function IncubatorsIndex({ incubators, stats }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [perPage, setPerPage] = useState(incubators?.meta?.per_page);

  const utilizationPercentage = stats.total_capacity > 0
    ? Math.round((stats.current_utilization / stats.total_capacity) * 100)
    : 0;

  const navigateToBatch = (batchId: number) => {
    router.visit(`/batch-incubator/batches/${batchId}`);
  };

  const applyFilters = (filters: Record<string, any>) => {
    const params = new URLSearchParams(window.location.search);

    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.set(key, filters[key]);
      } else {
        params.delete(key);
      }
    });

    params.set('page', '1'); // Reset to first page when filtering

    router.get(window.location.pathname + '?' + params.toString(), {}, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const timeoutId = setTimeout(() => {
      applyFilters({ search: value, status: statusFilter, per_page: perPage });
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    applyFilters({ search: searchTerm, status: value, per_page: perPage });
  };

  const handlePerPageChange = (value: string) => {
    const newPerPage = parseInt(value);
    setPerPage(newPerPage);
    applyFilters({ search: searchTerm, status: statusFilter, per_page: newPerPage });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', page.toString());

    router.get(window.location.pathname + '?' + params.toString(), {}, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchTerm(params.get('search') || '');
    setStatusFilter(params.get('status') || '');
    setPerPage(parseInt(params.get('per_page') || incubators?.meta?.per_page?.toString()));
  }, []);

  return (
    <AppLayout>
      <Head title="Incubator Management" />

      <div className="space-y-6">
        {/* Enhanced Header with Quick Actions */}
        <div className="flex flex-col flex-wrap gap-3 md:flex-row md:items-center p-6 md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Incubator Management</h1>
            <p className="text-muted-foreground">
              Monitor and control your accessible incubation equipment with real-time status
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <QuickNav currentPage="incubators" />
          </div>
        </div>

        {/* Search and Filters */}
        <div className="px-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search incubators by name, model, serial number, or location..."
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
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={perPage?.toString()} onValueChange={handlePerPageChange}>
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
              Showing {incubators?.meta?.from || 0} to {incubators?.meta?.to || 0} of {incubators?.meta?.total} incubators
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
                  className="bg-emerald-600 h-2 rounded-full"
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
              <Activity className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{stats.running_incubators}</div>
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
        <div className="px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {incubators.data.length === 0 ? (
              <div className="col-span-full">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <Factory className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-2 text-sm font-semibold text-gray-900">
                        No accessible incubators found
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        You don't have access to any incubators yet, or no incubators match your search criteria.
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
              incubators.data.map((incubator) => (
                <Card key={incubator.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {incubator.name}
                          {incubator.access_type && (
                            <Badge variant="outline" className="text-xs">
                              {incubator.access_type === 'owner' && 'Owner'}
                              {incubator.access_type === 'authorized' && 'Authorized'}
                              {incubator.access_type === 'admin' && 'Admin'}
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{incubator.model}</CardDescription>
                      </div>
                      <div className="flex flex-col gap-1 items-end">

                        {incubator.serial_number && (
                          <Badge
                            variant={incubator.device_online ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {incubator.device_online ? '🟢 Online' : '🔴Offline'}
                          </Badge>
                        )}
                        {incubator.last_update && (
                          <span className="text-xs text-muted-foreground">{incubator.last_update}</span>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Capacity */}
                    {/* <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Capacity</span>
                        <span>{incubator.current_load} / {incubator.capacity}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min((incubator.current_load / incubator.capacity) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    </div> */}

                    {/* Environmental Conditions */}
                    {(incubator.current_temperature ) && (
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


                      </div>
                    )}

                    {/* Current Batches */}
                    {incubator.current_batches.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Current Batches</h4>
                        <div className="space-y-1">
                          {incubator.current_batches.map((batch) => (
                            <div key={batch.id} className="text-xs p-2 bg-muted rounded">
                              <div className="flex items-center justify-between">
                                <div>
                                  <EntityLink
                                    id={batch.id}
                                    label={batch.name}
                                    onClick={(id: number) => navigateToBatch(id)}
                                    className="font-medium flex items-center mb-2 text-emerald-600 hover:text-emerald-800"
                                  />
                                  <p className="text-muted-foreground">
                                    {batch.batch_code} • {batch.current_count} birds
                                  </p>
                                </div>
                                <span className="text-muted-foreground">
                                          {new Date(batch.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Alerts */}
                    <div className="space-y-1">
                      {incubator.is_maintenance_due && (
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

                    </div>

                    {/* Location */}
                    {incubator.location && (
                      <p className="text-xs text-muted-foreground">{incubator.location}</p>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2">
                      <Link href={`/batch-incubator/incubators/${incubator.id}`} className="flex-1">
                        <Button variant=""   size="sm" className="w-full cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" />
                          Open Incubator
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {incubators.data.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {incubators?.meta?.from || 0} to {incubators?.meta?.to || 0} of {incubators?.meta?.total} entries
              </div>

              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(incubators?.meta?.current_page - 1)}
                  disabled={!incubators?.links?.prev}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center space-x-1">
                  {/* First page */}
                  {incubators?.meta?.current_page > 3 && (
                    <>
                      <Button
                        variant={1 === incubators?.meta?.current_page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(1)}
                      >
                        1
                      </Button>
                      {incubators?.meta?.current_page > 4 && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                    </>
                  )}

                  {/* Page numbers around current page */}
                  {Array?.from({ length: Math.min(5, incubators?.meta?.last_page) }, (_, i) => {
                    const startPage = Math.max(1, incubators?.meta?.current_page - 2);
                    const pageNumber = startPage + i;

                    if (pageNumber > incubators?.meta?.last_page) return null;

                    return (
                      <Button
                        key={pageNumber}
                        variant={pageNumber === incubators?.meta?.current_page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNumber)}
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}

                  {/* Last page */}
                  {incubators?.meta?.current_page < incubators?.meta?.last_page - 2 && (
                    <>
                      {incubators?.meta?.current_page < incubators?.meta?.last_page - 3 && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                      <Button
                        variant={incubators?.meta?.last_page === incubators?.meta?.current_page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(incubators?.meta?.last_page)}
                      >
                        {incubators?.meta?.last_page}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(incubators?.meta?.current_page + 1)}
                  disabled={!incubators?.links?.next}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
