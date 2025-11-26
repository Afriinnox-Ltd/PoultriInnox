import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, X, Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Vendor {
    id: number;
    user_id: number;
    business_name: string;
    business_type: string | null;
    business_description: string | null;
    description: string | null;
    logo: string | null;
    phone: string;
    email: string;
    website: string | null;
    address: string | null;
    business_address: string | null;
    business_phone: string | null;
    business_email: string | null;
    business_website: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    business_registration_number: string | null;
    bank_name: string | null;
    bank_account_number: string | null;
    bank_account_name: string | null;
    bank_branch: string | null;
    tax_id: string | null;
    tax_number: string | null;
    years_in_business: number | null;
    commission_rate: number | null;
    status: string;
    is_verified: boolean;
    is_active: boolean;
    additional_info: string | null;
    admin_notes: string | null;
    user: { id: number; name: string; email: string };
}

interface Props {
    vendor: Vendor;
}

export default function Edit({ vendor }: Props) {
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm<{
        _method: string;
        business_name: string;
        business_type: string;
        business_description: string;
        business_email: string;
        business_phone: string;
        business_website: string;
        business_address: string;
        business_registration_number: string;
        city: string;
        state: string;
        country: string;
        postal_code: string;
        bank_name: string;
        bank_account_number: string;
        bank_account_name: string;
        bank_branch: string;
        tax_id: string;
        commission_rate: string;
        years_in_business: string;
        status: string;
        is_verified: boolean;
        is_active: boolean;
        additional_info: string;
        admin_notes: string;
        logo: File | null;
        remove_logo: boolean;
    }>({
        _method: 'PUT',
        business_name: vendor.business_name || '',
        business_type: vendor.business_type || '',
        business_description: vendor.business_description || vendor.description || '',
        business_email: vendor.business_email || vendor.email || '',
        business_phone: vendor.business_phone || vendor.phone || '',
        business_website: vendor.business_website || vendor.website || '',
        business_address: vendor.business_address || vendor.address || '',
        business_registration_number: vendor.business_registration_number || '',
        city: vendor.city || '',
        state: vendor.state || '',
        country: vendor.country || '',
        postal_code: vendor.postal_code || '',
        bank_name: vendor.bank_name || '',
        bank_account_number: vendor.bank_account_number || '',
        bank_account_name: vendor.bank_account_name || '',
        bank_branch: vendor.bank_branch || '',
        tax_id: vendor.tax_id || vendor.tax_number || '',
        commission_rate: vendor.commission_rate != null ? String(vendor.commission_rate) : '',
        years_in_business: vendor.years_in_business != null ? String(vendor.years_in_business) : '',
        status: vendor.status || 'pending',
        is_verified: !!vendor.is_verified,
        is_active: !!vendor.is_active,
        additional_info: vendor.additional_info || '',
        admin_notes: vendor.admin_notes || '',
        logo: null,
        remove_logo: false,
    });

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Logo must be under 2MB');
                return;
            }
            setData('logo', file);
            setData('remove_logo', false);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/marketplace/vendors/${vendor.id}`, {
            forceFormData: true,
            onSuccess: () => toast.success('Vendor updated successfully'),
            onError: () => toast.error('Please fix the errors below'),
        });
    };

    return (
        <AdminLayout>
            <Head title={`Edit: ${vendor.business_name}`} />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/admin/marketplace/vendors/${vendor.id}`}>
                            <Button type="button" variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Edit Vendor</h1>
                            <p className="text-muted-foreground text-sm">{vendor.business_name} &middot; {vendor.user?.name}</p>
                        </div>
                    </div>
                    <Button type="submit" disabled={processing}>
                        <Save className="h-4 w-4 mr-1" /> {processing ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>

                <Tabs defaultValue="business">
                    <TabsList>
                        <TabsTrigger value="business">Business Info</TabsTrigger>
                        <TabsTrigger value="contact">Contact & Address</TabsTrigger>
                        <TabsTrigger value="banking">Banking & Legal</TabsTrigger>
                        <TabsTrigger value="admin">Admin Settings</TabsTrigger>
                    </TabsList>

                    {/* Business Info */}
                    <TabsContent value="business">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2">
                                <CardHeader><CardTitle>Business Details</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="business_name">Business Name *</Label>
                                        <Input id="business_name" value={data.business_name} onChange={e => setData('business_name', e.target.value)} />
                                        {errors.business_name && <p className="text-sm text-destructive mt-1">{errors.business_name}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="business_type">Business Type</Label>
                                            <Input id="business_type" value={data.business_type} onChange={e => setData('business_type', e.target.value)} placeholder="e.g. Poultry Farm, Feed Supplier" />
                                        </div>
                                        <div>
                                            <Label htmlFor="years_in_business">Years in Business</Label>
                                            <Input id="years_in_business" type="number" min="0" value={data.years_in_business} onChange={e => setData('years_in_business', e.target.value)} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="business_registration_number">Registration Number</Label>
                                        <Input id="business_registration_number" value={data.business_registration_number} onChange={e => setData('business_registration_number', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label htmlFor="business_description">Description</Label>
                                        <Textarea id="business_description" value={data.business_description} onChange={e => setData('business_description', e.target.value)} rows={5} />
                                    </div>
                                    <div>
                                        <Label htmlFor="additional_info">Additional Information</Label>
                                        <Textarea id="additional_info" value={data.additional_info} onChange={e => setData('additional_info', e.target.value)} rows={3} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Logo */}
                            <Card>
                                <CardHeader><CardTitle>Logo</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-col items-center gap-3">
                                        {(logoPreview || (vendor.logo && !data.remove_logo)) && (
                                            <div className="relative">
                                                <img src={logoPreview || vendor.logo || ''} alt="Logo" className="h-32 w-32 rounded-full object-cover border" />
                                                <button type="button" onClick={() => {
                                                    setData('remove_logo', true);
                                                    setData('logo', null);
                                                    setLogoPreview(null);
                                                }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        )}
                                        {data.remove_logo && !logoPreview && (
                                            <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center">
                                                <span className="text-xs text-muted-foreground">Removed</span>
                                            </div>
                                        )}
                                        <label className="cursor-pointer">
                                            <Button type="button" variant="outline" size="sm" asChild>
                                                <span><Upload className="h-4 w-4 mr-1" /> Upload Logo</span>
                                            </Button>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                                        </label>
                                        {errors.logo && <p className="text-sm text-destructive">{errors.logo}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Contact & Address */}
                    <TabsContent value="contact">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="business_email">Business Email</Label>
                                        <Input id="business_email" type="email" value={data.business_email} onChange={e => setData('business_email', e.target.value)} />
                                        {errors.business_email && <p className="text-sm text-destructive mt-1">{errors.business_email}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="business_phone">Business Phone</Label>
                                        <Input id="business_phone" value={data.business_phone} onChange={e => setData('business_phone', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label htmlFor="business_website">Website</Label>
                                        <Input id="business_website" type="url" value={data.business_website} onChange={e => setData('business_website', e.target.value)} placeholder="https://" />
                                        {errors.business_website && <p className="text-sm text-destructive mt-1">{errors.business_website}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Address</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="business_address">Street Address</Label>
                                        <Input id="business_address" value={data.business_address} onChange={e => setData('business_address', e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="city">City</Label>
                                            <Input id="city" value={data.city} onChange={e => setData('city', e.target.value)} />
                                        </div>
                                        <div>
                                            <Label htmlFor="state">State/Province</Label>
                                            <Input id="state" value={data.state} onChange={e => setData('state', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="postal_code">Postal Code</Label>
                                            <Input id="postal_code" value={data.postal_code} onChange={e => setData('postal_code', e.target.value)} />
                                        </div>
                                        <div>
                                            <Label htmlFor="country">Country</Label>
                                            <Input id="country" value={data.country} onChange={e => setData('country', e.target.value)} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Banking & Legal */}
                    <TabsContent value="banking">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader><CardTitle>Banking Details</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="bank_name">Bank Name</Label>
                                        <Input id="bank_name" value={data.bank_name} onChange={e => setData('bank_name', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label htmlFor="bank_account_number">Account Number</Label>
                                        <Input id="bank_account_number" value={data.bank_account_number} onChange={e => setData('bank_account_number', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label htmlFor="bank_account_name">Account Name</Label>
                                        <Input id="bank_account_name" value={data.bank_account_name} onChange={e => setData('bank_account_name', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label htmlFor="bank_branch">Bank Branch</Label>
                                        <Input id="bank_branch" value={data.bank_branch} onChange={e => setData('bank_branch', e.target.value)} />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Legal & Tax</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="tax_id">Tax ID</Label>
                                        <Input id="tax_id" value={data.tax_id} onChange={e => setData('tax_id', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                                        <Input id="commission_rate" type="number" min="0" max="100" step="0.1" value={data.commission_rate} onChange={e => setData('commission_rate', e.target.value)} />
                                        {errors.commission_rate && <p className="text-sm text-destructive mt-1">{errors.commission_rate}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Admin Settings */}
                    <TabsContent value="admin">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader><CardTitle>Status & Verification</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="status">Status</Label>
                                        <Select value={data.status} onValueChange={v => setData('status', v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="approved">Approved</SelectItem>
                                                <SelectItem value="rejected">Rejected</SelectItem>
                                                <SelectItem value="suspended">Suspended</SelectItem>
                                                <SelectItem value="changes_requested">Changes Requested</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <Checkbox checked={data.is_verified} onCheckedChange={v => setData('is_verified', !!v)} />
                                        <span className="text-sm">Verified Vendor</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <Checkbox checked={data.is_active} onCheckedChange={v => setData('is_active', !!v)} />
                                        <span className="text-sm">Active Vendor</span>
                                    </label>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Admin Notes</CardTitle></CardHeader>
                                <CardContent>
                                    <Textarea value={data.admin_notes} onChange={e => setData('admin_notes', e.target.value)} rows={6} placeholder="Internal notes about this vendor..." />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </form>
        </AdminLayout>
    );
}
