import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Product, ProductReview, ProductVariant } from '@/types/marketplace';
import { Toaster } from "@/components/ui/sonner"
import ReviewsList from '@/components/ReviewsList';

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
    Plus
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import ProductCard from '@/components/ProductCard';
import { SharedData } from '@/types';
import WelcomeNav from '@/components/navigation/WelcomeNav';
import { toast } from 'sonner';

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
        related_products: Product[];
    };
    user_review?: ProductReview;
    is_in_wishlist: boolean;
    relatedProducts: Product[];
    currentUser?: {
        id: number;
        name: string;
    } | null;
}

export default function ProductShow({ product, user_review, is_in_wishlist, relatedProducts, currentUser }: ProductShowProps) {
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
    const [quantity, setQuantity] = useState(product.minimum_order_quantity || 1);
    const [isInWishlist, setIsInWishlist] = useState(is_in_wishlist);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    // Combine images and video into a single media array
    const mediaItems = React.useMemo(() => {
        const items = [];

        // Add images
        if (product.images && product.images.length > 0) {
            items.push(...product.images.map(img => ({
                type: 'image' as const,
                id: img.id,
                path: img.image_path,
                alt: img.alt_text || product.name,
                is_primary: img.is_primary
            })));
        } else {
            items.push({
                type: 'image' as const,
                id: 0,
                path: '/placeholder-product.jpg',
                alt: product.name,
                is_primary: true
            });
        }

        // Add video if exists
        if (product.video_path) {
            items.push({
                type: 'video' as const,
                id: 'video',
                path: product.video_path,
                alt: 'Product Video',
                is_primary: false
            });
        }

        return items;
    }, [product]);

    const currentMedia = mediaItems[selectedMediaIndex];

    const currentPrice = selectedVariant
        ? product.price + (product.variants?.find((v: ProductVariant) => v.id === selectedVariant)?.price_adjustment || 0)
        : product.price;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('rw-RW', {
            style: 'currency',
            currency: 'RWF'
        }).format(amount);
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            />
        ));
    };

    const maxQuantity = selectedVariant
        ? product.variants?.find((v: ProductVariant) => v.id === selectedVariant)?.stock_quantity || 0
        : (product.maximum_order_quantity ? Math.min(product.stock_quantity, product.maximum_order_quantity) : product.stock_quantity);

    const minQuantity = product.minimum_order_quantity || 1;

    const handleAddToCart = async () => {
        // Check if user is authenticated
        if (!auth?.user) {
            const currentUrl = window.location.pathname + window.location.search;
            window.location.href = `/login?intended=${encodeURIComponent(currentUrl)}`;
            return;
        }

        try {
            setIsAddingToCart(true);
            router.post('/cart/add', {
                product_id: product.id,
                variant_id: selectedVariant,
                quantity: quantity,
            }, {
                onSuccess: () => {
                    toast.success('Product added to cart successfully!');
                    router.reload({ only: ['cartCount'] });
                },
                onError: (errors) => {
                    toast.error('Failed to add product to cart. Please check the form for errors.');

                }
            });

        } catch (error) {

            toast.error('Failed to add product to cart. Please try again.');
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleToggleWishlist = async () => {
        // Check if user is authenticated
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
            }
        } catch (error) {

        }
    };




    const { auth } = usePage<SharedData>().props;
    const safeRelatedProducts = Array.isArray(relatedProducts) ? relatedProducts : [];
    console.log(product)
    return (
        <>
            <Head title={`${product.name} - ${product.vendor?.business_name} | Poultry Marketplace`}>
                <meta name="description" content={product.meta_description || product.short_description || product.description?.substring(0, 160) || `Buy ${product.name} from ${product.vendor?.business_name}. Quality Livestock Equipment and supplies.`} />
                <meta name="keywords" content={`${product.name}, ${product.category?.name}, poultry equipment, ${product.vendor?.business_name}, buy poultry supplies`} />
                <meta property="og:title" content={`${product.name} - ${product.vendor?.business_name}`} />
                <meta property="og:description" content={product.meta_description || product.short_description || product.description?.substring(0, 200)} />
                <meta property="og:image" content={product.images?.[0]?.image_path || '/placeholder-product.jpg'} />
                <meta property="og:type" content="product" />
                <meta property="product:price:amount" content={product.price.toString()} />
                <meta property="product:price:currency" content="RWF" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={`${product.name} - ${product.vendor?.business_name}`} />
                <meta name="twitter:description" content={product.meta_description || product.short_description || product.description?.substring(0, 200)} />
                <meta name="twitter:image" content={product.images?.[0]?.image_path || '/placeholder-product.jpg'} />
                <link rel="canonical" href={`https://agriinnox.com/store/products/${product.slug}`} />
            </Head>
            <WelcomeNav auth={auth} />
            <div className="py-6  bg-gradient-to-b from-gray-50 to-white  pt-36">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Breadcrumbs for SEO */}
                    <nav className="flex mb-4 text-sm" aria-label="Breadcrumb">
                        <ol className="inline-flex items-center space-x-1 md:space-x-3">
                            <li className="inline-flex items-center">
                                <Link href="/" className="text-gray-600 hover:text-emerald-600">Home</Link>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <span className="mx-2 text-gray-400">/</span>
                                    <Link href="/store" className="text-gray-600 hover:text-emerald-600">Store</Link>
                                </div>
                            </li>
                            {product.category && (
                                <li>
                                    <div className="flex items-center">
                                        <span className="mx-2 text-gray-400">/</span>
                                        <Link href={`/store?category=${product.category.id}`} className="text-gray-600 hover:text-emerald-600">{product.category.name}</Link>
                                    </div>
                                </li>
                            )}
                            <li>
                                <div className="flex items-center">
                                    <span className="mx-2 text-gray-400">/</span>
                                    <span className="text-gray-900 font-medium">{product.name}</span>
                                </div>
                            </li>
                        </ol>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Product Media Gallery */}
                        <div className="space-y-4">
                            <Card className='py-0 bg-transparent border-0 shadow-none'>
                                <CardContent className="p-0">
                                    <div className="aspect-square relative bg-gray-100 rounded overflow-hidden">
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
                                                className="w-full h-full object-contain"
                                            />
                                        )}

                                        {mediaItems.length > 1 && (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1"
                                                    onClick={() => setSelectedMediaIndex(
                                                        selectedMediaIndex === 0 ? mediaItems.length - 1 : selectedMediaIndex - 1
                                                    )}
                                                >
                                                    <ChevronLeft className="h-6 w-6" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1"
                                                    onClick={() => setSelectedMediaIndex(
                                                        selectedMediaIndex === mediaItems.length - 1 ? 0 : selectedMediaIndex + 1
                                                    )}
                                                >
                                                    <ChevronRight className="h-6 w-6" />
                                                </Button>
                                            </>
                                        )}
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="bg-white/80 cursor-pointer hover:bg-white"
                                                onClick={() => navigator.share?.({ url: window.location.href })}
                                            >
                                                <Share2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Media Thumbnails */}
                            {mediaItems.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {mediaItems.map((item, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedMediaIndex(index)}
                                            className={`relative flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden ${selectedMediaIndex === index ? 'border-emerald-500' : 'border-transparent'
                                                }`}
                                        >
                                            {item.type === 'video' ? (
                                                <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white">
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                        <div className="bg-white/20 rounded-full p-1">
                                                            <div className="border-[6px] border-transparent border-l-white ml-1"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <img
                                                    src={item.path}
                                                    alt={item.alt}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Details */}
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge variant="outline" className="border-emerald-200 text-emerald-700">{product.category?.name}</Badge>
                                    {product.is_featured && <Badge className="bg-gradient-to-r from-emerald-300 to-emerald-600">⭐ Featured</Badge>}
                                    {product.stock_quantity > 0 && (
                                        <Badge variant="outline" className="border-green-200 text-green-700">✓ In Stock</Badge>
                                    )}
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        {renderStars(product?.rating || 0)}
                                        <span className="ml-2">({product?.total_reviews || 0} reviews)</span>
                                    </div>
                                    <span>SKU: {product?.sku || 'N/A'}</span>
                                </div>
                                {Array.isArray(product.tags) && product.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-3">
                                        {product.tags.map((tag: string, index: number) => (
                                            <Badge key={index} variant="secondary" className="text-[10px] px-2 py-0 h-5 font-normal">
                                                #{tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="">
                                <div className="text-sm text-gray-600 mb-1">Price</div>
                                <div className="text-4xl font-extrabold text-emerald-600 mb-2">
                                    {formatCurrency(currentPrice)}
                                    {product?.is_negotiable && (
                                        <Badge variant="secondary" className="ml-3 text-sm font-normal">
                                            Negotiable
                                        </Badge>
                                    )}
                                </div>
                                {product?.minimum_order_quantity && (
                                    <p className="text-sm text-gray-600">
                                        Minimum order: {product?.minimum_order_quantity} {product?.unit_of_measure}
                                    </p>
                                )}
                                {product.maximum_order_quantity && (
                                    <p className="text-sm text-gray-600">
                                        Maximum order: {product?.maximum_order_quantity} {product?.unit_of_measure}
                                    </p>
                                )}
                            </div>

                            {product.short_description && (
                                <p className="text-gray-700">{product?.short_description}</p>
                            )}

                            {/* Variants */}
                            {product.variants && product.variants.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Variants</label>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant={selectedVariant === null ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setSelectedVariant(null)}
                                        >
                                            Standard
                                        </Button>
                                        {product.variants.map((variant: ProductVariant) => (
                                            <Button
                                                key={variant.id}
                                                variant={selectedVariant === variant.id ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setSelectedVariant(variant.id)}
                                            >
                                                {variant.name}: {variant.value}
                                                {variant.price_adjustment !== 0 && (
                                                    <span className="ml-1">
                                                        ({variant.price_adjustment > 0 ? '+' : ''}{formatCurrency(Math.abs(variant.price_adjustment))})
                                                    </span>
                                                )}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity Selector */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Quantity</label>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center border rounded-lg">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setQuantity(Math.max(minQuantity, quantity - 1))}
                                            disabled={quantity <= minQuantity}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <Input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Math.max(minQuantity, Math.min(maxQuantity || Infinity, parseInt(e.target.value) || minQuantity)))}
                                            className="w-20 text-center border-0 h-8"
                                            min={minQuantity}
                                            max={maxQuantity || undefined}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                                            disabled={quantity >= maxQuantity}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        {maxQuantity} available
                                    </span>
                                </div>
                            </div>

                            {/* Add to Cart */}
                            <div className="space-y-3 flex lg:flex-nowrap flex-wrap gap-4">
                                <Button
                                    onClick={handleAddToCart}
                                    disabled={maxQuantity === 0 || isAddingToCart}
                                    className="w-full cursor-pointer"
                                >
                                    {isAddingToCart && 'Adding...'}
                                    {!isAddingToCart && (
                                        <>
                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                            {auth.user ? 'Add to Cart' : 'Login to Buy'}
                                        </>
                                    )}
                                </Button>
                                <Button variant="outline" className="w-full">
                                    <Link href={`/store/search/?vendor=${product.vendor?.id}`} className="w-full">
                                        View Store
                                    </Link>
                                </Button>


                            </div>

                            {/* Vendor Info */}
                            <Card className="shadow-none border ">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold">{product.vendor?.business_name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                {renderStars(product.vendor?.rating || 0)}
                                                <span className="text-sm text-gray-600">
                                                    ({product.vendor?.total_products || 0} products)
                                                </span>
                                                {product.vendor?.verification_status === 'approved' && (
                                                    <Badge variant="default" className="text-xs">
                                                        <Shield className="h-3 w-3 mr-1" />
                                                        Verified
                                                    </Badge>
                                                )}
                                            </div>
                                            {product.vendor?.business_address && (
                                                <div className="flex items-center mt-2 text-sm text-gray-600">
                                                    <MapPin className="h-4 w-4 mr-1" />
                                                    {product.vendor.business_address}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    <Tabs defaultValue="description" className="mb-8">
                        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
                            <TabsTrigger value="description">Description</TabsTrigger>
                            <TabsTrigger value="specifications">Specifications</TabsTrigger>
                            <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
                            <TabsTrigger value="reviews">Reviews ({product?.total_reviews || 0})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="description" className="mt-6">
                            <Card className='shadow-none border-none py-0'>
                                <CardContent className="p-0">
                                    {product.description ? (
                                        <div
                                            className="prose prose-emerald max-w-none dark:prose-invert text-gray-700 ql-editor"
                                            dangerouslySetInnerHTML={{ __html: product.description }}
                                        />
                                    ) : (
                                        <p className="text-gray-500">No description available.</p>
                                    )}

                                    {
                                        product.additional_info && (
                                            <div className="mt-6">
                                                <h3 className="font-semibold mb-4 text-gray-900 border-b pb-2">Additional Information</h3>
                                                <div
                                                    className="prose prose-emerald max-w-none dark:prose-invert text-gray-700 ql-editor"
                                                    dangerouslySetInnerHTML={{ __html: product.additional_info }}
                                                />
                                            </div>
                                        )
                                    }
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="specifications" className="mt-6">
                            <Card className='shadow-none'>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <span className="font-medium">SKU:</span> {product.sku || 'N/A'}
                                        </div>
                                        <div>
                                            <span className="font-medium">Weight:</span> {product.weight ? `${product.weight} kg` : 'N/A'}
                                        </div>
                                        <div>
                                            <span className="font-medium">Dimensions:</span> {product.dimensions || 'N/A'}
                                        </div>
                                        <div>
                                            <span className="font-medium">Stock:</span> {product.stock_quantity} units
                                        </div>
                                        {product.minimum_order_quantity && (
                                            <div>
                                                <span className="font-medium">Min Order:</span> {product.minimum_order_quantity} units
                                            </div>
                                        )}
                                        {product.maximum_order_quantity && (
                                            <div>
                                                <span className="font-medium">Max Order:</span> {product.maximum_order_quantity} units
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="shipping" className="mt-6">
                            <Card className='shadow-none'>
                                <CardContent className="p-6">
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                                    <Truck className="h-4 w-4 mr-2 text-emerald-600" />
                                                    Shipping Information
                                                </h3>
                                                <ul className="space-y-2 text-sm text-gray-600">
                                                    <li className="flex justify-between">
                                                        <span>Delivery Time:</span>
                                                        <span className="font-medium text-gray-900">{product.delivery_time || 'Check at checkout'}</span>
                                                    </li>
                                                    <li className="flex justify-between">
                                                        <span>Shipping Method:</span>
                                                        <span className="font-medium text-gray-900 capitalize">{product.shipping_option === 'free' ? 'Free Shipping' : 'Calculated at checkout'}</span>
                                                    </li>
                                                    {product.extra_fee && Number(product.extra_fee) > 0 && (
                                                        <li className="flex justify-between">
                                                            <span>Handling Fee:</span>
                                                            <span className="font-medium text-gray-900">{formatCurrency(Number(product.extra_fee))}</span>
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t mt-6">
                                            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                                <Shield className="h-4 w-4 mr-2 text-emerald-600" />
                                                Return Policy
                                            </h3>
                                            {product.return_policy ? (
                                                <div
                                                    className="text-sm text-gray-600 leading-relaxed prose max-w-none ql-editor p-0"
                                                    dangerouslySetInnerHTML={{ __html: product.return_policy }}
                                                />
                                            ) : (
                                                <p className="text-sm text-gray-600 leading-relaxed">
                                                    Standard 7-day return policy applies to this product if it remains in its original condition and packaging.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
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

                    {/* Related Products */}
                    {product.related_products && product.related_products.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Related Products</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {product.related_products.map((relatedProduct) => (
                                        <Card key={relatedProduct.id} className="cursor-pointer hover:shadow-md transition-shadow">
                                            <div
                                                onClick={() => window.location.href = `/marketplace/products/${relatedProduct.slug}`}
                                            >
                                                <div className="aspect-square bg-gray-100">
                                                    {relatedProduct.images && relatedProduct.images.length > 0 ? (
                                                        <img
                                                            src={relatedProduct.images[0].image_path}
                                                            alt={relatedProduct.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <Package className="h-8 w-8" />
                                                        </div>
                                                    )}
                                                </div>
                                                <CardContent className="p-3">
                                                    <h3 className="font-medium text-sm line-clamp-2 mb-1">
                                                        {relatedProduct.name}
                                                    </h3>
                                                    <p className="text-emerald-600 font-bold">
                                                        ${relatedProduct.price}
                                                    </p>
                                                </CardContent>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Related Products */}
                    {safeRelatedProducts.length > 0 && (
                        <div className="mt-12">
                            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {safeRelatedProducts.map((relatedProduct) => (
                                    <ProductCard key={relatedProduct.id} auth={auth} product={relatedProduct} handleAddToCart={() => { handleAddToCart }} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>


            <Toaster position="bottom-right" richColors />
        </>
    );
}
