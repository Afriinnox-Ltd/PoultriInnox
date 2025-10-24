import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Search, Filter, Grid, List, Star, MapPin, Users, Package } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    images: Array<{ image_url: string; alt_text: string; is_primary: boolean }>;
    category: { name: string; slug: string };
    vendor: { business_name: string; slug: string; user: { name: string } };
    stock_quantity: number;
    rating?: number;
    reviews_count?: number;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    icon?: string;
    children?: Category[];
    products_count?: number;
}

interface Vendor {
    id: number;
    business_name: string;
    slug: string;
    rating: number;
    total_sales: number;
    user: { name: string };
}

interface Props {
    products: {
        data: Product[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    categories: Category[];
    vendors: Vendor[];
    filters: {
        category?: string;
        vendor?: string;
        search?: string;
        price_min?: number;
        price_max?: number;
        in_stock?: boolean;
    };
    sort: {
        sort_by: string;
        sort_direction: string;
    };
}

export default function Index({ products, categories, vendors, filters, sort }: Props) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('rw-RW', {
            style: 'currency',
            currency: 'RWF',
        }).format(price);
    };

    const getImageUrl = (product: Product) => {
        const primaryImage = product.images.find(img => img.is_primary) || product.images[0];
        return primaryImage?.image_url || '/images/placeholder-product.jpg';
    };

    const renderStarRating = (rating: number) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${
                            star <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                        }`}
                    />
                ))}
            </div>
        );
    };

    return (
        <AppLayout>
            <Head title="Marketplace - Agriinnox" />

            <div className="container mx-auto px-4 py-6">
                {/* Hero Section */}
                <div className="mb-8 rounded-lg bg-gradient-to-r from-emerald-600 to-blue-600 p-8 text-white">
                    <div className="max-w-2xl">
                        <h1 className="mb-4 text-4xl font-bold">
                            Poultry Marketplace
                        </h1>
                        <p className="mb-6 text-lg opacity-90">
                            Find everything you need for your poultry business - from feed and equipment
                            to live birds and health supplies. Connect with trusted vendors across the region.
                        </p>
                        <div className="flex gap-4">
                            <Button variant="secondary" asChild>
                                <Link href="/marketplace/vendor/register">
                                    Become a Vendor
                                </Link>
                            </Button>
                            <Button variant="outline" className="border-white text-white hover:bg-white/10">
                                Browse Categories
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="mb-6 space-y-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search products, vendors, or categories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                                className="gap-2"
                            >
                                <Filter className="h-4 w-4" />
                                Filters
                            </Button>
                            <div className="flex rounded-md border">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                    className="rounded-r-none"
                                >
                                    <Grid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                    className="rounded-l-none"
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <Card>
                            <CardContent className="p-4">
                                <div className="grid gap-4 md:grid-cols-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">
                                            Category
                                        </label>
                                        <select className="w-full rounded-md border border-gray-300 px-3 py-2">
                                            <option value="">All Categories</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.slug}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">
                                            Price Range
                                        </label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="number"
                                                placeholder="Min"
                                                className="w-20"
                                            />
                                            <Input
                                                type="number"
                                                placeholder="Max"
                                                className="w-20"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">
                                            Availability
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input type="checkbox" />
                                            <span className="text-sm">In Stock Only</span>
                                        </label>
                                    </div>
                                    <div className="flex items-end">
                                        <Button className="w-full">Apply Filters</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="grid gap-6 lg:grid-cols-4">
                    {/* Sidebar - Categories */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Categories
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {categories.map((category) => (
                                        <Link
                                            key={category.id}
                                            href={`/marketplace/categories/${category.slug}`}
                                            className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-50"
                                        >
                                            <span className="text-sm">{category.name}</span>
                                            {category.products_count && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {category.products_count}
                                                </Badge>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Top Vendors
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {vendors.slice(0, 5).map((vendor) => (
                                        <Link
                                            key={vendor.id}
                                            href={`/marketplace/vendors/${vendor.slug}`}
                                            className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50"
                                        >
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 flex items-center justify-center text-white text-sm font-medium">
                                                {vendor.business_name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {vendor.business_name}
                                                </p>
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    {renderStarRating(vendor.rating)}
                                                    <span>({vendor.total_sales} sales)</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content - Products */}
                    <div className="lg:col-span-3">
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Showing {products.data.length} of {products.total} products
                            </p>
                            <select className="rounded-md border border-gray-300 px-3 py-1 text-sm">
                                <option value="created_at-desc">Newest First</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="name-asc">Name: A to Z</option>
                                <option value="rating-desc">Highest Rated</option>
                            </select>
                        </div>

                        {viewMode === 'grid' ? (
                            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {products.data.map((product) => (
                                    <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="aspect-square relative overflow-hidden">
                                            <img
                                                src={getImageUrl(product)}
                                                alt={product.name}
                                                className="h-full w-full object-cover transition-transform hover:scale-105"
                                            />
                                            {product.stock_quantity === 0 && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <Badge variant="destructive">Out of Stock</Badge>
                                                </div>
                                            )}
                                        </div>
                                        <CardContent className="p-4">
                                            <div className="mb-2">
                                                <Link
                                                    href={`/marketplace/products/${product.slug}`}
                                                    className="font-medium hover:text-blue-600 line-clamp-2"
                                                >
                                                    {product.name}
                                                </Link>
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                    {product.description}
                                                </p>
                                            </div>

                                            <div className="mb-3 flex items-center justify-between">
                                                <span className="text-lg font-bold text-emerald-600">
                                                    {formatPrice(product.price)}
                                                </span>
                                                {product.rating && (
                                                    <div className="flex items-center gap-1">
                                                        {renderStarRating(product.rating)}
                                                        <span className="text-xs text-gray-500">
                                                            ({product.reviews_count})
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mb-3 text-xs text-gray-500">
                                                <Link
                                                    href={`/marketplace/vendors/${product.vendor.slug}`}
                                                    className="hover:text-blue-600"
                                                >
                                                    {product.vendor.business_name}
                                                </Link>
                                                {' • '}
                                                <Link
                                                    href={`/marketplace/categories/${product.category.slug}`}
                                                    className="hover:text-blue-600"
                                                >
                                                    {product.category.name}
                                                </Link>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button size="sm" className="flex-1 gap-2">
                                                    <ShoppingCart className="h-4 w-4" />
                                                    Add to Cart
                                                </Button>
                                                <Button size="sm" variant="outline" asChild>
                                                    <Link href={`/marketplace/products/${product.slug}`}>
                                                        View
                                                    </Link>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {products.data.map((product) => (
                                    <Card key={product.id} className="overflow-hidden">
                                        <CardContent className="p-4">
                                            <div className="flex gap-4">
                                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                                                    <img
                                                        src={getImageUrl(product)}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <Link
                                                                href={`/marketplace/products/${product.slug}`}
                                                                className="font-medium hover:text-blue-600"
                                                            >
                                                                {product.name}
                                                            </Link>
                                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                                {product.description}
                                                            </p>
                                                            <div className="mt-2 text-xs text-gray-500">
                                                                <Link
                                                                    href={`/marketplace/vendors/${product.vendor.slug}`}
                                                                    className="hover:text-blue-600"
                                                                >
                                                                    {product.vendor.business_name}
                                                                </Link>
                                                                {' • '}
                                                                <Link
                                                                    href={`/marketplace/categories/${product.category.slug}`}
                                                                    className="hover:text-blue-600"
                                                                >
                                                                    {product.category.name}
                                                                </Link>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-lg font-bold text-emerald-600">
                                                                {formatPrice(product.price)}
                                                            </span>
                                                            {product.rating && (
                                                                <div className="mt-1 flex items-center justify-end gap-1">
                                                                    {renderStarRating(product.rating)}
                                                                    <span className="text-xs text-gray-500">
                                                                        ({product.reviews_count})
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div className="mt-3 flex gap-2">
                                                                <Button size="sm" className="gap-2">
                                                                    <ShoppingCart className="h-4 w-4" />
                                                                    Add to Cart
                                                                </Button>
                                                                <Button size="sm" variant="outline" asChild>
                                                                    <Link href={`/marketplace/products/${product.slug}`}>
                                                                        View
                                                                    </Link>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {products.last_page > 1 && (
                            <div className="mt-8 flex items-center justify-center gap-2">
                                <Button
                                    variant="outline"
                                    disabled={products.current_page === 1}
                                >
                                    Previous
                                </Button>
                                {Array.from({ length: products.last_page }, (_, i) => i + 1)
                                    .slice(
                                        Math.max(0, products.current_page - 3),
                                        Math.min(products.last_page, products.current_page + 2)
                                    )
                                    .map((page) => (
                                        <Button
                                            key={page}
                                            variant={page === products.current_page ? 'default' : 'outline'}
                                            size="sm"
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                <Button
                                    variant="outline"
                                    disabled={products.current_page === products.last_page}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
