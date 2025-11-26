<?php

namespace App\Modules\Marketplace\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Marketplace\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of categories.
     */
    public function index()
    {
        $categories = Category::with(['parent', 'children', 'products'])
            ->orderBy('parent_id')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->where('is_active', true)
            ->get();

        return Inertia::render('Marketplace/Categories/Index', [
            'categories' => $categories
        ]);
    }

    /**
     * Show the form for creating a new category.
     */
    public function create()
    {
        $this->authorize('create', Category::class);

        return Inertia::render('Marketplace/Categories/Create', [
            'parentCategories' => Category::whereNull('parent_id')->where('is_active', true)->orderBy('name')->get()
        ]);
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', Category::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:marketplace_categories,id',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:20',
            'image_url' => 'nullable|url|max:255',
            'is_featured' => 'boolean',
            'sort_order' => 'nullable|integer|min:0'
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        // Ensure slug is unique
        $originalSlug = $validated['slug'];
        $counter = 1;
        while (Category::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug . '-' . $counter;
            $counter++;
        }

        Category::create($validated);

        return redirect()->route('marketplace.categories.index')
            ->with('success', 'Category created successfully!');
    }

    /**
     * Display the specified category with its products.
     */
    public function show(Category $category, Request $request)
    {
        $category->load(['parent', 'children']);

        $query = $category->products()->with(['vendor.user', 'images'])
            ->where('status', 'active');

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('price_min')) {
            $query->where('price', '>=', $request->price_min);
        }

        if ($request->filled('price_max')) {
            $query->where('price', '<=', $request->price_max);
        }

        if ($request->filled('in_stock')) {
            $query->where('stock_quantity', '>', 0);
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        $allowedSorts = ['name', 'price', 'created_at', 'stock_quantity', 'rating'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection);
        }

        $products = $query->paginate(12)->withQueryString();

        // Get subcategories if this is a parent category
        $subcategories = Category::where('parent_id', $category->id)
            ->withCount('products')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('Marketplace/Categories/Show', [
            'category' => $category,
            'products' => $products,
            'subcategories' => $subcategories,
            'filters' => $request->only(['search', 'price_min', 'price_max', 'in_stock']),
            'sort' => ['sort_by' => $sortBy, 'sort_direction' => $sortDirection]
        ]);
    }

    /**
     * Show the form for editing the specified category.
     */
    public function edit(Category $category)
    {
        $this->authorize('update', $category);

        return Inertia::render('Marketplace/Categories/Edit', [
            'category' => $category,
            'parentCategories' => Category::whereNull('parent_id')
                ->where('is_active', true)
                ->where('id', '!=', $category->id)
                ->orderBy('name')
                ->get()
        ]);
    }

    /**
     * Update the specified category in storage.
     */
    public function update(Request $request, Category $category)
    {
        $this->authorize('update', $category);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:marketplace_categories,id',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:20',
            'image_url' => 'nullable|url|max:255',
            'is_featured' => 'boolean',
            'sort_order' => 'nullable|integer|min:0'
        ]);

        // Prevent setting itself as parent
        if ($validated['parent_id'] == $category->id) {
            return redirect()->back()->withErrors(['parent_id' => 'A category cannot be its own parent.']);
        }

        // Update slug if name changed
        if ($validated['name'] != $category->name) {
            $validated['slug'] = Str::slug($validated['name']);

            // Ensure slug is unique
            $originalSlug = $validated['slug'];
            $counter = 1;
            while (Category::where('slug', $validated['slug'])->where('id', '!=', $category->id)->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        $category->update($validated);

        return redirect()->route('marketplace.categories.index')
            ->with('success', 'Category updated successfully!');
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy(Category $category)
    {
        $this->authorize('delete', $category);

        // Check if category has products
        if ($category->products()->count() > 0) {
            return redirect()->back()->withErrors(['category' => 'Cannot delete category that contains products.']);
        }

        // Check if category has subcategories
        if ($category->children()->count() > 0) {
            return redirect()->back()->withErrors(['category' => 'Cannot delete category that has subcategories.']);
        }

        $category->delete();

        return redirect()->route('marketplace.categories.index')
            ->with('success', 'Category deleted successfully!');
    }

    /**
     * Get categories for API/AJAX requests.
     */
    public function api()
    {
        $categories = Category::with('children')
            ->whereNull('parent_id')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->where('is_active', true)
            ->get();

        return response()->json($categories);
    }

    /**
     * Public all-categories listing page.
     */
    public function publicIndex()
    {
        $categories = Category::withCount('products')
            ->with('children')
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(function ($cat) {
                $cat->children->each(function ($child) {
                    $child->loadCount('products');
                });
                return $cat;
            });

        return \Inertia\Inertia::render('Public/Marketplace/Categories', [
            'categories' => $categories,
        ]);
    }

    /**
     * Public category show page (store front).
     */
    public function publicShow(\App\Modules\Marketplace\Models\Category $category, \Illuminate\Http\Request $request)
    {
        return redirect('/store/search?category=' . $category->id);
    }

    /**
     * Update category sort order.
     */
    public function updateSortOrder(Request $request)
    {
        $this->authorize('update', Category::class);

        $validated = $request->validate([
            'categories' => 'required|array',
            'categories.*.id' => 'required|exists:marketplace_categories,id',
            'categories.*.sort_order' => 'required|integer|min:0'
        ]);

        foreach ($validated['categories'] as $categoryData) {
            Category::where('id', $categoryData['id'])
                ->update(['sort_order' => $categoryData['sort_order']]);
        }

        return response()->json(['message' => 'Sort order updated successfully']);
    }
}
