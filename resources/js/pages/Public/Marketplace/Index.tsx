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

    // Safe array handling to prevent map errors
    const safeCategories = Array.isArray(categories) ? categories : [];
    const safeVendors = Array.isArray(vendors) ? vendors : [];
    const safeProducts = Array.isArray(products?.data) ? products.data : [];

    // Filter to get only parent categories (for circular category display)
    const parentCategories = safeCategories.filter(category => !category.parent_id);



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
                <meta name="description" content="Shop quality Livestock Equipment, supplies, feed, and farming tools. Find everything you need for your livestock farming operation with trusted vendors across Rwanda." />
                <meta name="keywords" content="Livestock Equipment, chicken feed, farming supplies, incubators, brooders, poultry farming, Rwanda agriculture" />
                <meta property="og:title" content="Browse Products - Poultry Marketplace" />
                <meta property="og:description" content="Shop quality Livestock Equipment and supplies from trusted vendors" />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <link rel="canonical" href="https://agriinnox.com/store" />
            </Head>

            <WelcomeNav auth={auth} categories={categories} products={products.data} />

            <div className=" bg-gradient-to-r from-gray-100 to-gray-50 overflow-hidden pt-36">
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
                            Become a vendor
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
