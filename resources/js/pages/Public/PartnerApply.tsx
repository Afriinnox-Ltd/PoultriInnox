import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import GuestLayout from '@/layouts/guest-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Building2, Utensils, Hotel, ChefHat, AlertCircle } from 'lucide-react';
import { type SharedData } from '@/types';
import { toast } from 'sonner';

interface FlashProps extends SharedData {
    flash?: { success?: string; error?: string };
}

const PARTNER_TYPES = [
    { value: 'hotel',      label: 'Hotel',             icon: Hotel },
    { value: 'restaurant', label: 'Restaurant',        icon: Utensils },
    { value: 'catering',   label: 'Catering Company',  icon: ChefHat },
    { value: 'other',      label: 'Other Business',    icon: Building2 },
];

export default function PartnerApplyPage() {
    const { flash } = usePage<FlashProps>().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        business_name:  '',
        partner_type:   '',
        contact_person: '',
        email:          '',
        phone:          '',
        address:        '',
        city:           '',
        country:        'Rwanda',
        notes:          '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/partners/apply', { 
            onSuccess: () => {
            reset(),
            toast.success('Your application has been submitted successfully! Our team will review it and get back to you within 24 hours.')
        },
        onError: () => {
            toast.error('There was an error submitting your application. Please check the form for errors and try again.')
        } });
    };

    return (
        <GuestLayout>
            <Head title="Apply as a Partner — Agriinnox" />

            <div className="max-w-2xl mx-auto px-4 py-8 mt-24">
                {/* Header */}
                <div className="text-center mb-8">
                    
                    <h1 className="text-3xl font-bold text-gray-900">Apply as a Partner</h1>
                    <p className="text-gray-500 mt-2">
                        Fill in your business details below. Our team will review your application
                        and create your account within 24 hours.
                    </p>
                </div>

                {/* Success */}
                {flash?.success && (
                    <div className="mb-6 flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-green-800">{flash.success}</p>
                    </div>
                )}

                {/* Error */}
                {flash?.error && (
                    <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{flash.error}</p>
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Business Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Partner type */}
                            <div>
                                <Label className="mb-2 block">Business Type <span className="text-red-500">*</span></Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {PARTNER_TYPES.map(({ value, label, icon: Icon }) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setData('partner_type', value)}
                                            className={`flex cursor-pointer items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                                                data.partner_type === value
                                                    ? 'border-green-600 bg-green-50 text-green-800'
                                                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                            }`}
                                        >
                                            <Icon className="w-5 h-5 flex-shrink-0" />
                                            <span className="text-sm font-medium">{label}</span>
                                        </button>
                                    ))}
                                </div>
                                {errors.partner_type && <p className="text-red-500 text-xs mt-1">{errors.partner_type}</p>}
                            </div>

                            {/* Business name + contact */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="business_name">Business Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="business_name"
                                        value={data.business_name}
                                        onChange={e => setData('business_name', e.target.value)}
                                        placeholder="e.g. Busines Ltd."
                                        className="mt-1"
                                    />
                                    {errors.business_name && <p className="text-red-500 text-xs mt-1">{errors.business_name}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="contact_person">Contact Person <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="contact_person"
                                        value={data.contact_person}
                                        onChange={e => setData('contact_person', e.target.value)}
                                        placeholder="Full name"
                                        className="mt-1"
                                    />
                                    {errors.contact_person && <p className="text-red-500 text-xs mt-1">{errors.contact_person}</p>}
                                </div>
                            </div>

                            {/* Email + phone */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="email">Business Email <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        placeholder="orders@yourbusiness.com"
                                        className="mt-1"
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        placeholder="+250 700 000 000"
                                        className="mt-1"
                                    />
                                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                </div>
                            </div>

                            {/* City + country */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        value={data.city}
                                        onChange={e => setData('city', e.target.value)}
                                        placeholder="e.g. Kigali"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                        id="country"
                                        value={data.country}
                                        onChange={e => setData('country', e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <Label htmlFor="address">Business Address</Label>
                                <Input
                                    id="address"
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    placeholder="Street address"
                                    className="mt-1"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <Label htmlFor="notes">Tell us about your needs <span className="text-gray-400 text-xs">(optional)</span></Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    rows={3}
                                    placeholder="e.g. We need weekly delivery of 500 broilers and 200 dozen eggs..."
                                    className="mt-1"
                                />
                                {errors.notes && <p className="text-red-500 text-xs mt-1">{errors.notes}</p>}
                            </div>


                            {/* Success */}
                            {flash?.success && (
                                <div className="mb-6 flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-green-800">{flash.success}</p>
                                </div>
                            )}

                            {/* Error */}
                            {flash?.error && (
                                <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700">{flash.error}</p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11"
                            >
                                {processing ? 'Submitting...' : 'Submit Application'}
                            </Button>

                            <p className="text-xs text-center text-gray-400">
                                Already have an account?{' '}
                                <a href="/login" className="text-emerald-600 hover:underline">Log in here</a>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </GuestLayout>
    );
}
