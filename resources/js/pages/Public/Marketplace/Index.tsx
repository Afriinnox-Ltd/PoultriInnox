import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Search, Filter, Star, MapPin, Package, TrendingUp, LogIn, UserPlus, Eye, Shield, ArrowRight, X } from 'lucide-react';
import { type SharedData } from '@/types';
import WelcomeNav from '@/components/navigation/WelcomeNav';
import { formatCurrency } from '@/utils/formatters';
import ProductCard from '@/components/ProductCard';
import { Toaster } from '@/components/ui/sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import Footer from '@/components/marketplace/Footer';

interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    stock_quantity: number;
    minimum_order_quantity?: number;
    maximum_order_quantity?: number;
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
    shipping_option?: string;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    parent_id?: number | null;
    image: string | null;
    icon: string | null;
    color: string | null;
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
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedCategory, setSelectedCategory] = React.useState('');
    const [selectedVendor, setSelectedVendor] = React.useState('');
    const [priceMin, setPriceMin] = React.useState('');
    const [priceMax, setPriceMax] = React.useState('');
    const [inStockOnly, setInStockOnly] = React.useState(false);
    const [showMobileFilters, setShowMobileFilters] = React.useState(false);
    const [showSearchDropdown, setShowSearchDropdown] = React.useState(false);
    const [searchSuggestions, setSearchSuggestions] = React.useState<Product[]>([]);
    const searchRef = React.useRef<HTMLDivElement>(null);

    // Additional filters
    const [selectedCondition, setSelectedCondition] = React.useState('');
    const [selectedLocation, setSelectedLocation] = React.useState('');
    const [minRating, setMinRating] = React.useState('');
    const [freeShipping, setFreeShipping] = React.useState(false);
    const [priceRange, setPriceRange] = React.useState('');

    // Safe array handling to prevent map errors
    const safeCategories = Array.isArray(categories) ? categories : [];
    const safeVendors = Array.isArray(vendors) ? vendors : [];
    const safeProducts = Array.isArray(products?.data) ? products.data : [];

    // Filter to get only parent categories (for circular category display)
    const parentCategories = safeCategories.filter(category => !category.parent_id);

    // Handle search input changes and show suggestions
    const handleSearchInput = (value: string) => {
        setSearchTerm(value);

        if (value.trim().length > 0) {
            // Filter products based on search term
            const filtered = safeProducts.filter(product =>
                product.name.toLowerCase().includes(value.toLowerCase()) ||
                product.description?.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 8); // Limit to 8 suggestions

            setSearchSuggestions(filtered);
            setShowSearchDropdown(true);
        } else {
            setSearchSuggestions([]);
            setShowSearchDropdown(false);
        }
    };

    // Handle clicking outside search dropdown
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearchDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (selectedCategory) params.set('category', selectedCategory);
        if (selectedVendor) params.set('vendor', selectedVendor);
        if (priceMin) params.set('price_min', priceMin);
        if (priceMax) params.set('price_max', priceMax);
        if (inStockOnly) params.set('in_stock', '1');

        window.location.href = `/store/search?${params.toString()}`;
        setShowSearchDropdown(false);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedVendor('');
        setPriceMin('');
        setPriceMax('');
        setInStockOnly(false);
        setSearchSuggestions([]);
        setShowSearchDropdown(false);
        // Reset new filters
        setSelectedCondition('');
        setSelectedLocation('');
        setMinRating('');
        setFreeShipping(false);
        setPriceRange('');
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

            {/* Clean Header with Search - eBay Style */}
            <div className="bg-white border-b border-gray-200 pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    {/* Search Bar with Autocomplete */}
                    <div className="max-w-4xl mx-auto" ref={searchRef}>
                        <div className="relative">
                            <div className="flex items-center ">
                                <select
                                    className="hidden md:block px-4 py-2 border border-r-0 border-gray-300 rounded-l-md bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                                <div className="flex-1 relative">
                                    <Input
                                        placeholder="Search for anything..."
                                        value={searchTerm}
                                        onChange={(e) => handleSearchInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-full px-4 rounded-md md:rounded-l-none py-3 border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />

                                    {/* Autocomplete Dropdown */}
                                    {showSearchDropdown && searchSuggestions.length > 0 && (
                                        <div className="absolute w-full  top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                                            <div className="max-h-96 w-full overflow-y-auto">
                                                {searchSuggestions.map((product) => (
                                                    <Link
                                                        key={product.id}
                                                        href={`/store/products/${product.slug}`}
                                                        className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                                                        onClick={() => setShowSearchDropdown(false)}
                                                    >
                                                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                            {product.images && product.images.length > 0 ? (
                                                                <img
                                                                    src={product.images[0].image_url}
                                                                    alt={product.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Package className="h-6 w-6 text-gray-300" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row sm:justify-between w-full min-w-0 gap-1">
                                                            <div className="flex-1 min-w-0 pr-2">
                                                                <div className="font-medium text-sm text-gray-900 truncate">
                                                                    {product.name}
                                                                </div>
                                                                {product.category && (
                                                                    <div className="text-xs text-gray-500 truncate">
                                                                        in {product.category.name}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-shrink-0">
                                                                <div className="font-bold text-sm text-emerald-600">
                                                                    {formatCurrency(product.price)}
                                                                </div>
                                                            </div>
                                                        </div>

                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <Button
                                    onClick={handleSearch}
                                    className="bg-emerald-600 ml-3 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-md md:rounded-l-none md:rounded-r-md"
                                >
                                    Search
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Category Navigation */}
                    <div className="mt-4 lg:flex hidden  items-center gap-6 text-sm overflow-x-auto">
                        <Link href="/store" className="text-gray-700 hover:text-emerald-600 whitespace-nowrap font-medium">
                            Shop by Category
                        </Link>
                        {safeCategories.slice(0, 6).map((category) => (
                            <Link
                                key={category.id}
                                href={`/store/search?category=${category.id}`}
                                className="text-gray-600 hover:text-emerald-600 whitespace-nowrap"
                            >
                                {category.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Hero Banner - eBay Style */}
            <div className="relative bg-gradient-to-r from-gray-100 to-gray-50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">

                                Endless farm supplies. Epic prices.
                            </h1>
                            <p className="text-lg text-gray-600 mb-6">
                                Buy & Sell Quality Farm Products Easily!
                            </p>
                            <Link
                                className="bg-emerald-600 rounded-lg hover:bg-emerald-700 text-white font-bold px-8 py-3"
                                href="/store/search"
                            >
                                Explore  Products
                            </Link>
                        </div>
                        <div className="hidden lg:block">
                            <div className="bg-white rounded-lg  p-8 text-center">
                                <div className="text-6xl mb-4">🌾</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Quality Farm Products</h3>
                                <p className="text-gray-600">From trusted vendors across Rwanda</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shopping Made Easy Banner */}
            <div className="bg-white py-4 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap gap-3 items-center justify-between">
                        <p className="text-lg text-gray-700">
                            Access a large customer base of farmers and agricultural businesses
                        </p>
                        <Link className="bg-emerald-500 hover:bg-emerald-700 rounded-lg text-white font-bold px-8 py-3" href="/vendor/register">
                            Became a vendor
                        </Link>
                    </div>
                </div>
            </div>

            {/* The Future in Your Hands - Circular Categories */}
            <div className="bg-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Shop by Category</h2>
                    <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-6">
                        {parentCategories.slice(0, 8).map((category, index) => (
                            <Link
                                key={category.id}
                                href={`/store/search?category=${category.id}`}
                                className="group text-center"
                            >
                                <div className="w-full aspect-square rounded-full bg-gray-100 mb-3 overflow-hidden hover:shadow-lg transition-shadow">
                                    <div
                                        className={`w-full h-full flex items-center justify-center ${!category.color ? 'bg-emerald-500' : ''}`}
                                        style={{ backgroundColor: category.color || undefined }}
                                    >
                                        <span className="text-6xl">{category.icon || '📦'}</span>
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-gray-700 group-hover:text-emerald-600">
                                    {category.name}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Trending Products */}
            <div className="bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Trending on Agriinnox</h2>
                        <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700">
                            <Link href="/store/search?trending=1">
                                See all →
                            </Link>
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {safeProducts.slice(0, 6).map((product) => (
                            <Link
                                key={product.id}
                                href={`/store/products/${product.slug}`}
                                className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow border border-gray-200"
                            >
                                <div className="aspect-square bg-gray-100">
                                    {product.images && product.images.length > 0 ? (
                                        <img
                                            src={product.images[0].image_url}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="h-12 w-12 text-gray-300" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-3">
                                    <p className="text-sm font-medium text-gray-900 truncate mb-1">
                                        {product.name}
                                    </p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {formatCurrency(product.price)}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Today's Deals */}
            <div className="bg-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
                            Today's Deals
                        </div>
                        <p className="text-gray-600">All with free delivery</p>
                        <Button variant="outline" size="sm" className="ml-auto">
                            <Link href="/store/search?deal=1"> Shop now</Link>
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {safeProducts.filter(p => p.shipping_option === 'free').slice(0, 4).map((product, index) => (
                            <Card key={product.id} className="overflow-hidden hover:shadow-xl p-0 transition-shadow">
                                <Link href={`/store/products/${product.slug}`} className="relative">
                                    <div className="aspect-square bg-gray-100">
                                        {product.images && product.images.length > 0 ? (
                                            <img
                                                src={product.images[0].image_url}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="h-16 w-16 text-gray-300" />
                                            </div>
                                        )}
                                    </div>
                                    {index === 0 && (
                                        <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                                            50% OFF
                                        </div>
                                    )}
                                </Link>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                        {product.name}
                                    </h3>
                                    <p className="text-2xl font-bold text-gray-900 mb-3">
                                        {formatCurrency(product.price)}
                                    </p>
                                    <Button
                                        asChild
                                        className="w-full cursor-pointer bg-emerald-600 hover:bg-emerald-700"

                                    >
                                        <Link href={`/store/products/${product.slug}`}>Shop now</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-gray-100  py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-12 items-center">
                        <div className="text-gray-900 text-center">
                            <h2 className="text-4xl font-bold mb-4">
                                We have everything you need
                            </h2>
                            <p className="text-xl text-gray-600 mb-8">
                                Shop from the best sellers and brands
                            </p>

                            <Button
                                size="lg"
                                className="bg-white text-emerald-700 hover:bg-gray-100 font-bold px-8 py-6 text-lg"
                                asChild
                            >
                                <Link href="/store">
                                    Find more products
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Become a Vendor Banner */}
            <div className="bg-emerald-600  py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="text-white">
                            <h2 className="text-4xl font-bold mb-4">
                                Start selling on Agriinnox
                            </h2>
                            <p className="text-xl text-emerald-50 mb-8">
                                Reach thousands of farmers and buyers across Rwanda
                            </p>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-start gap-3">
                                    <div className="bg-white/20 rounded-full p-2 mt-1">
                                        <TrendingUp className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Grow your business</h3>
                                        <p className="text-emerald-50">Access a large customer base of farmers and agricultural businesses</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="bg-white/20 rounded-full p-2 mt-1">
                                        <Shield className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Secure payments</h3>
                                        <p className="text-emerald-50">Get paid safely and on time with our trusted payment system</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="bg-white/20 rounded-full p-2 mt-1">
                                        <Package className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Easy to manage</h3>
                                        <p className="text-emerald-50">Simple dashboard to manage your products, orders, and inventory</p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                size="lg"
                                className="bg-white text-emerald-700 hover:bg-gray-100 font-bold px-8 py-6 text-lg"
                                asChild
                            >
                                <Link href="/vendor/register">
                                    Become a Vendor
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-2xl">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Why vendors love us</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-emerald-600 mb-2">5,000+</div>
                                    <div className="text-gray-600">Active Buyers</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-emerald-600 mb-2">98%</div>
                                    <div className="text-gray-600">Satisfaction Rate</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-emerald-600 mb-2">24/7</div>
                                    <div className="text-gray-600">Support</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-emerald-600 mb-2">Free</div>
                                    <div className="text-gray-600">To Start</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Toaster position="bottom-right" richColors />
            <Footer auth={auth} />
        </div>
    );
}
