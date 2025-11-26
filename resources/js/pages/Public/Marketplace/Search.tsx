import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import WelcomeNav from '@/components/navigation/WelcomeNav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Toaster } from '@/components/ui/sonner';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from '@/components/ui/sheet';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Filter,
    X,
    Star,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Search,
    SlidersHorizontal,
    Truck,
    Grid3X3,
    LayoutGrid,
    Home,
    ArrowRight,
} from 'lucide-react';
import { type SharedData } from '@/types';
import Footer from '@/components/marketplace/Footer';
import MarketplaceProductCard from '@/components/marketplace/ProductCard';

// ── Types ──────────────────────────────────────────────────
interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    stock_quantity: number;
    rating?: number;
    images?: Array<{
        image_path?: string;
        id: number;
        image_url: string;
        alt_text?: string;
        is_primary?: boolean;
    }>;
    category?: { id: number; name: string; slug: string };
    vendor?: { id: number; business_name: string; slug: string };
    shipping_option?: string;
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
        sort?: string;
    };
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

// ── Filter Sidebar (shared between desktop & mobile sheet) ──
function FilterPanel({
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedVendor,
    setSelectedVendor,
    priceMin,
    setPriceMin,
    priceMax,
    setPriceMax,
    priceRange,
    setPriceRange,
    inStockOnly,
    setInStockOnly,
    minRating,
    setMinRating,
    freeShipping,
    setFreeShipping,
    safeCategories,
    safeVendors,
    clearFilters,
    handleSearch,
}: {
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    selectedCategory: string;
    setSelectedCategory: (v: string) => void;
    selectedVendor: string;
    setSelectedVendor: (v: string) => void;
    priceMin: string;
    setPriceMin: (v: string) => void;
    priceMax: string;
    setPriceMax: (v: string) => void;
    priceRange: string;
    setPriceRange: (v: string) => void;
    inStockOnly: boolean;
    setInStockOnly: (v: boolean) => void;
    minRating: string;
    setMinRating: (v: string) => void;
    freeShipping: boolean;
    setFreeShipping: (v: boolean) => void;
    safeCategories: Category[];
    safeVendors: Vendor[];
    clearFilters: () => void;
    handleSearch: () => void;
}) {
    const pricePresets = [
        { label: 'Under 5,000 RWF', key: 'under-5000', min: '', max: '5000' },
        { label: '5,000 – 20,000 RWF', key: '5000-20000', min: '5000', max: '20000' },
        { label: '20,000 – 50,000 RWF', key: '20000-50000', min: '20000', max: '50000' },
        { label: 'Over 50,000 RWF', key: 'over-50000', min: '50000', max: '' },
    ];

    return (
        <div className="space-y-1">
            {/* Search within results */}
            <div className="px-4 py-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search products…"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="pl-9 h-10 border-gray-200 bg-gray-50 focus:bg-white"
                    />
                </div>
            </div>

            {/* Category */}
            <Collapsible defaultOpen>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors">
                    Category
                    <ChevronDown className="h-4 w-4 text-gray-400 transition-transform [[data-state=open]>&]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-3">
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                        <button
                            onClick={() => setSelectedCategory('')}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedCategory ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            All Categories
                        </button>
                        {safeCategories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id.toString())}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat.id.toString() ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </CollapsibleContent>
            </Collapsible>

            <div className="mx-4 border-t border-gray-100" />

            {/* Price Range */}
            <Collapsible defaultOpen>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors">
                    Price
                    <ChevronDown className="h-4 w-4 text-gray-400 transition-transform [[data-state=open]>&]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-3 space-y-3">
                    <div className="flex gap-2 items-center">
                        <Input
                            placeholder="Min"
                            type="number"
                            value={priceMin}
                            onChange={(e) => { setPriceMin(e.target.value); setPriceRange(''); }}
                            className="h-9 text-sm border-gray-200"
                        />
                        <span className="text-gray-400 text-xs shrink-0">to</span>
                        <Input
                            placeholder="Max"
                            type="number"
                            value={priceMax}
                            onChange={(e) => { setPriceMax(e.target.value); setPriceRange(''); }}
                            className="h-9 text-sm border-gray-200"
                        />
                    </div>
                    <div className="space-y-0.5">
                        {pricePresets.map((p) => (
                            <button
                                key={p.key}
                                onClick={() => { setPriceMin(p.min); setPriceMax(p.max); setPriceRange(p.key); }}
                                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${priceRange === p.key ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </CollapsibleContent>
            </Collapsible>

            <div className="mx-4 border-t border-gray-100" />

            {/* Vendor */}
            <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors">
                    Vendor
                    <ChevronDown className="h-4 w-4 text-gray-400 transition-transform [[data-state=open]>&]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-3">
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                        <button
                            onClick={() => setSelectedVendor('')}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedVendor ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            All Vendors
                        </button>
                        {safeVendors.map((v) => (
                            <button
                                key={v.id}
                                onClick={() => setSelectedVendor(v.id.toString())}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedVendor === v.id.toString() ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                {v.business_name}
                            </button>
                        ))}
                    </div>
                </CollapsibleContent>
            </Collapsible>

            <div className="mx-4 border-t border-gray-100" />

            {/* Rating */}
            <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors">
                    Customer Rating
                    <ChevronDown className="h-4 w-4 text-gray-400 transition-transform [[data-state=open]>&]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-3">
                    <div className="space-y-1">
                        {['4', '3', '2'].map((r) => (
                            <button
                                key={r}
                                onClick={() => setMinRating(minRating === r ? '' : r)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${minRating === r ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-3.5 w-3.5 ${i < parseInt(r) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                                        />
                                    ))}
                                </div>
                                <span>& up</span>
                            </button>
                        ))}
                    </div>
                </CollapsibleContent>
            </Collapsible>

            <div className="mx-4 border-t border-gray-100" />

            {/* Availability & Shipping */}
            <div className="px-4 py-3 space-y-3">
                <p className="text-sm font-semibold text-gray-900">Availability</p>
                <label className="flex items-center gap-2.5 cursor-pointer group">
                    <Checkbox
                        checked={inStockOnly}
                        onCheckedChange={(v) => setInStockOnly(v === true)}
                        className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">In Stock Only</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer group">
                    <Checkbox
                        checked={freeShipping}
                        onCheckedChange={(v) => setFreeShipping(v === true)}
                        className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 flex items-center gap-1.5">
                        <Truck className="h-3.5 w-3.5" />
                        Free Shipping
                    </span>
                </label>
            </div>

            {/* Clear all */}
            <div className="px-4 pt-2 pb-4">
                <Button
                    onClick={clearFilters}
                    variant="outline"
                    size="sm"
                    className="w-full text-gray-500 border-gray-200 hover:text-gray-700"
                >
                    Clear All Filters
                </Button>
            </div>
        </div>
    );
}


// ── Main Component ─────────────────────────────────────────
export default function SearchPage({ products, categories, vendors, filters, pagination }: SearchPageProps) {
    const { auth } = usePage<SharedData>().props;

    // Filter states
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
    const [selectedVendor, setSelectedVendor] = useState(filters.vendor || '');
    const [priceMin, setPriceMin] = useState(filters.price_min || '');
    const [priceMax, setPriceMax] = useState(filters.price_max || '');
    const [inStockOnly, setInStockOnly] = useState(filters.in_stock || false);
    const [minRating, setMinRating] = useState(filters.rating || '');
    const [freeShipping, setFreeShipping] = useState(filters.free_shipping || false);
    const [priceRange, setPriceRange] = useState('');
    const [sortBy, setSortBy] = useState(filters.sort || 'best_match');
    const [gridCols, setGridCols] = useState<3 | 4>(3);

    // Safe array handling
    const safeCategories = Array.isArray(categories) ? categories : [];
    const safeVendors = Array.isArray(vendors) ? vendors : [];
    const safeProducts = Array.isArray(products) ? products : [];

    const handleSearch = useCallback(() => {
        const params: Record<string, string> = {};
        if (searchTerm) params.search = searchTerm;
        if (selectedCategory) params.category = selectedCategory;
        if (selectedVendor) params.vendor = selectedVendor;
        if (priceMin) params.price_min = priceMin;
        if (priceMax) params.price_max = priceMax;
        if (inStockOnly) params.in_stock = '1';
        if (minRating) params.rating = minRating;
        if (freeShipping) params.free_shipping = '1';
        if (sortBy !== 'best_match') params.sort = sortBy;

        router.get('/store/search', params, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    }, [searchTerm, selectedCategory, selectedVendor, priceMin, priceMax, inStockOnly, minRating, freeShipping, sortBy]);

    // Separate refs so each effect independently skips its own first mount
    const isFirstFilterEffect = useRef(true);
    const isFirstSearchEffect = useRef(true);

    useEffect(() => {
        if (isFirstFilterEffect.current) {
            isFirstFilterEffect.current = false;
            return;
        }
        handleSearch();
    }, [selectedCategory, selectedVendor, inStockOnly, minRating, freeShipping, sortBy]);

    useEffect(() => {
        if (isFirstSearchEffect.current) {
            isFirstSearchEffect.current = false;
            return;
        }
        const timer = setTimeout(handleSearch, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, priceMin, priceMax]);

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedVendor('');
        setPriceMin('');
        setPriceMax('');
        setInStockOnly(false);
        setMinRating('');
        setFreeShipping(false);
        setPriceRange('');
        router.get('/store/search');
    };

    const removeFilter = (filterName: string) => {
        switch (filterName) {
            case 'search': setSearchTerm(''); break;
            case 'category': setSelectedCategory(''); break;
            case 'vendor': setSelectedVendor(''); break;
            case 'price': setPriceMin(''); setPriceMax(''); setPriceRange(''); break;
            case 'stock': setInStockOnly(false); break;
            case 'rating': setMinRating(''); break;
            case 'shipping': setFreeShipping(false); break;
        }
    };

    const hasActiveFilters = searchTerm || selectedCategory || selectedVendor || priceMin || priceMax ||
        inStockOnly || minRating || freeShipping;

    const activeFilterCount = [
        searchTerm, selectedCategory, selectedVendor,
        priceMin || priceMax, inStockOnly, minRating, freeShipping,
    ].filter(Boolean).length;

    // Shared filter props
    const filterProps = {
        searchTerm, setSearchTerm,
        selectedCategory, setSelectedCategory,
        selectedVendor, setSelectedVendor,
        priceMin, setPriceMin,
        priceMax, setPriceMax,
        priceRange, setPriceRange,
        inStockOnly, setInStockOnly,
        minRating, setMinRating,
        freeShipping, setFreeShipping,
        safeCategories, safeVendors,
        clearFilters, handleSearch,
    };

    const startItem = ((pagination?.current_page || 1) - 1) * (pagination?.per_page || 24) + 1;
    const endItem = Math.min(startItem + safeProducts.length - 1, pagination?.total || safeProducts.length);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Head title={`${searchTerm ? `"${searchTerm}" – ` : ''}Search Products – Agriinnox Marketplace`}>
                <meta name="description" content="Search and filter agricultural products. Find exactly what you need from trusted vendors." />
            </Head>

            <WelcomeNav auth={auth} />

            {/* ── Page content ── */}
            <main className="flex-1">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">

                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
                        <Link href="/" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
                            <Home className="h-3.5 w-3.5" />
                            Home
                        </Link>
                        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
                        <Link href="/store" className="hover:text-emerald-600 transition-colors">Marketplace</Link>
                        {selectedCategory && (
                            <>
                                <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
                                <span className="text-gray-800 font-medium">
                                    {safeCategories.find((c) => c.id.toString() === selectedCategory)?.name}
                                </span>
                            </>
                        )}
                        {searchTerm && !selectedCategory && (
                            <>
                                <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
                                <span className="text-gray-800 font-medium">Search Results</span>
                            </>
                        )}
                    </nav>

                    {/* Search summary banner */}
                    {searchTerm && (
                        <div className="mb-5">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Results for "<span className="text-emerald-600">{searchTerm}</span>"
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                {pagination?.total || 0} products found
                            </p>
                        </div>
                    )}

                    {/* Toolbar: sort + view + mobile filter */}
                    <div className="flex items-center justify-between gap-3 mb-5">
                        <div className="flex items-center gap-3">
                            {/* Mobile filter button (sheet trigger) */}
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="sm" className="lg:hidden relative border-gray-200">
                                        <SlidersHorizontal className="h-4 w-4 mr-1.5" />
                                        Filters
                                        {activeFilterCount > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                                                {activeFilterCount}
                                            </span>
                                        )}
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-80 p-0 overflow-y-auto">
                                    <SheetHeader className="px-4 py-3 border-b border-gray-100">
                                        <SheetTitle className="flex items-center gap-2 text-base">
                                            <Filter className="h-4 w-4 text-emerald-600" />
                                            Filters
                                            {activeFilterCount > 0 && (
                                                <Badge variant="secondary" className="text-xs">{activeFilterCount} active</Badge>
                                            )}
                                        </SheetTitle>
                                    </SheetHeader>
                                    <FilterPanel {...filterProps} />
                                </SheetContent>
                            </Sheet>

                            <p className="text-sm text-gray-500 hidden sm:block">
                                Showing <span className="font-medium text-gray-700">{startItem}–{endItem}</span>{' '}
                                of <span className="font-medium text-gray-700">{pagination?.total || 0}</span> results
                            </p>
                            <p className="text-sm text-gray-500 sm:hidden">
                                <span className="font-medium text-gray-700">{pagination?.total || 0}</span> results
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* View toggle */}
                            <div className="hidden md:flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setGridCols(3)}
                                    className={`p-2 transition-colors ${gridCols === 3 ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
                                    title="3 columns"
                                >
                                    <Grid3X3 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setGridCols(4)}
                                    className={`p-2 transition-colors ${gridCols === 4 ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
                                    title="4 columns"
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Sort */}
                            <select
                                className="h-9 px-3 pr-8 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="best_match">Best Match</option>
                                <option value="price_asc">Price: Low → High</option>
                                <option value="price_desc">Price: High → Low</option>
                                <option value="newest">Newest First</option>
                                <option value="popular">Most Popular</option>
                            </select>
                        </div>
                    </div>

                    {/* Active filter pills */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap items-center gap-2 mb-5">
                            {searchTerm && (
                                <Badge variant="secondary" className="pl-2.5 pr-1 py-1 gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                                    Search: {searchTerm}
                                    <button onClick={() => removeFilter('search')} className="ml-0.5 hover:text-emerald-900 p-0.5 rounded-full hover:bg-emerald-200 transition-colors">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            {selectedCategory && (
                                <Badge variant="secondary" className="pl-2.5 pr-1 py-1 gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                                    {safeCategories.find((c) => c.id.toString() === selectedCategory)?.name}
                                    <button onClick={() => removeFilter('category')} className="ml-0.5 hover:text-emerald-900 p-0.5 rounded-full hover:bg-emerald-200 transition-colors">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            {selectedVendor && (
                                <Badge variant="secondary" className="pl-2.5 pr-1 py-1 gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                                    {safeVendors.find((v) => v.id.toString() === selectedVendor)?.business_name}
                                    <button onClick={() => removeFilter('vendor')} className="ml-0.5 hover:text-emerald-900 p-0.5 rounded-full hover:bg-emerald-200 transition-colors">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            {(priceMin || priceMax) && (
                                <Badge variant="secondary" className="pl-2.5 pr-1 py-1 gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                                    {priceMin || '0'} – {priceMax || '∞'} RWF
                                    <button onClick={() => removeFilter('price')} className="ml-0.5 hover:text-emerald-900 p-0.5 rounded-full hover:bg-emerald-200 transition-colors">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            {inStockOnly && (
                                <Badge variant="secondary" className="pl-2.5 pr-1 py-1 gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                                    In Stock
                                    <button onClick={() => removeFilter('stock')} className="ml-0.5 hover:text-emerald-900 p-0.5 rounded-full hover:bg-emerald-200 transition-colors">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            {minRating && (
                                <Badge variant="secondary" className="pl-2.5 pr-1 py-1 gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                                    {minRating}+ ★
                                    <button onClick={() => removeFilter('rating')} className="ml-0.5 hover:text-emerald-900 p-0.5 rounded-full hover:bg-emerald-200 transition-colors">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            {freeShipping && (
                                <Badge variant="secondary" className="pl-2.5 pr-1 py-1 gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                                    Free Shipping
                                    <button onClick={() => removeFilter('shipping')} className="ml-0.5 hover:text-emerald-900 p-0.5 rounded-full hover:bg-emerald-200 transition-colors">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            <button
                                onClick={clearFilters}
                                className="text-xs text-gray-500 hover:text-emerald-600 underline underline-offset-2 ml-1 transition-colors"
                            >
                                Clear all
                            </button>
                        </div>
                    )}

                    {/* ── Main layout: sidebar + products ── */}
                    <div className="flex gap-6">
                        {/* Desktop sidebar */}
                        <aside className="hidden lg:block w-64 shrink-0">
                            <div className="sticky top-24 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                    <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                        <Filter className="h-4 w-4 text-emerald-600" />
                                        Filters
                                    </h2>
                                    {activeFilterCount > 0 && (
                                        <Badge variant="secondary" className="text-[11px] px-1.5 py-0">{activeFilterCount}</Badge>
                                    )}
                                </div>
                                <FilterPanel {...filterProps} />
                            </div>
                        </aside>

                        {/* Products */}
                        <div className="flex-1 min-w-0">
                            {safeProducts.length > 0 ? (
                                <>
                                    <div className={`grid gap-4 ${
                                        gridCols === 4
                                            ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                                            : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3'
                                    }`}>
                                        {safeProducts.map((product) => (
                                            <MarketplaceProductCard key={product.id} product={product} />
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {pagination && pagination.last_page > 1 && (
                                        <div className="mt-10 flex flex-col items-center gap-4">
                                            <p className="text-sm text-gray-500">
                                                Page {pagination.current_page} of {pagination.last_page}
                                            </p>
                                            <div className="flex items-center gap-1.5">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={pagination.current_page === 1}
                                                    className="h-9 px-3 border-gray-200"
                                                    onClick={() => {
                                                        const params = new URLSearchParams(window.location.search);
                                                        params.set('page', (pagination.current_page - 1).toString());
                                                        window.location.href = `/store/search?${params.toString()}`;
                                                    }}
                                                >
                                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                                    Prev
                                                </Button>

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
                                                                className={`h-9 w-9 p-0 ${page === pagination.current_page ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-600' : 'border-gray-200'}`}
                                                                onClick={() => {
                                                                    const params = new URLSearchParams(window.location.search);
                                                                    params.set('page', page.toString());
                                                                    window.location.href = `/store/search?${params.toString()}`;
                                                                }}
                                                            >
                                                                {page}
                                                            </Button>
                                                        );
                                                    }
                                                    if (page === pagination.current_page - 2 || page === pagination.current_page + 2) {
                                                        return <span key={page} className="px-1 text-gray-400">…</span>;
                                                    }
                                                    return null;
                                                })}

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={pagination.current_page === pagination.last_page}
                                                    className="h-9 px-3 border-gray-200"
                                                    onClick={() => {
                                                        const params = new URLSearchParams(window.location.search);
                                                        params.set('page', (pagination.current_page + 1).toString());
                                                        window.location.href = `/store/search?${params.toString()}`;
                                                    }}
                                                >
                                                    Next
                                                    <ChevronRight className="h-4 w-4 ml-1" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                /* Empty state */
                                <div className="flex flex-col items-center justify-center py-24 px-4">
                                    <div className="bg-gray-100 rounded-full p-6 mb-5">
                                        <Search className="h-10 w-10 text-gray-300" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                                    <p className="text-gray-500 text-center max-w-sm mb-6">
                                        We couldn't find anything matching your criteria. Try adjusting your filters or search terms.
                                    </p>
                                    <div className="flex gap-3">
                                        <Button onClick={clearFilters} variant="outline" className="border-gray-200">
                                            Clear all filters
                                        </Button>
                                        <Button className="bg-emerald-600 hover:bg-emerald-700" asChild>
                                            <Link href="/store">
                                                Browse All
                                                <ArrowRight className="h-4 w-4 ml-1.5" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Toaster position="bottom-right" richColors />
            <Footer auth={auth} />
        </div>
    );
}
