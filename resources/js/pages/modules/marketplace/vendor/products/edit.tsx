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
    sku: string;
    stock_quantity: number;
    minimum_order_quantity: number;
    weight?: number;
    dimensions?: string;
    status: string;
    meta_description?: string;
    tags?: string[] | string | null;
    images: ProductImage[];
}

interface EditProductProps {
    product: Product;
    categories: Category[];
}

export default function EditProduct({ product, categories }: EditProductProps) {
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

    const { data, setData, put, processing, errors } = useForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        category_id: product.category_id?.toString() || '',
        sku: product.sku || '',
        stock_quantity: product.stock_quantity?.toString() || '',
        minimum_order_quantity: product.minimum_order_quantity?.toString() || '1',
        weight: product.weight?.toString() || '',
        dimensions: product.dimensions || '',
        status: product.status || 'draft',
        images: [] as File[],
        meta_description: product.meta_description || '',
        tags: parsedTags,
        remove_images: [] as number[],
    });

    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState('');
    const [existingImages, setExistingImages] = useState<ProductImage[]>(product.images || []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(`/marketplace/vendor/products/${product.id}`, {
            onSuccess: () => {
                setImagePreviews([]);
                toast.success('Product updated successfully!');
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

    return (
        <AppLayout>
            <Head title={`Edit ${product.name}`} />

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
                            Edit Product
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Update product information
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
                                                        <SelectItem value="active">Active</SelectItem>
                                                        <SelectItem value="inactive">Inactive</SelectItem>
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
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Update Product
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
