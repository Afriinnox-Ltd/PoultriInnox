import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle, XCircle, Clock, Building2, Mail, Phone, MapPin, User } from 'lucide-react';
import { type SharedData } from '@/types';

interface Application {
    id: number;
    business_name: string;
    partner_type: string;
    contact_person: string;
    email: string;
    phone: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    notes: string | null;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes: string | null;
    rejection_reason: string | null;
    reviewed_at: string | null;
    reviewer: { name: string } | null;
}

interface FlashProps extends SharedData {
    flash?: { success?: string; error?: string };
}

interface Props {
    application: Application;
}

const STATUS_CFG = {
    pending:  { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <Clock className="w-4 h-4" />,       label: 'Pending Review' },
    approved: { color: 'bg-green-100 text-green-800 border-green-200',   icon: <CheckCircle className="w-4 h-4" />, label: 'Approved' },
    rejected: { color: 'bg-red-100 text-red-800 border-red-200',         icon: <XCircle className="w-4 h-4" />,     label: 'Rejected' },
};

export default function AdminApplicationShow({ application }: Props) {
    const { flash } = usePage<FlashProps>().props;
    const [showReject, setShowReject] = useState(false);

    const approveForm = useForm({ admin_notes: '' });
    const rejectForm  = useForm({ rejection_reason: '', admin_notes: '' });

    const cfg = STATUS_CFG[application.status];

    return (
        <AdminLayout>
            <Head title={`Application — ${application.business_name}`} />
            <div className="py-6 px-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/admin/partners/applications">
                        <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Applications</Button>
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900">{application.business_name}</h1>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                    </span>
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" /> {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                        <XCircle className="w-4 h-4 flex-shrink-0" /> {flash.error}
                    </div>
                )}

                <div className="grid md:grid-cols-3 gap-5">
                    {/* Details */}
                    <div className="md:col-span-2 space-y-5">
                        <Card>
                            <CardHeader><CardTitle className="text-base">Business Details</CardTitle></CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex items-start gap-3">
                                    <Building2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium text-gray-900">{application.business_name}</p>
                                        <p className="text-gray-500 capitalize">{application.partner_type}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="text-gray-700">{application.contact_person}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <a href={`mailto:${application.email}`} className="text-blue-600 hover:underline">{application.email}</a>
                                </div>
                                {application.phone && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-700">{application.phone}</span>
                                    </div>
                                )}
                                {(application.city || application.address) && (
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            {application.address && <p className="text-gray-700">{application.address}</p>}
                                            <p className="text-gray-500">{[application.city, application.country].filter(Boolean).join(', ')}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {application.notes && (
                            <Card>
                                <CardHeader><CardTitle className="text-base">Applicant's Message</CardTitle></CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-700 whitespace-pre-line">{application.notes}</p>
                                </CardContent>
                            </Card>
                        )}

                        {application.status !== 'pending' && (
                            <Card className="border-gray-200">
                                <CardHeader><CardTitle className="text-base">Review Details</CardTitle></CardHeader>
                                <CardContent className="text-sm space-y-2 text-gray-600">
                                    {application.reviewer && <p><span className="font-medium">Reviewed by:</span> {application.reviewer.name}</p>}
                                    {application.reviewed_at && <p><span className="font-medium">Reviewed at:</span> {new Date(application.reviewed_at).toLocaleString()}</p>}
                                    {application.rejection_reason && (
                                        <p><span className="font-medium text-red-700">Rejection reason:</span> {application.rejection_reason}</p>
                                    )}
                                    {application.admin_notes && <p><span className="font-medium">Admin notes:</span> {application.admin_notes}</p>}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-4">
                        {application.status === 'pending' && !showReject && (
                            <Card>
                                <CardHeader><CardTitle className="text-base">Approve Application</CardTitle></CardHeader>
                                <CardContent>
                                    <form
                                        onSubmit={e => {
                                            e.preventDefault();
                                            approveForm.post(`/admin/partners/applications/${application.id}/approve`, { preserveScroll: true });
                                        }}
                                        className="space-y-3"
                                    >
                                        <div>
                                            <Label className="text-xs">Internal Notes (optional)</Label>
                                            <Textarea
                                                value={approveForm.data.admin_notes}
                                                onChange={e => approveForm.setData('admin_notes', e.target.value)}
                                                rows={2}
                                                className="mt-1 text-sm"
                                                placeholder="Notes visible only to admins..."
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            className="w-full bg-green-700 hover:bg-green-800 text-white"
                                            disabled={approveForm.processing}
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            {approveForm.processing ? 'Processing...' : 'Approve & Create Account'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full text-red-600 border-red-200 hover:bg-red-50"
                                            onClick={() => setShowReject(true)}
                                        >
                                            Reject Application
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {application.status === 'pending' && showReject && (
                            <Card className="border-red-200">
                                <CardHeader><CardTitle className="text-base text-red-700">Reject Application</CardTitle></CardHeader>
                                <CardContent>
                                    <form
                                        onSubmit={e => {
                                            e.preventDefault();
                                            rejectForm.post(`/admin/partners/applications/${application.id}/reject`, { preserveScroll: true });
                                        }}
                                        className="space-y-3"
                                    >
                                        <div>
                                            <Label className="text-xs">Reason for rejection <span className="text-red-500">*</span></Label>
                                            <Textarea
                                                value={rejectForm.data.rejection_reason}
                                                onChange={e => rejectForm.setData('rejection_reason', e.target.value)}
                                                rows={2}
                                                required
                                                className="mt-1 text-sm"
                                                placeholder="Why is this application being rejected?"
                                            />
                                            {rejectForm.errors.rejection_reason && (
                                                <p className="text-red-500 text-xs mt-1">{rejectForm.errors.rejection_reason}</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label className="text-xs">Admin Notes (optional)</Label>
                                            <Textarea
                                                value={rejectForm.data.admin_notes}
                                                onChange={e => rejectForm.setData('admin_notes', e.target.value)}
                                                rows={2}
                                                className="mt-1 text-sm"
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            variant="destructive"
                                            className="w-full"
                                            disabled={rejectForm.processing}
                                        >
                                            {rejectForm.processing ? 'Rejecting...' : 'Confirm Rejection'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="w-full"
                                            onClick={() => setShowReject(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {application.status !== 'pending' && (
                            <Card className={application.status === 'approved' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                                <CardContent className="p-4 text-center">
                                    {application.status === 'approved' ? (
                                        <>
                                            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-green-800">Application Approved</p>
                                            <p className="text-xs text-green-600 mt-1">Account has been created and credentials sent.</p>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-red-700">Application Rejected</p>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
