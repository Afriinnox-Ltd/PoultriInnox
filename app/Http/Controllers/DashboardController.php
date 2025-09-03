<?php

namespace App\Http\Controllers;

use App\Models\Module;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Show the dashboard with enabled modules
     */
    public function index()
    {
        $user = Auth::user();

        // Get user's enabled modules
        $enabledModules = $user->enabledModules()->get();

        // Clean dashboard - only show module cards, no detailed data
        $dashboardData = [
            'enabledModules' => $enabledModules->map(function ($module) {
                return [
                    'id' => $module->id,
                    'name' => $module->name,
                    'slug' => $module->slug,
                    'description' => $module->description,
                    'icon' => $module->icon,
                    'config' => $module->config,
                ];
            }),
        ];

        return Inertia::render('dashboard', $dashboardData);
    }
}
