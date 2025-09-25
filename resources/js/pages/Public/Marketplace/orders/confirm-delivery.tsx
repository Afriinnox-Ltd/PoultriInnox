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
    Camera, 
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const [isCameraLoading, setIsCameraLoading] = useState(false);
    const [uploadMode, setUploadMode] = useState<'camera' | 'upload'>('camera');
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    
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

    const startCamera = async () => {
        setIsCameraLoading(true);
        console.log('Starting camera...');
        
        try {
            // First, check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera not supported on this device/browser');
            }

            console.log('Requesting camera access...');
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment', // Use back camera on mobile
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            });
            
            console.log('Camera stream obtained:', mediaStream);
            setStream(mediaStream);
            setShowCamera(true);
            setIsVideoReady(false);
            
            if (videoRef.current) {
                console.log('Setting video source...');
                videoRef.current.srcObject = mediaStream;
                
                // Add timeout to prevent infinite loading
                const loadingTimeout = setTimeout(() => {
                    console.log('Camera loading timeout reached');
                    setIsCameraLoading(false);
                    toast.error('Camera is taking too long to load. Please try again.');
                }, 10000); // 10 second timeout

                // Wait for video to be ready with better event handling
                const handleLoadedMetadata = () => {
                    console.log('Video metadata loaded');
                    clearTimeout(loadingTimeout);
                    
                    if (videoRef.current) {
                        console.log('Playing video...');
                        const playPromise = videoRef.current.play();
                        
                        if (playPromise !== undefined) {
                            playPromise.then(() => {
                                console.log('Video playing successfully');
                                setIsVideoReady(true);
                                setIsCameraLoading(false);
                            }).catch((playError: Error) => {
                                console.error('Error playing video:', playError);
                                setIsCameraLoading(false);
                                toast.error('Failed to start camera preview: ' + playError.message);
                            });
                        } else {
                            // Fallback for browsers that don't return a promise
                            console.log('Video play method does not return promise');
                            setTimeout(() => {
                                setIsVideoReady(true);
                                setIsCameraLoading(false);
                            }, 1000);
                        }
                    }
                };

                const handleCanPlay = () => {
                    console.log('Video can play');
                    if (!isVideoReady) {
                        setIsVideoReady(true);
                        setIsCameraLoading(false);
                    }
                };

                const handleError = (e: Event) => {
                    console.error('Video element error:', e);
                    clearTimeout(loadingTimeout);
                    setIsCameraLoading(false);
                    toast.error('Camera video error. Please try again.');
                };

                // Add multiple event listeners for better compatibility
                videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
                videoRef.current.addEventListener('canplay', handleCanPlay);
                videoRef.current.addEventListener('error', handleError);
                
                // Cleanup function
                const currentVideo = videoRef.current;
                const cleanup = () => {
                    if (currentVideo) {
                        currentVideo.removeEventListener('loadedmetadata', handleLoadedMetadata);
                        currentVideo.removeEventListener('canplay', handleCanPlay);
                        currentVideo.removeEventListener('error', handleError);
                    }
                    clearTimeout(loadingTimeout);
                };

                // Store cleanup function for later use
                const videoElement = videoRef.current;
                (videoElement as HTMLVideoElement & { _cleanup?: () => void })._cleanup = cleanup;
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            setIsCameraLoading(false);
            
            let errorMessage = 'Unable to access camera. ';
            if (error instanceof Error) {
                if (error.name === 'NotAllowedError') {
                    errorMessage += 'Please allow camera permissions and try again.';
                } else if (error.name === 'NotFoundError') {
                    errorMessage += 'No camera found on this device.';
                } else if (error.name === 'NotSupportedError') {
                    errorMessage += 'Camera not supported on this browser.';
                } else {
                    errorMessage += error.message || 'Please check permissions or use file upload instead.';
                }
            } else {
                errorMessage += 'Please check permissions or use file upload instead.';
            }
            
            toast.error(errorMessage);
        }
    };

    const stopCamera = () => {
        console.log('Stopping camera...');
        
        // Clean up event listeners if they exist
        if (videoRef.current && (videoRef.current as HTMLVideoElement & { _cleanup?: () => void })._cleanup) {
            (videoRef.current as HTMLVideoElement & { _cleanup?: () => void })._cleanup!();
        }
        
        // Stop media stream
        if (stream) {
            console.log('Stopping media tracks...');
            stream.getTracks().forEach(track => {
                track.stop();
                console.log('Stopped track:', track.kind);
            });
            setStream(null);
        }
        
        // Clear video source
        if (videoRef.current) {
            videoRef.current.srcObject = null;
            videoRef.current.pause();
        }
        
        // Reset states
        setShowCamera(false);
        setIsVideoReady(false);
        setIsCameraLoading(false);
        
        console.log('Camera stopped successfully');
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current || !isVideoReady) {
            toast.error('Camera not ready. Please wait a moment.');
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) {
            toast.error('Unable to capture photo. Please try again.');
            return;
        }

        // Check if video has actual dimensions
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            toast.error('Camera not ready. Please wait for the video to load.');
            return;
        }

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to blob
        canvas.toBlob((blob: Blob | null) => {
            if (!blob) {
                toast.error('Failed to capture photo. Please try again.');
                return;
            }

            // Create file from blob
            const file = new File([blob], `delivery-proof-${Date.now()}.jpg`, {
                type: 'image/jpeg',
                lastModified: Date.now()
            });

            // Add to images
            if (images.length >= 5) {
                toast.error('Maximum 5 images allowed');
                return;
            }

            const newImages = [...images, file];
            const newPreview = URL.createObjectURL(file);
            const newPreviews = [...previews, newPreview];

            setImages(newImages);
            setPreviews(newPreviews);
            setData('proof_images', newImages);

            toast.success('Photo captured successfully!');
            stopCamera(); // Close camera after capture
        }, 'image/jpeg', 0.9); // Increased quality
    };

    // Cleanup camera on unmount
    React.useEffect(() => {
        const currentVideo = videoRef.current;
        
        return () => {
            console.log('Component unmounting, cleaning up camera...');
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            
            // Clean up event listeners
            if (currentVideo && (currentVideo as HTMLVideoElement & { _cleanup?: () => void })._cleanup) {
                (currentVideo as HTMLVideoElement & { _cleanup?: () => void })._cleanup!();
            }
        };
    }, [stream]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (images.length === 0) {
            toast.error('Please upload at least one proof image');
            return;
        }

        setIsSubmitting(true);

        // Update form data with images
        setData('proof_images', images);

        post(`/orders/${order.id}/confirm-delivery`, {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Delivery confirmed successfully! Payment has been released to the vendor.');
                // The backend will handle redirect
            },
            onError: (errors) => {
                toast.error('Failed to confirm delivery. Please try again.');
                console.error(errors);
            },
            onFinish: () => {
                setIsSubmitting(false);
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
                                        {/* Upload Mode Switcher */}
                                        <div className="space-y-3">
                                            <Label>Choose Method</Label>
                                            <div className="flex border rounded-lg overflow-hidden bg-gray-50">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setUploadMode('camera');
                                                        if (showCamera) {
                                                            stopCamera();
                                                        }
                                                    }}
                                                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                                                        uploadMode === 'camera'
                                                            ? 'bg-green-600 text-white shadow-sm'
                                                            : 'text-gray-700 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    <Camera className="h-4 w-4" />
                                                    Use Camera
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setUploadMode('upload');
                                                        if (showCamera) {
                                                            stopCamera();
                                                        }
                                                    }}
                                                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                                                        uploadMode === 'upload'
                                                            ? 'bg-green-600 text-white shadow-sm'
                                                            : 'text-gray-700 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    <Upload className="h-4 w-4" />
                                                    Upload Files
                                                </button>
                                            </div>
                                        </div>

                                        {/* Image Upload */}
                                        <div className="space-y-3">
                                            <Label>Proof of Delivery (Required)</Label>
                                            
                                            {!showCamera ? (
                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                                    {uploadMode === 'camera' ? (
                                                        /* Camera Mode Interface */
                                                        <div className="space-y-4">
                                                            <Camera className="h-12 w-12 text-gray-400 mx-auto" />
                                                            
                                                            <div className="space-y-3">
                                                                <p className="text-gray-700 font-medium">Camera Mode</p>
                                                                <Button
                                                                    type="button"
                                                                    onClick={startCamera}
                                                                    disabled={isCameraLoading}
                                                                    className="inline-flex items-center gap-2"
                                                                >
                                                                    {isCameraLoading ? (
                                                                        <>
                                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                                            Starting Camera...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Camera className="h-4 w-4" />
                                                                            Start Camera
                                                                        </>
                                                                    )}
                                                                </Button>
                                                                
                                                                <p className="text-xs text-gray-500">
                                                                    Click to start camera and take photos of your delivery
                                                                </p>
                                                                
                                                                {/* Camera troubleshooting help */}
                                                                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
                                                                    <p className="text-sm text-yellow-800 font-medium mb-2">Camera not working?</p>
                                                                    <ul className="text-xs text-yellow-700 space-y-1">
                                                                        <li>• Make sure you allow camera permissions</li>
                                                                        <li>• Close other apps using the camera</li>
                                                                        <li>• Try refreshing the page</li>
                                                                        <li>• Switch to "Upload Files" mode instead</li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        /* File Upload Mode Interface */
                                                        <div className="space-y-4">
                                                            <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                                                            
                                                            <div className="space-y-3">
                                                                <p className="text-gray-700 font-medium">File Upload Mode</p>
                                                                
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
                                                                        className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 border-2 border-green-300 border-dashed rounded-lg shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 hover:border-green-400 transition-colors"
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
                                                    )}
                                                </div>
                                            ) : (
                                                /* Camera Interface */
                                                <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                                                    <div className="relative">
                                                        <video
                                                            ref={videoRef}
                                                            autoPlay
                                                            playsInline
                                                            muted
                                                            className="w-full h-64 object-cover bg-black"
                                                        />
                                                        
                                                        {/* Camera Controls Overlay */}
                                                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                                                            <Button
                                                                type="button"
                                                                onClick={capturePhoto}
                                                                size="lg"
                                                                disabled={!isVideoReady || isCameraLoading}
                                                                className={`rounded-full w-16 h-16 p-0 transition-all ${
                                                                    isVideoReady && !isCameraLoading
                                                                        ? 'bg-white text-gray-900 hover:bg-gray-100 shadow-lg'
                                                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                                }`}
                                                            >
                                                                <Camera className="h-6 w-6" />
                                                            </Button>
                                                            
                                                            <Button
                                                                type="button"
                                                                onClick={stopCamera}
                                                                variant="outline"
                                                                size="lg"
                                                                className="bg-white text-gray-900 hover:bg-gray-100 rounded-full w-16 h-16 p-0 shadow-lg"
                                                            >
                                                                ×
                                                            </Button>
                                                        </div>
                                                        
                                                        {/* Instructions and Status */}
                                                        <div className="absolute top-4 left-4 right-4">
                                                            <div className="bg-black bg-opacity-50 text-white px-3 py-2 rounded text-sm text-center">
                                                                {isCameraLoading 
                                                                    ? 'Loading camera...' 
                                                                    : !isVideoReady 
                                                                        ? 'Waiting for camera to initialize...'
                                                                        : 'Position the delivered items in frame and tap the camera button'
                                                                }
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Loading Spinner */}
                                                        {(isCameraLoading || !isVideoReady) && (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                                                                <div className="bg-white rounded-lg p-4 flex flex-col items-center gap-3 max-w-xs">
                                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                                                    <span className="text-sm text-gray-700 text-center">
                                                                        {isCameraLoading ? 'Starting camera...' : 'Initializing...'}
                                                                    </span>
                                                                    {/* Show retry button when loading is stuck */}
                                                                    {isCameraLoading && (
                                                                        <div className="text-center space-y-2">
                                                                            <p className="text-xs text-gray-500">
                                                                                Camera taking longer than expected?
                                                                            </p>
                                                                            <div className="flex gap-2 justify-center">
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    onClick={() => {
                                                                                        console.log('Manual retry requested');
                                                                                        stopCamera();
                                                                                        setTimeout(startCamera, 500);
                                                                                    }}
                                                                                >
                                                                                    Retry Camera
                                                                                </Button>
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    onClick={() => {
                                                                                        stopCamera();
                                                                                        setUploadMode('upload');
                                                                                        toast.info('Switched to file upload mode');
                                                                                    }}
                                                                                >
                                                                                    Use Upload Instead
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Hidden canvas for photo capture */}
                                                    <canvas ref={canvasRef} className="hidden" />
                                                </div>
                                            )}

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
                                                        {previews.length < 5 && !showCamera && (
                                                            <div className="flex gap-2">
                                                                {uploadMode === 'camera' && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={startCamera}
                                                                        disabled={isCameraLoading}
                                                                    >
                                                                        {isCameraLoading ? (
                                                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-1"></div>
                                                                        ) : (
                                                                            <Camera className="h-3 w-3 mr-1" />
                                                                        )}
                                                                        {isCameraLoading ? 'Starting...' : 'Take Photo'}
                                                                    </Button>
                                                                )}
                                                                {uploadMode === 'upload' && (
                                                                    <Label 
                                                                        htmlFor="proof-images"
                                                                        className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                                                    >
                                                                        <Upload className="h-3 w-3" />
                                                                        Add More
                                                                    </Label>
                                                                )}
                                                            </div>
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
                                            disabled={processing || isSubmitting || images.length === 0 || showCamera}
                                        >
                                            {showCamera 
                                                ? 'Close camera to continue'
                                                : (processing || isSubmitting) 
                                                    ? 'Processing...' 
                                                    : 'Confirm Delivery & Release Payment'
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