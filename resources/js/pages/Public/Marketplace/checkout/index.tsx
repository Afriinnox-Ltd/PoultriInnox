import React, { useState, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
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
    ArrowLeft,
    Clock
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import WelcomeNav from '@/components/navigation/WelcomeNav';
import { SharedData } from '@/types';
import { formatCurrency } from '@/utils/formatters';

interface CheckoutPageProps {
    cart?: Cart & {
        items?: Array<CartItem & {
            product: CartItem['product'] & {
                payment_methods?: string[] | string;
                shipping_option?: string;
                extra_fee?: number;
                delivery_time?: string;
                return_policy?: string;
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

    const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash_on_delivery'>('online');
    const [paymentPhoneNumber, setPaymentPhoneNumber] = useState('');
    const [sameBillingAddress, setSameBillingAddress] = useState(true);
    const [selectedShippingAddress, setSelectedShippingAddress] = useState<number | null>(
        user_addresses.find(addr => addr.is_default)?.id || null
    );
    const [selectedBillingAddress, setSelectedBillingAddress] = useState<number | null>(null);
    const [useCustomShipping, setUseCustomShipping] = useState(false);
    const [useCustomBilling, setUseCustomBilling] = useState(false);
    const [notes, setNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [serverError, setServerError] = useState<string>('');

    // Safe access to cart items with proper null checks
    type ExtendedCartItem = CartItem & {
        product: CartItem['product'] & {
            payment_methods?: string[] | string;
            shipping_option?: string;
            extra_fee?: number;
            delivery_time?: string;
            return_policy?: string;
        };
    };

    const cartItems = (cart?.items || []) as ExtendedCartItem[];
    const subtotal = cartItems.reduce((sum, item) => sum + (item.total_price || 0), 0);



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
    }, {} as Record<number, { vendor: any; items: ExtendedCartItem[] }>);

    // Calculate available payment methods across all products
    const availablePaymentMethods = new Set<string>();
    const vendorsWithoutCOD: string[] = [];

    cartItems.forEach(item => {
        console.log('Processing item for payment methods:', item);
        if (item.product?.payment_methods) {
            let methods: string[] = [];

            if (typeof item.product.payment_methods === 'string') {
                try {
                    // Try to parse as JSON first
                    methods = JSON.parse(item.product.payment_methods);
                } catch {
                    // Fallback to comma-separated string
                    methods = item.product.payment_methods.split(',').map((m: string) => m.trim());
                }
            } else if (Array.isArray(item.product.payment_methods)) {
                methods = item.product.payment_methods;
            }

            methods.forEach(method => {
                // Map "cod" to "cash_on_delivery" for consistency
                const normalizedMethod = method === 'cod' ? 'cash_on_delivery' : method;
                availablePaymentMethods.add(normalizedMethod);
            });

            // Track vendors without COD
            const hasCOD = methods.some(m => m === 'cod' || m === 'cash_on_delivery');
            if (!hasCOD && item.product?.vendor?.business_name) {
                if (!vendorsWithoutCOD.includes(item.product.vendor.business_name)) {
                    vendorsWithoutCOD.push(item.product.vendor.business_name);
                }
            }
        }
    });

    // Debug: Log available payment methods
    console.log('Available payment methods:', Array.from(availablePaymentMethods));
    console.log('Available payment methods size:', availablePaymentMethods.size);
    console.log('Cart items with payment methods:', cartItems.map(item => ({
        name: item.product?.name,
        payment_methods: item.product?.payment_methods,
        typeof_payment_methods: typeof item.product?.payment_methods
    })));
    console.log('Raw cart items:', cartItems);

    // Auto-select the first available payment method
    useEffect(() => {
        if (availablePaymentMethods.size > 0) {
            if (availablePaymentMethods.has('online')) {
                setPaymentMethod('online');
            } else if (availablePaymentMethods.has('cash_on_delivery')) {
                setPaymentMethod('cash_on_delivery');
            }
        }
    }, [availablePaymentMethods.size]);

    // Calculate total shipping costs
    const calculateShippingCosts = () => {
        let totalShipping = 0;
        Object.values(itemsByVendor).forEach(({ items }) => {
            // Get the highest shipping cost for items from this vendor
            let vendorShipping = 0;
            items.forEach(item => {
                if (item.product?.shipping_option === 'paid' && item.product?.extra_fee) {
                    vendorShipping = Math.max(vendorShipping, item.product.extra_fee);
                }
            });
            totalShipping += vendorShipping;
        });
        return totalShipping;
    };

    const calculatedShippingCost = calculateShippingCosts();

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
        setErrors({});
        setServerError('');

        const finalShippingAddress = (useCustomShipping || user_addresses.length === 0) ? shippingAddress :
            user_addresses.find(addr => addr.id === selectedShippingAddress) || shippingAddress;

        const finalBillingAddress = sameBillingAddress ? finalShippingAddress :
            ((useCustomBilling || user_addresses.length === 0) ? billingAddress :
                user_addresses.find(addr => addr.id === selectedBillingAddress) || billingAddress);

        // Client-side validation
        const validationErrors: Record<string, string> = {};

        // Validate shipping address
        if (!finalShippingAddress.name) validationErrors['shipping.name'] = 'Name is required';
        if (!finalShippingAddress.phone) validationErrors['shipping.phone'] = 'Phone is required';
        if (!finalShippingAddress.address_line_1) validationErrors['shipping.address_line_1'] = 'Address is required';
        if (!finalShippingAddress.city) validationErrors['shipping.city'] = 'City is required';
        if (!finalShippingAddress.state) validationErrors['shipping.state'] = 'State is required';
        if (!finalShippingAddress.country) validationErrors['shipping.country'] = 'Country is required';

        // Validate billing address if different
        if (!sameBillingAddress) {
            if (!finalBillingAddress.name) validationErrors['billing.name'] = 'Name is required';
            if (!finalBillingAddress.phone) validationErrors['billing.phone'] = 'Phone is required';
            if (!finalBillingAddress.address_line_1) validationErrors['billing.address_line_1'] = 'Address is required';
            if (!finalBillingAddress.city) validationErrors['billing.city'] = 'City is required';
            if (!finalBillingAddress.state) validationErrors['billing.state'] = 'State is required';
            if (!finalBillingAddress.country) validationErrors['billing.country'] = 'Country is required';
        }

        // Validate payment phone number for online payment
        if (paymentMethod === 'online') {
            if (!paymentPhoneNumber || paymentPhoneNumber.length < 9) {
                validationErrors['payment_phone'] = 'Please enter a valid MTN Mobile Money number';
            }
        }

        if (Object.keys(validationErrors).length > 0) {
            console.log('Validation errors found:', validationErrors);
            setErrors(validationErrors);
            setIsProcessing(false);
            return;
        }

        // Use Inertia router for form submission
        router.post('/checkout', {
            shipping_address: finalShippingAddress,
            billing_address: finalBillingAddress,
            payment_method: paymentMethod,
            payment_phone_number: paymentPhoneNumber,
            notes: notes,
        }, {
            onSuccess: (page) => {
                // Handle success - will be redirected automatically by Inertia
                console.log('Order placed successfully');
                setErrors({});
                setServerError('');
            },
            onError: (errors) => {
                console.error('Checkout errors:', errors);
                setErrors(errors);
                if (errors.message) {
                    setServerError(typeof errors.message === 'string' ? errors.message : 'An error occurred during checkout');
                }
                setIsProcessing(false);
            },
            onFinish: () => {
                if (!Object.keys(errors).length) {
                    setIsProcessing(false);
                }
            }
        });
    };

    const isFormValid = () => {
        // Check if cart has items
        if (!cart || cartItems.length === 0) {
            return false;
        }

        // Check if payment methods are available
        if (availablePaymentMethods.size === 0) {
            return false;
        }

        // Check if selected payment method is supported
        if (!availablePaymentMethods.has(paymentMethod)) {
            return false;
        }

        // Determine which shipping address to validate
        const shipping = (useCustomShipping || user_addresses.length === 0) ? shippingAddress :
            user_addresses.find(addr => addr.id === selectedShippingAddress);

        // Determine which billing address to validate
        const billing = sameBillingAddress ? shipping :
            ((useCustomBilling || user_addresses.length === 0) ? billingAddress :
                user_addresses.find(addr => addr.id === selectedBillingAddress));

        // Validate shipping address
        const shippingValid = shipping?.name && shipping?.phone && shipping?.address_line_1 &&
            shipping?.city && shipping?.state && shipping?.country;

        // Validate billing address
        const billingValid = billing?.name && billing?.phone && billing?.address_line_1 &&
            billing?.city && billing?.state && billing?.country;

        console.log('Form validation debug:', {
            hasCart: !!(cart && cartItems.length > 0),
            availablePaymentMethods: Array.from(availablePaymentMethods),
            selectedPaymentMethod: paymentMethod,
            paymentMethodSupported: availablePaymentMethods.has(paymentMethod),
            shipping: shipping,
            billing: billing,
            shippingValid,
            billingValid,
            useCustomShipping,
            useCustomBilling,
            sameBillingAddress,
            userAddressesLength: user_addresses.length
        });

        return shippingValid && billingValid;
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
                            {/* Error Message Display */}
                            {serverError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                                        <span className="text-red-800 font-medium">Error</span>
                                    </div>
                                    <p className="text-red-700 mt-1">{serverError}</p>
                                </div>
                            )}

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
                                                            ? 'border-emerald-500 bg-emerald-50'
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
                                                    className={errors['shipping.name'] ? 'border-red-500' : ''}
                                                />
                                                {errors['shipping.name'] && (
                                                    <p className="text-red-500 text-sm mt-1">{errors['shipping.name']}</p>
                                                )}
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
                                                    <Label className="text-sm font-medium mb-2 block text-emerald-900">
                                                        Saved Addresses
                                                    </Label>
                                                    <div className="space-y-2">
                                                        {user_addresses.map((address) => (
                                                            <div
                                                                key={address.id}
                                                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedBillingAddress === address.id && !useCustomBilling
                                                                    ? 'border-emerald-500 bg-emerald-50'
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
                                        <CreditCard className="h-5 w-5 mr-2" />
                                        Payment Method
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {availablePaymentMethods.size > 0 ? (
                                        <div className="grid grid-cols-1 gap-4">
                                            {/* Online Payment - only show if supported */}
                                            {availablePaymentMethods.has('online') && (
                                                <div
                                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                                        paymentMethod === 'online'
                                                        ? 'border-emerald-500 bg-emerald-50 scale-[1.02]'
                                                        : 'border-gray-300 hover:border-emerald-400 hover:shadow-lg hover:scale-[1.02] hover:bg-emerald-50/30'
                                                    }`}
                                                    onClick={() => setPaymentMethod('online')}
                                                >
                                                    <div className="flex items-center">
                                                        <CreditCard className="h-5 w-5 mr-3 text-emerald-600" />
                                                        <span className="font-semibold text-emerald-700">Online Payment</span>
                                                    </div>
                                                    <p className="text-sm text-emerald-600 mt-1">Pay securely with card or mobile money</p>
                                                </div>
                                            )}

                                            {/* Cash on Delivery - only show if supported */}
                                            {availablePaymentMethods.has('cash_on_delivery') && (
                                                <div
                                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                                        paymentMethod === 'cash_on_delivery'
                                                            ? 'border-emerald-500 bg-emerald-50 shadow-md scale-[1.02]'
                                                            : 'border-gray-300 hover:border-emerald-400 hover:shadow-lg hover:scale-[1.02] hover:bg-emerald-50/30'
                                                    }`}
                                                    onClick={() => setPaymentMethod('cash_on_delivery')}
                                                >
                                                    <div className="flex items-center">
                                                        <Truck className="h-5 w-5 mr-3 text-emerald-600" />
                                                        <span className="font-semibold text-emerald-700">Cash on Delivery</span>
                                                    </div>
                                                    <p className="text-sm text-emerald-600 mt-1">Pay when you receive your order</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : null}

                                    {availablePaymentMethods.size === 0 && (
                                        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                            <div className="flex items-center text-gray-600 mb-1">
                                                <AlertCircle className="h-4 w-4 mr-2" />
                                                <span className="text-sm font-medium">No Payment Methods Configured</span>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Payment methods have not been configured for the items in your cart. Please contact the vendor for payment options.
                                            </p>
                                        </div>
                                    )}

                                    {/* Phone Number Input for Online Payment */}
                                    {paymentMethod === 'online' && availablePaymentMethods.has('online') && (
                                        <div className="mt-4 p-4  border  rounded-lg">
                                            <Label htmlFor="payment-phone" className="text-emerald-900 font-semibold mb-2 block">
                                                MTN Mobile Money Number
                                            </Label>
                                            <Input
                                                id="payment-phone"
                                                type="tel"
                                                placeholder="078XXXXXXX"
                                                
                                                value={paymentPhoneNumber}
                                                onChange={(e) => setPaymentPhoneNumber(e.target.value)}
                                                className={`text-lg ${errors['payment_phone'] ? 'border-red-500' : ''}`}
                                            />
                                            {errors['payment_phone'] && (
                                                <p className="text-red-500 text-sm mt-1">{errors['payment_phone']}</p>
                                            )}
                                            <p className="text-sm text-emerald-700 mt-2">
                                                ℹ You will receive a payment prompt on this number to complete your purchase
                                            </p>
                                        </div>
                                    )}
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
                                        {Object.values(itemsByVendor).map(({ vendor, items }) => {
                                            // Calculate vendor shipping cost
                                            let vendorShipping = 0;
                                            let hasShippingInfo = false;
                                            let deliveryTime = '';

                                            items.forEach(item => {
                                                if (item.product?.shipping_option === 'paid' && item.product?.extra_fee) {
                                                    vendorShipping = Math.max(vendorShipping, item.product.extra_fee);
                                                }
                                                if (item.product?.delivery_time) {
                                                    deliveryTime = item.product.delivery_time;
                                                    hasShippingInfo = true;
                                                }
                                            });

                                            return (
                                                <div key={vendor.id} className="border rounded-lg p-3 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center text-sm font-medium text-gray-700">
                                                            <Package className="h-4 w-4 mr-2" />
                                                            {vendor.business_name}
                                                        </div>
                                                        {vendorShipping > 0 && (
                                                            <Badge variant="outline" className="text-xs">
                                                                Shipping: {formatCurrency(vendorShipping)}
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {items.map((item) => (
                                                        <div key={item.id} className="flex justify-between text-sm pl-6">
                                                            <div className="flex-1">
                                                                <div className="font-medium">{item.product?.name || 'Unknown Product'}</div>
                                                                {item.variant && (
                                                                    <div className="text-gray-600 text-xs">
                                                                        {item.variant.name}: {item.variant.value}
                                                                    </div>
                                                                )}
                                                                <div className="text-gray-600">Qty: {item.quantity}</div>
                                                                {item.product?.delivery_time && (
                                                                    <div className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                                                                        <Clock className="h-3 w-3" />
                                                                        {item.product.delivery_time}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="font-medium">{formatCurrency(item.total_price || 0)}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })}
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
                                                {calculatedShippingCost === 0 ? 'Free' : formatCurrency(calculatedShippingCost)}
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
                                        <span>{formatCurrency(subtotal + calculatedShippingCost + tax_amount - discount_amount)}</span>
                                    </div>

                                    {/* Security Info */}
                                    {/* <div className="bg-emerald-50 p-3 rounded-lg">
                                        <div className="flex items-center text-emerald-700 mb-1">
                                            <Shield className="h-4 w-4 mr-2" />
                                            <span className="text-sm font-medium">Secure Payment</span>
                                        </div>
                                        <p className="text-xs text-emerald-600">
                                            Your payment information is encrypted and secure.
                                        </p>
                                    </div> */}

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
                                            {availablePaymentMethods.size === 0
                                                ? 'No payment methods available for cart items'
                                                : !availablePaymentMethods.has(paymentMethod)
                                                ? 'Selected payment method not supported'
                                                : 'Please complete all required fields'
                                            }
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
