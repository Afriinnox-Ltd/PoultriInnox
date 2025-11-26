import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, X, Upload, Image as ImageIcon, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
    id: number;
    name: string;
    parent_id: number | null;
    children?: Category[];
}

interface Vendor {
    id: number;
    business_name: string;
}

interface Props {
    categories: Category[];
    vendors: Vendor[];
}

export default function Create({ categories, vendors }: Props) {
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');

    const { data, setData, post, processing, errors } = useForm<{
        vendor_id: string;
        name: string;
        description: string;
        price: string;
        compare_price: string;
        cost_price: string;
        category_ids: number[];
        sku: string;
        stock_quantity: string;
        minimum_stock: string;
        unit_of_measure: string;
        minimum_order_quantity: string;
        maximum_order_quantity: string;
        is_negotiable: boolean;
        weight: string;
        dimensions: string;
        tags: string[];
        meta_description: string;
        status: string;
        is_featured: boolean;
        images: File[];
        video: File | null;
        payment_methods: string[];
        shipping_option: string;
        extra_fee: string;
        delivery_time: string;
        return_policy: string;
        additional_info: string;
    }>({
        vendor_id: '',
        name: '',
        description: '',
        price: '',
        compare_price: '',
        cost_price: '',
        category_ids: [],
        sku: '',
        stock_quantity: '0',
        minimum_stock: '5',
        unit_of_measure: 'piece',
        minimum_order_quantity: '1',
        maximum_order_quantity: '',
        is_negotiable: false,
        weight: '',
        dimensions: '',
        tags: [],
        meta_description: '',
        status: 'draft',
        is_featured: false,
        images: [],
        video: null,
        payment_methods: ['online'],
        shipping_option: 'free',
        extra_fee: '',
        delivery_time: '',
        return_policy: '',
        additional_info: '',
    });

    const generateSKU = () => {
        const prefix = data.name.slice(0, 3).toUpperCase() || 'PRD';
        const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
        setData('sku', `${prefix}-${Date.now().toString().slice(-6)}-${rand}`);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter(f => f.size <= 2 * 1024 * 1024);
        if (validFiles.length < files.length) {
            toast.error('Some images were skipped (max 2MB each)');
        }
        const combined = [...data.images, ...validFiles].slice(0, 5);
        setData('images', combined);

        const newPreviews = validFiles.map(f => URL.createObjectURL(f));
        setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 5));
    };

    const removeImage = (index: number) => {
        setData('images', data.images.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const addTag = () => {
        const tag = tagInput.trim();
        if (tag && !data.tags.includes(tag)) {
            setData('tags', [...data.tags, tag]);
            setTagInput('');
        }
    };

    const toggleCategory = (id: number) => {
        setData('category_ids',
            data.category_ids.includes(id)
                ? data.category_ids.filter(c => c !== id)
                : [...data.category_ids, id]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/marketplace/products', {
            forceFormData: true,
            onSuccess: () => toast.success('Product created successfully'),
            onError: () => toast.error('Please fix the errors below'),
        });
    };

    return (
        <AdminLayout>
            <Head title="Create Product" />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/marketplace/products">
                            <Button type="button" variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Create Product</h1>
                            <p className="text-muted-foreground text-sm">Add a new product to the marketplace</p>
                        </div>
                    </div>
                    <Button type="submit" disabled={processing}>
                        <Plus className="h-4 w-4 mr-1" /> {processing ? 'Creating...' : 'Create Product'}
                    </Button>
                </div>

                <Tabs defaultValue="basic">
                    <TabsList>
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="details">Details & Inventory</TabsTrigger>
                        <TabsTrigger value="images">Images</TabsTrigger>
                        <TabsTrigger value="shipping">Shipping & Payment</TabsTrigger>
                        <TabsTrigger value="seo">SEO & Tags</TabsTrigger>
                    </TabsList>

                    {/* Basic Info Tab */}
                    <TabsContent value="basic">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2">
                                <CardHeader><CardTitle>Product Information</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">Product Name *</Label>
                                        <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Product name" />
                                        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="description">Description *</Label>
                                        <Textarea id="description" value={data.description} onChange={e => setData('description', e.target.value)} rows={6} placeholder="Detailed product description..." />
                                        {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="vendor_id">Vendor *</Label>
                                        <Select value={data.vendor_id} onValueChange={v => setData('vendor_id', v)}>
                                            <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                                            <SelectContent>
                                                {vendors.map(v => (
                                                    <SelectItem key={v.id} value={String(v.id)}>{v.business_name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.vendor_id && <p className="text-sm text-destructive mt-1">{errors.vendor_id}</p>}
                                    </div>
                                    <div>
                                        <Label>Categories *</Label>
                                        <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2 mt-1">
                                            {categories.map(cat => (
                                                <div key={cat.id}>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <Checkbox
                                                            checked={data.category_ids.includes(cat.id)}
                                                            onCheckedChange={() => toggleCategory(cat.id)}
                                                        />
                                                        <span className="font-medium text-sm">{cat.name}</span>
                                                    </label>
                                                    {cat.children?.map(child => (
                                                        <label key={child.id} className="flex items-center gap-2 ml-6 cursor-pointer">
                                                            <Checkbox
                                                                checked={data.category_ids.includes(child.id)}
                                                                onCheckedChange={() => toggleCategory(child.id)}
                                                            />
                                                            <span className="text-sm">{child.name}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                        {errors.category_ids && <p className="text-sm text-destructive mt-1">{errors.category_ids}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>Pricing & Status</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="price">Price (RWF) *</Label>
                                        <Input id="price" type="number" min="0" step="1" value={data.price} onChange={e => setData('price', e.target.value)} />
                                        {errors.price && <p className="text-sm text-destructive mt-1">{errors.price}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="compare_price">Compare Price (RWF)</Label>
                                        <Input id="compare_price" type="number" min="0" step="1" value={data.compare_price} onChange={e => setData('compare_price', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label htmlFor="cost_price">Cost Price (RWF)</Label>
                                        <Input id="cost_price" type="number" min="0" step="1" value={data.cost_price} onChange={e => setData('cost_price', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label htmlFor="sku">SKU *</Label>
                                        <div className="flex gap-2">
                                            <Input id="sku" value={data.sku} onChange={e => setData('sku', e.target.value)} placeholder="Product SKU" />
                                            <Button type="button" variant="outline" size="icon" onClick={generateSKU} title="Auto-generate">
                                                <Wand2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {errors.sku && <p className="text-sm text-destructive mt-1">{errors.sku}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="status">Status *</Label>
                                        <Select value={data.status} onValueChange={v => setData('status', v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <Checkbox checked={data.is_featured} onCheckedChange={v => setData('is_featured', !!v)} />
                                        <span className="text-sm">Featured Product</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <Checkbox checked={data.is_negotiable} onCheckedChange={v => setData('is_negotiable', !!v)} />
                                        <span className="text-sm">Price Negotiable</span>
                                    </label>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Details Tab */}
                    <TabsContent value="details">
                        <Card>
                            <CardHeader><CardTitle>Inventory & Specifications</CardTitle></CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                                        <Input id="stock_quantity" type="number" min="0" value={data.stock_quantity} onChange={e => setData('stock_quantity', e.target.value)} />
                                        {errors.stock_quantity && <p className="text-sm text-destructive mt-1">{errors.stock_quantity}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="minimum_stock">Minimum Stock Alert</Label>
                                        <Input id="minimum_stock" type="number" min="0" value={data.minimum_stock} onChange={e => setData('minimum_stock', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label htmlFor="unit_of_measure">Unit of Measure *</Label>
                                        <Select value={data.unit_of_measure} onValueChange={v => setData('unit_of_measure', v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {['kg', 'g', 'liter', 'ml', 'piece', 'box', 'bag', 'dozen', 'pack'].map(u => (
                                                    <SelectItem key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="minimum_order_quantity">Min Order Qty</Label>
                                        <Input id="minimum_order_quantity" type="number" min="1" value={data.minimum_order_quantity} onChange={e => setData('minimum_order_quantity', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label htmlFor="maximum_order_quantity">Max Order Qty</Label>
                                        <Input id="maximum_order_quantity" type="number" min="1" value={data.maximum_order_quantity} onChange={e => setData('maximum_order_quantity', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label htmlFor="weight">Weight (kg)</Label>
                                        <Input id="weight" type="number" min="0" step="0.01" value={data.weight} onChange={e => setData('weight', e.target.value)} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label htmlFor="dimensions">Dimensions</Label>
                                        <Input id="dimensions" value={data.dimensions} onChange={e => setData('dimensions', e.target.value)} placeholder="e.g. 30x20x10 cm" />
                                    </div>
                                    <div className="md:col-span-3">
                                        <Label htmlFor="additional_info">Additional Information</Label>
                                        <Textarea id="additional_info" value={data.additional_info} onChange={e => setData('additional_info', e.target.value)} rows={3} placeholder="Any extra product details..." />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Images Tab */}
                    <TabsContent value="images">
                        <Card>
                            <CardHeader><CardTitle>Product Images & Video</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <Label>Images (max 5, 2MB each) * </Label>
                                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                        {imagePreviews.map((src, i) => (
                                            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border">
                                                <img src={src} alt="" className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5">
                                                    <X className="h-3 w-3" />
                                                </button>
                                                {i === 0 && <Badge className="absolute bottom-1 left-1 text-xs">Primary</Badge>}
                                            </div>
                                        ))}
                                        {data.images.length < 5 && (
                                            <label className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                                                <Upload className="h-6 w-6 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground mt-1">Upload</span>
                                                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                                            </label>
                                        )}
                                    </div>
                                    {errors.images && <p className="text-sm text-destructive mt-1">{errors.images}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="video">Video (optional, max 10MB)</Label>
                                    <Input id="video" type="file" accept="video/mp4,video/mov,video/ogg" onChange={e => setData('video', e.target.files?.[0] || null)} className="mt-1" />
                                    {data.video && <p className="text-sm text-muted-foreground mt-1">{data.video.name}</p>}
                                    {errors.video && <p className="text-sm text-destructive mt-1">{errors.video}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Shipping & Payment Tab */}
                    <TabsContent value="shipping">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader><CardTitle>Shipping</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Shipping Method</Label>
                                        <div className="flex gap-4 mt-2">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name="shipping_option" value="free" checked={data.shipping_option === 'free'} onChange={() => setData('shipping_option', 'free')} />
                                                <span className="text-sm">Free Shipping</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name="shipping_option" value="paid" checked={data.shipping_option === 'paid'} onChange={() => setData('shipping_option', 'paid')} />
                                                <span className="text-sm">Paid Shipping</span>
                                            </label>
                                        </div>
                                    </div>
                                    {data.shipping_option === 'paid' && (
                                        <div>
                                            <Label htmlFor="extra_fee">Shipping Fee (RWF)</Label>
                                            <Input id="extra_fee" type="number" min="0" value={data.extra_fee} onChange={e => setData('extra_fee', e.target.value)} />
                                        </div>
                                    )}
                                    <div>
                                        <Label htmlFor="delivery_time">Estimated Delivery Time</Label>
                                        <Input id="delivery_time" value={data.delivery_time} onChange={e => setData('delivery_time', e.target.value)} placeholder="e.g. 2-5 business days" />
                                    </div>
                                    <div>
                                        <Label htmlFor="return_policy">Return Policy</Label>
                                        <Textarea id="return_policy" value={data.return_policy} onChange={e => setData('return_policy', e.target.value)} rows={3} />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Payment Methods</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <Checkbox
                                            checked={data.payment_methods.includes('online')}
                                            onCheckedChange={checked => {
                                                setData('payment_methods', checked
                                                    ? [...data.payment_methods, 'online']
                                                    : data.payment_methods.filter(m => m !== 'online'));
                                            }}
                                        />
                                        <span className="text-sm">Online Payment</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <Checkbox
                                            checked={data.payment_methods.includes('cod')}
                                            onCheckedChange={checked => {
                                                setData('payment_methods', checked
                                                    ? [...data.payment_methods, 'cod']
                                                    : data.payment_methods.filter(m => m !== 'cod'));
                                            }}
                                        />
                                        <span className="text-sm">Cash on Delivery</span>
                                    </label>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* SEO Tab */}
                    <TabsContent value="seo">
                        <Card>
                            <CardHeader><CardTitle>SEO & Tags</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="meta_description">Meta Description (max 160 chars)</Label>
                                    <Textarea id="meta_description" value={data.meta_description} onChange={e => setData('meta_description', e.target.value)} maxLength={160} rows={2} />
                                    <p className="text-xs text-muted-foreground mt-1">{data.meta_description.length}/160</p>
                                </div>
                                <div>
                                    <Label>Tags</Label>
                                    <div className="flex gap-2 mt-1">
                                        <Input
                                            value={tagInput}
                                            onChange={e => setTagInput(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                            placeholder="Type a tag and press Enter"
                                        />
                                        <Button type="button" variant="outline" onClick={addTag}>Add</Button>
                                    </div>
                                    {data.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {data.tags.map((tag, i) => (
                                                <Badge key={i} variant="secondary" className="gap-1">
                                                    {tag}
                                                    <button type="button" onClick={() => setData('tags', data.tags.filter((_, idx) => idx !== i))}>
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </form>
        </AdminLayout>
    );
}
