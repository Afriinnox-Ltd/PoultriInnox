import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Cart, CartItem } from '@/types/marketplace';
import {
    CreditCard,
    Package,
    MapPin,
    Phone,
    Mail,
    User,
    Building,
    Truck,
    Shield,
    AlertCircle,
    CheckCircle,
    ArrowLeft
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import WelcomeNav from '@/components/navigation/WelcomeNav';
import { SharedData } from '@/types';

interface CheckoutPageProps {
    cart?: Cart & {
        items?: Array<CartItem & {
            product: {
                id: number;
                name: string;
                price: number;
                images: Array<{ image_url: string; alt_text?: string }>;
                vendor: {
                    id: number;
                    business_name: string;
                };
            };
            variant?: {
                id: number;
                name: string;
                value: string;
                price_adjustment: number;
            };
        }>;
    };
    shipping_cost?: number;
    tax_amount?: number;
    discount_amount?: number;
    total_amount?: number;
    user_addresses?: Array<{
        id: number;
        name: string;
        phone: string;
        address_line_1: string;
        address_line_2?: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
        is_default: boolean;
    }>;
}

export default function CheckoutPage({
    cart,
    shipping_cost = 0,
    tax_amount = 0,
    discount_amount = 0,
    total_amount = 0,
    user_addresses = []
}: CheckoutPageProps) {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;

    const [shippingAddress, setShippingAddress] = useState({
        name: user?.name || '',
        phone: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        country: ''
    });

    const [billingAddress, setBillingAddress] = useState({
        name: user?.name || '',
        phone: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        country: ''
    });

    const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery'>('cash_on_delivery');
    const [sameBillingAddress, setSameBillingAddress] = useState(true);
    const [selectedShippingAddress, setSelectedShippingAddress] = useState<number | null>(
        user_addresses.find(addr => addr.is_default)?.id || null
    );
    const [selectedBillingAddress, setSelectedBillingAddress] = useState<number | null>(null);
    const [useCustomShipping, setUseCustomShipping] = useState(false);
    const [useCustomBilling, setUseCustomBilling] = useState(false);
    const [notes, setNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Safe access to cart items with proper null checks
    const cartItems = cart?.items || [];
    const subtotal = cartItems.reduce((sum, item) => sum + (item.total_price || 0), 0);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('rw-RW', {
            style: 'currency',
            currency: 'RWF'
        }).format(amount);
    };

    // Group items by vendor with proper null checks
    const itemsByVendor = cartItems.reduce((groups, item) => {
        const vendorId = item.product?.vendor?.id;
        if (!vendorId || !item.product) return groups;

        if (!groups[vendorId]) {
            groups[vendorId] = {
                vendor: item.product.vendor,
                items: []
            };
        }
        groups[vendorId].items.push(item);
        return groups;
    }, {} as Record<number, { vendor: any; items: typeof cartItems }>);

    // Early return if cart is empty
    if (!cart || cartItems.length === 0) {
        return (
            <>
                <Head title="Checkout" />
                <WelcomeNav auth={auth} />

                <div className="flex flex-col items-center justify-center min-h-96">
                    <Package className="h-16 w-16 text-gray-400 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h2>
                    <p className="text-gray-500 mb-4">Add some items to your cart before checking out.</p>
                    <Link
                        href="/store"

                    >
                        <Button>
                            Continue Shopping
                        </Button>

                    </Link>
                </div>
            </>
        );
    }

    const handleAddressSelect = (addressId: number, type: 'shipping' | 'billing') => {
        const address = user_addresses.find(addr => addr.id === addressId);
        if (!address) return;

        const addressData = {
            name: address.name,
            phone: address.phone,
            address_line_1: address.address_line_1,
            address_line_2: address.address_line_2 || '',
            city: address.city,
            state: address.state,
            country: address.country
        };

        if (type === 'shipping') {
            setSelectedShippingAddress(addressId);
            setShippingAddress(addressData);
            setUseCustomShipping(false);
        } else {
            setSelectedBillingAddress(addressId);
            setBillingAddress(addressData);
            setUseCustomBilling(false);
        }
    };

    const handlePlaceOrder = async () => {
        setIsProcessing(true);

        const finalShippingAddress = useCustomShipping ? shippingAddress :
            user_addresses.find(addr => addr.id === selectedShippingAddress) || shippingAddress;

        const finalBillingAddress = sameBillingAddress ? finalShippingAddress :
            (useCustomBilling ? billingAddress :
                user_addresses.find(addr => addr.id === selectedBillingAddress) || billingAddress);

        try {
            const response = await fetch('/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    shipping_address: finalShippingAddress,
                    billing_address: finalBillingAddress,
                    payment_method: paymentMethod,
                    notes: notes,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                // Redirect to order confirmation or payment processing
                window.location.href = `/orders/${result.order_id}`;
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to place order. Please try again.');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const isFormValid = () => {
        const shipping = useCustomShipping ? shippingAddress :
            user_addresses.find(addr => addr.id === selectedShippingAddress);

        const billing = sameBillingAddress ? shipping :
            (useCustomBilling ? billingAddress :
                user_addresses.find(addr => addr.id === selectedBillingAddress));

        return shipping?.name && shipping?.phone && shipping?.address_line_1 &&
            shipping?.city && shipping?.state && shipping?.country &&
            billing?.name && billing?.phone && billing?.address_line_1 &&
            billing?.city && billing?.state && billing?.country;
    };

    return (
        <>
            <Head title="Checkout" />
            <WelcomeNav auth={auth} />



            <div className="">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between pt-20">
                        <div className="flex items-center">
                            <Link href={'/cart'} >
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.location.href = '/cart'}
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Cart
                                </Button>
                            </Link>
                            <h2 className="font-semibold text-xl text-gray-800 leading-tight ml-4">
                                Checkout
                            </h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 py-6 lg:grid-cols-3 gap-8">
                        {/* Checkout Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Shipping Address */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <MapPin className="h-5 w-5 mr-2" />
                                        Shipping Address
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Saved Addresses */}
                                    {user_addresses.length > 0 && (
                                        <div>
                                            <Label className="text-sm font-medium mb-2 block">
                                                Saved Addresses
                                            </Label>
                                            <div className="space-y-2">
                                                {user_addresses.map((address) => (
                                                    <div
                                                        key={address.id}
                                                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedShippingAddress === address.id && !useCustomShipping
                                                                ? 'border-blue-500 bg-blue-50'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                        onClick={() => handleAddressSelect(address.id, 'shipping')}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <div className="font-medium">{address.name}</div>
                                                                <div className="text-sm text-gray-600">
                                                                    {address.address_line_1}
                                                                    {address.address_line_2 && `, ${address.address_line_2}`}
                                                                </div>
                                                                <div className="text-sm text-gray-600">
                                                                    {address.city}, {address.state}
                                                                </div>
                                                                <div className="text-sm text-gray-600">{address.phone}</div>
                                                            </div>
                                                            {address.is_default && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    Default
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex items-center space-x-2 mt-3">
                                                <Checkbox
                                                    id="custom-shipping"
                                                    checked={useCustomShipping}
                                                    onCheckedChange={(checked) => setUseCustomShipping(checked === true)}
                                                />
                                                <Label htmlFor="custom-shipping" className="text-sm">
                                                    Use a different address
                                                </Label>
                                            </div>
                                        </div>
                                    )}

                                    {/* Custom Address Form */}
                                    {(useCustomShipping || user_addresses.length === 0) && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="shipping-name">Full Name</Label>
                                                <Input
                                                    id="shipping-name"
                                                    value={shippingAddress.name}
                                                    onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                                                    placeholder="Enter full name"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="shipping-phone">Phone</Label>
                                                <Input
                                                    id="shipping-phone"
                                                    value={shippingAddress.phone}
                                                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                                                    placeholder="Enter phone number"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <Label htmlFor="shipping-address1">Address Line 1</Label>
                                                <Input
                                                    id="shipping-address1"
                                                    value={shippingAddress.address_line_1}
                                                    onChange={(e) => setShippingAddress({ ...shippingAddress, address_line_1: e.target.value })}
                                                    placeholder="Street address"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <Label htmlFor="shipping-address2">Address Line 2 (Optional)</Label>
                                                <Input
                                                    id="shipping-address2"
                                                    value={shippingAddress.address_line_2}
                                                    onChange={(e) => setShippingAddress({ ...shippingAddress, address_line_2: e.target.value })}
                                                    placeholder="Apartment, suite, etc."
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="shipping-city">City</Label>
                                                <Input
                                                    id="shipping-city"
                                                    value={shippingAddress.city}
                                                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                                                    placeholder="Enter city"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="shipping-state">State</Label>
                                                <Input
                                                    id="shipping-state"
                                                    value={shippingAddress.state}
                                                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                                                    placeholder="Enter state"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="shipping-country">Country</Label>
                                                <Input
                                                    id="shipping-country"
                                                    value={shippingAddress.country}
                                                    onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                                                    placeholder="Enter country"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Billing Address */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Building className="h-5 w-5 mr-2" />
                                        Billing Address
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="same-billing"
                                            checked={sameBillingAddress}
                                            onCheckedChange={(checked) => setSameBillingAddress(checked === true)}
                                        />
                                        <Label htmlFor="same-billing" className="text-sm">
                                            Same as shipping address
                                        </Label>
                                    </div>

                                    {!sameBillingAddress && (
                                        <>
                                            {/* Saved Billing Addresses */}
                                            {user_addresses.length > 0 && (
                                                <div>
                                                    <Label className="text-sm font-medium mb-2 block">
                                                        Saved Addresses
                                                    </Label>
                                                    <div className="space-y-2">
                                                        {user_addresses.map((address) => (
                                                            <div
                                                                key={address.id}
                                                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedBillingAddress === address.id && !useCustomBilling
                                                                        ? 'border-blue-500 bg-blue-50'
                                                                        : 'border-gray-200 hover:border-gray-300'
                                                                    }`}
                                                                onClick={() => handleAddressSelect(address.id, 'billing')}
                                                            >
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <div className="font-medium">{address.name}</div>
                                                                        <div className="text-sm text-gray-600">
                                                                            {address.address_line_1}
                                                                            {address.address_line_2 && `, ${address.address_line_2}`}
                                                                        </div>
                                                                        <div className="text-sm text-gray-600">
                                                                            {address.city}, {address.state}
                                                                        </div>
                                                                    </div>
                                                                    {address.is_default && (
                                                                        <Badge variant="secondary" className="text-xs">
                                                                            Default
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="flex items-center space-x-2 mt-3">
                                                        <Checkbox
                                                            id="custom-billing"
                                                            checked={useCustomBilling}
                                                            onCheckedChange={(checked) => setUseCustomBilling(checked === true)}
                                                        />
                                                        <Label htmlFor="custom-billing" className="text-sm">
                                                            Use a different address
                                                        </Label>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Custom Billing Address Form */}
                                            {(useCustomBilling || user_addresses.length === 0) && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="billing-name">Full Name</Label>
                                                        <Input
                                                            id="billing-name"
                                                            value={billingAddress.name}
                                                            onChange={(e) => setBillingAddress({ ...billingAddress, name: e.target.value })}
                                                            placeholder="Enter full name"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="billing-phone">Phone</Label>
                                                        <Input
                                                            id="billing-phone"
                                                            value={billingAddress.phone}
                                                            onChange={(e) => setBillingAddress({ ...billingAddress, phone: e.target.value })}
                                                            placeholder="Enter phone number"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <Label htmlFor="billing-address1">Address Line 1</Label>
                                                        <Input
                                                            id="billing-address1"
                                                            value={billingAddress.address_line_1}
                                                            onChange={(e) => setBillingAddress({ ...billingAddress, address_line_1: e.target.value })}
                                                            placeholder="Street address"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <Label htmlFor="billing-address2">Address Line 2 (Optional)</Label>
                                                        <Input
                                                            id="billing-address2"
                                                            value={billingAddress.address_line_2}
                                                            onChange={(e) => setBillingAddress({ ...billingAddress, address_line_2: e.target.value })}
                                                            placeholder="Apartment, suite, etc."
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="billing-city">City</Label>
                                                        <Input
                                                            id="billing-city"
                                                            value={billingAddress.city}
                                                            onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                                                            placeholder="Enter city"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="billing-state">State</Label>
                                                        <Input
                                                            id="billing-state"
                                                            value={billingAddress.state}
                                                            onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                                                            placeholder="Enter state"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="billing-country">Country</Label>
                                                        <Input
                                                            id="billing-country"
                                                            value={billingAddress.country}
                                                            onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })}
                                                            placeholder="Enter country"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Payment Method */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Truck className="h-5 w-5 mr-2" />
                                        Payment Method
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div
                                            className="p-4 border rounded-lg border-emerald-500 bg-emerald-50"
                                        >
                                            <div className="flex items-center">
                                                <Truck className="h-5 w-5 mr-3 text-emerald-600" />
                                                <span className="font-medium text-emerald-700">Cash on Delivery</span>
                                            </div>
                                            <p className="text-sm text-emerald-600 mt-1">Pay when you receive your order</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Order Notes */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order Notes (Optional)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        placeholder="Special instructions for your order..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={3}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-6">
                                <CardHeader>
                                    <CardTitle>Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Order Items by Vendor */}
                                    <div className="space-y-4">
                                        {Object.values(itemsByVendor).map(({ vendor, items }) => (
                                            <div key={vendor.id} className="space-y-2">
                                                <div className="flex items-center text-sm font-medium text-gray-700">
                                                    <Package className="h-4 w-4 mr-2" />
                                                    {vendor.business_name}
                                                </div>
                                                {items.map((item) => (
                                                    <div key={item.id} className="flex justify-between text-sm">
                                                        <div className="flex-1">
                                                            <div className="font-medium">{item.product?.name || 'Unknown Product'}</div>
                                                            {item.variant && (
                                                                <div className="text-gray-600 text-xs">
                                                                    {item.variant.name}: {item.variant.value}
                                                                </div>
                                                            )}
                                                            <div className="text-gray-600">Qty: {item.quantity}</div>
                                                        </div>
                                                        <div className="font-medium">{formatCurrency(item.total_price || 0)}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>

                                    <Separator />

                                    {/* Cost Breakdown */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>{formatCurrency(subtotal)}</span>
                                        </div>

                                        {discount_amount > 0 && (
                                            <div className="flex justify-between text-emerald-600">
                                                <span>Discount</span>
                                                <span>-{formatCurrency(discount_amount)}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between">
                                            <span>Shipping</span>
                                            <span>
                                                {shipping_cost === 0 ? 'Free' : formatCurrency(shipping_cost)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span>Tax</span>
                                            <span>{formatCurrency(tax_amount)}</span>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span>{formatCurrency(total_amount)}</span>
                                    </div>

                                    {/* Security Info */}
                                    <div className="bg-emerald-50 p-3 rounded-lg">
                                        <div className="flex items-center text-emerald-700 mb-1">
                                            <Shield className="h-4 w-4 mr-2" />
                                            <span className="text-sm font-medium">Secure Payment</span>
                                        </div>
                                        <p className="text-xs text-emerald-600">
                                            Your payment information is encrypted and secure.
                                        </p>
                                    </div>

                                    {/* Place Order Button */}
                                    <Button
                                        onClick={handlePlaceOrder}
                                        className="w-full"
                                        size="lg"
                                        disabled={!isFormValid() || isProcessing}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="h-5 w-5 mr-2" />
                                                Place Order
                                            </>
                                        )}
                                    </Button>

                                    {!isFormValid() && (
                                        <div className="flex items-center text-orange-600 text-sm">
                                            <AlertCircle className="h-4 w-4 mr-2" />
                                            Please complete all required fields
                                        </div>
                                    )}

                                    <p className="text-xs text-gray-500 text-center">
                                        By placing your order, you agree to our Terms of Service and Privacy Policy.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
