<?php

use App\Models\User;
use App\Models\Module;
use App\Models\UserModule;

// Create admin user if not exists
$admin = User::firstOrCreate([
    'email' => 'admin@test.com'
], [
    'name' => 'Test Admin',
    'password' => bcrypt('password'),
    'role' => 'admin'
]);

// Create regular user if not exists
$user = User::firstOrCreate([
    'email' => 'user@test.com'
], [
    'name' => 'Test User',
    'password' => bcrypt('password'),
    'role' => 'user'
]);

// Get modules
$batchModule = Module::where('slug', 'batch-incubator')->first();
$feedModule = Module::where('slug', 'feed-management')->first();

// Enable modules for admin
if ($batchModule) {
    UserModule::updateOrCreate([
        'user_id' => $admin->id,
        'module_id' => $batchModule->id
    ], [
        'is_enabled' => true,
        'activated_at' => now()
    ]);
}

if ($feedModule) {
    UserModule::updateOrCreate([
        'user_id' => $admin->id,
        'module_id' => $feedModule->id
    ], [
        'is_enabled' => true,
        'activated_at' => now()
    ]);
}

// Enable modules for regular user
if ($batchModule) {
    UserModule::updateOrCreate([
        'user_id' => $user->id,
        'module_id' => $batchModule->id
    ], [
        'is_enabled' => true,
        'activated_at' => now()
    ]);
}

if ($feedModule) {
    UserModule::updateOrCreate([
        'user_id' => $user->id,
        'module_id' => $feedModule->id
    ], [
        'is_enabled' => true,
        'activated_at' => now()
    ]);
}

echo "Users and modules configured successfully!\n";
echo "Admin: admin@test.com (password: password)\n";
echo "User: user@test.com (password: password)\n";
echo "Both users have BatchIncubator and Feed Management modules enabled.\n";
