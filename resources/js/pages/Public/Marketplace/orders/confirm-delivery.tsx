import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    Package, 
    Upload, 
    CheckCircle, 
    AlertTriangle,
    User,
    MapPin,
    Calendar,
    CreditCard
} from 'lucide-react';
import { toast } from 'sonner';
import WelcomeNav from '@/components/navigation/WelcomeNav';
import { SharedData } from '@/types';

interface Order {
    id: number;
    order_number: string;
    status: string;
    total_amount: number;
    delivered_at: string;
    vendor: {
        user: {
            name: string;
        };
    };
    items: Array<{
        id: number;
        quantity: number;
        unit_price: number;
        total_price: number;
        product: {
            name: string;
            images: Array<{
                image_url: string;
            }>;
        };
    }>;
    shipping_address: {
        name: string;
        address_line_1: string;
        city: string;
        country: string;
    };
    delivery_confirmation: {
        delivery_requested_at: string;
    };
}

interface Props {
    order: Order;
}

export default function ConfirmDelivery({ order }: Props) {
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    
    const { auth } = usePage<SharedData>().props;

    const { data, setData, post, processing, errors } = useForm({
        proof_images: [] as File[],
        confirmation_notes: '',
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        
        if (files.length > 5) {
            toast.error('You can upload maximum 5 images');
            return;
        }

        setImages(files);
        
        // Create previews
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);
        
        setData('proof_images', files);
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);
        
        setImages(newImages);
        setPreviews(newPreviews);
        setData('proof_images', newImages);
    };



    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (images.length === 0) {
            toast.error('Please upload at least one proof image');
            return;
        }

        // Update form data with current images
        setData('proof_images', images);

        // Use Inertia post for form submission
        post(`/orders/${order.id}/confirm-delivery`, {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Delivery confirmed successfully! Payment has been released to the vendor.');
            },
            onError: (errors) => {
                console.error('Submission errors:', errors);
                if (errors.proof_images) {
                    toast.error(errors.proof_images);
                } else if (errors.message) {
                    toast.error(errors.message);
                } else {
                    toast.error('Failed to confirm delivery. Please try again.');
                }
            }
        });
    };

    return (
        <>
            <WelcomeNav auth={auth} />
            <Head title={`Confirm Delivery - Order #${order.order_number}`} />
            
            <div className="min-h-screen bg-gray-50 py-8 pt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Confirm Delivery
                        </h1>
                        <p className="text-gray-600">
                            Please confirm that you have received your order and upload proof of delivery
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Order Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Order Info Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Order #{order.order_number}
                                    </CardTitle>
                                    <CardDescription>
                                        Delivered on {new Date(order.delivered_at).toLocaleDateString()}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-gray-400" />
                                            <span>Vendor: {order.vendor.user.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-4 w-4 text-gray-400" />
                                            <span>Total: RWF {order.total_amount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span>Requested: {new Date(order.delivery_confirmation.delivery_requested_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-gray-400" />
                                            <span>{order.shipping_address.city}, {order.shipping_address.country}</span>
                                        </div>
                                    </div>
                                    
                                    <Badge variant="outline" className="w-fit">
                                        Status: {order.status.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                </CardContent>
                            </Card>

                            {/* Order Items */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order Items</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                                    {item.product.images[0] ? (
                                                        <img 
                                                            src={item.product.images[0].image_url} 
                                                            alt={item.product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Package className="h-8 w-8 text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{item.product.name}</h4>
                                                    <p className="text-sm text-gray-500">
                                                        Quantity: {item.quantity} × RWF {item.unit_price.toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">RWF {item.total_price.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Confirmation Form */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5" />
                                        Confirm Delivery
                                    </CardTitle>
                                    <CardDescription>
                                        Upload proof of delivery to release payment to vendor
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-6">


                                        {/* Image Upload */}
                                        <div className="space-y-3">
                                            <Label>Proof of Delivery (Required)</Label>
                                            
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                                <div className="space-y-4">
                                                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                                                    
                                                    <div className="space-y-3">
                                                        <p className="text-gray-700 font-medium">Upload Proof Images</p>
                                                        
                                                        <div>
                                                            <Input
                                                                type="file"
                                                                multiple
                                                                accept="image/*"
                                                                onChange={handleImageChange}
                                                                className="hidden"
                                                                id="proof-images"
                                                            />
                                                            <Label 
                                                                htmlFor="proof-images"
                                                                className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 border-2 border-emerald-300 border-dashed rounded-lg shadow-sm text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400 transition-colors"
                                                            >
                                                                <Upload className="h-5 w-5" />
                                                                Choose Images to Upload
                                                            </Label>
                                                        </div>
                                                        
                                                        <p className="text-xs text-gray-500">
                                                            Select up to 5 images (JPG, PNG, GIF) from your device
                                                        </p>
                                                    </div>
                                                    </div>
                                                </div>

                                            {errors.proof_images && (
                                                <Alert variant="destructive">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    <AlertDescription>{errors.proof_images}</AlertDescription>
                                                </Alert>
                                            )}

                                            {/* Image Count and Add More */}
                                            {previews.length > 0 && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-gray-700">
                                                            Photos ({previews.length}/5)
                                                        </span>
                                                        {previews.length < 5 && (
                                                            <Label 
                                                                htmlFor="proof-images"
                                                                className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                                            >
                                                                <Upload className="h-3 w-3" />
                                                                Add More
                                                            </Label>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Image Previews */}
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {previews.map((preview, index) => (
                                                            <div key={index} className="relative group">
                                                                <img 
                                                                    src={preview} 
                                                                    alt={`Proof ${index + 1}`}
                                                                    className="w-full h-24 object-cover rounded-md border"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-80 group-hover:opacity-100 transition-opacity"
                                                                    onClick={() => removeImage(index)}
                                                                >
                                                                    ×
                                                                </Button>
                                                                <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1.5 py-0.5 rounded">
                                                                    {index + 1}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Notes */}
                                        <div className="space-y-3">
                                            <Label htmlFor="notes">Additional Notes (Optional)</Label>
                                            <Textarea
                                                id="notes"
                                                placeholder="Any additional comments about the delivery..."
                                                value={data.confirmation_notes}
                                                onChange={(e) => setData('confirmation_notes', e.target.value)}
                                                rows={3}
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <Button 
                                            type="submit" 
                                            className="w-full" 
                                            disabled={processing || images.length === 0}
                                        >
                                            {processing 
                                                ? 'Processing...' 
                                                : `Confirm Delivery & Release Payment (${images.length} photo${images.length !== 1 ? 's' : ''})`
                                            }
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Important Notice */}
                            <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Important:</strong> By confirming delivery, you acknowledge that you have received the order in good condition. The payment will be immediately released to the vendor and cannot be reversed.
                                </AlertDescription>
                            </Alert>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}