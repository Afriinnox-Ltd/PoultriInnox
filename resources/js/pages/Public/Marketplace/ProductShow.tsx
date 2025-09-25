import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
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
        variants: ProductVariant[];
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
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isInWishlist, setIsInWishlist] = useState(is_in_wishlist);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const images = product.images?.length > 0 ? product.images : [
        { id: 0, image_path: '/placeholder-product.jpg', alt_text: product.name, is_primary: true }
    ];

    const currentPrice = selectedVariant
        ? product.price + (product.variants?.find(v => v.id === selectedVariant)?.price_adjustment || 0)
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
        ? product.variants?.find(v => v.id === selectedVariant)?.stock_quantity || 0
        : product.stock_quantity;

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
                    console.error('Error adding to cart:', errors);
                }
            });

        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add product to cart. Please try again.');
        }finally {
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
            console.error('Error toggling wishlist:', error);
        }
    };




    const { auth } = usePage<SharedData>().props;
    const safeRelatedProducts = Array.isArray(relatedProducts) ? relatedProducts : [];

    return (
        <>
            <Head title={product.name} />
            <WelcomeNav auth={auth} />
            <div className="flex  pt-18 ">
                <div className="max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex items-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.history.back()}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back
                        </Button>
                    </div>

                </div>
            </div>
            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Product Images */}
                        <div>
                            <Card className='py-0 '>
                                <CardContent className="p-0">
                                    <div className="aspect-square relative bg-gray-100">
                                        <img
                                            src={images[selectedImageIndex].image_path}
                                            alt={images[selectedImageIndex].alt_text || product.name}
                                            className="w-full h-full object-contain"
                                        />
                                        {images.length > 1 && (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-emerald-500 hover:bg-emerald-500 cursor-pointer"
                                                    onClick={() => setSelectedImageIndex(
                                                        selectedImageIndex === 0 ? images.length - 1 : selectedImageIndex - 1
                                                    )}
                                                >
                                                    <ChevronLeft className="h-4 w-4 text-white" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-emerald-500 hover:bg-emerald-500 cursor-pointer"
                                                    onClick={() => setSelectedImageIndex(
                                                        selectedImageIndex === images.length - 1 ? 0 : selectedImageIndex + 1
                                                    )}
                                                >
                                                    <ChevronRight className="h-4 w-4 text-white" />
                                                </Button>
                                            </>
                                        )}
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            {/* <Button
                                                variant="ghost"
                                                size="sm"
                                                className="bg-white/80 hover:bg-white"
                                                onClick={handleToggleWishlist}
                                            >
                                                <Heart className={`h-4 w-4 ${isInWishlist ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
                                            </Button> */}
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

                            {/* Thumbnail Images */}
                            {images.length > 1 && (
                                <div className="flex gap-2 mt-4 overflow-x-auto">
                                    {images.map((image, index) => (
                                        <button
                                            key={image.id}
                                            className={`flex-shrink-0 w-20 h-20 border-2 rounded-lg overflow-hidden ${index === selectedImageIndex ? 'border-blue-500' : 'border-gray-200'
                                                }`}
                                            onClick={() => setSelectedImageIndex(index)}
                                        >
                                            <img
                                                src={image.image_path}
                                                alt={image.alt_text || product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Details */}
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline">{product.category?.name}</Badge>
                                    {product.is_featured && <Badge>Featured</Badge>}

                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        {renderStars(product.rating || 0)}
                                        <span className="ml-2">({product.total_reviews || 0} reviews)</span>
                                    </div>
                                    <span>SKU: {product.sku || 'N/A'}</span>
                                </div>
                            </div>

                            <div>
                                <div className="text-3xl font-bold text-emerald-600 mb-2">
                                    {formatCurrency(currentPrice)}
                                </div>
                                {product.min_order_quantity && (
                                    <p className="text-sm text-gray-600">
                                        Minimum order: {product.min_order_quantity} units
                                    </p>
                                )}
                            </div>

                            {product.short_description && (
                                <p className="text-gray-700">{product.short_description}</p>
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
                                        {product.variants.map((variant) => (
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
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            disabled={quantity <= 1}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <Input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Math.max(1, Math.min(maxQuantity, parseInt(e.target.value) || 1)))}
                                            className="w-20 text-center border-0"
                                            min="1"
                                            max={maxQuantity}
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
                                    className="w-full"
                                    size="lg"

                                >
                                {isAddingToCart && 'Adding...'}
                                {!isAddingToCart && (
                                    <>
                                        <ShoppingCart className="h-5 w-5 mr-2" />
                                        {auth.user ? 'Add to Cart' : 'Login to Buy'}
                                    </>
                                )}
                                </Button>
                                <Button variant="outline" size="lg" className="w-full">
                                    <Link href={`/store/?vendor=${product.vendor?.id}`} className="w-full">
                                        View Store
                                    </Link>
                                </Button>


                            </div>

                            {/* Vendor Info */}
                            <Card>
                                <CardContent className="p-4">
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

                    {/* Product Tabs */}
                    <Tabs defaultValue="description" className="mb-8">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="description">Description</TabsTrigger>
                            <TabsTrigger value="specifications">Specifications</TabsTrigger>
                            <TabsTrigger value="reviews">Reviews ({product.total_reviews || 0})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="description" className="mt-6">
                            <Card>
                                <CardContent className="p-6">
                                    {product.description ? (
                                        <div className="prose max-w-none">
                                            {product.description.split('\n').map((paragraph, index) => (
                                                <p key={index} className="mb-4">
                                                    {paragraph}
                                                </p>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">No description available.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="specifications" className="mt-6">
                            <Card>
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
                                        {product.min_order_quantity && (
                                            <div>
                                                <span className="font-medium">Min Order:</span> {product.min_order_quantity} units
                                            </div>
                                        )}
                                        {product.max_order_quantity && (
                                            <div>
                                                <span className="font-medium">Max Order:</span> {product.max_order_quantity} units
                                            </div>
                                        )}
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
