import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
    ArrowLeft, Store, Package, ShoppingCart, DollarSign, Star, Check, X, Pause, Play,
    MapPin, Phone, Mail, Globe, Building2, CreditCard, FileText, Shield, Clock, Pencil,
    Trash2, Send, MessageSquare, Eye, TrendingUp, Users, AlertTriangle, Save,
} from 'lucide-react';
import { toast } from 'sonner';

interface Product {
    id: number;
    name: string;
    sku: string;
    price: number;
    stock_quantity: number;
    status: string;
    is_featured: boolean;
    rating: number;
    order_items_count: number;
    created_at: string;
}

interface Order {
    id: number;
    order_number: string;
    total_amount: number;
    status: string;
    payment_status: string;
    created_at: string;
    user: { id: number; name: string; email: string };
}

interface Vendor {
    id: number;
    user_id: number;
    business_name: string;
    business_type: string | null;
    description: string | null;
    business_description: string | null;
    logo: string | null;
    banner_image: string | null;
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
    latitude: number | null;
    longitude: number | null;
    business_license: string | null;
    business_registration_number: string | null;
    tax_id: string | null;
    tax_number: string | null;
    business_documents: string[] | null;
    bank_name: string | null;
    bank_account_number: string | null;
    bank_account_name: string | null;
    bank_branch: string | null;
    years_in_business: number | null;
    specializations: string[] | null;
    slug: string | null;
    status: string;
    is_verified: boolean;
    is_active: boolean;
    rating: number | null;
    total_reviews: number;
    total_sales: number;
    commission_rate: number | null;
    verification_notes: string | null;
    verified_at: string | null;
    rejection_reason: string | null;
    admin_notes: string | null;
    approved_at: string | null;
    social_media: Record<string, string> | null;
    additional_info: string | null;
    created_at: string;
    updated_at: string;
    user: { id: number; name: string; email: string };
    products: Product[];
    orders: Order[];
}

interface Props {
    vendor: Vendor;
    stats: {
        total_products: number;
        active_products: number;
        total_orders: number;
        completed_orders: number;
        total_revenue: number;
        average_rating: number;
    };
}

export default function Show({ vendor, stats }: Props) {
    const { auth } = usePage<{ auth: { user: any; permissions: string[] } }>().props;
    const can = (perm: string | string[]) => {
        if (auth.user?.role === 'admin') return true;
        const perms = auth.permissions || [];
        return Array.isArray(perm) ? perm.some(p => perms.includes(p)) : perms.includes(perm);
    };

    const [adminNotes, setAdminNotes] = useState(vendor.admin_notes || '');
    const [commissionRate, setCommissionRate] = useState(String(vendor.commission_rate ?? ''));
    const [showMessageDialog, setShowMessageDialog] = useState(false);
    const [msgSubject, setMsgSubject] = useState('');
    const [msgBody, setMsgBody] = useState('');
    const [msgSending, setMsgSending] = useState(false);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('rw-RW', { style: 'currency', currency: 'RWF' }).format(amount);

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    const getStatusBadge = (status: string) => {
        const map: Record<string, { variant: 'default' | 'destructive' | 'outline' | 'secondary'; className: string }> = {
            approved: { variant: 'default', className: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
            pending: { variant: 'outline', className: 'bg-orange-100 text-orange-700 border-orange-300' },
            rejected: { variant: 'destructive', className: '' },
            suspended: { variant: 'secondary', className: 'bg-gray-100 text-gray-700' },
            changes_requested: { variant: 'outline', className: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
        };
        const cfg = map[status] || { variant: 'outline' as const, className: '' };
        return <Badge variant={cfg.variant} className={cfg.className}>{status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</Badge>;
    };

    const handleApprove = () => {
        if (confirm(`Approve "${vendor.business_name}"?`)) {
            router.post(`/admin/marketplace/vendors/${vendor.id}/approve`, {}, {
                onSuccess: () => toast.success('Vendor approved'),
            });
        }
    };

    const handleReject = () => {
        const reason = prompt(`Reason for rejecting "${vendor.business_name}":`);
        if (reason) {
            router.post(`/admin/marketplace/vendors/${vendor.id}/reject`, { reason }, {
                onSuccess: () => toast.success('Vendor rejected'),
            });
        }
    };

    const handleSuspend = () => {
        const reason = prompt(`Reason for suspending "${vendor.business_name}":\n\nThis will deactivate all their products.`);
        if (reason) {
            router.post(`/admin/marketplace/vendors/${vendor.id}/suspend`, { reason }, {
                onSuccess: () => toast.success('Vendor suspended'),
            });
        }
    };

    const handleReactivate = () => {
        if (confirm(`Reactivate "${vendor.business_name}"?`)) {
            router.post(`/admin/marketplace/vendors/${vendor.id}/reactivate`, {}, {
                onSuccess: () => toast.success('Vendor reactivated'),
            });
        }
    };

    const handleToggleVerification = () => {
        router.patch(`/admin/marketplace/vendors/${vendor.id}/toggle-verification`, {}, {
            onSuccess: () => toast.success('Verification status updated'),
        });
    };

    const handleSaveNotes = () => {
        router.patch(`/admin/marketplace/vendors/${vendor.id}/notes`, { admin_notes: adminNotes }, {
            onSuccess: () => toast.success('Notes saved'),
        });
    };

    const handleSaveCommission = () => {
        router.patch(`/admin/marketplace/vendors/${vendor.id}/commission`, {
            commission_rate: parseFloat(commissionRate),
        }, {
            onSuccess: () => toast.success('Commission rate updated'),
        });
    };

    const submitMessage = () => {
        if (!msgSubject || !msgBody) return;
        setMsgSending(true);
        router.post(`/admin/marketplace/vendors/${vendor.id}/message`, {
            subject: msgSubject, message: msgBody,
        }, {
            onSuccess: () => { toast.success('Message sent'); setShowMessageDialog(false); },
            onError: () => toast.error('Failed to send message'),
            onFinish: () => setMsgSending(false),
        });
    };

    const handleDelete = () => {
        if (confirm(`Delete "${vendor.business_name}"? This cannot be undone.`)) {
            router.delete(`/admin/marketplace/vendors/${vendor.id}`, {
                onSuccess: () => toast.success('Vendor deleted'),
                onError: () => toast.error('Failed to delete vendor'),
            });
        }
    };

    const InfoItem = ({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: any }) => (
        <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
                {Icon && <Icon className="h-3 w-3" />} {label}
            </Label>
            <p className="text-sm font-medium mt-0.5">{value || <span className="text-muted-foreground italic">Not provided</span>}</p>
        </div>
    );

    return (
        <AdminLayout>
            <Head title={`${vendor.business_name} - Vendor Management`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/marketplace/vendors">
                            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
                        </Link>
                        <div className="flex items-center gap-4">
                            {vendor.logo && (
                                <img src={vendor.logo} alt="" className="h-12 w-12 rounded-full object-cover border" />
                            )}
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold tracking-tight">{vendor.business_name}</h1>
                                    {getStatusBadge(vendor.status)}
                                    {vendor.is_verified && (
                                        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                                            <Shield className="h-3 w-3 mr-1" /> Verified
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-muted-foreground text-sm mt-0.5">
                                    {vendor.business_type} &middot; {vendor.user?.name} ({vendor.user?.email}) &middot; Joined {formatDate(vendor.created_at)}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {(vendor.status === 'pending' || vendor.status === 'changes_requested') && can('approve-vendors') && (
                            <>
                                <Button size="sm" onClick={handleApprove}><Check className="h-4 w-4 mr-1" /> Approve</Button>
                                <Button size="sm" variant="destructive" onClick={handleReject}><X className="h-4 w-4 mr-1" /> Reject</Button>
                            </>
                        )}
                        {vendor.status === 'approved' && can('suspend-vendors') && (
                            <Button size="sm" variant="outline" onClick={handleSuspend}><Pause className="h-4 w-4 mr-1" /> Suspend</Button>
                        )}
                        {vendor.status === 'suspended' && can('suspend-vendors') && (
                            <Button size="sm" variant="outline" onClick={handleReactivate}><Play className="h-4 w-4 mr-1" /> Reactivate</Button>
                        )}
                        {vendor.status === 'approved' && can('edit-vendor-details') && (
                            <Button size="sm" variant="outline" onClick={handleToggleVerification}>
                                <Shield className="h-4 w-4 mr-1" /> {vendor.is_verified ? 'Unverify' : 'Verify'}
                            </Button>
                        )}
                        {can('message-vendors') && (
                            <Button size="sm" variant="outline" onClick={() => setShowMessageDialog(true)}>
                                <Send className="h-4 w-4 mr-1" /> Message
                            </Button>
                        )}
                        {can('edit-vendor-details') && (
                            <Link href={`/admin/marketplace/vendors/${vendor.id}/edit`}>
                                <Button size="sm" variant="outline"><Pencil className="h-4 w-4 mr-1" /> Edit</Button>
                            </Link>
                        )}
                        {can('edit-vendor-details') && (
                            <Button size="sm" variant="destructive" onClick={handleDelete}>
                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Card><CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-2"><Package className="h-4 w-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Products</span></div>
                        <p className="text-2xl font-bold mt-1">{stats.total_products}</p>
                        <p className="text-xs text-muted-foreground">{stats.active_products} active</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Orders</span></div>
                        <p className="text-2xl font-bold mt-1">{stats.total_orders}</p>
                        <p className="text-xs text-muted-foreground">{stats.completed_orders} completed</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Revenue</span></div>
                        <p className="text-2xl font-bold mt-1">{formatCurrency(stats.total_revenue)}</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-2"><Star className="h-4 w-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Avg Rating</span></div>
                        <p className="text-2xl font-bold mt-1">{Number(stats.average_rating).toFixed(1)}</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Total Sales</span></div>
                        <p className="text-2xl font-bold mt-1">{vendor.total_sales}</p>
                    </CardContent></Card>
                    <Card><CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Reviews</span></div>
                        <p className="text-2xl font-bold mt-1">{vendor.total_reviews}</p>
                    </CardContent></Card>
                </div>

                {/* Rejection / Suspension Banner */}
                {vendor.rejection_reason && vendor.status === 'rejected' && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-4 pb-4 flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-red-700">Rejection Reason</p>
                                <p className="text-sm text-red-600 mt-1">{vendor.rejection_reason}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tabs */}
                <Tabs defaultValue="overview">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="products">Products ({stats.total_products})</TabsTrigger>
                        <TabsTrigger value="orders">Orders ({stats.total_orders})</TabsTrigger>
                        <TabsTrigger value="admin">Admin Controls</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Business Info */}
                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Business Information</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <InfoItem label="Business Name" value={vendor.business_name} icon={Store} />
                                    <InfoItem label="Business Type" value={vendor.business_type} />
                                    <InfoItem label="Registration Number" value={vendor.business_registration_number} />
                                    <InfoItem label="Years in Business" value={vendor.years_in_business} />
                                    <InfoItem label="Commission Rate" value={vendor.commission_rate ? `${vendor.commission_rate}%` : 'Default'} />
                                    <InfoItem label="Slug" value={vendor.slug} />
                                    <div className="col-span-2">
                                        <Label className="text-xs text-muted-foreground">Description</Label>
                                        <p className="text-sm mt-0.5">{vendor.business_description || vendor.description || <span className="text-muted-foreground italic">No description</span>}</p>
                                    </div>
                                    {vendor.specializations && (
                                        <div className="col-span-2">
                                            <Label className="text-xs text-muted-foreground">Specializations</Label>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {(Array.isArray(vendor.specializations) ? vendor.specializations : []).map((s, i) => (
                                                    <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Contact Info */}
                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5" /> Contact Information</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <InfoItem label="Primary Email" value={vendor.email} icon={Mail} />
                                    <InfoItem label="Business Email" value={vendor.business_email} icon={Mail} />
                                    <InfoItem label="Primary Phone" value={vendor.phone} icon={Phone} />
                                    <InfoItem label="Business Phone" value={vendor.business_phone} icon={Phone} />
                                    <InfoItem label="Website" value={
                                        (vendor.website || vendor.business_website) ? (
                                            <a href={vendor.website || vendor.business_website || ''} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                                <Globe className="h-3 w-3" /> {vendor.website || vendor.business_website}
                                            </a>
                                        ) : null
                                    } />
                                    <InfoItem label="Owner Account" value={`${vendor.user?.name} (${vendor.user?.email})`} icon={Users} />
                                </CardContent>
                            </Card>

                            {/* Address */}
                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Address</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2"><InfoItem label="Street Address" value={vendor.address || vendor.business_address} icon={MapPin} /></div>
                                    <InfoItem label="City" value={vendor.city} />
                                    <InfoItem label="State/Province" value={vendor.state} />
                                    <InfoItem label="Postal Code" value={vendor.postal_code} />
                                    <InfoItem label="Country" value={vendor.country} />
                                    {vendor.latitude && vendor.longitude && (
                                        <div className="col-span-2"><InfoItem label="GPS Coordinates" value={`${vendor.latitude}, ${vendor.longitude}`} /></div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Banking & Legal */}
                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> Banking & Legal</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <InfoItem label="Bank Name" value={vendor.bank_name} />
                                    <InfoItem label="Account Number" value={vendor.bank_account_number} />
                                    <InfoItem label="Account Name" value={vendor.bank_account_name} />
                                    <InfoItem label="Bank Branch" value={vendor.bank_branch} />
                                    <InfoItem label="Tax ID" value={vendor.tax_id || vendor.tax_number} />
                                    <InfoItem label="Business License" value={
                                        vendor.business_license ? (
                                            <a href={vendor.business_license} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                                <FileText className="h-3 w-3" /> View License
                                            </a>
                                        ) : null
                                    } />
                                </CardContent>
                            </Card>

                            {/* Documents */}
                            {vendor.business_documents && vendor.business_documents.length > 0 && (
                                <Card className="lg:col-span-2">
                                    <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Business Documents</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {(Array.isArray(vendor.business_documents) ? vendor.business_documents : []).map((doc, i) => {
                                                const fileName = doc.split('/').pop() || `Document ${i + 1}`;
                                                return (
                                                    <a key={i} href={doc} target="_blank" rel="noopener noreferrer"
                                                        className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors">
                                                        <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                                                        <span className="text-sm text-blue-800 truncate">{fileName}</span>
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Social Media */}
                            {vendor.social_media && Object.keys(vendor.social_media).length > 0 && (
                                <Card>
                                    <CardHeader><CardTitle>Social Media</CardTitle></CardHeader>
                                    <CardContent className="grid grid-cols-2 gap-4">
                                        {Object.entries(vendor.social_media).map(([platform, url]) => (
                                            <InfoItem key={platform} label={platform.charAt(0).toUpperCase() + platform.slice(1)} value={
                                                url ? <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{url}</a> : null
                                            } />
                                        ))}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Status Timeline */}
                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Status Timeline</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                                        <span className="text-sm">Applied</span>
                                        <span className="text-sm font-medium">{formatDate(vendor.created_at)}</span>
                                    </div>
                                    {vendor.approved_at && (
                                        <div className="flex justify-between items-center p-2 bg-emerald-50 rounded">
                                            <span className="text-sm text-emerald-700">Approved</span>
                                            <span className="text-sm font-medium text-emerald-700">{formatDate(vendor.approved_at)}</span>
                                        </div>
                                    )}
                                    {vendor.verified_at && (
                                        <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                                            <span className="text-sm text-blue-700">Verified</span>
                                            <span className="text-sm font-medium text-blue-700">{formatDate(vendor.verified_at)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                                        <span className="text-sm">Last Updated</span>
                                        <span className="text-sm font-medium">{formatDate(vendor.updated_at)}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Products Tab */}
                    <TabsContent value="products">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Products</CardTitle>
                                <CardDescription>Last 10 products from this vendor</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>SKU</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Stock</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Orders</TableHead>
                                            <TableHead>Rating</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {vendor.products?.length > 0 ? vendor.products.map(product => (
                                            <TableRow key={product.id}>
                                                <TableCell>
                                                    <Link href={`/admin/marketplace/products/${product.id}`} className="font-medium hover:underline">
                                                        {product.name}
                                                    </Link>
                                                    {product.is_featured && <Badge variant="outline" className="ml-2 text-xs bg-yellow-100 text-yellow-700">Featured</Badge>}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">{product.sku}</TableCell>
                                                <TableCell>{formatCurrency(product.price)}</TableCell>
                                                <TableCell>
                                                    <Badge variant={product.stock_quantity > 0 ? 'outline' : 'destructive'}>
                                                        {product.stock_quantity}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(product.status)}</TableCell>
                                                <TableCell>{product.order_items_count}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Star className="h-3 w-3 text-yellow-400" />
                                                        <span className="text-sm">{Number(product.rating || 0).toFixed(1)}</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No products yet</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Orders Tab */}
                    <TabsContent value="orders">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Orders</CardTitle>
                                <CardDescription>Last 10 orders for this vendor</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order #</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Payment</TableHead>
                                            <TableHead>Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {vendor.orders?.length > 0 ? vendor.orders.map(order => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-medium">{order.order_number || `#${order.id}`}</TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="text-sm font-medium">{order.user?.name}</p>
                                                        <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                                                <TableCell>{getStatusBadge(order.status)}</TableCell>
                                                <TableCell>{getStatusBadge(order.payment_status)}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{formatDate(order.created_at)}</TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No orders yet</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Admin Controls Tab */}
                    <TabsContent value="admin">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Commission */}
                            {can('edit-vendor-details') && (
                                <Card>
                                    <CardHeader><CardTitle>Commission Rate</CardTitle></CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <Label htmlFor="commission">Rate (%)</Label>
                                            <div className="flex gap-2 mt-1">
                                                <Input id="commission" type="number" min="0" max="100" step="0.1"
                                                    value={commissionRate} onChange={e => setCommissionRate(e.target.value)} />
                                                <Button onClick={handleSaveCommission}><Save className="h-4 w-4 mr-1" /> Save</Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Admin Notes */}
                            {can('edit-vendor-details') && (
                                <Card>
                                    <CardHeader><CardTitle>Admin Notes</CardTitle></CardHeader>
                                    <CardContent className="space-y-3">
                                        <Textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={4} placeholder="Internal notes about this vendor..." />
                                        <Button onClick={handleSaveNotes}><Save className="h-4 w-4 mr-1" /> Save Notes</Button>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Verification Info */}
                            <Card>
                                <CardHeader><CardTitle>Verification Details</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Status</span>
                                        <Badge variant={vendor.is_verified ? 'default' : 'secondary'}
                                            className={vendor.is_verified ? 'bg-blue-100 text-blue-700 border-blue-300' : ''}>
                                            {vendor.is_verified ? 'Verified' : 'Unverified'}
                                        </Badge>
                                    </div>
                                    {vendor.verified_at && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Verified At</span>
                                            <span className="text-sm font-medium">{formatDate(vendor.verified_at)}</span>
                                        </div>
                                    )}
                                    {vendor.verification_notes && (
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Notes</Label>
                                            <p className="text-sm mt-1 p-2 bg-muted rounded">{vendor.verification_notes}</p>
                                        </div>
                                    )}
                                    {can('edit-vendor-details') && (
                                        <Button variant="outline" className="w-full" onClick={handleToggleVerification}>
                                            <Shield className="h-4 w-4 mr-1" /> {vendor.is_verified ? 'Remove Verification' : 'Verify Vendor'}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                                <CardContent className="space-y-2">
                                    {can('message-vendors') && (
                                        <Button variant="outline" className="w-full justify-start" onClick={() => setShowMessageDialog(true)}>
                                            <Send className="h-4 w-4 mr-2" /> Send Message to Vendor
                                        </Button>
                                    )}
                                    {vendor.status === 'approved' && can('suspend-vendors') && (
                                        <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700" onClick={handleSuspend}>
                                            <Pause className="h-4 w-4 mr-2" /> Suspend Vendor
                                        </Button>
                                    )}
                                    {vendor.status === 'suspended' && can('suspend-vendors') && (
                                        <Button variant="outline" className="w-full justify-start text-emerald-600" onClick={handleReactivate}>
                                            <Play className="h-4 w-4 mr-2" /> Reactivate Vendor
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Message Dialog */}
            <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Message {vendor.business_name}</DialogTitle>
                        <DialogDescription>Send an email notification to the vendor</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="msg-subject">Subject</Label>
                            <Input id="msg-subject" value={msgSubject} onChange={e => setMsgSubject(e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="msg-body">Message</Label>
                            <Textarea id="msg-body" value={msgBody} onChange={e => setMsgBody(e.target.value)} rows={5} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowMessageDialog(false)}>Cancel</Button>
                        <Button onClick={submitMessage} disabled={msgSending || !msgSubject || !msgBody}>
                            <Send className="h-4 w-4 mr-1" /> {msgSending ? 'Sending...' : 'Send'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
