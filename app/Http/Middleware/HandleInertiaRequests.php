<?php

namespace App\Http\Middleware;

use App\Modules\Marketplace\Models\CartItem;
use App\Modules\Marketplace\Models\Category;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $cartCount = 0;
        if ($request->user()) {
            $cartCount = CartItem::where('user_id', $request->user()->id)->sum('quantity');
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user() ? $request->user()->load('vendor') : null,
                'permissions' => $request->user() ? $request->user()->getPermissions() : [],
            ],
            'cartCount' => $cartCount,
            'categories' => Category::whereNull('parent_id')->withCount('products')->orderBy('products_count', 'desc')->with('children')->get(),
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state')== 'true',
            'locale' => session('locale', config('app.locale', 'en')),
        ];
    }
}
