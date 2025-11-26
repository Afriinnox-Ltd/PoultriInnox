import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

declare global {
    function route(name: string, params?: any): string;
}
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Building,
    MapPin,
    CreditCard,
    Camera,
    Save,
    ArrowLeft,
    Shield,
    AlertCircle,
    CheckCircle,
    Clock,
    Trash2,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface VendorProfileProps {
    vendor: {
        id: number;
        business_name: string;
        business_type: string;
        description: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        country: string;
        postal_code: string;
        website: string;
        social_media: {
            facebook?: string;
            twitter?: string;
            instagram?: string;
            linkedin?: string;
        };
        logo: string;
        banner_image: string;
        business_registration_number: string;
        tax_identification_number: string;
        bank_name: string;
        bank_account_number: string;
        bank_account_name: string;
        status: 'pending' | 'approved' | 'rejected' | 'suspended';
        is_verified: boolean;
        is_active: boolean;
        additional_info: string;
        rejection_reason?: string;
    };
    marketplaceSettings?: {
        commission: {
            default_commission_rate: number;
            commission_type: 'percentage' | 'fixed';
            min_commission_amount?: number;
            max_commission_amount?: number;
        };
        fees: {
            platform_fee_rate: number;
            transaction_fee_rate: number;
            withdrawal_fee?: number;
        };
        tax: {
            tax_rate: number;
            tax_inclusive: boolean;
        };
        payout: {
            min_payout_amount: number;
            payout_schedule: string;
            auto_payout_enabled: boolean;
        };
    };
}

export default function VendorProfile({ vendor, marketplaceSettings }: VendorProfileProps) {

    const { data, setData, put, processing, errors, isDirty } = useForm({
        business_name: vendor.business_name || '',
        business_type: vendor.business_type || '',
        description: vendor.description || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        address: vendor.address || '',
        city: vendor.city || '',
        state: vendor.state || '',
        country: vendor.country || '',
        postal_code: vendor.postal_code || '',
        website: vendor.website || '',
        facebook: vendor.social_media?.facebook || '',
        twitter: vendor.social_media?.twitter || '',
        instagram: vendor.social_media?.instagram || '',
        linkedin: vendor.social_media?.linkedin || '',
        business_registration_number: vendor.business_registration_number || '',
        tax_identification_number: vendor.tax_identification_number || '',
        bank_name: vendor.bank_name || '',
        bank_account_number: vendor.bank_account_number || '',
        bank_account_name: vendor.bank_account_name || '',
        additional_info: vendor.additional_info || '',
        logo: null as File | null,
        banner_image: null as File | null,
        _method: 'PUT',
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(vendor.logo);
    const [bannerPreview, setBannerPreview] = useState<string | null>(vendor.banner_image);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/marketplace/vendor/profile', {
            onSuccess: () => {
                // Handle success
            },
            onError: (error: Record<string, string>) => {
                // Handle error

            }
        });
    };

    const handleImageUpload = (file: File, type: 'logo' | 'banner_image') => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (type === 'logo') {
                setLogoPreview(e.target?.result as string);
                setData('logo', file);
            } else {
                setBannerPreview(e.target?.result as string);
                setData('banner_image', file);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete('/marketplace/vendor/profile', {
            onSuccess: () => {
                setShowDeleteDialog(false);
            },
            onError: () => {
                setIsDeleting(false);
            },
            onFinish: () => {
                setIsDeleting(false);
            }
        });
    };

    const getVerificationBadge = () => {
        if (vendor.is_verified) {
            return (
                <Badge className="bg-emerald-100 text-emerald-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                </Badge>
            );
        } else if (vendor.status === 'pending') {
            return (
                <Badge className="bg-yellow-100 text-yellow-800">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending Review
                </Badge>
            );
        } else if (vendor.status === 'rejected') {
            return (
                <Badge className="bg-red-100 text-red-800">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Rejected
                </Badge>
            );
        } else {
            return (
                <Badge variant="secondary">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Not Verified
                </Badge>
            );
        }
    };

    return (
        <AppLayout>
            <Head title="Vendor Profile" />

            <div className="flex gap-3 justify-between lg:flex-row flex-col lg:items-center p-6 lg:mb-6">
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
                            Vendor Profile
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage your business information and settings
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {getVerificationBadge()}
                </div>
            </div>

            <div className="py-6">
                <div className="max-w-4xl mx-auto">
                    {vendor.status === 'rejected' && (
                        <Alert className="mb-6 border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                                Your vendor application was rejected. Please review and update your information,
                                then contact support for re-evaluation.
                            </AlertDescription>
                            {vendor.rejection_reason && (
                                <div className="mt-2 text-sm text-red-700">
                                    <strong>Reason:</strong> {vendor.rejection_reason}
                                </div>
                            )}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Tabs defaultValue="business" className="space-y-6">
                            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 h-auto gap-2">
                                <TabsTrigger value="business" className="text-xs sm:text-sm">
                                    <Building className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Business Info</span>
                                </TabsTrigger>
                                <TabsTrigger value="contact" className="text-xs sm:text-sm">
                                    <MapPin className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Contact Details</span>
                                </TabsTrigger>
                                <TabsTrigger value="financial" className="text-xs sm:text-sm">
                                    <CreditCard className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Financial Info</span>
                                </TabsTrigger>
                                <TabsTrigger value="branding" className="text-xs sm:text-sm">
                                    <Camera className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Branding</span>
                                </TabsTrigger>
                                <TabsTrigger value="danger" className="text-xs sm:text-sm text-red-600 data-[state=active]:text-red-600">
                                    <Trash2 className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Danger Zone</span>
                                </TabsTrigger>
                            </TabsList>

                            {/* Business Information */}
                            <TabsContent value="business">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Building className="h-5 w-5 mr-2" />
                                            Business Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="business_name">Business Name *</Label>
                                                <Input
                                                    id="business_name"
                                                    value={data.business_name}
                                                    onChange={(e) => setData('business_name', e.target.value)}
                                                    className={errors.business_name ? 'border-red-500' : ''}
                                                />
                                                {errors.business_name && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.business_name}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="business_type">Business Type *</Label>
                                                <Select
                                                    value={data.business_type}
                                                    onValueChange={(value) => setData('business_type', value)}
                                                >
                                                    <SelectTrigger className={errors.business_type ? 'border-red-500' : ''}>
                                                        <SelectValue placeholder="Select business type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="individual">Individual/Sole Proprietorship</SelectItem>
                                                        <SelectItem value="partnership">Partnership</SelectItem>
                                                        <SelectItem value="corporation">Corporation</SelectItem>
                                                        <SelectItem value="llc">Limited Liability Company (LLC)</SelectItem>
                                                        <SelectItem value="cooperative">Cooperative</SelectItem>
                                                        <SelectItem value="nonprofit">Non-Profit Organization</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.business_type && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.business_type}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="business_registration_number">Business Registration Number</Label>
                                                <Input
                                                    id="business_registration_number"
                                                    value={data.business_registration_number}
                                                    onChange={(e) => setData('business_registration_number', e.target.value)}
                                                    className={errors.business_registration_number ? 'border-red-500' : ''}
                                                />
                                                {errors.business_registration_number && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.business_registration_number}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="tax_identification_number">Tax Identification Number</Label>
                                                <Input
                                                    id="tax_identification_number"
                                                    value={data.tax_identification_number}
                                                    onChange={(e) => setData('tax_identification_number', e.target.value)}
                                                    className={errors.tax_identification_number ? 'border-red-500' : ''}
                                                />
                                                {errors.tax_identification_number && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.tax_identification_number}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="description">Business Description *</Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                className={errors.description ? 'border-red-500' : ''}
                                                rows={4}
                                                placeholder="Describe your business, products, and services..."
                                            />
                                            {errors.description && (
                                                <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="additional_info">Additional Information</Label>
                                            <Textarea
                                                id="additional_info"
                                                value={data.additional_info}
                                                onChange={(e) => setData('additional_info', e.target.value)}
                                                rows={3}
                                                placeholder="Any additional information about your business..."
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Contact Details */}
                            <TabsContent value="contact">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <MapPin className="h-5 w-5 mr-2" />
                                            Contact Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="email">Email Address *</Label>
                                                <Input
                                                    type="email"
                                                    id="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    className={errors.email ? 'border-red-500' : ''}
                                                />
                                                {errors.email && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="phone">Phone Number *</Label>
                                                <Input
                                                    id="phone"
                                                    value={data.phone}
                                                    onChange={(e) => setData('phone', e.target.value)}
                                                    className={errors.phone ? 'border-red-500' : ''}
                                                />
                                                {errors.phone && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="address">Business Address *</Label>
                                            <Input
                                                id="address"
                                                value={data.address}
                                                onChange={(e) => setData('address', e.target.value)}
                                                className={errors.address ? 'border-red-500' : ''}
                                            />
                                            {errors.address && (
                                                <p className="text-sm text-red-500 mt-1">{errors.address}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor="city">City *</Label>
                                                <Input
                                                    id="city"
                                                    value={data.city}
                                                    onChange={(e) => setData('city', e.target.value)}
                                                    className={errors.city ? 'border-red-500' : ''}
                                                />
                                                {errors.city && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.city}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="state">State/Province</Label>
                                                <Input
                                                    id="state"
                                                    value={data.state}
                                                    onChange={(e) => setData('state', e.target.value)}
                                                    className={errors.state ? 'border-red-500' : ''}
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="country">Country *</Label>
                                                <Input
                                                    id="country"
                                                    value={data.country}
                                                    onChange={(e) => setData('country', e.target.value)}
                                                    className={errors.country ? 'border-red-500' : ''}
                                                />
                                                {errors.country && (
                                                    <p className="text-sm text-red-500 mt-1">{errors.country}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="postal_code">Postal Code</Label>
                                                <Input
                                                    id="postal_code"
                                                    value={data.postal_code}
                                                    onChange={(e) => setData('postal_code', e.target.value)}
                                                    className={errors.postal_code ? 'border-red-500' : ''}
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="website">Website</Label>
                                                <Input
                                                    id="website"
                                                    value={data.website}
                                                    onChange={(e) => setData('website', e.target.value)}
                                                    placeholder="https://www.yourwebsite.com"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="font-medium text-gray-900">Social Media (Optional)</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="facebook">Facebook</Label>
                                                    <Input
                                                        id="facebook"
                                                        value={data.facebook}
                                                        onChange={(e) => setData('facebook', e.target.value)}
                                                        placeholder="https://facebook.com/yourpage"
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="twitter">Twitter</Label>
                                                    <Input
                                                        id="twitter"
                                                        value={data.twitter}
                                                        onChange={(e) => setData('twitter', e.target.value)}
                                                        placeholder="https://twitter.com/youraccount"
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="instagram">Instagram</Label>
                                                    <Input
                                                        id="instagram"
                                                        value={data.instagram}
                                                        onChange={(e) => setData('instagram', e.target.value)}
                                                        placeholder="https://instagram.com/youraccount"
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="linkedin">LinkedIn</Label>
                                                    <Input
                                                        id="linkedin"
                                                        value={data.linkedin}
                                                        onChange={(e) => setData('linkedin', e.target.value)}
                                                        placeholder="https://linkedin.com/company/yourcompany"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Financial Information */}
                            <TabsContent value="financial">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <CreditCard className="h-5 w-5 mr-2" />
                                            Banking Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <Alert>
                                            <Shield className="h-4 w-4" />
                                            <AlertDescription>
                                                Your banking information is encrypted and securely stored. This information
                                                is required for payment processing and financial transactions.
                                            </AlertDescription>
                                        </Alert>

                                        <div>
                                            <Label htmlFor="bank_name">Bank Name *</Label>
                                            <Input
                                                id="bank_name"
                                                value={data.bank_name}
                                                onChange={(e) => setData('bank_name', e.target.value)}
                                                className={errors.bank_name ? 'border-red-500' : ''}
                                            />
                                            {errors.bank_name && (
                                                <p className="text-sm text-red-500 mt-1">{errors.bank_name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="bank_account_name">Account Holder Name *</Label>
                                            <Input
                                                id="bank_account_name"
                                                value={data.bank_account_name}
                                                onChange={(e) => setData('bank_account_name', e.target.value)}
                                                className={errors.bank_account_name ? 'border-red-500' : ''}
                                            />
                                            {errors.bank_account_name && (
                                                <p className="text-sm text-red-500 mt-1">{errors.bank_account_name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="bank_account_number">Account Number *</Label>
                                            <Input
                                                type="password"
                                                id="bank_account_number"
                                                value={data.bank_account_number}
                                                onChange={(e) => setData('bank_account_number', e.target.value)}
                                                className={errors.bank_account_number ? 'border-red-500' : ''}
                                                placeholder="••••••••••••"
                                            />
                                            {errors.bank_account_number && (
                                                <p className="text-sm text-red-500 mt-1">{errors.bank_account_number}</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Branding */}
                            <TabsContent value="branding">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Camera className="h-5 w-5 mr-2" />
                                            Branding & Images
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Logo Upload */}
                                            <div>
                                                <Label>Business Logo</Label>
                                                <div className="mt-2 space-y-3">
                                                    {logoPreview && (
                                                        <div className="w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden">
                                                            <img
                                                                src={logoPreview}
                                                                alt="Logo preview"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    handleImageUpload(file, 'logo');
                                                                }
                                                            }}
                                                            className="hidden"
                                                            id="logo-upload"
                                                        />
                                                        <Label
                                                            htmlFor="logo-upload"
                                                            className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                                        >
                                                            <Camera className="h-4 w-4 mr-2" />
                                                            Upload Logo
                                                        </Label>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Recommended: 200x200px, PNG or JPG
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Banner Upload */}
                                            <div>
                                                <Label>Banner Image</Label>
                                                <div className="mt-2 space-y-3">
                                                    {bannerPreview && (
                                                        <div className="w-full h-32 border-2 border-gray-200 rounded-lg overflow-hidden">
                                                            <img
                                                                src={bannerPreview}
                                                                alt="Banner preview"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    handleImageUpload(file, 'banner_image');
                                                                }
                                                            }}
                                                            className="hidden"
                                                            id="banner-upload"
                                                        />
                                                        <Label
                                                            htmlFor="banner-upload"
                                                            className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                                        >
                                                            <Camera className="h-4 w-4 mr-2" />
                                                            Upload Banner
                                                        </Label>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Recommended: 1200x400px, PNG or JPG
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Danger Zone Tab */}
                            <TabsContent value="danger">
                                <Card className="border-red-200">
                                    <CardHeader className="">
                                        <CardTitle className="flex items-center text-red-800">
                                            <AlertCircle className="h-5 w-5 mr-2" />
                                            Danger Zone
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6 pt-6">
                                        <Alert className="border-yellow-200 bg-yellow-50">
                                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                                            <AlertDescription className="text-yellow-800">
                                                <strong>Warning:</strong> Actions in this section are permanent and cannot be undone.
                                                Please proceed with caution.
                                            </AlertDescription>
                                        </Alert>

                                        <div className="space-y-4">
                                            <div className="border border-red-200 rounded-lg p-4 sm:p-6 bg-red-50/50">
                                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                                    <div className="space-y-2">
                                                        <h3 className="font-semibold text-lg text-red-800">Delete Vendor Store</h3>
                                                        <p className="text-sm text-gray-700">
                                                            Permanently delete your vendor store and all associated data.
                                                        </p>
                                                        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                                                            <li>All your products will be deleted</li>
                                                            <li>Your subscription will be cancelled</li>
                                                            <li>All store data will be permanently removed</li>
                                                            <li>You'll need to re-register to become a vendor again</li>
                                                        </ul>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        onClick={() => setShowDeleteDialog(true)}
                                                        className="w-full sm:w-auto min-w-[140px]"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete Store
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>

                        {/* Save Button */}
                        <div className="flex justify-end pt-6">
                            <Button
                                type="submit"
                                disabled={processing || !isDirty}
                                className="min-w-[120px]"
                            >
                                {processing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>

                    {/* Delete Confirmation Dialog */}
                    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Are you absolutely sure?</DialogTitle>
                                <DialogDescription>
                                    This action cannot be undone. This will permanently delete your vendor store,
                                    all your products, and remove all associated data. You will need to re-register
                                    if you want to become a vendor again.
                                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                        <p className="text-sm font-medium text-red-800">
                                            ⚠️ Warning: Make sure you have no pending orders before deleting your store.
                                        </p>
                                    </div>
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDeleteDialog(false)}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete Store'
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AppLayout>
    );
}
