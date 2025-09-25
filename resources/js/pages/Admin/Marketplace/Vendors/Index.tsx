import React, { ReactNode, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    Mail,
    Calendar,
    Filter,
    MoreHorizontal,
    Download
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
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

interface Vendor {
    business_documents(business_documents: any): unknown;
    business_phone: ReactNode;
    business_type: ReactNode;
    business_address: ReactNode;
    id: number;
    user_id: number;
    business_name: string;
    business_description: string;
    contact_person: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    business_license: string | null;
    tax_id: string | null;
    bank_account: string | null;
    status: 'pending' | 'approved' | 'rejected' | 'suspended';
    is_verified: boolean;
    is_active: boolean;
    rating: number;
    total_sales: number;
    products_count: number;
    orders_count: number;
    rejection_reason: string | null;
    approved_at: string | null;
    created_at: string;
    updated_at: string;
    user: {
        name: string;
        email: string;
    };
}

interface VendorAdminProps {
    vendors: {
        data: Vendor[];
        links?: any[];
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
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [verificationFilter, setVerificationFilter] = useState(filters.verification || 'all');

    const handleSearch = () => {
        router.get('/admin/marketplace/vendors', {
            search: searchTerm,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            verification: verificationFilter !== 'all' ? verificationFilter : undefined,
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
                        console.log('Vendor approved successfully');
                        toast.success('Vendor approved successfully');
                    },
                    onError: (error) => {
                        toast.error('Failed to approve vendor');
                        console.error('Error approving vendor:', error);
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
                        console.log('Vendor rejected successfully');
                        toast.success('Vendor rejected successfully');
                    },
                    onError: (error) => {
                        toast.error('Failed to reject vendor');
                        console.error('Error rejecting vendor:', error);
                    }
                });
        }
    };

    const handleSuspend = (vendor: Vendor) => {
        const reason = prompt(`Please provide a reason for suspending ${vendor.business_name}:`);
        if (reason) {
            router.post(`/admin/marketplace/vendors/${vendor.id}/suspend`, {
                reason: reason
            },
                {
                    onSuccess: () => {
                        console.log('Vendor suspended successfully');
                        toast.success('Vendor suspended successfully');
                    },
                    onError: (error) => {
                        toast.error('Failed to suspend vendor');
                        console.error('Error suspending vendor:', error);
                    }
                });
        }
    };

    const handleReactivate = (vendor: Vendor) => {
        if (confirm(`Are you sure you want to reactivate ${vendor.business_name}?`)) {
            router.post(`/admin/marketplace/vendors/${vendor.id}/reactivate`, {},
                {
                    onSuccess: () => {
                        console.log('Vendor reactivated successfully');
                        toast.success('Vendor reactivated successfully');
                    },
                    onError: (error) => {
                        toast.error('Failed  to reactivate vendor');
                        console.error('Error reactivating vendor:', error);
                    }
                });
        }
    };

    const handleToggleVerification = (vendor: Vendor) => {
        const action = vendor.is_verified ? 'unverify' : 'verify';
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
                        console.error(`Error ${message}ing vendor:`, error);
                    }
                });
        }
    };

    const viewDetails = (vendor: Vendor) => {
        setSelectedVendor(vendor);
        setShowDetailsDialog(true);
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
                                                    <div className="font-medium">{vendor.business_name}</div>
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
                                                        <DropdownMenuItem onClick={() => viewDetails(vendor)}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        {vendor.status === 'pending' && (
                                                            <>
                                                                <DropdownMenuItem onClick={() => handleApprove(vendor)}>
                                                                    <Check className="h-4 w-4 mr-2" />
                                                                    Approve
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
                                                        {vendor.status === 'approved' && (
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
                                    {vendors.links?.map((link: any, index: number) => (
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
                    console.log(selectedVendor),
                    <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                        <DialogContent className="max-w-6xl lg:min-w-6xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Vendor Details - {selectedVendor.business_name}</DialogTitle>
                                <DialogDescription>
                                    Complete vendor application information
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                                {/* Business Information */}
                                <div>
                                    <h4 className="font-semibold mb-3">Business Information</h4>
                                    <div className="grid lg:grid-cols-2  gap-4">
                                        <div>
                                            <Label>Business Name</Label>
                                            <p className="text-sm">{selectedVendor.business_name}</p>
                                        </div>
                                        <div>
                                            <Label>Contact Person</Label>
                                            <p className="text-sm">{selectedVendor.contact_person}</p>
                                        </div>
                                        <div>
                                            <Label>Email</Label>
                                            <p className="text-sm">{selectedVendor.email}</p>
                                        </div>
                                        <div>
                                            <Label>Phone</Label>
                                            <p className="text-sm">{selectedVendor.phone}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Business Description */}
                                <div>
                                    <Label>Business Description</Label>
                                    <p className="text-sm mt-1">{selectedVendor.business_description}</p>
                                </div>

                                {/* Address */}
                                <div>
                                    <h4 className="font-semibold mb-3">Address</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <Label>Street Address</Label>
                                            <p className="text-sm">{selectedVendor.address}</p>
                                        </div>
                                        <div>
                                            <Label>City</Label>
                                            <p className="text-sm">{selectedVendor.city}</p>
                                        </div>
                                        <div>
                                            <Label>State/Province</Label>
                                            <p className="text-sm">{selectedVendor.state}</p>
                                        </div>
                                        <div>
                                            <Label>Postal Code</Label>
                                            <p className="text-sm">{selectedVendor.postal_code}</p>
                                        </div>
                                        <div>
                                            <Label>Country</Label>
                                            <p className="text-sm">{selectedVendor.country}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Business Documents */}
                                <div>
                                    <h4 className="font-semibold mb-3">Business Documents</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className=''>
                                            {
                                                    selectedVendor.business_documents ? (
                                                        <a href={selectedVendor.business_documents} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center">
                                                            <Download className="h-4 w-4 mr-1" />
                                                            View Document
                                                        </a>
                                                    ) : (
                                                        <p className="text-sm">No document provided</p>
                                                    )
                                            }
                                        </div>
                                        <div>
                                            <Label>Tax ID</Label>
                                            <p className="text-sm">{selectedVendor.tax_id || 'Not provided'}</p>
                                        </div>
                                        <div>
                                            <Label>Bank Account</Label>
                                            <p className="text-sm">{selectedVendor.bank_account || 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>


                                {/* Status Information */}
                                <div>
                                    <h4 className="font-semibold mb-3">Status Information</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Application Status</Label>
                                            <div className="mt-1">
                                                <Badge
                                                    variant={getStatusVariant(selectedVendor.status)}
                                                    className={getStatusColor(selectedVendor.status)}
                                                >
                                                    {selectedVendor.status.charAt(0).toUpperCase() + selectedVendor.status.slice(1)}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Verification Status</Label>
                                            <div className="mt-1">
                                                <Badge
                                                    variant={selectedVendor.is_verified ? 'default' : 'secondary'}
                                                    className={selectedVendor.is_verified ? 'bg-blue-100 text-blue-700 border-blue-300' : ''}
                                                >
                                                    {selectedVendor.is_verified ? 'Verified' : 'Unverified'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Applied On</Label>
                                            <p className="text-sm">{new Date(selectedVendor.created_at).toLocaleDateString()}</p>
                                        </div>
                                        {selectedVendor.approved_at && (
                                            <div>
                                                <Label>Approved On</Label>
                                                <p className="text-sm">{new Date(selectedVendor.approved_at).toLocaleDateString()}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Rejection Reason */}
                                {selectedVendor.rejection_reason && (
                                    <div>
                                        <Label>Rejection Reason</Label>
                                        <p className="text-sm mt-1 p-3 bg-red-50 border border-red-200 rounded-md">
                                            {selectedVendor.rejection_reason}
                                        </p>
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
            </div>
        </AdminLayout>
    );
}
