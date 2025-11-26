import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ArrowLeft,
    Plus,
    Package,
    DollarSign,
    Camera,
    Save,
    AlertCircle,
    Info,
    X,
    Upload,
    Truck
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import VendorLayout from '@/layouts/vendor-layout';
import { toast } from 'sonner';

interface Category {
    id: number;
    name: string;
    parent_id?: number | null;
    children?: Category[];
    parent?: {
        id: number;
        name: string;
    };
}

interface ProductImage {
    id: number;
    image_path: string;
    alt_text: string;
    sort_order: number;
    is_primary: boolean;
}

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    category_id: number;
    categories?: Category[]; // For multi-select loaded relation
    sku: string;
    stock_quantity: number;
    minimum_order_quantity: number;
    maximum_order_quantity?: number;
    weight?: number;
    dimensions?: string;
    status: string;
    meta_description?: string;
    tags?: string[] | string | null;
    images: ProductImage[];
    payment_methods?: string[] | string | null;
    shipping_option?: string;
    extra_fee?: number;
    delivery_time?: string;
    return_policy?: string;
    additional_info?: string;
    video_path?: string;
    is_negotiable?: boolean;
}

interface Vendor {
    id: number;
    business_name: string;
    status: 'approved' | 'pending' | 'rejected' | 'suspended';
    is_verified: boolean;
    is_active: boolean;
    subscription?: {
        plan_name: string;
        is_active: boolean;
    };
}

interface EditProductProps {
    product: Product;
    categories: Category[];
    vendor: Vendor;
    currentSubscription: any;
    subscriptionUsage: any;
    needsUpgrade: boolean;
    upgradeReason?: string;
    marketplaceSettings?: {
        commission: {
            default_commission_rate: number;
            commission_type: 'percentage' | 'fixed';
        };
        platform_fees: {
            platform_fee_rate: number;
            processing_fee: number;
            transaction_fee_rate: number;
        };
        tax: {
            tax_rate: number;
            tax_enabled: boolean;
            tax_inclusive: boolean;
        };
        general: {
            currency: string;
            currency_symbol: string;
        };
    };
}

export default function EditProduct({ product, categories, vendor, currentSubscription, subscriptionUsage, needsUpgrade, upgradeReason, marketplaceSettings }: EditProductProps) {
    // Ensure tags is always an array
    const parsedTags: string[] = (() => {
        if (Array.isArray(product.tags)) {
            return product.tags;
        }
        if (typeof product.tags === 'string' && product.tags.trim().length > 0) {
            try {
                return JSON.parse(product.tags);
            } catch {
                return [];
            }
        }
        return [];
    })();

    // Ensure payment_methods is always an array
    const parsedPaymentMethods: string[] = (() => {
        if (Array.isArray(product.payment_methods)) {
            return product.payment_methods;
        }
        if (typeof product.payment_methods === 'string' && product.payment_methods.trim().length > 0) {
            try {
                return JSON.parse(product.payment_methods);
            } catch {
                return [];
            }
        }
        return [];
    })();

    const { data, setData, post, processing, errors } = useForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        category_ids: product.categories?.map(c => c.id.toString()) || (product.category_id ? [product.category_id.toString()] : []),
        sku: product.sku || '',
        stock_quantity: product.stock_quantity?.toString() || '',
        minimum_order_quantity: product.minimum_order_quantity?.toString() || '1',
        maximum_order_quantity: product.maximum_order_quantity?.toString() || '',
        weight: product.weight?.toString() || '',
        dimensions: product.dimensions || '',
        status: product.status || 'draft',
        images: [] as File[],
        meta_description: product.meta_description || '',
        tags: parsedTags,
        payment_methods: parsedPaymentMethods,
        shipping_option: product.shipping_option || '',
        extra_fee: product.extra_fee?.toString() || '',
        delivery_time: product.delivery_time || '',
        return_policy: product.return_policy || '',
        additional_info: product.additional_info || '',
        remove_images: [] as number[],
        video: null as File | null,
        remove_video: false,
        is_negotiable: product.is_negotiable || false,
        _method: 'PUT'
    });

    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState('');
    const [existingImages, setExistingImages] = useState<ProductImage[]>(product.images || []);
    const [currentTab, setCurrentTab] = useState('basic');

    // Initialize selectedParentId
    const [selectedParentId, setSelectedParentId] = useState<string>(() => {
        // Helper to find parent for a given category ID
        const findParentId = (id: string) => {
            // Check if it's a parent category
            const isParent = categories.some(c => c.id.toString() === id);
            if (isParent) return id;

            // Check if it's a child category and find its parent
            for (const cat of categories) {
                if (cat.children?.some(child => child.id.toString() === id)) {
                    return cat.id.toString();
                }
            }
            return null;
        };

        // 1. Try product.category_id first
        if (product.category_id) {
            const parent = findParentId(product.category_id.toString());
            if (parent) return parent;
        }

        // 2. Fallback: Check all associated categories
        if (product.categories && product.categories.length > 0) {
            for (const cat of product.categories) {
                const parent = findParentId(cat.id.toString());
                if (parent) return parent;
            }
        }

        return '';
    });

    // Format currency based on marketplace settings
    const formatCurrency = (amount: number) => {
        const currency = marketplaceSettings?.general?.currency || 'RWF';
        const symbol = marketplaceSettings?.general?.currency_symbol || 'RWF';

        if (currency === 'RWF') {
            return new Intl.NumberFormat('rw-RW', {
                style: 'currency',
                currency: 'RWF'
            }).format(amount);
        }

        return `${symbol}${amount.toLocaleString()}`;
    };

    // Calculate vendor earnings from price
    const calculateVendorEarnings = (price: number) => {
        if (!marketplaceSettings || !price) return { earnings: 0, breakdown: [] };

        const commission = marketplaceSettings.commission.commission_type === 'percentage'
            ? (price * marketplaceSettings.commission.default_commission_rate) / 100
            : marketplaceSettings.commission.default_commission_rate;

        const platformFee = (price * (marketplaceSettings?.platform_fees?.platform_fee_rate || 0)) / 100;
        const transactionFee = (price * (marketplaceSettings?.platform_fees?.transaction_fee_rate || 0)) / 100;

        const totalFees = commission + platformFee + transactionFee;
        const earnings = price - totalFees;

        return {
            earnings,
            breakdown: [
                { label: 'Product Price', amount: price, type: 'positive' },
                { label: 'Commission', amount: -commission, type: 'negative' },
                { label: 'Platform Fee', amount: -platformFee, type: 'negative' },
                { label: 'Transaction Fee', amount: -transactionFee, type: 'negative' },
                { label: 'Your Earnings', amount: earnings, type: 'positive', isTotal: true }
            ]
        };
    };

    const tabs = [
        { value: 'basic', label: 'Basic Info' },
        { value: 'details', label: 'Details' },
        { value: 'images', label: 'Images' },
        { value: 'seo', label: 'SEO' },
        { value: 'payment', label: 'Payment' },
        { value: 'shipping', label: 'Shipping' }
    ];

    const currentTabIndex = tabs.findIndex(tab => tab.value === currentTab);
    const isFirstTab = currentTabIndex === 0;
    const isLastTab = currentTabIndex === tabs.length - 1;

    const goToNextTab = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
        }
        if (!isLastTab) {
            setCurrentTab(tabs[currentTabIndex + 1].value);
        }
    };

    const goToPreviousTab = () => {
        if (!isFirstTab) {
            setCurrentTab(tabs[currentTabIndex - 1].value);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate Minimum/Maximum Order Quantity
        if (parseInt(data.minimum_order_quantity) < 1) {
            toast.error('Minimum order quantity must be at least 1.');
            return;
        }

        if (data.maximum_order_quantity && parseInt(data.maximum_order_quantity) < parseInt(data.minimum_order_quantity)) {
            toast.error('Maximum order quantity cannot be less than minimum order quantity.');
            return;
        }

        // Use post with _method: 'PUT' for file uploads
        post(`/marketplace/vendor/products/${product.id}`, {
            onSuccess: () => {
                setImagePreviews([]);
                toast.success('Product updated successfully!');
            },
            onError: (errors: Record<string, string>) => {

                toast.error('Please fix the errors in the form and try again.');
            }
        });
    };

    const handleImageUpload = (files: FileList | null) => {
        if (!files) return;

        const newFiles = Array.from(files);
        const validFiles: File[] = [];
        const newPreviews: string[] = [];

        newFiles.forEach((file) => {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast.error(`Image ${file.name} exceeds 2MB limit.`);
                return;
            }

            validFiles.push(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                newPreviews.push(e.target?.result as string);
                if (newPreviews.length === validFiles.length) {
                    setImagePreviews(prev => [...prev, ...newPreviews]);
                }
            };
            reader.readAsDataURL(file);
        });

        setData('images', [...data.images, ...validFiles]);
    };

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 9 * 1024 * 1024) { // 5MB limit
                toast.error('Video size exceeds 5MB limit.');
                return;
            }
            setData('video', file);
            setData(data => ({ ...data, video: file, remove_video: false }));
        }
    };

    const removeNewImage = (index: number) => {
        const newImages = data.images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setData('images', newImages);
        setImagePreviews(newPreviews);
    };

    const removeExistingImage = (imageId: number) => {
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
        setData('remove_images', [...data.remove_images, imageId]);
    };

    const addTag = () => {
        if (currentTag.trim() && !data.tags.includes(currentTag.trim())) {
            setData('tags', [...data.tags, currentTag.trim()]);
            setCurrentTag('');
        }
    };

    const removeTag = (index: number) => {
        setData('tags', data.tags.filter((_: string, i: number) => i !== index));
    };

    // Handle shipping selection
    const handleShippingMethodChange = (value: string) => {
        setData("shipping_option", value);
    };

    return (
        <VendorLayout
            title={`Edit ${product.name}`}
            breadcrumbItems={[
                { title: 'Products', href: '/marketplace/vendor/products' },
                { title: product.name, href: `/marketplace/vendor/products/${product.id}` },
                { title: 'Edit' }
            ]}
            vendor={vendor}
            currentSubscription={currentSubscription}
            subscriptionUsage={subscriptionUsage}
            needsUpgrade={needsUpgrade}
            upgradeReason={upgradeReason}
        >
            <Head title={`Edit ${product.name}`} />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 p-4 sm:p-6 pb-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <Button
                        onClick={() => window.history.back()}
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div className="w-full sm:w-auto">
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            Edit Product
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Update product information
                        </p>
                    </div>
                </div>
            </div>

            <div className="py-2 sm:py-6">
                <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-6">
                    <form onSubmit={handleSubmit}>
                        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
                            <TabsList className="w-full inline-flex lg:grid lg:grid-cols-6 h-auto flex-wrap lg:flex-nowrap gap-1 p-1">
                                <TabsTrigger value="basic" className="text-xs sm:text-sm flex-1 min-w-[90px]">Basic Info</TabsTrigger>
                                <TabsTrigger value="details" className="text-xs sm:text-sm flex-1 min-w-[90px]">Details</TabsTrigger>
                                <TabsTrigger value="images" className="text-xs sm:text-sm flex-1 min-w-[90px]">Images</TabsTrigger>
                                <TabsTrigger value="seo" className="text-xs sm:text-sm flex-1 min-w-[90px]">SEO</TabsTrigger>
                                <TabsTrigger value="payment" className="text-xs sm:text-sm flex-1 min-w-[90px]">Payment</TabsTrigger>
                                <TabsTrigger value="shipping" className="text-xs sm:text-sm flex-1 min-w-[90px]">Shipping</TabsTrigger>
                            </TabsList>

                            {/* Basic Information */}
                            <TabsContent value="basic">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Package className="h-5 w-5 mr-2" />
                                            Basic Product Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="name">Product Name *</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className={errors.name ? 'border-red-500' : ''}
                                                placeholder="Enter product name"
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="description">Product Description *</Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                className={errors.description ? 'border-red-500' : ''}
                                                rows={6}
                                                placeholder="Describe your product in detail..."
                                            />
                                            {errors.description && (
                                                <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="parent_category">Parent Category *</Label>
                                                <Select
                                                    value={selectedParentId}
                                                    onValueChange={(value) => {
                                                        setSelectedParentId(value);
                                                        setData('category_ids', []); // Reset child selection when parent changes
                                                    }}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a parent category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categories.map((category) => (
                                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                                {category.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {selectedParentId && (
                                                <div>
                                                    <Label className="mb-2 block">Sub Categories * (Select multiple)</Label>
                                                    <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                                                        {categories
                                                            .find(c => c.id.toString() === selectedParentId)
                                                            ?.children?.map((child) => (
                                                                <div key={child.id} className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={`category-${child.id}`}
                                                                        checked={data.category_ids.includes(child.id.toString())}
                                                                        onCheckedChange={(checked) => {
                                                                            const id = child.id.toString();
                                                                            if (checked) {
                                                                                setData('category_ids', [...data.category_ids, id]);
                                                                            } else {
                                                                                setData('category_ids', data.category_ids.filter(cid => cid !== id));
                                                                            }
                                                                        }}
                                                                    />
                                                                    <Label htmlFor={`category-${child.id}`} className="font-normal cursor-pointer text-sm">
                                                                        {child.name}
                                                                    </Label>
                                                                </div>
                                                            ))}
                                                    </div>
                                                    {errors.category_ids && (
                                                        <p className="text-sm text-red-500 mt-1">{errors.category_ids}</p>
                                                    )}
                                                </div>
                                            )}

                                            <div>
                                                <Label htmlFor="status">Status</Label>
                                                <Select
                                                    value={data.status}
                                                    onValueChange={(value) => setData('status', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="draft">Draft</SelectItem>
                                                        <SelectItem value="active">Active</SelectItem>
                                                        <SelectItem value="inactive">Inactive</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="price">Price ({marketplaceSettings?.general?.currency || 'RWF'}) *</Label>
                                                <Input
                                                    type="number"
                                                    id="price"
                                                    value={data.price}
                                                    onChange={(e) => setData('price', e.target.value)}
                                                    className={errors.price ? 'border-red-500' : ''}
                                                    placeholder="0.00"
                                                    step="0.01"
                                                    min="0"
                                                />
                                                {errors.price && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.price}</p>
                                                )}
                                            </div>

                                            {data.payment_methods.includes('cod') && (
                                                <div className="flex items-start space-x-2 mt-2">
                                                    <Checkbox
                                                        id="is_negotiable"
                                                        checked={data.is_negotiable}
                                                        onCheckedChange={(checked) => setData('is_negotiable', checked as boolean)}
                                                    />
                                                    <div className="grid gap-1.5 leading-none">
                                                        <Label
                                                            htmlFor="is_negotiable"
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            Negotiable Price
                                                        </Label>
                                                        <p className="text-xs text-muted-foreground">
                                                            Negotiable depending on size, amount, etc.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            <div>
                                                <Label htmlFor="sku">SKU (Stock Keeping Unit) *</Label>
                                                <Input
                                                    id="sku"
                                                    value={data.sku}
                                                    onChange={(e) => setData('sku', e.target.value)}
                                                    className={errors.sku ? 'border-red-500' : ''}
                                                    placeholder="e.g., ABC-123456-XYZ"
                                                />
                                                {errors.sku && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.sku}</p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Product Details */}
                            <TabsContent value="details">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Info className="h-5 w-5 mr-2" />
                                            Product Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                                                <Input
                                                    type="number"
                                                    id="stock_quantity"
                                                    value={data.stock_quantity}
                                                    onChange={(e) => setData('stock_quantity', e.target.value)}
                                                    className={errors.stock_quantity ? 'border-red-500' : ''}
                                                    placeholder="0"
                                                    min="0"
                                                />
                                                {errors.stock_quantity && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.stock_quantity}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="minimum_order_quantity">Minimum Order Quantity</Label>
                                                <Input
                                                    type="number"
                                                    id="minimum_order_quantity"
                                                    value={data.minimum_order_quantity}
                                                    onChange={(e) => setData('minimum_order_quantity', e.target.value)}
                                                    className={errors.minimum_order_quantity ? 'border-red-500' : ''}
                                                    placeholder="1"
                                                    min="1"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="maximum_order_quantity">Maximum Order Quantity</Label>
                                                <Input
                                                    type="number"
                                                    id="maximum_order_quantity"
                                                    value={data.maximum_order_quantity}
                                                    onChange={(e) => setData('maximum_order_quantity', e.target.value)}
                                                    className={errors.maximum_order_quantity ? 'border-red-500' : ''}
                                                    placeholder="Optional"
                                                    min={data.minimum_order_quantity || "1"}
                                                />
                                                {errors.maximum_order_quantity && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.maximum_order_quantity}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="weight">Weight (kg)</Label>
                                                <Input
                                                    type="number"
                                                    id="weight"
                                                    value={data.weight}
                                                    onChange={(e) => setData('weight', e.target.value)}
                                                    placeholder="0.0"
                                                    step="0.01"
                                                    min="0"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="dimensions">Dimensions (L x W x H cm)</Label>
                                                <Input
                                                    id="dimensions"
                                                    value={data.dimensions}
                                                    onChange={(e) => setData('dimensions', e.target.value)}
                                                    placeholder="e.g., 20 x 15 x 10"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-sm text-gray-600">
                                                Additional product options will be available after update.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Product Images */}
                            <TabsContent value="images">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Camera className="h-5 w-5 mr-2" />
                                            Product Images
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Existing Images */}
                                        {existingImages.length > 0 && (
                                            <div>
                                                <Label>Current Images</Label>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                                    {existingImages.map((image) => (
                                                        <div key={image.id} className="relative group">
                                                            <img
                                                                src={image.image_path}
                                                                alt={image.alt_text}
                                                                className="w-full h-32 object-cover rounded-lg border"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeExistingImage(image.id)}
                                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                            {image.is_primary && (
                                                                <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                                                    Primary
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Upload New Images */}
                                        <div>
                                            <Label>Upload New Images</Label>
                                            <div className="mt-2 space-y-4">
                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-gray-600 mb-2">Drag and drop images here, or click to browse</p>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={(e) => handleImageUpload(e.target.files)}
                                                        className="hidden"
                                                        id="image-upload"
                                                    />
                                                    <Label
                                                        htmlFor="image-upload"
                                                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                                    >
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Choose Images
                                                    </Label>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        Recommended: 800x800px, JPG or PNG, max 2MB each
                                                    </p>
                                                </div>

                                                {imagePreviews.length > 0 && (
                                                    <div>
                                                        <Label>New Images to Upload</Label>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                                            {imagePreviews.map((preview, index) => (
                                                                <div key={index} className="relative group">
                                                                    <img
                                                                        src={preview}
                                                                        alt={`Preview ${index + 1}`}
                                                                        className="w-full h-32 object-cover rounded-lg border"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeNewImage(index)}
                                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Video Section */}
                                        <div className="pt-6 border-t">
                                            <Label className="text-base font-medium">Product Video</Label>
                                            <div className="mt-2">
                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                                    {data.video ? (
                                                        // Case 1: New video selected
                                                        <div className="relative inline-block">
                                                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border">
                                                                <Package className="h-6 w-6 text-blue-500" />
                                                                <span className="text-sm font-medium">{data.video.name}</span>
                                                                <span className="text-xs text-gray-500">({(data.video.size / (1024 * 1024)).toFixed(2)} MB)</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setData('video', null)}
                                                                    className="ml-2 text-red-500 hover:text-red-700"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                            <p className="text-xs text-green-600 mt-1">New video selected (will replace existing)</p>
                                                        </div>
                                                    ) : !data.remove_video && product.video_path ? (
                                                        // Case 2: Existing video present and not marked for removal
                                                        <div className="relative inline-block">
                                                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border">
                                                                <Package className="h-6 w-6 text-blue-500" />
                                                                <span className="text-sm font-medium">Current Video</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setData('remove_video', true)}
                                                                    className="ml-2 text-red-500 hover:text-red-700"
                                                                    title="Remove Video"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                            <a
                                                                href={product.video_path}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs text-blue-600 hover:underline mt-1 block"
                                                            >
                                                                View current video
                                                            </a>
                                                        </div>
                                                    ) : (
                                                        // Case 3: No video or video marked for removal
                                                        <>
                                                            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                                                            <p className="text-gray-600 mb-2">Upload a product video</p>
                                                            <input
                                                                type="file"
                                                                accept="video/*"
                                                                onChange={handleVideoUpload}
                                                                className="hidden"
                                                                id="video-upload"
                                                            />
                                                            <Label
                                                                htmlFor="video-upload"
                                                                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                                            >
                                                                <Plus className="h-4 w-4 mr-2" />
                                                                Select Video
                                                            </Label>
                                                            <p className="text-xs text-gray-500 mt-2">
                                                                Max size: 5MB. Formats: MP4, MOV, OGG
                                                            </p>
                                                            {product.video_path && data.remove_video && (
                                                                <p className="text-xs text-red-500 mt-2">
                                                                    Current video marked for removal.
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setData('remove_video', false)}
                                                                        className="underline ml-1"
                                                                    >
                                                                        Undo
                                                                    </button>
                                                                </p>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* SEO & Tags */}
                            <TabsContent value="seo">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>SEO & Tags</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="meta_description">Meta Description</Label>
                                            <Textarea
                                                id="meta_description"
                                                value={data.meta_description}
                                                onChange={(e) => setData('meta_description', e.target.value)}
                                                placeholder="Brief description for search engine results"
                                                maxLength={160}
                                                rows={3}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                {data.meta_description.length}/160 characters
                                            </p>
                                        </div>

                                        <div>
                                            <Label>Product Tags</Label>
                                            <div className="flex gap-2 mt-2">
                                                <Input
                                                    value={currentTag}
                                                    onChange={(e) => setCurrentTag(e.target.value)}
                                                    placeholder="Add a tag"
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            addTag();
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={addTag}
                                                    size="sm"
                                                >
                                                    Add Tag
                                                </Button>
                                            </div>

                                            {data.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {data.tags.map((tag: string, index: number) => (
                                                        <div
                                                            key={index}
                                                            className="inline-flex items-center bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                                                        >
                                                            {tag}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeTag(index)}
                                                                className="ml-2 text-blue-600 hover:text-blue-800"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Payment Tab */}
                            <TabsContent value="payment">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <DollarSign className="h-5 w-5 mr-2" />
                                            Payment Information
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <Alert className="mb-4">
                                            <Info className="h-4 w-4 mr-2" />
                                            <AlertDescription>
                                                Select how customers can pay for your product.
                                            </AlertDescription>
                                        </Alert>

                                        <div>
                                            <Label>Supported Payment Methods</Label>

                                            <div className="mt-2 space-y-3">
                                                {/* Online Payment */}
                                                <div className="flex items-center">
                                                    <Checkbox
                                                        id="online"
                                                        checked={data.payment_methods.includes("online")}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setData("payment_methods", [...data.payment_methods, "online"]);
                                                            } else {
                                                                setData(
                                                                    "payment_methods",
                                                                    data.payment_methods.filter((m) => m !== "online")
                                                                );
                                                            }
                                                        }}
                                                    />
                                                    <Label htmlFor="online" className="ml-2">
                                                        Online Payment
                                                    </Label>
                                                </div>

                                                {/* Cash on Delivery (Premium only) */}
                                                <div className="flex items-center">
                                                    <Checkbox
                                                        id="cod"
                                                        checked={data.payment_methods.includes("cod")}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                // ✅ Restrict to plans that allow COD
                                                                if (!subscriptionUsage?.allows_cod) {
                                                                    toast.warning(
                                                                        "Cash on Delivery is not available for your current subscription plan. Please upgrade your plan."
                                                                    );
                                                                    return; // stop here, do not allow check
                                                                }

                                                                setData("payment_methods", [...data.payment_methods, "cod"]);
                                                            } else {
                                                                setData(
                                                                    "payment_methods",
                                                                    data.payment_methods.filter((m) => m !== "cod")
                                                                );
                                                            }
                                                        }}
                                                    />
                                                    <Label htmlFor="cod" className="ml-2">
                                                        Cash on Delivery (COD)
                                                        {!subscriptionUsage?.allows_cod && (
                                                            <span className="text-xs text-red-500 ml-2">
                                                                (Not available for your plan)
                                                            </span>
                                                        )}
                                                    </Label>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>


                            {/* Shipping & Delivery Tab */}
                            <TabsContent value="shipping">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Truck className="h-5 w-5 mr-2" />
                                            Shipping & Delivery
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <Alert className="mb-4">
                                            <Info className="h-4 w-4 mr-2" />
                                            <AlertDescription>
                                                Configure your shipping options for this product.
                                            </AlertDescription>
                                        </Alert>

                                        {/* Shipping Methods */}
                                        <div>
                                            <Label>Shipping Methods</Label>

                                            <RadioGroup
                                                value={data.shipping_option}
                                                onValueChange={handleShippingMethodChange}
                                                className="mt-2 space-y-2"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="free" id="free" />
                                                    <Label htmlFor="free">Free Shipping</Label>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="paid" id="paid" />
                                                    <Label htmlFor="paid">Paid Shipping</Label>
                                                </div>
                                            </RadioGroup>

                                            {/* Extra Fee when Paid Shipping selected */}
                                            {data.shipping_option === "paid" && (
                                                <div className="mt-4 space-y-2">
                                                    <Label htmlFor="extra-fee">Extra Fee for Shipping</Label>
                                                    <Input
                                                        type="number"
                                                        id="extra-fee"
                                                        placeholder="Enter extra fee (e.g. 1500)"
                                                        value={data.extra_fee}
                                                        onChange={(e) => setData("extra_fee", e.target.value)}
                                                    />
                                                </div>
                                            )}

                                            {/* Delivery Time */}
                                            <div className="mt-4 space-y-2">
                                                <Label htmlFor="delivery-time">Estimated Delivery Time</Label>
                                                <Input
                                                    id="delivery-time"
                                                    placeholder="e.g. 2–5 business days"
                                                    value={data.delivery_time}
                                                    onChange={(e) => setData("delivery_time", e.target.value)}
                                                />
                                            </div>

                                            {/* Return Policy */}
                                            <div className="mt-4 space-y-2">
                                                <Label htmlFor="return-policy">Return Policy</Label>
                                                <Textarea
                                                    id="return-policy"
                                                    placeholder="e.g. Returns accepted within 7 days of delivery"
                                                    value={data.return_policy}
                                                    onChange={(e) => setData("return_policy", e.target.value)}
                                                />
                                            </div>

                                            {/* Additional Info */}
                                            <div className="mt-4 space-y-2">
                                                <Label htmlFor="additional-info">Additional Information</Label>
                                                <Textarea
                                                    id="additional-info"
                                                    placeholder="Any additional information about the product"
                                                    value={data.additional_info}
                                                    onChange={(e) => setData("additional_info", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                        </Tabs>

                        {/* Navigation and Submit Buttons */}
                        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-6">
                            <Button
                                type="button"
                                onClick={goToPreviousTab}
                                disabled={isFirstTab}
                                variant="outline"
                                className="w-full sm:w-auto order-2 sm:order-1"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Previous
                            </Button>

                            <div className="flex gap-3 order-1 sm:order-2">
                                {!isLastTab ? (
                                    <Button
                                        type="button"
                                        onClick={goToNextTab}
                                        className="w-full sm:w-auto min-w-[120px]"
                                    >
                                        Next
                                        <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full sm:w-auto min-w-[120px]"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Update Product
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </VendorLayout>
    );
}
