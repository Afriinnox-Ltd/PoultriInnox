import AdminLayout from '@/layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import UserDataTable from './UserDataTable';

interface User {
    id: number;
    name: string;
    email: string;
    role?: string;
    email_verified_at?: string;
    created_at: string;
    updated_at?: string;
}

interface Role {
    id: number;
    name: string;
    slug: string;
    description: string | null;
}

function Index({ users, roles }: { users: User[]; roles: Role[] }) {
    return (
        <AdminLayout>
            <Head title="Users Management" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage users and their permissions within the application.
                        </p>
                    </div>
                    <Link href="/admin/users/create">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add New User
                        </Button>
                    </Link>
                </div>

                {/* Data Table */}
                <UserDataTable users={users} roles={roles} />
            </div>
        </AdminLayout>
    );
}

export default Index;
