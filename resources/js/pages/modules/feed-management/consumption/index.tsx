
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Utensils,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Calendar,
  Scale,
  DollarSign,
  BarChart3,
  Loader2,
  ExternalLink,
  Info,
  HelpCircle,
  Calculator,
  Clock
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatWeight, formatDate } from '@/utils/formatters';
import { NavigationHelper, navigateToBatch, navigateToFeedType, navigateToInventory } from '@/utils/navigation';
import { NavigationLink, QuickNavigation, EntityLink } from '@/components/navigation/NavigationComponents';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Helper component for informative table headers with tooltips
const InfoTableHead = ({ children, tooltip }: { children: React.ReactNode; tooltip: string }) => (
  <TableHead>
    <div className="flex items-center gap-1">
      {children}
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-3 w-3 text-gray-400 hover:text-gray-600 cursor-help" />
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  </TableHead>
);

// Helper component for complex data fields with explanations
const InfoField = ({
  value,
  tooltip,
  icon: Icon,
  className = ""
}: {
  value: React.ReactNode;
  tooltip: string;
  icon?: any;
  className?: string;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <div className={`flex items-center gap-1 cursor-help ${className}`}>
        {Icon && <Icon className="h-3 w-3 text-gray-400" />}
        {value}
      </div>
    </TooltipTrigger>
    <TooltipContent>
      <p className="max-w-xs">{tooltip}</p>
    </TooltipContent>
  </Tooltip>
);

// Quick explanation panel component
const ExplanationPanel = ({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) => (
  <Card className={`mb-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-95'}`}>
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <Info className="h-4 w-4" />
          Feed Consumption Records Guide
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-6 w-6 p-0"
        >
          {isOpen ? '−' : '+'}
        </Button>
      </div>
    </CardHeader>
    {isOpen && (
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="space-y-2">
            <h4 className="font-semibold text-emerald-600 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Basic Information
            </h4>
            <ul className="space-y-1 text-gray-600">
              <li><strong>Date:</strong> When the feed was consumed</li>
              <li><strong>Batch:</strong> Group of birds being fed (clickable)</li>
              <li><strong>Feed Type:</strong> Type of feed used (clickable)</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-emerald-600 flex items-center gap-1">
              <Scale className="h-3 w-3" />
              Quantities & Performance
            </h4>
            <ul className="space-y-1 text-gray-600">
              <li><strong>Planned vs Actual:</strong> Expected vs actual feed amounts</li>
              <li><strong>Variance:</strong> Difference from planned amounts</li>
              <li><strong>FCR:</strong> Feed Conversion Ratio (efficiency metric)</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-purple-600 flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Financial & Context
            </h4>
            <ul className="space-y-1 text-gray-600">
              <li><strong>Cost:</strong> Total cost of feed consumed</li>
              <li><strong>Birds:</strong> Number of birds fed</li>
              <li><strong>Inventory:</strong> Source feed batch (clickable)</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
          <p className="text-xs text-emerald-700 flex items-center gap-1">
            <Info className="h-3 w-3" />
            <strong>Tip:</strong> Click on batch codes, feed types, or inventory items to view detailed information.
            Hover over any data field to see explanations.
          </p>
        </div>
      </CardContent>
    )}
  </Card>
);

interface FeedConsumption {
  id: number;
  batch: {
    id: number;
    batch_code: string;
    breed: string;
  };
  feed_type: {
    id: number;
    name: string;
    category: string;
  };
  feed_inventory?: {
    id: number;
    batch_number: string;
  };
  schedule?: {
    id: number;
    title: string;
  };
  consumption_date: string;
  planned_amount: number;
  actual_amount: number;
  variance_amount: number | null;
  variance_percentage: number | null;
  unit_of_measure: string;
  bird_count: number;
  average_bird_weight?: number;
  bird_age_days: number;
  mortality_count: number;
  weight_gain?: number;
  fcr?: number | null;
  cumulative_fcr?: number | null;
  feed_cost_per_unit: number | null;
  total_feed_cost: number | null;
  cost_per_bird: number | null;
  currency: string;
  temperature?: number;
  humidity?: number;
  weather_condition?: string;
  feeding_efficiency: number;
  quality_score?: number;
  notes?: string;
}

interface Batch {
  id: number;
  batch_code: string;
  breed: string;
  current_bird_count: number;
  age_days: number;
}

interface FeedType {
  id: number;
  name: string;
  category: string;
  cost_per_kg: number;
}

interface FeedInventory {
  id: number;
  feed_type_id: number;
  batch_number: string;
  quantity: number;
  cost_per_unit: number;
}

interface Props {
  consumption_records: FeedConsumption[];
  batches: Batch[];
  feed_types: FeedType[];
  feed_inventory: FeedInventory[];
  filters?: {
    search?: string;
    batch_id?: string;
    feed_type?: string;
    date_from?: string;
    date_to?: string;
  };
}

const safeToFixed = (value: any, decimals: number = 2): string => {
  const num = Number(value || 0);
  return isNaN(num) ? '0.00' : num.toFixed(decimals);
};

// Currency formatting for RWF (Rwandan Franc)


// Navigation helpers using the new navigation utility
const navigateToSchedule = (scheduleId: number) => {
  router.visit(`/batch-incubator/schedules/${scheduleId}`);
};

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Feed Management',
    href: '/feed-management',
  },
  {
    title: 'Consumption',
    href: '/feed-management/consumption',
  },
];

export default function FeedConsumptionIndex({
  consumption_records = [],
  batches = [],
  feed_types = [],
  feed_inventory = [],
  filters
}: Props) {
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [batchFilter, setBatchFilter] = useState(filters?.batch_id || 'all');
  const [feedTypeFilter, setFeedTypeFilter] = useState(filters?.feed_type || 'all');
  const [dateFromFilter, setDateFromFilter] = useState(filters?.date_from || '');
  const [dateToFilter, setDateToFilter] = useState(filters?.date_to || '');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoadingBatchData, setIsLoadingBatchData] = useState(false);
  const [showExplanationPanel, setShowExplanationPanel] = useState(false);

  // Form state for adding consumption record
  const [newConsumption, setNewConsumption] = useState({
    batch_id: '',
    feed_type_id: '',
    feed_inventory_id: '',
    consumption_date: new Date().toISOString().split('T')[0],
    planned_amount: '',
    actual_amount: '',
    bird_count: '',
    average_bird_weight: '',
    mortality_count: '0',
    temperature: '',
    humidity: '',
    weather_condition: '',
    notes: '',
  });

  const getVarianceBadgeVariant = (percentage: number) => {
    if (Math.abs(percentage) <= 5) return 'outline';
    if (percentage > 5) return 'default';
    return 'destructive';
  };

  const getVarianceColor = (percentage: number) => {
    if (Math.abs(percentage) <= 5) return 'text-emerald-600';
    if (percentage > 5) return 'text-orange-600';
    return 'text-red-600';
  };

  const handleSearch = () => {
    const params: any = {};
    if (searchTerm) params.search = searchTerm;
    if (batchFilter !== 'all') params.batch_id = batchFilter;
    if (feedTypeFilter !== 'all') params.feed_type = feedTypeFilter;
    if (dateFromFilter) params.date_from = dateFromFilter;
    if (dateToFilter) params.date_to = dateToFilter;

    router.get('/feed-management/consumption', params, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  // Handler for auto-filling data when batch is selected
  const handleBatchChange = async (batchId: string) => {
    if (!batchId) {
      // If no batch selected, just clear the batch field
      setNewConsumption({...newConsumption, batch_id: ''});
      return;
    }

    // Update batch_id immediately
    setNewConsumption(prev => ({...prev, batch_id: batchId}));
    setIsLoadingBatchData(true);

    try {
      // Use fetch for API endpoints that return JSON
      const response = await fetch(`/feed-management/api/batch-details/${batchId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          // Include CSRF token from meta tag
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        credentials: 'same-origin', // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const batchData = await response.json();

      // Auto-fill form fields with batch data
      setNewConsumption(prev => ({
        ...prev,
        batch_id: batchId,
        bird_count: batchData.current_bird_count?.toString() || prev.bird_count,
        average_bird_weight: batchData.average_weight?.toString() || prev.average_bird_weight,
        mortality_count: batchData.mortality_count?.toString() || prev.mortality_count,
        temperature: batchData.temperature?.toString() || prev.temperature,
        humidity: batchData.humidity?.toString() || prev.humidity,
      }));

      // Show success notification with auto-filled data
      const autoFilledFields = [];
      if (batchData.current_bird_count) autoFilledFields.push(`Bird count: ${batchData.current_bird_count}`);
      if (batchData.average_weight) autoFilledFields.push(`Avg weight: ${batchData.average_weight}g`);
      if (batchData.temperature) autoFilledFields.push(`Temperature: ${batchData.temperature}°C`);
      if (batchData.humidity) autoFilledFields.push(`Humidity: ${batchData.humidity}%`);

      if (autoFilledFields.length > 0) {
        toast.success(
          `Auto-filled from batch ${batchData.batch_code}: ${autoFilledFields.join(', ')}`,
          { duration: 4000 }
        );
      } else {
        toast.info(`Selected batch: ${batchData.batch_code} (${batchData.breed})`);
      }
    } catch (error) { 
      toast.warning('Could not auto-fill batch data. Please enter manually.');
    } finally {
      setIsLoadingBatchData(false);
    }
  };

  // Handler for auto-selecting related data when feed inventory is selected
  const handleFeedInventoryChange = (inventoryId: string) => {
    if (!inventoryId) {
      // If no inventory selected, just clear the inventory field
      setNewConsumption({...newConsumption, feed_inventory_id: ''});
      return;
    }

    // Find the selected inventory item
    const selectedInventory = feed_inventory.find(inv => inv.id.toString() === inventoryId);

    if (selectedInventory) {
      // Find the related feed type
      const relatedFeedType = feed_types.find(ft => ft.id === selectedInventory.feed_type_id);

      // Calculate suggested planned amount based on selected batch if available
      let suggestedAmount = '';
      let suggestionNote = '';
      const selectedBatch = batches.find(b => b.id.toString() === newConsumption.batch_id);

      if (selectedBatch && relatedFeedType && selectedBatch.current_bird_count) {
        // Calculate suggested daily feed amount based on feed type and bird count
        const feedPerBirdKg = relatedFeedType.category.toLowerCase().includes('starter') ? 0.05 :
                             relatedFeedType.category.toLowerCase().includes('grower') ? 0.12 : 0.15;
        const totalSuggested = selectedBatch.current_bird_count * feedPerBirdKg;

        // Don't suggest more than available in inventory
        const maxAvailable = selectedInventory.quantity;
        suggestedAmount = Math.min(totalSuggested, maxAvailable).toFixed(2);
        suggestionNote = `for ${selectedBatch.current_bird_count} birds`;
      } else if (relatedFeedType && !selectedBatch) {
        // Suggest a reasonable default amount when no batch is selected
        const defaultAmount = relatedFeedType.category.toLowerCase().includes('starter') ? '5.0' :
                             relatedFeedType.category.toLowerCase().includes('grower') ? '12.0' : '15.0';
        const maxAvailable = selectedInventory.quantity;
        suggestedAmount = Math.min(parseFloat(defaultAmount), maxAvailable).toFixed(2);
        suggestionNote = 'estimated for 100 birds (adjust as needed)';
      } else if (!relatedFeedType) {
        // Fallback suggestion when feed type is not found
        suggestedAmount = Math.min(10, selectedInventory.quantity).toFixed(2);
        suggestionNote = 'general estimate (adjust as needed)';
      }

      // Auto-populate related fields
      const updatedConsumption = {
        ...newConsumption,
        feed_inventory_id: inventoryId,
        feed_type_id: selectedInventory.feed_type_id.toString(),
        // Auto-suggest planned amount if we calculated one
        ...(suggestedAmount && !newConsumption.planned_amount && { planned_amount: suggestedAmount })
      };

      setNewConsumption(updatedConsumption);

      // Show user-friendly notification with helpful info
      let message = `Auto-selected: ${relatedFeedType?.name || 'Feed type'} from batch ${selectedInventory.batch_number}`;
      if (suggestedAmount) {
        message += ` • Suggested amount: ${suggestedAmount}kg`;
      }
      message += ` • Available: ${selectedInventory.quantity}kg @ ${formatCurrency(selectedInventory.cost_per_unit)}/kg`;

      toast.success(message);
    } else {
      // Fallback if inventory not found
      setNewConsumption({...newConsumption, feed_inventory_id: inventoryId});
    }
  };

  const handleAddConsumption = (e: React.FormEvent) => {
    e.preventDefault();

    router.post('/feed-management/consumption', newConsumption, {
      onSuccess: () => {
        setShowAddDialog(false);
        setNewConsumption({
          batch_id: '',
          feed_type_id: '',
          feed_inventory_id: '',
          consumption_date: new Date().toISOString().split('T')[0],
          planned_amount: '',
          actual_amount: '',
          bird_count: '',
          average_bird_weight: '',
          mortality_count: '0',
          temperature: '',
          humidity: '',
          weather_condition: '',
          notes: '',
        });
        toast.success('Feed consumption recorded successfully');
      },
      onError: (errors) => {
        toast.error('Error recording consumption: ' + Object.values(errors)[0]);
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this consumption record?')) {
      router.delete(`/feed-management/consumption/${id}`, {
        onSuccess: () => {
          toast.success('Consumption record deleted successfully');
        },
        onError: () => {
          toast.error('Error deleting consumption record');
        }
      });
    }
  };

  const filteredConsumption = consumption_records.filter(record => {
    const matchesSearch = record.batch.batch_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.feed_type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (record.feed_inventory?.batch_number && record.feed_inventory.batch_number.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesBatch = batchFilter === 'all' || record.batch.id.toString() === batchFilter;
    const matchesFeedType = feedTypeFilter === 'all' || record.feed_type.id.toString() === feedTypeFilter;

    let matchesDateRange = true;
    if (dateFromFilter) {
      matchesDateRange = matchesDateRange && record.consumption_date >= dateFromFilter;
    }
    if (dateToFilter) {
      matchesDateRange = matchesDateRange && record.consumption_date <= dateToFilter;
    }

    return matchesSearch && matchesBatch && matchesFeedType && matchesDateRange;
  });

  // Calculate summary statistics
  const totalConsumption = filteredConsumption.reduce((sum, record) => sum + Number(record.actual_amount || 0), 0);
  const totalCost = filteredConsumption.reduce((sum, record) => sum + Number(record.total_feed_cost || 0), 0);
  const averageFCR = filteredConsumption.length > 0
    ? filteredConsumption.filter(r => r.fcr).reduce((sum, record) => sum + Number(record.fcr || 0), 0) / filteredConsumption.filter(r => r.fcr).length
    : 0;
  const averageVariance = filteredConsumption.length > 0
    ? filteredConsumption.reduce((sum, record) => sum + Math.abs(Number(record.variance_percentage || 0)), 0) / filteredConsumption.length
    : 0;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Feed Consumption Management" />

      <div className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                Feed Consumption
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowExplanationPanel(!showExplanationPanel)}
                      className="h-6 w-6 p-0"
                    >
                      <HelpCircle className="h-4 w-4 text-emerald-500 hover:text-emerald-700" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to {showExplanationPanel ? 'hide' : 'show'} the consumption records guide</p>
                  </TooltipContent>
                </Tooltip>
              </h1>
              <p className="text-gray-600">Track and analyze feed consumption patterns</p>

              {/* Quick Navigation Links */}
              <QuickNavigation
                links={[
                  {
                    label: "View Batches",
                    action: () => router.visit('/batch-incubator/batches')
                  },
                  {
                    label: "Feed Inventory",
                    action: () => router.visit('/feed-management/inventory')
                  }
                ]}
                className="mt-2"
              />
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Record Consumption
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle>Record Feed Consumption</DialogTitle>
                  <DialogDescription>
                    Record actual feed consumption for a batch
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddConsumption} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Feed Inventory - First for auto-selection */}
                    <div className="col-span-2">
                      <Label htmlFor="feed_inventory_id">
                        Feed Inventory (Auto-selects feed type & suggests amounts)
                        <span className="text-sm text-gray-500 ml-2">• Start here for best experience</span>
                      </Label>
                      <Select value={newConsumption.feed_inventory_id} onValueChange={handleFeedInventoryChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select inventory batch to auto-fill details" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=" ">
                            <span  className="text-gray-500 italic">Clear selection</span>
                          </SelectItem>
                          {feed_inventory
                            .filter(inv => !newConsumption.feed_type_id || inv.feed_type_id.toString() === newConsumption.feed_type_id)
                            .map((inv) => {
                              const feedType = feed_types.find(ft => ft.id === inv.feed_type_id);
                              return (
                                <SelectItem key={inv.id} value={inv.id.toString()}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{inv.batch_number}</span>
                                    <span className="text-sm text-gray-500">
                                      {feedType?.name} • {inv.quantity}kg @ {formatCurrency(inv.cost_per_unit)}/kg
                                    </span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="batch_id">
                        Batch (Auto-fills bird count, weight, temperature)
                        <span className="text-sm text-gray-500 ml-2">• Select to auto-populate data</span>
                      </Label>
                      <Select value={newConsumption.batch_id} onValueChange={handleBatchChange} disabled={isLoadingBatchData}>
                        <SelectTrigger>
                          <div className="flex items-center">
                            {isLoadingBatchData && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <SelectValue placeholder={isLoadingBatchData ? "Loading batch data..." : "Select batch to auto-fill data"} />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {batches.length > 0 ? (
                            batches.map((batch) => (
                              <SelectItem key={batch.id} value={batch.id.toString()}>
                                {batch.batch_code} - {batch.breed} ({batch.current_bird_count} birds, {batch.age_days} days)
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value=" " disabled>
                              <span className="text-gray-500 italic">No batches available</span>
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {batches.length === 0 && (
                        <p className="text-sm text-orange-600 mt-1">
                          No batches found. Create a batch in the Batch Incubator module first.
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="feed_type_id">Feed Type</Label>
                      <Select value={newConsumption.feed_type_id} onValueChange={(value) => setNewConsumption({...newConsumption, feed_type_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select feed type" />
                        </SelectTrigger>
                        <SelectContent>
                          {feed_types.map((type) => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                              {type.name} ({type.category})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="consumption_date">Consumption Date</Label>
                      <Input
                        id="consumption_date"
                        type="date"
                        value={newConsumption.consumption_date}
                        onChange={(e) => setNewConsumption({...newConsumption, consumption_date: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="planned_amount">Planned Amount (kg)</Label>
                      <Input
                        id="planned_amount"
                        type="number"
                        step="0.01"
                        value={newConsumption.planned_amount}
                        onChange={(e) => setNewConsumption({...newConsumption, planned_amount: e.target.value})}
                        placeholder="Planned feed amount"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="actual_amount">Actual Amount (kg)</Label>
                      <Input
                        id="actual_amount"
                        type="number"
                        step="0.01"
                        value={newConsumption.actual_amount}
                        onChange={(e) => setNewConsumption({...newConsumption, actual_amount: e.target.value})}
                        placeholder="Actual feed consumed"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="bird_count">
                        Bird Count
                        <span className="text-xs text-emerald-600 ml-2">• Auto-filled from batch</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="bird_count"
                          type="number"
                          value={newConsumption.bird_count}
                          onChange={(e) => setNewConsumption({...newConsumption, bird_count: e.target.value})}
                          placeholder="Number of birds"
                          disabled={isLoadingBatchData}
                          required
                        />
                        {isLoadingBatchData && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="average_bird_weight">
                        Average Bird Weight (g)
                        <span className="text-xs text-emerald-600 ml-2">• Auto-filled from batch</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="average_bird_weight"
                          type="number"
                          step="0.1"
                          value={newConsumption.average_bird_weight}
                          onChange={(e) => setNewConsumption({...newConsumption, average_bird_weight: e.target.value})}
                          placeholder="Average weight in grams"
                          disabled={isLoadingBatchData}
                        />
                        {isLoadingBatchData && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="mortality_count">
                        Mortality Count
                        <span className="text-xs text-emerald-600 ml-2">• Auto-filled from batch</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="mortality_count"
                          type="number"
                          step="0.1"
                          value={newConsumption.mortality_count}
                          onChange={(e) => setNewConsumption({...newConsumption, mortality_count: e.target.value})}
                          placeholder="Birds lost since last feeding"
                          disabled={isLoadingBatchData}
                        />
                        {isLoadingBatchData && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="temperature">
                        Temperature (°C)
                        <span className="text-xs text-emerald-600 ml-2">• Auto-filled from incubator</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="temperature"
                          type="number"
                          step="0.1"
                          value={newConsumption.temperature}
                          onChange={(e) => setNewConsumption({...newConsumption, temperature: e.target.value})}
                          placeholder="Average temperature"
                          disabled={isLoadingBatchData}
                        />
                        {isLoadingBatchData && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="weather_condition">Weather Condition</Label>
                      <Select value={newConsumption.weather_condition} onValueChange={(value) => setNewConsumption({...newConsumption, weather_condition: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="hot">Hot</SelectItem>
                          <SelectItem value="cold">Cold</SelectItem>
                          <SelectItem value="humid">Humid</SelectItem>
                          <SelectItem value="dry">Dry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newConsumption.notes}
                      onChange={(e) => setNewConsumption({...newConsumption, notes: e.target.value})}
                      placeholder="Additional observations or notes"
                      rows={3}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Record Consumption</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Consumption</CardTitle>
                <Scale className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Number(totalConsumption || 0).toLocaleString()} kg</div>
                <p className="text-xs text-muted-foreground">For selected period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
                <p className="text-xs text-muted-foreground">Feed costs (RWF)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average FCR</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{safeToFixed(averageFCR, 2)}</div>
                <p className="text-xs text-muted-foreground">Feed conversion ratio</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Variance</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{safeToFixed(averageVariance, 1)}%</div>
                <p className="text-xs text-muted-foreground">From planned amounts</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-64">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="search"
                      className="pl-10"
                      placeholder="Search by batch, feed type, or inventory batch..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="batch_filter">Batch</Label>
                  <Select value={batchFilter} onValueChange={setBatchFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Batches</SelectItem>
                      {batches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id.toString()}>
                          {batch.batch_code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="feed_type_filter">Feed Type</Label>
                  <Select value={feedTypeFilter} onValueChange={setFeedTypeFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Feed Types</SelectItem>
                      {feed_types.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date_from">From Date</Label>
                  <Input
                    id="date_from"
                    type="date"
                    value={dateFromFilter}
                    onChange={(e) => setDateFromFilter(e.target.value)}
                    className="w-40"
                  />
                </div>

                <div>
                  <Label htmlFor="date_to">To Date</Label>
                  <Input
                    id="date_to"
                    type="date"
                    value={dateToFilter}
                    onChange={(e) => setDateToFilter(e.target.value)}
                    className="w-40"
                  />
                </div>

                <Button onClick={handleSearch}>
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Feed Consumption Guide */}
          <ExplanationPanel
            isOpen={showExplanationPanel}
            onToggle={() => setShowExplanationPanel(!showExplanationPanel)}
          />

          {/* Consumption Records Table */}
          <Card>
            <CardHeader>
              <CardTitle>Consumption Records</CardTitle>
              <CardDescription>
                {filteredConsumption.length} record(s) found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <InfoTableHead tooltip="Date when the feed was consumed by the birds">
                        Date
                      </InfoTableHead>
                      <InfoTableHead tooltip="The specific batch of birds that consumed the feed. Click to view batch details.">
                        Batch
                      </InfoTableHead>
                      <InfoTableHead tooltip="Type of feed used. Click to view feed type information and nutritional details.">
                        Feed Type
                      </InfoTableHead>
                      <InfoTableHead tooltip="Compares the planned feed amount vs actual amount consumed. Helps track feeding accuracy.">
                        Planned vs Actual
                      </InfoTableHead>
                      <InfoTableHead tooltip="Difference between planned and actual consumption. Positive means over-consumption, negative means under-consumption.">
                        Variance
                      </InfoTableHead>
                      <InfoTableHead tooltip="Number of birds present in the batch during feeding">
                        Birds
                      </InfoTableHead>
                      <InfoTableHead tooltip="Feed Conversion Ratio - measures how efficiently birds convert feed to body weight. Lower is better.">
                        FCR
                      </InfoTableHead>
                      <InfoTableHead tooltip="Total cost of feed consumed, calculated from quantity and unit price">
                        Cost
                      </InfoTableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredConsumption.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <InfoField
                            value={
                              <div>
                                <div className="font-medium">{formatDate(record.consumption_date)}</div>
                                {record.weather_condition && (
                                  <div className="text-sm text-gray-500 capitalize">{record.weather_condition}</div>
                                )}
                              </div>
                            }
                            tooltip={`Feed consumption date: ${formatDate(record.consumption_date)}. ${record.weather_condition ? `Weather: ${record.weather_condition}. Weather conditions can affect bird feeding behavior and consumption patterns.` : 'No weather data recorded for this feeding.'}`}
                            // icon={Calendar}
                          />
                        </TableCell>
                        <TableCell>
                          <EntityLink
                            id={record.batch.id}
                            label={record.batch.batch_code}
                            onClick={(id) => navigateToBatch(id)}
                            className="font-medium text-emerald-600 text-start hover:text-emerald-800"
                            description={record.batch.breed}
                          />
                        </TableCell>
                        <TableCell>
                            {record.feed_type.category}
                          {record.feed_inventory && (
                            <NavigationLink
                                        onClick={() => navigateToInventory(record.feed_inventory!.batch_number)}
                              className="text-xs text-purple-600 hover:text-purple-800 mt-1"
                              size="sm"
                            >
                              Batch: {record.feed_inventory.batch_number}
                            </NavigationLink>
                          )}
                        </TableCell>
                        <TableCell>
                          <InfoField
                            value={
                              <div>
                                <div className="font-medium">
                                  {record.planned_amount} → {record.actual_amount} {record.unit_of_measure}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Diff: {Number(record.variance_amount || 0) > 0 ? '+' : ''}{safeToFixed(record.variance_amount, 1)} {record.unit_of_measure}
                                </div>
                              </div>
                            }
                            tooltip={`Planned: ${record.planned_amount} ${record.unit_of_measure} of feed was expected. Actual: ${record.actual_amount} ${record.unit_of_measure} was consumed. Difference shows feeding accuracy and potential issues.`}
                            // icon={Scale}
                          />
                        </TableCell>
                        <TableCell>
                          <InfoField
                            value={
                              <Badge variant={getVarianceBadgeVariant(Number(record.variance_percentage || 0))}>
                                <span className={getVarianceColor(Number(record.variance_percentage || 0))}>
                                  {Number(record.variance_percentage || 0) > 0 ? '+' : ''}{safeToFixed(record.variance_percentage, 1)}%
                                </span>
                              </Badge>
                            }
                            tooltip={`${Number(record.variance_percentage || 0) > 0 ? 'Over-consumption' : Number(record.variance_percentage || 0) < 0 ? 'Under-consumption' : 'Perfect consumption'}: ${Math.abs(Number(record.variance_percentage || 0))}% variance from planned amount. Green = good, yellow = caution, red = attention needed.`}
                            icon={Number(record.variance_percentage || 0) > 0 ? TrendingUp : TrendingDown}
                          />
                        </TableCell>
                        <TableCell>
                          <InfoField
                            value={
                              <div>
                                <div className="font-medium">{record.bird_count} birds</div>
                                <div className="text-sm text-gray-500">{record.bird_age_days} days old</div>
                                {record.average_bird_weight && (
                                  <div className="text-sm text-gray-500">{record.average_bird_weight}g avg</div>
                                )}
                                {record.mortality_count > 0 && (
                                  <div className="text-sm text-red-600">-{record.mortality_count} mortality</div>
                                )}
                              </div>
                            }
                            tooltip={`${record.bird_count} birds were present during feeding, aged ${record.bird_age_days} days. ${record.average_bird_weight ? `Average weight per bird: ${record.average_bird_weight}g. ` : ''}${record.mortality_count > 0 ? `${record.mortality_count} birds died recently, affecting feeding calculations.` : 'No recent mortality reported.'}`}
                            // icon={Calculator}
                          />
                        </TableCell>
                        <TableCell>
                          <InfoField
                            value={
                              <div>
                                {record.fcr && (
                                  <>
                                    <div className="font-medium">{safeToFixed(record.fcr, 3)}</div>
                                    {record.cumulative_fcr && (
                                      <div className="text-sm text-gray-500">Cum: {safeToFixed(record.cumulative_fcr, 3)}</div>
                                    )}
                                  </>
                                )}
                              </div>
                            }
                            tooltip={`Feed Conversion Ratio (FCR): ${safeToFixed(record.fcr, 3)} means it takes ${safeToFixed(record.fcr, 3)}kg of feed to produce 1kg of bird weight. Lower FCR = better efficiency. ${record.cumulative_fcr ? `Cumulative FCR (${safeToFixed(record.cumulative_fcr, 3)}) shows overall batch efficiency since start.` : ''} Industry standard is usually 1.5-2.2.`}
                            icon={BarChart3}
                          />
                        </TableCell>
                        <TableCell>
                          <InfoField
                            value={
                              <div>
                                <div className="font-medium">
                                  {formatCurrency(record.total_feed_cost)}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {formatCurrency(record.cost_per_bird)}/bird
                                </div>
                                <div className="text-xs text-gray-400">
                                  @ {formatCurrency(record.feed_cost_per_unit)}/{record.unit_of_measure}
                                </div>
                              </div>
                            }
                            tooltip={`Total cost: ${formatCurrency(record.total_feed_cost)} for ${record.actual_amount} ${record.unit_of_measure} of feed. Cost per bird: ${formatCurrency(record.cost_per_bird)}. Unit price: ${formatCurrency(record.feed_cost_per_unit)} per ${record.unit_of_measure}. Helps track feed expenses and budget planning.`}
                            // icon={DollarSign}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.get(`/feed-management/consumption/${record.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(record.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredConsumption.length === 0 && (
                <div className="text-center py-8">
                  <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No consumption records found</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </AppLayout>
  );
}
