import AdminLayout from '@/layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Shield, Key, Users, Save, Search, CheckSquare, Square } from 'lucide-react';
import { toast } from 'sonner';

interface Permission {
    id: number;
    name: string;
    slug: string;
    group: string;
    description: string | null;
}

interface Role {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_default: boolean;
    permissions: Permission[];
}

interface GroupedPermissions {
    group: string;
    permissions: Permission[];
}

interface Props {
    roles: Role[];
    permissions: Permission[];
    groupedPermissions: GroupedPermissions[];
}

export default function Index({ roles, permissions, groupedPermissions }: Props) {
    const [showRoleDialog, setShowRoleDialog] = useState(false);
    const [showPermissionDialog, setShowPermissionDialog] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [selectedRole, setSelectedRole] = useState<Role | null>(roles[0] || null);
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>(
        roles[0]?.permissions.map((p) => p.id) || []
    );
    const [roleForm, setRoleForm] = useState({ name: '', description: '' });
    const [permissionForm, setPermissionForm] = useState({ name: '', group: '', description: '' });
    const [showDeleteRoleDialog, setShowDeleteRoleDialog] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
    const [newGroupName, setNewGroupName] = useState('');
    const [permissionSearch, setPermissionSearch] = useState('');

    const handleSelectRole = (role: Role) => {
        setSelectedRole(role);
        setSelectedPermissions(role.permissions.map((p) => p.id));
        setPermissionSearch('');
    };

    const handleSelectAll = () => {
        const allIds = permissions.map((p) => p.id);
        setSelectedPermissions(allIds);
    };

    const handleDeselectAll = () => {
        setSelectedPermissions([]);
    };

    const handleTogglePermission = (permissionId: number) => {
        setSelectedPermissions((prev) =>
            prev.includes(permissionId)
                ? prev.filter((id) => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    const handleToggleGroup = (groupPerms: Permission[]) => {
        const groupIds = groupPerms.map((p) => p.id);
        const allSelected = groupIds.every((id) => selectedPermissions.includes(id));

        if (allSelected) {
            setSelectedPermissions((prev) => prev.filter((id) => !groupIds.includes(id)));
        } else {
            setSelectedPermissions((prev) => [...new Set([...prev, ...groupIds])]);
        }
    };

    const handleSavePermissions = () => {
        if (!selectedRole) return;

        router.put(`/admin/roles/${selectedRole.id}/permissions`, {
            permissions: selectedPermissions,
        }, {
            onSuccess: () => toast.success('Permissions updated successfully'),
            onError: () => toast.error('Failed to update permissions'),
        });
    };

    const openCreateRole = () => {
        setEditingRole(null);
        setRoleForm({ name: '', description: '' });
        setShowRoleDialog(true);
    };

    const openEditRole = (role: Role) => {
        setEditingRole(role);
        setRoleForm({ name: role.name, description: role.description || '' });
        setShowRoleDialog(true);
    };

    const handleSaveRole = () => {
        if (editingRole) {
            router.put(`/admin/roles/${editingRole.id}`, roleForm, {
                onSuccess: () => {
                    toast.success('Role updated successfully');
                    setShowRoleDialog(false);
                },
                onError: (errors) => toast.error(Object.values(errors)[0] as string),
            });
        } else {
            router.post('/admin/roles', roleForm, {
                onSuccess: () => {
                    toast.success('Role created successfully');
                    setShowRoleDialog(false);
                },
                onError: (errors) => toast.error(Object.values(errors)[0] as string),
            });
        }
    };

    const handleDeleteRole = () => {
        if (!roleToDelete) return;

        router.delete(`/admin/roles/${roleToDelete.id}`, {
            onSuccess: () => {
                toast.success('Role deleted successfully');
                setShowDeleteRoleDialog(false);
                setRoleToDelete(null);
                if (selectedRole?.id === roleToDelete.id) {
                    setSelectedRole(roles[0] || null);
                }
            },
            onError: (errors) => toast.error(Object.values(errors)[0] as string),
        });
    };

    const handleSavePermission = () => {
        const formData = {
            ...permissionForm,
            group: permissionForm.group === '__new__' ? newGroupName : permissionForm.group,
        };
        router.post('/admin/permissions', formData, {
            onSuccess: () => {
                toast.success('Permission created successfully');
                setShowPermissionDialog(false);
                setPermissionForm({ name: '', group: '', description: '' });
                setNewGroupName('');
            },
            onError: (errors) => toast.error(Object.values(errors)[0] as string),
        });
    };

    const handleDeletePermission = (permission: Permission) => {
        if (!confirm(`Delete permission "${permission.name}"?`)) return;

        router.delete(`/admin/permissions/${permission.id}`, {
            onSuccess: () => toast.success('Permission deleted successfully'),
            onError: () => toast.error('Failed to delete permission'),
        });
    };

    return (
        <AdminLayout>
            <Head title="Roles & Permissions" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage roles and assign permissions to control access.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Roles</p>
                                    <p className="text-2xl font-bold">{roles.length}</p>
                                </div>
                                <Shield className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Permissions</p>
                                    <p className="text-2xl font-bold">{permissions.length}</p>
                                </div>
                                <Key className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Permission Groups</p>
                                    <p className="text-2xl font-bold">{groupedPermissions.length}</p>
                                </div>
                                <Users className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="roles">
                    <TabsList>
                        <TabsTrigger value="roles">Roles & Assignments</TabsTrigger>
                        <TabsTrigger value="permissions">All Permissions</TabsTrigger>
                    </TabsList>

                    {/* Roles Tab */}
                    <TabsContent value="roles" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Roles List */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                    <CardTitle className="text-lg">Roles</CardTitle>
                                    <Button size="sm" onClick={openCreateRole}>
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {roles.map((role) => (
                                        <div
                                            key={role.id}
                                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                                                selectedRole?.id === role.id
                                                    ? 'bg-primary/5 border-primary'
                                                    : 'hover:bg-muted/50'
                                            }`}
                                            onClick={() => handleSelectRole(role)}
                                        >
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-sm">{role.name}</span>
                                                    {role.is_default && (
                                                        <Badge variant="secondary" className="text-xs">Default</Badge>
                                                    )}
                                                    {role.slug === 'admin' && (
                                                        <Badge variant="destructive" className="text-xs">Full Access</Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {role.permissions.length} permissions
                                                </p>
                                            </div>
                                            <div className="flex gap-1 shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openEditRole(role);
                                                    }}
                                                >
                                                    <Edit className="h-3.5 w-3.5" />
                                                </Button>
                                                {!role.is_default && role.slug !== 'admin' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-destructive"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setRoleToDelete(role);
                                                            setShowDeleteRoleDialog(true);
                                                        }}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {roles.length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            No roles created yet.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Permissions Assignment */}
                            <Card className="lg:col-span-2">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                    <div>
                                        <CardTitle className="text-lg">
                                            {selectedRole
                                                ? `Permissions for "${selectedRole.name}"`
                                                : 'Select a role'}
                                        </CardTitle>
                                        <CardDescription>
                                            {selectedRole?.slug === 'admin'
                                                ? 'Admin role has full access to everything.'
                                                : 'Toggle permissions for this role.'}
                                        </CardDescription>
                                    </div>
                                    {selectedRole && selectedRole.slug !== 'admin' && (
                                        <Button onClick={handleSavePermissions}>
                                            <Save className="h-4 w-4 mr-1" />
                                            Save
                                        </Button>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    {selectedRole?.slug === 'admin' ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Shield className="h-12 w-12 mx-auto mb-2 text-red-500" />
                                            <p>Admin role automatically has all permissions.</p>
                                        </div>
                                    ) : selectedRole ? (
                                        <div className="space-y-4">
                                            {/* Search and Select/Deselect All */}
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <div className="relative flex-1">
                                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="Search permissions..."
                                                        value={permissionSearch}
                                                        onChange={(e) => setPermissionSearch(e.target.value)}
                                                        className="pl-8"
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" onClick={handleSelectAll}>
                                                        <CheckSquare className="h-4 w-4 mr-1" />
                                                        Select All
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                                                        <Square className="h-4 w-4 mr-1" />
                                                        Deselect All
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                            {groupedPermissions.map(({ group, permissions: groupPerms }) => {
                                                const filteredPerms = permissionSearch
                                                    ? groupPerms.filter(
                                                          (p) =>
                                                              p.name.toLowerCase().includes(permissionSearch.toLowerCase()) ||
                                                              p.slug.toLowerCase().includes(permissionSearch.toLowerCase()) ||
                                                              p.group.toLowerCase().includes(permissionSearch.toLowerCase())
                                                      )
                                                    : groupPerms;

                                                if (filteredPerms.length === 0) return null;
                                                const groupIds = groupPerms.map((p) => p.id);
                                                const allChecked = groupIds.every((id) =>
                                                    selectedPermissions.includes(id)
                                                );
                                                const someChecked =
                                                    !allChecked &&
                                                    groupIds.some((id) =>
                                                        selectedPermissions.includes(id)
                                                    );

                                                return (
                                                    <div key={group}>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <Checkbox
                                                                checked={allChecked}
                                                                ref={(el) => {
                                                                    if (el) {
                                                                        (el as any).indeterminate = someChecked;
                                                                    }
                                                                }}
                                                                onCheckedChange={() =>
                                                                    handleToggleGroup(groupPerms)
                                                                }
                                                            />
                                                            <span className="font-semibold text-sm capitalize">
                                                                {group}
                                                            </span>
                                                            <Badge variant="outline" className="text-xs">
                                                                {groupIds.filter((id) =>
                                                                    selectedPermissions.includes(id)
                                                                ).length}
                                                                /{groupIds.length}
                                                            </Badge>
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-6">
                                                            {filteredPerms.map((perm) => (
                                                                <label
                                                                    key={perm.id}
                                                                    className="flex items-start gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer"
                                                                >
                                                                    <Checkbox
                                                                        checked={selectedPermissions.includes(
                                                                            perm.id
                                                                        )}
                                                                        onCheckedChange={() =>
                                                                            handleTogglePermission(
                                                                                perm.id
                                                                            )
                                                                        }
                                                                        className="mt-0.5"
                                                                    />
                                                                    <div>
                                                                        <span className="text-sm">
                                                                            {perm.name}
                                                                        </span>
                                                                        {perm.description && (
                                                                            <p className="text-xs text-muted-foreground">
                                                                                {perm.description}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {groupedPermissions.length === 0 && (
                                                <p className="text-center text-muted-foreground py-8">
                                                    No permissions created yet. Add permissions from the
                                                    "All Permissions" tab.
                                                </p>
                                            )}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-center text-muted-foreground py-8">
                                            Select a role from the left to manage its permissions.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Permissions Tab */}
                    <TabsContent value="permissions" className="space-y-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <CardTitle className="text-lg">All Permissions</CardTitle>
                                <Button size="sm" onClick={() => {
                                    setPermissionForm({ name: '', group: '', description: '' });
                                    setShowPermissionDialog(true);
                                }}>
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Permission
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Slug</TableHead>
                                                <TableHead>Group</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead>Used By</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {permissions.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                        No permissions yet
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                permissions.map((perm) => {
                                                    const usedByRoles = roles.filter((r) =>
                                                        r.permissions.some((p) => p.id === perm.id)
                                                    );
                                                    return (
                                                        <TableRow key={perm.id}>
                                                            <TableCell className="font-medium">
                                                                {perm.name}
                                                            </TableCell>
                                                            <TableCell>
                                                                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                                                    {perm.slug}
                                                                </code>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline">{perm.group}</Badge>
                                                            </TableCell>
                                                            <TableCell className="text-muted-foreground text-sm">
                                                                {perm.description || '—'}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex gap-1 flex-wrap">
                                                                    {usedByRoles.map((r) => (
                                                                        <Badge key={r.id} variant="secondary" className="text-xs">
                                                                            {r.name}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 text-destructive"
                                                                    onClick={() => handleDeletePermission(perm)}
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Create/Edit Role Dialog */}
            <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingRole ? 'Edit Role' : 'Create Role'}</DialogTitle>
                        <DialogDescription>
                            {editingRole ? 'Update role details.' : 'Add a new role to the system.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="role-name">Name</Label>
                            <Input
                                id="role-name"
                                value={roleForm.name}
                                onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                                placeholder="e.g. Editor"
                            />
                        </div>
                        <div>
                            <Label htmlFor="role-description">Description</Label>
                            <Input
                                id="role-description"
                                value={roleForm.description}
                                onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                                placeholder="Brief description of this role"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRoleDialog(false)}>Cancel</Button>
                        <Button onClick={handleSaveRole}>{editingRole ? 'Update' : 'Create'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Permission Dialog */}
            <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Permission</DialogTitle>
                        <DialogDescription>Add a new permission to the system.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="perm-name">Name</Label>
                            <Input
                                id="perm-name"
                                value={permissionForm.name}
                                onChange={(e) => setPermissionForm({ ...permissionForm, name: e.target.value })}
                                placeholder="e.g. Manage Users"
                            />
                        </div>
                        <div>
                            <Label htmlFor="perm-group">Group</Label>
                            <Select
                                value={permissionForm.group}
                                onValueChange={(value) => setPermissionForm({ ...permissionForm, group: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a group" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[...new Set(permissions.map((p) => p.group))].sort().map((group) => (
                                        <SelectItem key={group} value={group}>
                                            {group.charAt(0).toUpperCase() + group.slice(1).replace(/-/g, ' ')}
                                        </SelectItem>
                                    ))}
                                    <SelectItem value="__new__">+ New group...</SelectItem>
                                </SelectContent>
                            </Select>
                            {permissionForm.group === '__new__' && (
                                <Input
                                    className="mt-2"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    placeholder="Enter new group name (e.g. inventory)"
                                />
                            )}
                        </div>
                        <div>
                            <Label htmlFor="perm-description">Description (optional)</Label>
                            <Input
                                id="perm-description"
                                value={permissionForm.description}
                                onChange={(e) => setPermissionForm({ ...permissionForm, description: e.target.value })}
                                placeholder="Brief description"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPermissionDialog(false)}>Cancel</Button>
                        <Button onClick={handleSavePermission}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Role Confirmation */}
            <Dialog open={showDeleteRoleDialog} onOpenChange={setShowDeleteRoleDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Role</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{roleToDelete?.name}"? Users with this role will be moved to the default role.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteRoleDialog(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteRole}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
