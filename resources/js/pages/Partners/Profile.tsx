import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import PartnerLayout from '@/layouts/partner-layout';

interface PartnerProfile {
    id: number;
    business_name: string;
    partner_type: string;
    contact_person: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    country: string;
    is_verified: boolean;
}

interface Props {
    profile: PartnerProfile;
}

export default function PartnerProfilePage({ profile }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        business_name: profile.business_name,
        partner_type: profile.partner_type,
        contact_person: profile.contact_person ?? '',
        phone: profile.phone ?? '',
        address: profile.address ?? '',
        city: profile.city ?? '',
        country: profile.country,
    });

    return (
        <PartnerLayout profile={profile}>
            <Head title="Partner Profile" />
            <div className="max-w-xl mx-auto py-8 px-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Partner Profile</h1>

                {profile.is_verified && (
                    <div className="mb-4 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-green-700 text-sm font-medium">
                        ✓ Verified Partner
                    </div>
                )}

                <Card>
                    <CardHeader><CardTitle className="text-base">Business Information</CardTitle></CardHeader>
                    <CardContent>
                        <form
                            onSubmit={e => { e.preventDefault(); put('/partner/profile'); }}
                            className="space-y-4"
                        >
                            <div>
                                <Label htmlFor="business_name">Business Name *</Label>
                                <Input
                                    id="business_name"
                                    value={data.business_name}
                                    onChange={e => setData('business_name', e.target.value)}
                                    className="mt-1"
                                />
                                {errors.business_name && <p className="text-red-500 text-xs mt-1">{errors.business_name}</p>}
                            </div>

                            <div>
                                <Label htmlFor="partner_type">Partner Type *</Label>
                                <Select value={data.partner_type} onValueChange={v => setData('partner_type', v)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hotel">Hotel</SelectItem>
                                        <SelectItem value="restaurant">Restaurant</SelectItem>
                                        <SelectItem value="catering">Catering</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.partner_type && <p className="text-red-500 text-xs mt-1">{errors.partner_type}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="contact_person">Contact Person</Label>
                                    <Input
                                        id="contact_person"
                                        value={data.contact_person}
                                        onChange={e => setData('contact_person', e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    rows={2}
                                    className="mt-1"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        value={data.city}
                                        onChange={e => setData('city', e.target.value)}
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

                            <Button type="submit" disabled={processing} className="w-full">
                                {processing ? 'Saving...' : 'Save Profile'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </PartnerLayout>
    );
}
