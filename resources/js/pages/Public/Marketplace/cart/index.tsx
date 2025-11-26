import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    Package,
    Truck,
    CreditCard,
    ShoppingBag,
    Home,
    ChevronRight,
    LogIn,
} from 'lucide-react';
import { toast } from 'sonner';
import WelcomeNav from '@/components/navigation/WelcomeNav';
import Footer from '@/components/marketplace/Footer';
import { SharedData } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import useLocalCart from '@/hooks/useLocalCart';

interface Props {
    isAuthenticated: boolean;
}

export default function CartIndex({ isAuthenticated }: Props) {
    const { auth } = usePage<SharedData>().props;
    const { items, count, updateQuantity, removeItem, clear } = useLocalCart();

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handleUpdateQuantity = (productId: number, variantId: number | null, newQty: number) => {
        const item = items.find(i => i.product_id === productId && i.variant_id === variantId);
        if (!item) return;

        if (newQty < 1) return;
        if (newQty > item.stock_quantity) {
            toast.error(`Only ${item.stock_quantity} available`);
            return;
        }

        updateQuantity(productId, variantId, newQty);
    };

    const handleRemove = (productId: number, variantId: number | null) => {
        removeItem(productId, variantId);
        toast.success('Item removed from cart');
    };

    const handleClearCart = () => {
        if (!confirm('Are you sure you want to clear your entire cart?')) return;
        clear();
        toast.success('Cart cleared');
    };

    const handleCheckout = () => {
        if (!isAuthenticated) {
            // Redirect to login with intended URL back to cart
            window.location.href = `/login?intended=${encodeURIComponent('/cart')}`;
            return;
        }

        // Sync local cart to server, then redirect to checkout
        const syncItems = items.map(item => ({
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.quantity,
        }));

        router.post('/cart/sync', { items: syncItems }, {
            onSuccess: () => {
                clear(); // Clear local cart after successful sync
            },
            onError: () => {
                toast.error('Failed to sync cart. Please try again.');
            },
        });
    };

    // Group items by vendor
    const groupedItems = items.reduce<Record<string, typeof items>>((acc, item) => {
        const key = item.vendor_name || 'Unknown Vendor';
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-white flex flex-col">
                <Head title="Shopping Cart" />
                <WelcomeNav auth={auth} />
                <main className="flex-1 min-h-screen flex items-center justify-center px-4">
                    <div className="text-center">
                        <div className="bg-gray-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                            <ShoppingCart className="h-10 w-10 text-gray-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
                        <p className="text-gray-500 mb-6">Browse our marketplace and add products you like.</p>
                        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                            <Link href="/store">
                                <ShoppingBag className="h-4 w-4 mr-2" />
                                Continue Shopping
                            </Link>
                        </Button>
                    </div>
                </main>
                <Footer auth={auth} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Head title={`Shopping Cart (${count} items)`} />
            <WelcomeNav auth={auth} />

            <main className="flex-1  px-4 sm:px-3 lg:px-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">

                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
                        <Link href="/" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
                            <Home className="h-3.5 w-3.5" /> Home
                        </Link>
                        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
                        <Link href="/store" className="hover:text-emerald-600 transition-colors">Marketplace</Link>
                        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
                        <span className="text-gray-800 font-medium">Cart</span>
                    </nav>

                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                {count} {count === 1 ? 'item' : 'items'}
                            </p>
                        </div>
                        <Button variant="destructive" size="sm" onClick={handleClearCart} className="cursor-pointer">
                            <Trash2 className="h-4 w-4 mr-1.5" />
                            Clear Cart
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-5">
                            {Object.entries(groupedItems).map(([vendorName, vendorItems]) => (
                                <Card key={vendorName} className="border border-gray-100 shadow-none">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <Package className="h-4 w-4 text-emerald-600" />
                                            {vendorName}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {vendorItems.map((item) => (
                                            <div key={`${item.product_id}-${item.variant_id}`} className="flex gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                                {/* Image */}
                                                <Link href={`/store/products/${item.slug}`} className="shrink-0">
                                                    <img
                                                        src={item.image || '/placeholder-product.jpg'}
                                                        alt={item.name}
                                                        className="w-20 h-20 object-cover rounded-lg"
                                                    />
                                                </Link>

                                                {/* Details */}
                                                <div className="flex-1 min-w-0">
                                                    <Link href={`/store/products/${item.slug}`} className="font-medium text-gray-900 hover:text-emerald-600 line-clamp-2 text-sm">
                                                        {item.name}
                                                    </Link>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {formatCurrency(item.price)} each
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        <Badge variant="outline" className="text-[10px] py-0">
                                                            {item.stock_quantity} in stock
                                                        </Badge>
                                                    </div>

                                                    {/* Quantity + actions (mobile-friendly row) */}
                                                    <div className="flex items-center justify-between mt-3">
                                                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                                                            <button
                                                                onClick={() => handleUpdateQuantity(item.product_id, item.variant_id, item.quantity - 1)}
                                                                disabled={item.quantity <= 1}
                                                                className="px-2.5 py-1.5 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                                                            >
                                                                <Minus className="h-3.5 w-3.5" />
                                                            </button>
                                                            <span className="w-10 text-center text-sm font-medium border-x border-gray-200 py-1.5">{item.quantity}</span>
                                                            <button
                                                                onClick={() => handleUpdateQuantity(item.product_id, item.variant_id, item.quantity + 1)}
                                                                disabled={item.quantity >= item.stock_quantity}
                                                                className="px-2.5 py-1.5 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                                                            >
                                                                <Plus className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
                                                            <button
                                                                onClick={() => handleRemove(item.product_id, item.variant_id)}
                                                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div>
                            <Card className="border border-gray-100 shadow-none sticky top-28">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Subtotal ({count} items)</span>
                                            <span className="font-medium">{formatCurrency(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Shipping</span>
                                            <span className="text-emerald-600 text-xs font-medium">Calculated at checkout</span>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span className="text-emerald-600">{formatCurrency(subtotal)}</span>
                                    </div>

                                    <Button
                                        onClick={handleCheckout}
                                        className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-base font-semibold"
                                    >
                                        {isAuthenticated ? (
                                            <>
                                                <CreditCard className="h-5 w-5 mr-2" />
                                                Proceed to Checkout
                                            </>
                                        ) : (
                                            <>
                                                <LogIn className="h-5 w-5 mr-2" />
                                                Sign in to Checkout
                                            </>
                                        )}
                                    </Button>

                                    {!isAuthenticated && (
                                        <p className="text-xs text-center text-gray-400">
                                            Your cart items are saved locally and will be preserved after login.
                                        </p>
                                    )}

                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href="/store">
                                            <ShoppingBag className="h-4 w-4 mr-2" />
                                            Continue Shopping
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            <Footer auth={auth} />
        </div>
    );
}
