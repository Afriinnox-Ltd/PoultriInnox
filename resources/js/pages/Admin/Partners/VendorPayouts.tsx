import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, DollarSign, CheckCircle } from 'lucide-react';

interface VendorItem {
    id: number;
    product_name: string;
    quantity: string;
    unit: string;
    vendor_payout: string;
    vendor_paid: boolean;
    vendor_paid_at: string | null;
    order: {
        id: number;
        order_number: string;
        partner: { business_name: string };
    };
}

interface VendorSummary {
    vendor: { id: number; business_name: string };
    total_payout: number;
    unpaid: number;
    items: VendorItem[];
}

interface Props {
    summary: VendorSummary[];
}

export default function AdminVendorPayouts({ summary }: Props) {
    const grandTotal = summary.reduce((sum, v) => sum + v.total_payout, 0);
    const grandUnpaid = summary.reduce((sum, v) => sum + v.unpaid, 0);

    return (
        <AdminLayout>
            <Head title="Vendor Payouts — Partners" />
            <div className="py-6 px-6 max-w-5xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/admin/partners/orders">
                        <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Partner Orders</Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Vendor Payouts</h1>
                </div>

                {/* Totals */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <Card className="border-blue-200">
                        <CardContent className="pt-4">
                            <p className="text-xs text-gray-500">Total Partner Order Payouts</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">RWF {grandTotal.toLocaleString()}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-red-200">
                        <CardContent className="pt-4">
                            <p className="text-xs text-gray-500">Outstanding (Unpaid)</p>
                            <p className="text-2xl font-bold text-red-600 mt-1">RWF {grandUnpaid.toLocaleString()}</p>
                        </CardContent>
                    </Card>
                </div>

                {summary.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-gray-400">
                            <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            No vendor payouts to show yet.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-5">
                        {summary.map(entry => (
                            <Card key={entry.vendor.id}>
                                <CardHeader className="flex flex-row items-start justify-between pb-2">
                                    <div>
                                        <CardTitle className="text-base">{entry.vendor.business_name}</CardTitle>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Total payout: <strong>RWF {entry.total_payout.toLocaleString()}</strong>
                                            {entry.unpaid > 0 && (
                                                <span className="ml-2 text-red-600">· Unpaid: RWF {entry.unpaid.toLocaleString()}</span>
                                            )}
                                            {entry.unpaid === 0 && (
                                                <span className="ml-2 text-green-600 flex inline-flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" /> All paid
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 border-y">
                                            <tr>
                                                <th className="text-left px-4 py-2 font-medium text-gray-600">Item</th>
                                                <th className="text-left px-4 py-2 font-medium text-gray-600">Order</th>
                                                <th className="text-left px-4 py-2 font-medium text-gray-600">Partner</th>
                                                <th className="text-right px-4 py-2 font-medium text-gray-600">Qty</th>
                                                <th className="text-right px-4 py-2 font-medium text-gray-600">Payout</th>
                                                <th className="text-center px-4 py-2 font-medium text-gray-600">Paid</th>
                                                <th className="px-4 py-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {entry.items.map(item => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-2 font-medium">{item.product_name}</td>
                                                    <td className="px-4 py-2 text-gray-600">{item.order.order_number}</td>
                                                    <td className="px-4 py-2 text-gray-600">{item.order.partner.business_name}</td>
                                                    <td className="px-4 py-2 text-right">{Number(item.quantity)} {item.unit}</td>
                                                    <td className="px-4 py-2 text-right font-medium">RWF {Number(item.vendor_payout).toLocaleString()}</td>
                                                    <td className="px-4 py-2 text-center">
                                                        {item.vendor_paid ? (
                                                            <span className="text-green-600 flex justify-center">
                                                                <CheckCircle className="w-4 h-4" />
                                                            </span>
                                                        ) : (
                                                            <span className="w-4 h-4 block mx-auto rounded-full border-2 border-gray-300" />
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2 text-right">
                                                        <Link href={`/admin/partners/orders/${item.order.id}`}>
                                                            <Button variant="ghost" size="sm" className="h-6 text-xs">View Order</Button>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
