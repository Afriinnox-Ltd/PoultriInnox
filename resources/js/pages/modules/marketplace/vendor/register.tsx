import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    Store,
    FileText,
    Mail,
    Phone,
    MapPin,
    Globe,
    CreditCard,
    Shield,
    CheckCircle,
    AlertCircle,
    Upload,
    X
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VendorRegistrationProps {
    user: {
        id: number;
        name: string;
        email: string;
    };
    existing_application?: {
        id: number;
        business_name: string;
        business_description?: string;
        business_address?: string;
        business_phone?: string;
        business_email?: string;
        business_website?: string;
        tax_number?: string;
        status: 'pending' | 'approved' | 'rejected' | 'suspended';
        is_verified: boolean;
        created_at: string;
    };
}

export default function VendorRegistration({ user, existing_application }: VendorRegistrationProps) {
    const [formData, setFormData] = useState({
        business_name: existing_application?.business_name || '',
        business_registration_number: '',
        business_type: '',
        business_description: existing_application?.business_description || '',
        business_address: existing_application?.business_address || '',
        business_phone: existing_application?.business_phone || '',
        business_email: existing_application?.business_email || user?.email,
        business_website: existing_application?.business_website || '',
        bank_name: '',
        bank_account_number: '',
        bank_account_name: '',
        bank_branch: '',
        tax_number: existing_application?.tax_number || '',
        years_in_business: '',
        specializations: ''
    });

    const [business_documents, setBusinessDocuments] = useState<File[]>([]);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const newFiles = Array.from(files).filter(file => {
                // Validate file type and size
                const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
                const maxSize = 5 * 1024 * 1024; // 5MB

                if (!validTypes.includes(file.type)) {
                    alert(`${file.name} is not a valid file type. Please upload PDF, JPG, or PNG files.`);
                    return false;
                }

                if (file.size > maxSize) {
                    alert(`${file.name} is too large. Please upload files smaller than 5MB.`);
                    return false;
                }

                return true;
            });

            setBusinessDocuments(prev => [...prev, ...newFiles]);
        }
    };

    const removeDocument = (index: number) => {
        setBusinessDocuments(prev => prev.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.business_name.trim()) {
            newErrors.business_name = 'Business name is required';
        }

        if (!formData.business_registration_number.trim()) {
            newErrors.business_registration_number = 'Business registration number is required';
        }

        if (!formData.business_type) {
            newErrors.business_type = 'Business type is required';
        }

        if (!formData.business_description.trim()) {
            newErrors.business_description = 'Business description is required';
        }

        if (!formData.business_address.trim()) {
            newErrors.business_address = 'Business address is required';
        }

        if (!formData.business_phone.trim()) {
            newErrors.business_phone = 'Business phone is required';
        }

        if (!formData.business_email.trim()) {
            newErrors.business_email = 'Business email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.business_email)) {
            newErrors.business_email = 'Please enter a valid email address';
        }

        if (!formData.bank_name.trim()) {
            newErrors.bank_name = 'Bank name is required';
        }

        if (!formData.bank_account_number.trim()) {
            newErrors.bank_account_number = 'Bank account number is required';
        }

        if (!formData.bank_account_name.trim()) {
            newErrors.bank_account_name = 'Bank account name is required';
        }

        if (business_documents.length === 0) {
            newErrors.business_documents = 'At least one verification document is required';
        }

        if (!agreeToTerms) {
            newErrors.terms = 'You must agree to the terms and conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const formDataToSend = new FormData();

            // Add form fields
            Object.entries(formData).forEach(([key, value]) => {
                formDataToSend.append(key, value);
            });

            // Add documents
            business_documents.forEach((file, index) => {
                formDataToSend.append(`business_documents[${index}]`, file);
            });

            router.post('/marketplace/vendor/register', formDataToSend , {
                onSuccess: (response) => {
                    toast.success("Registration successful! Your application is under review.")
                },
                onError:(error) =>{ 
                    toast.error(error.message || 'An error occurred. Please try again.');
                }
            })
        } catch (error) {
            console.error('Error submitting application:', error);
            toast.error('An error occurred while submitting your application. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (existing_application && existing_application.status === 'pending') {
        return (
            <AppLayout >
                <Head title="Vendor Application - Pending" />
             <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Vendor Application Status
                    </h2>
                <div className="py-12">
                    <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                        <Card>
                            <CardContent className="p-8 text-center">
                                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="h-8 w-8 text-yellow-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    Application Under Review
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Your vendor application has been submitted and is currently under review.
                                    We'll notify you via email once we've made a decision.
                                </p>
                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <h4 className="font-semibold mb-2">Application Details:</h4>
                                    <div className="text-left space-y-1">
                                        <p><strong>Business Name:</strong> {existing_application.business_name}</p>
                                        <p><strong>Submitted:</strong> {new Date(existing_application.created_at).toLocaleDateString()}</p>
                                        <p><strong>Status:</strong>
                                            <Badge className="ml-2" variant="secondary">
                                                {existing_application.status.charAt(0).toUpperCase() + existing_application.status.slice(1)}
                                            </Badge>
                                        </p>
                                    </div>
                                </div>
                                <Button onClick={() => window.location.href = '/marketplace'}>
                                    Continue Shopping
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (existing_application && existing_application.status === 'approved') {
        return (
            <AppLayout
            >
                <Head title="Vendor Dashboard" />

                <div className="py-12">
                    <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                        <Card>
                            <CardContent className="p-8 text-center">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    Welcome, Vendor!
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Your vendor account has been verified. You can now start selling on our marketplace.
                                </p>
                                <div className="flex gap-4 justify-center">
                                    <Button onClick={() => window.location.href = '/marketplace/vendor/dashboard'}>
                                        Go to Dashboard
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => window.location.href = '/marketplace/vendor/products/create'}
                                    >
                                        Add First Product
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout
        >
            <Head title="Vendor Registration" />
            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <Card className="mb-8 bg-emerald-500">
                        <CardContent className="p-6">
                            <div className="text-center">
                                <Store className="h-12 w-12 text-white mx-auto mb-4" />
                                <h1 className="text-2xl font-bold text-white mb-2">
                                    Join Our Marketplace
                                </h1>
                                <p className="text-emerald-100  mb-4">
                                    Start selling your poultry equipment and supplies to thousands of customers
                                </p>
                                <div className="grid grid-cols-1 text-emerald-100 md:grid-cols-3 gap-4">
                                    <div className="flex items-center justify-center">
                                        <CheckCircle className="h-5 w-5 text-emerald-100 mr-2" />
                                        <span className="text-sm">No Setup Fees</span>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <CheckCircle className="h-5 w-5 text-emerald-100 mr-2" />
                                        <span className="text-sm">Marketing Support</span>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <CheckCircle className="h-5 w-5 text-emerald-100 mr-2" />
                                        <span className="text-sm">24/7 Customer Support</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Business Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Store className="h-5 w-5 mr-2" />
                                    Business Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="business_name">Business Name *</Label>
                                        <Input
                                            id="business_name"
                                            value={formData.business_name}
                                            onChange={(e) => handleInputChange('business_name', e.target.value)}
                                            placeholder="Your business name"
                                            className={errors.business_name ? 'border-red-500' : ''}
                                        />
                                        {errors.business_name && (
                                            <p className="text-red-500 text-sm mt-1">{errors.business_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="business_registration_number">Business Registration Number *</Label>
                                        <Input
                                            id="business_registration_number"
                                            value={formData.business_registration_number}
                                            onChange={(e) => handleInputChange('business_registration_number', e.target.value)}
                                            placeholder="Business registration number"
                                            className={errors.business_registration_number ? 'border-red-500' : ''}
                                        />
                                        {errors.business_registration_number && (
                                            <p className="text-red-500 text-sm mt-1">{errors.business_registration_number}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="business_type">Business Type *</Label>
                                        <Select
                                            value={formData.business_type}
                                            onValueChange={(value) => handleInputChange('business_type', value)}
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

                                    <div>
                                        <Label htmlFor="years_in_business">Years in Business</Label>
                                        <Input
                                            id="years_in_business"
                                            type="number"
                                            min="0"
                                            value={formData.years_in_business}
                                            onChange={(e) => handleInputChange('years_in_business', e.target.value)}
                                            placeholder="Number of years"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <div>
                                        <Label htmlFor="specializations">Specializations</Label>
                                        <Input
                                            id="specializations"
                                            value={formData.specializations}
                                            onChange={(e) => handleInputChange('specializations', e.target.value)}
                                            placeholder="e.g., Poultry equipment, Feed supplies"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="business_description">Business Description *</Label>
                                    <Textarea
                                        id="business_description"
                                        value={formData.business_description}
                                        onChange={(e) => handleInputChange('business_description', e.target.value)}
                                        placeholder="Describe your business, products, and services..."
                                        rows={4}
                                        className={errors.business_description ? 'border-red-500' : ''}
                                    />
                                    {errors.business_description && (
                                        <p className="text-red-500 text-sm mt-1">{errors.business_description}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="business_address">Business Address *</Label>
                                    <Textarea
                                        id="business_address"
                                        value={formData.business_address}
                                        onChange={(e) => handleInputChange('business_address', e.target.value)}
                                        placeholder="Complete business address including city, state, and postal code"
                                        rows={3}
                                        className={errors.business_address ? 'border-red-500' : ''}
                                    />
                                    {errors.business_address && (
                                        <p className="text-red-500 text-sm mt-1">{errors.business_address}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Phone className="h-5 w-5 mr-2" />
                                    Contact Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="business_phone">Business Phone *</Label>
                                        <Input
                                            id="business_phone"
                                            type="tel"
                                            value={formData.business_phone}
                                            onChange={(e) => handleInputChange('business_phone', e.target.value)}
                                            placeholder="+1 (555) 123-4567"
                                            className={errors.business_phone ? 'border-red-500' : ''}
                                        />
                                        {errors.business_phone && (
                                            <p className="text-red-500 text-sm mt-1">{errors.business_phone}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="business_email">Business Email *</Label>
                                        <Input
                                            id="business_email"
                                            type="email"
                                            value={formData.business_email}
                                            onChange={(e) => handleInputChange('business_email', e.target.value)}
                                            placeholder="business@example.com"
                                            className={errors.business_email ? 'border-red-500' : ''}
                                        />
                                        {errors.business_email && (
                                            <p className="text-red-500 text-sm mt-1">{errors.business_email}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="business_website">Business Website</Label>
                                    <Input
                                        id="business_website"
                                        type="url"
                                        value={formData.business_website}
                                        onChange={(e) => handleInputChange('business_website', e.target.value)}
                                        placeholder="https://www.yourbusiness.com"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Banking Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <CreditCard className="h-5 w-5 mr-2" />
                                    Banking Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="bank_name">Bank Name *</Label>
                                        <Input
                                            id="bank_name"
                                            value={formData.bank_name}
                                            onChange={(e) => handleInputChange('bank_name', e.target.value)}
                                            placeholder="Name of your bank"
                                            className={errors.bank_name ? 'border-red-500' : ''}
                                        />
                                        {errors.bank_name && (
                                            <p className="text-red-500 text-sm mt-1">{errors.bank_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="bank_account_number">Account Number *</Label>
                                        <Input
                                            id="bank_account_number"
                                            value={formData.bank_account_number}
                                            onChange={(e) => handleInputChange('bank_account_number', e.target.value)}
                                            placeholder="Your bank account number"
                                            className={errors.bank_account_number ? 'border-red-500' : ''}
                                        />
                                        {errors.bank_account_number && (
                                            <p className="text-red-500 text-sm mt-1">{errors.bank_account_number}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="bank_account_name">Account Name *</Label>
                                        <Input
                                            id="bank_account_name"
                                            value={formData.bank_account_name}
                                            onChange={(e) => handleInputChange('bank_account_name', e.target.value)}
                                            placeholder="Account holder name"
                                            className={errors.bank_account_name ? 'border-red-500' : ''}
                                        />
                                        {errors.bank_account_name && (
                                            <p className="text-red-500 text-sm mt-1">{errors.bank_account_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="bank_branch">Bank Branch</Label>
                                        <Input
                                            id="bank_branch"
                                            value={formData.bank_branch}
                                            onChange={(e) => handleInputChange('bank_branch', e.target.value)}
                                            placeholder="Branch name or code"
                                        />
                                    </div>
                                </div>

                                <p className="text-xs text-gray-500">
                                    This information is required for payment processing and will be securely stored.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Document Upload */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <FileText className="h-5 w-5 mr-2" />
                                    Verification Documents
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="documents">Upload Verification Documents <span className="text-red-500">*</span></Label>
                                    <div className="mt-2">
                                        <label htmlFor="file-upload" className="cursor-pointer">
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                <p className="text-sm text-gray-600">
                                                    Click to upload or drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    PDF, JPG, PNG up to 5MB each
                                                </p>
                                            </div>
                                            <input
                                                id="file-upload"
                                                type="file"
                                                multiple
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={handleFileUpload}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>

                                    {business_documents.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <p className="text-sm font-medium">Uploaded Documents:</p>
                                            {business_documents.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                    <span className="text-sm">{file.name}</span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeDocument(index)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {errors.business_documents && (
                                        <p className="text-sm text-red-500">{errors.business_documents}</p>
                                    )}

                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <p className="text-sm text-green-700">
                                            <strong>Helpful documents to include:</strong>
                                        </p>
                                        <ul className="text-xs text-green-600 mt-1 list-disc list-inside">
                                            <li>Business license or registration</li>
                                            <li>Tax identification documents</li>
                                            <li>Product catalogs or brochures</li>
                                            <li>Certifications or quality standards</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Terms and Submit */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-2">
                                        <Checkbox
                                            id="terms"
                                            checked={agreeToTerms}
                                            onCheckedChange={checked => setAgreeToTerms(checked === true)}
                                            className={errors.terms ? 'border-red-500' : ''}
                                        />
                                        <div className="text-sm">
                                            <Label htmlFor="terms" className="cursor-pointer">
                                                I agree to the{' '}
                                                <a href="/terms" target="_blank" className="text-green-600 hover:underline">
                                                    Terms of Service
                                                </a>{' '}
                                                and{' '}
                                                <a href="/privacy" target="_blank" className="text-green-600 hover:underline">
                                                    Privacy Policy
                                                </a>
                                                , and understand that my application will be reviewed before approval.
                                            </Label>
                                        </div>
                                    </div>
                                    {errors.terms && (
                                        <p className="text-red-500 text-sm">{errors.terms}</p>
                                    )}

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center text-gray-700 mb-2">
                                            <Shield className="h-4 w-4 mr-2" />
                                            <span className="text-sm font-medium">What happens next?</span>
                                        </div>
                                        <ul className="text-xs text-gray-600 space-y-1">
                                            <li>• Your application will be reviewed within 2-3 business days</li>
                                            <li>• We may contact you for additional information</li>
                                            <li>• Once approved, you'll receive access to your vendor dashboard</li>
                                            <li>• You can immediately start adding products and managing orders</li>
                                        </ul>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        size="lg"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                Submitting Application...
                                            </>
                                        ) : (
                                            'Submit Vendor Application'
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
