<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Create Roles
        $roles = [
            ['name' => 'Admin', 'slug' => 'admin', 'description' => 'Full system access', 'is_default' => false],
            ['name' => 'Manager', 'slug' => 'manager', 'description' => 'Manages operations and users', 'is_default' => false],
            ['name' => 'Supervisor', 'slug' => 'supervisor', 'description' => 'Oversees daily operations', 'is_default' => false],
            ['name' => 'User', 'slug' => 'user', 'description' => 'Standard user access', 'is_default' => true],
        ];

        foreach ($roles as $roleData) {
            Role::firstOrCreate(['slug' => $roleData['slug']], $roleData);
        }

        // Create Permissions grouped by feature
        $permissions = [
            // Users
            ['name' => 'View Users', 'slug' => 'view-users', 'group' => 'users', 'description' => 'View user list'],
            ['name' => 'Create Users', 'slug' => 'create-users', 'group' => 'users', 'description' => 'Create new users'],
            ['name' => 'Edit Users', 'slug' => 'edit-users', 'group' => 'users', 'description' => 'Edit user details'],
            ['name' => 'Delete Users', 'slug' => 'delete-users', 'group' => 'users', 'description' => 'Delete users'],
            ['name' => 'Assign Roles', 'slug' => 'assign-roles', 'group' => 'users', 'description' => 'Assign roles to users'],

            // Modules
            ['name' => 'View Modules', 'slug' => 'view-modules', 'group' => 'modules', 'description' => 'View system modules'],
            ['name' => 'Manage Modules', 'slug' => 'manage-modules', 'group' => 'modules', 'description' => 'Enable/disable modules'],
            ['name' => 'Manage User Modules', 'slug' => 'manage-user-modules', 'group' => 'modules', 'description' => 'Assign modules to users'],

            // Feed Management
            ['name' => 'View Feed Templates', 'slug' => 'view-feed-templates', 'group' => 'feed-management', 'description' => 'View feed templates'],
            ['name' => 'Manage Feed Templates', 'slug' => 'manage-feed-templates', 'group' => 'feed-management', 'description' => 'Upload and manage feed templates'],

            // Smart Scheduling
            ['name' => 'View Protocols', 'slug' => 'view-protocols', 'group' => 'smart-scheduling', 'description' => 'View medication/vaccination protocols'],
            ['name' => 'Manage Protocols', 'slug' => 'manage-protocols', 'group' => 'smart-scheduling', 'description' => 'Create and manage protocols'],

            // Marketplace - Dashboard & Analytics
            ['name' => 'View Marketplace Dashboard', 'slug' => 'view-marketplace-dashboard', 'group' => 'marketplace', 'description' => 'Access marketplace admin dashboard'],
            ['name' => 'View Marketplace Analytics', 'slug' => 'view-marketplace-analytics', 'group' => 'marketplace', 'description' => 'View marketplace analytics and stats'],

            // Marketplace - Vendors
            ['name' => 'View Vendors', 'slug' => 'view-vendors', 'group' => 'vendors', 'description' => 'View vendor list and details'],
            ['name' => 'Create Vendors', 'slug' => 'create-vendors', 'group' => 'vendors', 'description' => 'Create new vendor accounts'],
            ['name' => 'Approve Vendors', 'slug' => 'approve-vendors', 'group' => 'vendors', 'description' => 'Approve or reject vendor applications'],
            ['name' => 'Suspend Vendors', 'slug' => 'suspend-vendors', 'group' => 'vendors', 'description' => 'Suspend or reactivate vendors'],
            ['name' => 'Edit Vendor Details', 'slug' => 'edit-vendor-details', 'group' => 'vendors', 'description' => 'Update commission, notes, and verification'],
            ['name' => 'Message Vendors', 'slug' => 'message-vendors', 'group' => 'vendors', 'description' => 'Send messages and request changes from vendors'],

            // Marketplace - Products
            ['name' => 'View Products', 'slug' => 'view-products', 'group' => 'products', 'description' => 'View product list and details'],
            ['name' => 'Create Products', 'slug' => 'create-products', 'group' => 'products', 'description' => 'Create new products'],
            ['name' => 'Approve Products', 'slug' => 'approve-products', 'group' => 'products', 'description' => 'Approve or reject products'],
            ['name' => 'Edit Products', 'slug' => 'edit-products', 'group' => 'products', 'description' => 'Toggle status, featured, priority, and notes'],
            ['name' => 'Delete Products', 'slug' => 'delete-products', 'group' => 'products', 'description' => 'Delete products from marketplace'],

            // Marketplace - Orders
            ['name' => 'View Orders', 'slug' => 'view-orders', 'group' => 'orders', 'description' => 'View order list and details'],
            ['name' => 'Update Order Status', 'slug' => 'update-order-status', 'group' => 'orders', 'description' => 'Confirm, update status, and add notes'],
            ['name' => 'Cancel Orders', 'slug' => 'cancel-orders', 'group' => 'orders', 'description' => 'Cancel orders'],
            ['name' => 'Refund Orders', 'slug' => 'refund-orders', 'group' => 'orders', 'description' => 'Process order refunds'],
            ['name' => 'Export Orders', 'slug' => 'export-orders', 'group' => 'orders', 'description' => 'Export order data'],

            // Marketplace - Categories
            ['name' => 'View Categories', 'slug' => 'view-categories', 'group' => 'categories', 'description' => 'View product categories'],
            ['name' => 'Create Categories', 'slug' => 'create-categories', 'group' => 'categories', 'description' => 'Create new categories'],
            ['name' => 'Edit Categories', 'slug' => 'edit-categories', 'group' => 'categories', 'description' => 'Edit and reorder categories'],
            ['name' => 'Delete Categories', 'slug' => 'delete-categories', 'group' => 'categories', 'description' => 'Delete categories'],

            // Marketplace - Payments & Finance
            ['name' => 'View Payments', 'slug' => 'view-payments', 'group' => 'finance', 'description' => 'View payment list'],
            ['name' => 'View Financial Analytics', 'slug' => 'view-financial-analytics', 'group' => 'finance', 'description' => 'View payment analytics and revenue reports'],
            ['name' => 'Manage Vendor Payouts', 'slug' => 'manage-vendor-payouts', 'group' => 'finance', 'description' => 'Mark vendors as paid and process batch payouts'],
            ['name' => 'Export Financial Data', 'slug' => 'export-financial-data', 'group' => 'finance', 'description' => 'Export payment and finance reports'],

            // Marketplace - Subscriptions
            ['name' => 'View Subscriptions', 'slug' => 'view-subscriptions', 'group' => 'subscriptions', 'description' => 'View subscription plans and dashboard'],
            ['name' => 'Create Subscription Plans', 'slug' => 'create-subscription-plans', 'group' => 'subscriptions', 'description' => 'Create new subscription plans'],
            ['name' => 'Edit Subscription Plans', 'slug' => 'edit-subscription-plans', 'group' => 'subscriptions', 'description' => 'Edit and toggle subscription plans'],
            ['name' => 'Delete Subscription Plans', 'slug' => 'delete-subscription-plans', 'group' => 'subscriptions', 'description' => 'Delete subscription plans'],
            ['name' => 'Assign User Subscriptions', 'slug' => 'assign-user-subscriptions', 'group' => 'subscriptions', 'description' => 'Assign or remove user subscriptions'],
            ['name' => 'View Subscription Analytics', 'slug' => 'view-subscription-analytics', 'group' => 'subscriptions', 'description' => 'View subscription analytics'],

            // Marketplace - Settings
            ['name' => 'View Marketplace Settings', 'slug' => 'view-marketplace-settings', 'group' => 'marketplace-settings', 'description' => 'View marketplace configuration'],
            ['name' => 'Edit Marketplace Settings', 'slug' => 'edit-marketplace-settings', 'group' => 'marketplace-settings', 'description' => 'Update marketplace configuration'],
            ['name' => 'Reset Marketplace Settings', 'slug' => 'reset-marketplace-settings', 'group' => 'marketplace-settings', 'description' => 'Reset settings to defaults'],

            // Reports
            ['name' => 'View Reports', 'slug' => 'view-reports', 'group' => 'reports', 'description' => 'View system reports'],
            ['name' => 'Export Data', 'slug' => 'export-data', 'group' => 'reports', 'description' => 'Export data and reports'],

            // Activity Logs
            ['name' => 'View Activity Logs', 'slug' => 'view-activity-logs', 'group' => 'activity-logs', 'description' => 'View user activity logs'],
            ['name' => 'Manage Activity Logs', 'slug' => 'manage-activity-logs', 'group' => 'activity-logs', 'description' => 'Cleanup old activity logs'],

            // Roles & Permissions
            ['name' => 'Manage Roles', 'slug' => 'manage-roles', 'group' => 'system', 'description' => 'Create and manage roles'],
            ['name' => 'Manage Permissions', 'slug' => 'manage-permissions', 'group' => 'system', 'description' => 'Create and manage permissions'],
        ];

        foreach ($permissions as $permData) {
            Permission::firstOrCreate(['slug' => $permData['slug']], $permData);
        }

        // Assign permissions to Manager role
        $managerRole = Role::where('slug', 'manager')->first();
        if ($managerRole) {
            $managerPermissions = Permission::whereIn('slug', [
                'view-users', 'edit-users', 'view-modules', 'manage-user-modules',
                'view-feed-templates', 'manage-feed-templates',
                'view-protocols', 'manage-protocols',
                'view-marketplace-dashboard', 'view-marketplace-analytics',
                'view-vendors', 'approve-vendors', 'edit-vendor-details', 'message-vendors',
                'view-products', 'approve-products', 'edit-products',
                'view-orders', 'update-order-status', 'export-orders',
                'view-categories', 'create-categories', 'edit-categories',
                'view-payments', 'view-financial-analytics', 'manage-vendor-payouts',
                'view-subscriptions', 'view-subscription-analytics',
                'view-marketplace-settings',
                'view-reports', 'export-data',
                'view-activity-logs',
            ])->pluck('id');
            $managerRole->syncPermissions($managerPermissions->toArray());
        }

        // Assign permissions to Supervisor role
        $supervisorRole = Role::where('slug', 'supervisor')->first();
        if ($supervisorRole) {
            $supervisorPermissions = Permission::whereIn('slug', [
                'view-users', 'view-modules',
                'view-feed-templates', 'view-protocols',
                'view-marketplace-dashboard',
                'view-vendors', 'view-products',
                'view-orders', 'update-order-status',
                'view-categories',
                'view-payments', 'view-financial-analytics',
                'view-subscriptions',
                'view-reports',
            ])->pluck('id');
            $supervisorRole->syncPermissions($supervisorPermissions->toArray());
        }
    }
}
