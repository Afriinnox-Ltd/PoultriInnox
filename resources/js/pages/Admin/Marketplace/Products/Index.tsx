import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Search,
    Eye,
    Check,
    X,
    Pause,
    Play,
    Package,
    DollarSign,
    Star,
    TrendingUp,
    Filter,
    MoreHorizontal,
    Image as ImageIcon
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface Product {
    id: number;
    vendor_id: number;
    category_id: number;
    name: string;
    description: string;
    price: number;
    compare_price: number | null;
    cost_price: number | null;
    sku: string;
    barcode: string | null;
    quantity: number;
    min_quantity: number;
    weight: number | null;
    dimensions: string | null;
    status: 'active' | 'inactive' | 'pending' | 'rejected';
    is_featured: boolean;
    is_digital: boolean;
    requires_shipping: boolean;
    tags: string | null;
    meta_title: string | null;
    meta_description: string | null;
    views_count: number;
    sales_count: number;
    rating: number;
    reviews_count: number;
    rejection_reason: string | null;
    created_at: string;
    updated_at: string;
    vendor: {
        business_name: string;
        contact_person: string;
    };
    category: {
        name: string;
    };
    images: Array<{
        id: number;
        image_path: string;
        alt_text: string;
        is_primary: boolean;
    }>;
}

interface ProductAdminProps {
    products: {
        data: Product[];
        links?: any[];
        meta?: {
            total: number;
            from: number;
            to: number;
            last_page: number;
            current_page: number;
        };
    };
    filters: {
        search?: string;
        status?: string;
        category?: string;
        vendor?: string;
    };
    stats?: {
        total: number;
        active: number;
        pending: number;
        rejected: number;
        inactive: number;
    };
    categories: Array<{
        id: number;
        name: string;
    }>;
}

export default function ProductAdmin({ products, filters, stats = { total: 0, active: 0, pending: 0, rejected: 0, inactive: 0 }, categories }: ProductAdminProps) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');

    const handleSearch = () => {
        router.get('/admin/marketplace/products', {
            search: searchTerm,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            category: categoryFilter !== 'all' ? categoryFilter : undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('rw-RW', {
            style: 'currency',
            currency: 'RWF'
        }).format(amount);
    };

    const handleApprove = (product: Product) => {
        if (confirm(`Are you sure you want to approve "${product.name}"?`)) {
            router.post(`/admin/marketplace/products/${product.id}/approve`);
        }
    };

    const handleReject = (product: Product) => {
        const reason = prompt(`Please provide a reason for rejecting "${product.name}":`);
        if (reason) {
            router.post(`/admin/marketplace/products/${product.id}/reject`, {
                reason: reason
            });
        }
    };

    const handleToggleStatus = (product: Product) => {
        const newStatus = product.status === 'active' ? 'inactive' : 'active';
        if (confirm(`Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} "${product.name}"?`)) {
            router.post(`/admin/marketplace/products/${product.id}/toggle-status`, {
                status: newStatus
            });
        }
    };

    const handleToggleFeatured = (product: Product) => {
        router.post(`/admin/marketplace/products/${product.id}/toggle-featured`);
    };

    const viewDetails = (product: Product) => {
        setSelectedProduct(product);
        setShowDetailsDialog(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-emerald-100 text-emerald-700 border-emerald-300';
            case 'pending':
                return 'bg-orange-100 text-orange-700 border-orange-300';
            case 'rejected':
                return 'bg-red-100 text-red-700 border-red-300';
            case 'inactive':
                return 'bg-gray-100 text-gray-700 border-gray-300';
            default:
                return '';
        }
    };

    const getStatusVariant = (status: string): "default" | "destructive" | "outline" | "secondary" => {
        switch (status) {
            case 'active':
                return 'default';
            case 'rejected':
                return 'destructive';
            case 'inactive':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    return (
        <AdminLayout>
            <Head title="Product Management" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Product Management</h2>
                        <p className="text-muted-foreground">
                            Review and manage marketplace products
                        </p>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active</CardTitle>
                            <Check className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{stats?.active}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Pause className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats?.pending}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                            <X className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats?.rejected}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                            <Pause className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-600">{stats?.inactive}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <Label htmlFor="search">Search Products</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Search by name, SKU, or description..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="category">Category</Label>
                                <select
                                    id="category"
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Button onClick={handleSearch}>
                                <Filter className="h-4 w-4 mr-2" />
                                Apply Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Products Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Products ({products.meta?.total || products?.data?.length})</CardTitle>
                        <CardDescription>
                            Manage all marketplace products
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Vendor</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead>Sales</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products?.data?.length > 0 ? (
                                    products?.data?.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    {product?.images?.length > 0 ? (
                                                        <img
                                                            src={product.images.find(img => img.is_primary)?.image_path || product.images[0].image_path}
                                                            alt={product.name}
                                                            className="h-12 w-12 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                                                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-medium">{product.name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            SKU: {product.sku}
                                                        </div>
                                                        {product.is_featured && (
                                                            <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700 border-yellow-300">
                                                                Featured
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{product.vendor.business_name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {product.vendor.contact_person}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {product.category.name}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{formatCurrency(product.price)}</div>
                                                    {product.compare_price && (
                                                        <div className="text-sm text-muted-foreground line-through">
                                                            {formatCurrency(product.compare_price)}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={product.quantity > product.min_quantity ? 'default' : 'destructive'}
                                                    className={product.quantity > product.min_quantity ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : ''}
                                                >
                                                    {product.quantity} units
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={getStatusVariant(product.status)}
                                                    className={getStatusColor(product.status)}
                                                >
                                                    {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                                    <span className="text-sm font-medium">
                                                        {typeof product?.rating === 'number' ? product.rating.toFixed(1) : '0.0'} ({product?.reviews_count || 0})
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <TrendingUp className="h-4 w-4 text-blue-400 mr-1" />
                                                    <span className="text-sm font-medium">
                                                        {product?.sales_count} sold
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => viewDetails(product)}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        {product.status === 'pending' && (
                                                            <>
                                                                <DropdownMenuItem onClick={() => handleApprove(product)}>
                                                                    <Check className="h-4 w-4 mr-2" />
                                                                    Approve
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleReject(product)}>
                                                                    <X className="h-4 w-4 mr-2" />
                                                                    Reject
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                        {(product.status === 'active' || product.status === 'inactive') && (
                                                            <DropdownMenuItem onClick={() => handleToggleStatus(product)}>
                                                                {product.status === 'active' ? (
                                                                    <>
                                                                        <Pause className="h-4 w-4 mr-2" />
                                                                        Deactivate
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Play className="h-4 w-4 mr-2" />
                                                                        Activate
                                                                    </>
                                                                )}
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem onClick={() => handleToggleFeatured(product)}>
                                                            <Star className="h-4 w-4 mr-2" />
                                                            {product.is_featured ? 'Remove Featured' : 'Make Featured'}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-8">
                                            <div className="text-muted-foreground">
                                                No products found matching your criteria.
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {products?.meta && products?.meta?.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {products?.meta?.from} to {products?.meta?.to} of {products?.meta?.total} results
                                </div>
                                <div className="flex space-x-2">
                                    {products?.links.map((link: any, index: number) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => link.url && router.visit(link.url)}
                                            disabled={!link.url}
                                        >
                                            {link.label.replace(/&laquo;|&raquo;/g, (match: string) =>
                                                match === '&laquo;' ? '«' : '»'
                                            )}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Product Details Dialog */}
                {selectedProduct && (
                    <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Product Details - {selectedProduct.name}</DialogTitle>
                                <DialogDescription>
                                    Complete product information
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                                {/* Product Images */}
                                {selectedProduct?.images?.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold mb-3">Product Images</h4>
                                        <div className="grid grid-cols-4 gap-2">
                                            {selectedProduct?.images?.map((image) => (
                                                <div key={image.id} className="relative">
                                                    <img
                                                        src={image.image_path}
                                                        alt={image.alt_text}
                                                        className="w-full h-20 object-cover rounded-md"
                                                    />
                                                    {image.is_primary && (
                                                        <Badge
                                                            variant="default"
                                                            className="absolute top-1 left-1 text-xs bg-blue-100 text-blue-700 border-blue-300"
                                                        >
                                                            Primary
                                                        </Badge>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Basic Information */}
                                <div>
                                    <h4 className="font-semibold mb-3">Basic Information</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Product Name</Label>
                                            <p className="text-sm">{selectedProduct.name}</p>
                                        </div>
                                        <div>
                                            <Label>SKU</Label>
                                            <p className="text-sm">{selectedProduct.sku}</p>
                                        </div>
                                        <div>
                                            <Label>Category</Label>
                                            <p className="text-sm">{selectedProduct.category.name}</p>
                                        </div>
                                        <div>
                                            <Label>Vendor</Label>
                                            <p className="text-sm">{selectedProduct.vendor.business_name}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <Label>Description</Label>
                                    <p className="text-sm mt-1">{selectedProduct.description}</p>
                                </div>

                                {/* Pricing */}
                                <div>
                                    <h4 className="font-semibold mb-3">Pricing</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label>Price</Label>
                                            <p className="text-sm font-medium">{formatCurrency(selectedProduct.price)}</p>
                                        </div>
                                        {selectedProduct.compare_price && (
                                            <div>
                                                <Label>Compare Price</Label>
                                                <p className="text-sm">{formatCurrency(selectedProduct.compare_price)}</p>
                                            </div>
                                        )}
                                        {selectedProduct.cost_price && (
                                            <div>
                                                <Label>Cost Price</Label>
                                                <p className="text-sm">{formatCurrency(selectedProduct.cost_price)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Inventory */}
                                <div>
                                    <h4 className="font-semibold mb-3">Inventory</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label>Current Stock</Label>
                                            <p className="text-sm font-medium">{selectedProduct.quantity}</p>
                                        </div>
                                        <div>
                                            <Label>Minimum Stock</Label>
                                            <p className="text-sm">{selectedProduct.min_quantity}</p>
                                        </div>
                                        <div>
                                            <Label>Barcode</Label>
                                            <p className="text-sm">{selectedProduct.barcode || 'Not set'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Physical Properties */}
                                <div>
                                    <h4 className="font-semibold mb-3">Physical Properties</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Weight</Label>
                                            <p className="text-sm">{selectedProduct.weight ? `${selectedProduct.weight} kg` : 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <Label>Dimensions</Label>
                                            <p className="text-sm">{selectedProduct.dimensions || 'Not specified'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Status and Features */}
                                <div>
                                    <h4 className="font-semibold mb-3">Status and Features</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Status</Label>
                                            <div className="mt-1">
                                                <Badge
                                                    variant={getStatusVariant(selectedProduct.status)}
                                                    className={getStatusColor(selectedProduct.status)}
                                                >
                                                    {selectedProduct.status.charAt(0).toUpperCase() + selectedProduct.status.slice(1)}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {selectedProduct.is_featured && (
                                                <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                                                    Featured Product
                                                </Badge>
                                            )}
                                            {selectedProduct.is_digital && (
                                                <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                                                    Digital Product
                                                </Badge>
                                            )}
                                            {!selectedProduct.requires_shipping && (
                                                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                                                    No Shipping Required
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Performance Metrics */}
                                <div>
                                    <h4 className="font-semibold mb-3">Performance Metrics</h4>
                                    <div className="grid grid-cols-4 gap-4">
                                        <div>
                                            <Label>Views</Label>
                                            <p className="text-sm font-medium">{selectedProduct.views_count}</p>
                                        </div>
                                        <div>
                                            <Label>Sales</Label>
                                            <p className="text-sm font-medium">{selectedProduct.sales_count}</p>
                                        </div>
                                        <div>
                                            <Label>Rating</Label>
                                            <p className="text-sm font-medium">
                                                {typeof selectedProduct.rating === 'number' ? selectedProduct.rating.toFixed(1) : '0.0'} ⭐
                                            </p>
                                        </div>
                                        <div>
                                            <Label>Reviews</Label>
                                            <p className="text-sm font-medium">{selectedProduct.reviews_count}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Tags */}
                                {selectedProduct.tags && (
                                    <div>
                                        <Label>Tags</Label>
                                        <p className="text-sm mt-1">{selectedProduct.tags}</p>
                                    </div>
                                )}

                                {/* Rejection Reason */}
                                {selectedProduct.rejection_reason && (
                                    <div>
                                        <Label>Rejection Reason</Label>
                                        <p className="text-sm mt-1 p-3 bg-red-50 border border-red-200 rounded-md">
                                            {selectedProduct.rejection_reason}
                                        </p>
                                    </div>
                                )}

                                {/* SEO Information */}
                                <div>
                                    <h4 className="font-semibold mb-3">SEO Information</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <Label>Meta Title</Label>
                                            <p className="text-sm">{selectedProduct.meta_title || 'Not set'}</p>
                                        </div>
                                        <div>
                                            <Label>Meta Description</Label>
                                            <p className="text-sm">{selectedProduct.meta_description || 'Not set'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {selectedProduct.status === 'pending' && (
                                    <div className="flex gap-2 pt-4 border-t">
                                        <Button
                                            onClick={() => {
                                                handleApprove(selectedProduct);
                                                setShowDetailsDialog(false);
                                            }}
                                            className="flex-1"
                                        >
                                            <Check className="h-4 w-4 mr-2" />
                                            Approve Product
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => {
                                                handleReject(selectedProduct);
                                                setShowDetailsDialog(false);
                                            }}
                                            className="flex-1"
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Reject Product
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </AdminLayout>
    );
}
