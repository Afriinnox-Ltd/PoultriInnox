import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Eye, CheckCircle, XCircle, Building2 } from 'lucide-react';
import { router as inertia } from '@inertiajs/react';

interface Partner {
    id: number;
    business_name: string;
    partner_type: string;
    contact_person: string | null;
    phone: string | null;
    city: string | null;
    is_verified: boolean;
    is_active: boolean;
    orders_count: number;
    created_at: string;
    user: { name: string; email: string };
}

interface Props {
    partners: {
        data: Partner[];
        meta: { total: number; current_page: number; last_page: number };
    };
    filters: { search?: string; type?: string };
}

export default function AdminPartnersIndex({ partners, filters }: Props) {
    const [search, setSearch] = React.useState(filters.search ?? '');

    const applyFilter = (extra: object) => {
        router.get('/admin/partners', { search, ...filters, ...extra }, { preserveState: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter({ search });
    };

    return (
        <AdminLayout>
            <Head title="Partners" />
            <div className="py-6 px-6 max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Partners</h1>
                        <p className="text-sm text-gray-500 mt-1">Hotels, restaurants and catering companies</p>
                    </div>
                    <Link href="/admin/partners/orders">
                        <Button variant="outline">View All Orders</Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card className="mb-5">
                    <CardContent className="pt-4">
                        <form onSubmit={handleSearch} className="flex gap-3 flex-wrap">
                            <Input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search by name or email..."
                                className="flex-1 min-w-48"
                            />
                            <Select
                                value={filters.type ?? 'all'}
                                onValueChange={v => applyFilter({ type: v === 'all' ? '' : v })}
                            >
                                <SelectTrigger className="w-44">
                                    <SelectValue placeholder="All types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="hotel">Hotel</SelectItem>
                                    <SelectItem value="restaurant">Restaurant</SelectItem>
                                    <SelectItem value="catering">Catering</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button type="submit">Search</Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Business</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                                        <th className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>
                                        <th className="text-center px-4 py-3 font-medium text-gray-600">Orders</th>
                                        <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                                        <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {partners.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-10 text-gray-400">
                                                <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                                No partners found.
                                            </td>
                                        </tr>
                                    ) : partners.data.map(partner => (
                                        <tr key={partner.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <p className="font-medium text-gray-900">{partner.business_name}</p>
                                                        <p className="text-xs text-gray-500">{partner.user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 capitalize text-gray-600">{partner.partner_type}</td>
                                            <td className="px-4 py-3 text-gray-600">
                                                <p>{partner.contact_person ?? partner.user.name}</p>
                                                <p className="text-xs text-gray-400">{partner.phone}</p>
                                            </td>
                                            <td className="px-4 py-3 text-center font-medium">{partner.orders_count}</td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex justify-center gap-1">
                                                    {partner.is_verified ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                                                            <CheckCircle className="w-3 h-3" /> Verified
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700">
                                                            Unverified
                                                        </span>
                                                    )}
                                                    {!partner.is_active && (
                                                        <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">Inactive</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/admin/partners/${partner.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="w-3 h-3 mr-1" /> View
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {partners?.meta?.last_page > 1 && (
                    <div className="flex justify-center gap-2 mt-5">
                        {Array.from({ length: partners?.meta?.last_page }, (_, i) => i + 1).map(page => (
                            <Button
                                key={page}
                                variant={page === partners?.meta?.current_page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => router.get('/admin/partners', { ...filters, page }, { preserveState: true })}
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
