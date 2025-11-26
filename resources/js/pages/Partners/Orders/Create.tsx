import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Search, Package } from 'lucide-react';
import PartnerLayout from '@/layouts/partner-layout';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { toast } from 'sonner';

interface Product {
    id: number;
    name: string;
    price: string;
    unit_of_measure: string;
    stock_quantity: number;
    minimum_order_quantity: number;
    vendor?: { business_name: string };
    images?: { image_path: string }[];
}

interface OrderItem {
    product_id: number | null;
    product_name: string;
    product_unit: string;   // unit_of_measure from the linked product
    product_price: string;  // unit price from the linked product
    description: string;
    quantity: string;
    unit: string;
}

interface Props {
    products: Product[];
    profile: { business_name: string; partner_type: string };
}

const UNITS = ['pieces', 'kg', 'g', 'liter', 'dozen', 'crate', 'bag', 'box', 'tray'];

export default function PartnerOrderCreate({ products, profile }: Props) {
    const [search, setSearch] = useState('');
    const [showProductPicker, setShowProductPicker] = useState<number | null>(null);

    const { data, setData, post, processing, errors } = useForm<{
        description: string;
        delivery_address: string;
        requested_delivery_date: string;
        payment_due_date: string;
        payment_reminder_days: string;
        partner_notes: string;
        items: OrderItem[];
    }>({
        description: '',
        delivery_address: '',
        requested_delivery_date: '',
        payment_due_date: '',
        payment_reminder_days: '',
        partner_notes: '',
        items: [{ product_id: null, product_name: '', product_unit: '', product_price: '', description: '', quantity: '1', unit: 'pieces' }],
    });

    const addItem = () => {
        setData('items', [...data.items, { product_id: null, product_name: '', product_unit: '', product_price: '', description: '', quantity: '1', unit: 'pieces' }]);
    };

    const removeItem = (index: number) => {
        setData('items', data.items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof OrderItem, value: string | number | null) => {
        const updated = [...data.items];
        updated[index] = { ...updated[index], [field]: value };
        setData('items', updated);
    };

    const pickProduct = (index: number, product: Product) => {
        const unit = product.unit_of_measure || 'pieces';
        const updated = [...data.items];
        updated[index] = {
            ...updated[index],
            product_id: product.id,
            product_name: product.name,
            product_unit: unit,
            product_price: product.price,
            unit,
            quantity: String(product.minimum_order_quantity || 1),
        };
        setData('items', updated);
        setShowProductPicker(null);
        setSearch('');
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.vendor?.business_name ?? '').toLowerCase().includes(search.toLowerCase())
    );

    const handleSubmit = (e: React.FormEvent) => {
        try {
            e.preventDefault();
            post('/partner/orders', {
                onSuccess: () => {
                    setData({
                        description: '',
                        delivery_address: '',
                        requested_delivery_date: '',
                        payment_due_date: '',
                        payment_reminder_days: '',
                        partner_notes: '',
                        items: [{ product_id: null, product_name: '', product_unit: '', product_price: '', description: '', quantity: '1', unit: 'pieces' }],
                    });
                    toast.success('Order placed successfully.');
                },
                onError: (error) => {
                    console.error(error);
                    toast.error('An unexpected error occurred. Please try again.');
                },
            });
        } catch (error) {
            console.error(error);
            toast.error('An unexpected error occurred. Please try again.');
        }
       
    };

    return (
          <PartnerLayout>
            <Head title="Place Custom Order" />
            <div className="max-w-3xl mx-auto py-8 px-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Place a Custom Order</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Describe what you need and select products from our platform. We'll prepare and deliver your order.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* General description */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Order Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            
                            <div>
                                <Label htmlFor="description">General Description <span className="text-gray-400">(optional)</span></Label>
                                <RichTextEditor 
                                    value={data.description}
                                    onChange={e => setData('description', e)}
                                    placeholder="Describe what you're looking for in general (e.g. fresh broiler chickens for a banquet)..."
                                  
                                    className="mt-1"
                                />
                                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="delivery_address">Delivery Address *</Label>
                                    <Input
                                        id="delivery_address"
                                        value={data.delivery_address}
                                        onChange={e => setData('delivery_address', e.target.value)}
                                        placeholder="Street, City"
                                        className="mt-1"
                                    />
                                    {errors.delivery_address && <p className="text-red-500 text-xs mt-1">{errors.delivery_address}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="requested_delivery_date">Requested Delivery Date</Label>
                                    <Input
                                        id="requested_delivery_date"
                                        type="date"
                                        value={data.requested_delivery_date}
                                        onChange={e => setData('requested_delivery_date', e.target.value)}
                                        className="mt-1"
                                    />
                                    {errors.requested_delivery_date && <p className="text-red-500 text-xs mt-1">{errors.requested_delivery_date}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="payment_due_date">Proposed Payment Due Date <span className="text-gray-400">(optional)</span></Label>
                                    <Input
                                        id="payment_due_date"
                                        type="date"
                                        value={data.payment_due_date}
                                        onChange={e => setData('payment_due_date', e.target.value)}
                                        className="mt-1"
                                    />
                                    {errors.payment_due_date && <p className="text-red-500 text-xs mt-1">{errors.payment_due_date}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="payment_reminder_days">Payment Reminder Every (days) <span className="text-gray-400">(optional)</span></Label>
                                    <Input
                                        id="payment_reminder_days"
                                        type="number"
                                        min="1"
                                        max="365"
                                        placeholder="e.g. 7"
                                        value={data.payment_reminder_days}
                                        onChange={e => setData('payment_reminder_days', e.target.value)}
                                        className="mt-1"
                                    />
                                    {errors.payment_reminder_days && <p className="text-red-500 text-xs mt-1">{errors.payment_reminder_days}</p>}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="partner_notes">Additional Notes</Label>
                                <Textarea
                                    id="partner_notes"
                                    value={data.partner_notes}
                                    onChange={e => setData('partner_notes', e.target.value)}
                                    placeholder="Any special instructions or preferences..."
                                    rows={4}
                                    className="mt-1"
                                />
                                {errors.partner_notes && <p className="text-red-500 text-xs mt-1">{errors.partner_notes}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Items */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Order Items *</CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                <Plus className="w-4 h-4 mr-1" /> Add Item
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {errors.items && <p className="text-red-500 text-xs">{errors.items as string}</p>}

                            {data.items.map((item, index) => (
                                <div key={index} className="border rounded-lg p-4 space-y-3 relative">
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="text-xs font-medium text-gray-500">Item {index + 1}</span>
                                        {data.items.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeItem(index)}
                                                className="text-red-500 hover:text-red-700 h-6 px-2"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        )}
                                    </div>

                                    {/* Product picker */}
                                    <div>
                                        <Label className="text-xs">Product from Platform <span className="text-gray-400">(optional)</span></Label>
                                        <div className="flex gap-2 mt-1">
                                            <div className="flex-1 text-sm text-gray-700 border rounded px-3 py-2 bg-gray-50">
                                                {item.product_id ? (
                                                    <span className="text-green-700 font-medium flex items-center gap-1">
                                                        {item.product_name}
                                                        {item.product_unit && (
                                                            <Badge variant="secondary" className="text-xs font-normal">{item.product_unit}</Badge>
                                                        )}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">No product selected</span>
                                                )}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setShowProductPicker(showProductPicker === index ? null : index);
                                                    setSearch('');
                                                }}
                                            >
                                                <Search className="w-3 h-3 mr-1" />
                                                Browse
                                            </Button>
                                            {item.product_id && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        const updated = [...data.items];
                                                        updated[index] = { ...updated[index], product_id: null, product_unit: '', product_price: '' };
                                                        setData('items', updated);
                                                    }}
                                                    className="text-gray-400"
                                                >
                                                    ✕
                                                </Button>
                                            )}
                                        </div>

                                        {/* Product search dropdown */}
                                        {showProductPicker === index && (
                                            <div className="mt-2 border rounded-lg shadow-lg bg-white z-20 relative max-h-64 overflow-y-auto">
                                                <div className="p-2 border-b sticky top-0 bg-white">
                                                    <Input
                                                        autoFocus
                                                        placeholder="Search products..."
                                                        value={search}
                                                        onChange={e => setSearch(e.target.value)}
                                                        className="h-8 text-sm"
                                                    />
                                                </div>
                                                {filteredProducts.length === 0 ? (
                                                    <p className="text-center text-gray-400 py-4 text-sm">No products found</p>
                                                ) : (
                                                    filteredProducts.map(product => (
                                                        <button
                                                            key={product.id}
                                                            type="button"
                                                            onClick={() => pickProduct(index, product)}
                                                            className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-3 border-b last:border-0"
                                                        >
                                                            <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                                                <p className="text-xs text-gray-500">
                                                                    {product.vendor?.business_name} · RWF {Number(product.price).toLocaleString()}/{product.unit_of_measure}
                                                                </p>
                                                            </div>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Product name (manual or from picker) */}
                                    <div>
                                        <Label className="text-xs">Item Name *</Label>
                                        <Input
                                            value={item.product_name}
                                            onChange={e => updateItem(index, 'product_name', e.target.value)}
                                            placeholder="e.g. Fresh Broiler Chicken"
                                            className="mt-1 h-8 text-sm"
                                        />
                                        {(errors as any)[`items.${index}.product_name`] && (
                                            <p className="text-red-500 text-xs mt-0.5">{(errors as any)[`items.${index}.product_name`]}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="col-span-1">
                                            <Label className="text-xs">Quantity *</Label>
                                            <Input
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                value={item.quantity}
                                                onChange={e => updateItem(index, 'quantity', e.target.value)}
                                                className="mt-1 h-8 text-sm"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <div className="flex items-center gap-1">
                                                <Label className="text-xs">Unit *</Label>
                                                {item.product_unit && item.unit === item.product_unit && (
                                                    <span className="text-xs text-green-600 font-medium">(auto)</span>
                                                )}
                                            </div>
                                            <Select
                                                value={item.unit}
                                                onValueChange={v => updateItem(index, 'unit', v)}
                                            >
                                                <SelectTrigger className="mt-1 h-8 text-sm">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {/* always include the product's unit even if not in the default list */}
                                                    {[...new Set([...UNITS, ...(item.product_unit ? [item.product_unit] : [])])].map(u => (
                                                        <SelectItem key={u} value={u}>{u}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {item.product_price && (
                                            <div className="col-span-1">
                                                <Label className="text-xs">Est. Total</Label>
                                                <div className="mt-1 h-8 flex items-center px-3 rounded border bg-gray-50 text-sm font-medium text-gray-700">
                                                    RWF {(Number(item.product_price) * Number(item.quantity || 0)).toLocaleString()}
                                                </div>
                                                <p className="text-xs text-gray-400 mt-0.5">@ RWF {Number(item.product_price).toLocaleString()}/{item.product_unit || item.unit}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-span-1">
                                        <Label className="text-xs">Description</Label>
                                        <Textarea
                                            value={item.description}
                                            onChange={e => updateItem(index, 'description', e.target.value)}
                                            placeholder="Details..."
                                            className="mt-1 h-8 text-sm"
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Estimated total */}
                    {(() => {
                        const estimatedTotal = data.items.reduce((sum, item) =>
                            item.product_price ? sum + Number(item.product_price) * Number(item.quantity || 0) : sum, 0);
                        return estimatedTotal > 0 ? (
                            <div className="flex justify-end items-center gap-3 text-sm">
                                <span className="text-gray-500">Estimated Total (linked products):</span>
                                <span className="text-lg font-bold text-gray-900">RWF {estimatedTotal.toLocaleString()}</span>
                            </div>
                        ) : null;
                    })()}

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => router.get('/partner/orders')}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Submitting...' : 'Submit Order'}
                        </Button>
                    </div>
                </form>
            </div>
        </PartnerLayout>
    );
}
