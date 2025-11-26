import React, { useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    Star,
    Package,
    TrendingUp,
    Shield,
    ArrowRight,
    Truck,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Clock,
    Store,
    ShoppingBag,
    Layers,
    Heart,
} from 'lucide-react';
import { type SharedData } from '@/types';
import WelcomeNav from '@/components/navigation/WelcomeNav';
import { formatCurrency } from '@/utils/formatters';
import { Toaster } from '@/components/ui/sonner';
import Footer from '@/components/marketplace/Footer';
import MarketplaceProductCard from '@/components/marketplace/ProductCard';

interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    stock_quantity: number;
    rating?: number;
    order_items_count?: number;
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
    products_count?: number;
}

interface Props {
    featuredProducts: Product[];
    newArrivals: Product[];
    bestSellers: Product[];
    freeDelivery: Product[];
    categories: Category[];
    stats: {
        total_products: number;
        total_vendors: number;
        total_categories: number;
    };
}

function ScrollableRow({ children }: { children: React.ReactNode }) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const amount = scrollRef.current.clientWidth * 0.7;
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -amount : amount,
            behavior: 'smooth',
        });
    };

    return (
        <div className="relative group/scroll">
            <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 opacity-0 group-hover/scroll:opacity-100 transition-opacity -translate-x-3"
            >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {children}
            </div>
            <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 opacity-0 group-hover/scroll:opacity-100 transition-opacity translate-x-3"
            >
                <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>
        </div>
    );
}

function SectionHeader({
    title,
    subtitle,
    icon: Icon,
    href,
    linkText = 'View all',
}: {
    title: string;
    subtitle?: string;
    icon?: React.ElementType;
    href?: string;
    linkText?: string;
}) {
    return (
        <div className="flex items-end justify-between mb-6">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    {Icon && <Icon className="h-5 w-5 text-emerald-600" />}
                    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                </div>
                {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
            {href && (
                <Link
                    href={href}
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1 shrink-0"
                >
                    {linkText}
                    <ArrowRight className="h-4 w-4" />
                </Link>
            )}
        </div>
    );
}

export default function PublicMarketplace({
    featuredProducts,
    newArrivals,
    bestSellers,
    freeDelivery,
    categories,
    stats,
}: Props) {
    const { auth } = usePage<SharedData>().props;

    const safeCategories = Array.isArray(categories) ? categories : [];
    const safeFeatured = Array.isArray(featuredProducts) ? featuredProducts : [];
    const safeNew = Array.isArray(newArrivals) ? newArrivals : [];
    const safeBest = Array.isArray(bestSellers) ? bestSellers : [];
    const safeFree = Array.isArray(freeDelivery) ? freeDelivery : [];

    const parentCategories = safeCategories.filter(c => !c.parent_id);

    return (
        <div className="min-h-screen bg-white">
            <Head title="Agriinnox - Livestock Marketplace">
                <meta name="description" content="Shop quality livestock equipment, supplies, feed, and farming tools from trusted vendors across Rwanda." />
                <meta name="keywords" content="livestock equipment, chicken feed, farming supplies, incubators, brooders, Rwanda agriculture" />
                <meta property="og:title" content="Agriinnox - Livestock Marketplace" />
                <meta property="og:description" content="Shop quality livestock equipment and supplies from trusted vendors" />
                <meta property="og:type" content="website" />
                <link rel="canonical" href="https://agriinnox.com/store" />
            </Head>

            <WelcomeNav auth={auth} categories={categories} products={[...safeFeatured, ...safeNew]} />

            {/* ── Hero ── */}
            <section className="pt-16 bg-white"> 
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[480px]">

                        {/* Left panel — headline, search, pills */}
                        <div className="flex flex-col justify-center py-12 pr-0 lg:pr-12 border-b lg:border-b-0 lg:border-r border-gray-100">
                            <p className="text-emerald-600 font-semibold text-sm mb-3 tracking-wide uppercase">
                                Buy &amp; Sell Farm Products
                            </p>
                            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-[1.1] mb-4">
                                Endless farm supplies.<br />
                                <span className="text-emerald-600">Epic prices.</span>
                            </h1>
                            <p className="text-gray-500 text-base mb-8 max-w-md leading-relaxed">
                                Discover a wide range of agricultural products from trusted vendors across Rwanda.
                            </p>

                            {/* Search bar */}
                            <form
                                action="/store/search"
                                method="GET"
                                className="flex items-center rounded-2xl border-2 border-gray-200 focus-within:border-emerald-600 overflow-hidden bg-white shadow-sm transition-colors mb-6 max-w-md"
                            >
                                <Search className="h-4 w-4 text-gray-400 ml-4 shrink-0" />
                                <input
                                    type="text"
                                    name="search"
                                    placeholder="Search products, brands, categories…"
                                    className="flex-1 px-3 py-3.5 text-gray-800 text-sm outline-none bg-transparent placeholder-gray-400"
                                />
                                <button
                                    type="submit"
                                    className="m-1.5 bg-emerald-600 hover:bg-emerald-700 transition-colors px-5 py-2.5 rounded-xl text-white text-sm font-semibold shrink-0"
                                >
                                    Search
                                </button>
                            </form>

                            {/* Category pills */}
                            {parentCategories.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-xs text-gray-400 self-center mr-1">Browse:</span>
                                    {parentCategories.slice(0, 5).map((c) => (
                                        <Link
                                            key={c.id}
                                            href={`/store/search?category=${c.id}`}
                                            className="inline-flex items-center gap-1 text-xs bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-600 px-3 py-1.5 rounded-full transition-colors font-medium"
                                        >
                                          {c.name}
                                        </Link>
                                    ))}
                                </div>
                            )}                            
                        </div>

                        {/* Right panel — Free Delivery + Featured products */}
                        <div className="flex flex-col py-8 pl-0 lg:pl-10 gap-6">

                            {/* Free Delivery block */}
                            {safeFree.length > 0 && (
                                <div className="">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Truck className="h-4 w-4 text-emerald-600" />
                                            <span className="text-sm font-bold text-emerald-700">Free Delivery</span>
                                        </div>
                                        <Link href="/store/search?free_shipping=1" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                                            See all <ArrowRight className="h-3 w-3" />
                                        </Link>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {safeFree.slice(0, 4).map((product) => (
                                            <Link
                                                key={product.id}
                                                href={`/store/products/${product.slug}`}
                                                className="group bg-white border border-emerald-100 hover:border-emerald-300 hover:shadow-md rounded-xl overflow-hidden transition-all duration-200 flex flex-col"
                                            >
                                                <div className="aspect-square bg-gray-50 overflow-hidden">
                                                    {product.images && product.images.length > 0 ? (
                                                        <img
                                                            src={product.images[0].image_path || product.images[0].image_url}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            loading="eager"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package className="h-6 w-6 text-gray-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-2">
                                                    <p className="text-[11px] font-medium text-gray-700 line-clamp-1 mb-0.5">{product.name}</p>
                                                    {/* <p className="text-sm font-bold text-emerald-600">{formatCurrency(product.price)}</p> */}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )} 
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Featured Products ── */}
            {safeFeatured.length > 0 && (
                <section className="py-12 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <SectionHeader
                            title="Featured Products"
                            subtitle="Handpicked for you"
                            icon={Sparkles}
                            href="/store/search"
                        />
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {safeFeatured.slice(0, 8).map((product) => (
                                <MarketplaceProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── New Arrivals ── */}
            {safeNew.length > 0 && (
                <section className="py-12 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <SectionHeader
                            title="New Arrivals"
                            subtitle="Just landed on the marketplace"
                            icon={Clock}
                            href="/store/search?sort_by=created_at&sort_direction=desc"
                        />
                        <ScrollableRow>
                            {safeNew.map((product) => (
                                <div key={product.id} className="min-w-[180px] w-[180px] sm:min-w-[200px] sm:w-[200px] shrink-0">
                                    <MarketplaceProductCard product={product} />
                                </div>
                            ))}
                        </ScrollableRow>
                    </div>
                </section>
            )}

            {/* ── Best Sellers ── */}
            {safeBest.length > 0 && (
                <section className="py-12 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <SectionHeader
                            title="Best Sellers"
                            subtitle="Most popular products"
                            icon={TrendingUp}
                            href="/store/search"
                        />
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {safeBest.slice(0, 6).map((product, i) => (
                                <div key={product.id} className="relative">
                                    {i < 3 && (
                                        <div className="absolute -top-2 -left-2 z-10 bg-amber-500 text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                                            #{i + 1}
                                        </div>
                                    )}
                                    <MarketplaceProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Shop by Category ── */}
            {parentCategories.length > 0 && (
                <section className="py-12 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <SectionHeader
                            title="Shop by Category"
                            subtitle="Browse products by what you need"
                            icon={Layers}
                            href="/store/categories"
                            linkText="All categories"
                        />
                        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                            {parentCategories.slice(0, 8).map((category) => (
                                <Link
                                    key={category.id}
                                    href={`/store/search?category=${category.id}`}
                                    className="group text-center"
                                >
                                    <div className="w-full aspect-square rounded-2xl bg-gray-100 mb-2 overflow-hidden ring-2 ring-transparent group-hover:ring-emerald-400 transition-all duration-300 group-hover:shadow-md">
                                        <div
                                            className="w-full h-full flex items-center justify-center"
                                            style={{ backgroundColor: category.color || '#3a4a2d' }}
                                        ><Package className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <p className="text-xs font-medium text-gray-700 group-hover:text-emerald-600 transition-colors leading-tight">
                                        {category.name}
                                    </p>
                                    {category.products_count !== undefined && category.products_count > 0 && (
                                        <p className="text-[10px] text-gray-400">{category.products_count} items</p>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Trust bar ── */}
            <section className="bg-white border-y">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-emerald-600" />
                            <span>Verified Vendors</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-emerald-600" />
                            <span>Delivery Nationwide</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-emerald-600" />
                            <span>Quality Guaranteed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-emerald-600" />
                            <span>24/7 Support</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Vendor CTA Banner ── */}
            <section className="bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 border border-emerald-100">
                        <div className="flex items-center gap-4">
                            <div className="bg-emerald-100 rounded-xl p-3 shrink-0">
                                <Store className="h-7 w-7 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Want to sell on Agriinnox?</h3>
                                <p className="text-gray-600 text-sm">Reach thousands of farmers. Free to start, no hidden fees.</p>
                            </div>
                        </div>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 shrink-0 px-6" asChild>
                            <Link href="/vendor/register">
                                Become a Vendor
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* ── Free Delivery Deals ── */}
            {safeFree.length > 0 && (
                <section className="py-12 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <SectionHeader
                            title="Free Delivery"
                            subtitle="No extra cost on shipping"
                            icon={Truck}
                            href="/store/search"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            {safeFree.slice(0, 4).map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/store/products/${product.slug}`}
                                    className="group"
                                >
                                    <Card className="overflow-hidden p-0 border-emerald-200 border-2 hover:shadow-lg transition-all">
                                        <div className="flex gap-4 p-3">
                                            <div className="w-24 h-24 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                                {product.images && product.images.length > 0 ? (
                                                    <img
                                                        src={product.images[0].image_path || product.images[0].image_url}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="h-8 w-8 text-gray-300" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <Badge className="bg-emerald-100 text-emerald-700 text-[10px] mb-1">
                                                    <Truck className="h-2.5 w-2.5 mr-0.5" /> Free Delivery
                                                </Badge>
                                                <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
                                                    {product.name}
                                                </h3>
                                                {/* <p className="text-lg font-bold text-emerald-700">
                                                    {formatCurrency(product.price)}
                                                </p> */}
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── CTA: Explore everything ── */}
            <section className="py-16 bg-gray-50 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl text-emerald-600 font-bold mb-4">
                        Can't find what you need?
                    </h2>
                    <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
                        Search our full catalog of {stats.total_products.toLocaleString()}+ products from {stats.total_vendors.toLocaleString()} vendors
                    </p>
                    <Button
                        size="lg"
                        className="bg-emerald-600 hover:bg-emerald-700 font-bold px-10 py-6 text-lg"
                        asChild
                    >
                        <Link href="/store/search">
                            <Search className="h-5 w-5 mr-2" />
                            Browse All Products
                        </Link>
                    </Button>
                </div>
            </section>

            {/* ── Become a Vendor ── */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="text-white">
                            <h2 className="text-3xl md:text-4xl text-emerald-600 font-bold mb-4">
                                Start selling on Agriinnox
                            </h2>
                            <p className="text-lg text-gray-500 mb-8">
                                Join Rwanda's fastest-growing agricultural marketplace
                            </p>

                            <div className="space-y-5  mb-8">
                                {[
                                    { icon: TrendingUp, title: 'Grow your business', desc: 'Access a large customer base of farmers and agricultural businesses' },
                                    { icon: Shield, title: 'Secure payments', desc: 'Get paid safely and on time with mobile money & bank transfers' },
                                    { icon: Package, title: 'Easy to manage', desc: 'Simple dashboard to manage products, orders, and inventory' },
                                ].map((item) => (
                                    <div key={item.title} className="flex  text-emerald-600 items-start gap-4">
                                        <div className="bg-emerald-600 rounded-lg p-2.5 mt-0.5 shrink-0">
                                            <item.icon className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{item.title}</h3>
                                            <p className=" text-sm">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button
                                size="lg"
                                className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold px-8 shadow-lg"
                                asChild
                            >
                                <Link href="/vendor/register">
                                    Become a Vendor
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        </div>

                        <div className="bg-white rounded-2xl p-8 ">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Why vendors love us</h3>
                            <div className="grid grid-cols-2 gap-6">
                                {[
                                    { value: `${stats.total_products.toLocaleString()}+`, label: 'Listed Products' },
                                    { value: '98%', label: 'Satisfaction Rate' },
                                    { value: '24/7', label: 'Support Available' },
                                    { value: 'Free', label: 'To Get Started' },
                                ].map((stat) => (
                                    <div key={stat.label} className="text-center">
                                        <div className="text-3xl font-bold text-emerald-600 mb-1">{stat.value}</div>
                                        <div className="text-gray-500 text-sm">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Toaster position="bottom-right" richColors />
            <Footer auth={auth} />
        </div>
    );
}
