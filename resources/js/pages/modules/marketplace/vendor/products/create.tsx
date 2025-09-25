import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import VendorLayout from '@/layouts/vendor-layout';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface Category {
    id: number;
    name: string;
    parent?: {
        id: number;
        name: string;
    };
}

interface Vendor {
    id: number;
    business_name: string;
    verification_status: string;
    status: string;
    subscription?: {
        plan_name: string;
        is_active: boolean;
    };
}

interface CreateProductProps {
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
        fees: {
            platform_fee_rate: number;
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

export default function CreateProduct({ categories, vendor, currentSubscription, subscriptionUsage, needsUpgrade, upgradeReason, marketplaceSettings }: CreateProductProps) {
    console.log('Subscription Data:', { currentSubscription, subscriptionUsage, allowsCOD: subscriptionUsage?.allows_cod });
    console.log(categories)
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        price: '',
        category_id: '',
        sku: '',
        stock_quantity: '',
        minimum_order_quantity: '1',
        weight: '',
        dimensions: '',
        status: 'draft',
        images: [] as File[],
        meta_description: '',
        tags: [] as string[],
        payment_methods: [] as string[],
        shipping_option: '',
        extra_fee: '',
        delivery_time: '',
        return_policy: '',
        additional_info: ''

    });

    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState('');
    const [currentTab, setCurrentTab] = useState('basic');

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

    const goToNextTab = () => {
        if (!isLastTab) {
            setCurrentTab(tabs[currentTabIndex + 1].value);
        }
    };

    const goToPreviousTab = () => {
        if (!isFirstTab) {
            setCurrentTab(tabs[currentTabIndex - 1].value);
        }
    };

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
        
        const platformFee = (price * marketplaceSettings.fees.platform_fee_rate) / 100;
        const transactionFee = (price * marketplaceSettings.fees.transaction_fee_rate) / 100;
        
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Check product limit before submission
        if (subscriptionUsage && !subscriptionUsage.can_create_more) {
            toast.error(
                `You've reached your product limit (${subscriptionUsage.products_limit}). Please upgrade your plan to add more products.`,
                { duration: 5000 }
            );
            return;
        }

        // Validate COD selection
        if (data.payment_methods.includes('cod') && !subscriptionUsage?.allows_cod) {
            toast.error(
                'Cash on Delivery is not available for your current subscription plan.',
                { duration: 5000 }
            );
            return;
        }

        post('/marketplace/vendor/products/store', {
            onSuccess: () => {
                reset();
                setImagePreviews([]);
                toast.success('Product created successfully!');
            },
            onError: (errors: Record<string, string>) => {
                console.log(errors);
                toast.error('Please fix the errors in the form and try again.');
            }
        });
    };

    const handleImageUpload = (files: FileList | null) => {
        if (!files) return;

        const newFiles = Array.from(files);
        const newPreviews: string[] = [];

        newFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                newPreviews.push(e.target?.result as string);
                if (newPreviews.length === newFiles.length) {
                    setImagePreviews(prev => [...prev, ...newPreviews]);
                }
            };
            reader.readAsDataURL(file);
        });

        setData('images', [...data.images, ...newFiles]);
    };

    const removeImage = (index: number) => {
        const newImages = data.images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setData('images', newImages);
        setImagePreviews(newPreviews);
    };

    const addTag = () => {
        if (currentTag.trim() && !data.tags.includes(currentTag.trim())) {
            setData('tags', [...data.tags, currentTag.trim()]);
            setCurrentTag('');
        }
    };

    const removeTag = (index: number) => {
        setData('tags', data.tags.filter((_, i) => i !== index));
    };

    const generateSKU = () => {
        const prefix = vendor.business_name.substring(0, 3).toUpperCase();
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        setData('sku', `${prefix}-${timestamp}-${random}`);
    };



    // Handle shipping selection
    const handleShippingMethodChange = (value: string) => {
        setData("shipping_option", value);
    };


    if (vendor.status !== 'approved') {
        return (
            <VendorLayout>
                <Head title="Create Product" />

                <div className="py-12">
                    <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                        <Card>
                            <CardContent className="p-8 text-center">
                                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="h-8 w-8 text-yellow-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    Account Verification Required
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Your vendor account needs to be verified before you can create products.
                                    Please wait for admin approval.
                                </p>
                                <Button onClick={() => window.location.href = route('marketplace.vendor.dashboard')}>
                                    Back to Dashboard
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </VendorLayout>
        );
    }

    return (
        <VendorLayout
            title="Create Product"
            breadcrumbItems={[
                { title: 'Products', href: '/marketplace/vendor/products' },
                { title: 'Create Product' }
            ]}
            vendor={vendor}
            currentSubscription={currentSubscription}
            subscriptionUsage={subscriptionUsage}
            needsUpgrade={needsUpgrade}
            upgradeReason={upgradeReason}
        >
            <Head title="Create Product" />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 px-2 sm:px-0">
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
                            Create New Product
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Add a new product to your marketplace store
                        </p>
                    </div>
                </div>
            </div>

            <div className="py-2 sm:py-6">
                <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-6">
                    
                    {subscriptionUsage && subscriptionUsage.products_limit !== undefined && (
                        <Alert className="mb-6" variant={subscriptionUsage.can_create_more ? "default" : "destructive"}>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="ml-2">
                                {subscriptionUsage.can_create_more ? (
                                    <div className="space-y-1">
                                        <p>
                                            You are using <strong>{subscriptionUsage.products_used}</strong> of{' '}
                                            <strong>{subscriptionUsage.products_limit}</strong> products allowed in your{' '}
                                            <strong>{subscriptionUsage.plan_name}</strong> plan.
                                        </p>
                                        {subscriptionUsage.products_used >= subscriptionUsage.products_limit * 0.8 && (
                                            <p className="text-orange-600 font-medium">
                                                ⚠️ You're approaching your limit!
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <p>
                                        You've reached your product limit (<strong>{subscriptionUsage.products_limit}</strong> products).{' '}
                                        <Link 
                                            href="/marketplace/subscriptions/upgrade" 
                                            className="font-semibold underline hover:no-underline"
                                        >
                                            Upgrade your plan
                                        </Link>{' '}
                                        to add more products.
                                    </p>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}

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
                                    <CardHeader className="p-4 sm:p-6">
                                        <CardTitle className="flex items-center text-base sm:text-lg">
                                            <Package className="h-5 w-5 mr-2" />
                                            Basic Product Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 p-4 sm:p-6">
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
                                                <Label htmlFor="category_id">Category *</Label>
                                                <Select
                                                    value={data.category_id}
                                                    onValueChange={(value) => setData('category_id', value)}
                                                >
                                                    <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
                                                        <SelectValue placeholder="Select a category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categories.map((category) => (
                                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                                {category.parent ? `${category.parent.name} > ` : ''}
                                                                {category.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.category_id && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.category_id}</p>
                                                )}
                                            </div>

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
                                                        <SelectItem value="pending">Pending Review</SelectItem>
                                                        <SelectItem value="active">Active</SelectItem>
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
                                                
                                                {/* Earnings Calculator */}
                                                {data.price && marketplaceSettings && parseFloat(data.price) > 0 && (
                                                    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                                        <h4 className="font-medium text-emerald-900 text-sm mb-2">Your Earnings Breakdown</h4>
                                                        {calculateVendorEarnings(parseFloat(data.price)).breakdown.map((item, index) => (
                                                            <div key={index} className={`flex justify-between text-xs ${item.isTotal ? 'font-bold border-t pt-1 mt-1' : ''}`}>
                                                                <span className={item.type === 'negative' ? 'text-red-700' : 'text-emerald-700'}>
                                                                    {item.label}:
                                                                </span>
                                                                <span className={item.type === 'negative' ? 'text-red-700' : 'text-emerald-700'}>
                                                                    {item.amount >= 0 ? formatCurrency(item.amount) : `-${formatCurrency(Math.abs(item.amount))}`}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="sku">SKU (Stock Keeping Unit) *</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        id="sku"
                                                        value={data.sku}
                                                        onChange={(e) => setData('sku', e.target.value)}
                                                        className={errors.sku ? 'border-red-500' : ''}
                                                        placeholder="e.g., ABC-123456-XYZ"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={generateSKU}
                                                        size="sm"
                                                    >
                                                        Generate
                                                    </Button>
                                                </div>
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
                                    <CardHeader className="p-4 sm:p-6">
                                        <CardTitle className="flex items-center text-base sm:text-lg">
                                            <Package className="h-5 w-5 mr-2" />
                                            Product Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 p-4 sm:p-6">
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
                                                Additional product options will be available after creation.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Product Images */}
                            <TabsContent value="images">
                                <Card>
                                    <CardHeader className="p-4 sm:p-6">
                                        <CardTitle className="flex items-center text-base sm:text-lg">
                                            <Camera className="h-5 w-5 mr-2" />
                                            Product Images
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 p-4 sm:p-6">
                                        <div>
                                            <Label>Upload Images</Label>
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
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        {imagePreviews.map((preview, index) => (
                                                            <div key={index} className="relative group">
                                                                <img
                                                                    src={preview}
                                                                    alt={`Preview ${index + 1}`}
                                                                    className="w-full h-32 object-cover rounded-lg border"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeImage(index)}
                                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                                {index === 0 && (
                                                                    <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                                                        Primary
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* SEO & Tags */}
                            <TabsContent value="seo">
                                <Card>
                                    <CardHeader className="p-4 sm:p-6">
                                        <CardTitle className="flex items-center text-base sm:text-lg">
                                            <Info className="h-5 w-5 mr-2" />
                                            SEO & Tags
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 p-4 sm:p-6">
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
                                                    {data.tags.map((tag, index) => (
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
                                    <CardHeader className="p-4 sm:p-6">
                                        <CardTitle className="flex items-center text-base sm:text-lg">
                                            <DollarSign className="h-5 w-5 mr-2" />
                                            Payment Information
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="space-y-4 p-4 sm:p-6">
                        <Alert className="mb-4">
                            <Info className="h-4 w-4 mr-2" />
                            <AlertDescription>
                                Select how customers can pay for your product.
                            </AlertDescription>
                        </Alert>                                        <div>
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
                                    <CardHeader className="p-4 sm:p-6">
                                        <CardTitle className="flex items-center text-base sm:text-lg">
                                            <Truck className="h-5 w-5 mr-2" />
                                            Shipping & Delivery
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="space-y-4 p-4 sm:p-6">
                        <Alert className="mb-4">
                            <Info className="h-4 w-4 mr-2" />
                            <AlertDescription>
                                Configure your shipping options for this product.
                            </AlertDescription>
                        </Alert>                                        {/* Shipping Methods */}
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
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Create Product
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
