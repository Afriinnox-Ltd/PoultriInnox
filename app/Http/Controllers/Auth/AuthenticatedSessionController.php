<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\ActivityLog;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        // Store intended URL in session if provided
        if ($request->has('intended')) {
            session(['url.intended' => $request->get('intended')]);
        }

        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        // Get the intended URL from session
        $intendedUrl = session('url.intended');

        // If there's an intended URL, clear it from session and redirect
        if ($intendedUrl) {
            session()->forget('url.intended');
            return redirect($intendedUrl);
        }

        ActivityLog::log('login', 'User logged in');

        // Redirect partners to their own dashboard
        if (Auth::user()->role === 'partner') {
            return redirect('/partner/dashboard');
        }

        // Default redirect to dashboard
        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        ActivityLog::log('logout', 'User logged out');

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
