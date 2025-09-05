import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2, Search, MoreHorizontal, Check, X } from 'lucide-react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface DataItem {
    id: number;
    name: string;
    created_at: string;
    [key: string]: any;
}

interface DataTableProps {
    title: string;
    data: DataItem[];
    columns: { key: string; label: string; type?: string }[];
    type: 'feed_types' | 'feed_programs' | 'suppliers';
    onEdit?: (item: DataItem) => void;
    onDelete?: (id: number) => void;
}

export default function DataTable({ title, data, columns, type, onEdit, onDelete }: DataTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [editingItem, setEditingItem] = useState<DataItem | null>(null);
    const [editFormData, setEditFormData] = useState<any>({});
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

    const filteredData = data.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedItems(filteredData.map(item => item.id));
        } else {
            setSelectedItems([]);
        }
    };

    const handleSelectItem = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedItems([...selectedItems, id]);
        } else {
            setSelectedItems(selectedItems.filter(itemId => itemId !== id));
        }
    };

    const handleEdit = (item: DataItem) => {
        setEditingItem(item);
        setEditFormData({ ...item });
    };

    const handleSaveEdit = () => {
        if (!editingItem) return;

        router.put(`/admin/feed-templates/${type.replace('_', '-')}/${editingItem.id}`, editFormData, {
            onSuccess: () => {
                toast.success('Item updated successfully');
                setEditingItem(null);
                setEditFormData({});
            },
            onError: () => {
                toast.error('Failed to update item');
            }
        });
    };

    const handleDelete = (id: number) => {
        router.delete(`/admin/feed-templates/${type.replace('_', '-')}/${id}`, {
            onSuccess: () => {
                toast.success('Item deleted successfully');
                setShowDeleteDialog(false);
                setItemToDelete(null);
            },
            onError: () => {
                toast.error('Failed to delete item');
            }
        });
    };

    const handleBulkDelete = () => {
        router.post('/admin/feed-templates/bulk-delete', {
            type: type,
            ids: selectedItems
        }, {
            onSuccess: () => {
                toast.success(`${selectedItems.length} items deleted successfully`);
                setSelectedItems([]);
                setShowBulkDeleteDialog(false);
            },
            onError: () => {
                toast.error('Failed to delete items');
            }
        });
    };

    const renderCellValue = (item: DataItem, column: { key: string; type?: string }) => {
        const value = item[column.key];

        switch (column.type) {
            case 'date':
                return new Date(value).toLocaleDateString();
            case 'currency':
                return `$${parseFloat(value || 0).toFixed(2)}`;
            case 'percentage':
                return `${value}%`;
            case 'rating':
                return (
                    <div className="flex items-center">
                        <span className="mr-1">⭐</span>
                        {parseFloat(value || 0).toFixed(1)}
                    </div>
                );
            case 'json':
                try {
                    const parsed = JSON.parse(value || '[]');
                    return Array.isArray(parsed) ? parsed.join(', ') : value;
                } catch {
                    return value;
                }
            default:
                return value || '-';
        }
    };

    const renderEditField = (column: { key: string; label: string; type?: string }) => {
        const value = editFormData[column.key] || '';

        switch (column.type) {
            case 'textarea':
                return (
                    <Textarea
                        value={value}
                        onChange={(e) => setEditFormData({ ...editFormData, [column.key]: e.target.value })}
                        placeholder={column.label}
                    />
                );
            case 'select':
                if (column.key === 'category') {
                    return (
                        <Select value={value} onValueChange={(val) => setEditFormData({ ...editFormData, [column.key]: val })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Starter">Starter</SelectItem>
                                <SelectItem value="Grower">Grower</SelectItem>
                                <SelectItem value="Finisher">Finisher</SelectItem>
                                <SelectItem value="Layer">Layer</SelectItem>
                            </SelectContent>
                        </Select>
                    );
                }
                return (
                    <Input
                        type="text"
                        value={value}
                        onChange={(e) => setEditFormData({ ...editFormData, [column.key]: e.target.value })}
                        placeholder={column.label}
                    />
                );
            case 'number':
                return (
                    <Input
                        type="number"
                        step="0.01"
                        value={value}
                        onChange={(e) => setEditFormData({ ...editFormData, [column.key]: e.target.value })}
                        placeholder={column.label}
                    />
                );
            case 'email':
                return (
                    <Input
                        type="email"
                        value={value}
                        onChange={(e) => setEditFormData({ ...editFormData, [column.key]: e.target.value })}
                        placeholder={column.label}
                    />
                );
            default:
                return (
                    <Input
                        type="text"
                        value={value}
                        onChange={(e) => setEditFormData({ ...editFormData, [column.key]: e.target.value })}
                        placeholder={column.label}
                    />
                );
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>{title}</CardTitle>
                    <div className="flex items-center gap-2">
                        {selectedItems.length > 0 && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setShowBulkDeleteDialog(true)}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Selected ({selectedItems.length})
                            </Button>
                        )}
                        <div className="relative">
                            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-64"
                            />
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {filteredData.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No data available. Upload some templates to get started.
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={selectedItems.length === filteredData.length && filteredData.length > 0}
                                            onCheckedChange={handleSelectAll}
                                        />
                                    </TableHead>
                                    {columns.map((column) => (
                                        <TableHead key={column.key}>{column.label}</TableHead>
                                    ))}
                                    <TableHead className="w-16">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedItems.includes(item.id)}
                                                onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                                            />
                                        </TableCell>
                                        {columns.map((column) => (
                                            <TableCell key={column.key}>
                                                {renderCellValue(item, column)}
                                            </TableCell>
                                        ))}
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(item)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setItemToDelete(item.id);
                                                        setShowDeleteDialog(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>

            {/* Edit Dialog */}
            <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit {editingItem?.name}</DialogTitle>
                        <DialogDescription>
                            Make changes to the item. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {columns.filter(col => col.key !== 'created_at' && col.key !== 'id').map((column) => (
                            <div key={column.key} className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor={column.key} className="text-right">
                                    {column.label}
                                </Label>
                                <div className="col-span-3">
                                    {renderEditField(column)}
                                </div>
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingItem(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEdit}>Save changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this item? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={() => itemToDelete && handleDelete(itemToDelete)}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Delete Confirmation Dialog */}
            <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Bulk Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedItems.length} selected items? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowBulkDeleteDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleBulkDelete}>
                            Delete {selectedItems.length} items
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
