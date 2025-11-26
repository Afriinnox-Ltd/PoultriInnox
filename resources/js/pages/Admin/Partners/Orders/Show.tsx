import React, { useState, useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Trash2, Plus, CheckCircle, DollarSign, Truck, ChevronDown, ChevronUp, AlertTriangle, SplitSquareHorizontal, Package } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    price: string;
    unit_of_measure: string;
    stock_quantity: number;
    vendor?: { business_name: string };
    vendor_id: number;
}

interface Vendor {
    id: number;
    business_name: string;
}

interface Allocation {
    id?: number;
    vendor_id: number | null;
    quantity: string;
    unit_price: string;
    vendor_payout: string;
    notes: string;
    vendor_paid?: boolean;
    vendor_paid_at?: string | null;
    vendor?: { business_name: string };
    _product_id?: number | null; // UI-only: which product listing this vendor will supply
}

interface OrderItem {
    id: number;
    product_id: number | null;
    vendor_id: number | null;
    product_name: string;
    description: string | null;
    quantity: string;
    unit: string;
    unit_price: string | null;
    total_price: string | null;
    vendor_payout: string | null;
    vendor_paid: boolean;
    vendor_paid_at: string | null;
    product?: { images: { image_path: string }[] };
    vendor?: { business_name: string };
    allocations?: Allocation[];
}

interface PartnerOrder {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    total_amount: string | null;
    currency: string;
    description: string | null;
    delivery_address: string | null;
    requested_delivery_date: string | null;
    partner_notes: string | null;
    admin_notes: string | null;
    delivery_tracking_number: string | null;
    confirmed_at: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    paid_at: string | null;
    cancelled_at: string | null;
    payment_due_date: string | null;
    payment_reminder_days: number | null;
    last_payment_reminder_at: string | null;
    created_at: string;
    items: OrderItem[];
    partner: {
        id: number;
        business_name: string;
        partner_type: string;
        phone: string | null;
        address: string | null;
        city: string | null;
        user: { name: string; email: string };
    };
}

interface Props {
    order: PartnerOrder;
    vendors: Vendor[];
    products: Product[];
    vendorStock: Record<number, number>;
}

const STATUSES = ['pending', 'reviewing', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'partial', 'paid', 'refunded'];
const UNITS = ['pieces', 'kg', 'g', 'liter', 'dozen', 'crate', 'bag', 'box', 'tray'];

const STATUS_COLORS: Record<string, string> = {
    pending:    'bg-yellow-100 text-yellow-800',
    reviewing:  'bg-blue-100 text-blue-800',
    confirmed:  'bg-indigo-100 text-indigo-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped:    'bg-cyan-100 text-cyan-800',
    delivered:  'bg-green-100 text-green-800',
    cancelled:  'bg-red-100 text-red-800',
};

type EditableItem = Omit<OrderItem, 'vendor' | 'product'> & {
    _new?: boolean;
};

// ─── Allocation sub-editor for a single item ───────────────────────────────
function ItemAllocationEditor({
    item,
    orderId,
    vendors,
    products,
    vendorStock,
    productVendorId,
    productStock,
    onPayoutChange,
}: {
    item: EditableItem & { allocations?: Allocation[] };
    orderId: number;
    vendors: Vendor[];
    products: Product[];
    vendorStock: Record<number, number>;
    productVendorId?: number | null;
    productStock?: number;
    onPayoutChange?: (totalPayout: number) => void;
}) {
    const requestedQty = parseFloat(item.quantity) || 0;
    const hasExisting = (item.allocations ?? []).length > 0;
    const initAllocs: Allocation[] = hasExisting
        ? (item.allocations ?? []).map(a => ({
            ...a,
            quantity: String(a.quantity),
            unit_price: String(a.unit_price ?? ''),
            vendor_payout: String(a.vendor_payout ?? ''),
            notes: a.notes ?? '',
        }))
        : (() => {
            if (!productVendorId) return [];
            const unitPrice = parseFloat(item.unit_price ?? '0') || 0;
            const vendorQty = productStock != null ? Math.min(requestedQty, productStock) : requestedQty;
            const auto: Allocation[] = [{
                vendor_id: productVendorId,
                _product_id: item.product_id,
                quantity: String(vendorQty.toFixed(2)),
                unit_price: item.unit_price ?? '',
                vendor_payout: unitPrice > 0 ? String((vendorQty * unitPrice).toFixed(2)) : '',
                notes: '',
            }];
            if (productStock != null && productStock < requestedQty) {
                const remainQty = requestedQty - vendorQty;
                // Pick the alternative vendor with the highest stock (excluding the primary vendor)
                const altEntry = Object.entries(vendorStock)
                    .filter(([vid]) => Number(vid) !== productVendorId)
                    .sort(([, a], [, b]) => (b as number) - (a as number))[0];
                const altVendorId = altEntry ? Number(altEntry[0]) : null;
                // Find the best matching product from the alt vendor
                const altProd = altVendorId
                    ? products
                        .filter(p => p.vendor_id === altVendorId)
                        .sort((a, b) => b.stock_quantity - a.stock_quantity)[0]
                    : undefined;
                const altUnitPrice = altProd ? parseFloat(altProd.price) : unitPrice;
                auto.push({
                    vendor_id: altVendorId,
                    _product_id: altProd?.id ?? null,
                    quantity: String(remainQty.toFixed(2)),
                    unit_price: altProd ? altProd.price : (item.unit_price ?? ''),
                    vendor_payout: altUnitPrice > 0 ? String((remainQty * altUnitPrice).toFixed(2)) : '',
                    notes: '',
                });
            }
            return auto;
        })();

    const [open, setOpen] = useState(!hasExisting && initAllocs.length > 0);
    const [allocs, setAllocs] = useState<Allocation[]>(initAllocs);
    const [dirty, setDirty] = useState(!hasExisting && initAllocs.length > 0);
    const [saving, setSaving] = useState(false);

    const allocatedQty = allocs.reduce((s, a) => s + (parseFloat(a.quantity) || 0), 0);
    const remaining = requestedQty - allocatedQty;
    const isOver = allocatedQty > requestedQty + 0.001;
    const isFull = Math.abs(remaining) < 0.001;

    const updateAlloc = (i: number, field: keyof Allocation | '_product_id', value: any) => {
        setAllocs(prev => {
            const next = [...prev];
            next[i] = { ...next[i], [field]: value };
            // Selecting a product auto-fills unit price & payout
            if (field === '_product_id' && value) {
                const prod = products.find(p => p.id === Number(value));
                if (prod) {
                    next[i].unit_price = prod.price;
                    const qty = parseFloat(next[i].quantity) || 0;
                    next[i].vendor_payout = String((qty * parseFloat(prod.price)).toFixed(2));
                }
            }
            // Changing vendor auto-picks their best-stocked product
            if (field === 'vendor_id' && value && value !== 'none') {
                const bestProd = products
                    .filter(p => p.vendor_id === Number(value))
                    .sort((a, b) => b.stock_quantity - a.stock_quantity)[0];
                if (bestProd) {
                    next[i]._product_id = bestProd.id;
                    next[i].unit_price = bestProd.price;
                    const qty = parseFloat(next[i].quantity) || 0;
                    next[i].vendor_payout = String((qty * parseFloat(bestProd.price)).toFixed(2));
                }
            }
            if (field === 'unit_price' || field === 'quantity') {
                const qty   = parseFloat(field === 'quantity'   ? value : next[i].quantity)   || 0;
                const price = parseFloat(field === 'unit_price' ? value : next[i].unit_price) || 0;
                next[i].vendor_payout = String((qty * price).toFixed(2));
            }
            // Notify parent of new total payout
            const totalPayout = next.reduce((s, a) => s + (parseFloat(a.vendor_payout) || 0), 0);
            onPayoutChange?.(totalPayout);
            return next;
        });
        setDirty(true);
    };

    const addAlloc = () => {
        const qty = remaining > 0 ? remaining : 0;
        const unitPrice = parseFloat(item.unit_price ?? '0') || 0;
        const newAlloc: Allocation = {
            vendor_id: null,
            quantity: String(qty > 0 ? qty.toFixed(2) : ''),
            unit_price: item.unit_price ?? '',
            vendor_payout: unitPrice > 0 && qty > 0 ? String((qty * unitPrice).toFixed(2)) : '',
            notes: '',
        };
        const next = [...allocs, newAlloc];
        setAllocs(next);
        const totalPayout = next.reduce((s, a) => s + (parseFloat(a.vendor_payout) || 0), 0);
        onPayoutChange?.(totalPayout);
        setDirty(true);
    };

    const removeAlloc = (i: number) => {
        const next = allocs.filter((_, idx) => idx !== i);
        setAllocs(next);
        const totalPayout = next.reduce((s, a) => s + (parseFloat(a.vendor_payout) || 0), 0);
        onPayoutChange?.(totalPayout);
        setDirty(true);
    };

    const save = () => {
        setSaving(true);
        // Rename _product_id → product_id for the backend
        const payload = allocs.map(({ _product_id, ...a }) => ({ ...a, product_id: _product_id ?? null }));
        router.put(
            `/admin/partners/orders/${orderId}/items/${item.id}/allocations`,
            { allocations: payload } as any,
            { preserveScroll: true, onFinish: () => { setSaving(false); setDirty(false); } }
        );
    };

    const markPaid = (allocId: number) => {
        router.patch(`/admin/partners/orders/${orderId}/allocations/${allocId}/vendor-paid`, {}, { preserveScroll: true });
    };

    if (item._new || !item.id) return null;

    return (
        <div className="border-t mt-3 pt-3">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 text-xs font-semibold text-indigo-700 hover:text-indigo-900 w-full"
            >
                <SplitSquareHorizontal className="w-3.5 h-3.5" />
                Allocate to Vendors
                <span className={`ml-1 px-1.5 py-0.5 rounded text-xs font-medium ${
                    isOver   ? 'bg-red-100 text-red-700' :
                    isFull   ? 'bg-green-100 text-green-700' :
                    allocs.length > 0 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-500'
                }`}>
                    {allocatedQty.toFixed(2)} / {requestedQty.toFixed(2)} {item.unit}
                </span>
                {isOver && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                <span className="ml-auto">{open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}</span>
            </button>

            {open && (
                <div className="mt-3 space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                        <div
                            className={`h-1.5 rounded-full transition-all ${isOver ? 'bg-red-500' : isFull ? 'bg-green-500' : 'bg-indigo-500'}`}
                            style={{ width: `${Math.min(100, requestedQty > 0 ? (allocatedQty / requestedQty) * 100 : 0)}%` }}
                        />
                    </div>
                    {isOver && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Over-allocated by {(allocatedQty - requestedQty).toFixed(2)} {item.unit}
                        </p>
                    )}
                    {!isFull && !isOver && allocs.length > 0 && (
                        <p className="text-xs text-yellow-700">{remaining.toFixed(2)} {item.unit} still unallocated</p>
                    )}

                    {allocs.map((alloc, i) => {
                        const vid = alloc.vendor_id ? Number(alloc.vendor_id) : null;
                        const stock = vid ? (vendorStock[vid] ?? null) : null;
                        const stockLow = stock !== null && parseFloat(alloc.quantity) > stock;
                        return (
                            <div key={i} className="border rounded p-3 space-y-2 bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400 font-medium">Allocation {i + 1}</span>
                                    <div className="flex items-center gap-2">
                                        {alloc.vendor_paid && (
                                            <span className="text-xs text-green-600 flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" /> Paid
                                            </span>
                                        )}
                                        {!alloc.vendor_paid && alloc.id && alloc.vendor_id && (
                                            <Button type="button" variant="outline" size="sm"
                                                className="h-6 px-2 text-xs text-green-700"
                                                onClick={() => markPaid(alloc.id!)}>
                                                <DollarSign className="w-3 h-3 mr-1" /> Mark Paid
                                            </Button>
                                        )}
                                        <Button type="button" variant="ghost" size="sm"
                                            className="h-6 px-2 text-red-400" onClick={() => removeAlloc(i)}>
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label className="text-xs">Vendor *</Label>
                                        <Select
                                            value={alloc.vendor_id ? String(alloc.vendor_id) : 'none'}
                                            onValueChange={v => updateAlloc(i, 'vendor_id', v === 'none' ? null : Number(v))}
                                        >
                                            <SelectTrigger className="mt-1 h-7 text-xs"><SelectValue placeholder="Select vendor..." /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">— Select —</SelectItem>
                                                {vendors.map(v => (
                                                    <SelectItem key={v.id} value={String(v.id)}>
                                                        {v.business_name}{vendorStock[v.id] != null ? ` (stock: ${vendorStock[v.id]})` : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {stockLow && (
                                            <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" /> Qty exceeds vendor stock ({stock})
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Label className="text-xs">Quantity ({item.unit})</Label>
                                        <Input type="number" min="0.01" step="0.01"
                                            value={alloc.quantity}
                                            onChange={e => updateAlloc(i, 'quantity', e.target.value)}
                                            className="mt-1 h-7 text-xs" />
                                    </div>
                                </div>
                                {/* Product from this vendor */}
                                {vid && (() => {
                                    const vendorProds = products.filter(p => p.vendor_id === vid);
                                    if (!vendorProds.length) return (
                                        <p className="text-xs text-amber-600 flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" /> No active products found for this vendor
                                        </p>
                                    );
                                    return (
                                        <div>
                                            <Label className="text-xs">Product supplied by this vendor</Label>
                                            <Select
                                                value={alloc._product_id ? String(alloc._product_id) : 'none'}
                                                onValueChange={v => updateAlloc(i, '_product_id', v === 'none' ? null : Number(v))}
                                            >
                                                <SelectTrigger className="mt-1 h-7 text-xs"><SelectValue placeholder="Select product..." /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">— Select product —</SelectItem>
                                                    {vendorProds.map(p => (
                                                        <SelectItem key={p.id} value={String(p.id)}>
                                                            {p.name} · stock: {p.stock_quantity} · RWF {Number(p.price).toLocaleString()}/{p.unit_of_measure}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {alloc._product_id && (() => {
                                                const sp = products.find(p => p.id === alloc._product_id);
                                                return sp ? (
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        Stock: <strong>{sp.stock_quantity} {sp.unit_of_measure}</strong>
                                                        {sp.stock_quantity < parseFloat(alloc.quantity) && (
                                                            <span className="text-red-500 ml-2 flex items-center gap-0.5 inline-flex">
                                                                <AlertTriangle className="w-3 h-3" /> Insufficient ({sp.stock_quantity} available)
                                                            </span>
                                                        )}
                                                    </p>
                                                ) : null;
                                            })()}
                                        </div>
                                    );
                                })()}
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <Label className="text-xs">Unit Price (RWF)</Label>
                                        <Input type="number" min="0" step="0.01"
                                            value={alloc.unit_price}
                                            onChange={e => updateAlloc(i, 'unit_price', e.target.value)}
                                            className="mt-1 h-7 text-xs" />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Vendor Payout (RWF)</Label>
                                        <Input type="number" min="0" step="0.01"
                                            value={alloc.vendor_payout}
                                            onChange={e => updateAlloc(i, 'vendor_payout', e.target.value)}
                                            className="mt-1 h-7 text-xs" />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Notes</Label>
                                        <Input value={alloc.notes}
                                            onChange={e => updateAlloc(i, 'notes', e.target.value)}
                                            className="mt-1 h-7 text-xs" placeholder="Optional" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    <div className="flex items-center gap-2 pt-1">
                        <Button type="button" variant="outline" size="sm" onClick={addAlloc} className="h-7 text-xs">
                            <Plus className="w-3 h-3 mr-1" /> Add Vendor
                        </Button>
                        {dirty && (
                            <Button type="button" size="sm" onClick={save} disabled={saving} className="h-7 text-xs">
                                <Save className="w-3 h-3 mr-1" /> {saving ? 'Saving…' : 'Save Allocations'}
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Main component ────────────────────────────────────────────────────────
export default function AdminPartnerOrderShow({ order, vendors, products, vendorStock }: Props) {
    const [items, setItems] = useState<EditableItem[]>(
        order.items.map(i => ({ ...i }))
    );
    const [itemsDirty, setItemsDirty] = useState(false);

    const statusForm = useForm({
        status: order.status,
        admin_notes: order.admin_notes ?? '',
        delivery_tracking_number: order.delivery_tracking_number ?? '',
    });

    const paymentForm = useForm({
        payment_status: order.payment_status,
        total_amount: order.total_amount ?? '',
        payment_due_date: order.payment_due_date ?? '',
        payment_reminder_days: order.payment_reminder_days ? String(order.payment_reminder_days) : '',
    });

    const updateItem = (index: number, field: keyof EditableItem, value: any) => {
        setItems(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            // Auto-fill total_price
            if (field === 'unit_price' || field === 'quantity') {
                const qty = parseFloat(field === 'quantity' ? value : next[index].quantity) || 0;
                const price = parseFloat(field === 'unit_price' ? value : next[index].unit_price ?? '0') || 0;
                next[index].total_price = String((qty * price).toFixed(2));
            }
            // Auto-fill vendor from product
            if (field === 'product_id' && value) {
                const prod = products.find(p => p.id === Number(value));
                if (prod) {
                    next[index].product_name = prod.name;
                    next[index].unit = prod.unit_of_measure || next[index].unit;
                    next[index].unit_price = prod.price;
                    next[index].vendor_id = prod.vendor_id;
                    const qty = parseFloat(next[index].quantity) || 1;
                    const price = parseFloat(prod.price) || 0;
                    next[index].total_price = String((qty * price).toFixed(2));
                    next[index].vendor_payout = String((qty * price).toFixed(2));
                }
            }
            return next;
        });
        setItemsDirty(true);
    };

    const addItem = () => {
        setItems(prev => [...prev, {
            id: 0,
            _new: true,
            product_id: null,
            vendor_id: null,
            product_name: '',
            description: null,
            quantity: '1',
            unit: 'pieces',
            unit_price: null,
            total_price: null,
            vendor_payout: null,
            vendor_paid: false,
            vendor_paid_at: null,
        }]);
        setItemsDirty(true);
    };

    const removeItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
        setItemsDirty(true);
    };

    const saveItems = () => {
        router.put(`/admin/partners/orders/${order.id}/items`, {
            items: items.map(item => ({
                id: item._new ? undefined : item.id,
                product_id: item.product_id,
                vendor_id: item.vendor_id,
                product_name: item.product_name,
                description: item.description,
                quantity: item.quantity,
                unit: item.unit,
                unit_price: item.unit_price,
                vendor_payout: item.vendor_payout,
            })),
        }, {
            onSuccess: () => setItemsDirty(false),
            preserveScroll: true,
        });
    };

    const markVendorPaid = (item: EditableItem) => {
        router.patch(`/admin/partners/orders/${order.id}/items/${item.id}/vendor-paid`, {}, {
            preserveScroll: true,
        });
    };

    const totalPayout = items.reduce((sum, i) => sum + (parseFloat(i.vendor_payout ?? '0') || 0), 0);
    const totalAmount = items.reduce((sum, i) => sum + (parseFloat(i.total_price ?? '0') || 0), 0);

    // Summary derived from saved allocations
    const totalAllocPayout = order.items.flatMap(i => i.allocations ?? [])
        .reduce((s, a) => s + (parseFloat(String(a.vendor_payout ?? '0')) || 0), 0);
    const unallocatedItems = order.items.filter(i => {
        const allocQty = (i.allocations ?? []).reduce((s, a) => s + (parseFloat(String(a.quantity)) || 0), 0);
        return allocQty < parseFloat(i.quantity) - 0.001;
    }).length;

    // Auto-sync calculated total into payment form
    useEffect(() => {
        if (totalAmount > 0) {
            paymentForm.setData('total_amount', String(totalAmount.toFixed(2)));
        }
    }, [totalAmount]);

    return (
        <AdminLayout>
            <Head title={`Partner Order ${order.order_number}`} />
            <div className="py-6 px-6 max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/admin/partners/orders">
                        <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Orders</Button>
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900">Order #{order.order_number}</h1>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {order.status}
                    </span>
                </div>

                {/* ── Summary strip ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    <Card className="border-emerald-200">
                        <CardContent className="pt-3 pb-3">
                            <p className="text-xs text-gray-500">Order Total</p>
                            <p className="text-lg font-bold text-gray-900 mt-0.5">
                                {order.currency} {order.total_amount ? Number(order.total_amount).toLocaleString() : totalAmount.toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-blue-200">
                        <CardContent className="pt-3 pb-3">
                            <p className="text-xs text-gray-500">Items / Quantities</p>
                            <p className="text-lg font-bold text-gray-900 mt-0.5">{order.items.length} items</p>
                            <p className="text-xs text-gray-400 truncate">
                                {order.items.map(i => `${Number(i.quantity)} ${i.unit}`).join(' · ')}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-purple-200">
                        <CardContent className="pt-3 pb-3">
                            <p className="text-xs text-gray-500">Vendor Payout</p>
                            <p className="text-lg font-bold text-gray-900 mt-0.5">
                                RWF {(totalAllocPayout || totalPayout).toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className={unallocatedItems > 0 ? 'border-yellow-300' : 'border-green-200'}>
                        <CardContent className="pt-3 pb-3">
                            <p className="text-xs text-gray-500">Allocation</p>
                            {unallocatedItems > 0 ? (
                                <p className="text-sm font-bold text-yellow-700 mt-0.5 flex items-center gap-1">
                                    <AlertTriangle className="w-4 h-4" /> {unallocatedItems} unallocated
                                </p>
                            ) : (
                                <p className="text-sm font-bold text-green-700 mt-0.5 flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" /> Fully allocated
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* ── Item quantity summary table ── */}
                <Card className="mb-5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-700 flex items-center gap-2">
                            <Package className="w-4 h-4" /> Requested Items Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-y text-xs text-gray-500">
                                <tr>
                                    <th className="text-left px-4 py-2">Item</th>
                                    <th className="text-right px-4 py-2">Requested</th>
                                    <th className="text-right px-4 py-2">Allocated</th>
                                    <th className="text-right px-4 py-2">Unit Price</th>
                                    <th className="text-right px-4 py-2">Total</th>
                                    <th className="text-right px-4 py-2">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {order.items.map(item => {
                                    const allocs = item.allocations ?? [];
                                    const allocQty = allocs.reduce((s, a) => s + (parseFloat(String(a.quantity)) || 0), 0);
                                    const reqQty = parseFloat(item.quantity);
                                    const isOver = allocQty > reqQty + 0.001;
                                    const isFull = Math.abs(allocQty - reqQty) < 0.001;
                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50 break-all word-wrap">
                                            <td className="px-4 py-2 font-medium text-gray-900">
                                                {item.product_name}
                                                {item.vendor && <span className="text-xs text-gray-400 ml-2">({item.vendor.business_name})</span>}
                                            </td>
                                            <td className="px-4 py-2 text-right">{Number(item.quantity).toLocaleString()} {item.unit}</td>
                                            <td className="px-4 py-2 text-right">
                                                <span className={isOver ? 'text-red-600 font-medium' : isFull ? 'text-green-700 font-medium' : allocs.length > 0 ? 'text-yellow-700' : 'text-gray-400'}>
                                                    {allocQty > 0 ? `${allocQty.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${item.unit}` : '—'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-right text-gray-600">
                                                {item.unit_price ? `RWF ${Number(item.unit_price).toLocaleString()}` : '—'}
                                            </td>
                                            <td className="px-4 py-2 text-right font-medium">
                                                {item.total_price ? `RWF ${Number(item.total_price).toLocaleString()}` : '—'}
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                {allocs.length === 0 ? (
                                                    <Badge variant="outline" className="text-xs text-gray-400">Not allocated</Badge>
                                                ) : isOver ? (
                                                    <Badge variant="destructive" className="text-xs">Over</Badge>
                                                ) : isFull ? (
                                                    <Badge className="text-xs bg-green-100 text-green-800 hover:bg-green-100">Full</Badge>
                                                ) : (
                                                    <Badge className="text-xs bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Partial</Badge>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            {totalAmount > 0 && (
                                <tfoot>
                                    <tr className="bg-gray-50 border-t font-semibold">
                                        <td className="px-4 py-2 text-gray-700" colSpan={4}>Grand Total</td>
                                        <td className="px-4 py-2 text-right text-gray-900">RWF {totalAmount.toLocaleString()}</td>
                                        <td />
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-3 gap-5">
                    {/* Left column */}
                    <div className="md:col-span-2 space-y-5">
                        {/* Partner info */}
                        <Card>
                            <CardHeader><CardTitle className="text-base">Partner</CardTitle></CardHeader>
                            <CardContent className="space-y-1 text-sm text-gray-700 break-words">
                                <p className="font-semibold text-gray-900 text-base">{order.partner.business_name}</p>
                                <p className="capitalize text-gray-500">{order.partner.partner_type}</p>
                                <p>{order.partner.user.email}</p>
                                {order.partner.phone && <p>{order.partner.phone}</p>}
                                {order.partner.address && <p>{order.partner.address}, {order.partner.city}</p>}
                                {order.description && (
                                     <div dangerouslySetInnerHTML={{ __html: order.description }} className='mt-3 bg-gray-50 rounded p-3 text-gray-600 italic' />
                                )}
                                {order.partner_notes && (
                                    <div className="mt-2 text-xs text-gray-500">
                                        <strong>Partner notes:</strong> {order.partner_notes}
                                    </div>
                                )}
                                {order.requested_delivery_date && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Requested delivery: <strong>{new Date(order.requested_delivery_date).toLocaleDateString()}</strong>
                                    </p>
                                )}
                                {order.delivery_address && (
                                    <p className="text-xs text-gray-500">Deliver to: {order.delivery_address}</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Items editor */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-base">Order Items</CardTitle>
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                        <Plus className="w-3 h-3 mr-1" /> Add Item
                                    </Button>
                                    {itemsDirty && (
                                        <Button type="button" size="sm" onClick={saveItems}>
                                            <Save className="w-3 h-3 mr-1" /> Save Items
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {items.map((item, index) => (
                                    <div key={index} className="border rounded-lg p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-gray-500">Item {index + 1}</span>
                                            <div className="flex items-center gap-2">
                                                {!item._new && !item.vendor_paid && item.vendor_id && item.vendor_payout && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-6 px-2 text-xs text-green-700"
                                                        onClick={() => markVendorPaid(item)}
                                                    >
                                                        <DollarSign className="w-3 h-3 mr-1" /> Mark Vendor Paid
                                                    </Button>
                                                )}
                                                {item.vendor_paid && (
                                                    <span className="text-xs text-green-600 flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3" /> Vendor Paid
                                                    </span>
                                                )}
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 px-2 text-red-500"
                                                    onClick={() => removeItem(index)}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Product picker — vendor auto-assigned from selected product */}
                                        <div>
                                            <Label className="text-xs">Link to Product</Label>
                                            <Select
                                                value={item.product_id ? String(item.product_id) : 'none'}
                                                onValueChange={v => updateItem(index, 'product_id', v === 'none' ? null : Number(v))}
                                            >
                                                <SelectTrigger className="mt-1 h-8 text-sm">
                                                    <SelectValue placeholder="Select product..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">— Custom item —</SelectItem>
                                                    {products.map(p => (
                                                        <SelectItem key={p.id} value={String(p.id)}>
                                                            {p.name} ({p.vendor?.business_name}) · stock: {p.stock_quantity}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {item.vendor_id && (
                                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3 text-green-500" />
                                                    Auto-vendor: <strong className="ml-1">{vendors.find(v => v.id === item.vendor_id)?.business_name ?? `#${item.vendor_id}`}</strong>
                                                    {vendorStock[item.vendor_id] != null && <span className="text-gray-400 ml-1">· stock: {vendorStock[item.vendor_id]}</span>}
                                                    {item.product_id && (() => { const p = products.find(x => x.id === item.product_id); return p && p.stock_quantity < parseFloat(item.quantity) ? <span className="text-amber-600 ml-1 flex items-center gap-0.5"><AlertTriangle className="w-3 h-3" /> Insufficient stock — extra allocation suggested below</span> : null; })()}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label className="text-xs">Item Name *</Label>
                                            <Input
                                                value={item.product_name}
                                                onChange={e => updateItem(index, 'product_name', e.target.value)}
                                                className="mt-1 h-8 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-xs">Description</Label>
                                            <Input
                                                value={item.description ?? ''}
                                                onChange={e => updateItem(index, 'description', e.target.value)}
                                                className="mt-1 h-8 text-sm"
                                            />
                                        </div>

                                        <div className="grid grid-cols-4 gap-2">
                                            <div>
                                                <Label className="text-xs">Qty</Label>
                                                <Input
                                                    type="number"
                                                    min="0.01"
                                                    step="0.01"
                                                    value={item.quantity}
                                                    onChange={e => updateItem(index, 'quantity', e.target.value)}
                                                    className="mt-1 h-8 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Unit</Label>
                                                <Select value={item.unit} onValueChange={v => updateItem(index, 'unit', v)}>
                                                    <SelectTrigger className="mt-1 h-8 text-sm">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label className="text-xs">Unit Price (RWF)</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.unit_price ?? ''}
                                                    onChange={e => updateItem(index, 'unit_price', e.target.value)}
                                                    className="mt-1 h-8 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Total</Label>
                                                <Input
                                                    readOnly
                                                    value={item.total_price ? Number(item.total_price).toLocaleString() : '—'}
                                                    className="mt-1 h-8 text-sm bg-gray-50"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <Label className="text-xs">Vendor Payout (RWF)</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.vendor_payout ?? ''}
                                                    onChange={e => updateItem(index, 'vendor_payout', e.target.value)}
                                                    className="mt-1 h-8 text-sm"
                                                    placeholder="How much to pay the vendor"
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                {item.vendor_payout && item.total_price && (
                                                    <p className="text-xs text-gray-500 mb-2">
                                                        Margin: RWF {(Number(item.total_price) - Number(item.vendor_payout)).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Allocation sub-editor (only for saved items) */}
                                        {!item._new && item.id > 0 && (
                                            <ItemAllocationEditor
                                                item={{ ...item, allocations: order.items.find(oi => oi.id === item.id)?.allocations }}
                                                orderId={order.id}
                                                vendors={vendors}
                                                products={products}
                                                vendorStock={vendorStock}
                                                productVendorId={item.vendor_id}
                                                productStock={item.product_id ? products.find(p => p.id === item.product_id)?.stock_quantity : undefined}
                                                onPayoutChange={totalPayout => updateItem(index, 'vendor_payout', String(totalPayout.toFixed(2)))}
                                            />
                                        )}
                                    </div>
                                ))}

                                {items.length > 0 && (
                                    <div className="border-t pt-3 flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            Total Vendor Payout: <strong>RWF {totalPayout.toLocaleString()}</strong>
                                        </span>
                                        <span className="font-semibold text-gray-900">
                                            Order Total: RWF {totalAmount.toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right column */}
                    <div className="space-y-5">
                        {/* Status update */}
                        <Card>
                            <CardHeader><CardTitle className="text-base">Order Status</CardTitle></CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={e => {
                                        e.preventDefault();
                                        statusForm.patch(`/admin/partners/orders/${order.id}/status`, { preserveScroll: true });
                                    }}
                                    className="space-y-3"
                                >
                                    <div>
                                        <Label className="text-xs">Status</Label>
                                        <Select
                                            value={statusForm.data.status}
                                            onValueChange={v => statusForm.setData('status', v)}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {STATUSES.map(s => (
                                                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label className="text-xs">Tracking Number</Label>
                                        <Input
                                            value={statusForm.data.delivery_tracking_number}
                                            onChange={e => statusForm.setData('delivery_tracking_number', e.target.value)}
                                            className="mt-1 h-8 text-sm"
                                            placeholder="e.g. TRK-001"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-xs">Admin Notes (visible to partner)</Label>
                                        <Textarea
                                            value={statusForm.data.admin_notes}
                                            onChange={e => statusForm.setData('admin_notes', e.target.value)}
                                            rows={3}
                                            className="mt-1 text-sm"
                                            placeholder="Notes visible to the partner..."
                                        />
                                    </div>

                                    <Button type="submit" className="w-full" disabled={statusForm.processing}>
                                        <Truck className="w-4 h-4 mr-2" />
                                        {statusForm.processing ? 'Saving...' : 'Update Status'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Payment update */}
                        <Card>
                            <CardHeader><CardTitle className="text-base">Payment</CardTitle></CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={e => {
                                        e.preventDefault();
                                        paymentForm.patch(`/admin/partners/orders/${order.id}/payment`, { preserveScroll: true });
                                    }}
                                    className="space-y-3"
                                >
                                    <div>
                                        <Label className="text-xs">Payment Status</Label>
                                        <Select
                                            value={paymentForm.data.payment_status}
                                            onValueChange={v => paymentForm.setData('payment_status', v)}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PAYMENT_STATUSES.map(s => (
                                                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label className="text-xs">Total Amount (RWF)</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={paymentForm.data.total_amount}
                                            onChange={e => paymentForm.setData('total_amount', e.target.value)}
                                            className="mt-1 h-8 text-sm"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Label className="text-xs">Payment Due Date</Label>
                                            <Input
                                                type="date"
                                                value={paymentForm.data.payment_due_date}
                                                onChange={e => paymentForm.setData('payment_due_date', e.target.value)}
                                                className="mt-1 h-8 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Reminder Every (days)</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="365"
                                                placeholder="e.g. 7"
                                                value={paymentForm.data.payment_reminder_days}
                                                onChange={e => paymentForm.setData('payment_reminder_days', e.target.value)}
                                                className="mt-1 h-8 text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Overdue indicator */}
                                    {order.payment_due_date && order.payment_status !== 'paid' && (() => {
                                        const due = new Date(order.payment_due_date);
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        const daysLeft = Math.ceil((due.getTime() - today.getTime()) / 86400000);
                                        return daysLeft < 0 ? (
                                            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded p-2">
                                                <AlertTriangle className="w-3.5 h-3.5" />
                                                Overdue by {Math.abs(daysLeft)} day{Math.abs(daysLeft) !== 1 ? 's' : ''}
                                            </div>
                                        ) : daysLeft <= 3 ? (
                                            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded p-2">
                                                <AlertTriangle className="w-3.5 h-3.5" />
                                                Due in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                                            </div>
                                        ) : (
                                            <div className="text-xs text-gray-500">
                                                Due in {daysLeft} days · {new Date(order.payment_due_date).toLocaleDateString()}
                                            </div>
                                        );
                                    })()}

                                    {order.last_payment_reminder_at && (
                                        <p className="text-xs text-gray-400">
                                            Last reminder sent: {new Date(order.last_payment_reminder_at).toLocaleString()}
                                        </p>
                                    )}

                                    <Button type="submit" className="w-full" variant="outline" disabled={paymentForm.processing}>
                                        <DollarSign className="w-4 h-4 mr-2" />
                                        {paymentForm.processing ? 'Saving...' : 'Update Payment'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Timeline */}
                        <Card>
                            <CardHeader><CardTitle className="text-base">Timeline</CardTitle></CardHeader>
                            <CardContent className="text-xs space-y-2 text-gray-600">
                                <div className="flex justify-between">
                                    <span>Placed</span>
                                    <span>{new Date(order.created_at).toLocaleString()}</span>
                                </div>
                                {order.confirmed_at && (
                                    <div className="flex justify-between">
                                        <span>Confirmed</span>
                                        <span>{new Date(order.confirmed_at).toLocaleString()}</span>
                                    </div>
                                )}
                                {order.shipped_at && (
                                    <div className="flex justify-between">
                                        <span>Shipped</span>
                                        <span>{new Date(order.shipped_at).toLocaleString()}</span>
                                    </div>
                                )}
                                {order.delivered_at && (
                                    <div className="flex justify-between text-green-700 font-medium">
                                        <span>Delivered</span>
                                        <span>{new Date(order.delivered_at).toLocaleString()}</span>
                                    </div>
                                )}
                                {order.paid_at && (
                                    <div className="flex justify-between text-green-700 font-medium">
                                        <span>Paid</span>
                                        <span>{new Date(order.paid_at).toLocaleString()}</span>
                                    </div>
                                )}
                                {order.cancelled_at && (
                                    <div className="flex justify-between text-red-600">
                                        <span>Cancelled</span>
                                        <span>{new Date(order.cancelled_at).toLocaleString()}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
