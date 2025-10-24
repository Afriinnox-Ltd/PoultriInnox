import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
    Package,
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    AlertTriangle,
    Clock,
    DollarSign,
    Truck,
    Calendar,
    Scale,
    Info,
    HelpCircle,
    Warehouse,
    ShieldCheck
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { toast } from 'sonner';
import { NavigationHelper, navigateToFeedConsumption, navigateToFeedType, navigateToInventory } from '@/utils/navigation';
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
      <div className={`cursor-help ${className}`}>
        {Icon && <div className="flex items-center gap-1"><Icon className="h-3 w-3 text-gray-400" />{value}</div>}
        {!Icon && value}
      </div>
    </TooltipTrigger>
    <TooltipContent>
      <p className="max-w-xs">{tooltip}</p>
    </TooltipContent>
  </Tooltip>
);

// Explanation panel component for inventory
const InventoryExplanationPanel = ({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) => (
  <Card className={`mb-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-95'}`}>
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <Info className="h-4 w-4" />
          Feed Inventory Guide
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
              <Package className="h-3 w-3" />
              Basic Information
            </h4>
            <ul className="space-y-1 text-gray-600">
              <li><strong>Feed Type:</strong> Type and category of feed stored</li>
              <li><strong>Batch Number:</strong> Supplier's batch/lot identifier</li>
              <li><strong>Internal Code:</strong> Your internal tracking code</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-emerald-600 flex items-center gap-1">
              <Scale className="h-3 w-3" />
              Quantity & Status
            </h4>
            <ul className="space-y-1 text-gray-600">
              <li><strong>Current Quantity:</strong> Available stock amount</li>
              <li><strong>Original Quantity:</strong> Initially received amount</li>
              <li><strong>Reserved:</strong> Allocated for specific use</li>
              <li><strong>Status:</strong> Active, Low Stock, Expired, or Depleted</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-purple-600 flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Financial & Dates
            </h4>
            <ul className="space-y-1 text-gray-600">
              <li><strong>Unit Cost:</strong> Price per kilogram</li>
              <li><strong>Total Value:</strong> Current stock value</li>
              <li><strong>Expiry Date:</strong> Use-by date for quality</li>
              <li><strong>Storage:</strong> Physical location in warehouse</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
          <p className="text-xs text-emerald-700 flex items-center gap-1">
            <Info className="h-3 w-3" />
            <strong>Tip:</strong> Click on feed types to view detailed information. Use the consumption link to see how inventory is being used.
          </p>
        </div>
      </CardContent>
    )}
  </Card>
);

interface FeedInventory {
    id: number;
    feed_type: {
        id: number;
        name: string;
        category: string;
        protein_content: number;
    };
    supplier?: {
        id: number;
        name: string;
    };
    batch_number: string;
    internal_code?: string;
    quantity: number;
    original_quantity: number;
    reserved_quantity: number;
    unit_of_measure: string;
    cost_per_unit: number;
    total_cost: number;
    currency: string;
    received_date: string;
    production_date?: string;
    expiry_date: string;
    formatted_expiry_date?: string;
    formatted_received_date?: string;
    formatted_production_date?: string;
    days_until_expiry: number;
    quality_approved: boolean;
    storage_location: string;
    warehouse_section?: string;
    reorder_point: number;
    status: 'active' | 'expired' | 'low_stock' | 'depleted';
}

interface FeedType {
    id: number;
    name: string;
    category: string;
}

interface FeedSupplier {
    id: number;
    name: string;
}

interface Props {
    inventory: FeedInventory[];
    feedTypes: FeedType[];
    suppliers: FeedSupplier[];
    availableBatchNumbers: string[];
    stats: {
        total_items: number;
        low_stock_items: number;
        total_value: number;
        expiring_soon: number;
    };
    filters?: {
        search?: string;
        feed_type?: string;
        status?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Feed Management',
        href: '/feed-management',
    },
    {
        title: 'Inventory',
        href: '/feed-management/inventory',
    },
];

export default function FeedInventoryIndex({
    inventory = [],
    feedTypes = [],
    suppliers = [],
    availableBatchNumbers = [],
    stats = { total_items: 0, low_stock_items: 0, total_value: 0, expiring_soon: 0 },
    filters
}: Props) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [feedTypeFilter, setFeedTypeFilter] = useState(filters?.feed_type || 'all');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showAdjustDialog, setShowAdjustDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState<FeedInventory | null>(null);
    const [allowNewBatchNumber, setAllowNewBatchNumber] = useState(false);
    const [showExplanationPanel, setShowExplanationPanel] = useState(false);

    // Form state for adding inventory
    const [newInventory, setNewInventory] = useState({
        feed_type_id: '',
        supplier_id: '',
        batch_number: '',
        internal_code: '',
        quantity: '',
        cost_per_unit: '',
        received_date: '',
        production_date: '',
        expiry_date: '',
        storage_location: '',
        warehouse_section: '',
        reorder_point: '',
        quality_notes: '',
    });

    // Form state for quantity adjustment
    const [adjustment, setAdjustment] = useState({
        adjustment_type: 'add', // 'add' or 'subtract'
        quantity: '',
        reason: '',
        notes: '',
    });

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'expired':
                return 'destructive';
            case 'low_stock':
                return 'default';
            case 'depleted':
                return 'secondary';
            case 'active':
            default:
                return 'outline';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'expired':
                return 'text-red-600';
            case 'low_stock':
                return 'text-orange-600';
            case 'depleted':
                return 'text-gray-600';
            case 'active':
            default:
                return 'text-emerald-600';
        }
    };

    const handleSearch = () => {
        const params: any = {};
        if (searchTerm) params.search = searchTerm;
        if (feedTypeFilter !== 'all') params.feed_type = feedTypeFilter;
        if (statusFilter !== 'all') params.status = statusFilter;

        router.get('/feed-management/inventory', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleAddInventory = (e: React.FormEvent) => {
        e.preventDefault();

        router.post('/feed-management/inventory', newInventory, {
            onSuccess: () => {
                setShowAddDialog(false);
                setAllowNewBatchNumber(false);
                setNewInventory({
                    feed_type_id: '',
                    supplier_id: '',
                    batch_number: '',
                    internal_code: '',
                    quantity: '',
                    cost_per_unit: '',
                    received_date: '',
                    production_date: '',
                    expiry_date: '',
                    storage_location: '',
                    warehouse_section: '',
                    reorder_point: '',
                    quality_notes: '',
                });
                toast.success('Feed inventory added successfully');
            },
            onError: (errors) => {
                toast.error('Error adding inventory: ' + Object.values(errors)[0]);
            }
        });
    };

    const handleAdjustQuantity = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedItem) return;

        router.post(`/feed-management/inventory/${selectedItem.id}/adjust-stock`, adjustment, {
            onSuccess: () => {
                setShowAdjustDialog(false);
                setSelectedItem(null);
                setAdjustment({
                    adjustment_type: 'add',
                    quantity: '',
                    reason: '',
                    notes: '',
                });
                toast.success('Quantity adjusted successfully');
            },
            onError: (errors) => {
                toast.error('Error adjusting quantity: ' + Object.values(errors)[0]);
            }
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this inventory item?')) {
            router.delete(`/feed-management/inventory/${id}`, {
                onSuccess: () => {
                    toast.success('Inventory item deleted successfully');
                },
                onError: () => {
                    toast.error('Error deleting inventory item');
                }
            });
        }
    };

    const filteredInventory = inventory.filter(item => {
        const matchesSearch = item.feed_type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.internal_code && item.internal_code.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesFeedType = feedTypeFilter === 'all' || item.feed_type.id.toString() === feedTypeFilter;
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

        return matchesSearch && matchesFeedType && matchesStatus;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Feed Inventory Management" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Feed Inventory</h1>
                            <p className="text-gray-600">Manage your feed stock and monitor inventory levels</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowExplanationPanel(!showExplanationPanel)}
                            >
                                <Info className="h-4 w-4 mr-2" />
                                {showExplanationPanel ? 'Hide' : 'Show'} Guide
                            </Button>
                            <Dialog open={showAddDialog} onOpenChange={(open) => {
                            setShowAddDialog(open);
                            if (!open) {
                                setAllowNewBatchNumber(false);
                                setNewInventory({
                                    feed_type_id: '',
                                    supplier_id: '',
                                    batch_number: '',
                                    internal_code: '',
                                    quantity: '',
                                    cost_per_unit: '',
                                    received_date: '',
                                    production_date: '',
                                    expiry_date: '',
                                    storage_location: '',
                                    warehouse_section: '',
                                    reorder_point: '',
                                    quality_notes: '',
                                });
                            }
                        }}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Inventory
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="min-w-4xl h-[80vh] overflow-auto ">
                                <DialogHeader>
                                    <DialogTitle>Add Feed Inventory</DialogTitle>
                                    <DialogDescription>
                                        Add new feed stock to your inventory
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleAddInventory} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="feed_type_id">Feed Type</Label>
                                            <Select value={newInventory.feed_type_id} onValueChange={(value) => setNewInventory({ ...newInventory, feed_type_id: value })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select feed type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {feedTypes.map((type) => (
                                                        <SelectItem key={type.id} value={type.id.toString()}>
                                                            {type.name} ({type.category})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="supplier_id">Supplier</Label>
                                            <Select value={newInventory.supplier_id} onValueChange={(value) => setNewInventory({ ...newInventory, supplier_id: value })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select supplier" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {suppliers.map((supplier) => (
                                                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                                            {supplier.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="batch_number">Batch Number</Label>
                                            {availableBatchNumbers.length > 0 && !allowNewBatchNumber ? (
                                                <div className="space-y-2">
                                                    <Select
                                                        value={newInventory.batch_number}
                                                        onValueChange={(value) => {
                                                            if (value === "new_batch") {
                                                                setAllowNewBatchNumber(true);
                                                                setNewInventory({ ...newInventory, batch_number: '' });
                                                            } else {
                                                                setNewInventory({ ...newInventory, batch_number: value });
                                                            }
                                                        }}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select existing batch or create new" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {availableBatchNumbers.map((batchNumber) => (
                                                                <SelectItem key={batchNumber} value={batchNumber}>
                                                                    {batchNumber}
                                                                </SelectItem>
                                                            ))}
                                                            <SelectItem value="new_batch" className="font-semibold text-emerald-600">
                                                                + Create New Batch Number
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <Input
                                                        id="batch_number"
                                                        value={newInventory.batch_number}
                                                        onChange={(e) => setNewInventory({ ...newInventory, batch_number: e.target.value })}
                                                        placeholder="Enter batch/lot number"
                                                        required
                                                    />
                                                    {availableBatchNumbers.length > 0 && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setAllowNewBatchNumber(false);
                                                                setNewInventory({ ...newInventory, batch_number: '' });
                                                            }}
                                                        >
                                                            ← Back to existing batches
                                                        </Button>
                                                    )}
                                                    {availableBatchNumbers.length === 0 && (
                                                        <p className="text-sm text-gray-500">No existing batch numbers. Creating the first one.</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>                    <div>
                                            <Label htmlFor="internal_code">Internal Code</Label>
                                            <Input
                                                id="internal_code"
                                                value={newInventory.internal_code}
                                                onChange={(e) => setNewInventory({ ...newInventory, internal_code: e.target.value })}
                                                placeholder="Internal tracking code"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="quantity">Quantity (kg)</Label>
                                            <Input
                                                id="quantity"
                                                type="number"
                                                step="0.01"
                                                value={newInventory.quantity}
                                                onChange={(e) => setNewInventory({ ...newInventory, quantity: e.target.value })}
                                                placeholder="Quantity received"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="cost_per_unit">Cost per Unit ($)</Label>
                                            <Input
                                                id="cost_per_unit"
                                                type="number"
                                                step="0.01"
                                                value={newInventory.cost_per_unit}
                                                onChange={(e) => setNewInventory({ ...newInventory, cost_per_unit: e.target.value })}
                                                placeholder="Cost per kg"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="received_date">Received Date</Label>
                                            <Input
                                                id="received_date"
                                                type="date"
                                                value={newInventory.received_date}
                                                onChange={(e) => setNewInventory({ ...newInventory, received_date: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="production_date">Production Date</Label>
                                            <Input
                                                id="production_date"
                                                type="date"
                                                value={newInventory.production_date}
                                                onChange={(e) => setNewInventory({ ...newInventory, production_date: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="expiry_date">Expiry Date</Label>
                                            <Input
                                                id="expiry_date"
                                                type="date"
                                                value={newInventory.expiry_date}
                                                onChange={(e) => setNewInventory({ ...newInventory, expiry_date: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="storage_location">Storage Location</Label>
                                            <Input
                                                id="storage_location"
                                                value={newInventory.storage_location}
                                                onChange={(e) => setNewInventory({ ...newInventory, storage_location: e.target.value })}
                                                placeholder="Storage location"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="warehouse_section">Warehouse Section</Label>
                                            <Input
                                                id="warehouse_section"
                                                value={newInventory.warehouse_section}
                                                onChange={(e) => setNewInventory({ ...newInventory, warehouse_section: e.target.value })}
                                                placeholder="Section/bay"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="reorder_point">Reorder Point (kg)</Label>
                                            <Input
                                                id="reorder_point"
                                                type="number"
                                                step="0.01"
                                                value={newInventory.reorder_point}
                                                onChange={(e) => setNewInventory({ ...newInventory, reorder_point: e.target.value })}
                                                placeholder="Alert threshold"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="quality_notes">Quality Notes</Label>
                                        <Textarea
                                            id="quality_notes"
                                            value={newInventory.quality_notes}
                                            onChange={(e) => setNewInventory({ ...newInventory, quality_notes: e.target.value })}
                                            placeholder="Quality inspection notes"
                                            rows={3}
                                        />
                                    </div>

                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit">Add Inventory</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                        </div>
                    </div>

                    {/* Inventory Guide */}
                    <InventoryExplanationPanel
                        isOpen={showExplanationPanel}
                        onToggle={() => setShowExplanationPanel(!showExplanationPanel)}
                    />

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
                                            placeholder="Search by feed type, batch number, or internal code..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="feed_type_filter">Feed Type</Label>
                                    <Select value={feedTypeFilter} onValueChange={setFeedTypeFilter}>
                                        <SelectTrigger className="w-48">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Feed Types</SelectItem>
                                            {feedTypes.map((type) => (
                                                <SelectItem key={type.id} value={type.id.toString()}>
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="status_filter">Status</Label>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="low_stock">Low Stock</SelectItem>
                                            <SelectItem value="expired">Expired</SelectItem>
                                            <SelectItem value="depleted">Depleted</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button onClick={handleSearch}>
                                    <Filter className="h-4 w-4 mr-2" />
                                    Apply Filters
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Inventory Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory Items</CardTitle>
                            <CardDescription>
                                {filteredInventory.length} item(s) found
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <InfoTableHead tooltip="Type and category of feed. Click on feed names to view detailed nutritional information.">
                                                Feed Type
                                            </InfoTableHead>
                                            <InfoTableHead tooltip="Supplier's batch/lot number for tracking. Internal codes help with your own inventory system.">
                                                Batch Number
                                            </InfoTableHead>
                                            <InfoTableHead tooltip="Current available quantity vs original received amount. Reserved shows allocated stock.">
                                                Quantity
                                            </InfoTableHead>
                                            <InfoTableHead tooltip="Cost per unit (kilogram) of feed as purchased from supplier.">
                                                Unit Cost
                                            </InfoTableHead>
                                            <InfoTableHead tooltip="Total value of current stock (quantity × unit cost).">
                                                Total Value
                                            </InfoTableHead>
                                            <InfoTableHead tooltip="Use-by date for quality. Color coding: red = expired soon, orange = expiring, green = fresh.">
                                                Expiry Date
                                            </InfoTableHead>
                                            <InfoTableHead tooltip="Physical storage location in warehouse, including specific sections or bays.">
                                                Storage
                                            </InfoTableHead>
                                            <InfoTableHead tooltip="Current inventory status: Active = normal, Low Stock = below reorder point, Expired = past use-by date, Depleted = empty.">
                                                Status
                                            </InfoTableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredInventory.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <InfoField
                                                        value={
                                                            <div>
                                                                {item.feed_type.name}
                                                                <div className="text-sm text-gray-500">{item.feed_type.category}</div>
                                                                {item.feed_type.protein_content && (
                                                                    <div className="text-xs text-emerald-600">{item.feed_type.protein_content}% protein</div>
                                                                )}
                                                            </div>
                                                        }
                                                        tooltip={`${item.feed_type.name} is a ${item.feed_type.category} feed${item.feed_type.protein_content ? ` with ${item.feed_type.protein_content}% protein content` : ''}. Click to view detailed nutritional information and feeding guidelines.`}

                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <InfoField
                                                        value={
                                                            <div>
                                                                {item.batch_number && (
                                                                    <div className="font-medium">{item.batch_number}</div>
                                                                )}
                                                                {item.internal_code && (
                                                                    <div className="text-sm text-gray-500">{item.internal_code}</div>
                                                                )}
                                                            </div>
                                                        }
                                                        tooltip={`Batch: ${item.batch_number} - Supplier's tracking number for this specific production lot. ${item.internal_code ? `Internal code: ${item.internal_code} for your inventory system.` : 'No internal code assigned.'} Use for quality control and traceability.`}

                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <InfoField
                                                        value={
                                                            <div>
                                                                <div className="font-medium">{item.quantity} {item.unit_of_measure}</div>
                                                                <div className="text-sm text-gray-500">
                                                                    Original: {item.original_quantity} {item.unit_of_measure}
                                                                </div>
                                                                {item.reserved_quantity > 0 && (
                                                                    <div className="text-sm text-orange-600">
                                                                        Reserved: {item.reserved_quantity} {item.unit_of_measure}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        }
                                                        tooltip={`Current available: ${item.quantity} ${item.unit_of_measure}. Originally received: ${item.original_quantity} ${item.unit_of_measure}. ${item.reserved_quantity > 0 ? `${item.reserved_quantity} ${item.unit_of_measure} is reserved for specific batches or schedules.` : 'No reservations on this stock.'} Available for consumption: ${item.quantity - item.reserved_quantity} ${item.unit_of_measure}.`}

                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <InfoField
                                                        value={
                                                            <div className="font-medium">
                                                                {item.currency} {Number(item.cost_per_unit || 0).toFixed(2)}
                                                            </div>
                                                        }
                                                        tooltip={`Cost per ${item.unit_of_measure}: ${item.currency} ${Number(item.cost_per_unit || 0).toFixed(2)}. This is the purchase price from supplier, used to calculate total inventory value and feeding costs.`}

                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <InfoField
                                                        value={
                                                            <div className="font-medium">
                                                                {item.currency} {Number(item.total_cost || 0).toFixed(2)}
                                                            </div>
                                                        }
                                                        tooltip={`Total value of current stock: ${item.currency} ${Number(item.total_cost || 0).toFixed(2)} (${item.quantity} ${item.unit_of_measure} × ${item.currency} ${Number(item.cost_per_unit || 0).toFixed(2)}). Represents current inventory investment.`}

                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <InfoField
                                                        value={
                                                            <div>
                                                                <div className="font-medium">{item.formatted_expiry_date || item.expiry_date}</div>
                                                                <div className={`text-sm ${item.days_until_expiry < 7 ? 'text-red-600' :
                                                                    item.days_until_expiry < 30 ? 'text-orange-600' : 'text-emerald-600'}`}>
                                                                    {item.days_until_expiry} days left
                                                                </div>
                                                            </div>
                                                        }
                                                        tooltip={`Expires on: ${item.formatted_expiry_date || item.expiry_date}. ${item.days_until_expiry} days remaining. ${item.days_until_expiry < 7 ? 'URGENT: Use immediately or discard.' : item.days_until_expiry < 30 ? 'CAUTION: Use soon to avoid waste.' : 'GOOD: Fresh stock with adequate shelf life.'} Feed quality degrades after expiry.`}

                                                        className={item.days_until_expiry < 7 ? 'text-red-600' : item.days_until_expiry < 30 ? 'text-orange-600' : 'text-emerald-600'}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <InfoField
                                                        value={
                                                            <div>
                                                                <div className="font-medium">{item.storage_location}</div>
                                                                {item.warehouse_section && (
                                                                    <div className="text-sm text-gray-500">{item.warehouse_section}</div>
                                                                )}
                                                            </div>
                                                        }
                                                        tooltip={`Stored at: ${item.storage_location}${item.warehouse_section ? `, Section: ${item.warehouse_section}` : ''}. This helps locate the feed quickly and maintain proper storage conditions. Ensure proper temperature  for feed quality.`}

                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <InfoField
                                                        value={
                                                            <Badge variant={getStatusBadgeVariant(item.status)}>
                                                                {item.status.replace('_', ' ')}
                                                            </Badge>
                                                        }
                                                        tooltip={`Status: ${item.status.replace('_', ' ').toUpperCase()}. ${
                                                            item.status === 'active' ? 'Normal stock level, ready for use.' :
                                                            item.status === 'low_stock' ? `Below reorder point (${item.reorder_point} ${item.unit_of_measure}). Consider ordering more.` :
                                                            item.status === 'expired' ? 'Past expiry date. Do not use for feeding.' :
                                                            item.status === 'depleted' ? 'Stock is empty. Reorder immediately.' :
                                                            'Unknown status.'
                                                        }`}
                                                        icon={ShieldCheck}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col space-y-2">
                                                        <div className="flex space-x-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedItem(item);
                                                                    setShowAdjustDialog(true);
                                                                }}
                                                            >
                                                                <Scale className="h-4 w-4" />
                                                            </Button>

                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDelete(item.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>

                                                        {/* Quick Navigation */}
                                                        <div className="flex gap-1">
                                                            <NavigationLink
                                                                onClick={() => navigateToFeedConsumption(null, item.id)}
                                                                size="sm"
                                                                variant="button"
                                                                className="text-xs"
                                                            >
                                                                Consumption
                                                            </NavigationLink>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {filteredInventory.length === 0 && (
                                <div className="text-center py-8">
                                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No inventory items found</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quantity Adjustment Dialog */}
                    <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Adjust Quantity</DialogTitle>
                                <DialogDescription>
                                    Adjust the quantity for {selectedItem?.feed_type.name} - {selectedItem?.batch_number}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAdjustQuantity} className="space-y-4">
                                <div>
                                    <Label htmlFor="adjustment_type">Adjustment Type</Label>
                                    <Select value={adjustment.adjustment_type} onValueChange={(value) => setAdjustment({ ...adjustment, adjustment_type: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="add">Add Quantity</SelectItem>
                                            <SelectItem value="subtract">Subtract Quantity</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="adj_quantity">Quantity</Label>
                                    <Input
                                        id="adj_quantity"
                                        type="number"
                                        step="0.01"
                                        value={adjustment.quantity}
                                        onChange={(e) => setAdjustment({ ...adjustment, quantity: e.target.value })}
                                        placeholder="Adjustment quantity"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="reason">Reason</Label>
                                    <Select value={adjustment.reason} onValueChange={(value) => setAdjustment({ ...adjustment, reason: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select reason" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="consumption">Feed Consumption</SelectItem>
                                            <SelectItem value="waste">Waste/Spoilage</SelectItem>
                                            <SelectItem value="transfer">Transfer</SelectItem>
                                            <SelectItem value="inventory_correction">Inventory Correction</SelectItem>
                                            <SelectItem value="additional_stock">Additional Stock</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={adjustment.notes}
                                        onChange={(e) => setAdjustment({ ...adjustment, notes: e.target.value })}
                                        placeholder="Additional notes"
                                        rows={3}
                                    />
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setShowAdjustDialog(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">Adjust Quantity</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                </div>
            </div>
        </AppLayout>
    );
}
