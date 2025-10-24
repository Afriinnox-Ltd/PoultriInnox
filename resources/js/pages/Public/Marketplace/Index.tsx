import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Search, Filter, Star, MapPin, Package, TrendingUp, LogIn, UserPlus, Eye, Shield } from 'lucide-react';
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
    const [showMobileFilters, setShowMobileFilters] = React.useState(false);

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
        <div className="min-h-screen bg-white">
            <Head title="Browse Products - Poultry Marketplace">
                <meta name="description" content="Shop quality poultry equipment, supplies, feed, and farming tools. Find everything you need for your poultry farming operation with trusted vendors across Rwanda." />
                <meta name="keywords" content="poultry equipment, chicken feed, farming supplies, incubators, brooders, poultry farming, Rwanda agriculture" />
                <meta property="og:title" content="Browse Products - Poultry Marketplace" />
                <meta property="og:description" content="Shop quality poultry equipment and supplies from trusted vendors" />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <link rel="canonical" href="https://agriinnox.com/store" />
            </Head>

            <WelcomeNav auth={auth} />

            {/* Features Bar */}
            <div className="bg-gray-50 border-y border-gray-200 pt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <Package className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900">Fast Delivery</div>
                                <div className="text-xs text-gray-600">Nationwide shipping</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Shield className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900">Secure Payment</div>
                                <div className="text-xs text-gray-600">100% Protected</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                                <Star className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900">Quality Products</div>
                                <div className="text-xs text-gray-600">Verified vendors</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900">Best Prices</div>
                                <div className="text-xs text-gray-600">Competitive rates</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Shop by Category</h2>
                        <p className="text-gray-600 mt-1">Find exactly what you need</p>
                    </div>
                    <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700">
                        View All →
                    </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {safeCategories.slice(0, 6).map((category) => (
                        <Link
                            key={category.id}
                            href={`/store?category=${category.id}`}
                            className="group"
                        >
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-200">
                                <h3 className="font-semibold text-gray-900 text-xs">{category.name}</h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">


                    {/* Filters Sidebar */}
                    <div className={`lg:col-span-1 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
                        <Card className="sticky top-20 border-gray-200  border shadow-none bg-white">
                            <CardHeader className="border-b border-gray-100">
                                <CardTitle className="flex items-center text-lg">
                                    <Filter className="h-5 w-5 mr-2 text-emerald-600" />
                                    Filter Products
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
                                    <Button
                                        onClick={() => {
                                            handleSearch();
                                            setShowMobileFilters(false); // Close mobile filters after applying
                                        }}
                                        className="w-full"
                                    >
                                        Apply Filters
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            clearFilters();
                                            setShowMobileFilters(false); // Close mobile filters after clearing
                                        }}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Products Grid */}
                    <div className="lg:col-span-3">
                        {/* Search and Sort Bar */}
                        <Card className="mb-6 border-gray-200 shadow-none border bg-white">
                            <CardContent className="py-4">
                                <div className="flex flex-col lg:flex-row gap-4">
                                    {/* Search */}
                                    <div className="flex-1">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <Input
                                                placeholder="Search products..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                                className="pl-10 pr-4 py-6 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Sort Buttons */}
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant={sort.sort_by === 'name' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handleSort('name')}
                                            className="flex-1 lg:flex-none"
                                        >
                                            Name {sort.sort_by === 'name' && (sort.sort_direction === 'asc' ? '↑' : '↓')}
                                        </Button>
                                        <Button
                                            variant={sort.sort_by === 'price' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handleSort('price')}
                                            className="flex-1 lg:flex-none"
                                        >
                                            Price {sort.sort_by === 'price' && (sort.sort_direction === 'asc' ? '↑' : '↓')}
                                        </Button>
                                        <Button
                                            variant={sort.sort_by === 'created_at' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handleSort('created_at')}
                                            className="flex-1 lg:flex-none"
                                        >
                                            Latest {sort.sort_by === 'created_at' && (sort.sort_direction === 'asc' ? '↑' : '↓')}
                                        </Button>
                                        <Button
                                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                                            variant="outline"
                                            size="sm"
                                            className="lg:hidden"
                                        >
                                            <Filter className="h-4 w-4 mr-2" />
                                            Filters
                                        </Button>
                                    </div>
                                </div>

                                {/* Results count */}
                                <div className="mt-4 text-sm text-gray-600">
                                    Showing <span className="font-semibold text-gray-900">{safeProducts.length}</span> of <span className="font-semibold text-gray-900">{products?.total || 0}</span> products
                                </div>
                            </CardContent>
                        </Card>

                        {/* Products Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {safeProducts.length > 0 ? (
                                safeProducts.map((product) => (
                                    <ProductCard key={product.id} auth={auth} product={product} handleAddToCart={handleAddToCart} />
                                ))
                            ) : (
                                <div className="col-span-3 py-16 text-center">
                                    <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                                    <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
                                    <Button onClick={clearFilters} variant="outline">
                                        Clear all filters
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {products?.last_page && products.last_page > 1 && (
                            <div className="mt-8 flex justify-center">
                                <div className="flex items-center gap-2">
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
                                                    className={page === currentPage ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                                                >
                                                    {page}
                                                </Button>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

            <Toaster position="bottom-right" richColors />
        </div>
    );
}
