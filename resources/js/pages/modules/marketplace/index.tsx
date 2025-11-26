import React from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Search, Filter, Star, MapPin, Package, TrendingUp } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Category, Product, Vendor } from '@/types/marketplace';

interface MarketplaceIndexProps {
    products: {
        data: Product[];
        current_page: number;
        last_page: number;
        total: number;
    };
    categories: Category[];
    vendors: Vendor[];
    filters: {
        category?: string;
        vendor?: string;
        search?: string;
        price_min?: string;
        price_max?: string;
        in_stock?: boolean;
    };
    sort: {
        sort_by: string;
        sort_direction: string;
    };
}

export default function MarketplaceIndex({
    products,
    categories,
    vendors,
    filters,
    sort
}: MarketplaceIndexProps) {
    const [searchTerm, setSearchTerm] = React.useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = React.useState(filters.category || '');
    const [selectedVendor, setSelectedVendor] = React.useState(filters.vendor || '');
    const [priceMin, setPriceMin] = React.useState(filters.price_min || '');
    const [priceMax, setPriceMax] = React.useState(filters.price_max || '');
    const [inStockOnly, setInStockOnly] = React.useState(filters.in_stock || false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('rw-RW', {
            style: 'currency',
            currency: 'RWF'
        }).format(amount);
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (selectedCategory) params.set('category', selectedCategory);
        if (selectedVendor) params.set('vendor', selectedVendor);
        if (priceMin) params.set('price_min', priceMin);
        if (priceMax) params.set('price_max', priceMax);
        if (inStockOnly) params.set('in_stock', '1');

        window.location.href = `/marketplace?${params.toString()}`;
    };

    const clearFilters = () => {
        window.location.href = '/marketplace';
    };

    const handleSort = (sortBy: string) => {
        const direction = sort.sort_by === sortBy && sort.sort_direction === 'asc' ? 'desc' : 'asc';
        const params = new URLSearchParams(window.location.search);
        params.set('sort_by', sortBy);
        params.set('sort_direction', direction);
        window.location.href = `/marketplace?${params.toString()}`;
    };

    return (
        <AppLayout
        >
            <Head title="Marketplace" />

            <div className="flex justify-between lg:flex-row flex-col gap-4 lg:items-center">
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Marketplace
                </h2>
                <div className="flex gap-2">
                    <Button
                        onClick={() => window.location.href = '/marketplace/cart'}
                        variant="outline"
                        size="sm"
                    >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Cart
                    </Button>
                    <Button
                        onClick={() => window.location.href = '/marketplace/vendor/register'}
                        size="sm"
                    >
                        Become a Vendor
                    </Button>
                </div>
            </div>

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <Card className="mb-6 bg-gradient-to-r from-emerald-50 to-blue-50">
                        <CardContent className="p-6">
                            <div className="text-center">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    Poultry Equipment & Supplies Marketplace
                                </h1>
                                <p className="text-lg text-gray-600 mb-4">
                                    Find everything you need for your poultry farming operation
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                    <div className="flex items-center justify-center">
                                        <Package className="h-6 w-6 text-emerald-600 mr-2" />
                                        <span className="text-sm font-medium">10,000+ Products</span>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <MapPin className="h-6 w-6 text-blue-600 mr-2" />
                                        <span className="text-sm font-medium">Local & International</span>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <TrendingUp className="h-6 w-6 text-purple-600 mr-2" />
                                        <span className="text-sm font-medium">Best Prices</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Filters Sidebar */}
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Filter className="h-5 w-5 mr-2" />
                                    Filters
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Search */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Search</label>
                                    <Input
                                        placeholder="Search products..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>

                                {/* Category Filter */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Category</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Vendor Filter */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Vendor</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={selectedVendor}
                                        onChange={(e) => setSelectedVendor(e.target.value)}
                                    >
                                        <option value="">All Vendors</option>
                                        {vendors.map((vendor) => (
                                            <option key={vendor.id} value={vendor.id}>
                                                {vendor.business_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Price Range */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Price Range</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            placeholder="Min"
                                            type="number"
                                            value={priceMin}
                                            onChange={(e) => setPriceMin(e.target.value)}
                                        />
                                        <Input
                                            placeholder="Max"
                                            type="number"
                                            value={priceMax}
                                            onChange={(e) => setPriceMax(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* In Stock Only */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="in-stock"
                                        checked={inStockOnly}
                                        onChange={(e) => setInStockOnly(e.target.checked)}
                                        className="mr-2"
                                    />
                                    <label htmlFor="in-stock" className="text-sm font-medium">
                                        In Stock Only
                                    </label>
                                </div>

                                <Separator />

                                {/* Filter Actions */}
                                <div className="space-y-2">
                                    <Button onClick={handleSearch} className="w-full">
                                        Apply Filters
                                    </Button>
                                    <Button onClick={clearFilters} variant="outline" className="w-full">
                                        Clear Filters
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Products Grid */}
                        <div className="lg:col-span-3">
                            {/* Sort Controls */}
                            <Card className="mb-4">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">
                                            Showing {products.data.length} of {products.total} products
                                        </span>
                                        <div className="flex gap-2">
                                            <Button
                                                variant={sort.sort_by === 'name' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => handleSort('name')}
                                            >
                                                Name {sort.sort_by === 'name' && (sort.sort_direction === 'asc' ? '↑' : '↓')}
                                            </Button>
                                            <Button
                                                variant={sort.sort_by === 'price' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => handleSort('price')}
                                            >
                                                Price {sort.sort_by === 'price' && (sort.sort_direction === 'asc' ? '↑' : '↓')}
                                            </Button>
                                            <Button
                                                variant={sort.sort_by === 'created_at' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => handleSort('created_at')}
                                            >
                                                Latest {sort.sort_by === 'created_at' && (sort.sort_direction === 'asc' ? '↑' : '↓')}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Products Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {products.data.map((product) => (
                                    <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                                        <div
                                            onClick={() => window.location.href = `/marketplace/products/${product.slug}`}
                                        >
                                            {/* Product Image */}
                                            <div className="aspect-square bg-gray-100 relative">
                                                {product.images && product.images.length > 0 ? (
                                                    <img
                                                        src={product.images[0].image_path}
                                                        alt={product.images[0].alt_text || product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <Package className="h-16 w-16" />
                                                    </div>
                                                )}
                                                {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                                                    <Badge className="absolute top-2 right-2 bg-orange-500">
                                                        Low Stock
                                                    </Badge>
                                                )}
                                                {product.stock_quantity === 0 && (
                                                    <Badge className="absolute top-2 right-2 bg-red-500">
                                                        Out of Stock
                                                    </Badge>
                                                )}
                                            </div>

                                            <CardContent className="p-4">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="font-semibold text-lg line-clamp-2">
                                                            {product.name}
                                                        </h3>
                                                        <div className="flex items-center ml-2">
                                                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                                            <span className="text-sm text-gray-600 ml-1">
                                                                {product.rating || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <p className="text-gray-600 text-sm line-clamp-2">
                                                        {product.description}
                                                    </p>

                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <span className="text-2xl font-bold text-emerald-600">
                                                                {formatCurrency(product.price)}
                                                            </span>
                                                            {product.minimum_order_quantity && (
                                                                <span className="text-xs text-gray-500 ml-1">
                                                                    (min. {product.minimum_order_quantity})
                                                                </span>
                                                            )}
                                                        </div>
                                                        <Badge variant="outline">
                                                            {product.stock_quantity} in stock
                                                        </Badge>
                                                    </div>

                                                    <div className="flex justify-between items-center text-sm text-gray-500">
                                                        <span>by {product.vendor?.business_name}</span>
                                                        <span>{product.category?.name}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </div>

                                        <CardContent className="px-4 pb-4">
                                            <Button
                                                className="w-full"
                                                disabled={product.stock_quantity === 0}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                            >
                                                <ShoppingCart className="h-4 w-4 mr-2" />
                                                {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Pagination */}
                            {products.last_page > 1 && (
                                <Card className="mt-6">
                                    <CardContent className="p-4">
                                        <div className="flex justify-center space-x-2">
                                            {Array.from({ length: products.last_page }, (_, i) => i + 1).map((page) => (
                                                <Button
                                                    key={page}
                                                    variant={page === products.current_page ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => {
                                                        const params = new URLSearchParams(window.location.search);
                                                        params.set('page', page.toString());
                                                        window.location.href = `/marketplace?${params.toString()}`;
                                                    }}
                                                >
                                                    {page}
                                                </Button>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
