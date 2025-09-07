import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Search, Filter, Star, MapPin, Package, TrendingUp, LogIn, UserPlus, Eye } from 'lucide-react';
import { type SharedData } from '@/types';
import WelcomeNav from '@/components/navigation/WelcomeNav';
import { formatCurrency } from '@/utils/formatters';
import ProductCard from '@/components/ProductCard';
import { Toaster } from '@/components/ui/sonner';

interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    stock_quantity: number;
    min_order_quantity?: number;
    rating?: number;
    images?: Array<{
        image_path: string | undefined;
        id: number;
        image_url: string;
        alt_text?: string;
        is_primary: boolean;
    }>;
    vendor?: {
        id: number;
        business_name: string;
        slug: string;
    };
    category?: {
        id: number;
        name: string;
        slug: string;
    };
}

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Vendor {
    id: number;
    business_name: string;
    slug: string;
}

interface PublicMarketplaceProps {
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

export default function PublicMarketplace({
    products,
    categories,
    vendors,
    filters,
    sort
}: PublicMarketplaceProps) {
    const { auth } = usePage<SharedData>().props;
    const [searchTerm, setSearchTerm] = React.useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = React.useState(filters.category || '');
    const [selectedVendor, setSelectedVendor] = React.useState(filters.vendor || '');
    const [priceMin, setPriceMin] = React.useState(filters.price_min || '');
    const [priceMax, setPriceMax] = React.useState(filters.price_max || '');
    const [inStockOnly, setInStockOnly] = React.useState(filters.in_stock || false);

    // Safe array handling to prevent map errors
    const safeCategories = Array.isArray(categories) ? categories : [];
    const safeVendors = Array.isArray(vendors) ? vendors : [];
    const safeProducts = Array.isArray(products?.data) ? products.data : [];

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (selectedCategory) params.set('category', selectedCategory);
        if (selectedVendor) params.set('vendor', selectedVendor);
        if (priceMin) params.set('price_min', priceMin);
        if (priceMax) params.set('price_max', priceMax);
        if (inStockOnly) params.set('in_stock', '1');

        window.location.href = `/store?${params.toString()}`;
    };

    const clearFilters = () => {
        window.location.href = '/store';
    };

    const handleSort = (sortBy: string) => {
        const direction = sort.sort_by === sortBy && sort.sort_direction === 'asc' ? 'desc' : 'asc';
        const params = new URLSearchParams(window.location.search);
        params.set('sort_by', sortBy);
        params.set('sort_direction', direction);
        window.location.href = `/store?${params.toString()}`;
    };

    const handleAddToCart = (productId: number) => {
        if (!auth.user) {
            // Redirect to login if not authenticated
            window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
            return;
        }

        // If authenticated, redirect to authenticated marketplace
        window.location.href = '/marketplace';
    }; 

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Browse Products - Poultry Marketplace" />

                <WelcomeNav auth={auth} />
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <Card className="mb-6 mt-16 bg-gradient-to-r from-emerald-50 to-emerald-100 bg-[url('/assets/happy-african-american-man-holding-shopping-bags-yellow-background-holidays-concept.png')]
                contain-content  bg-no-repeat  bg-right p-0">
                    <CardContent className="p-6 bg-gradient-to-l  from-emerald-500 to-black/40 rounded-lg">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-white mb-2">
                                Poultry Equipment & Supplies Marketplace
                            </h1>
                            <p className="text-lg text-emerald-100 mb-4">
                                Find everything you need for your poultry farming operation
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                <div className="flex items-center justify-center text-white">
                                    <Package className="h-6 w-6 text-emerald-300 mr-2" />
                                    <span className="text-sm font-medium">{products.total + 100} + Products</span>
                                </div>
                                <div className="flex items-center justify-center text-white">
                                    <MapPin className="h-6 w-6 text-emerald-300 mr-2" />
                                    <span className="text-sm font-medium">Local & International</span>
                                </div>
                                <div className="flex items-center justify-center text-white">
                                    <TrendingUp className="h-6 w-6 text-emerald-300 mr-2" />
                                    <span className="text-sm font-medium">Best Prices</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className='flex flex-col gap-4'>
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        <option value="">All Categories</option>
                                        {safeCategories.map((category) => (
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        value={selectedVendor}
                                        onChange={(e) => setSelectedVendor(e.target.value)}
                                    >
                                        <option value="">All Vendors</option>
                                        {safeVendors.map((vendor) => (
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
                    </div>

                    {/* Products Grid */}
                    <div className="lg:col-span-3">
                        {/* Sort Controls */}
                        <Card className="mb-4 p-2">
                            <CardContent className="">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">
                                        Showing {safeProducts.length} of {products?.total || 0} products
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
                            {safeProducts.map((product) => (
                                <ProductCard key={product.id} auth={auth} product={product} handleAddToCart={handleAddToCart} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {products?.last_page && products.last_page > 1 && (
                            <Card className="mt-6">
                                <CardContent className="p-4">
                                    <div className="flex justify-center space-x-2">
                                        {Array.from({ length: Math.min(products?.last_page || 0, 10) }, (_, i) => {
                                            const page = i + 1;
                                            const lastPage = products?.last_page || 0;
                                            const currentPage = products?.current_page || 1;
                                            if (lastPage <= 10 || page <= 5 || page > lastPage - 5) {
                                                return (
                                                    <Button
                                                        key={page}
                                                        variant={page === currentPage ? 'default' : 'outline'}
                                                        size="sm"
                                                        onClick={() => {
                                                            const params = new URLSearchParams(window.location.search);
                                                            params.set('page', page.toString());
                                                            window.location.href = `/store?${params.toString()}`;
                                                        }}
                                                    >
                                                        {page}
                                                    </Button>
                                                );
                                            }
                                            return null;
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
            <Toaster position="top-right" richColors />
        </div>
    );
}
