import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Product, ProductReview, ProductVariant } from '@/types/marketplace';
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

interface ProductShowProps {
    product: Product & {
        is_negotiable?: boolean;
        images: Array<{ id: number; image_path: string; alt_text?: string; is_primary: boolean }>;
        reviews: ProductReview[];
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
}

export default function ProductShow({ product, user_review, is_in_wishlist }: ProductShowProps) {
   
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
    const [quantity, setQuantity] = useState(product.minimum_order_quantity || 1);
    const [isInWishlist, setIsInWishlist] = useState(is_in_wishlist);
    const [reviewRating, setReviewRating] = useState(user_review?.rating || 0);
    const [reviewText, setReviewText] = useState(user_review?.comment || '');

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

    const maxQuantity = selectedVariant
        ? product.variants?.find(v => v.id === selectedVariant)?.stock_quantity || 0
        : (product.maximum_order_quantity ? Math.min(product.stock_quantity, product.maximum_order_quantity) : product.stock_quantity);

    const minQuantity = product.minimum_order_quantity || 1;

    const handleAddToCart = async () => {
        try {
            const response = await fetch('/marketplace/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    product_id: product.id,
                    variant_id: selectedVariant,
                    quantity: quantity,
                }),
            });

            if (response.ok) {
                // Show success message
                alert('Product added to cart successfully!');
                // Refresh cart count
                router.reload({ only: ['cartCount'] });
            } else {
                alert('Failed to add product to cart. Please try again.');
            }
        } catch (error) {

            alert('Failed to add product to cart. Please try again.');
        }
    };

    const handleToggleWishlist = async () => {
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

    const handleSubmitReview = async () => {
        try {
            const response = await fetch(`/marketplace/products/${product.id}/reviews`, {
                method: user_review ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    rating: reviewRating,
                    comment: reviewText,
                }),
            });

            if (response.ok) {
                alert('Review submitted successfully!');
                window.location.reload();
            }
        } catch (error) {

        }
    };

    const renderStars = (rating: number, interactive = false) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''
                    }`}
                onClick={interactive ? () => setReviewRating(i + 1) : undefined}
            />
        ));
    };

    return (
        <AppLayout
        >
            <Head title={product.name} />
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.history.back()}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back
                    </Button>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight ml-4">
                        {product.name}
                    </h2>
                </div>
                <Button
                    onClick={() => window.location.href = '/marketplace/cart'}
                    variant="outline"
                    size="sm"
                >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Cart
                </Button>
            </div>
            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Product Images */}
                        <div>
                            <Card>
                                <CardContent className="p-0">
                                    <div className="aspect-square relative bg-gray-100">
                                        <img
                                            src={images[selectedImageIndex].image_path}
                                            alt={images[selectedImageIndex].alt_text || product.name}
                                            className="w-full h-full object-cover"
                                        />
                                        {images.length > 1 && (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                                                    onClick={() => setSelectedImageIndex(
                                                        selectedImageIndex === 0 ? images.length - 1 : selectedImageIndex - 1
                                                    )}
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                                                    onClick={() => setSelectedImageIndex(
                                                        selectedImageIndex === images.length - 1 ? 0 : selectedImageIndex + 1
                                                    )}
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="bg-white/80 hover:bg-white"
                                                onClick={handleToggleWishlist}
                                            >
                                                <Heart className={`h-4 w-4 ${isInWishlist ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="bg-white/80 hover:bg-white"
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
                                    <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                                        {product.status}
                                    </Badge>
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
                                    {product.is_negotiable && (
                                        <Badge variant="secondary" className="ml-3 text-sm font-normal">
                                            Negotiable
                                        </Badge>
                                    )}
                                </div>
                                {product.minimum_order_quantity && (
                                    <p className="text-sm text-gray-600">
                                        Minimum order: {product.minimum_order_quantity} {product.unit_of_measure || 'units'}
                                    </p>
                                )}
                                {product.maximum_order_quantity && (
                                    <p className="text-sm text-gray-600">
                                        Maximum order: {product.maximum_order_quantity} {product.unit_of_measure || 'units'}
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
                                            onClick={() => setQuantity(Math.max(minQuantity, quantity - 1))}
                                            disabled={quantity <= minQuantity}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <Input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Math.max(minQuantity, Math.min(maxQuantity || Infinity, parseInt(e.target.value) || minQuantity)))}
                                            className="w-20 text-center border-0"
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
                                        {maxQuantity} {product.unit_of_measure || 'units'} available
                                    </span>
                                </div>
                            </div>

                            {/* Add to Cart */}
                            <div className="space-y-3">
                                <Button
                                    onClick={handleAddToCart}
                                    disabled={maxQuantity === 0}
                                    className="w-full"
                                    size="lg"
                                >
                                    <ShoppingCart className="h-5 w-5 mr-2" />
                                    {maxQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                                </Button>
                                <Button
                                    onClick={() => window.location.href = `/marketplace/vendors/${product.vendor?.id}`}
                                    variant="outline"
                                    className="w-full"
                                >
                                    View Store
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

                            {/* Shipping Info */}
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center mb-2">
                                        <Truck className="h-5 w-5 mr-2 text-blue-600" />
                                        <span className="font-medium">Shipping Information</span>
                                    </div>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li>• Free shipping on orders over {formatCurrency(100)}</li>
                                        <li>• Standard delivery: 3-5 business days</li>
                                        <li>• Express delivery available</li>
                                        <li>• Ships from vendor location</li>
                                    </ul>
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
                                            <span className="font-medium">Stock:</span> {product.stock_quantity} {product.unit_of_measure || 'units'}
                                        </div>
                                        <div>
                                            <span className="font-medium">Unit:</span> {product.unit_of_measure || 'piece'}
                                        </div>
                                        {product.minimum_order_quantity && (
                                            <div>
                                                <span className="font-medium">Min Order:</span> {product.minimum_order_quantity} {product.unit_of_measure || 'units'}
                                            </div>
                                        )}
                                        {product.maximum_order_quantity && (
                                            <div>
                                                <span className="font-medium">Max Order:</span> {product.maximum_order_quantity} {product.unit_of_measure || 'units'}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="reviews" className="mt-6">
                            <div className="space-y-6">
                                {/* Submit Review */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            {user_review ? 'Update Your Review' : 'Write a Review'}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Rating</label>
                                            <div className="flex">
                                                {renderStars(reviewRating, true)}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Review</label>
                                            <Textarea
                                                value={reviewText}
                                                onChange={(e) => setReviewText(e.target.value)}
                                                placeholder="Share your experience with this product..."
                                                rows={4}
                                            />
                                        </div>
                                        <Button onClick={handleSubmitReview} disabled={reviewRating === 0}>
                                            {user_review ? 'Update Review' : 'Submit Review'}
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Existing Reviews */}
                                <div className="space-y-4">
                                    {product.reviews && product.reviews.length > 0 ? (
                                        product.reviews.map((review) => (
                                            <Card key={review.id}>
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <div className="flex">
                                                                {renderStars(review.rating)}
                                                            </div>
                                                            <span className="text-sm text-gray-600">
                                                                by {review.user?.name} on {new Date(review.created_at).toLocaleDateString()}
                                                            </span>
                                                            {review.is_verified_purchase && (
                                                                <Badge variant="secondary" className="ml-2 text-xs">
                                                                    Verified Purchase
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {review.comment && (
                                                        <p className="text-gray-700">{review.comment}</p>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <Card>
                                            <CardContent className="p-6 text-center">
                                                <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </div>
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
                </div>
            </div>
        </AppLayout>
    );
}
