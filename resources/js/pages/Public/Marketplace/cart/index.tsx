import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    ArrowLeft,
    Package,
    Truck,
    CreditCard,
    ShoppingBag,
    Star,
    MapPin,
    Clock
} from 'lucide-react';
import { toast } from 'sonner';
import WelcomeNav from '@/components/navigation/WelcomeNav';
import { SharedData } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { on } from 'events';

interface CartItem {
    id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    product: {
        id: number;
        name: string;
        slug: string;
        price: number;
        stock_quantity: number;
        minimum_order_quantity?: number;
        maximum_order_quantity?: number;
        images: Array<{
            id: number;
            image_path: string;
            alt_text?: string;
            is_primary: boolean;
        }>;
        vendor: {
            id: number;
            business_name: string;
            user: {
                name: string;
            };
        };
        payment_methods?: string[];
        shipping_option?: string;
        extra_fee?: number;
        delivery_time?: string;
    };
}

interface Props {
    cartItems: CartItem[];
    cartByVendor: Record<string, CartItem[]>;
    subtotal: number;
    totalItems: number;
    tax: number;
    total: number;
}

export default function CartIndex({ cartItems, cartByVendor, subtotal, totalItems, tax, total }: Props) {
    const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
    const [shippingAddress, setShippingAddress] = useState({
        city: '',
        state: '',
        country: '',
        postal_code: ''
    });
    const [shippingCosts, setShippingCosts] = useState<any>(null);
    const [calculatingShipping, setCalculatingShipping] = useState(false);

    const updateQuantity = async (itemId: number, newQuantity: number) => {
        // Find the item to get min/max limits
        const item = Object.values(cartByVendor).flat().find(i => i.id === itemId);
        if (!item) return;

        const maxQty = item.product.maximum_order_quantity
            ? Math.min(item.product.stock_quantity, item.product.maximum_order_quantity)
            : item.product.stock_quantity;

        const minQty = item.product.minimum_order_quantity || 1;

        if (newQuantity < minQty) {
            toast.error(`Minimum order quantity is ${minQty}`);
            return;
        }

        if (newQuantity > maxQty) {
            toast.error(`Maximum order quantity is ${maxQty}`);
            return;
        }

        setUpdatingItems(prev => new Set(prev).add(itemId));

        try {
            router.put(`/cart/update/${itemId}`, { itemId, quantity: newQuantity },
                {
                    onSuccess: () => {
                        router.reload({ only: ['cartItems', 'cartByVendor', 'subtotal', 'totalItems', 'tax', 'total', 'cartCount'] });
                        toast.success('Cart updated successfully');
                    },
                    onError: (error) => {
                        toast.error('Failed to update cart');
                    }
                }

            );

        } catch (error) {
            toast.error('Network error occurred');
        } finally {
            setUpdatingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(itemId);
                return newSet;
            });
        }
    };

    const removeItem = async (itemId: number) => {
        try {
            router.delete(`/cart/remove/${itemId}`, {
                onSuccess: () => {
                    router.reload({ only: ['cartItems', 'cartByVendor', 'subtotal', 'totalItems', 'tax', 'total', 'cartCount'] });
                    toast.success('Item removed from cart');
                },
                onError: (error) => {
                    toast.error('Failed to remove item');
                }
            });

        } catch (error) {
            toast.error('Network error occurred');
        }
    };

    const clearCart = async () => {
        if (!confirm('Are you sure you want to clear your entire cart?')) return;

        try {
            router.delete(`/cart/clear`, {
                onSuccess: () => {
                    router.reload({ only: ['cartItems', 'cartByVendor', 'subtotal', 'totalItems', 'tax', 'total', 'cartCount'] });
                    toast.success('Cart cleared successfully');
                },
                onError: (error) => {
                    toast.error('Failed to clear cart');
                }
            });
        } catch (error) {
            toast.error('Network error occurred');
        }
    };

    const proceedToCheckout = () => {
        router.visit('/checkout');
    };

    const continueShopping = () => {
        router.visit('/store');
    };
    const { auth } = usePage<SharedData>().props;

    if (cartItems.length === 0) {
        return (
            <>
                <Head title="Shopping Cart - Empty" />
                <WelcomeNav auth={auth} />
                <div className="container mx-auto min-h-screen flex justify-center items-center px-4 py-8">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="mb-8">
                            <ShoppingCart className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
                            <h1 className="text-3xl font-bold mb-2">Your Cart is Empty</h1>
                            <p className="text-muted-foreground">
                                Looks like you haven't added anything to your cart yet.
                            </p>
                        </div>
                        <Button onClick={continueShopping} size="lg">
                            <ShoppingBag className="h-5 w-5 mr-2" />
                            Continue Shopping
                        </Button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={`Shopping Cart (${totalItems} items)`} />
            <WelcomeNav auth={auth} />
            <div className="container mx-auto pt-18  max-w-7xl  sm:px-6 lg:px-8 px-4 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Shopping Cart</h1>
                        <p className="text-muted-foreground">
                            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-6">
                        {Object.entries(cartByVendor).map(([vendorId, items]) => (
                            <Card key={vendorId}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        {items[0].product.vendor.business_name}
                                    </CardTitle>
                                    <CardDescription>
                                        Sold by {items[0].product.vendor.user.name}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                                            {/* Product Image */}
                                            <div className="flex-shrink-0">
                                                <img
                                                    src={item.product.images.find(img => img.is_primary)?.image_path || '/placeholder-product.jpg'}
                                                    alt={item.product.name}
                                                    className="w-20 h-20 object-cover rounded-lg"
                                                />
                                            </div>

                                            {/* Product Details */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold truncate">{item.product.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatCurrency(item.unit_price)} each
                                                </p>

                                                {/* Stock info */}
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {item.product.stock_quantity} in stock
                                                    </Badge>
                                                    {item.product.minimum_order_quantity && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Min: {item.product.minimum_order_quantity}
                                                        </Badge>
                                                    )}
                                                    {item.product.maximum_order_quantity && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Max: {item.product.maximum_order_quantity}
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* Payment & Shipping Info */}
                                                <div className="flex items-center gap-2 mt-2">
                                                    {item.product.payment_methods?.includes('cod') && (
                                                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                                                            <Truck className="h-3 w-3" />
                                                            COD Available
                                                        </Badge>
                                                    )}
                                                    {item.product.shipping_option === 'free' ? (
                                                        <Badge variant="outline" className="text-xs text-emerald-600">
                                                            Free Shipping
                                                        </Badge>
                                                    ) : item.product.extra_fee && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Shipping: {formatCurrency(item.product.extra_fee)}
                                                        </Badge>
                                                    )}
                                                    {item.product.delivery_time && (
                                                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {item.product.delivery_time}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    disabled={updatingItems.has(item.id) || item.quantity <= 1}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-12 text-center font-medium">
                                                    {updatingItems.has(item.id) ? '...' : item.quantity}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    disabled={
                                                        updatingItems.has(item.id) ||
                                                        item.quantity >= (item.product.maximum_order_quantity
                                                            ? Math.min(item.product.stock_quantity, item.product.maximum_order_quantity)
                                                            : item.product.stock_quantity)
                                                    }
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>

                                            {/* Price and Remove */}
                                            <div className="text-right">
                                                <p className="font-semibold">{formatCurrency(item.unit_price * item.quantity)}</p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-destructive hover:text-destructive mt-1"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}

                        {/* Clear Cart Button */}
                        <div className="flex justify-end">
                            <Button variant="outline" onClick={clearCart}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Clear Cart
                            </Button>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="space-y-6">
                        {/* Price Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span>Subtotal ({totalItems} items)</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax</span>
                                    <span>{formatCurrency(tax)}</span>
                                </div>
                                {shippingCosts && (
                                    <div className="flex justify-between">
                                        <span>Shipping</span>
                                        <span>{formatCurrency(shippingCosts.total_shipping_cost / 100)}</span>
                                    </div>
                                )}

                                <Separator />

                                <div className="flex justify-between text-lg font-semibold">
                                    <span>Total</span>
                                    <span>
                                        {formatCurrency(total)}
                                    </span>
                                </div>

                                <Button
                                    onClick={proceedToCheckout}
                                    className="w-full"
                                    size="lg"
                                >
                                    <CreditCard className="h-5 w-5 mr-2" />
                                    Proceed to Checkout
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
