import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

declare global {
    function route(name: string, params?: any): string;
}
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Plus,
    Search,
    Filter,
    Edit,
    Eye,
    Trash2,
    Copy,
    Package,
    DollarSign,
    AlertTriangle,
    CheckCircle,
    Clock,
    ArrowUpDown,
    MoreHorizontal,
    ExternalLink
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    sku: string;
    stock_quantity: number;
    status: 'draft' | 'pending' | 'active' | 'inactive';
    created_at: string;
    updated_at: string;
    images: Array<{
        id: number;
        image_path: string;
        alt_text: string;
        is_primary: boolean;
    }>;
    category: {
        id: number;
        name: string;
        parent?: {
            id: number;
            name: string;
        };
    };
    total_sales?: number;
    total_revenue?: number;
}

interface Category {
    id: number;
    name: string;
    parent?: {
        id: number;
        name: string;
    };
}

interface ProductStats {
    total: number;
    active: number;
    draft: number;
    pending: number;
    low_stock: number;
}

interface VendorProductsProps {
    products: {
        data: Product[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    categories: Category[];
    stats: ProductStats;
    filters: {
        status?: string;
        category?: string;
        search?: string;
        sort?: string;
        direction?: string;
    };
}

export default function VendorProducts({ products, categories, stats, filters }: VendorProductsProps) {
    const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('rw-RW', {
            style: 'currency',
            currency: 'RWF'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return (
                    <Badge className="bg-emerald-100 text-emerald-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                    </Badge>
                );
            case 'draft':
                return (
                    <Badge className="bg-gray-100 text-gray-800">
                        <Edit className="h-3 w-3 mr-1" />
                        Draft
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge className="bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                );
            case 'inactive':
                return (
                    <Badge className="bg-red-100 text-red-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Inactive
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const handleSearch = (searchTerm: string) => {
        router.get('/marketplace/vendor/products', {
            ...filters,
            search: searchTerm,
            page: 1
        }, { preserveState: true });
    };

    const handleFilter = (key: string, value: string) => {
        router.get('/marketplace/vendor/products', {
            ...filters,
            [key]: value,
            page: 1
        }, { preserveState: true });
    };

    const handleSort = (sortBy: string) => {
        const direction = filters.sort === sortBy && filters.direction === 'asc' ? 'desc' : 'asc';
        router.get('/marketplace/vendor/products', {
            ...filters,
            sort: sortBy,
            direction: direction
        }, { preserveState: true });
    };

    const confirmDelete = (product: Product) => {
        setDeleteProduct(product);
        setShowDeleteDialog(true);
    };

    const handleDelete = () => {
        if (deleteProduct) {
            router.delete(`/marketplace/vendor/products/${deleteProduct.id}`, {
                onSuccess: () => {
                    setShowDeleteDialog(false);
                    setDeleteProduct(null);
                }
            });
        }
    };

    const toggleStatus = (product: Product) => {
        router.patch(`/marketplace/vendor/products/${product.id}/status`, {}, {
            preserveState: true
        });
    };

    const duplicateProduct = (product: Product) => {
        router.post(`/marketplace/vendor/products/${product.id}/duplicate`);
    };

    return (
        <AppLayout>
            <Head title="Manage Products" />

            <div className="flex justify-between items-center mb-6 p-6">
                <div>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Product Management
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage your marketplace products
                    </p>
                </div>
                <Link href="/marketplace/vendor/products/create">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                    </Button>
                </Link>
            </div>

            <div className="py-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Products</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats?.total}</p>
                                    </div>
                                    <Package className="h-8 w-8 text-blue-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Active</p>
                                        <p className="text-2xl font-bold text-emerald-600">{stats?.active}</p>
                                    </div>
                                    <CheckCircle className="h-8 w-8 text-emerald-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Draft</p>
                                        <p className="text-2xl font-bold text-gray-600">{stats?.draft}</p>
                                    </div>
                                    <Edit className="h-8 w-8 text-gray-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Pending</p>
                                        <p className="text-2xl font-bold text-yellow-600">{stats?.pending}</p>
                                    </div>
                                    <Clock className="h-8 w-8 text-yellow-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Low Stock</p>
                                        <p className="text-2xl font-bold text-red-600">{stats?.low_stock}</p>
                                    </div>
                                    <AlertTriangle className="h-8 w-8 text-red-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Filter className="h-5 w-5 mr-2" />
                                Filters & Search
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <Label htmlFor="search">Search Products</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            id="search"
                                            placeholder="Search by name, SKU..."
                                            defaultValue={filters.search || ''}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={filters.status || ''}
                                        onValueChange={(value) => handleFilter('status', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value=" ">All Statuses</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        value={filters.category || ''}
                                        onValueChange={(value) => handleFilter('category', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value=" ">All Categories</SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.parent ? `${category.parent.name} > ` : ''}
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="sort">Sort By</Label>
                                    <Select
                                        value={`${filters.sort || 'created_at'}_${filters.direction || 'desc'}`}
                                        onValueChange={(value) => {
                                            const [sort, direction] = value.split('_');
                                            router.get('/marketplace/vendor/products', {
                                                ...filters,
                                                sort,
                                                direction
                                            }, { preserveState: true });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="created_at_desc">Newest First</SelectItem>
                                            <SelectItem value="created_at_asc">Oldest First</SelectItem>
                                            <SelectItem value="name_asc">Name A-Z</SelectItem>
                                            <SelectItem value="name_desc">Name Z-A</SelectItem>
                                            <SelectItem value="price_asc">Price Low-High</SelectItem>
                                            <SelectItem value="price_desc">Price High-Low</SelectItem>
                                            <SelectItem value="stock_quantity_asc">Stock Low-High</SelectItem>
                                            <SelectItem value="stock_quantity_desc">Stock High-Low</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Products List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Products ({products.total})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {products.data.length === 0 ? (
                                <div className="text-center py-12 pb-0">
                                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                                    <p className="text-gray-600 mb-6">
                                        {filters.search || filters.status || filters.category
                                            ? 'Try adjusting your filters or search terms.'
                                            : 'Start by creating your first product.'
                                        }
                                    </p>
                                    <Link href="/marketplace/vendor/products/create" >
                                        <Button  >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create First Product
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4 pt-0">
                                    {products.data.map((product) => (
                                        console.log(product.images),
                                        <div key={product.id} className="border rounded-lg p-6 hover:shadow-sm transition-shadow">
                                            <div className="flex items-start gap-4">
                                                {/* Product Image */}
                                                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                    {product.images && product.images.length > 0 ? (
                                                        <img
                                                                src={product.images.find(img => img.is_primary)?.image_path || product.images[0].image_path}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <Package className="h-8 w-8" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Product Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                                                                {product.name}
                                                            </h3>
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                SKU: {product.sku} • {product.category.parent ? `${product.category.parent.name} > ` : ''}{product.category.name}
                                                            </p>
                                                            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                                                {product.description}
                                                            </p>
                                                        </div>
                                                        <div className="ml-4 text-right">
                                                            {getStatusBadge(product.status)}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between mt-4">
                                                        <div className="flex items-center gap-6 text-sm text-gray-600">
                                                            <div>
                                                                <span className="font-medium">Price:</span>
                                                                <span className="ml-1 text-lg font-bold text-emerald-600">
                                                                    {formatCurrency(product.price)}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Stock:</span>
                                                                <span className={`ml-1 ${product.stock_quantity <= 5 ? 'text-red-600 font-bold' : 'text-gray-900'}`}>
                                                                    {product.stock_quantity}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Sales:</span>
                                                                <span className="ml-1">{product.total_sales || 0}</span>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium">Created:</span>
                                                                <span className="ml-1">{formatDate(product.created_at)}</span>
                                                            </div>
                                                        </div>

                                                        {/* Action Buttons */}
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => window.open(route('marketplace.products.show', product.slug), '_blank')}
                                                            >
                                                                <Eye className="h-4 w-4 mr-1" />
                                                                View
                                                            </Button>

                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => window.location.href = route('marketplace.vendor.products.edit', product.id)}
                                                            >
                                                                <Edit className="h-4 w-4 mr-1" />
                                                                Edit
                                                            </Button>

                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => duplicateProduct(product)}
                                                            >
                                                                <Copy className="h-4 w-4 mr-1" />
                                                                Duplicate
                                                            </Button>

                                                            <Button
                                                                size="sm"
                                                                variant={product.status === 'active' ? 'secondary' : 'default'}
                                                                onClick={() => toggleStatus(product)}
                                                            >
                                                                {product.status === 'active' ? 'Deactivate' : 'Activate'}
                                                            </Button>

                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => confirmDelete(product)}
                                                                className="text-red-600 hover:text-red-700 hover:border-red-300"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Low Stock Alert */}
                                                    {product.stock_quantity <= 5 && product.status === 'active' && (
                                                        <Alert className="mt-4 border-orange-200 bg-orange-50">
                                                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                                                            <AlertDescription className="text-orange-800">
                                                                Low stock warning: Only {product.stock_quantity} items remaining
                                                            </AlertDescription>
                                                        </Alert>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Pagination */}
                                    {products.last_page > 1 && (
                                        <div className="flex justify-center mt-8">
                                            <div className="flex items-center gap-2">
                                                {products.links.map((link, index) => (
                                                    <Button
                                                        key={index}
                                                        variant={link.active ? 'default' : 'outline'}
                                                        size="sm"
                                                        disabled={!link.url}
                                                        onClick={() => {
                                                            if (link.url) {
                                                                router.get(link.url);
                                                            }
                                                        }}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Product</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deleteProduct?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete Product
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
