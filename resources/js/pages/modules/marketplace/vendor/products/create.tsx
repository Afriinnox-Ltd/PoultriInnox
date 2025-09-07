import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
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
    Upload
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { toast } from 'sonner';

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
}

interface CreateProductProps {
    categories: Category[];
    vendor: Vendor;
}

export default function CreateProduct({ categories, vendor }: CreateProductProps) {
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
    });

    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/marketplace/vendor/products/store', {
            onSuccess: () => {
                reset();
                setImagePreviews([]);
                toast.success('Product created successfully!');
            },
            onError: (errors: any) => {
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

    if (vendor.status !== 'approved') {
        return (
            <AppLayout>
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
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Create Product" />

            <div className="flex justify-between items-center mb-6 p-6 pb-0">
                <div className="flex items-center gap-4">
                    <Button
                        onClick={() => window.history.back()}
                        variant="outline"
                        size="sm"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            Create New Product
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Add a new product to your marketplace store
                        </p>
                    </div>
                </div>
            </div>

            <div className="py-6">
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSubmit}>
                        <Tabs defaultValue="basic" className="space-y-6">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                                <TabsTrigger value="details">Details</TabsTrigger>
                                <TabsTrigger value="images">Images</TabsTrigger>
                                <TabsTrigger value="seo">SEO & Tags</TabsTrigger>
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
                                                <Label htmlFor="price">Price (RWF) *</Label>
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
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Camera className="h-5 w-5 mr-2" />
                                            Product Images
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
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
                        </Tabs>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-6">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="min-w-[120px]"
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
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
