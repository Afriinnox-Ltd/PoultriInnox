import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, MapPin, Calendar, MessageSquare, Truck, Download, AlertTriangle, Clock } from 'lucide-react';
import PartnerLayout from '@/layouts/partner-layout';

interface OrderItem {
    id: number;
    product_name: string;
    description: string | null;
    quantity: string;
    unit: string;
    unit_price: string | null;
    total_price: string | null;
    vendor?: { business_name: string };
    product?: { images: { image_path: string }[] };
}

interface PartnerOrder {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    total_amount: string | null;
    currency: string;
    description: string | null;
    delivery_address: string | null;
    requested_delivery_date: string | null;
    partner_notes: string | null;
    admin_notes: string | null;
    delivery_tracking_number: string | null;
    confirmed_at: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    paid_at: string | null;
    payment_due_date: string | null;
    payment_reminder_days: number | null;
    created_at: string;
    items: OrderItem[];
}

interface Props {
    order: PartnerOrder;
    profile: { business_name: string };
}

const STATUS_STEPS = ['pending', 'reviewing', 'confirmed', 'processing', 'shipped', 'delivered'];

const STATUS_LABELS: Record<string, string> = {
    pending: 'Pending Review',
    reviewing: 'Under Review',
    confirmed: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
};

const PAYMENT_COLORS: Record<string, string> = {
    pending: 'bg-emerald-100 text-emerald-800',
    partial: 'bg-emerald-100 text-emerald-800',
    paid: 'bg-emerald-100 text-emerald-800',
    refunded: 'bg-emerald-100 text-emerald-800',
};

export default function PartnerOrderShow({ order, profile }: Props) {
    const currentStep = STATUS_STEPS.indexOf(order.status);

    return (
          <PartnerLayout>
            <Head title={`Order ${order.order_number}`} />
            <div className="max-w-3xl mx-auto py-8 px-4">
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/partner/orders">
                        <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900">Order #{order.order_number}</h1>
                    {order.status === 'delivered' && (
                        <a href={`/partner/orders/${order.id}/invoice`} target="_blank" rel="noopener noreferrer" className="ml-auto">
                            <Button variant="outline" size="sm" className="text-green-700 border-green-600 hover:bg-green-50">
                                <Download className="w-4 h-4 mr-1" /> Download Invoice
                            </Button>
                        </a>
                    )}
                </div>

                {/* Status tracker */}
                {order.status !== 'cancelled' && (
                    <Card className="mb-5">
                        <CardContent className="pt-5 pb-4">
                            <div className="flex items-center justify-between">
                                {STATUS_STEPS.map((step, i) => (
                                    <React.Fragment key={step}>
                                        <div className="flex flex-col items-center gap-1">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                                                i < currentStep ? 'bg-emerald-500 border-emerald-500 text-white' :
                                                i === currentStep ? 'bg-emerald-500 border-emerald-500 text-white' :
                                                'bg-white border-emerald-300 text-emerald-400'
                                            }`}>
                                                {i < currentStep ? '✓' : i + 1}
                                            </div>
                                            <span className={`text-xs text-center ${i <= currentStep ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                                                {STATUS_LABELS[step]}
                                            </span>
                                        </div>
                                        {i < STATUS_STEPS.length - 1 && (
                                            <div className={`flex-1 h-0.5 mx-1 mb-4 ${i < currentStep ? 'bg-emerald-400' : 'bg-emerald-200'}`} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {order.status === 'cancelled' && (
                    <div className="mb-5 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 font-medium">
                        This order has been cancelled.
                    </div>
                )}

                {/* Payment due reminder banner */}
                {order.payment_due_date && order.payment_status !== 'paid' && (() => {
                    const due = new Date(order.payment_due_date);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const daysLeft = Math.ceil((due.getTime() - today.getTime()) / 86400000);
                    if (daysLeft < 0) return (
                        <div className="mb-5 bg-red-50 border border-red-300 rounded-lg p-4 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-red-700">Payment Overdue</p>
                                <p className="text-sm text-red-600 mt-0.5">
                                    Payment was due on <strong>{new Date(order.payment_due_date).toLocaleDateString()}</strong> — {Math.abs(daysLeft)} day{Math.abs(daysLeft) !== 1 ? 's' : ''} ago.
                                    {order.payment_reminder_days && ` Reminders are sent every ${order.payment_reminder_days} days.`}
                                    {' '}Please contact us to settle your balance.
                                </p>
                            </div>
                        </div>
                    );
                    if (daysLeft <= 7) return (
                        <div className="mb-5 bg-amber-50 border border-amber-300 rounded-lg p-4 flex items-start gap-3">
                            <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-amber-700">Payment Due Soon</p>
                                <p className="text-sm text-amber-700 mt-0.5">
                                    Payment is due on <strong>{new Date(order.payment_due_date).toLocaleDateString()}</strong> — in {daysLeft} day{daysLeft !== 1 ? 's' : ''}.
                                    {order.payment_reminder_days && ` You'll receive reminders every ${order.payment_reminder_days} days.`}
                                </p>
                            </div>
                        </div>
                    );
                    return null;
                })()}

                <div className="grid gap-5">
                    {/* Summary card */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Order Summary</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-start gap-2">
                                <Badge className={PAYMENT_COLORS[order.payment_status]}>
                                    Payment: {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                </Badge>
                                {order.total_amount ? (
                                    <span className="font-semibold text-gray-900 text-lg">
                                        {order.currency} {Number(order.total_amount).toLocaleString()}
                                    </span>
                                ) : (
                                    <span className="text-gray-400">To Be Determined</span>
                                )}
                            </div>

                            {order.description && (
                                <div className="flex gap-2 text-sm text-gray-600">
                                    <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                                    <div dangerouslySetInnerHTML={{ __html: order.description }} />
                                </div>
                            )}

                            {order.delivery_address && (
                                <div className="flex gap-2 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                                    <span>{order.delivery_address}</span>
                                </div>
                            )}

                            {order.requested_delivery_date && (
                                <div className="flex gap-2 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                                    <span>Requested by: {new Date(order.requested_delivery_date).toLocaleDateString()}</span>
                                </div>
                            )}

                            {order.delivery_tracking_number && (
                                <div className="flex gap-2 text-sm text-gray-600">
                                    <Truck className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                                    <span>Tracking: <span className="font-mono font-medium">{order.delivery_tracking_number}</span></span>
                                </div>
                            )}

                            {order.admin_notes && (
                                <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
                                    <strong>Note from us:</strong> {order.admin_notes}
                                </div>
                            )}

                            {/* Payment due date shown in summary */}
                            {order.payment_due_date && order.payment_status !== 'paid' && (
                                <div className="flex gap-2 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                                    <span>
                                        Payment due: <strong>{new Date(order.payment_due_date).toLocaleDateString()}</strong>
                                        {order.payment_reminder_days && (
                                            <span className="text-gray-400 ml-1">· reminder every {order.payment_reminder_days} day{order.payment_reminder_days !== 1 ? 's' : ''}</span>
                                        )}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Items */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Items ({order.items.length})</CardTitle></CardHeader>
                        <CardContent className="divide-y">
                            {order.items.map(item => (
                                <div key={item.id} className="py-3 flex justify-between gap-4">
                                    <div className="flex gap-3">
                                        <Package className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-sm text-gray-900">{item.product_name}</p>
                                            {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                                            {item.vendor && <p className="text-xs text-blue-600">Vendor: {item.vendor.business_name}</p>}
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-sm font-medium">{Number(item.quantity)} {item.unit}</p>
                                        {item.unit_price && (
                                            <p className="text-xs text-gray-500">
                                                @ {Number(item.unit_price).toLocaleString()} = {Number(item.total_price).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card>
                        <CardHeader><CardTitle className="text-base">Timeline</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm text-gray-600">
                            <div className="flex justify-between"><span>Order Placed</span><span>{new Date(order.created_at).toLocaleString()}</span></div>
                            {order.confirmed_at && <div className="flex justify-between"><span>Confirmed</span><span>{new Date(order.confirmed_at).toLocaleString()}</span></div>}
                            {order.shipped_at && <div className="flex justify-between"><span>Shipped</span><span>{new Date(order.shipped_at).toLocaleString()}</span></div>}
                            {order.delivered_at && <div className="flex justify-between text-green-700 font-medium"><span>Delivered</span><span>{new Date(order.delivered_at).toLocaleString()}</span></div>}
                            {order.paid_at && <div className="flex justify-between text-green-700 font-medium"><span>Paid</span><span>{new Date(order.paid_at).toLocaleString()}</span></div>}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PartnerLayout>
    );
}
