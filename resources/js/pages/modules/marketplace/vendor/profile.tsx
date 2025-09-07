import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    User,
    Building,
    MapPin,
    Globe,
    Phone,
    Mail,
    CreditCard,
    FileText,
    Camera,
    Save,
    ArrowLeft,
    Shield,
    AlertCircle,
    CheckCircle,
    Clock
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
}

export default function VendorProfile({ vendor }: VendorProfileProps) {
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
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(vendor.logo);
    const [bannerPreview, setBannerPreview] = useState<string | null>(vendor.banner_image);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('marketplace.vendor.profile.update'), {
            onSuccess: () => {
                // Handle success
            },
        });
    };

    const handleImageUpload = (file: File, type: 'logo' | 'banner') => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (type === 'logo') {
                setLogoPreview(e.target?.result as string);
                setData('logo' as any, file);
            } else {
                setBannerPreview(e.target?.result as string);
                setData('banner_image' as any, file);
            }
        };
        reader.readAsDataURL(file);
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
                    <Badge variant={vendor.is_active ? 'default' : 'secondary'}>
                        {vendor.is_active ? 'Active' : 'Inactive'}
                    </Badge>
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
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="business">Business Info</TabsTrigger>
                                <TabsTrigger value="contact">Contact Details</TabsTrigger>
                                <TabsTrigger value="financial">Financial Info</TabsTrigger>
                                <TabsTrigger value="branding">Branding</TabsTrigger>
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
                                                                    handleImageUpload(file, 'banner');
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
                </div>
            </div>
        </AppLayout>
    );
}
