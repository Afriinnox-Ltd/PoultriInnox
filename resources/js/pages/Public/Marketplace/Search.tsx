import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import WelcomeNav from '@/components/navigation/WelcomeNav';
import ProductCard from '@/components/ProductCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import { Filter, X, Star, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { type SharedData } from '@/types';

// Types
interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    stock_quantity: number;
    images: Array<{ image_url: string }>;
    category?: { id: number; name: string };
    vendor?: { id: number; business_name: string };
}

interface Category {
    id: number;
    name: string;
}

interface Vendor {
    id: number;
    business_name: string;
}

interface SearchPageProps {
    products: Product[];
    categories: Category[];
    vendors: Vendor[];
    filters: {
        search?: string;
        category?: string;
        vendor?: string;
        price_min?: string;
        price_max?: string;
        in_stock?: boolean;
        condition?: string;
        rating?: string;
        free_shipping?: boolean;
    };
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function SearchPage({ products, categories, vendors, filters, pagination }: SearchPageProps) {
    const { auth } = usePage<SharedData>().props;

    // Filter states
    const [searchTerm, setSearchTerm] = React.useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = React.useState(filters.category || '');
    const [selectedVendor, setSelectedVendor] = React.useState(filters.vendor || '');
    const [priceMin, setPriceMin] = React.useState(filters.price_min || '');
    const [priceMax, setPriceMax] = React.useState(filters.price_max || '');
    const [inStockOnly, setInStockOnly] = React.useState(filters.in_stock || false);
    const [selectedCondition, setSelectedCondition] = React.useState(filters.condition || '');
    const [minRating, setMinRating] = React.useState(filters.rating || '');
    const [freeShipping, setFreeShipping] = React.useState(filters.free_shipping || false);
    const [priceRange, setPriceRange] = React.useState('');
    const [showMobileFilters, setShowMobileFilters] = React.useState(false);
    const [sortBy, setSortBy] = React.useState('best_match');

    // Safe array handling
    const safeCategories = Array.isArray(categories) ? categories : [];
    const safeVendors = Array.isArray(vendors) ? vendors : [];
    const safeProducts = Array.isArray(products) ? products : [];

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (selectedCategory) params.set('category', selectedCategory);
        if (selectedVendor) params.set('vendor', selectedVendor);
        if (priceMin) params.set('price_min', priceMin);
        if (priceMax) params.set('price_max', priceMax);
        if (inStockOnly) params.set('in_stock', '1');
        if (selectedCondition) params.set('condition', selectedCondition);
        if (minRating) params.set('rating', minRating);
        if (freeShipping) params.set('free_shipping', '1');

        window.location.href = `/store/search?${params.toString()}`;
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedVendor('');
        setPriceMin('');
        setPriceMax('');
        setInStockOnly(false);
        setSelectedCondition('');
        setMinRating('');
        setFreeShipping(false);
        setPriceRange('');
        window.location.href = '/store/search';
    };

    const handleSort = (value: string) => {
        setSortBy(value);
        const params = new URLSearchParams(window.location.search);
        params.set('sort', value);
        window.location.href = `/store/search?${params.toString()}`;
    };

    const handleAddToCart = (productId: number) => {
        if (!auth.user) {
            window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
            return;
        }
        window.location.href = '/marketplace';
    };

    const removeFilter = (filterName: string) => {
        switch (filterName) {
            case 'search':
                setSearchTerm('');
                break;
            case 'category':
                setSelectedCategory('');
                break;
            case 'vendor':
                setSelectedVendor('');
                break;
            case 'price':
                setPriceMin('');
                setPriceMax('');
                setPriceRange('');
                break;
            case 'stock':
                setInStockOnly(false);
                break;
            case 'condition':
                setSelectedCondition('');
                break;
            case 'rating':
                setMinRating('');
                break;
            case 'shipping':
                setFreeShipping(false);
                break;
        }

        // Reapply filters
        setTimeout(() => handleSearch(), 100);
    };

    const hasActiveFilters = searchTerm || selectedCategory || selectedVendor || priceMin || priceMax ||
        inStockOnly || selectedCondition || minRating || freeShipping;

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Search Products - Agriinnox Marketplace">
                <meta name="description" content="Search and filter agricultural products. Find exactly what you need with our comprehensive filtering options." />
            </Head>

            <WelcomeNav auth={auth} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
                {/* Breadcrumb Navigation */}
                <nav className="flex items-center text-sm text-gray-600 mb-6">
                    <Link href="/" className="hover:text-emerald-600">Home</Link>
                    <span className="mx-2">/</span>
                    <Link href="/store" className="hover:text-emerald-600">Marketplace</Link>
                    {selectedCategory && (
                        <>
                            <span className="mx-2">/</span>
                            <span className="text-gray-900 font-medium">
                                {safeCategories.find(c => c.id.toString() === selectedCategory)?.name}
                            </span>
                        </>
                    )}
                    {searchTerm && !selectedCategory && (
                        <>
                            <span className="mx-2">/</span>
                            <span className="text-gray-900 font-medium">Search Results</span>
                        </>
                    )}
                </nav>

                {/* Results Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="text-gray-700">
                        <span className="font-semibold">{pagination?.total || safeProducts.length}</span> results
                        {searchTerm && <span> for "<span className="font-medium">{searchTerm}</span>"</span>}
                    </div>
                    <div className="flex items-center gap-4">
                        <select
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={sortBy}
                            onChange={(e) => handleSort(e.target.value)}
                        >
                            <option value="best_match">Best Match</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="newest">Newest First</option>
                            <option value="popular">Most Popular</option>
                        </select>
                        <Button
                            variant="outline"
                            size="sm"
                            className="lg:hidden"
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                        </Button>
                    </div>
                </div>

                {/* Active Filters Tags */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-2 p-4 bg-white rounded-lg border border-gray-200 mb-6">
                        <span className="text-sm font-medium text-gray-700">Active Filters:</span>

                        {searchTerm && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">
                                Search: {searchTerm}
                                <button onClick={() => removeFilter('search')} className="hover:text-emerald-900">
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}

                        {selectedCategory && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">
                                Category: {safeCategories.find(c => c.id.toString() === selectedCategory)?.name}
                                <button onClick={() => removeFilter('category')} className="hover:text-emerald-900">
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}

                        {selectedVendor && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">
                                Vendor: {safeVendors.find(v => v.id.toString() === selectedVendor)?.business_name}
                                <button onClick={() => removeFilter('vendor')} className="hover:text-emerald-900">
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}

                        {(priceMin || priceMax) && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">
                                Price: {priceMin || '0'} - {priceMax || '∞'}
                                <button onClick={() => removeFilter('price')} className="hover:text-emerald-900">
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}

                        {inStockOnly && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">
                                In Stock Only
                                <button onClick={() => removeFilter('stock')} className="hover:text-emerald-900">
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}

                        {selectedCondition && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">
                                Condition: {selectedCondition}
                                <button onClick={() => removeFilter('condition')} className="hover:text-emerald-900">
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}

                        {minRating && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">
                                Rating: {minRating}+ stars
                                <button onClick={() => removeFilter('rating')} className="hover:text-emerald-900">
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}

                        {freeShipping && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">
                                Free Shipping
                                <button onClick={() => removeFilter('shipping')} className="hover:text-emerald-900">
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="text-emerald-600 hover:text-emerald-700"
                        >
                            Clear all
                        </Button>
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Filter Sidebar */}
                    <div className={`lg:col-span-1 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
                        <Card className="sticky top-24 border border-gray-200 shadow-sm bg-white">
                            <CardHeader className="border-b border-gray-200">
                                <CardTitle className="flex items-center text-lg">
                                    <Filter className="h-5 w-5 mr-2 text-emerald-600" />
                                    Filters
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                {/* Search */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block text-gray-700">Search</label>
                                    <Input
                                        placeholder="Search products..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                    />
                                </div>

                                {/* Category Filter */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block text-gray-700">Category</label>
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
                                    <label className="text-sm font-medium mb-2 block text-gray-700">Vendor</label>
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

                                <Separator />

                                {/* Price Range */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block text-gray-700">Price Range</label>
                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <Input
                                            placeholder="Min"
                                            type="number"
                                            value={priceMin}
                                            onChange={(e) => setPriceMin(e.target.value)}
                                            className="border-gray-300"
                                        />
                                        <Input
                                            placeholder="Max"
                                            type="number"
                                            value={priceMax}
                                            onChange={(e) => setPriceMax(e.target.value)}
                                            className="border-gray-300"
                                        />
                                    </div>

                                    {/* Quick Price Ranges */}
                                    <div className="space-y-1">
                                        <button
                                            onClick={() => { setPriceMin(''); setPriceMax('5000'); setPriceRange('under-5000'); }}
                                            className={`w-full text-left px-3 py-2 rounded-md text-sm ${priceRange === 'under-5000' ? 'bg-emerald-100 text-emerald-800 font-medium' : 'hover:bg-gray-100'}`}
                                        >
                                            Under 5,000 RWF
                                        </button>
                                        <button
                                            onClick={() => { setPriceMin('5000'); setPriceMax('20000'); setPriceRange('5000-20000'); }}
                                            className={`w-full text-left px-3 py-2 rounded-md text-sm ${priceRange === '5000-20000' ? 'bg-emerald-100 text-emerald-800 font-medium' : 'hover:bg-gray-100'}`}
                                        >
                                            5,000 - 20,000 RWF
                                        </button>
                                        <button
                                            onClick={() => { setPriceMin('20000'); setPriceMax('50000'); setPriceRange('20000-50000'); }}
                                            className={`w-full text-left px-3 py-2 rounded-md text-sm ${priceRange === '20000-50000' ? 'bg-emerald-100 text-emerald-800 font-medium' : 'hover:bg-gray-100'}`}
                                        >
                                            20,000 - 50,000 RWF
                                        </button>
                                        <button
                                            onClick={() => { setPriceMin('50000'); setPriceMax(''); setPriceRange('over-50000'); }}
                                            className={`w-full text-left px-3 py-2 rounded-md text-sm ${priceRange === 'over-50000' ? 'bg-emerald-100 text-emerald-800 font-medium' : 'hover:bg-gray-100'}`}
                                        >
                                            Over 50,000 RWF
                                        </button>
                                    </div>
                                </div>

                                <Separator />

                                {/* Condition */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block text-gray-700">Condition</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        value={selectedCondition}
                                        onChange={(e) => setSelectedCondition(e.target.value)}
                                    >
                                        <option value="">All Conditions</option>
                                        <option value="New">New</option>
                                        <option value="Used">Used - Like New</option>
                                        <option value="Refurbished">Refurbished</option>
                                    </select>
                                </div>

                                {/* Rating */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block text-gray-700">Minimum Rating</label>
                                    <div className="space-y-1">
                                        {['4', '3', '2'].map((rating) => (
                                            <button
                                                key={rating}
                                                onClick={() => setMinRating(rating)}
                                                className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 ${minRating === rating ? 'bg-emerald-100 text-emerald-800 font-medium' : 'hover:bg-gray-100'}`}
                                            >
                                                <div className="flex">
                                                    {[...Array(parseInt(rating))].map((_, i) => (
                                                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                    ))}
                                                </div>
                                                & Up
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                {/* Stock & Shipping */}
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="in-stock"
                                            checked={inStockOnly}
                                            onChange={(e) => setInStockOnly(e.target.checked)}
                                            className="mr-2 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                        />
                                        <label htmlFor="in-stock" className="text-sm font-medium text-gray-700">
                                            In Stock Only
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="free-shipping"
                                            checked={freeShipping}
                                            onChange={(e) => setFreeShipping(e.target.checked)}
                                            className="mr-2 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                        />
                                        <label htmlFor="free-shipping" className="text-sm font-medium text-gray-700">
                                            Free Shipping
                                        </label>
                                    </div>
                                </div>

                                <Separator />

                                {/* Filter Actions */}
                                <div className="space-y-2">
                                    <Button
                                        onClick={() => {
                                            handleSearch();
                                            setShowMobileFilters(false);
                                        }}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        Apply Filters
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            clearFilters();
                                            setShowMobileFilters(false);
                                        }}
                                        variant="outline"
                                        className="w-full border-gray-300 hover:bg-gray-50"
                                    >
                                        Clear All Filters
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Products Grid */}
                    <div className="lg:col-span-3">
                        {safeProducts.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {safeProducts.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            auth={auth}
                                            handleAddToCart={() => handleAddToCart(product.id)}
                                        />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination && pagination.last_page > 1 && (
                                    <div className="mt-8 flex items-center justify-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={pagination.current_page === 1}
                                            onClick={() => {
                                                const params = new URLSearchParams(window.location.search);
                                                params.set('page', (pagination.current_page - 1).toString());
                                                window.location.href = `/store/search?${params.toString()}`;
                                            }}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Previous
                                        </Button>

                                        <div className="flex items-center gap-1">
                                            {[...Array(pagination.last_page)].map((_, i) => {
                                                const page = i + 1;
                                                if (
                                                    page === 1 ||
                                                    page === pagination.last_page ||
                                                    (page >= pagination.current_page - 1 && page <= pagination.current_page + 1)
                                                ) {
                                                    return (
                                                        <Button
                                                            key={page}
                                                            variant={page === pagination.current_page ? 'default' : 'outline'}
                                                            size="sm"
                                                            className={page === pagination.current_page ? 'bg-emerald-600' : ''}
                                                            onClick={() => {
                                                                const params = new URLSearchParams(window.location.search);
                                                                params.set('page', page.toString());
                                                                window.location.href = `/store/search?${params.toString()}`;
                                                            }}
                                                        >
                                                            {page}
                                                        </Button>
                                                    );
                                                } else if (page === pagination.current_page - 2 || page === pagination.current_page + 2) {
                                                    return <span key={page} className="px-2">...</span>;
                                                }
                                                return null;
                                            })}
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={pagination.current_page === pagination.last_page}
                                            onClick={() => {
                                                const params = new URLSearchParams(window.location.search);
                                                params.set('page', (pagination.current_page + 1).toString());
                                                window.location.href = `/store/search?${params.toString()}`;
                                            }}
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-16">
                                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                                <p className="text-gray-600 mb-6">
                                    Try adjusting your filters or search terms
                                </p>
                                <Button onClick={clearFilters} variant="outline">
                                    Clear all filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Toaster />
        </div>
    );
}
