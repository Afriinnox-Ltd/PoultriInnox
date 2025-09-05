import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  Calculator,
  Utensils,
  BarChart3,
  Calendar,
  DollarSign,
  Scale,
  Clock,
  Loader2
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { toast } from 'sonner';

interface DashboardStats {
  total_inventory_value: number;
  low_stock_items: number;
  expiring_soon_count: number;
  average_fcr: number;
  monthly_consumption: number;
  feed_cost_per_bird: number;
  total_feed_types: number;
  active_batches: number;
}

interface InventoryAlert {
  id: number;
  feed_type_name: string;
  quantity: number;
  alert_type: 'low_stock' | 'expiring_soon' | 'expired';
  expiry_date?: string;
  days_until_expiry?: number;
}

interface FeedProgram {
  id: number;
  name: string;
  description: string;
  target_breed: string;
}

interface FeedType {
  id: number;
  name: string;
  category: string;
  protein_content: number;
  cost_per_kg: number;
}

interface RequirementCalculation {
  feed_type_id: number;
  feed_type_name: string;
  daily_requirement: number;
  weekly_requirement: number;
  monthly_requirement: number;
  estimated_cost: number;
}

interface BatchData {
  id: number;
  name: string;
  current_count: number;
  breed: string;
  age_in_days: number;
  status: string;
}

interface IncubatorData {
  id: number;
  name: string;
  location: string;
  capacity: number;
  current_load: number;
  batch: BatchData | null;
}

interface Props {
  stats: DashboardStats;
  inventory_alerts: InventoryAlert[];
  feed_programs: FeedProgram[];
  feed_types: FeedType[];
  batch_incubator_enabled: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Feed Management',
    href: '/feed-management',
  },
];

export default function FeedManagementDashboard({ stats, inventory_alerts, feed_programs, feed_types, batch_incubator_enabled }: Props) {
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [selectedFeedType, setSelectedFeedType] = useState<string>('');
  const [birdCount, setBirdCount] = useState<number>(0);
  const [birdAge, setBirdAge] = useState<number>(0);
  const [requirements, setRequirements] = useState<RequirementCalculation[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  // Incubator-related state
  const [incubators, setIncubators] = useState<IncubatorData[]>([]);
  const [selectedIncubator, setSelectedIncubator] = useState<string>('');
  const [loadingIncubators, setLoadingIncubators] = useState(false);
  const [autoFilling, setAutoFilling] = useState(false);

  // Fetch incubator data when component mounts and batch_incubator_enabled is true
  useEffect(() => {
    if (batch_incubator_enabled) {
      fetchIncubatorData();
    }
  }, [batch_incubator_enabled]);

  const fetchIncubatorData = async () => {
    if (!batch_incubator_enabled) return;

    setLoadingIncubators(true);
    try {
      const response = await fetch('/feed-management/api/incubator-data');
      const data = await response.json();

      if (data.available && data.incubators) {
        setIncubators(data.incubators);
      }
    } catch (error) {
      console.error('Error fetching incubator data:', error);
    } finally {
      setLoadingIncubators(false);
    }
  };

  const handleIncubatorSelection = (incubatorId: string) => {
    setSelectedIncubator(incubatorId);

    if (incubatorId) {
      setAutoFilling(true);
      const incubator = incubators.find(inc => inc.id.toString() === incubatorId);
      if (incubator && incubator.batch) {
        // Simulate a small delay for better UX
        setTimeout(() => {
          // Auto-fill bird count and age from selected incubator's batch
          setBirdCount(incubator.batch!.current_count);
          setBirdAge(incubator.batch!.age_in_days);
          setAutoFilling(false);
        }, 500);
      } else {
        setAutoFilling(false);
      }
    } else {
      setAutoFilling(false);
    }
  };

  const calculateRequirements = async () => {
    if (!selectedProgram || !selectedFeedType || !birdCount || !birdAge) {
      console.warn('Missing required fields:', {
        selectedProgram,
        selectedFeedType,
        birdCount,
        birdAge
      });
      return;
    }

    setIsCalculating(true);
    try {
      console.log('Sending calculation request:', {
        program_id: selectedProgram,
        feed_type_id: selectedFeedType,
        bird_count: birdCount,
        bird_age_days: birdAge,
      });

      const response = await fetch('/feed-management/api/calculate-requirements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          program_id: selectedProgram,
          feed_type_id: selectedFeedType,
          bird_count: birdCount,
          bird_age_days: birdAge,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log('Calculation response:', data);

        setRequirements(data.requirements || []);
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        alert(`Error calculating requirements: ${response.status} - ${errorText}`);
        toast.error(`Error calculating requirements: ${response.status}`);
      }
    } catch (error) {
      console.error('Error calculating requirements:', error);
      toast.error('An error occurred while calculating requirements. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const getAlertVariant = (alertType: string): "default" | "destructive" => {
    switch (alertType) {
      case 'expired':
        return 'destructive';
      case 'expiring_soon':
      case 'low_stock':
      default:
        return 'default';
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'expired':
      case 'expiring_soon':
        return Clock;
      case 'low_stock':
        return Package;
      default:
        return AlertTriangle;
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Feed Management Dashboard" />

      <div className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Feed Management Dashboard</h1>
              <p className="text-gray-600">Monitor and manage your feed inventory and consumption</p>
            </div>
            <div className="flex space-x-2">
              <Link  href={'/feed-management/inventory'}>
                <Button className='flex ' variant={'secondary'}>
                <Package className="h-4 w-4 mr-2" />
               <span>Inventory</span>
               </Button>
              </Link>
              <Link href={'/feed-management/consumption'} >
            <Button className='flex ' variant={'secondary'}>
                <Utensils className="h-4 w-4 mr-2" />
                <span>Consumption</span>
              </Button>

              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">RWF {stats.total_inventory_value.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Current stock value</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average FCR</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.average_fcr.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Feed conversion ratio</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Consumption</CardTitle>
                <Scale className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.monthly_consumption.toLocaleString()} kg</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cost per Bird</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">RWF {stats.feed_cost_per_bird.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Average monthly</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Feed Requirement Calculator */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Feed Requirement Calculator
                </CardTitle>
                <CardDescription>
                  Calculate feed requirements based on your program and flock size
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {batch_incubator_enabled && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      Select Incubator (Auto-fill data)
                    </label>
                    <Select value={selectedIncubator} onValueChange={handleIncubatorSelection} disabled={loadingIncubators}>
                      <SelectTrigger>
                        <div className="flex items-center">
                          {loadingIncubators && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          <SelectValue placeholder={loadingIncubators ? "Loading incubators..." : "Select incubator to auto-fill"} />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {loadingIncubators ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span className="text-sm text-muted-foreground">Loading incubators...</span>
                          </div>
                        ) : incubators.length > 0 ? (
                          incubators.map((incubator) => (
                            <SelectItem key={incubator.id} value={incubator.id.toString()}>
                              <div className="flex flex-col">
                                <span className="font-medium">{incubator.name}</span>
                                {incubator.batch ? (
                                  <span className="text-xs text-muted-foreground">
                                    {incubator.batch.name} - {incubator.batch.current_count} birds ({incubator.batch.age_in_days} days old)
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">No active batch</span>
                                )}
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="flex items-center justify-center py-4">
                            <span className="text-sm text-muted-foreground">No incubators available</span>
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Feed Program</label>
                    <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select program" />
                      </SelectTrigger>
                      <SelectContent>
                        {feed_programs.map((program) => (
                          <SelectItem key={program.id} value={program.id.toString()}>
                            {program.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Feed Type</label>
                    <Select value={selectedFeedType} onValueChange={setSelectedFeedType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select feed type" />
                      </SelectTrigger>
                      <SelectContent>
                        {feed_types.map((feedType) => (
                          <SelectItem key={feedType.id} value={feedType.id.toString()}>
                            {feedType.name} ({feedType.category})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Bird Count</label>
                    <div className="relative">
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={birdCount}
                        onChange={(e) => setBirdCount(parseInt(e.target.value) || 0)}
                        placeholder="Number of birds"
                        disabled={autoFilling}
                      />
                      {autoFilling && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Bird Age (days)</label>
                    <div className="relative">
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={birdAge}
                        onChange={(e) => setBirdAge(parseInt(e.target.value) || 0)}
                        placeholder="Age in days"
                        disabled={autoFilling}
                      />
                      {autoFilling && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={calculateRequirements}
                  disabled={isCalculating || !selectedProgram || !selectedFeedType || !birdCount || !birdAge}
                  className="w-full"
                >
                  {isCalculating ? 'Calculating...' : 'Calculate Requirements'}
                </Button>

                {requirements.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <h4 className="font-medium">Calculated Requirements:</h4>
                    {requirements.map((req, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{req.feed_type_name}</span>
                          <Badge variant="outline">RWF {req.estimated_cost.toFixed(2)}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                          <div>Daily: {req.daily_requirement.toFixed(1)} kg</div>
                          <div>Weekly: {req.weekly_requirement.toFixed(1)} kg</div>
                          <div>Monthly: {req.monthly_requirement.toFixed(1)} kg</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Inventory Alerts
                </CardTitle>
                <CardDescription>
                  Items requiring attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!batch_incubator_enabled && (
                  <Alert className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium">BatchIncubator Module Required</div>
                      <div className="text-sm">
                        Enable the BatchIncubator module to access full feed management features including batch tracking and FCR calculations.
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
                {inventory_alerts.length === 0 ? (
                  <p className="text-sm text-gray-500">No alerts at this time</p>
                ) : (
                  <div className="space-y-3">
                    {inventory_alerts.slice(0, 5).map((alert) => {
                      const AlertIcon = getAlertIcon(alert.alert_type);
                      return (
                        <Alert key={alert.id} variant={getAlertVariant(alert.alert_type)}>
                          <AlertIcon className="h-4 w-4" />
                          <AlertDescription>
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{alert.feed_type_name}</div>
                                <div className="text-sm">
                                  {alert.alert_type === 'low_stock' && `Only ${alert.quantity} kg remaining`}
                                  {alert.alert_type === 'expiring_soon' && `Expires in ${alert.days_until_expiry} days`}
                                  {alert.alert_type === 'expired' && 'Expired'}
                                </div>
                              </div>
                              <Badge variant={getAlertVariant(alert.alert_type)} className="ml-2">
                                {alert.alert_type.replace('_', ' ')}
                              </Badge>
                            </div>
                          </AlertDescription>
                        </Alert>
                      );
                    })}
                    {inventory_alerts.length > 5 && (
                      <Button variant="link" className="w-full p-0 h-auto">
                        View {inventory_alerts.length - 5} more alerts
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Feed Types</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_feed_types}</div>
                <p className="text-xs text-muted-foreground">Available types</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active_batches}</div>
                <p className="text-xs text-muted-foreground">
                  {batch_incubator_enabled ? 'Currently running' : 'Requires BatchIncubator module'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.low_stock_items}</div>
                <p className="text-xs text-muted-foreground">Need reordering</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.expiring_soon_count}</div>
                <p className="text-xs text-muted-foreground">Within 7 days</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
