import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Star, Truck } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

export interface ProductCardProduct {
    id: number;
    name: string;
    slug: string;
    price: number;
    stock_quantity: number;
    rating?: number;
    images?: Array<{
        image_path?: string;
        id: number;
        image_url?: string;
        alt_text?: string;
        is_primary?: boolean;
    }>;
    vendor?: {
        id: number;
        business_name: string;
        slug?: string;
    };
    category?: {
        id: number;
        name: string;
        slug?: string;
    };
    shipping_option?: string;
}

export default function ProductCard({ product }: { product: ProductCardProduct }) {
    const primaryImage = product.images?.find((i) => i.is_primary) || product.images?.[0];

    return (
        <Link href={`/store/products/${product.slug}`} className="group block h-full">
            <Card className="overflow-hidden p-0 border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 h-full flex flex-col bg-white">
                <div className="aspect-square bg-gray-50 relative overflow-hidden">
                    {primaryImage ? (
                        <img
                            src={primaryImage.image_path || primaryImage.image_url}
                            alt={primaryImage.alt_text || product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-12 w-12 text-gray-300" />
                        </div>
                    )}
                    {product.stock_quantity === 0 && (
                        <Badge className="absolute top-2 right-2 bg-red-500 text-white text-[10px]">Sold Out</Badge>
                    )}
                    {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
                        <Badge className="absolute top-2 right-2 bg-orange-500 text-white text-[10px]">Few Left</Badge>
                    )}
                    {product.shipping_option === 'free' && (
                        <Badge className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px]">
                            <Truck className="h-3 w-3 mr-1" />Free Delivery
                        </Badge>
                    )}
                </div>
                <CardContent className="p-3 flex-1 flex flex-col space-y-1.5">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight min-h-[2.5rem]">
                        {product.name}
                    </p>
                    {product.vendor && (
                        <p className="text-xs text-gray-500 truncate">
                            {product.vendor.business_name}
                        </p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-1">
                        {/* <span className="text-lg font-bold text-emerald-700">
                            {formatCurrency(product.price)}
                        </span> */}
                        {product.rating !== undefined && product.rating > 0 && (
                            <div className="flex items-center gap-0.5">
                                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                                <span className="text-xs font-medium text-gray-600">
                                    {product.rating.toFixed(1)}
                                </span>
                            </div>
                        )}
                    </div>
                    {product.category && (
                        <p className="text-[11px] text-gray-400 truncate">{product.category.name}</p>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}
