import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Store,
    FileText,
    Phone,

    Shield,
    Upload,
    X,
    User
} from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import WelcomeNav from '@/components/navigation/WelcomeNav';
import { type SharedData } from '@/types';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';

export default function PublicVendorRegistration() {
    const { auth } = usePage<SharedData>().props;

    const [formData, setFormData] = useState({
        // User Details
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',

        // Business Details
        business_name: '',
        business_registration_number: '',
        business_type: '',
        business_description: '',
        business_address: '',
        business_phone: '',
        business_email: '',
        business_website: '',


        // Additional Info
        tax_number: '',
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
                    toast.error(`${file.name} is not a valid file type. Please upload PDF, JPG, or PNG files.`);
                    return false;
                }

                if (file.size > maxSize) {
                    toast.error(`${file.name} is too large. Please upload files smaller than 5MB.`);
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

        // User Validation
        if (!formData.name.trim()) newErrors.name = 'Full name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.password) newErrors.password = 'Password is required';
        if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (formData.password !== formData.password_confirmation) newErrors.password_confirmation = 'Passwords do not match';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

        // Business Validation
        if (!formData.business_name.trim()) newErrors.business_name = 'Business name is required';
        if (!formData.business_registration_number.trim()) newErrors.business_registration_number = 'Registration number is required';
        if (!formData.business_type) newErrors.business_type = 'Business type is required';
        if (!formData.business_description.trim()) newErrors.business_description = 'Description is required';
        if (!formData.business_address.trim()) newErrors.business_address = 'Address is required';
        if (!formData.business_phone.trim()) newErrors.business_phone = 'Business phone is required';
        if (!formData.business_email.trim()) {
            newErrors.business_email = 'Business email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.business_email)) {
            newErrors.business_email = 'Please enter a valid email address';
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
            window.scrollTo({ top: 0, behavior: 'smooth' });
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

            formDataToSend.append('terms', '1');

            router.post('/vendor/register', formDataToSend, {
                onSuccess: () => {
                    toast.success("Registration successful! Your application is under review.");
                },
                onError: (errors) => {
                    console.error("Submission errors:", errors);
                    setErrors(errors as Record<string, string>);

                    if (errors.message) {
                        toast.error(errors.message);
                    } else {
                        toast.error('Please fix the errors in the form.');
                    }

                    window.scrollTo({ top: 0, behavior: 'smooth' });
                },
                onFinish: () => {
                    setIsSubmitting(false);
                }
            });
        } catch (error) {

            toast.error('An error occurred while submitting your application.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Become a Vendor" />
            <WelcomeNav auth={auth} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <Card className="mb-8 bg-emerald-600 border-none shadow-lg">
                        <CardContent className="p-8 text-center text-white">
                            <Store className="h-16 w-16 mx-auto mb-6 text-emerald-100" />
                            <h1 className="text-3xl font-bold mb-4">
                                Join Our Marketplace
                            </h1>
                            <p className="text-emerald-100 text-lg max-w-2xl mx-auto mb-8">
                                Complete your registration to create your account and vendor profile in one step.
                                Start selling your Livestock Equipment and supplies today!
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-sm font-medium">
                                <div className="bg-emerald-700/50 p-3 rounded-lg backdrop-blur-sm">
                                    ✓ Create User Account
                                </div>
                                <div className="bg-emerald-700/50 p-3 rounded-lg backdrop-blur-sm">
                                    ✓ Setup Vendor Profile
                                </div>
                                <div className="bg-emerald-700/50 p-3 rounded-lg backdrop-blur-sm">
                                    ✓ Start Selling
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* User Account Information */}
                        <Card className="shadow-md border-gray-200">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                                <CardTitle className="flex items-center text-xl text-gray-800">
                                    <User className="h-6 w-6 mr-3 text-emerald-600" />
                                    1. User Account Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="name">Full Name *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            placeholder="John Doe"
                                            className={errors.name ? 'border-red-500' : ''}
                                        />
                                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="phone">Personal Phone *</Label>
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            placeholder="+250..."
                                            className={errors.phone ? 'border-red-500' : ''}
                                        />
                                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                                    </div>

                                    <div className="md:col-span-2">
                                        <Label htmlFor="email">Email Address *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            placeholder="john@example.com"
                                            autoComplete="username"
                                            className={errors.email ? 'border-red-500' : ''}
                                        />
                                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="password">Password *</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => handleInputChange('password', e.target.value)}
                                            placeholder="••••••••"
                                            autoComplete="new-password"
                                            className={errors.password ? 'border-red-500' : ''}
                                        />
                                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="password_confirmation">Confirm Password *</Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            value={formData.password_confirmation}
                                            onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
                                            placeholder="••••••••"
                                            autoComplete="new-password"
                                            className={errors.password_confirmation ? 'border-red-500' : ''}
                                        />
                                        {errors.password_confirmation && <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Business Information */}
                        <Card className="shadow-md border-gray-200">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                                <CardTitle className="flex items-center text-xl text-gray-800">
                                    <Store className="h-6 w-6 mr-3 text-emerald-600" />
                                    2. Business Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="business_name">Business Name *</Label>
                                        <Input
                                            id="business_name"
                                            value={formData.business_name}
                                            onChange={(e) => handleInputChange('business_name', e.target.value)}
                                            placeholder="My Farm Store"
                                            className={errors.business_name ? 'border-red-500' : ''}
                                        />
                                        {errors.business_name && <p className="text-red-500 text-sm mt-1">{errors.business_name}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="business_registration_number">Registration Number *</Label>
                                        <Input
                                            id="business_registration_number"
                                            value={formData.business_registration_number}
                                            onChange={(e) => handleInputChange('business_registration_number', e.target.value)}
                                            placeholder="Reg. No."
                                            className={errors.business_registration_number ? 'border-red-500' : ''}
                                        />
                                        {errors.business_registration_number && <p className="text-red-500 text-sm mt-1">{errors.business_registration_number}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="business_type">Business Type *</Label>
                                        <Select value={formData.business_type} onValueChange={(value) => handleInputChange('business_type', value)}>
                                            <SelectTrigger className={errors.business_type ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="individual">Individual/Sole Proprietorship</SelectItem>
                                                <SelectItem value="partnership">Partnership</SelectItem>
                                                <SelectItem value="corporation">Corporation</SelectItem>
                                                <SelectItem value="llc">LLC</SelectItem>
                                                <SelectItem value="cooperative">Cooperative</SelectItem>
                                                <SelectItem value="nonprofit">Non-Profit</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.business_type && <p className="text-red-500 text-sm mt-1">{errors.business_type}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="years_in_business">Years in Business</Label>
                                        <Input
                                            id="years_in_business"
                                            type="number"
                                            min="0"
                                            value={formData.years_in_business}
                                            onChange={(e) => handleInputChange('years_in_business', e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="business_description">Business Description *</Label>
                                    <Textarea
                                        id="business_description"
                                        value={formData.business_description}
                                        onChange={(e) => handleInputChange('business_description', e.target.value)}
                                        placeholder="Tell us about your business..."
                                        rows={4}
                                        className={errors.business_description ? 'border-red-500' : ''}
                                    />
                                    {errors.business_description && <p className="text-red-500 text-sm mt-1">{errors.business_description}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="business_address">Business Address *</Label>
                                    <Textarea
                                        id="business_address"
                                        value={formData.business_address}
                                        onChange={(e) => handleInputChange('business_address', e.target.value)}
                                        placeholder="Full address"
                                        rows={3}
                                        className={errors.business_address ? 'border-red-500' : ''}
                                    />
                                    {errors.business_address && <p className="text-red-500 text-sm mt-1">{errors.business_address}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Information */}
                        <Card className="shadow-md border-gray-200">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                                <CardTitle className="flex items-center text-xl text-gray-800">
                                    <Phone className="h-6 w-6 mr-3 text-emerald-600" />
                                    3. Contact Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="business_phone">Business Phone *</Label>
                                        <Input
                                            id="business_phone"
                                            value={formData.business_phone}
                                            onChange={(e) => handleInputChange('business_phone', e.target.value)}
                                            placeholder="+250..."
                                            className={errors.business_phone ? 'border-red-500' : ''}
                                        />
                                        {errors.business_phone && <p className="text-red-500 text-sm mt-1">{errors.business_phone}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="business_email">Business Email *</Label>
                                        <Input
                                            id="business_email"
                                            type="email"
                                            value={formData.business_email}
                                            onChange={(e) => handleInputChange('business_email', e.target.value)}
                                            placeholder="store@example.com"
                                            className={errors.business_email ? 'border-red-500' : ''}
                                        />
                                        {errors.business_email && <p className="text-red-500 text-sm mt-1">{errors.business_email}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label htmlFor="business_website">Website (Optional)</Label>
                                        <Input
                                            id="business_website"
                                            value={formData.business_website}
                                            onChange={(e) => handleInputChange('business_website', e.target.value)}
                                            placeholder="https://"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Documents */}
                        <Card className="shadow-md border-gray-200">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                                <CardTitle className="flex items-center text-xl text-gray-800">
                                    <FileText className="h-6 w-6 mr-3 text-emerald-600" />
                                    4. Verification Documents
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <Label>Upload Official Documents *</Label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-500 transition-colors cursor-pointer bg-gray-50 hover:bg-emerald-50/50">
                                        <label htmlFor="file-upload" className="cursor-pointer w-full h-full block">
                                            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                                            <p className="text-sm font-medium text-gray-700">
                                                Click to upload or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Business registration, Tax ID, etc. (PDF, JPG, PNG)
                                            </p>
                                        </label>
                                        <input
                                            id="file-upload"
                                            type="file"
                                            multiple
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                    </div>

                                    {business_documents.length > 0 && (
                                        <div className="grid grid-cols-1 gap-2 mt-4">
                                            {business_documents.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-md shadow-sm">
                                                    <span className="text-sm truncate max-w-[80%]">{file.name}</span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeDocument(index)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {errors.business_documents && <p className="text-red-500 text-sm">{errors.business_documents}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Terms */}
                        <div className="space-y-6">
                            <div className="flex items-start">
                                <Checkbox
                                    id="terms"
                                    checked={agreeToTerms}
                                    onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                                    className={errors.terms ? 'border-red-500 mt-1' : 'mt-1'}
                                />
                                <Label htmlFor="terms" className="ml-3 text-sm text-gray-600 leading-relaxed cursor-pointer">
                                    I agree to the <a href="#" className="text-emerald-600 hover:underline">Terms of Service</a> and <a href="#" className="text-emerald-600 hover:underline">Privacy Policy</a>.
                                    I understand that my application will be reviewed and I agree to provide accurate information.
                                </Label>
                            </div>
                            {errors.terms && <p className="text-red-500 text-sm pl-7">{errors.terms}</p>}

                            <Button
                                type="submit"
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 text-lg h-auto shadow-lg hover:shadow-xl transition-all"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Creating Account & Submitting Application...' : 'Create Account & Apply'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div >
            <Toaster position="bottom-right" richColors />
        </div >
    );
}
