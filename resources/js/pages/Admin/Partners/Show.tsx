import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, XCircle, ShoppingBag, Mail, Phone, MapPin } from 'lucide-react';

interface Order {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    total_amount: string | null;
    currency: string;
    created_at: string;
}

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
    is_active: boolean;
    created_at: string;
    user: { name: string; email: string };
    orders: Order[];
}

interface Props {
    partner: PartnerProfile;
}

const STATUS_COLORS: Record<string, string> = {
    pending:    'bg-yellow-100 text-yellow-800',
    reviewing:  'bg-blue-100 text-blue-800',
    confirmed:  'bg-indigo-100 text-indigo-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped:    'bg-cyan-100 text-cyan-800',
    delivered:  'bg-green-100 text-green-800',
    cancelled:  'bg-red-100 text-red-800',
};

export default function AdminPartnerShow({ partner }: Props) {
    const toggle = (action: 'verify' | 'toggle-active') => {
        router.patch(`/admin/partners/${partner.id}/${action}`);
    };

    return (
        <AdminLayout>
            <Head title={partner.business_name} />
            <div className="py-6 px-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/admin/partners">
                        <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Partners</Button>
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900">{partner.business_name}</h1>
                    {partner.is_verified && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 font-medium">
                            ✓ Verified
                        </span>
                    )}
                    {!partner.is_active && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700 font-medium">Inactive</span>
                    )}
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                    {/* Details card */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Partner Details</CardTitle></CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex gap-2 text-gray-600">
                                <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                                <span>{partner.user.email}</span>
                            </div>
                            {partner.phone && (
                                <div className="flex gap-2 text-gray-600">
                                    <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <span>{partner.phone}</span>
                                </div>
                            )}
                            {partner.address && (
                                <div className="flex gap-2 text-gray-600">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <span>{partner.address}, {partner.city}, {partner.country}</span>
                                </div>
                            )}
                            <div className="pt-1 text-gray-500">
                                <span className="capitalize font-medium">{partner.partner_type}</span>
                                {partner.contact_person && <span> · {partner.contact_person}</span>}
                            </div>
                            <p className="text-xs text-gray-400">Joined {new Date(partner.created_at).toLocaleDateString()}</p>
                        </CardContent>
                    </Card>

                    {/* Actions card */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Actions</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => toggle('verify')}
                            >
                                {partner.is_verified ? (
                                    <><XCircle className="w-4 h-4 mr-2 text-red-500" /> Unverify Partner</>
                                ) : (
                                    <><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Verify Partner</>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => toggle('toggle-active')}
                            >
                                {partner.is_active ? 'Deactivate Partner' : 'Activate Partner'}
                            </Button>
                            <Link href={`/admin/partners/orders?search=${encodeURIComponent(partner.business_name)}`}>
                                <Button variant="outline" className="w-full">
                                    <ShoppingBag className="w-4 h-4 mr-2" /> View Orders
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* Orders history */}
                <Card className="mt-5">
                    <CardHeader><CardTitle className="text-base">Order History ({partner.orders.length})</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        {partner.orders.length === 0 ? (
                            <p className="text-center text-gray-400 py-8 text-sm">No orders placed yet.</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Order #</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Payment</th>
                                        <th className="text-right px-4 py-3 font-medium text-gray-600">Amount</th>
                                        <th className="text-right px-4 py-3 font-medium text-gray-600">Date</th>
                                        <th className="text-right px-4 py-3 font-medium text-gray-600"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {partner.orders.map(order => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium">{order.order_number}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 capitalize text-gray-600">{order.payment_status}</td>
                                            <td className="px-4 py-3 text-right">
                                                {order.total_amount
                                                    ? `${order.currency} ${Number(order.total_amount).toLocaleString()}`
                                                    : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-500">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Link href={`/admin/partners/orders/${order.id}`}>
                                                    <Button variant="ghost" size="sm">View</Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
