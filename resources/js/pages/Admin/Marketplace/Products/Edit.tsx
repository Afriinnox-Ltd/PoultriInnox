import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
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
import { ArrowLeft, Save, X, Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import RichTextEditor from '@/components/ui/rich-text-editor';

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

interface ProductImage {
    id: number;
    image_url: string;
    is_primary: boolean;
    sort_order: number;
}

interface Product {
    id: number;
    vendor_id: number;
    name: string;
    description: string;
    price: number;
    compare_price: number | null;
    cost_price: number | null;
    sku: string;
    stock_quantity: number;
    minimum_stock: number | null;
    unit_of_measure: string;
    minimum_order_quantity: number | null;
    maximum_order_quantity: number | null;
    is_negotiable: boolean;
    weight: number | null;
    dimensions: string | null;
    tags: string[] | null;
    meta_description: string | null;
    status: string;
    is_featured: boolean;
    video_path: string | null;
    payment_methods: string[] | null;
    shipping_option: string | null;
    extra_fee: number | null;
    delivery_time: string | null;
    return_policy: string | null;
    additional_info: string | null;
    images: ProductImage[];
    categories: Category[];
}

interface Props {
    product: Product;
    categories: Category[];
    vendors: Vendor[];
}

export default function Edit({ product, categories, vendors }: Props) {
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');

    const existingCategoryIds = (product.categories || []).map(c => c.id);

    const { data, setData, post, processing, errors } = useForm<{
        _method: string;
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
        remove_images: number[];
        video: File | null;
        remove_video: boolean;
        payment_methods: string[];
        shipping_option: string;
        extra_fee: string;
        delivery_time: string;
        return_policy: string;
        additional_info: string;
    }>({
        _method: 'PUT',
        vendor_id: String(product.vendor_id),
        name: product.name || '',
        description: product.description || '',
        price: String(product.price || ''),
        compare_price: product.compare_price ? String(product.compare_price) : '',
        cost_price: product.cost_price ? String(product.cost_price) : '',
        category_ids: existingCategoryIds,
        sku: product.sku || '',
        stock_quantity: String(product.stock_quantity ?? 0),
        minimum_stock: product.minimum_stock != null ? String(product.minimum_stock) : '5',
        unit_of_measure: product.unit_of_measure || 'piece',
        minimum_order_quantity: product.minimum_order_quantity ? String(product.minimum_order_quantity) : '1',
        maximum_order_quantity: product.maximum_order_quantity ? String(product.maximum_order_quantity) : '',
        is_negotiable: !!product.is_negotiable,
        weight: product.weight ? String(product.weight) : '',
        dimensions: product.dimensions || '',
        tags: Array.isArray(product.tags) ? product.tags : (product.tags ? JSON.parse(product.tags as unknown as string) : []),
        meta_description: product.meta_description || '',
        status: product.status || 'draft',
        is_featured: !!product.is_featured,
        images: [],
        remove_images: [],
        video: null,
        remove_video: false,
        payment_methods: Array.isArray(product.payment_methods) ? product.payment_methods : (product.payment_methods ? JSON.parse(product.payment_methods as unknown as string) : ['online']),
        shipping_option: product.shipping_option || 'free',
        extra_fee: product.extra_fee ? String(product.extra_fee) : '',
        delivery_time: product.delivery_time || '',
        return_policy: product.return_policy || '',
        additional_info: product.additional_info || '',
    });

    const remainingSlots = 5 - (product.images.length - data.remove_images.length) - data.images.length;

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter(f => f.size <= 2 * 1024 * 1024);
        if (validFiles.length < files.length) {
            toast.error('Some images were skipped (max 2MB each)');
        }
        const maxNew = Math.max(0, remainingSlots);
        const toAdd = validFiles.slice(0, maxNew);
        setData('images', [...data.images, ...toAdd]);
        setNewImagePreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))]);
    };

    const removeNewImage = (index: number) => {
        setData('images', data.images.filter((_, i) => i !== index));
        setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const toggleRemoveExisting = (imageId: number) => {
        setData('remove_images',
            data.remove_images.includes(imageId)
                ? data.remove_images.filter(id => id !== imageId)
                : [...data.remove_images, imageId]
        );
    };

    const toggleCategory = (id: number) => {
        setData('category_ids',
            data.category_ids.includes(id)
                ? data.category_ids.filter(c => c !== id)
                : [...data.category_ids, id]
        );
    };

    const addTag = () => {
        const tag = tagInput.trim();
        if (tag && !data.tags.includes(tag)) {
            setData('tags', [...data.tags, tag]);
            setTagInput('');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/marketplace/products/${product.id}`, {
            forceFormData: true,
            onSuccess: () => toast.success('Product updated successfully'),
            onError: () => toast.error('Please fix the errors below'),
        });
    };

    return (
        <AdminLayout>
            <Head title={`Edit: ${product.name}`} />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/admin/marketplace/products/${product.id}`}>
                            <Button type="button" variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
                            <p className="text-muted-foreground text-sm">{product.name}</p>
                        </div>
                    </div>
                    <Button type="submit" disabled={processing}>
                        <Save className="h-4 w-4 mr-1" /> {processing ? 'Saving...' : 'Save Changes'}
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
                                        <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} />
                                        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="description">Description *</Label>
                                        <RichTextEditor id="description" value={data.description} onChange={value => setData('description', value)} />
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
                                        <Input id="sku" value={data.sku} onChange={e => setData('sku', e.target.value)} />
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
                                      
                                        <RichTextEditor id="additional_info" value={data.additional_info} onChange={value => setData('additional_info', value)} />
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
                                {/* Existing images */}
                                {product.images.length > 0 && (
                                    <div>
                                        <Label>Current Images</Label>
                                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                            {product.images.map((img) => {
                                                const markedForRemoval = data.remove_images.includes(img.id);
                                                return (
                                                    <div key={img.id} className={`relative aspect-square rounded-lg overflow-hidden border ${markedForRemoval ? 'opacity-40 ring-2 ring-red-500' : ''}`}>
                                                        <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleRemoveExisting(img.id)}
                                                            className={`absolute top-1 right-1 rounded-full p-0.5 ${markedForRemoval ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'}`}
                                                            title={markedForRemoval ? 'Undo removal' : 'Mark for removal'}
                                                        >
                                                            {markedForRemoval ? <span className="text-xs px-1">Undo</span> : <Trash2 className="h-3 w-3" />}
                                                        </button>
                                                        {img.is_primary && !markedForRemoval && <Badge className="absolute bottom-1 left-1 text-xs">Primary</Badge>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* New images */}
                                <div>
                                    <Label>Add New Images ({remainingSlots > 0 ? `${remainingSlots} slots remaining` : 'No slots remaining'})</Label>
                                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                        {newImagePreviews.map((src, i) => (
                                            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border">
                                                <img src={src} alt="" className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => removeNewImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                        {remainingSlots > 0 && (
                                            <label className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                                                <Upload className="h-6 w-6 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground mt-1">Upload</span>
                                                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                                            </label>
                                        )}
                                    </div>
                                    {errors.images && <p className="text-sm text-destructive mt-1">{errors.images}</p>}
                                </div>

                                {/* Video */}
                                <div>
                                    <Label>Video</Label>
                                    {product.video_path && !data.remove_video && (
                                        <div className="flex items-center gap-2 mt-1 p-2 bg-muted rounded-md">
                                            <span className="text-sm">Existing video attached</span>
                                            <Button type="button" variant="destructive" size="sm" onClick={() => setData('remove_video', true)}>
                                                <Trash2 className="h-3 w-3 mr-1" /> Remove
                                            </Button>
                                        </div>
                                    )}
                                    {data.remove_video && product.video_path && (
                                        <div className="flex items-center gap-2 mt-1 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                                            <span className="text-sm text-yellow-700">Video will be removed on save</span>
                                            <Button type="button" variant="outline" size="sm" onClick={() => setData('remove_video', false)}>Undo</Button>
                                        </div>
                                    )}
                                    <Input type="file" accept="video/mp4,video/mov,video/ogg" onChange={e => setData('video', e.target.files?.[0] || null)} className="mt-2" />
                                    {data.video && <p className="text-sm text-muted-foreground mt-1">New: {data.video.name}</p>}
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
