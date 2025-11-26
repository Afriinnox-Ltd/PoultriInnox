import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Search,
    Eye,
    Check,
    X,
    Pause,
    Play,
    Store,
    MapPin,
    Phone,
    Calendar,
    Filter,
    MoreHorizontal,
    Download,
    FileText,
    ExternalLink,
    Mail,
    Pencil,
    Trash2,
    Plus,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'; 
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import RichTextEditor from '@/components/ui/rich-text-editor';

interface Vendor {
    id: number;
    user_id: number;
    business_name: string;
    business_type?: string;
    description?: string;
    business_description?: string;
    logo?: string;
    phone: string;
    email: string;
    website?: string;
    address: string;
    business_address?: string;
    business_phone?: string;
    business_email?: string;
    business_website?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    latitude?: number;
    longitude?: number;
    business_license?: string | null;
    business_registration_number?: string;
    tax_id?: string | null;
    tax_number?: string;
    business_documents?: string[] | string;
    bank_name?: string;
    bank_account?: string | null;
    bank_account_number?: string;
    bank_account_name?: string;
    bank_branch?: string;
    years_in_business?: number;
    specializations?: string[] | string;
    slug?: string;
    status: 'pending' | 'approved' | 'rejected' | 'suspended' | 'changes_requested';
    is_verified: boolean;
    is_active: boolean;
    rating?: number | null;
    total_sales: number;
    total_reviews?: number;
    products_count: number;
    orders_count: number;
    commission_rate?: number;
    payment_details?: Record<string, unknown>;
    verification_notes?: string;
    verified_at?: string | null;
    verified_by?: number;
    rejection_reason: string | null;
    approved_at: string | null;
    social_media?: Record<string, unknown>;
    banner_image?: string;
    additional_info?: string;
    created_at: string;
    updated_at: string;
    user: {
        name: string;
        email: string;
    };
    contact_person?: string;
}

interface VendorAdminProps {
    vendors: {
        data: Vendor[];
        links?: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        meta?: {
            total: number;
            from: number;
            to: number;
            last_page: number;
            current_page: number;
        };
    };
    filters: {
        search?: string;
        status?: string;
        verification?: string;
        date_from?: string;
        date_to?: string;
    };
    stats: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        suspended: number;
    };
}

export default function VendorAdmin({ vendors, filters, stats }: VendorAdminProps) {
    const { auth } = usePage<{ auth: { user: any; permissions: string[] } }>().props;
    const can = (perm: string | string[]) => {
        if (auth.user?.role === 'admin') return true;
        const perms = auth.permissions || [];
        return Array.isArray(perm) ? perm.some(p => perms.includes(p)) : perms.includes(perm);
    };

    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [verificationFilter, setVerificationFilter] = useState(filters.verification || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [previewDocument, setPreviewDocument] = useState<{ url: string, name: string } | null>(null);
    const [showMessageDialog, setShowMessageDialog] = useState(false);
    const [messageSubject, setMessageSubject] = useState('');
    const [messageBody, setMessageBody] = useState('');
    const [messageSending, setMessageSending] = useState(false);

    // Request Changes State
    const [showRequestChangesDialog, setShowRequestChangesDialog] = useState(false);
    const [requestChangesSubject, setRequestChangesSubject] = useState('Changes Requested for Vendor Application');
    const [requestChangesMessage, setRequestChangesMessage] = useState('');
    const [requestChangesSending, setRequestChangesSending] = useState(false);



    const handleSearch = () => {
        router.get('/admin/marketplace/vendors', {
            search: searchTerm,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            verification: verificationFilter !== 'all' ? verificationFilter : undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleApprove = (vendor: Vendor) => {
        if (confirm(`Are you sure you want to approve ${vendor.business_name}?`)) {
            router.post(
                `/admin/marketplace/vendors/${vendor.id}/approve`,
                {},
                {
                    onSuccess: () => {
                        toast.success('Vendor approved successfully');
                    },
                    onError: (error) => {
                        toast.error('Failed to approve vendor');
                    }
                }
            );
        }
    };

    const handleReject = (vendor: Vendor) => {
        const reason = prompt(`Please provide a reason for rejecting ${vendor.business_name}:`);
        if (reason) {
            router.post(`/admin/marketplace/vendors/${vendor.id}/reject`, {
                reason: reason
            },
                {
                    onSuccess: () => {
                        toast.success('Vendor rejected successfully');
                    },
                    onError: (error) => {
                        toast.error('Failed to reject vendor');
                    }
                });
        }
    };

    const handleSuspend = (vendor: Vendor) => {
        const confirmed = confirm(
            `Are you sure you want to suspend ${vendor.business_name}?\n\n` +
            `This action will:\n` +
            `• Deactivate all their products\n` +
            `• Send an email notification to the vendor\n` +
            `• Revoke their verification status\n\n` +
            `You will need to provide a reason for the suspension.`
        );

        if (confirmed) {
            const reason = prompt(`Please provide a reason for suspending ${vendor.business_name}:`);
            if (reason) {
                router.post(`/admin/marketplace/vendors/${vendor.id}/suspend`, {
                    reason: reason
                },
                    {
                        onSuccess: () => {

                            toast.success('Vendor suspended successfully. Email notification sent.');
                        },
                        onError: (error) => {
                            toast.error('Failed to suspend vendor');
                        }
                    });
            }
        }
    };

    const handleReactivate = (vendor: Vendor) => {
        if (confirm(`Are you sure you want to reactivate ${vendor.business_name}?`)) {
            router.post(`/admin/marketplace/vendors/${vendor.id}/reactivate`, {},
                {
                    onSuccess: () => {

                        toast.success('Vendor reactivated successfully');
                    },
                    onError: (error) => {
                        toast.error('Failed  to reactivate vendor');
                    }
                });
        }
    };

    const handleToggleVerification = (vendor: Vendor) => {
        const message = vendor.is_verified ? 'unverify' : 'verify';

        if (confirm(`Are you sure you want to ${message} ${vendor.business_name}?`)) {
            router.patch(`/admin/marketplace/vendors/${vendor.id}/toggle-verification`, {},
                {
                    preserveState: false,
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(`Vendor ${message}ed successfully`);
                    },
                    onError: (error) => {
                        toast.error(`Failed to ${message} vendor`);
                    }
                });
        }
    };

    const viewDetails = (vendor: Vendor) => {
        setSelectedVendor(vendor);
        setShowDetailsDialog(true);
    };

    const handleMessage = (vendor: Vendor) => {
        setSelectedVendor(vendor);
        setMessageSubject('');
        setMessageBody('');
        setShowMessageDialog(true);
    };

    const submitMessage = () => {
        if (!selectedVendor || !messageSubject || !messageBody) return;

        setMessageSending(true);
        router.post(`/admin/marketplace/vendors/${selectedVendor.id}/message`, {
            subject: messageSubject,
            message: messageBody
        }, {
            preserveState: true,
            onSuccess: () => {
                toast.success('Message sent successfully');
                setShowMessageDialog(false);
                setMessageSubject('');
                setMessageBody('');
            },
            onError: () => {
                toast.error('Failed to send message');
            },
            onFinish: () => {
                setMessageSending(false);
            }
        });
    };

    const handleRequestChanges = (vendor: Vendor) => {
        setSelectedVendor(vendor);
        setRequestChangesSubject('Changes Requested for Vendor Application');
        setRequestChangesMessage('');
        setShowRequestChangesDialog(true);
    };

    const submitRequestChanges = () => {
        if (!selectedVendor || !requestChangesSubject || !requestChangesMessage) return;

        setRequestChangesSending(true);
        router.post(`/admin/marketplace/vendors/${selectedVendor.id}/request-changes`, {
            subject: requestChangesSubject,
            message: requestChangesMessage
        }, {
            preserveState: true,
            onSuccess: () => {
                toast.success('Changes requested successfully');
                setShowRequestChangesDialog(false);
                setRequestChangesMessage('');
            },
            onError: () => {
                toast.error('Failed to request changes');
            },
            onFinish: () => {
                setRequestChangesSending(false);
            }
        });
    };


    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-emerald-100 text-emerald-700 border-emerald-300';
            case 'pending':
                return 'bg-orange-100 text-orange-700 border-orange-300';
            case 'rejected':
                return 'bg-red-100 text-red-700 border-red-300';
            case 'suspended':
                return 'bg-gray-100 text-gray-700 border-gray-300';
            case 'changes_requested':
                return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            default:
                return '';
        }
    };

    const getStatusVariant = (status: string): "default" | "destructive" | "outline" | "secondary" => {
        switch (status) {
            case 'approved':
                return 'default';
            case 'rejected':
                return 'destructive';
            case 'suspended':
                return 'secondary';
            case 'changes_requested':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    return (
        <AdminLayout>
            <Head title="Vendor Management" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Vendor Management</h2>
                        <p className="text-muted-foreground">
                            Review and manage marketplace vendor applications
                        </p>
                    </div>
                    {can('create-vendors') && (
                        <Link href="/admin/marketplace/vendors/create">
                            <Button><Plus className="h-4 w-4 mr-1" /> Add Vendor</Button>
                        </Link>
                    )}
                </div>

                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
                            <Store className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.total}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Calendar className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats?.pending}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                            <Check className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{stats?.approved}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                            <X className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats?.rejected}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
                            <Pause className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-600">{stats?.suspended}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <Label htmlFor="search">Search Vendors</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Search by business name, email, or contact person..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="verification">Verification</Label>
                                <select
                                    id="verification"
                                    value={verificationFilter}
                                    onChange={(e) => setVerificationFilter(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="all">All</option>
                                    <option value="verified">Verified</option>
                                    <option value="unverified">Unverified</option>
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="date_from">From Date</Label>
                                <Input
                                    id="date_from"
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="date_to">To Date</Label>
                                <Input
                                    id="date_to"
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleSearch}>
                                <Filter className="h-4 w-4 mr-2" />
                                Apply Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Vendors Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Vendors ({vendors?.meta?.total || vendors?.data?.length})</CardTitle>
                        <CardDescription>
                            Manage all marketplace vendor applications
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Business</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Verification</TableHead>
                                    <TableHead>Products</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead>Applied</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {vendors?.data?.length > 0 ? (
                                    vendors?.data.map((vendor) => (
                                        <TableRow key={vendor.id}>
                                            <TableCell>
                                                <div>
                                                    <Link href={`/admin/marketplace/vendors/${vendor.id}`} className="font-medium hover:underline">{vendor.business_name}</Link>
                                                    <div className="text-sm text-muted-foreground flex items-center">
                                                        <MapPin className="h-3 w-3 mr-1" />
                                                        {vendor.business_address}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{vendor.business_type}</div>
                                                    <div className="text-sm text-muted-foreground flex items-center">
                                                        <Phone className="h-3 w-3 mr-1" />
                                                        {vendor.business_phone}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={getStatusVariant(vendor.status)}
                                                    className={getStatusColor(vendor.status)}
                                                >
                                                    {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={vendor.is_verified ? 'default' : 'secondary'}
                                                    className={vendor.is_verified ? 'bg-blue-100 text-blue-700 border-blue-300' : ''}
                                                >
                                                    {vendor.is_verified ? 'Verified' : 'Unverified'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {vendor?.products_count} products
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <span className="text-sm font-medium">
                                                        {/* {vendor?.rating?.toFixed(1)} ⭐ */}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(vendor?.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => router.visit(`/admin/marketplace/vendors/${vendor.id}`)}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        {can('edit-vendor-details') && (
                                                            <DropdownMenuItem onClick={() => router.visit(`/admin/marketplace/vendors/${vendor.id}/edit`)}>
                                                                <Pencil className="h-4 w-4 mr-2" />
                                                                Edit Vendor
                                                            </DropdownMenuItem>
                                                        )}
                                                        {can('message-vendors') && (
                                                        <DropdownMenuItem onClick={() => handleMessage(vendor)}>
                                                            <Mail className="h-4 w-4 mr-2" />
                                                            Message Vendor
                                                        </DropdownMenuItem>
                                                        )}
                                                        {(vendor.status === 'pending' || vendor.status === 'changes_requested') && (
                                                            <>
                                                                <DropdownMenuItem onClick={() => handleApprove(vendor)}>
                                                                    <Check className="h-4 w-4 mr-2" />
                                                                    Approve
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleRequestChanges(vendor)}>
                                                                    <FileText className="h-4 w-4 mr-2" />
                                                                    Request Changes
                                                                </DropdownMenuItem>

                                                                <DropdownMenuItem onClick={() => handleReject(vendor)}>
                                                                    <X className="h-4 w-4 mr-2" />
                                                                    Reject
                                                                </DropdownMenuItem>

                                                            </>
                                                        )}
                                                        {vendor.status === 'approved' && (
                                                            <DropdownMenuItem onClick={() => handleSuspend(vendor)}>
                                                                <Pause className="h-4 w-4 mr-2" />
                                                                Suspend
                                                            </DropdownMenuItem>
                                                        )}
                                                        {vendor.status === 'suspended' && (
                                                            <DropdownMenuItem onClick={() => handleReactivate(vendor)}>
                                                                <Play className="h-4 w-4 mr-2" />
                                                                Reactivate
                                                            </DropdownMenuItem>
                                                        )}
                                                        {/* Verification toggle - available for all approved vendors */}
                                                        {vendor.status === 'approved' && can('edit-vendor-details') && (
                                                            <DropdownMenuItem onClick={() => handleToggleVerification(vendor)}>
                                                                {vendor.is_verified ? (
                                                                    <>
                                                                        <X className="h-4 w-4 mr-2" />
                                                                        Unverify
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Check className="h-4 w-4 mr-2" />
                                                                        Verify
                                                                    </>
                                                                )}
                                                            </DropdownMenuItem>
                                                        )}
                                                        {can('edit-vendor-details') && (
                                                            <DropdownMenuItem
                                                                className="text-red-600 focus:text-red-600"
                                                                onClick={() => {
                                                                    if (confirm(`Delete "${vendor.business_name}"? This cannot be undone.`)) {
                                                                        router.delete(`/admin/marketplace/vendors/${vendor.id}`, {
                                                                            onSuccess: () => toast.success('Vendor deleted'),
                                                                            onError: () => toast.error('Failed to delete vendor'),
                                                                        });
                                                                    }
                                                                }}
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Delete Vendor
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8">
                                            <div className="text-muted-foreground">
                                                No vendors found matching your criteria.
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {vendors.meta && vendors.meta.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {vendors.meta.from} to {vendors.meta.to} of {vendors.meta.total} results
                                </div>
                                <div className="flex space-x-2">
                                    {vendors.links?.map((link, index: number) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => link.url && router.visit(link.url)}
                                            disabled={!link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Vendor Details Dialog */}
                {selectedVendor && (
                    <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                        <DialogContent className="max-w-6xl lg:min-w-6xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Vendor Details - {selectedVendor.business_name}</DialogTitle>
                                <DialogDescription>
                                    Complete vendor application information
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                                {/* Basic Business Information */}
                                <div>
                                    <h4 className="font-semibold mb-3 text-lg border-b pb-2">Basic Business Information</h4>
                                    <div className="grid lg:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="font-medium">Business Name</Label>
                                            <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{selectedVendor.business_name}</p>
                                        </div>
                                        <div>
                                            <Label className="font-medium">Business Type</Label>
                                            <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{selectedVendor.business_type || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <Label className="font-medium">Contact Person</Label>
                                            <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{selectedVendor.contact_person || selectedVendor.user?.name || 'Not provided'}</p>
                                        </div>
                                        <div>
                                            <Label className="font-medium">Years in Business</Label>
                                            <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{selectedVendor.years_in_business || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <Label className="font-medium">Business Registration Number</Label>
                                            <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{selectedVendor.business_registration_number || 'Not provided'}</p>
                                        </div>
                                        <div>
                                            <Label className="font-medium">Commission Rate</Label>
                                            <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{selectedVendor.commission_rate ? `${selectedVendor.commission_rate}%` : 'Default rate applies'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Business Description */}
                                <div>
                                    <h4 className="font-semibold mb-3 text-lg border-b pb-2">Business Description</h4>
                                    <div className="p-3 bg-gray-50 rounded-md">
                                        <p className="text-sm">{selectedVendor.business_description || selectedVendor.description || 'No description provided'}</p>
                                    </div>
                                </div>

                                {/* Specializations */}
                                {selectedVendor.specializations && (
                                    <div>
                                        <h4 className="font-semibold mb-3 text-lg border-b pb-2">Specializations</h4>
                                        <div className="p-3 bg-gray-50 rounded-md">
                                            <p className="text-sm">
                                                {Array.isArray(selectedVendor.specializations)
                                                    ? selectedVendor.specializations.join(', ')
                                                    : selectedVendor.specializations
                                                }
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Contact Information */}
                                <div>
                                    <h4 className="font-semibold mb-3 text-lg border-b pb-2">Contact Information</h4>
                                    <div className="grid lg:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="font-medium">Primary Email</Label>
                                            <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{selectedVendor.email}</p>
                                        </div>
                                        <div>
                                            <Label className="font-medium">Business Email</Label>
                                            <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{selectedVendor.business_email || 'Same as primary'}</p>
                                        </div>
                                        <div>
                                            <Label className="font-medium">Primary Phone</Label>
                                            <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{selectedVendor.phone}</p>
                                        </div>
                                        <div>
                                            <Label className="font-medium">Business Phone</Label>
                                            <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{selectedVendor.business_phone || 'Same as primary'}</p>
                                        </div>
                                        <div>
                                            <Label className="font-medium">Website</Label>
                                            <p className="text-sm mt-1 p-2 bg-gray-50 rounded">
                                                {selectedVendor.website || selectedVendor.business_website ? (
                                                    <a
                                                        href={selectedVendor.website || selectedVendor.business_website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {selectedVendor.website || selectedVendor.business_website}
                                                    </a>
                                                ) : 'Not provided'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Address Information */}
                                <div>
                                    <h4 className="font-semibold mb-3 text-lg border-b pb-2">Address Information</h4>
                                    <div className="grid lg:grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <Label className="font-medium">Street Address</Label>
                                            <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{selectedVendor.address || selectedVendor.business_address}</p>
                                        </div>
                                        <div>
                                            <Label className="font-medium">City</Label>
                                            <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{selectedVendor.city}</p>
                                        </div>
                                        <div>
                                            <Label className="font-medium">State/Province</Label>
                                            <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{selectedVendor.state}</p>
                                        </div>
                                        <div>
                                            <Label className="font-medium">Postal Code</Label>
                                            <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{selectedVendor.postal_code}</p>
                                        </div>
                                        <div>
                                            <Label className="font-medium">Country</Label>
                                            <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{selectedVendor.country}</p>
                                        </div>
                                        {(selectedVendor.latitude && selectedVendor.longitude) && (
                                            <div className="col-span-2">
                                                <Label className="font-medium">GPS Coordinates</Label>
                                                <p className="text-sm mt-1 p-2 bg-gray-50 rounded">
                                                    Lat: {selectedVendor.latitude}, Lng: {selectedVendor.longitude}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Legal & Tax Information */}
                                <div>
                                    <h4 className="font-semibold mb-3 text-lg border-b pb-2">Legal & Tax Information</h4>
                                    <div className="grid lg:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="font-medium">Business License</Label>
                                            {selectedVendor.business_license ? (
                                                // Check if it's a URL (starts with http, https, or /)
                                                selectedVendor.business_license.match(/^(https?:\/\/|\/)/i) ? (
                                                    <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-2">
                                                                <FileText className="h-4 w-4 text-blue-600" />
                                                                <span className="text-sm font-medium text-blue-800">License Document</span>
                                                            </div>
                                                            <div className="flex space-x-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => setPreviewDocument({ url: selectedVendor.business_license!, name: 'Business License' })}
                                                                    className="text-xs"
                                                                >
                                                                    <ExternalLink className="h-3 w-3 mr-1" />
                                                                    Preview
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        const link = document.createElement('a');
                                                                        link.href = selectedVendor.business_license!;
                                                                        link.download = 'business-license';
                                                                        document.body.appendChild(link);
                                                                        link.click();
                                                                        document.body.removeChild(link);
                                                                    }}
                                                                    className="text-xs"
                                                                >
                                                                    <Download className="h-3 w-3 mr-1" />
                                                                    Download
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{selectedVendor.business_license}</p>
                                                )
                                            ) : (
                                                <p className="text-sm mt-1 p-2 bg-gray-50 rounded">Not provided</p>
                                            )}
                                        </div>
                                        <div>
                                            <Label className="font-medium">Tax ID</Label>
                                            <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{selectedVendor.tax_id || selectedVendor.tax_number || 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Banking Information */}
                                <div>
                                    <h4 className="font-semibold mb-3 text-lg border-b pb-2">Banking Information</h4>
                                    <div className="grid lg:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="font-medium">Bank Name</Label>
                                            <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{selectedVendor.bank_name || 'Not provided'}</p>
                                        </div>
                                        <div>
                                            <Label className="font-medium">Account Number</Label>
                                            <p className="text-sm mt-1 p-2 bg-gray-50 rounded">
                                                {selectedVendor.bank_account_number || selectedVendor.bank_account || 'Not provided'}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="font-medium">Account Name</Label>
                                            <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{selectedVendor.bank_account_name || 'Not provided'}</p>
                                        </div>
                                        <div>
                                            <Label className="font-medium">Bank Branch</Label>
                                            <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{selectedVendor.bank_branch || 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Business Documents */}
                                <div>
                                    <h4 className="font-semibold mb-3 text-lg border-b pb-2">Business Documents</h4>
                                    <div className="space-y-3">
                                        {selectedVendor.business_documents ? (
                                            <div className="space-y-2">
                                                {Array.isArray(selectedVendor.business_documents) ? (
                                                    selectedVendor.business_documents.map((doc, index) => {
                                                        const fileName = doc.split('/').pop() || `Document ${index + 1}`;
                                                        const fileExtension = fileName.split('.').pop()?.toLowerCase();
                                                        const isPdf = fileExtension === 'pdf';
                                                        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '');

                                                        return (
                                                            <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center space-x-2">
                                                                        <FileText className="h-4 w-4 text-blue-600" />
                                                                        <span className="text-sm font-medium text-blue-800 truncate">{fileName}</span>
                                                                        {isPdf && <Badge variant="outline" className="text-xs">PDF</Badge>}
                                                                        {isImage && <Badge variant="outline" className="text-xs">Image</Badge>}
                                                                    </div>
                                                                    <div className="flex space-x-2">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => setPreviewDocument({ url: doc, name: fileName })}
                                                                            className="text-xs"
                                                                        >
                                                                            <ExternalLink className="h-3 w-3 mr-1" />
                                                                            Preview
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => {
                                                                                const link = document.createElement('a');
                                                                                link.href = doc;
                                                                                link.download = fileName;
                                                                                document.body.appendChild(link);
                                                                                link.click();
                                                                                document.body.removeChild(link);
                                                                            }}
                                                                            className="text-xs"
                                                                        >
                                                                            <Download className="h-3 w-3 mr-1" />
                                                                            Download
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-2">
                                                                <FileText className="h-4 w-4 text-blue-600" />
                                                                <span className="text-sm font-medium text-blue-800">Business Document</span>
                                                            </div>
                                                            <div className="flex space-x-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => setPreviewDocument({ url: selectedVendor.business_documents as string, name: 'Business Document' })}
                                                                    className="text-xs"
                                                                >
                                                                    <ExternalLink className="h-3 w-3 mr-1" />
                                                                    Preview
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        const link = document.createElement('a');
                                                                        link.href = selectedVendor.business_documents as string;
                                                                        link.download = 'business-document';
                                                                        document.body.appendChild(link);
                                                                        link.click();
                                                                        document.body.removeChild(link);
                                                                    }}
                                                                    className="text-xs"
                                                                >
                                                                    <Download className="h-3 w-3 mr-1" />
                                                                    Download
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                                                <p className="text-sm text-gray-600">No documents uploaded</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Performance Metrics */}
                                <div>
                                    <h4 className="font-semibold mb-3 text-lg border-b pb-2">Performance Metrics</h4>
                                    <div className="grid lg:grid-cols-3 gap-4">
                                        <div className="text-center p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                                            <p className="text-2xl font-bold text-emerald-600">{selectedVendor.products_count || 0}</p>
                                            <p className="text-sm text-emerald-700">Products</p>
                                        </div>
                                        <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-2xl font-bold text-blue-600">{selectedVendor.orders_count || 0}</p>
                                            <p className="text-sm text-blue-700">Orders</p>
                                        </div>
                                        <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <p className="text-2xl font-bold text-yellow-600">{typeof selectedVendor.rating === 'number' ? selectedVendor.rating.toFixed(1) : '0.0'}</p>
                                            <p className="text-sm text-yellow-700">Rating</p>
                                        </div>
                                        <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                            <p className="text-2xl font-bold text-purple-600">{selectedVendor.total_sales || 0}</p>
                                            <p className="text-sm text-purple-700">Total Sales</p>
                                        </div>
                                        <div className="text-center p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                                            <p className="text-2xl font-bold text-indigo-600">{selectedVendor.total_reviews || 0}</p>
                                            <p className="text-sm text-indigo-700">Reviews</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Information */}
                                {selectedVendor.additional_info && (
                                    <div>
                                        <h4 className="font-semibold mb-3 text-lg border-b pb-2">Additional Information</h4>
                                        <div className="p-3 bg-gray-50 rounded-md">
                                            <p className="text-sm">{selectedVendor.additional_info}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Social Media */}
                                {selectedVendor.social_media && (
                                    <div>
                                        <h4 className="font-semibold mb-3 text-lg border-b pb-2">Social Media</h4>
                                        <div className="p-3 bg-gray-50 rounded-md">
                                            <p className="text-sm">
                                                {typeof selectedVendor.social_media === 'object'
                                                    ? JSON.stringify(selectedVendor.social_media, null, 2)
                                                    : selectedVendor.social_media
                                                }
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {/* Status Information */}
                                <div>
                                    <h4 className="font-semibold mb-3 text-lg border-b pb-2">Status & Verification Information</h4>
                                    <div className="grid lg:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="font-medium">Application Status</Label>
                                            <div className="mt-1">
                                                <Badge
                                                    variant={getStatusVariant(selectedVendor.status)}
                                                    className={`${getStatusColor(selectedVendor.status)} px-3 py-1`}
                                                >
                                                    {selectedVendor.status.charAt(0).toUpperCase() + selectedVendor.status.slice(1)}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="font-medium">Verification Status</Label>
                                            <div className="mt-1">
                                                <Badge
                                                    variant={selectedVendor.is_verified ? 'default' : 'secondary'}
                                                    className={`${selectedVendor.is_verified ? 'bg-blue-100 text-blue-700 border-blue-300' : ''} px-3 py-1`}
                                                >
                                                    {selectedVendor.is_verified ? 'Verified' : 'Unverified'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="font-medium">Active Status</Label>
                                            <div className="mt-1">
                                                <Badge
                                                    variant={selectedVendor.is_active ? 'default' : 'secondary'}
                                                    className={`${selectedVendor.is_active ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-red-100 text-red-700 border-red-300'} px-3 py-1`}
                                                >
                                                    {selectedVendor.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="font-medium">Applied On</Label>
                                            <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{new Date(selectedVendor.created_at).toLocaleDateString()}</p>
                                        </div>
                                        {selectedVendor.approved_at && (
                                            <div>
                                                <Label className="font-medium">Approved On</Label>
                                                <p className="text-sm mt-1 p-2 bg-emerald-50 rounded">{new Date(selectedVendor.approved_at).toLocaleDateString()}</p>
                                            </div>
                                        )}
                                        {selectedVendor.verified_at && (
                                            <div>
                                                <Label className="font-medium">Verified On</Label>
                                                <p className="text-sm mt-1 p-2 bg-blue-50 rounded">{new Date(selectedVendor.verified_at).toLocaleDateString()}</p>
                                            </div>
                                        )}
                                        {selectedVendor.verification_notes && (
                                            <div className="col-span-2">
                                                <Label className="font-medium">Verification Notes</Label>
                                                <p className="text-sm mt-1 p-3 bg-blue-50 border border-blue-200 rounded-md">{selectedVendor.verification_notes}</p>
                                            </div>
                                        )}
                                        <div>
                                            <Label className="font-medium">Last Updated</Label>
                                            <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{new Date(selectedVendor.updated_at).toLocaleDateString()}</p>
                                        </div>
                                        {selectedVendor.slug && (
                                            <div>
                                                <Label className="font-medium">URL Slug</Label>
                                                <p className="text-sm mt-1 p-2 bg-gray-50 rounded font-mono">{selectedVendor.slug}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Rejection Reason */}
                                {selectedVendor.rejection_reason && (
                                    <div>
                                        <h4 className="font-semibold mb-3 text-lg border-b pb-2 text-red-600">Rejection Reason</h4>
                                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-sm text-red-700">{selectedVendor.rejection_reason}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                {selectedVendor.status === 'pending' && (
                                    <div className="flex gap-2 pt-4 border-t">
                                        <Button
                                            onClick={() => {
                                                handleApprove(selectedVendor);
                                                setShowDetailsDialog(false);
                                            }}
                                            className="flex-1"
                                        >
                                            <Check className="h-4 w-4 mr-2" />
                                            Approve Vendor
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => {
                                                handleReject(selectedVendor);
                                                setShowDetailsDialog(false);
                                            }}
                                            className="flex-1"
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Reject Application
                                        </Button>
                                    </div>
                                )}

                                {/* Verification Actions for Approved Vendors */}
                                {selectedVendor.status === 'approved' && (
                                    <div className="flex gap-2 pt-4 border-t">
                                        <Button
                                            variant={selectedVendor.is_verified ? "outline" : "default"}
                                            onClick={() => {
                                                handleToggleVerification(selectedVendor);
                                                setShowDetailsDialog(false);
                                            }}
                                            className="flex-1"
                                        >
                                            {selectedVendor.is_verified ? (
                                                <>
                                                    <X className="h-4 w-4 mr-2" />
                                                    Unverify Vendor
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="h-4 w-4 mr-2" />
                                                    Verify Vendor
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => {
                                                handleSuspend(selectedVendor);
                                                setShowDetailsDialog(false);
                                            }}
                                            className="flex-1"
                                        >
                                            <Pause className="h-4 w-4 mr-2" />
                                            Suspend Vendor
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                )}

                {/* Message Vendor Dialog */}
                {selectedVendor && (
                    <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
                        <DialogContent className="h-[80vh] sm:max-w-[80%] max-h-[90vh] overflow-auto">
                            <DialogHeader>
                                <DialogTitle>Message Vendor - {selectedVendor.business_name}</DialogTitle>
                                <DialogDescription>
                                    Send an email notification to the vendor.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subject</Label>
                                    <Input
                                        id="subject"
                                        value={messageSubject}
                                        onChange={(e) => setMessageSubject(e.target.value)}
                                        placeholder="Enter subject..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message">Message</Label>
                                    
                                       <RichTextEditor
                                        value={messageBody}

                                        onChange={(e) => setMessageBody(e)}
                                        placeholder="Type your message here..."
                                        />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowMessageDialog(false)}>Cancel</Button>
                                <Button
                                    onClick={submitMessage}
                                    disabled={!messageSubject || !messageBody || messageSending}
                                >
                                    {messageSending ? 'Sending...' : 'Send Message'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Request Changes Dialog */}
            {selectedVendor && (
                <Dialog open={showRequestChangesDialog} onOpenChange={setShowRequestChangesDialog}>
                    <DialogContent className="h-[80vh] sm:max-w-[80%] max-h-[90vh] overflow-auto">
                        <DialogHeader>
                            <DialogTitle>Request Changes - {selectedVendor.business_name}</DialogTitle>
                            <DialogDescription>
                                Send instructions to the vendor on what needs to be fixed. The application status will be updated to "Changes Requested".
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="req-subject">Subject</Label>
                                <Input
                                    id="req-subject"
                                    value={requestChangesSubject}
                                    onChange={(e) => setRequestChangesSubject(e.target.value)}
                                    placeholder="Enter subject..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="req-message">Message / Instructions</Label>
                               
                                <RichTextEditor
                                    value={requestChangesMessage}

                                    onChange={(e) => setRequestChangesMessage(e)}

                                    placeholder="Detailed instructions on what needs to be changed..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowRequestChangesDialog(false)}>Cancel</Button>
                            <Button
                                onClick={submitRequestChanges}
                                disabled={!requestChangesSubject || !requestChangesMessage || requestChangesSending}
                            >
                                {requestChangesSending ? 'Sending...' : 'Request Changes'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Document Preview Modal */}
            {previewDocument && (
                <Dialog open={!!previewDocument} onOpenChange={() => setPreviewDocument(null)}>
                    <DialogContent className="max-w-7xl min-w-[70%] break-words max-h-[90vh] overflow-hidden">
                        <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                                <FileText className="h-5 w-5" />
                                <span>Document Preview: {previewDocument.name}</span>
                            </DialogTitle>
                            <DialogDescription>
                                Preview of the vendor document. You can download it using the button below.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex-1 overflow-hidden">
                            <div className="h-[60vh] border rounded-lg overflow-hidden bg-gray-50">
                                {previewDocument.url.toLowerCase().endsWith('.pdf') ? (
                                    <iframe
                                        src={previewDocument.url}
                                        className="w-full h-full border-0"
                                        title={previewDocument.name}
                                    />
                                ) : previewDocument.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                    <div className="w-full h-full flex items-center justify-center p-4">
                                        <img
                                            src={previewDocument.url}
                                            alt={previewDocument.name}
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center p-8">
                                        <div className="text-center">
                                            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                            <p className="text-lg font-medium text-gray-600 mb-2">Preview not available</p>
                                            <p className="text-sm text-gray-500 mb-4">This file type cannot be previewed in the browser</p>
                                            <Button
                                                onClick={() => window.open(previewDocument.url, '_blank')}
                                                className="mr-2"
                                            >
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                Open in New Tab
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t">
                            <Button
                                variant="outline"
                                onClick={() => window.open(previewDocument.url, '_blank')}
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Open in New Tab
                            </Button>
                            <div className="space-x-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = previewDocument.url;
                                        link.download = previewDocument.name;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                    }}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </Button>
                                <Button onClick={() => setPreviewDocument(null)}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </AdminLayout>
    );
}
