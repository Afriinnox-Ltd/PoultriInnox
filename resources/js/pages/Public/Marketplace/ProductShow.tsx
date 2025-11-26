import React, { useState, useMemo } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Product, ProductReview, ProductVariant } from '@/types/marketplace';
import { Toaster } from '@/components/ui/sonner';
import ReviewsList from '@/components/ReviewsList';
import MarketplaceProductCard, { ProductCardProduct } from '@/components/marketplace/ProductCard';
import WelcomeNav from '@/components/navigation/WelcomeNav';
import Footer from '@/components/marketplace/Footer';
import { formatCurrency } from '@/utils/formatters';
import { SharedData } from '@/types';
import { toast } from 'sonner';
import useLocalCart from '@/hooks/useLocalCart';
import {
    ShoppingCart,
    Heart,
    Share2,
    Star,
    MapPin,
    Package,
    Truck,
    Shield,
    ChevronLeft,
    ChevronRight,
    Minus,
    Plus,
    Check,
    Home,
    Store,
} from 'lucide-react';

interface ProductShowProps {
    product: Product & {
        images: Array<{ id: number; image_path: string; alt_text?: string; is_primary: boolean }>;
        reviews: (ProductReview & { user: { id: number; name: string } })[];
        vendor: {
            id: number;
            business_name: string;
            business_address?: string;
            rating?: number;
            total_products?: number;
            verification_status: string;
        };
        category: {
            id: number;
            name: string;
            slug: string;
        };
        related_products?: Product[];
    };
    user_review?: ProductReview;
    is_in_wishlist?: boolean;
    relatedProducts: Product[];
    currentUser?: {
        id: number;
        name: string;
    } | null;
}

export default function ProductShow({ product, user_review, is_in_wishlist, relatedProducts, currentUser }: ProductShowProps) {
    const { auth } = usePage<SharedData>().props;
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
    const [quantity, setQuantity] = useState(product.minimum_order_quantity || 1);
    const [isInWishlist, setIsInWishlist] = useState(is_in_wishlist ?? false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [imageZoom, setImageZoom] = useState(false);
    const { addItem: addToLocalCart } = useLocalCart();

    // Combine images and video into a single media array
    const mediaItems = useMemo(() => {
        const items: Array<{ type: 'image' | 'video'; id: number | string; path: string; alt: string; is_primary: boolean }> = [];

        if (product.images && product.images.length > 0) {
            items.push(...product.images.map(img => ({
                type: 'image' as const,
                id: img.id,
                path: (img.image_path ?? '/placeholder-product.jpg') as string,
                alt: img.alt_text || product.name,
                is_primary: img.is_primary,
            })));
        } else {
            items.push({
                type: 'image' as const,
                id: 0,
                path: '/placeholder-product.jpg',
                alt: product.name,
                is_primary: true,
            });
        }

        if (product.video_path) {
            items.push({
                type: 'video' as const,
                id: 'video',
                path: product.video_path,
                alt: 'Product Video',
                is_primary: false,
            });
        }

        return items;
    }, [product]);

    const currentMedia = mediaItems[selectedMediaIndex];

    const currentPrice = selectedVariant
        ? product.price + (product.variants?.find((v: ProductVariant) => v.id === selectedVariant)?.price_adjustment || 0)
        : product.price;

    const maxQuantity = selectedVariant
        ? product.variants?.find((v: ProductVariant) => v.id === selectedVariant)?.stock_quantity || 0
        : (product.maximum_order_quantity ? Math.min(product.stock_quantity, product.maximum_order_quantity) : product.stock_quantity);

    const minQuantity = product.minimum_order_quantity || 1;

    const renderStars = (rating: number) =>
        Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
        ));

    const handleAddToCart = () => {
        setIsAddingToCart(true);

        const primaryImage = product.images?.find(i => i.is_primary) || product.images?.[0];
        const success = addToLocalCart({
            product_id: product.id,
            variant_id: selectedVariant,
            quantity,
            name: product.name,
            price: currentPrice,
            image: primaryImage?.image_path || '/placeholder-product.jpg',
            slug: product.slug,
            stock_quantity: maxQuantity,
            vendor_name: product.vendor?.business_name,
        });

        if (success) {
            toast.success('Added to cart!');
        } else {
            toast.error('Not enough stock available');
        }

        setIsAddingToCart(false);
    };

    const handleToggleWishlist = async () => {
        if (!auth?.user) {
            const currentUrl = window.location.pathname + window.location.search;
            window.location.href = `/login?intended=${encodeURIComponent(currentUrl)}`;
            return;
        }

        try {
            const response = await fetch(`/marketplace/wishlist/${product.id}`, {
                method: isInWishlist ? 'DELETE' : 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            if (response.ok) {
                setIsInWishlist(!isInWishlist);
                toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
            }
        } catch {
            toast.error('Something went wrong');
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            await navigator.share({ title: product.name, url });
        } else {
            await navigator.clipboard.writeText(url);
            toast.success('Link copied to clipboard');
        }
    };

    const safeRelatedProducts = Array.isArray(relatedProducts) ? relatedProducts : [];
    const stockLabel = product.stock_quantity === 0
        ? { text: 'Out of Stock', color: 'bg-red-100 text-red-700 border-red-200' }
        : product.stock_quantity <= 5
            ? { text: `Only ${product.stock_quantity} left`, color: 'bg-orange-100 text-orange-700 border-orange-200' }
            : { text: 'In Stock', color: 'bg-green-100 text-green-700 border-green-200' };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Head title={`${product.name} – ${product.vendor?.business_name} | Agriinnox`}>
                <meta name="description" content={product.meta_description || product.short_description || product.description?.substring(0, 160) || `Buy ${product.name} from ${product.vendor?.business_name}.`} />
                <meta name="keywords" content={`${product.name}, ${product.category?.name}, livestock equipment, ${product.vendor?.business_name}`} />
                <meta property="og:title" content={`${product.name} – ${product.vendor?.business_name}`} />
                <meta property="og:description" content={product.meta_description || product.short_description || product.description?.substring(0, 200)} />
                <meta property="og:image" content={product.images?.[0]?.image_path || '/placeholder-product.jpg'} />
                <meta property="og:type" content="product" />
                <meta property="product:price:amount" content={product.price.toString()} />
                <meta property="product:price:currency" content="RWF" />
                <link rel="canonical" href={`https://agriinnox.com/store/products/${product.slug}`} />
            </Head>

            <WelcomeNav auth={auth} />

            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 ">

                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
                        <Link href="/" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
                            <Home className="h-3.5 w-3.5" /> Home
                        </Link>
                        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
                        <Link href="/store" className="hover:text-emerald-600 transition-colors">Marketplace</Link>
                        {product.category && (
                            <>
                                <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
                                <Link href={`/store/search?category=${product.category.id}`} className="hover:text-emerald-600 transition-colors">
                                    {product.category.name}
                                </Link>
                            </>
                        )}
                        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
                        <span className="text-gray-800 font-medium truncate max-w-[200px]">{product.name}</span>
                    </nav>

                    {/* ═══════ Product Section ═══════ */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">

                        {/* ── Media Gallery ── */}
                        <div className="space-y-3">
                            {/* Main image */}
                            <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 group">
                                {currentMedia.type === 'video' ? (
                                    <video
                                        controls
                                        className="w-full h-full object-contain"
                                        src={currentMedia.path}
                                        poster={product.images?.[0]?.image_path}
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                ) : (
                                    <img
                                        src={currentMedia.path}
                                        alt={currentMedia.alt}
                                        className={`w-full h-full transition-transform duration-500 ${imageZoom ? 'scale-150 cursor-zoom-out object-cover' : 'object-contain cursor-zoom-in'}`}
                                        onClick={() => setImageZoom(!imageZoom)}
                                    />
                                )}

                                {mediaItems.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setSelectedMediaIndex(selectedMediaIndex === 0 ? mediaItems.length - 1 : selectedMediaIndex - 1)}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ChevronLeft className="h-5 w-5 text-gray-700" />
                                        </button>
                                        <button
                                            onClick={() => setSelectedMediaIndex(selectedMediaIndex === mediaItems.length - 1 ? 0 : selectedMediaIndex + 1)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ChevronRight className="h-5 w-5 text-gray-700" />
                                        </button>
                                    </>
                                )}

                                {/* Top-right actions */}
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <button
                                        onClick={handleToggleWishlist}
                                        className={`p-2.5 rounded-full shadow-md transition-all ${isInWishlist ? 'bg-red-50 text-red-500' : 'bg-white/90 hover:bg-white text-gray-500 hover:text-red-500'}`}
                                    >
                                        <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="p-2.5 rounded-full bg-white/90 hover:bg-white shadow-md text-gray-500 hover:text-gray-700 transition-all"
                                    >
                                        <Share2 className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Badges */}
                                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                                    {product.is_featured && (
                                        <Badge className="bg-gradient-to-r from-red-500 to-red-500 text-white text-[10px] shadow-sm">⭐ Featured</Badge>
                                    )}
                                    {product.shipping_option === 'free' && (
                                        <Badge className="bg-emerald-600 text-white text-[10px] shadow-sm">
                                            <Truck className="h-3 w-3 mr-0.5" /> Free Delivery
                                        </Badge>
                                    )}
                                </div>

                                {/* Image counter */}
                                {mediaItems.length > 1 && (
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                                        {selectedMediaIndex + 1} / {mediaItems.length}
                                    </div>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {mediaItems.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                                    {mediaItems.map((item, index) => (
                                        <button
                                            key={index}
                                            onClick={() => { setSelectedMediaIndex(index); setImageZoom(false); }}
                                            className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedMediaIndex === index ? 'border-emerald-500 ring-1 ring-emerald-500/30' : 'border-gray-200 hover:border-gray-300'}`}
                                        >
                                            {item.type === 'video' ? (
                                                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                                    <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-0.5" />
                                                </div>
                                            ) : (
                                                <img src={item.path} alt={item.alt} className="w-full h-full object-cover" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ── Product Info ── */}
                        <div className="space-y-5">
                            {/* Category + badges */}
                            <div className="flex flex-wrap items-center gap-2">
                                <Link href={`/store/search?category=${product.category?.id}`} className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full hover:bg-emerald-100 transition-colors">
                                    {product.category?.name}
                                </Link>
                                <Badge variant="outline" className={`text-[11px] ${stockLabel.color}`}>
                                    {stockLabel.text}
                                </Badge>
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>

                            {/* Rating + SKU */}
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center gap-1.5">
                                    {renderStars(product?.rating || 0)}
                                    <span className="text-gray-500">({product?.total_reviews || 0})</span>
                                </div>
                                {product?.sku && (
                                    <>
                                        <Separator orientation="vertical" className="h-4" />
                                        <span className="text-gray-400">SKU: {product.sku}</span>
                                    </>
                                )}
                            </div>

                            {/* Tags */}
                            {Array.isArray(product.tags) && product.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {product.tags.map((tag, i) => (
                                        <span key={i} className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">#{tag}</span>
                                    ))}
                                </div>
                            )}

                            <Separator />

                            {/* Price */}
                            <div>
                                {/* <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Price</p> */}
                                <div className="flex items-baseline gap-3">
                                    {/* <span className="text-3xl font-extrabold text-emerald-600">{formatCurrency(currentPrice)}</span> */}
                                    {product?.is_negotiable && (
                                        <Badge variant="secondary" className="text-xs">Negotiable</Badge>
                                    )}
                                </div>
                                {product?.minimum_order_quantity && product.minimum_order_quantity > 1 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Min. order: {product.minimum_order_quantity} {product?.unit_of_measure || 'units'}
                                    </p>
                                )}
                            </div>

                            {/* Short description */}
                            {product.short_description && (
                                <p className="text-gray-600 text-sm leading-relaxed">{product.short_description}</p>
                            )}

                            {/* Variants */}
                            {product.variants && product.variants.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-gray-900 mb-2">Variants</p>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setSelectedVariant(null)}
                                            className={`px-3.5 py-2 rounded-lg text-sm border transition-all ${selectedVariant === null ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-medium ring-1 ring-emerald-500/20' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                                        >
                                            Standard
                                        </button>
                                        {product.variants.map((variant: ProductVariant) => (
                                            <button
                                                key={variant.id}
                                                onClick={() => setSelectedVariant(variant.id)}
                                                className={`px-3.5 py-2 rounded-lg text-sm border transition-all ${selectedVariant === variant.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-medium ring-1 ring-emerald-500/20' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                                            >
                                                {variant.name}: {variant.value}
                                                {variant.price_adjustment !== 0 && (
                                                    <span className="text-xs ml-1 text-gray-500">
                                                        ({variant.price_adjustment > 0 ? '+' : ''}{formatCurrency(Math.abs(variant.price_adjustment))})
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity + Add to cart */}
                            {/* <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 mb-2">Quantity</p>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                            <button
                                                onClick={() => setQuantity(Math.max(minQuantity, quantity - 1))}
                                                disabled={quantity <= minQuantity}
                                                className="px-3 py-2 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <Input
                                                type="number"
                                                value={quantity}
                                                onChange={(e) => setQuantity(Math.max(minQuantity, Math.min(maxQuantity || Infinity, parseInt(e.target.value) || minQuantity)))}
                                                className="w-16 text-center border-0 border-x border-gray-200 rounded-none h-9 focus-visible:ring-0"
                                                min={minQuantity}
                                                max={maxQuantity || undefined}
                                            />
                                            <button
                                                onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                                                disabled={quantity >= maxQuantity}
                                                className="px-3 py-2 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <span className="text-sm text-gray-500">{maxQuantity} available</span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleAddToCart}
                                        disabled={maxQuantity === 0 || isAddingToCart}
                                        className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-base font-semibold"
                                    >
                                        {isAddingToCart ? (
                                            'Adding…'
                                        ) : (
                                            <>
                                                <ShoppingCart className="h-5 w-5 mr-2" />
                                                Add to Cart
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-12 px-5 border-gray-200"
                                        asChild
                                    >
                                        <Link href={`/store/search?vendor=${product.vendor?.id}`}>
                                            <Store className="h-4 w-4 mr-1.5" />
                                            View Store
                                        </Link>
                                    </Button>
                                </div>
                            </div> */}

                            <Separator />

                            {/* Delivery & guarantee highlights */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                    <div className="bg-emerald-100 rounded-lg p-2 shrink-0">
                                        <Truck className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-900">
                                            {product.shipping_option === 'free' ? 'Free Delivery' : 'Shipping'}
                                        </p>
                                        <p className="text-[11px] text-gray-500">{product.delivery_time || 'Check at checkout'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                    <div className="bg-blue-100 rounded-lg p-2 shrink-0">
                                        <Shield className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-900">Secure Payment</p>
                                        <p className="text-[11px] text-gray-500">MoMo & Bank</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                    <div className="bg-amber-100 rounded-lg p-2 shrink-0">
                                        <Package className="h-4 w-4 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-900">Quality Checked</p>
                                        <p className="text-[11px] text-gray-500">Verified vendors</p>
                                    </div>
                                </div>
                            </div>

                            {/* Vendor card */}
                            <Card className="border border-gray-100 shadow-none">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-emerald-100 rounded-xl p-3 shrink-0">
                                            <Store className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-semibold text-gray-900">{product.vendor?.business_name}</h3>
                                                {product.vendor?.verification_status === 'approved' && (
                                                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                                                        <Check className="h-3 w-3 mr-0.5" /> Verified
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
                                                <div className="flex items-center gap-0.5">
                                                    {renderStars(product.vendor?.rating || 0)}
                                                </div>
                                                <span>{product.vendor?.total_products || 0} products</span>
                                            </div>
                                            {product.vendor?.business_address && (
                                                <p className="flex items-center gap-1 text-xs text-gray-400 mt-1.5">
                                                    <MapPin className="h-3 w-3" />
                                                    {product.vendor.business_address}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* ═══════ Tabs Section ═══════ */}
                    <div className="mb-12">
                        <Tabs defaultValue="description">
                            <TabsList className="w-full justify-start bg-transparent border-b border-gray-200 rounded-none p-0 h-auto gap-0 overflow-x-auto flex-nowrap">
                                {[
                                    { value: 'description', label: 'Description' },
                                    { value: 'specifications', label: 'Specs' },
                                    { value: 'shipping', label: 'Shipping' },
                                    { value: 'reviews', label: `Reviews (${product?.total_reviews || 0})` },
                                ].map((tab) => (
                                    <TabsTrigger
                                        key={tab.value}
                                        value={tab.value}
                                        className="shrink-0 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-emerald-700 px-3 sm:px-5 py-3 text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        {tab.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            <TabsContent value="description" className="mt-6 break-words">
                                {product.description ? (
                                    <div
                                        className="prose prose-emerald max-w-none text-gray-700 ql-editor"
                                        dangerouslySetInnerHTML={{ __html: product.description }}
                                    />
                                ) : (
                                    <p className="text-gray-500 text-sm">No description available.</p>
                                )}
                                {product.additional_info && (
                                    <div className="mt-8 pt-6 border-t border-gray-100">
                                        <h3 className="font-semibold mb-4 text-gray-900">Additional Information</h3>
                                        <div
                                            className="prose prose-emerald max-w-none text-gray-700 ql-editor"
                                            dangerouslySetInnerHTML={{ __html: product.additional_info }}
                                        />
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="specifications" className="mt-6">
                                <div className="max-w-2xl">
                                    <table className="w-full text-sm">
                                        <tbody>
                                            {[
                                                { label: 'SKU', value: product.sku || 'N/A' },
                                                { label: 'Weight', value: product.weight ? `${product.weight} kg` : 'N/A' },
                                                { label: 'Dimensions', value: product.dimensions || 'N/A' },
                                                { label: 'Stock', value: `${product.stock_quantity} units` },
                                                ...(product.minimum_order_quantity ? [{ label: 'Min Order', value: `${product.minimum_order_quantity} units` }] : []),
                                                ...(product.maximum_order_quantity ? [{ label: 'Max Order', value: `${product.maximum_order_quantity} units` }] : []),
                                            ].map((row, i) => (
                                                <tr key={row.label} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                                    <td className="px-4 py-3 font-medium text-gray-700 w-40">{row.label}</td>
                                                    <td className="px-4 py-3 text-gray-600">{row.value}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </TabsContent>

                            <TabsContent value="shipping" className="mt-6">
                                <div className="max-w-2xl space-y-6">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <Truck className="h-4 w-4 text-emerald-600" />
                                            Shipping Information
                                        </h3>
                                        <div className="space-y-3">
                                            {[
                                                { label: 'Delivery Time', value: product.delivery_time || 'Check at checkout' },
                                                { label: 'Shipping', value: product.shipping_option === 'free' ? 'Free Shipping' : 'Calculated at checkout' },
                                                ...(product.extra_fee && Number(product.extra_fee) > 0 ? [{ label: 'Handling Fee', value: formatCurrency(Number(product.extra_fee)) }] : []),
                                            ].map((row) => (
                                                <div key={row.label} className="flex justify-between text-sm py-2 border-b border-gray-50">
                                                    <span className="text-gray-500">{row.label}</span>
                                                    <span className="font-medium text-gray-900">{row.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-emerald-600" />
                                            Return Policy
                                        </h3>
                                        {product.return_policy ? (
                                            <div
                                                className="text-sm text-gray-600 leading-relaxed prose max-w-none ql-editor p-0"
                                                dangerouslySetInnerHTML={{ __html: product.return_policy }}
                                            />
                                        ) : (
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                Standard 7-day return policy applies if the product remains in its original condition and packaging.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="reviews" className="mt-6">
                                <ReviewsList
                                    productId={product.id}
                                    productSlug={product.slug}
                                    reviews={product.reviews || []}
                                    currentUser={currentUser}
                                    averageRating={product.rating || 0}
                                    totalReviews={product.total_reviews || 0}
                                />
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* ═══════ Related Products ═══════ */}
                    {safeRelatedProducts.length > 0 && (
                        <section className="mb-12">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">You may also like</h2>
                                <Link
                                    href={`/store/search?category=${product.category?.id}`}
                                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                                >
                                    View all →
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {safeRelatedProducts.map((relatedProduct) => (
                                    <MarketplaceProductCard key={relatedProduct.id} product={relatedProduct as unknown as ProductCardProduct} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>

            <Toaster position="bottom-right" richColors />
            <Footer auth={auth} />
        </div>
    );
}
